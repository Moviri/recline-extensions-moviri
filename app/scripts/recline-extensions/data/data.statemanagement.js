define(['jquery', 'REM/recline-extensions/recline-amd'], function ($, recline) {
    recline.Data = recline.Data || {};

    var my = recline.Data;
    // adapted from https://github.com/harthur/costco. heather rules

    my.StateManagement = {};


    my.StateManagement.State = Backbone.Model.extend({
        constructor: function State() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        // ### initialize
        initialize: function () {
            var self = this;

            _.each(self.attributes.models, function (c) {
                c.ds.queryState.bind("change",
                    function () {
                        self.setState(self.attributes.stateName, c.ds.queryState, c.field, self)
                    })
                c.ds.queryState.bind("selection:change",
                    function () {
                        self.setState(self.attributes.stateName, c.ds.queryState, c.field, self)
                    })
            });
            if (this.attributes.defaultValue)
            	this.defaultValue = this.attributes.defaultValue;

            var state = my.StateManagement.getState(self.attributes.stateName);

            // if a state is present apply it to all models
            if (state) {
                _.each(self.attributes.models, function (c) {
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
            var self=this;

            // DON'T CHANGE MAPPING IF FIELDS IS CORRECT
            if(filter.field != fieldFrom)
                return filter;

            var f = _.clone(filter);
            f.field = fieldTo;

            return f;

        },

        applySelectionToFilters: function (models) {
            var self = this;
            var state = my.StateManagement.getState(self.attributes.stateName);
            if (state) {
                _.each(models, function (f) {
                    _.each(state.selections, function (s) {
                        f.ds.queryState.setFilter(self.mappingField(s, self.attributes.mappingField, f.field));
                    });


                })
            }

        },

        setState: function (stateName, queryState, field, self) {
            var filters = _.filter(queryState.attributes.filters, function(f) { return f.field ==  field} )
            var selections = _.filter(queryState.attributes.selections, function(f) { return f.field ==  field} )


            filters = _.map(filters, function(f) {
                return self.mappingField(f, field, self.attributes.mappingField); });
            selections = _.map(selections, function(f) {
                return self.mappingField(f, field, self.attributes.mappingField); });


            $.cookie("recline.extensions.statemanagement." + stateName, JSON.stringify({filters: filters, selections: selections}), {  path: '/' });
        }
    });


    my.StateManagement.getState = function (name) {
        var res = $.cookie("recline.extensions.statemanagement." + name);
        if (res)
            return JSON.parse(res);
        else if (this.State.arguments && this.State.arguments.length && this.State.arguments[0].defaultValue)
        	return this.State.arguments[0].defaultValue;
        else return null;
    };


});
