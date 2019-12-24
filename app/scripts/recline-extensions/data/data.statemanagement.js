define(['jquery', 'underscore', 'REM/recline-extensions/recline-amd'], function ($, _, recline) {
    recline.Data = recline.Data || {};

    var my = recline.Data;
    // adapted from https://github.com/harthur/costco. heather rules

    my.StateManagement = {};

    function supports_html5_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }    

    my.StateManagement.State = Backbone.Model.extend({
        constructor: function State() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        initialize: function () {
            var self = this;

            this.useLocalStorage = supports_html5_storage();

            _.bindAll(this, 'applySelectionToFilters', 'setState', 'getState');

            _.each(this.attributes.models, function (c) {
                c.ds.queryState.bind("change",
                    function () {
                        self.setState(self.attributes.stateName, c.ds.queryState, c.field, self)
                    })
                c.ds.queryState.bind("selection:change",
                    function () {
                        self.setState(self.attributes.stateName, c.ds.queryState, c.field, self)
                    })
            });
            if (this.attributes.defaultValue) {
            	this.defaultValue = this.attributes.defaultValue;
            }

            var state = this.getState(this.attributes.stateName);

            // if a state is present apply it to all models
            if (state) {
                _.each(this.attributes.models, function (c) {
                    _.each(state.filters, function (f) {
                        c.ds.queryState.setFilter(self.mappingField(f, self.attributes.mappingField, c.field ));
                    });

                    _.each(state.selections, function (s) {
                        c.ds.queryState.setSelection(self.mappingField(s, self.attributes.mappingField, c.field));
                    });
                });
            }
        },

        mappingField: function (filter, fieldFrom, fieldTo) {
            // DON'T CHANGE MAPPING IF FIELDS IS CORRECT
            if(filter.field != fieldFrom) {
                return filter;
            }

            var f = _.clone(filter);
            f.field = fieldTo;

            return f;
        },

        applySelectionToFilters: function (models) {
            var self = this;

            var state = this.getState(this.attributes.stateName);
            if (state) {
                _.each(models, function (f) {
                    _.each(state.selections, function (s) {
                        f.ds.queryState.setFilter(self.mappingField(s, self.attributes.mappingField, f.field));
                    });
                })
            }
        },

        setState: function (stateName, queryState, field) {
            var self = this;

            var filters = _.filter(queryState.attributes.filters, function(f) { return f.field ==  field} )
            var selections = _.filter(queryState.attributes.selections, function(f) { return f.field ==  field} )
            var defaultSelection = self.get("defaultSelectionIfNoSelection");
            if (defaultSelection && selections && selections.length === 0) {
                selections = [defaultSelection];
            }
            if (self.get("remove_ALL_fromSelection") === true && selections && selections.length) {
                selections = _.filter(selections, function(currObj) {
                    return !_.isEqual(currObj.list, ["_ALL_"]);
                });
            }

            var filtersShort = _.map(filters, function(f) {
                return self.mappingField(f, field, self.attributes.mappingField); 
            });
            var selectionsShort = _.map(selections, function(f) {
                return self.mappingField(f, field, self.attributes.mappingField); 
            });

            var newState = JSON.stringify({filters: filtersShort, selections: selectionsShort});
            if (this.useLocalStorage) {
                localStorage.setItem("recline.extensions.statemanagement." + stateName, newState);
            }
            else {
                $.cookie("recline.extensions.statemanagement." + stateName, newState, {  path: '/' });
            }
        },

        getState: function(name) {
            // calls static getter below
            var resObj = my.StateManagement.getState(name);
            if (resObj) {
                if (this.get("remove_ALL_fromSelection") === true && resObj.selections && resObj.selections.length) {
                    resObj.selections = _.filter(resObj.selections, function(currObj) {
                        return !_.isEqual(currObj.list, ["_ALL_"]);
                    });
                }
                var defaultSelection = this.get("defaultSelectionIfNoSelection");
                if (defaultSelection && resObj.selections && resObj.selections.length === 0) {
                    resObj.selections = [defaultSelection];
                }
                return resObj;
            }
            else if (this.defaultValue) {
                return this.defaultValue;
            }
        }
    });

    // getter that can be called statically to get raw value from cookie/localStorage
    my.StateManagement.getState = function (name) {
        var res, resObj;
        if (supports_html5_storage()) {
            res = localStorage.getItem("recline.extensions.statemanagement." + name);
        }
        else {
            res = $.cookie("recline.extensions.statemanagement." + name);
        }

        if (res && res !== "[object Object]") {
            resObj = JSON.parse(res);
        }
        return resObj;
    }

    // setter that can be called statically to set raw value to cookie/localStorage
    my.StateManagement.setState = function (name, value) {
        var valueStr = value;
        if (_.isObject(value)) {
            valueStr = JSON.stringify(value);
        }
        if (supports_html5_storage()) {
            localStorage.setItem("recline.extensions.statemanagement." + name, valueStr);
        }
        else {
            $.cookie("recline.extensions.statemanagement." + name, valueStr);
        }
    }    

});
