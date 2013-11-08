define(['jquery', 'REM/recline-extensions/recline-amd'], function ($, recline) {

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {
        selection:function (queryObj) {
            var self = this;

            this.trigger('selection:start');

            if (queryObj) {
                self.queryState.set(queryObj, {silent:true});
            }
            var actualQuery = self.queryState

            recline.Data.Filters.applySelectionsOnRecord(self.queryState.getSelections(), self.records.models, self.fields);

            self.queryState.trigger('selection:done');
        },
        initialize:function () {
            var super_init = recline.Model.Dataset.prototype.initialize;
            return function () {
                super_init.call(this);
                _.bindAll(this, 'selection');
                _.bindAll(this, 'applySelectionOnRecords');

                this.queryState.bind('selection:change', this.selection);
                this.records.bind('reset', this.applySelectionOnRecords);
            };
        }(),
        applySelectionOnRecords: function() {
        	var self = this;
        	if (this.queryState && this.queryState.getSelections().lenght > 0)
        		recline.Data.Filters.applySelectionsOnRecord(self.queryState.getSelections(), self.records.models, self.fields);

        }
    });


    recline.Model.Record.prototype = $.extend(recline.Model.Record.prototype, {
        isRecordSelected:function () {
            var self = this;
            return self["is_selected"];
        },
        setRecordSelection:function (sel) {
            var self = this;
            self["is_selected"] = sel;
        }
    });


    recline.Model.Query.prototype = $.extend(recline.Model.Query.prototype, {
        getSelections:function () {
            var sel = this.get('selections');
            if (sel)
                return sel;


            this.set({selections:[]}, {silent: true});
            return this.get('selections');

        },

        getSelectionByFieldName:function (fieldName) {
            var res = _.find(this.get('selections'), function (f) {
                return f.field == fieldName;
            });
            if (res == -1)
                return null;
            else
                return res;

        },

    // ### addSelection
    //
    // Add a new selection (appended to the list of selections)
    //
    // @param selection an object specifying the filter - see _filterTemplates for examples. If only type is provided will generate a filter by cloning _filterTemplates
        addSelection:function (selection) {
            // crude deep copy
            var myselection = JSON.parse(JSON.stringify(selection));
            // not full specified so use template and over-write
            // 3 as for 'type', 'field' and 'fieldType'
            if (_.keys(selection).length <= 3) {
                myselection = _.extend(this._selectionTemplates[selection.type], myselection);
            }
            var selections = this.getSelections();
            selections.push(myselection);
            this.trigger('selection:change');
        },


    // ### removeSelection
    //
    // Remove a selection at index selectionIndex
        removeSelection:function (selectionIndex) {
            var selections = this.getSelections();
            selections.splice(selectionIndex, 1);
            this.set({selections:selections}, {silent: true});
            this.trigger('selection:change');
        },
        removeSelectionByField:function (field) {
            var selections = this.getSelections();
            for (var j in selections) {
                if (selections[j].field == field) {
                    this.removeSelection(j);
                }
            }
        },
        setSelection:function (filter) {
        	
            if (filter["remove"]) {
                this.removeSelectionByField(filter.field);
                delete filter["remove"];
            } else {
                var s = this.getSelections();
                var found = false;
                for (var j = 0; j < s.length; j++) {
                    if (s[j].field == filter.field) {
                        s[j] = filter;
                        found = true;
                    }
                }
                if (!found)
                    s.push(filter);
            }
            this.trigger('selection:change');
        },

        isSelected:function () {
            return this.getSelections().length > 0;
        }

    });

    return recline;
});