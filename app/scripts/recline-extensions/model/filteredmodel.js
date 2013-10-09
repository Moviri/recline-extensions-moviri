define(['jquery', 'recline-extensions-amd'], function ($, recline) {
    recline.Model = recline.Model || {};
    recline.Model.FilteredDataset = recline.Model.FilteredDataset || {};

    var my = recline.Model;


// ## <a id="dataset">VirtualDataset</a>
    my.FilteredDataset = Backbone.Model.extend({
        constructor:function FilteredDataset() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },


        initialize:function () {
            var self = this;


            this.records = new my.RecordList();
            this.fields =  this.attributes.dataset.fields;
            this.attributes.deriver = this.attributes.dataset.deriver;

            //todo
            //this.facets = new my.FacetList();
            this.recordCount = null;

            this.queryState = new my.Query();

            if (this.get('initialState')) {
                this.get('initialState').setState(this);
            }

            this.attributes.dataset.fields.bind('reset', function () {
                self.fieldsReset();
            })

            this.attributes.dataset.bind('query:done', function () {
                self.query();
            })

            this.queryState.bind('change', function () {
                self.query();
            });

        },

        fieldsReset: function() {
            this.fields = this.attributes.dataset.fields;

        },

        query:function (queryObj) {
            var self=this;
            this.trigger('query:start');

            if (queryObj) {
                this.queryState.set(queryObj, {silent:true});
            }

            var queryObj = this.queryState.toJSON();

            _.each(self.attributes.customFilterLogic, function (f) {
                f(queryObj);
            });


            //console.log("Query on model query [" + JSON.stringify(queryObj) + "]");

            var dataset = self.attributes.dataset;
            var numRows = queryObj.size || dataset.recordCount;
            var start = queryObj.from || 0;

            //todo use records fitlering in order to inherit all record properties
            //todo perhaps need a new applyfiltersondata
            var results = recline.Data.Filters.applyFiltersOnData(queryObj.filters, dataset.toFullJSON(), dataset.fields.toJSON());

            _.each(queryObj.sort, function (sortObj) {
                var fieldName = sortObj.field;
                results = _.sortBy(results, function (doc) {
                    var _out = doc[fieldName];
                    return _out;
                });
                if (sortObj.order == 'desc') {
                    results.reverse();
                }
            });

            results = results.slice(start, start + numRows);
            self.recordCount = results.length;

            var docs = _.map(results, function (hit) {
                var _doc = new my.Record(hit);
                _doc.fields = dataset.fields;
                _doc.bind('change', function (doc) {
                    self._changes.updates.push(doc.toJSON());
                });
                _doc.bind('destroy', function (doc) {
                    self._changes.deletes.push(doc.toJSON());
                });
                return _doc;
            });

            self.records.reset(docs);

            self.trigger('query:done');
        },

        getRecords:function () {
            return this.records.models;
        },

        getFields:function (type) {
            return this.attributes.dataset.fields;
        },

        toTemplateJSON:function () {
            var data = this.records.toJSON();
            data.recordCount = this.recordCount;
            data.fields = this.fields.toJSON();
            return data;
        },

        getFieldsSummary:function () {
            return this.attributes.dataset.getFieldsSummary();
        },

        addCustomFilterLogic: function(f) {
            if(this.attributes.customFilterLogic)
                this.attributes.customFilterLogic.push(f);
            else
                this.attributes.customFilterLogic = [f];
        },
        setColorSchema:function () {
            var self = this;
            _.each(self.attributes.colorSchema, function (d) {
                var field = _.find(self.fields.models, function (f) {
                    return d.field === f.id
                });
                if (field != null)
                    field.attributes.colorSchema = d.schema;
            })

        },
        toFullJSON:function (resultType) {
            var self = this;
            return _.map(self.records.models, function (r) {
                var res = {};

                _.each(self.fields.models, function (f) {
                    res[f.id] = r.getFieldValueUnrendered(f);
                });

                return res;

            });
        }



    })

   return my.FilteredDataset;
});

