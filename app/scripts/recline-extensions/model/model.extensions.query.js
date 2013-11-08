define(['jquery', 'REM/recline-extensions/recline-amd'], function ($, recline) {

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {
        query: function (queryObj) {
            var super_init = recline.Model.Dataset.prototype.query;

            return function (queryObj) {
                var self = this;

                if (queryObj) {
                    this.queryState.set(queryObj, {silent: true});
                }
                var actualQuery = this.queryState.toJSON();

                var modified = false;
                // add possibility to modify filter externally before execution
                _.each(self.attributes.customFilterLogic, function (f) {
                    f(actualQuery);
                    modified = true;
                });

                //console.log("Query on model [" + (self.attributes.id ? self.attributes.id : "") + "] query [" + JSON.stringify(actualQuery) + "]");

                if (queryObj || modified)
                    return super_init.call(this, actualQuery);
                else
                    return super_init.call(this, queryObj);


            };
        }()
    });

    recline.Model.Query.prototype = $.extend(recline.Model.Query.prototype, {
        removeFilterByFieldNoEvent: function (field) {
            var filters = this.get('filters');
            for (var j in filters) {
                if (filters[j].field === field) {
                    filters.splice(j, 1);
                    this.set({filters: filters}, {silent: true});
                }
            }
        },
        getFilterByFieldName: function (fieldName) {
            var res = _.find(this.get('filters'), function (f) {
                return f.field == fieldName;
            });
            if (res == -1)
                return null;
            else
                return res;

        },


        // update or add the selected filter(s), a change event is not triggered after the update

        setFilter: function (filter) {
            if (filter["remove"]) {
                this.removeFilterByFieldNoEvent(filter.field);
                delete filter["remove"];
            } else {

                var filters = this.get('filters');
                var found = false;
                for (var j = 0; j < filters.length; j++) {
                    if (filters[j].field == filter.field) {
                        filters[j] = filter;
                        found = true;
                    }
                }
                if (!found)
                    filters.push(filter);
            }
        },


        removeFilterByField: function (field) {
            var filters = this.get('filters');
            for (var j in filters) {
                if (filters[j].field == field) {
                    this.removeFilter(j);
                }
            }
        },


        clearFilter: function (field) {
            var filters = this.get('filters');
            for (var j in filters) {
                if (filters[j].field == field) {
                    filters[j].term = null;
                    filters[j].start = null;
                    filters[j].stop = null;
                    break;
                }
            }
        },

        addSortCondition: function (field, order) {
            var currentSort = this.get("sort");
            if (!currentSort)
                currentSort = [
                    {field: field, order: order}
                ];
            else
                currentSort.push({field: field, order: order});

            this.attributes["sort"] = currentSort;

            this.trigger('change:filters:sort');

        },

        setSortCondition: function (sortCondition) {
            var currentSort = this.get("sort");
            if (!currentSort)
                currentSort = [sortCondition];
            else
                currentSort.push(sortCondition);

            this.attributes["sort"] = currentSort;

        },

        clearSortCondition: function () {
            this.attributes["sort"] = null;
        }




    });

    return recline;

});