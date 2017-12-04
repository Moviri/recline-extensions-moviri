/* global define, Backbone */
define(['jquery', 'underscore', 'REM/recline-extensions/recline-amd'], function ($, _, recline) {
    recline.Model = recline.Model || {};
    recline.Model.NestedDataset = recline.Model.NestedDataset || {};

    var my = recline.Model;

    /* NestedDataset is a dataset that unrolls single record values of type array into multiple records of discrete type.
    For instance , given a source dataset with the following record:

        {"type":"USER","field":"BirthYear","values":["2005","1998","1977"]}

    and the following field:

        {"id":"BIRTHYEAR","label":"BIRTHYEAR","type":"STRING",is_derived_false,format:null}

    it returns a dataset with the following records:

        {"BIRTHYEAR":"2005"}
        {"BIRTHYEAR":"1998"}
        {"BIRTHYEAR":"1977"}

    and the following field:

        {"id":"BIRTHYEAR","label":"BirthYear","type":"STRING",is_derived_false,format:null}


    by using this configuration: {"sourceFieldForLabel": "field", "sourceFieldForValues": "values"}

    This model can be used to populate dynamic controls

    Option addValue_ALL_ adds value '_ALL_' to first record of every field

    */

    my.NestedDataset = Backbone.Model.extend({
        constructor:function NestedDataset() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        initialize:function () {
            var self = this;

            this.nestedModel = new my.Dataset({backend: "Memory", records:[], fields: [], renderer: this.attributes.renderer});

            this.fields = this.nestedModel.fields;
            this.records = this.nestedModel.records;
            this.facets = this.nestedModel.facets;
            this.recordCount = this.nestedModel.recordCount;
            this.queryState = this.nestedModel.queryState;

            if (this.get('initialState')) {
                this.get('initialState').setState(this);
            }

            if (this.attributes.sourceFieldForLabel && this.attributes.sourceFieldForValues) {
                this.queryDataset = new recline.Model.Dataset({
                    url: this.attributes.url,
                    backend: this.attributes.backend,
                    id: this.attributes.id,
                });        

                this.queryDataset.bind('query:done', function () {
                    self.processQueryResults();
                });

                this.queryState.bind('change', function () {
                    self.queryDataset.queryState.setFilters(self.queryState.filters, {silent: true});
                    self.query();
                });
            }
        },
        query: function(queryObj) {
            this.trigger('query:start');
            this.queryDataset.query(queryObj);
        },
        processQueryResults:function() {
            var self = this;

            var queryObj = this.queryState.toJSON();

            _.each(this.attributes.customFilterLogic, function (f, ds) {
                f(queryObj, self);
            });

            var results = [];
            var offset = 0;
            if (self.attributes.addValue_ALL_) {
                results.push({});
                offset = 1; // if using _ALL_ at first position, real data is shifted by 1
            }
            var sourceFieldForLabel = this.attributes.sourceFieldForLabel;
            var sourceFieldForValues = this.attributes.sourceFieldForValues;

            var newFields = _.map(this.queryDataset.fields.models, function(m) {
                return {
                    id: m.get("id"),
                    label: m.get("label"),
                    format: m.get("format"),
                    is_derived: m.get("is_derived"),
                    type: m.get("type")
                };
            });

            if (this.queryDataset.fields && this.queryDataset.fields.length > 0) {
                var newFieldName = this.queryDataset.fields.models[0].get("id");
                if (newFieldName) {
                    var records = this.queryDataset.records.models;
                    if (records.length > 0) {
                        var newFieldLabel = records[0].getFieldValueUnrendered({id:sourceFieldForLabel});
                        var newValues = records[0].getFieldValueUnrendered({id: sourceFieldForValues});
                        if (newFieldLabel) {
                            newFields[0].label = newFieldLabel;
                            if (self.attributes.addValue_ALL_) {
                                results[0][newFieldName] = "_ALL_";
                            }
                            if (newValues && newValues.length) {
                                _.each(newValues, function(currVal, idx) {
                                    if (idx + offset >= results.length) {
                                        results.push({});
                                    }
                                    var record = results[idx + offset];
                                    record[newFieldName] = currVal;
                                });
                            }
                        }
                    }
                }
            }

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

            this.recordCount = results.length;

            var docs = _.map(results, function (hit) {
                var _doc = new my.Record(hit);
                _doc.bind('change', function (doc) {
                    self._changes.updates.push(doc.toJSON());
                });
                _doc.bind('destroy', function (doc) {
                    self._changes.deletes.push(doc.toJSON());
                });
                return _doc;
            });

            this.fields.reset(newFields);
            this.records.reset(docs);

            this.trigger('query:done');
        },
        getRecords:function () {
            return this.records.models;
        },
        getFields:function() {
            return this.fields;
        },
        toTemplateJSON:function () {
            var data = this.records.toJSON();
            data.recordCount = this.recordCount;
            data.fields = this.fields.toJSON();
            return data;
        },
        addCustomFilterLogic: function(f) {
            if(this.attributes.customFilterLogic)
                this.attributes.customFilterLogic.push(f);
            else
                this.attributes.customFilterLogic = [f];
        },
        setColorSchema:function () {
            var self = this;
            _.each(this.attributes.colorSchema, function (d) {
                var field = _.find(self.fields.models, function (f) {
                    return d.field === f.id;
                });
                if (field != null)
                    field.attributes.colorSchema = d.schema;
            });

        },
        toFullJSON:function (resultType) {
            var self = this;
            return _.map(this.records.models, function (r) {
                var res = {};

                _.each(self.fields.models, function (f) {
                    res[f.id] = r.getFieldValueUnrendered(f);
                });

                return res;

            });
        }
    });

    return my.NestedDataset;
});

