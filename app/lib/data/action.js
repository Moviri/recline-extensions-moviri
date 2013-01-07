this.recline = this.recline || {};

(function ($, my) {

    my.ActionUtility = {};


    my.ActionUtility.doAction = function (actions, eventType, eventData) {

        // find all actions configured for eventType
        var targetActions = _.filter(actions, function (d) {
            var tmpFound = _.find(d["event"], function (x) {
                return x == eventType
            });
            if (tmpFound != -1)
                return true;
            else
                return false;
        });

        // foreach action prepare field
        _.each(targetActions, function (currentAction) {
            var mapping = currentAction.mapping;
            var actionParameters = [];
            //foreach mapping set destination field
            _.each(mapping, function (map) {
                if (eventData[map["srcField"]] == null) {
                    console.log("warn: sourceField: [" + map["srcField"] + "] not present in event data");
                } else {


                    var param = {
                        filter:map["filter"],
                        value:eventData[map["srcField"]]
                    };
                    actionParameters.push(param);
                }
            });

            if (actionParameters.length > 0) {
                currentAction.action._internalDoAction(actionParameters);
            }
        });
    },

        my.ActionUtility.getActiveFilters = function (actions) {

            var activeFilters = [];
            _.each(actions, function (currentAction) {
                _.each(currentAction.mapping, function (map) {
                    var currentFilter = currentAction.action.getActiveFilters(map.filter, map.srcField);
                    if (currentFilter != null && currentFilter.length > 0)
                        activeFilters = _.union(activeFilters, currentFilter);
                })
            });

            return activeFilters;
        },

// ## <a id="dataset">Action</a>
        my.Action = Backbone.Model.extend({
            constructor:function Action() {
                Backbone.Model.prototype.constructor.apply(this, arguments);
            },

            initialize:function () {

            },

            doAction:function (records, mapping) {
                var params = [];
                mapping.forEach(function (mapp) {
                    var values = [];
                    //{srcField: "daydate", filter: "filter_daydate"}
                    records.forEach(function (row) {
                        values.push(row.getFieldValueUnrendered({id:mapp.srcField}));
                    });
                    params.push({
                        filter:mapp.filter,
                        value:values
                    });
                });
                this._internalDoAction(params);
            },

            doActionWithValues:function (valuesarray, mapping) {
                var params = [];
                mapping.forEach(function (mapp) {
                    var values = [];
                    //{srcField: "daydate", filter: "filter_daydate"}
                    _.each(valuesarray, function (row) {
                        if (row.field === mapp.srcField)
                            params.push({
                                filter:mapp.filter,
                                value:row.value
                            });
                    });

                });
                    this._internalDoAction(params);
            },


            // action could be add/remove
            _internalDoAction:function (data) {
                var self = this;

                var filters = this.attributes.filters;
                var models = this.attributes.models;
                var type = this.attributes.type;

                var targetFilters = [];

                //populate all filters with data received from event
                //foreach filter defined in data
                _.each(data, function (f) {
                    // filter creation
                    var currentFilter = filters[f.filter];
                    if (currentFilter == null) {
                        throw "Filter " + f.filter + " defined in actions data not configured for action ";
                    }
                    currentFilter["name"] = f.filter;
                    if (self.filters[currentFilter.type] == null)
                        throw "Filter not implemented for type " + currentFilter.type;

                    targetFilters.push(self.filters[currentFilter.type](currentFilter, f.value));

                });

                // foreach type and dataset add all filters and trigger events
                _.each(type, function (type) {
                    _.each(models, function (m) {

                        var modified = false;

                        _.each(targetFilters, function (f) {

                            // verify if filter is associated with current model
                            if (_.find(m.filters, function (x) {
                                return x == f.name;
                            }) != null) {
                                // if associated add the filter

                                self.modelsAddFilterActions[type](m.model, f);
                                modified = true;

                            }
                        });

                        if (modified) {
                            self.modelsTriggerActions[type](m.model);
                        }
                    });
                });


            },

            getActiveFilters:function (filterName, srcField) {
                var self = this;
                var models = this.attributes.models;
                var type = this.attributes.type;
                var filtersProp = this.attributes.filters;

                // for each type
                // foreach dataset
                // get filter
                // push to result, if already present error
                var foundFilters = [];

                _.each(type, function (type) {
                    _.each(models, function (m) {
                        var usedFilters = _.filter(m.filters, function (f) {
                            return f == filterName;
                        });
                        _.each(usedFilters, function (f) {
                            // search filter
                            var filter = filtersProp[f];
                            if (filter != null) {
                                var filterOnModel = self.modelsGetFilter[type](m.model, filter.field);
                                // substitution of fieldname with the one provided by source
                                if (filterOnModel != null) {
                                    filterOnModel.field = srcField;
                                    foundFilters.push(filterOnModel);
                                }
                            }
                        });
                    });
                });


                return foundFilters;
            },


            modelsGetFilter:{
                filter:function (model, fieldName) {
                    return model.queryState.getFilterByFieldName(fieldName);
                },
                selection:function (model, fieldName) {
                    throw "Action.js selection not implemented selection for selection"
                },
                sort:function (model, fieldName) {
                    throw "Action.js sort not implemented selection for sort"
                }
            },

            modelsAddFilterActions:{
                filter:function (model, filter) {
                    model.queryState.setFilter(filter)
                },
                selection:function (model, filter) {
                    model.queryState.setSelection(filter)
                },
                sort:function (model, filter) {
                    model.queryState.clearSortCondition();
                    model.queryState.setSortCondition(filter)
                }
            },


            modelsTriggerActions:{
                filter:function (model) {
                    model.queryState.trigger("change")
                },
                selection:function (model) {
                    model.queryState.trigger("selection:change")
                },
                sort:function (model) {
                    model.queryState.trigger("change")
                }
            },

            filters:{
                term:function (filter, data) {

                    if (data.length === 0) {
                        //empty list
                        filter["term"] = null;
                    } else if (data.length === 1) {
                    	if(data[0] == null)
                    		filter["remove"] = true;
                    	else
                    		filter["term"] = data[0];
                    } else {
                        throw "Data passed for filtertype term not valid. Data lenght should be 1 or empty but is " + data.length;
                    }

                    return filter;
                },
                range:function (filter, data) {

                    if (data.length === 0) {
                        //empty list
                        filter["start"] = null;
                        filter["stop"] = null;
                    } else if (data[0] === null || data[1] === null) {
                        //null list
                        filter["remove"] = true;
                    } else if (data.length === 2) {
                        filter["start"] = data[0];
                        filter["stop"] = data[1];
                    } else {
                        throw "Data passed for filtertype range not valid. Data lenght should be 2 but is " + data.length;
                    }

                    return filter;
                },
                list:function (filter, data) {

                    if (data.length === 0) {
                        //empty list
                        filter["list"] = null;
                    } else if (data === null) {
                        //null list
                        filter["remove"] = true;
                    } else {
                        filter["list"] = data;
                    }

                    return filter;
                },
                sort:function (sort, data) {

                    if (data.length === 0) {
                        sort = null;
                    } else if (data.length == 2) {
                        sort["field"] = data[0];
                        sort["order"] = data[1];
                    } else {
                        throw "Actions.js: invalid data length [" + data + "]";
                    }

                    return sort;
                }
            }




        })


}(jQuery, this.recline));
