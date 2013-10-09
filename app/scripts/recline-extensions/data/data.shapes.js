define(['jquery', 'recline-extensions-amd'], function ($, recline) {
    recline.Data = recline.Data || {};
    recline.Data.ShapeSchema = recline.Data.ShapeSchema || {};

    var my = recline.Data;

    my.ShapeSchema = Backbone.Model.extend({
        constructor: function ShapeSchema() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        // ### initialize
        initialize: function() {
            var self=this;


            if(this.attributes.data) {
                var data = this.attributes.data;
                self._generateLimits(data);
            } else if(this.attributes.dataset)
                { this.bindToDataset();}

        },

        bindToDataset: function() {
           var self=this;
            self.attributes.dataset.dataset.records.bind('reset',   function() { self._generateFromDataset(); });
            self.attributes.dataset.dataset.fields.bind('reset', function () {
                self.attributes.dataset.dataset.setShapeSchema(self.attributes.dataset.type);
            });

            if(self.attributes.dataset.dataset.records.models.length > 0) {
                self._generateFromDataset();
            }
        },


        setDataset: function(ds, field, type) {
            var self=this;
            self.attributes.dataset = {dataset: ds, field: field, type: type};
            if(!ds.attributes["shapeSchema"])
                ds.attributes["shapeSchema"] = [];

            ds.attributes["shapeSchema"].push({schema:self, field: field});

            ds.setShapeSchema(type);

            self.bindToDataset();
        },


        _generateFromDataset: function() {
            var self=this;
            var data =  this.getRecordsArray(self.attributes.dataset);
            self._generateLimits(data);

        },

        _generateLimits: function(data) {
            var self=this;
            //var res = this.limits["distinct"](data);


            self.schema = {};
            _.each(self.attributes.limits, function(s, index) {
                self.schema[s] = self.attributes.shapes[index];
            });



        },


        getShapeNameFor: function(fieldValue) {
            var self=this;
            if(this.schema == null)
                throw "data.shape.js: shape schema not yet initialized, datasource not fetched?"


            return  self._shapeName(fieldValue);
        },


        getShapeFor: function(fieldValue, fieldColor, isSVG, isNode) {
            var self=this;
            if(this.schema == null)
                throw "data.shape.js: shape schema not yet initialized, datasource not fetched?"

            if(!self.attributes.shapeType || self.attributes.shapeType == "svg") {
                var shape = recline.Template.Shapes[this._shapeName(fieldValue)];
                if(shape == null)
                    throw "data.shape.js: shape [" +  this._shapeName(fieldValue) + "] not defined in template.shapes";
                return  shape(fieldColor, isNode, isSVG);
            } else if( self.attributes.shapeType == "text") {
                return this._shapeName(this._shapeName(fieldValue));
            } else if( self.attributes.shapeType == "image") {
                return '<img src="' + this._shapeName(fieldValue) + '" class="shape_image">';
            } else {
                throw "data.shape.js: unsupported shapeType ["+ self.attributes.shapeType  +"]";
            }

        },

        _shapeName: function(fieldValue) {
            var self=this;

            // find the correct shape, limits must be ordered
            if(self.attributes.limitType && this.attributes.limitType == "fixedLimits") {
                var shape = self.attributes.shapes[0];


                for(var i=1;i<this.attributes.limits.length;i++) {
                    if(fieldValue >= this.attributes.limits[i-1]
                        && fieldValue < this.attributes.limits[i]) {
                        shape = self.attributes.shapes[i];
                        break;
                    }
                }

                return shape;
            } else
                return self.schema[fieldValue];
        },


        getRecordsArray: function(dataset) {
            var self=this;
            var ret = [];
            if (dataset.recordCount)
        	{
                if(dataset.dataset.isFieldPartitioned && dataset.dataset.isFieldPartitioned(dataset.field, dataset.type))   {
                    var fields = dataset.dataset.getPartitionedFields(dataset.field);
                _.each(dataset.dataset.getRecords(dataset.type), function(d) {
                    _.each(fields, function (field) {
                        ret.push(d.attributes[field.id]);
                    });
                });
                }
                else{
                    var  fields = [dataset.field];;
                    _.each(dataset.dataset.getRecords(dataset.type), function(d) {
                        _.each(fields, function (field) {
                            ret.push(d.attributes[field]);
                        });
                    });
                }
        	}
            return ret;
        },



        limits: {
            distinct: function(data) {
                var tmp = {};
                _.each(_.uniq(data), function(d, index) {
                    tmp[d]=recline.Data.Transform.getFieldHash(d);
                });
                return data;
            }

        }

    })

    my.ShapeSchema.addShapesToTerms = function (field, terms, shapeSchema) {
        _.each(terms, function (t) {

            // assignment of color schema to fields
            if (shapeSchema) {
                _.each(shapeSchema, function (d) {
                    if (d.field === field)
                        t.shape = d.schema.getShapeFor(t.term, t.color, false, false);
                })
            }
        });
    };

});
