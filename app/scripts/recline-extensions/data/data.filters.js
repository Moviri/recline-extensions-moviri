this.recline = this.recline || {};
this.recline.Data = this.recline.Data || {};

(function (my) {
// adapted from https://github.com/harthur/costco. heather rules

    my.Filters = {};

    // in place filtering (records.toJSON must be passed)
    my.Filters.applyFiltersOnData = function (filters, records, fields) {
        // filter records
        return _.filter(records, function (record) {
            var passes = _.map(filters, function (filter) {
                return recline.Data.Filters._isNullFilter[filter.type](filter) || recline.Data.Filters._filterFunctions[filter.type](record, filter, fields);
            });

            // return only these records that pass all filters
            return _.all(passes, _.identity);
        });
    };

    // in place filtering  (records model must be used)
    my.Filters.applyFiltersOnRecords = function (filters, records, fields) {
        // filter records
        return _.filter(records.models, function (record) {
            var passes = _.map(filters, function (filter) {
                return recline.Data.Filters._isNullFilter[filter.type](filter) || recline.Data.Filters._filterFunctions[filter.type](record.toJSON(), filter, fields.toJSON());
            });

            // return only these records that pass all filters
            return _.all(passes, _.identity);
        });
    };

    // data should be {records:[model], fields:[model]}
    my.Filters.applySelectionsOnRecord = function (selections, records, fields) {
        _.each(records, function (currentRecord) {
            currentRecord.setRecordSelection(false);

            _.each(selections, function (sel) {
                if (!recline.Data.Filters._isNullFilter[sel.type](sel) &&
                    recline.Data.Filters._filterFunctions[sel.type](currentRecord.attributes, sel, fields)) {
                    currentRecord.setRecordSelection(true);
                }
            });
        });


    },


        my.Filters._getDataParser = function (filter, fields) {

            var keyedFields = {};
            var tmpFields;
            if (fields.models)
                tmpFields = fields.models;
            else
                tmpFields = fields;

            _.each(tmpFields, function (field) {
                keyedFields[field.id] = field;
            });


            var field = keyedFields[filter.field];
            var fieldType = 'string';

            if (field == null) {
                throw "data.filters.js: Warning could not find field " + filter.field + " for dataset ";
            }
            else {
                if (field.attributes)
                    fieldType = field.attributes.type;
                else if (field.type)
                    fieldType = field.type;
            }
            return recline.Data.Filters._dataParsers[fieldType];
        },

        my.Filters._isNullFilter = {
            term: function (filter) {
                return filter["term"] == null;
            },

            range: function (filter) {
                return (filter["start"] == null || filter["stop"] == null);

            },

            list: function (filter) {
                return filter["list"] == null;

            },
            termAdvanced: function (filter) {
                return filter["term"] == null;
            }
        },

        // in place filtering
        this._applyFilters = function (results, queryObj) {
            var filters = queryObj.filters;
            // register filters
            var filterFunctions = {
                term: term,
                range: range,
                geo_distance: geo_distance
            };
            var dataParsers = {
                integer: function (e) {
                    return parseFloat(e, 10);
                },
                'float': function (e) {
                    return parseFloat(e, 10);
                },
                string: function (e) {
                    return e.toString()
                },
                date: function (e) {
                    return new Date(e).valueOf()
                },
                datetime: function (e) {
                    return new Date(e).valueOf()
                }
            };
            var keyedFields = {};
            _.each(self.fields, function (field) {
                keyedFields[field.id] = field;
            });
            function getDataParser(filter) {
                var fieldType = keyedFields[filter.field].type || 'string';
                return dataParsers[fieldType];
            }

            // filter records
            return _.filter(results, function (record) {
                var passes = _.map(filters, function (filter) {
                    return filterFunctions[filter.type](record, filter);
                });

                // return only these records that pass all filters
                return _.all(passes, _.identity);
            });


        };

    my.Filters._filterFunctions = {
        term: function (record, filter, fields) {
            var parse = recline.Data.Filters._getDataParser(filter, fields);
            var value = parse(record[filter.field]);
            var term = parse(filter.term);

            return (value === term);
        },

        range: function (record, filter, fields) {
            var startnull = (filter.start == null || filter.start === '');
            var stopnull = (filter.stop == null || filter.stop === '');
            var parse = recline.Data.Filters._getDataParser(filter, fields);
            var value = parse(record[filter.field]);
            var start = parse(filter.start);
            var stop = parse(filter.stop);

            // if at least one end of range is set do not allow '' to get through
            // note that for strings '' <= {any-character} e.g. '' <= 'a'
            if ((!startnull || !stopnull) && value === '') {
                return false;
            }
            return ((startnull || value >= start) && (stopnull || value <= stop));

        },

        list: function (record, filter, fields) {

            var parse = recline.Data.Filters._getDataParser(filter, fields);
            var value = parse(record[filter.field]);
            var list = filter.list;
            _.each(list, function (data, index) {
                list[index] = parse(data);
            });

            return (_.contains(list, value));
        },

        termAdvanced: function (record, filter, fields) {
            var parse = recline.Data.Filters._getDataParser(filter, fields);
            var value = parse(record[filter.field]);
            var term = parse(filter.term);

            var operator = filter.operator;

            var operation = {
                ne: function (value, term) {
                    return value !== term
                },
                eq: function (value, term) {
                    return value === term
                },
                lt: function (value, term) {
                    return value < term
                },
                lte: function (value, term) {
                    return value <= term
                },
                gt: function (value, term) {
                    return value > term
                },
                gte: function (value, term) {
                    return value >= term
                },
                bw: function (value, term) {
                    return _.contains(term, value)
                },
                like: function (value, term) {
                    return value.indexOf(term) >= 0
                },
                rlike: function (value, term) {
                    return value.indexOf(term) == 0
                },
                llike: function (value, term) {
                    return value.indexOf(term) > 0
                }
            };

            return operation[operator](value, term);
        }
    },

        my.Filters._dataParsers = {
            integer: function (e) {
                return parseFloat(e, 10);
            },
            float: function (e) {
                return parseFloat(e, 10);
            },
            string: function (e) {
                if (!e) return null; else return e.toString();
            },
            date: function (e) {
                return new Date(e).valueOf()
            },
            datetime: function (e) {
                return new Date(e).valueOf()
            },
            number: function (e) {
                return parseFloat(e, 10);
            }
        };
}(this.recline.Data))
