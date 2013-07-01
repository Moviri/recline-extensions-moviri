define(['recline-extensions-amd', 'recline-extensions/model/model.extensions.colors'], function(recline) {

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
            var self = this;


            if (this.attributes.data) {
                var data = this.attributes.data;
                self._generateLimits(data);
            } else if (this.attributes.dataset) {
                this.bindToDataset();
            } else if (this.attributes.fields) {
                var data = this.attributes.fields;
                this.attributes.type = "scaleWithDistinctData";
                self._generateLimits(data);
            }


            if (this.attributes.twoDimensionalVariation) {
                if (this.attributes.twoDimensionalVariation.data) {
                    var data = this.attributes.twoDimensionalVariation.data;
                    self._generateVariationLimits(data);
                } else if (this.attributes.twoDimensionalVariation.dataset) {
                    this.bindToVariationDataset();
                }
            }
        },

        // generate limits from dataset values
        bindToDataset: function () {
            var self = this;
            self.attributes.dataset.dataset.records.bind('reset', function () {
                //  console.log("record reset Generate color for dataset " + self.attributes.dataset.id + " field " + self.attributes.dataset.field);
                self._generateFromDataset();
            });
            self.attributes.dataset.dataset.fields.bind('reset', function () {
                self.attributes.dataset.dataset.setColorSchema(self.attributes.dataset.type);
            });
            self.attributes.dataset.dataset.fields.bind('add', function () {
                self.attributes.dataset.dataset.setColorSchema(self.attributes.dataset.type);
            });
            if (self.attributes.dataset.dataset.records.models.length > 0) {
                self._generateFromDataset();
            }
        },

        bindToVariationDataset: function () {
            var self = this;
            self.attributes.twoDimensionalVariation.dataset.dataset.records.bind('reset', function () {
                self._generateFromVariationDataset();
            });


            if (self.attributes.twoDimensionalVariation.dataset.dataset.records.models.length > 0) {
                self._generateFromVariationDataset();
            }
        },


        setDataset: function (ds, field, type) {
            var self = this;

            if (!ds.attributes["colorSchema"])
                ds.attributes["colorSchema"] = [];

            // if I'm bounded to a fields name I don't need to refresh upon model update and I don't need to calculate limits on data
            if (self.attributes.fields) {
                _.each(self.attributes.fields, function (s) {
                    ds.attributes["colorSchema"].push({schema: self, field: s});
                });
            } else {
                self.attributes.dataset = {dataset: ds, field: field, type: type};


                ds.attributes["colorSchema"].push({schema: self, field: field});
                self.bindToDataset();
            }

            ds.setColorSchema(type);


        },

        setVariationDataset: function (ds, field) {
            var self = this;
            self.attributes["twoDimensionalVariation"] = {dataset: {dataset: ds, field: field} };

            self.bindToVariationDataset();
        },
        
        generateFromExternalDataset: function(ds) {
//        	console.log('color generateFromExternalDataset');
        	 var self = this;
             var data = this.getRecordsArray(ds);
             self._generateLimits(data);	
        },

        _generateFromDataset: function () {
//        	console.log('color generateFromDataset');
            var self = this;
            var data = this.getRecordsArray(self.attributes.dataset);
            self._generateLimits(data);

        },

        _generateFromVariationDataset: function () {
            var self = this;
            var data = this.getRecordsArray(self.attributes.twoDimensionalVariation.dataset);
            self._generateVariationLimits(data);
        },

        _generateLimits: function (data) {
            var self = this;
            switch (this.attributes.type) {
                case "scaleWithDataMinMax":
                    self.schema = new chroma.ColorScale({
                        colors: this.attributes.colors,
                        limits: this.limits["minMax"](data)
                    });
                    break;
                case "scaleWithDistinctData":
                	self.schema = new chroma.ColorScale({
                        colors: this.attributes.colors,
                        limits: [0, 1]
                    });
                    self.limitsMapping = this.limits["distinct"](data, self.oldLimitData);
                    self.oldLimitData =  data;
                    break;
                case "fixedLimits":
                    self.schema = new chroma.ColorScale({
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
            var self = this;
            self.variationLimits = this.limits["minMax"](data);
        },

        getColorFor: function (fieldValue) {
            var self = this;
            if (this.schema == null && !self.attributes.defaultColor)
                throw "data.colors.js: colorschema not yet initialized, datasource not fetched?"

            //var hashed = recline.Data.Transform.getFieldHash(fieldValue);

            if (self.limitsMapping) {
                if (self.limitsMapping[fieldValue] != null) {
                    return this.schema.getColor(self.limitsMapping[fieldValue]);
                } else {
                    return chroma.hex(self.attributes.defaultColor);
                }
            }
            else {
                if (self.schema) {
                    return this.schema.getColor(fieldValue);
                } else {
                    return chroma.hex(self.attributes.defaultColor);
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


            var self = this;

            var tempSchema = new chroma.ColorScale({
                colors: [self.getColorFor(startingvalue), endColor],
                limits: self.variationLimits,
                mode: 'hsl'
            });

            return tempSchema.getColor(variation);

        },

        getRecordsArray: function (dataset) {

            // if the field is not present in the dataset don't recalculate colors
            if(!dataset.dataset.fields.get(dataset.field))
                return;

            var ret = [];

            if (dataset.dataset.isFieldPartitioned && dataset.dataset.isFieldPartitioned(dataset.field)) {
                var fields = dataset.dataset.getPartitionedFields(dataset.field);
                _.each(dataset.dataset.getRecords(dataset.type), function (d) {
                    _.each(fields, function (field) {
                    	ret.push(d.getFieldValueUnrendered(field)); 
                    	//ret.push(d.attributes[field.id]);
                    });
                });
            }
            else {
                var fields = [dataset.field];

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
                })
            }
        });
    };

    return my.ColorSchema;
});
