define(['jquery', 'REM/recline-extensions/recline-amd'], function ($, recline) {
    recline.Model = recline.Model || {};
    recline.Model.UnionDataset = recline.Model.UnionDataset || {};

    var my = recline.Model;

    my.UnionDataset = Backbone.Model.extend({
        constructor:function UnionDataset() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },


        initialize:function () {
            var self = this;
            _.bindAll(this, 'generateFields');

            self.ds_fetched = [];

            self.unionModel = new my.Dataset({backend: "Memory", records:[], fields: [], renderer: self.attributes.renderer});

            self.fields = self.unionModel.fields;
            self.records = self.unionModel.records;
            self.facets = self.unionModel.facets;
            self.recordCount = self.unionModel.recordCount;
            self.queryState = self.unionModel.queryState;

            if (this.get('initialState')) {
                this.get('initialState').setState(this);
            }

            this.attributes.model.fields.bind('reset', this.generateFields);
            this.attributes.model.fields.bind('add', this.generateFields);

            _.each(this.attributes.union, function(p) {
                p.model.fields.bind('reset', self.generateFields);
                p.model.fields.bind('add', self.generateFields);
            });

            if(self.attributes.model.recordCount > 0)
                self.ds_fetched.push("model");

            this.attributes.model.bind('query:done', function () {
                self.ds_fetched.push("model");

                if (self.allDsFetched())
                    self.query();
            })

            _.each(this.attributes.union, function(p) {

                p.model.bind('query:done', function () {
                    self.ds_fetched.push(p.id);

                    if (self.allDsFetched())
                        self.query();
                });

                if(p.model.recordCount > 0)
                    self.ds_fetched.push(p.id);

                p.model.queryState.bind('change', function () {
                    if (self.allDsFetched())
                        self.query();
                });

            });

            if (self.allDsFetched()) {
                self.generateFields();
                self.query();

            }

        },

        allDsFetched: function() {
            var self=this;
            var ret= true;

            if(!_.contains(self.ds_fetched, "model"))
                return false;

             _.each(self.attributes.union, function(p) {
                 if(!_.contains(self.ds_fetched, p.id)) {
                     ret = false;
                 }
             });

             return ret;
        },

        generateFields:function () {
            var self=this;

            var tmpFields = [];
            var derivedFields = [];

            _.each(this.attributes.model.fields.models, function (f) {
                tmpFields.push(f.toJSON());

            });

            _.each(this.attributes.union, function(p) {
                _.each(p.model.fields.models, function (f) {
                    if(!_.find(tmpFields, function(r) { return r.id==f.id; } ))
                    tmpFields.push(f.toJSON());

                });
            });


            this.unionModel.resetFields(tmpFields);


        },



        query:function (queryObj) {
            var self=this;
            self.trigger('query:start');
            if (queryObj) {
                this.queryState.set(queryObj, {silent:true});
            }
            var results = self.union();

            self.unionModel.resetRecords(results);
            self.unionModel.fetch();
            self.recordCount = self.unionModel.recordCount;

            self.trigger('query:done');
        },

        union:function () {

            var model = this.attributes.model;
            var unionModel = this.attributes.union;


            var results = [];
            // derived fields are copyed by value
            //var derivedFieldsModel = _.filter(model.fields.models, function(f) { return f.deriver });

            _.each(model.records.toJSON(), function (r) {

                //_.each(derivedFieldsModel, function(f) {
                   // rec[f.id] = r.getFieldValue(f);
                //})

               results.push(r);
            });

            _.each(unionModel, function(p) {
                //var derivedFieldsUnion = _.filter(p.model.fields.models, function(f) { return f.deriver });

                _.each(p.model.records.toJSON(), function (r) {

                    //_.each(derivedFieldsUnion, function(f) {
                       // rec[f.id] = r.getFieldValue(f);
                    //})

                    results.push(r);
                });
            });

            return results;
        },

        addCustomFilterLogic: function(f) {
            return this.unionModel.addCustomFilterLogic(f);
        },

        getRecords:function (type) {
            return this.unionModel.getRecords(type);
        },

        getFields:function (type) {
            return this.unionModel.getFields(type);
        },

        toTemplateJSON:function () {
            return this.unionModel.toTemplateJSON();
        },


        getFacetByFieldId:function (fieldId) {
            return this.unionModel.getFacetByFieldId(fieldId);
        },

        isFieldPartitioned:function (field) {
            return false
        },
        toFullJSON:function (resultType) {
            return this.unionModel.toFullJSON(resultType);
        },
        setColorSchema:function () {
            if(this.attributes["colorSchema"])
                this.unionModel.attributes["colorSchema"] = this.attributes["colorSchema"];
            return this.unionModel.setColorSchema();
        }

    })


});

