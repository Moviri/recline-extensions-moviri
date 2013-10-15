define(['recline-amd', 'jquery', 'recline-extensions/data/data.fieldsutilities', 'recline-extensions/backend/backend.extensions.csv'], function(recline, $) {

	recline.Model.Query.prototype = $.extend(recline.Model.Query.prototype, {
	    defaults: function() {
	        return {
	            size: 500000    ,
	            from: 0,
	            q: '',
	            facets: {},
	            filters: []
	        };
	    },

        addFacetNoEvent: function (fieldId) {
            var facets = this.get('facets');
            // Assume id and fieldId should be the same (TODO: this need not be true if we want to add two different type of facets on same field)
            if (_.contains(_.keys(facets), fieldId)) {
                return;
            }
            facets[fieldId] = {
                terms: { field: fieldId }
            };
            this.set({facets: facets}, {silent: true});

        },

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
        },

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

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {
        initialize:function () {
            var super_init = recline.Model.Dataset.prototype.initialize;
            return function () {
                super_init.call(this);
                _.bindAll(this, 'applyRendererToFields');
                _.bindAll(this, 'selection');
                _.bindAll(this, 'applySelectionOnRecords');

                this.queryState.bind('selection:change', this.selection);
                this.records.bind('reset', this.applySelectionOnRecords);
                this.fields.bind('reset', this.applyRendererToFields);

	            if (this.get('initialState')) {
	                this.get('initialState').setState(this);
	            }

            };
        }(),

        applyRendererToFields: function() {
            var self = this;
            if (self.attributes.renderer) {
                _.each(self.fields.models, function (f) {
                    f.renderer = self.attributes.renderer;
                });
            }

        },

        setColorSchema: function () {
            var self = this;

            _.each(self.attributes.colorSchema, function (d) {
                var field = _.find(self.fields.models, function (f) {
                    return d.field === f.id
                });
                if (field != null)
                    field.attributes.colorSchema = d.schema;
            })

        },

        // a color schema is linked to the dataset but colors are not recalculated upon data/field reset
        addStaticColorSchema: function (colorSchema, field) {
            var self = this;
            if (!self.attributes["colorSchema"])
                self.attributes["colorSchema"] = [];

            self.attributes["colorSchema"].push({schema: colorSchema, field: field});

            if (self.fields.length > 0)
                self.setColorSchema();

            self.fields.bind('reset', function () {
                self.setColorSchema();
            });
            self.fields.bind('add', function () {
                self.setColorSchema();
            });
            self.fields.bind('change', function () {
                self.setColorSchema();
            });

        },

        addCustomFilterLogic: function(f) {
            if(this.attributes.customFilterLogic)
                this.attributes.customFilterLogic.push(f);
            else
                this.attributes.customFilterLogic = [f];
        },

        getFacetByFieldId: function (fieldId) {
            return _.find(this.facets.models, function (facet) {
                return facet.id == fieldId;
            });
        },

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
        applySelectionOnRecords: function() {
        	var self = this;
        	if (this.queryState && this.queryState.getSelections().lenght > 0)
        		recline.Data.Filters.applySelectionsOnRecord(self.queryState.getSelections(), self.records.models, self.fields);

        },
        setShapeSchema:function () {
            var self = this;
            _.each(self.attributes.shapeSchema, function (d) {
                var field = _.find(self.fields.models, function (f) {
                    return d.field === f.id
                });
                if (field != null)
                    field.attributes.shapeSchema = d.schema;
            })
        },

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
                var res = super_init.call(this, queryResult);

                if (queryResult.facets) {

                    _.each(queryResult.facets, function (f, index) {
                        recline.Data.ColorSchema.addColorsToTerms(f.id, f.terms, self.attributes.colorSchema);
                        recline.Data.ShapeSchema.addShapesToTerms(f.id, f.terms, self.attributes.shapeSchema)
                    });
                }

                return res;
            };
        }(),

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


    recline.Model.Record.prototype = $.extend(recline.Model.Record.prototype, {
        getFieldColor: function (field) {
            if (!field.attributes.colorSchema)
                return null;

            if (field.attributes.is_partitioned) {
                return field.attributes.colorSchema.getTwoDimensionalColor(field.attributes.partitionValue, this.getFieldValueUnrendered(field));
            }
            else
                return field.attributes.colorSchema.getColorFor(this.getFieldValueUnrendered(field));

        },
        isRecordSelected:function () {
            var self = this;
            return self["is_selected"];
        },
        setRecordSelection:function (sel) {
            var self = this;
            self["is_selected"] = sel;
        },
        getFieldShapeName:function (field) {
            if (!field.attributes.shapeSchema)
                return null;

            if (field.attributes.is_partitioned) {
                return field.attributes.shapeSchema.getShapeNameFor(field.attributes.partitionValue);
            }
            else
                return field.attributes.shapeSchema.getShapeNameFor(this.getFieldValueUnrendered(field));

        },

        getFieldShape:function (field, isSVG, isNode) {
            if (!field.attributes.shapeSchema)
                return recline.Template.Shapes["empty"](null, isNode, isSVG);

            var fieldValue;
            var fieldColor = this.getFieldColor(field);

            if (field.attributes.is_partitioned) {
                fieldValue = field.attributes.partitionValue;
            }
            else
                fieldValue = this.getFieldValueUnrendered(field);


            return field.attributes.shapeSchema.getShapeFor(fieldValue, fieldColor, isSVG, isNode);
        }


    });


    recline.Model.Field.prototype = $.extend(recline.Model.Field.prototype, {

        getColorForPartition: function () {

            if (!this.attributes.colorSchema)
                return null;

            if (this.attributes.is_partitioned)
                return this.attributes.colorSchema.getColorFor(this.attributes.partitionValue);

            return this.attributes.colorSchema.getColorFor(this.attributes.id);
        }
    });

    return recline;
});
