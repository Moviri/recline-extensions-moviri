define(['jquery', 'REM/recline-extensions/recline-amd', 'crossfilter', 'REM/recline-extensions/data/data.formatters', 'REM/recline-extensions/data/data.aggregations'], function ($, recline, crossfilter) {

    recline.Model = recline.Model || {};
    recline.Model.VirtualDataset = recline.Model.VirtualDataset || {};

    var my = recline.Model;

    my.VirtualDataset = Backbone.Model.extend({

        constructor:function VirtualDataset() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        initialize:function () {
            _.bindAll(this, 'query', 'toFullJSON');


            var self = this;

            self.vModel = new my.Dataset(
                {
                    backend: "Memory",
                    records:[], fields: [],
                    renderer: self.attributes.renderer
                });


            self.fields = self.vModel.fields;
            self.records = self.vModel.records;
            self.facets = self.vModel.facets;
            self.recordCount = self.vModel.recordCount;
            self.queryState = self.vModel.queryState;

            if (this.get('initialState')) {
                this.get('initialState').setState(this);
            }

            this.attributes.dataset.bind('query:done', function () {
                self.initializeCrossfilter();
            })

            this.queryState.bind('change', function () {
                self.query();
            });
            this.queryState.bind('selection:change', function () {
                self.selection();
            });

            // dataset is already been fetched
            if (this.attributes.dataset.records.models.length > 0)
                self.initializeCrossfilter();

            // TODO verify if is better to use a new backend (crossfilter) to manage grouping and filtering instead of using it inside the model
            // TODO OPTIMIZATION use a structure for the reduce function that doesn't need any translation to records/arrays
            // TODO USE crossfilter as backend memory
        },

            getRecords:function (type) {
            var self = this;

            if (type === 'totals') {
                if(self.needsTableCalculation && self.totals == null)
                    self.rebuildTotals();
                return self.totals.records.models;
            } else if (type === 'totals_unfiltered') {

                if(self.totals_unfiltered == null)
                    self.rebuildUnfilteredTotals();

                return self.totals_unfiltered.records.models;
            } else {
                if(self.needsTableCalculation && self.totals == null)
                    self.rebuildTotals();
                
                return self.vModel.getRecords(type);
            }
        },

        getField_byAggregationFunction: function(resultType, fieldName, aggr) {
            var fields = this.getFields(resultType);
            return fields.get(fieldName + "_" + aggr);
        },


        getFields:function (type) {
            var self = this;

            if (type === 'totals') {
                if(self.totals == null)
                    self.rebuildTotals();

                return self.totals.fields;
            } else if (type === 'totals_unfiltered') {
                if(self.totals == null)
                    self.rebuildUnfilteredTotals();

                return self.totals_unfiltered.fields;
            } else {
                return self.vModel.getFields(type);
            }
        },

        fetch: function() {
            this.initializeCrossfilter();
        },

        initializeCrossfilter:function () {
         //   console.log("initialize crossfilter");
            var aggregatedFields = this.attributes.aggregation.measures;
            var aggregationFunctions = this.attributes.aggregation.aggregationFunctions;
            var originalFields = this.attributes.dataset.fields;
            var dimensions =  this.attributes.aggregation.dimensions;
            var partitions =this.attributes.aggregation.partitions;

            var crossfilterData = crossfilter(this.attributes.dataset.toFullJSON());
            var group = this.createDimensions(crossfilterData, dimensions);
            var results = this.reduce(group,dimensions,aggregatedFields,aggregationFunctions,partitions);

            this.updateStore(results, originalFields,dimensions,aggregationFunctions,aggregatedFields,partitions);
            this.trigger('query:done');
        },

        setDimensions:function (dimensions) {
            this.attributes.aggregation.dimensions = dimensions;
            this.trigger('dimensions:change');
        },

        setMeasures:function (measures) {
            this.attributes.aggregation.measures = measures;
            this.trigger('measures:change');
        },

        setTotalsMeasures: function(measures) {
            this.attributes.totals.measures = measures;
            this.trigger('totals:change');
        },

        getDimensions:function () {
            return this.attributes.aggregation.dimensions;
        },

        createDimensions:function (crossfilterData, dimensions) {
            var group;

            if (dimensions == null) {
                // need to evaluate aggregation function on all records
                group = crossfilterData.groupAll();
            }
            else {
                var by_dimension = crossfilterData.dimension(function (d) {
                    var tmp = "";
                    for (i = 0; i < dimensions.length; i++) {
                        if (i > 0) {
                            tmp = tmp + "#";
                        }
                       if(d[dimensions[i]])
                        tmp = tmp + d[dimensions[i]].valueOf();
                       else
                        tmp = tmp + "NULL";
                    }
                    return tmp;
                });
                group = by_dimension.group();
            }

            return group;
        },

        reduce:function (group, dimensions, aggregatedFields, aggregationFunctions, partitions) {

            //if (aggregationFunctions == null || aggregationFunctions.length == 0)
            //    throw("Error aggregationFunctions parameters is not set for virtual dataset ");


            var partitioning = false;
            var partitionFields = {};
            if (partitions != null) {
                var partitioning = true;
            }

            function addFunction(p, v) {
                p.count = p.count + 1;
                for (i = 0; i < aggregatedFields.length; i++) {

                    // for each aggregation function evaluate results
                    for (j = 0; j < aggregationFunctions.length; j++) {
                        var currentAggregationFunction = recline.Data.Aggregations.aggregationFunctions[aggregationFunctions[j]];

                        p[aggregationFunctions[j]][aggregatedFields[i]] =
                            currentAggregationFunction(
                                p[aggregationFunctions[j]][aggregatedFields[i]],
                                v[aggregatedFields[i]]);
                    }


                    if (partitioning) {
                        // for each partition need to verify if exist a value of aggregatefield_by_partition_partitionvalue
                        for (x = 0; x < partitions.length; x++) {
                            var partitionName = partitions[x];
                            var partitionValue = v[partitions[x]];
                            var aggregatedField = aggregatedFields[i];
                            var fieldName = aggregatedField + "_by_" + partitionName + "_" + partitionValue;


                            // for each aggregation function evaluate results
                            for (j = 0; j < aggregationFunctions.length; j++) {

                                if (partitionFields[aggregationFunctions[j]] == null)
                                    partitionFields[aggregationFunctions[j]] = {};

                                var currentAggregationFunction = recline.Data.Aggregations.aggregationFunctions[aggregationFunctions[j]];

                                if (p.partitions[aggregationFunctions[j]][fieldName] == null) {
                                    p.partitions[aggregationFunctions[j]][fieldName] = {
                                        value:null,
                                        partition:partitionValue,
                                        originalField:aggregatedField,
                                        aggregationFunction:currentAggregationFunction};

                                    // populate partitions description

                                    partitionFields[aggregationFunctions[j]][fieldName] = {
                                        field:partitionName,
                                        value:partitionValue,
                                        originalField:aggregatedField,
                                        aggregationFunction:currentAggregationFunction,
                                        aggregationFunctionName:aggregationFunctions[j],
                                        id:fieldName + "_" + aggregationFunctions[j]
                                    }; // i need partition name but also original field value
                                }
                                p.partitions[aggregationFunctions[j]][fieldName]["value"] =
                                    currentAggregationFunction(
                                        p.partitions[aggregationFunctions[j]][fieldName]["value"],
                                        v[aggregatedFields[i]]);
                            }

                            if (p.partitions.count[fieldName] == null) {
                                p.partitions.count[fieldName] = {
                                    value:1,
                                    partition:partitionValue,
                                    originalField:aggregatedField,
                                    aggregationFunction:"count"
                                };
                            }
                            else
                                p.partitions.count[fieldName]["value"] += 1;
                        }
                    }


                }
                return p;
            }

            function removeFunction(p, v) {
                throw "crossfilter reduce remove function not implemented";
            }

            function initializeFunction() {

                var tmp = {count:0};

                for (j = 0; j < aggregationFunctions.length; j++) {
                    tmp[aggregationFunctions[j]] = {};

                    recline.Data.Aggregations.initFunctions[aggregationFunctions[j]](tmp, aggregatedFields, partitions);
                }

                if (partitioning) {
                    tmp["partitions"] = {};
                    tmp["partitions"]["count"] = {};

                    for (j = 0; j < aggregationFunctions.length; j++) {
                        tmp["partitions"][aggregationFunctions[j]] = {};
                    }

                    /*_.each(partitions, function(p){
                     tmp.partitions.list[p] = 0;
                     });*/
                }

                return tmp;
            }

            var reducedGroup = group.reduce(addFunction, removeFunction, initializeFunction);

            var tmpResult;

            if (dimensions == null) {
                tmpResult = [reducedGroup.value()];
            }
            else {
                tmpResult = reducedGroup.all();
            }

            return {reducedResult:tmpResult,
                partitionFields:partitionFields};

        },

        updateStore:function (results, originalFields, dimensions, aggregationFunctions, aggregatedFields, partitions) {
            var self = this;

            var reducedResult = results.reducedResult;
            var partitionFields = results.partitionFields;
            this.partitionFields = partitionFields;

            var fields = self.buildFields(reducedResult, originalFields, partitionFields, dimensions, aggregationFunctions);
            var result = self.buildResult(reducedResult, originalFields, partitionFields, dimensions, aggregationFunctions, aggregatedFields, partitions);

            self.vModel.resetFields(fields);
            self.vModel.resetRecords(result);



            recline.Data.FieldsUtility.setFieldsAttributes(fields, self);

            this.clearUnfilteredTotals();

            self.vModel.fetch();
            self.recordCount = self.vModel.recordCount;

        },

        rebuildTotals: function() {
            this._rebuildTotals(this.records, this.fields, true);

        },
        rebuildUnfilteredTotals: function() {
            this._rebuildTotals(this._store.data, this.fields, false);
        },
        clearUnfilteredTotals: function() {
            this.totals_unfiltered = null;
           this.clearFilteredTotals();
        },
        clearFilteredTotals: function() {
            this.totals = null;
       },

        _rebuildTotals: function(records, originalFields, filtered) {
            /*
                totals: {
                    aggregationFunctions:["sum"],
                    aggregatedFields: ["fielda"]
                    }
            */
            var self=this;

            if(!self.attributes.totals)
                return;

            var aggregatedFields = self.attributes.totals.measures;
            var aggregationFunctions =  self.attributes.totals.aggregationFunctions;

            var rectmp;

            if(records.constructor == Array)
                rectmp = records;
            else
                rectmp = _.map(records.models, function(d) { return d.attributes;}) ;

            var crossfilterData =  crossfilter(rectmp);

            var group = this.createDimensions(crossfilterData, null);
            var results = this.reduce(group, null,aggregatedFields, aggregationFunctions, null);

            var fields = self.buildFields(results.reducedResult, originalFields, {}, null, aggregationFunctions);
            var result = self.buildResult(results.reducedResult, originalFields, {}, null, aggregationFunctions, aggregatedFields, null);

            // I need to apply table calculations
            var tableCalc = recline.Data.Aggregations.checkTableCalculation(self.attributes.aggregation.aggregationFunctions, self.attributes.totals);

                _.each(tableCalc, function(f) {
                    var p;
                    _.each(rectmp, function(r) {
                        p = recline.Data.Aggregations.tableCalculations[f](self.attributes.aggregation.measures, p, r, result[0]);
                    });
                });

            recline.Data.FieldsUtility.setFieldsAttributes(fields, self);

            var options;
            if (self.attributes.renderer)
                options = { renderer: self.attributes.renderer};

            if(filtered) {
                if(this.totals == null) { this.totals = {records: new my.RecordList(), fields: new my.FieldList() }}

                    this.totals.fields.reset(fields, options) ;
                    this.totals.records.reset(result);
            }   else   {
                if(this.totals_unfiltered == null) { this.totals_unfiltered = {records: new my.RecordList(), fields: new my.FieldList() }}

                    this.totals_unfiltered.fields.reset(fields, options) ;
                    this.totals_unfiltered.records.reset(result);
            }


        },

        needsTableCalculation: function() {
            if(recline.Data.Aggregations.checkTableCalculation(self.attributes.aggregation.aggregationFunctions, self.attributes.totals).length > 0)
                return true;
            else
                return false;
        },

        buildResult:function (reducedResult, originalFields, partitionFields, dimensions, aggregationFunctions, aggregatedFields, partitions) {

            var partitioning = false;

            if (partitions != null) {
                var partitioning = true;
            }

            var tmpField;
            if (dimensions == null) {
                tmpField = reducedResult;
            }
            else {
                if (reducedResult.length > 0) {
                    tmpField = reducedResult[0].value;
                }
                else
                    tmpField = {count:0};
            }

            var result = [];

            // set  results of dataset
            for (var i = 0; i < reducedResult.length; i++) {

                var currentField;
                var currentResult = reducedResult[i];
                var tmp;

                // if dimensions specified add dimension' fields
                if (dimensions != null) {
                    var keyField = reducedResult[i].key.split("#");

                    tmp = {dimension:currentResult.key, count:currentResult.value.count};

                    for (var j = 0; j < keyField.length; j++) {
                        var field = dimensions[j];
                        var originalFieldAttributes = originalFields.get(field).attributes;
                        var type = originalFieldAttributes.type;

                        var parse = recline.Data.FormattersMoviri[type];
                        var value = parse(keyField[j]);

                        tmp[dimensions[j]] = value;
                    }
                    currentField = currentResult.value;

                }
                else {
                    currentField = currentResult;
                    tmp = {count:currentResult.count};
                }

                // add records foreach aggregation function
                for (var j = 0; j < aggregationFunctions.length; j++) {

                    // apply finalization function, was not applied since now
                    // todo verify if can be moved above
                    // note that finalization can't be applyed at init cause we don't know in advance wich partitions data are present


                    var tmpPartitionFields = [];
                    if (partitionFields[aggregationFunctions[j]] != null)
                        tmpPartitionFields = partitionFields[aggregationFunctions[j]];
                    recline.Data.Aggregations.finalizeFunctions[aggregationFunctions[j]](
                        currentField,
                        aggregatedFields,
                        _.keys(tmpPartitionFields));

                    var tempValue;


                    if (typeof currentField[aggregationFunctions[j]] == 'function')
                        tempValue = currentField[aggregationFunctions[j]]();
                    else
                        tempValue = currentField[aggregationFunctions[j]];


                    for (var x in tempValue) {

                        var tempValue2;
                        if (typeof tempValue[x] == 'function')
                            tempValue2 = tempValue[x]();
                        else
                            tempValue2 = tempValue[x];

                        tmp[x + "_" + aggregationFunctions[j]] = tempValue2;
                    }


                    // adding partition records
                    if (partitioning) {
                        var tempValue;
                        if (typeof currentField.partitions[aggregationFunctions[j]] == 'function')
                            tempValue = currentField.partitions[aggregationFunctions[j]]();
                        else
                            tempValue = currentField.partitions[aggregationFunctions[j]];

                        for (var x in tempValue) {
                            var tempValue2;
                            if (typeof currentField.partitions[aggregationFunctions[j]] == 'function')
                                tempValue2 = currentField.partitions[aggregationFunctions[j]]();
                            else
                                tempValue2 = currentField.partitions[aggregationFunctions[j]];

                            var fieldName = x + "_" + aggregationFunctions[j];

                            tmp[fieldName] = tempValue2[x].value;


                        }

                    }

                }

                // count is always calculated for each partition
                if (partitioning) {
                    for (var x in tmpField.partitions["count"]) {
                        if (currentResult.value.partitions["count"][x] == null)
                            tmp[x + "_count"] = 0;
                        else
                            tmp[x + "_count"] = currentResult.value.partitions["count"][x].value;
                    }
                }


                result.push(tmp);
            }

            return result;
        },

        buildFields:function (reducedResult, originalFields, partitionFields, dimensions, aggregationFunctions) {
            var self = this;

            var fields = [];

            var tmpField;
            if (dimensions == null ) {
                if(reducedResult.constructor != Array)
                    tmpField = reducedResult;
                else
                if (reducedResult.length > 0) {
                    tmpField = reducedResult[0];
                }
                else
                    tmpField = {count:0};
            }
            else {
                if (reducedResult.length > 0) {
                    tmpField = reducedResult[0].value;
                }
                else
                    tmpField = {count:0};
            }


            // creation of fields

            fields.push({id:"count", type:"integer"});

            // defining fields based on aggreagtion functions
            for (var j = 0; j < aggregationFunctions.length; j++) {

                var tempValue;
                if (typeof tmpField[aggregationFunctions[j]] == 'function')
                    tempValue = tmpField[aggregationFunctions[j]]();
                else
                    tempValue = tmpField[aggregationFunctions[j]];

                for (var x in tempValue) {
                    var originalField = originalFields.get(x);
                    if(!originalField)
                    throw "Virtualmodel: unable to find field ["+x+"] in model";

                    var originalFieldAttributes = originalField.attributes;


                    var newType = recline.Data.Aggregations.resultingDataType[aggregationFunctions[j]](originalFieldAttributes.type);

                    var fieldLabel = x + "_" + aggregationFunctions[j];

                    if (self.attributes.fieldLabelForFields) {
                        fieldLabel = self.attributes.fieldLabelForFields
                            .replace("{originalFieldLabel}", originalFieldAttributes.label)
                            .replace("{aggregatedFunction}", aggregationFunctions[j]);
                    }


                    fields.push({
                        id:x + "_" + aggregationFunctions[j],
                        type:newType,
                        is_partitioned:false,
                        colorSchema:originalFieldAttributes.colorSchema,
                        shapeSchema:originalFieldAttributes.shapeSchema,
                        originalField:x,
                        aggregationFunction:aggregationFunctions[j],
                        label:fieldLabel
                    });
                }

                // add partition fields
                _.each(partitionFields, function (aggrFunction) {
                    _.each(aggrFunction, function (d) {
                        var originalFieldAttributes = originalFields.get(d.field).attributes;
                        var newType = recline.Data.Aggregations.resultingDataType[aggregationFunctions[j]](originalFieldAttributes.type);

                        var fieldId = d.id;
                        var partitionedFieldLabel = fieldId;

                        if (self.attributes.fieldLabelForPartitions) {
                            partitionedFieldLabel = self.attributes.fieldLabelForPartitions
                                .replace("{originalField}", d.originalField)
                                .replace("{partitionFieldName}", d.field)
                                .replace("{partitionFieldValue}", d.value)
                                .replace("{aggregatedFunction}", aggregationFunctions[j]);
                        }

                        fields.push({
                                id:fieldId,
                                type:newType,
                                is_partitioned:true,
                                partitionField:d.field,
                                partitionValue:d.value,
                                colorSchema:originalFieldAttributes.colorSchema, // the schema is the one used to specify partition
                                shapeSchema:originalFieldAttributes.shapeSchema,
                                originalField:d.originalField,
                                aggregationFunction:aggregationFunctions[j],
                                label:partitionedFieldLabel
                            }
                        );
                    })
                });

            }

            // adding all dimensions to field list
            if (dimensions != null) {
                fields.push({id:"dimension"});
                for (var i = 0; i < dimensions.length; i++) {
                    var field = originalFields.get(dimensions[i]);
                    if(!field)
                        throw "VirtualModel.js: unable to find field [" + dimensions[i] + "] in model";
                    var originalFieldAttributes = field.attributes;
                    fields.push({
                        id:dimensions[i],
                        type:originalFieldAttributes.type,
                        label:originalFieldAttributes.label,
                        format:originalFieldAttributes.format,
                        colorSchema:originalFieldAttributes.colorSchema,
                        shapeSchema:originalFieldAttributes.shapeSchema
                    });

                }
            }


            return fields;
        },

        query:function (queryObj) {
            var self=this;
            self.trigger('query:start');
            if (queryObj) {
                this.queryState.set(queryObj, {silent:true});
            }

            self.clearFilteredTotals();

            self.vModel.query(queryObj);

            self.recordCount = self.vModel.recordCount;


            self.trigger('query:done');
        },

        selection:function (queryObj) {
           return this.vModel.selection(queryObj);

        },

        setColorSchema:function (type) {
            if(this.attributes["colorSchema"])
                 this.vModel.attributes["colorSchema"] = this.attributes["colorSchema"];
            return this.vModel.setColorSchema(type);

        },

        setShapeSchema:function (type) {
            return this.vModel.setShapeSchema(type);
        },

        /*addColorsToTerms:function (field, terms) {
            var self = this;
            _.each(terms, function (t) {

                // assignment of color schema to fields
                if (self.attributes.colorSchema) {
                    _.each(self.attributes.colorSchema, function (d) {
                        if (d.field === field)
                            t.color = d.schema.getColorFor(t.term);
                    })
                }
            });
        },*/

        getFacetByFieldId:function (fieldId) {
            return this.vModel.getFacetByFieldId(fieldId);
        },

        toTemplateJSON:function () {
            return this.vModel.toTemplateJSON();
        },
        toFullJSON:function (resultType) {
            var self = this;
            return _.map(self.getRecords(resultType), function (r) {
                var res = {};

                _.each(self.getFields(resultType).models, function (f) {
                    res[f.id] = r.getFieldValueUnrendered(f);
                });

                return res;

            });
        },

        getFieldsSummary:function () {
            return this.vModel.getFieldsSummary();
        },

        addStaticColorSchema: function(colorSchema, field) {
           return this.vModel.addStaticColorSchema(colorSchema, field);
        },

        // Retrieve the list of partitioned field for the specified aggregated field
        getPartitionedFields:function (partitionedField, measureField) {
            //var field = this.fields.get(fieldName);

            var fields = _.filter(this.fields.models, function (d) {
                return (
                    d.attributes.partitionField == partitionedField
                        && d.attributes.originalField == measureField
                    );
            });

            if (fields == null)
                field = [];

            //fields.push(field);

            return fields;

        },

        isFieldPartitioned:function (fieldName, type) {
            var field = this.getFields(type).get(fieldName);
            if(!field)
                throw("Virtualmodel.js: isFieldPartitioned: unable to find field [" + fieldName + "] in virtualmodel [" + this.id +"]");

            return  field.attributes.aggregationFunction
                && this.attributes.aggregation.partitions;
        },

        getPartitionedFieldsForAggregationFunction:function (aggregationFunction, aggregatedFieldName) {
            var self = this;
            var fields = [];

            _.each(self.partitionFields[aggregationFunction], function (p) {
                if (p.originalField == aggregatedFieldName)
                    fields.push(self.fields.get(p.id));
            });

            return fields;
        },

        addCustomFilterLogic: function(f) {
            return this.vModel.addCustomFilterLogic(f);
        }

    });

});
