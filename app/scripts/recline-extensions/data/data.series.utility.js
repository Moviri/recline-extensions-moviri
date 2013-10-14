define(['jquery', 'recline.model.extensions.all'], function ($, recline) {

    recline.Data = recline.Data || {};
    recline.Data.SeriesUtility = recline.Data.SeriesUtility || {};



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
    var my = recline.Data.SeriesUtility;

    my.createSeries = function (seriesAttr, unselectedColorValue, model, resultTypeValue, groupField, scaleTo100Perc, groupAllSmallSeries) {
        var series = [];

        var fillEmptyValuesWith = seriesAttr.fillEmptyValuesWith;
        var requiredXValues = seriesAttr.requiredXValues;
        
        var unselectedColor = "#C0C0C0";
        if (unselectedColorValue)
            unselectedColor = unselectedColorValue;
        var selectionActive = false;
        if (model.queryState.isSelected())
            selectionActive = true;

        var resultType = "filtered";
        if (resultTypeValue)
            resultType = resultTypeValue;

        var records = model.getRecords(resultType);

        var xfield = model.fields.get(groupField);

	    if (!xfield)
	        throw "data.series.utility.CreateSeries: unable to find field [" + groupField + "] in model [" + model.id + "]";
	
	
	    var uniqueX = [];
	    if (requiredXValues) {
	    	uniqueX = requiredXValues;
	    }
    
        var sizeField;
        if (seriesAttr.sizeField) {
            sizeField = model.fields.get(seriesAttr.sizeField);
            if(!sizeField)
                throw "data.series.utility.CreateSeries: unable to find field [" + seriesAttr.sizeField + "] on model"
        }


        // series are calculated on data, data should be analyzed in order to create series
        if (seriesAttr.type == "byFieldValue") {
            var seriesTmp = {};
            var seriesNameField = model.fields.get(seriesAttr.seriesField);
            var fieldValue = model.fields.get(seriesAttr.valuesField);


            if (!fieldValue) {
                throw "data.series.utility.CreateSeries: unable to find field [" + seriesAttr.valuesField + "] in model [" + model.id + "]";
            }

            if (!seriesNameField) {
                throw "data.series.utility.CreateSeries: unable to find field [" + seriesAttr.seriesField + "] in model [" + model.id + "]";
            }


            _.each(records, function (doc, index) {

                // key is the field that identiy the value that "build" series
                var key = doc.getFieldValueUnrendered(seriesNameField);
                var keyLabel = doc.getFieldValue(seriesNameField);
                var tmpS;

                // verify if the serie is already been initialized
                if (seriesTmp[key] != null) {
                    tmpS = seriesTmp[key]
                }
                else {
                    tmpS = {key:key, label: keyLabel, values:[], field:fieldValue};

                    var color = doc.getFieldColor(seriesNameField);


                    if (color != null)
                        tmpS["color"] = color;


                }
                var shape = doc.getFieldShapeName(seriesNameField);

                var x = doc.getFieldValueUnrendered(xfield);
                var x_formatted = doc.getFieldValue(xfield);

                var y = doc.getFieldValueUnrendered(fieldValue);
                var y_formatted = doc.getFieldValue(fieldValue);
                
                if (y == null || typeof y == "undefined" && fillEmptyValuesWith != null)
            	{
                	y = fillEmptyValuesWith;
                	y_formatted = y
            	}

                if (y != null && typeof y != "undefined" && !isNaN(y)) {

                    var point = {x:x, y:y, record:doc, y_formatted:y_formatted, x_formatted:x_formatted, legendField: seriesNameField.attributes.label || seriesNameField.attributes.id, legendValue: keyLabel };
                    if (sizeField)
                        point["size"] = doc.getFieldValueUnrendered(sizeField);
                    if (shape != null)
                        point["shape"] = shape;

                    tmpS.values.push(point);

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
                //if (seriesAttr.type == "byFieldName")
				//{
                    yfield = model.fields.get(field);
					if(!yfield)
						throw "data.series.utility.CreateSeries: unable to find field [" + field + "] on model"
				//}
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
                        if (y == null || typeof y == "undefined" && fillEmptyValuesWith != null)
                        	y = fillEmptyValuesWith;

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
                    var ret = {values:points, key: recline.Data.Formatters.getFieldLabel(yfield, model.attributes.fieldLabels)};
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
                var tmpValues = _.unique(_.map(s.values, function (d) {
                    return d.x
                }));
                // foreach non present field set the value
                _.each(_.difference(uniqueX, tmpValues), function (diff) {
                    s.values.push({x:diff, y:fillEmptyValuesWith});
                });

            });
        }
        // force sorting of values or scrambled series may generate a wrong chart
        // since there may already be a sorting clause, we must apply to all series the same sort order of the first
        if (series.length > 1)
    	{
        	var sortWeight = [];
        	_.each(series[0].values, function(value, weight) { sortWeight[value.x] = weight+1; })
            _.each(series, function(serie, num) {
            	if (num > 0) // skip first serie
            		serie.values = _.sortBy(serie.values, function(value) { return sortWeight[value.x] || 1000000000 }) 
            })
    	}
        
        if (groupAllSmallSeries)
    	{
        	// must group all small series into one. Note that the original records of the merged series are lost,
        	// so the use of custom tooltips isn't possible at the moment 
        	var mainSeriesCount = groupAllSmallSeries.mainSeriesCount
        	var label = groupAllSmallSeries.labelForSmallSeries || "Other"
        	var seriesKeyTotals = []
        	_.each(series, function(serieObj) {
        		seriesKeyTotals.push({
        			id: seriesKeyTotals.length,
        			key: serieObj.key,
        			total: _.reduce(serieObj.values, function(memo, valueObj) { return memo + valueObj.y; }, 0)
        		})
        	})
        	seriesKeyTotals = _.sortBy(seriesKeyTotals, function(serieObj){ return - serieObj.total; });
        	var newSeries = []
        	var j = 0
        	for (j = 0; j < mainSeriesCount && j < seriesKeyTotals.length; j++)
        		newSeries.push(series[seriesKeyTotals[j].id])

        	if (j < series.length)
    		{
            	var newSerieOther = { key: label, values : []}
            	_.each(series[seriesKeyTotals[j].id].values, function(valueObj) {
            		newSerieOther.values.push({x: valueObj.x, y: valueObj.y})
            	})
            	var totValues = series[0].values.length
            	for (var k = j+1; k < series.length; k++)
            		for (var i = 0; i < totValues; i++)
            			newSerieOther.values[i].y += series[seriesKeyTotals[k].id].values[i].y
            			
            	newSeries.push(newSerieOther)
    		}
        	series = newSeries;
    	}

        if (scaleTo100Perc && series.length)
    	{
        	// perform extra steps to scale the values
        	var tot = series[0].values.length
        	var seriesTotals = []
        	for (var i = 0; i < tot; i++)
        		seriesTotals.push(_.reduce(series, function(memo, serie) { return memo + serie.values[i].y; }, 0))
        		
        	for (var i = 0; i < tot; i++)
        		_.each(series, function(serie) {
        			if (seriesTotals[i]) // avoid divide by zero
    				{
            			serie.values[i].y_orig = serie.values[i].y
            			serie.values[i].y = Math.round(serie.values[i].y_orig/seriesTotals[i]*10000)/100
    				}
        		});
    	}
        return series;
    };
    
    my.createSerieAnnotations = function(model, dateFieldname, textFieldname, series, seriesFieldname, strictPositioning) {
        var annotations = []
    	if (model && dateFieldname && textFieldname)
    	{
        	var dateField = model.fields.get(dateFieldname)
        	if (typeof dateField == "undefined" || dateField == null)
        		throw "data.series.utility.CreateSerieAnnotations: field "+dateFieldname+" not found in model"
        		
        	var textField = model.fields.get(textFieldname)
        	if (typeof textField == "undefined" || textField == null)
        		throw "data.series.utility.CreateSerieAnnotations: field "+textFieldname+" not found in model"

    		_.each(model.getRecords(), function(rec) {
    			var allY = []
    			var timestamp = rec.getFieldValueUnrendered(dateField).valueOf()
    			_.each(series, function(serie, sIndex) {
    				var recordSameTimestamp = _.find(serie.data, function(v) {return v.x == timestamp })
    				if (recordSameTimestamp)
    					allY.push(recordSameTimestamp)
    				else
					{
    					for (var j = 1; j < serie.data.length; j++)
    						if (serie.data[j-1].x < timestamp && serie.data[j].x > timestamp)
							{
    	    					var interpol = d3.scale.linear().domain([serie.data[j-1].x,serie.data[j].x]).range([serie.data[j-1].y,serie.data[j].y])
    							allY.push({y: interpol(timestamp), serie: sIndex})
    							break;
							}
					}
    			})
    			var maxY = _.max(allY, function(curr){ return curr.y; });
    			if (maxY)
				{
        			var annotationAtSameTime = _.find(annotations, function(ann) { return ann.x == timestamp });
        			if (annotationAtSameTime)
        				annotationAtSameTime.text += "<br>"+rec.getFieldValue(textField)
        			else
        			{
        				var i = annotations.length 
            			var letter = String.fromCharCode(i % 27 +65);
            			if (i > 26)
            				letter += Math.floor(i/27)

            			var serieId = -1;
            			if (!strictPositioning) {
            				serieId = maxY.serie || 0;	
            			}
            			var currY = maxY.y || 0;
            			if (seriesFieldname)
        				{
            				var seriesField = model.fields.get(seriesFieldname)
            				var seriesValue = rec.getFieldValueUnrendered(seriesField);
            				for(var jj = 0 ; jj < series.length; jj++)
            					if (series[jj].name == seriesValue){
            						serieId = jj;
            						break;
            					}
            						
        				}
            			if (strictPositioning && serieId == -1 && series.length == 1 && series[0].name == "_ALL_"){
            				// we are in the case that strictPositioning has been required and only series ALL is plotted. So we put the annotation on ALL series
            				serieId = 0;
            				annotations.push({x: timestamp, text: rec.getFieldValue(textField), letter: letter, y: currY, serie: serieId })
            			} else if (serieId >= 0){
            				var foundSeries = false;
                			_.find(allY, function(a){ 
                				if(a.legendValue == series[serieId].label) {
                					currY = a.y;
                					foundSeries = true;
                				}
                			});
                			if ((strictPositioning && foundSeries) || !strictPositioning){
                				annotations.push({x: timestamp, text: rec.getFieldValue(textField), letter: letter, y: currY, serie: serieId })	
                			}	
            			}
            			
            			
            			
        			} 
				}
    		})
    		_.each(series, function(serie, sIndex) {
    			serie.annotations = _.filter(annotations, function(ann) { return ann.serie == sIndex }) 
    		})
    	}
    }

});
