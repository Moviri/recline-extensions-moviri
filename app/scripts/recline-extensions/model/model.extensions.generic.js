define(['underscore', 'recline-extensions-amd', 'recline-extensions/data/data.fieldsutilities'], function (_, recline) {

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {

        toFullJSON: function (resultType) {
            var self = this;
            return _.map(self.getRecords(resultType), function (r) {
                var res = {};

                _.each(self.getFields(resultType).models, function (f) {
                    res[f.id] = r.getFieldValueUnrendered(f);
                });

                return res;

            });
        },


        resetRecords: function (records) {
            this.set({records: records}, {silent: true});
        },
        resetFields: function (fields) {
            this.set({fields: fields}, {silent: true});
        },

        getRecords: function (type) {
            var self = this;


            if (type === 'filtered' || type == null) {
                return self.records.models;
            } else {
                if (self._store.data == null) {
                    throw "Model: unable to retrieve not filtered data, store can't provide data. Use a backend that use a memory store";
                }

                if (self.queryState.get('sort') && self.queryState.get('sort').length > 0) {
                    _.each(self.queryState.get('sort'), function (sortObj) {
                        var fieldName = sortObj.field;
                        self._store.data = _.sortBy(self._store.data, function (doc) {
                            var _out = doc[fieldName];
                            return _out;
                        });
                        if (sortObj.order == 'desc' && typeof sortObj.alreadySorted == "undefined") {
                            self._store.data.reverse();
                            sortObj.alreadySorted = true;
                        }
                    });
                }

                var docs = _.map(self._store.data, function (hit) {
                    var _doc = new recline.Model.Record(hit);
                    _doc.fields = self.fields;
                    return _doc;
                });

                if (self.queryState.getSelections().length > 0)
                    recline.Data.Filters.applySelectionsOnRecord(self.queryState.get('selections'), docs, self.fields);


                return docs;
            }
        },

        getFields: function (type) {
            var self = this;
            return self.fields;

        },

        _normalizeRecordsAndFields: function () {
            var super_init = recline.Model.Dataset.prototype._normalizeRecordsAndFields;
            return function (records, fields) {
                var self = this;
                var out = super_init.call(this, records, fields);
                if (self.backend.__type__ == "csv")
                    recline.Backend.CSV.setFieldsAttributesCSV(out.fields, self, out.records);

                recline.Data.FieldsUtility.setFieldsAttributes(out.fields, self);
                return out;
            };
        }(),

        _handleQueryResult: function (queryResult) {
            var super_init = recline.Model.Dataset.prototype._handleQueryResult;

            return function (queryResult) {
                //console.log("-----> " + this.id +  " HQR generic");

                var self = this;
                if (queryResult.fields && self.fields.length == 0) {

                    recline.Data.FieldsUtility.setFieldsAttributes(queryResult.fields, self);
                    var options;
                    if (self.attributes.renderer)
                        options = { renderer: self.attributes.renderer};


                    self.fields.reset(queryResult.fields, options);

                }
                return super_init.call(this, queryResult);
            };
        }()


    });
});

