this.recline = this.recline || {};
this.recline.Data = this.recline.Data || {};
this.recline.Data.SeriesUtility = this.recline.Data.SeriesUtility || {};



/*
    seriesAttr:
        groupField: field used to group data (x axis)
        defined a priori
            series: {type: "byFieldName", valuesField: [{fieldName: "fieldName1" fieldColor: ""}], sizeField: "fieldName", fillEmptyValuesWith: 0},
        calculated at runtime by the view based on field value
            series: {type: "byFieldValue", seriesField: "fieldName", valuesField: "fieldName1", sizeField: "fieldName", fillEmptyValuesWith: 0}
        calculated at runtime by the virtualmodel
            series: {type: "byPartitionedField", aggregatedField: "fieldName", sizeField: "fieldName", aggregationFunctions: ["fieldName1"]}

 unselectedColorValue: (optional) define the color of unselected datam default is #C0C0C0
        model: dataset source of data
 resultTypeValue: (optional) "filtered"/"unfiltered", let access to unfiltered data
 fieldLabels: (optional) [{id: fieldName, label: "fieldLabel"}]


 */
(function($, my) {
    my.createSeries = function (seriesAttr, unselectedColorValue, model, resultTypeValue, groupField) {
            var series = [];

            var fillEmptyValuesWith = seriesAttr.fillEmptyValuesWith;

            var unselectedColor = "#C0C0C0";
            if (unselectedColorValue)
                unselectedColor = unselectedColorValue;
            var selectionActive = false;
            if (model.queryState.isSelected())
                selectionActive = true;

            var resultType = "filtered";
            if (resultTypeValue !== null)
                resultType = resultTypeValue;

            var records = model.getRecords(resultType);  //self.model.records.models;

            var xfield = model.fields.get(groupField);


            var uniqueX = [];
            var sizeField;
            if (seriesAttr.sizeField) {
                sizeField = model.fields.get(seriesAttr.sizeField);
            }


            // series are calculated on data, data should be analyzed in order to create series
            if (seriesAttr.type == "byFieldValue") {
                var seriesTmp = {};
                var seriesNameField = model.fields.get(seriesAttr.seriesField);
                var fieldValue = model.fields.get(seriesAttr.valuesField);


                if (!fieldValue) {
                    throw "data.series.utility.CreateSeries: unable to find field [" + seriesAttr.valuesField + "] in model"
                }


                _.each(records, function (doc, index) {

                    // key is the field that identiy the value that "build" series
                    var key = doc.getFieldValueUnrendered(seriesNameField);
                    var tmpS;

                    // verify if the serie is already been initialized
                    if (seriesTmp[key] != null) {
                        tmpS = seriesTmp[key]
                    }
                    else {
                        tmpS = {name:key, data:[], field:fieldValue};

                        var color = doc.getFieldColor(seriesNameField);


                        if (color != null)
                            tmpS["color"] = color;


                    }
                    var shape = doc.getFieldShapeName(seriesNameField);

                    var x = doc.getFieldValueUnrendered(xfield);
                    var x_formatted = doc.getFieldValue(xfield);

                    var y = doc.getFieldValueUnrendered(fieldValue);
                    var y_formatted = doc.getFieldValue(fieldValue);

                    if (y && !isNaN(y)) {

                        var point = {x:x, y:y, record:doc, y_formatted:y_formatted, x_formatted:x_formatted};
                        if (sizeField)
                            point["size"] = doc.getFieldValueUnrendered(sizeField);
                        if (shape != null)
                            point["shape"] = shape;

                        tmpS.data.push(point);

                        if (fillEmptyValuesWith != null) {
                            uniqueX.push(x);
                        }

                        seriesTmp[key] = tmpS;
                    }
                });

                for (var j in seriesTmp) {
                    series.push(seriesTmp[j]);
                }

            }
            else if (seriesAttr.type == "byFieldName" || seriesAttr.type == "byPartitionedField") {
                var serieNames;

                // if partitions are active we need to retrieve the list of partitions
                if (seriesAttr.type == "byFieldName") {
                    serieNames = seriesAttr.valuesField;
                }
                else {
                    serieNames = [];
                    _.each(seriesAttr.aggregationFunctions, function (a) {
                        _.each(model.getPartitionedFieldsForAggregationFunction(a, seriesAttr.aggregatedField), function (f) {
                            serieNames.push(f.get("id"));
                        })

                    });

                }

                _.each(serieNames, function (field) {

                    var yfield;
                    if (seriesAttr.type == "byFieldName")
                        yfield = model.fields.get(field.fieldName);
                    else
                        yfield = model.fields.get(field);

                    var fixedColor;
                    if (field.fieldColor)
                        fixedColor = field.fieldColor;

                    var points = [];

                    _.each(records, function (doc, index) {
                        var x = doc.getFieldValueUnrendered(xfield);
                        var x_formatted = doc.getFieldValue(xfield); // rickshaw don't use millis


                        try {

                            var y = doc.getFieldValueUnrendered(yfield);
                            var y_formatted = doc.getFieldValue(yfield);

                            if (y != null && !isNaN(y)) {
                                var color;

                                var calculatedColor = doc.getFieldColor(yfield);

                                if (selectionActive) {
                                    if (doc.isRecordSelected())
                                        color = calculatedColor;
                                    else
                                        color = unselectedColor;
                                } else
                                    color = calculatedColor;

                                var shape = doc.getFieldShapeName(yfield);

                                var point = {x:x, y:y, record:doc, y_formatted:y_formatted, x_formatted:x_formatted};

                                if (color != null)
                                    point["color"] = color;
                                if (shape != null)
                                    point["shape"] = shape;

                                if (sizeField)
                                    point["size"] = doc.getFieldValueUnrendered(sizeField);

                                points.push(point);

                                if (fillEmptyValuesWith != null) {
                                    uniqueX.push(x);
                                }
                            }

                        }
                        catch (err) {
                            //console.log("Can't add field [" + field + "] to graph, filtered?")
                        }
                    });

                    if (points.length > 0) {
                        var color;
                        if (fixedColor)
                            color = fixedColor;
                        else
                            color = yfield.getColorForPartition();
                        var ret = {data:points, name: recline.Data.Formatters.getFieldLabel(yfield, model.attributes.fieldLabels)};
                        if (color)
                            ret["color"] = color;
                        series.push(ret);
                    }

                });

            } else throw "data.series.utility.CreateSeries: unsupported or not defined type " + seriesAttr.type;

            // foreach series fill empty values
            if (fillEmptyValuesWith != null) {
                uniqueX = _.unique(uniqueX);
                _.each(series, function (s) {
                    // foreach series obtain the unique list of x
                    var tmpValues = _.map(s.data, function (d) {
                        return d.x
                    });
                    // foreach non present field set the value
                    _.each(_.difference(uniqueX, tmpValues), function (diff) {
                        s.data.push({x:diff, y:fillEmptyValuesWith});
                    });

                });
            }


        return series;
    };

}(jQuery, this.recline.Data.SeriesUtility));
