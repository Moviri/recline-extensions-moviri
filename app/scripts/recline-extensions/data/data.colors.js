/* global define */
define(['underscore', 'REM/recline-extensions/recline-amd', 'REM/vendor/chroma.js/chroma.min'], function(_, recline, chroma) {

    recline.Data = recline.Data || {};
    recline.Data.Format = recline.Format || {};
    recline.Data.ColorSchema = recline.ColorSchema || {};

    var my = recline.Data;

    my.ColorSchema = Backbone.Model.extend({
        constructor: function ColorSchema() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        // ### initialize
        initialize: function () {
            if (this.attributes.data) {
                var data = this.attributes.data;
                this._generateLimits(data);
            } else if (this.attributes.dataset) {
                this.bindToDataset();
            } else if (this.attributes.fields) {
                var data = this.attributes.fields;
                this.attributes.type = "scaleWithDistinctData";
                this._generateLimits(data);
            }


            if (this.attributes.twoDimensionalVariation) {
                if (this.attributes.twoDimensionalVariation.data) {
                    var data = this.attributes.twoDimensionalVariation.data;
                    this._generateVariationLimits(data);
                } else if (this.attributes.twoDimensionalVariation.dataset) {
                    this.bindToVariationDataset();
                }
            }
        },

        // generate limits from dataset values
        bindToDataset: function () {
            var self = this;
            this.attributes.dataset.dataset.records.bind('reset', function () {
                //  console.log("record reset Generate color for dataset " + self.attributes.dataset.id + " field " + self.attributes.dataset.field);
                self._generateFromDataset();
            });
            this.attributes.dataset.dataset.fields.bind('reset', function () {
                self.attributes.dataset.dataset.setColorSchema(self.attributes.dataset.type);
            });
            this.attributes.dataset.dataset.fields.bind('add', function () {
                self.attributes.dataset.dataset.setColorSchema(self.attributes.dataset.type);
            });
            if (this.attributes.dataset.dataset.records.models.length > 0) {
                this._generateFromDataset();
            }
        },

        bindToVariationDataset: function () {
            var self = this;
            this.attributes.twoDimensionalVariation.dataset.dataset.records.bind('reset', function () {
                self._generateFromVariationDataset();
            });


            if (this.attributes.twoDimensionalVariation.dataset.dataset.records.models.length > 0) {
                self._generateFromVariationDataset();
            }
        },


        setDataset: function (ds, field, type) {
            var self = this;

            if (!ds.attributes["colorSchema"])
                ds.attributes["colorSchema"] = [];

            // if I'm bounded to a fields name I don't need to refresh upon model update and I don't need to calculate limits on data
            if (this.attributes.fields) {
                _.each(this.attributes.fields, function (s) {
                    ds.attributes["colorSchema"].push({schema: self, field: s});
                });
            } else {
                this.attributes.dataset = {dataset: ds, field: field, type: type};

                ds.attributes["colorSchema"].push({schema: self, field: field});
                this.bindToDataset();
            }

            ds.setColorSchema(type);
        },

        setVariationDataset: function (ds, field) {
            this.attributes["twoDimensionalVariation"] = {dataset: {dataset: ds, field: field} };

            this.bindToVariationDataset();
        },
        
        generateFromExternalDataset: function(ds) {
//        	console.log('color generateFromExternalDataset');
             var data = this.getRecordsArray(ds);
             this._generateLimits(data);	
        },

        _generateFromDataset: function () {
//        	console.log('color generateFromDataset');
            var data = this.getRecordsArray(this.attributes.dataset);
            this._generateLimits(data);

        },

        _generateFromVariationDataset: function () {
            var data = this.getRecordsArray(this.attributes.twoDimensionalVariation.dataset);
            this._generateVariationLimits(data);
        },

        _generateLimits: function (data) {
            var uniqueData = _.uniq(data);
            switch (this.attributes.type) {
                case "scaleWithDataMinMax":
                    this.schema = new chroma.ColorScale({
                        colors: this.attributes.colors,
                        limits: this.limits["minMax"](uniqueData)
                    });
                    break;
                case "scaleWithDistinctData":
                	this.schema = new chroma.ColorScale({
                        colors: this.attributes.colors,
                        limits: [0, 1]
                    });
                    this.limitsMapping = this.limits["distinct"](uniqueData, this.oldLimitData);
                    this.oldLimitData =  uniqueData;
                    break;
                case "fixedLimits":
                    this.schema = new chroma.ColorScale({
                        colors: this.attributes.colors,
                        limits: this.attributes.limits
                    });
                    break;
                default:
                    throw "data.colors.js: unknown or not defined properties type [" + this.attributes.type + "] possible values are [scaleWithDataMinMax,scaleWithDistinctData,fixedLimits]";
            }
        },

        getScaleType: function () {
            return this.attributes.type;
        },

        getScaleLimits: function () {
            return this.schema.limits;
        },

        _generateVariationLimits: function (data) {
            this.variationLimits = this.limits["minMax"](data);
        },

        getColorFor: function (fieldValue) {
            if (this.schema == null && !this.attributes.defaultColor)
                throw "data.colors.js: colorschema not yet initialized, datasource not fetched?"

            //var hashed = recline.Data.Transform.getFieldHash(fieldValue);

            if (this.limitsMapping) {
                if (this.limitsMapping[fieldValue] != null) {
                    var computedColor = this.schema.getColor(this.limitsMapping[fieldValue]);
                    if (computedColor) {
                        if (computedColor.hsl) {
                            var computerColorHSL = computedColor.hsl();
                            if (computerColorHSL && computerColorHSL.length > 2 && computerColorHSL[2] > 0.8) {
                                // if too bright return a darker version of same color
                                return chroma.interpolate(computedColor, '#000', 0.5, 'hsv'); 
                            }
                        }
                        return computedColor;
                    }
                }
                return chroma.hex(this.attributes.defaultColor);
            }
            else {
                if (this.schema) {
                    return this.schema.getColor(fieldValue);
                } else {
                    return chroma.hex(this.attributes.defaultColor);
                }
            }

        },

        getTwoDimensionalColor: function (startingvalue, variation) {
            if (this.schema == null)
                throw "data.colors.js: colorschema not yet initialized, datasource not fetched?"

            if (this.attributes.twoDimensionalVariation == null)
                return this.getColorFor(startingvalue);

            var endColor = '#000000';
            if (this.attributes.twoDimensionalVariation.type == "toLight")
                endColor = '#ffffff';

            var tempSchema = new chroma.ColorScale({
                colors: [this.getColorFor(startingvalue), endColor],
                limits: this.variationLimits,
                mode: 'hsl'
            });

            return tempSchema.getColor(variation);
        },

        getRecordsArray: function (dataset) {

            // if the field is not present in the dataset don't recalculate colors
            if(!dataset.dataset.fields.get(dataset.field))
                return;

            var ret = [];
            var fields;

            if (dataset.dataset.isFieldPartitioned && dataset.dataset.isFieldPartitioned(dataset.field)) {
                fields = dataset.dataset.getPartitionedFields(dataset.field);
                _.each(dataset.dataset.getRecords(dataset.type), function (d) {
                    _.each(fields, function (field) {
                    	ret.push(d.getFieldValueUnrendered(field)); 
                    	//ret.push(d.attributes[field.id]);
                    });
                });
            }
            else {
                fields = [dataset.field];

                _.each(dataset.dataset.getRecords(dataset.type), function (d) {
                    _.each(fields, function (field) {
                    	var f = d.fields.get(field);
                    	ret.push(d.getFieldValueUnrendered(f));
                    	//ret.push(d.attributes[field]);
                    });
                });
            }

            return ret;
        },


        limits: {
            minMax: function (data) {
                var limit = [null, null];

                if(data && data.length == 1) {
                    limit = [0, data[0]];
                } else {
                _.each(data, function (d) {
                    if (limit[0] == null)    limit[0] = d;
                    else                    limit[0] = Math.min(limit[0], d);

                    if (limit[1] == null)    limit[1] = d;
                    else                    limit[1] = Math.max(limit[1], d);
                });
                }

                return limit;
            },
            distinct: function () {


                var arrayHash = function (data) {
                    var hash = 0,
                        i, j, _char;
                    if (data.length === 0) return hash;
                    for (i = 0; i < data.length; i++) {
                        for (j = 0; j < data[i].length; j++) {
                            _char = data[i].charCodeAt(j);
                            hash = ((hash << 5) - hash) + _char;
                            hash = hash & hash; // Convert to 32bit integer
                        }
                    }
                    return hash;
                };

                var closestSize = function () {
                    var sizeCache = {};

                    var nextSize = function (n) {
                        return n + n - 1;
                    };

                    return function (size) {
                        if (sizeCache[size]) {
                            return sizeCache[size];
                        } else {
                            var n = 2;
                            while (n < size) {
                                n = nextSize(n);
                            }
                            sizeCache[size] = n;
                            return n;
                        }
                    };
                }();

                var computePosition = function (i, length, max) {
                    return (i) / (max - 1);
                };

                var arrayCache = {};
                var emptyCache = {};
                var sizeCache = {};

                return function (data, data_old) {

                    var obj = {};
                    var poss = {};
                    var empty = [];
                    var i;

                    if (data) data.sort(function (a, b) {
                        if (a > b) return 1;
                        if (b > a) return -1;
                        return 0;
                    });
                    else data = [];

                    if (data_old) data_old.sort(function (a, b) {
                        if (a > b) return 1;
                        if (b > a) return -1;
                        return 0;
                    });
                    else data_old = [];

                    var uniq = _.uniq(data, true);
                    if (uniq[0] == null){
                        uniq = [];
                     }
                    var uniq_old = _.uniq(data_old, true);
                    if (uniq_old[0] == null){
                    	uniq_old = [];
                    }
//                    console.log('unique');
//                    console.log(uniq);
//                    console.log('unique_old');
//                    console.log(uniq_old);
                    var closeUO = sizeCache[arrayHash(uniq_old)] || closestSize(uniq_old.length);                    
                    var closeU = Math.max(closestSize(uniq.length), closeUO);
                    
                    var hop = 0;
                    if (closeU > closeUO) {
                    	if(closeUO*2<closeU){
                    		//reset colors
                    		uniq_old = [];
                    	}else{
                    		hop = 1;
                    	}
                    }

                    empty = (uniq_old.length) ? emptyCache[arrayHash(uniq_old)] : [];

                    if (hop == 1 && uniq_old.length !== 0) {
                        //nuove posizioni disponibili
                        //quali? per ora gestisco solo hop=1
                        for (i = 1; i < closeU; i = i + 2) empty.push(i);
                    }

                    if (uniq_old.length === 0) {
                        i = 0;
                        _.each(uniq, function (d) {
                            if (closeU === 1) obj[d] = 0;
                            else obj[d] = computePosition(i, uniq.length, closeU);
                            poss[d] = i;
                            i++;
                        });
                        for (i = uniq.length; i < closeU; i++) {
                            empty.push(i);
                        }
                    } else {
                        var j, pos;
                        var controlj = 0,
                            controli = 0;
                        var old_poss = arrayCache[arrayHash(uniq_old)];
                        i = 0;
                        j = 0;

                        while (!(controlj || controli)) {
                            if (uniq[i] === uniq_old[j]) {
                                i++;
                                j++;
                            } else if (uniq[i] < uniq_old[j]) {
                                i++;
                            } else {
                                //elemento rimosso
                                empty.push(old_poss[uniq_old[j]]);
                                j++;
                            }
                            controlj = j >= uniq_old.length;
                            controli = i >= uniq.length;
                        }
                        
                        while(!controlj){
                        	//elemento rimosso



                        	empty.push(old_poss[uniq_old[j]]);
                            j++;
                            controlj = j >= uniq_old.length;
                        }

                        i = 0;
                        j = 0;
                        controlj = 0;
                        controli = 0;
                        while (!(controlj || controli)) {
                            if (uniq[i] === uniq_old[j]) {
                                pos = old_poss[uniq_old[j]] * Math.pow(2, hop);
                                poss[uniq[i]] = pos;
                                obj[uniq[i]] = computePosition(pos, uniq.length, closeU);
                                i++;
                                j++;
                            } else if (uniq[i] < uniq_old[j]) {
                                //nuovo elemento
                                pos = empty.pop();
                                poss[uniq[i]] = pos;
                                obj[uniq[i]] = computePosition(pos, uniq.length, closeU);
                                i++;
                            } else {
                                j++;
                            }
                            controlj = j >= uniq_old.length;
                            controli = i >= uniq.length;
                        }
                        if (!controli) {
                            for (; i < uniq.length; i++) {
                                //nuovo elemento
                                pos = empty.pop();
                                poss[uniq[i]] = pos;
                                obj[uniq[i]] = computePosition(pos, uniq.length, closeU);
                            }
                        }
                    }

                    arrayCache[arrayHash(uniq)] = poss;
                    emptyCache[arrayHash(uniq)] = empty;
                    sizeCache[arrayHash(uniq)] = closeU;
                    return obj;
                };
            }()
        }

    });

    my.ColorSchema.addColorsToTerms = function (field, terms, colorSchema) {
        _.each(terms, function (t) {

            // assignment of color schema to fields
            if (colorSchema) {
                _.each(colorSchema, function (d) {
                    if (d.field === field)
                        t.color = d.schema.getColorFor(t.term);
                });
            }
        });
    };

    return my.ColorSchema;
});
