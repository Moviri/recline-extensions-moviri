this.recline = this.recline || {};
this.recline.Data = this.recline.Data || {};

(function($, my) {
// adapted from https://github.com/harthur/costco. heather rules

my.StateManagement = {};


    my.StateManagement.State = Backbone.Model.extend({
        constructor:function State() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        // ### initialize
        initialize:function () {

        },

        setState: function(dataset) {
            var self=this;
            var filters;
            var selections;

            if(this.attributes.fromQueryString) {
                self.attributes.data = jQuery.deparam($.param.querystring());
            }

            if(this.attributes.useOnlyFields) {
                filters = _.filter(self.attributes.data.filters, function(f) {
                    return _.contains(self.attributes.useOnlyFields, f.field)
                });
                selections =_.filter(self.attributes.data.selections, function(f) {
                    return _.contains(self.attributes.useOnlyFields, f.field)
                });
            } else {
                if(self.attributes.data) {
                if(self.attributes.data.filters)
                    filters = self.attributes.data.filters;

                if(self.attributes.data.selections)
                    selections = self.attributes.data.selections;
                }
            }

            _.each(filters, function(f) {
                dataset.queryState.setFilter(f);
            });

            _.each(selections, function(f) {
                dataset.queryState.setSelection(f);
            });

        }


    });

    my.StateManagement.getQueryString = function(objects) {
        var state = this.getState(objects);
        return decodeURIComponent($.param(state));
    }


my.StateManagement.getState = function(objects) {
    var state = {filters: [], selections: []};
    _.each(objects, function(o) {
        if(o.queryState) {
            _.each(o.queryState.get('filters'), function(f)     {state.filters.push(f)});
            _.each(o.queryState.get('selections'), function(f)  {state.selections.push(f)});
        }
    });

    return state;
};


}(jQuery, this.recline.Data))
