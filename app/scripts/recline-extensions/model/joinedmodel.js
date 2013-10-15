define(['jquery', 'recline-amd'], function ($, recline) {
    recline.Model = recline.Model || {};
    recline.Model.JoinedDataset = recline.Model.JoinedDataset || {};

    var my = recline.Model;

    my.JoinedDataset = Backbone.Model.extend({
        constructor:function JoinedDataset() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },


        initialize:function () {
            var self = this;
            _.bindAll(this, 'generatefields');

            self.ds_fetched = [];
            self.field_fetched = [];

            self.joinedModel = new my.Dataset({backend: "Memory", records:[], fields: [], renderer: self.attributes.renderer});

            self.fields = self.joinedModel.fields;
            self.records = self.joinedModel.records;
            self.facets = self.joinedModel.facets;
            self.recordCount = self.joinedModel.recordCount;
            self.queryState = self.joinedModel.queryState;

            if (this.get('initialState')) {
                this.get('initialState').setState(this);
            }

            this.attributes.model.fields.bind('reset', function() {
                self.field_fetched.push("model");

                if (self.allDsFetched(self.field_fetched))
                    self.generatefields();
            });
            //this.attributes.model.fields.bind('add', this.generatefields);

            _.each(this.attributes.join, function(p) {
                p.model.fields.bind('reset', function() {
                    if(!p.id)
                        throw "joinedmodel: a model without id has been used in join. Unable to apply joined model";

                    self.field_fetched.push(p.model.id);

                    if (self.allDsFetched(self.field_fetched))
                        self.generatefields();

                });
                //p.model.fields.bind('add', self.generatefields);
            });

            this.attributes.model.bind('query:done', function () {
                self.ds_fetched.push("model");


                if (self.allDsFetched(self.ds_fetched))
                    self.query();
            })

            _.each(this.attributes.join, function(p) {

                p.model.bind('query:done', function () {
                    if(!p.id)
                        throw "joinedmodel: a model without id has been used in join. Unable to apply joined model";

                    self.ds_fetched.push(p.id);

                    if (self.allDsFetched(self.ds_fetched))
                        self.query();
                });

                p.model.queryState.bind('change', function () {
                    if (self.allDsFetched(self.ds_fetched))
                        self.query();
                });

            });

        },

        allDsFetched: function(fetchedList) {
            var self=this;
            var ret= true;

            if(!_.contains(fetchedList, "model"))
                return false;

             _.each(self.attributes.join, function(p) {
                 if(!_.contains(fetchedList, p.id)) {
                     ret = false;
                 }
             });


             return ret;
        },

        generatefields:function () {
            var self=this;
            var tmpFields = [];
            _.each(this.attributes.model.fields.models, function (f) {
                var c = f.toJSON();
                c.id = c.id;
                tmpFields.push(c);
            });

            _.each(this.attributes.join, function(p) {
                _.each(p.model.fields.models, function (f) {
                    var c = f.toJSON();
                    c.id = p.id + "_" + c.id;
                    tmpFields.push(c);
                });
            });

            this.joinedModel.resetFields(tmpFields);

        },



        query:function (queryObj) {
            var self=this;
            self.trigger('query:start');
            if (queryObj) {
                this.queryState.set(queryObj, {silent:true});
            }
            var results = self.join();

            self.joinedModel.resetRecords(results);
            if(self.fields.models.length == 0)
                self.generatefields();

            self.joinedModel.fetch();
            self.recordCount = self.joinedModel.recordCount;


            self.trigger('query:done');
        },

        join:function () {

            var joinType = this.attributes.joinType;
            var model = this.attributes.model;
            var joinModel = this.attributes.join;


            var results = [];

            _.each(model.getRecords(), function (r) {
                var filters = [];
                // creation of a filter on dataset2 based on dataset1 field value of joinon field


                var recordMustBeAdded = true;

                // define the record with all data from model
                var record = {};
                _.each(r.fields.models, function(field) {
                   record[field.id] = r.getFieldValueUnrendered(field);
                });



                _.each(joinModel, function(p) {
                    // retrieve records from secondary model
                    _.each(p.joinon, function (f) {
                        var field = p.model.fields.get(f);
                        if(!field)
                            throw "joinedmodel.js: unable to find field [" + f + "] on secondary model";

                        filters.push({field:field.id, type:"term", term: r.getFieldValueUnrendered(field), fieldType:field.attributes.type });
                    })

                    var resultsFromDataset2 = recline.Data.Filters.applyFiltersOnData(filters, p.model.toFullJSON(), p.model.fields.toJSON());

                    if(resultsFromDataset2.length == 0)
                        recordMustBeAdded = false;

                    _.each(resultsFromDataset2, function (res) {
                        _.each(res, function (field_value, index) {
                            record[p.id + "_" + index] = field_value;
                        })
                    })

                });

               if(joinType=="left" || recordMustBeAdded)
                    results.push(record);

            })


            return results;
        },

        addCustomFilterLogic: function(f) {
            return this.joinedModel.addCustomFilterLogic(f);
        },

        getRecords:function (type) {
            return this.joinedModel.getRecords(type);
        },

        getFields:function (type) {
            return this.joinedModel.getFields(type);
        },

        toTemplateJSON:function () {
            return this.joinedModel.toTemplateJSON();
        },


        getFacetByFieldId:function (fieldId) {
            return this.joinedModel.getFacetByFieldId(fieldId);
        },

        isFieldPartitioned:function (field) {
            return false
        },
        toFullJSON:function (resultType) {
            return this.joinedModel.toFullJSON(resultType);
        },
        setColorSchema:function () {
            if(this.attributes["colorSchema"])
                this.joinedModel.attributes["colorSchema"] = this.attributes["colorSchema"];
            return this.joinedModel.setColorSchema();
        },
        // a color schema is linked to the dataset but colors are not recalculated upon data/field reset
        addStaticColorSchema: function(colorSchema, field) {
            var self = this;
            if (!self.attributes["colorSchema"])
                self.attributes["colorSchema"] = [];

            self.attributes["colorSchema"].push({schema:colorSchema, field:field});
            this.joinedModel.attributes["colorSchema"] = this.attributes["colorSchema"];

            self.setColorSchema();

            self.fields.bind('reset', function () {
                self.setColorSchema();
            });
            self.fields.bind('add', function () {
                self.setColorSchema();
            });

        }


    })

    return my.JoinedDataset;
});
