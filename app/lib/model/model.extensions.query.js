recline.Model.Query.prototype = $.extend(recline.Model.Query.prototype, {
    removeFilterByFieldNoEvent:function (field) {
        var filters = this.get('filters');
        for (var j in filters) {
            if (filters[j].field === field) {
                filters.splice(j, 1);
                this.set({filters:filters});
            }
        }
    },
    getFilterByFieldName:function (fieldName) {
        var res = _.find(this.get('filters'), function (f) {
            return f.field == fieldName;
        });
        if (res == -1)
            return null;
        else
            return res;

    },


    // update or add the selected filter(s), a change event is not triggered after the update

    setFilter:function (filter) {
        if (filter["remove"]) {
            this.removeFilterByField(filter.field);
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


    removeFilterByField:function (field) {
        var filters = this.get('filters');
        for (var j in filters) {
            if (filters[j].field == field) {
                this.removeFilter(j);
            }
        }
    },


    clearFilter:function (field) {
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

    addSortCondition:function (field, order) {
        var currentSort = this.get("sort");
        if (!currentSort)
            currentSort = [
                {field:field, order:order}
            ];
        else
            currentSort.push({field:field, order:order});

        this.attributes["sort"] = currentSort;

        this.trigger('change:filters:sort');

    },

    setSortCondition:function (sortCondition) {
        var currentSort = this.get("sort");
        if (!currentSort)
            currentSort = [sortCondition];
        else
            currentSort.push(sortCondition);

        this.attributes["sort"] = currentSort;

    },

    clearSortCondition:function () {
        this.attributes["sort"] = null;
    },

    addFacetNoEvent: function(fieldId) {
        var facets = this.get('facets');
        // Assume id and fieldId should be the same (TODO: this need not be true if we want to add two different type of facets on same field)
        if (_.contains(_.keys(facets), fieldId)) {
            return;
        }
        facets[fieldId] = {
            terms: { field: fieldId }
        };
        this.set({facets: facets}, {silent: true});

    }


});