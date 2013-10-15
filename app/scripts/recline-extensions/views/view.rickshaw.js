define(['jquery', 'recline-extensions-amd', 'mustache', 'rickshaw'], function ($, recline, Mustache, Rickshaw) {

    recline.View = recline.View || {};

    var view = recline.View;

    "use strict";

    view.Rickshaw = Backbone.View.extend({
        template:'<div id="{{uid}}"> <div> ',

        initialize:function (options) {

            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw');


            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.listenTo(this.model.records, 'add', this.addRecords);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart

            this.options = options;


        },

        render:function () {
            console.log("View.Rickshaw: render");
            var self = this;

            var graphid = "#" + this.uid;

            if (self.graph) {
                jQuery(graphid).empty();
                delete self.graph;
            }

            var out = Mustache.render(this.template, this);
            this.el.html(out);


        },

        redraw:function () {
            var self = this;

            console.log("View.Rickshaw: redraw");


            if (self.graph)
                self.updateGraph();
            else
                self.renderGraph();

        },
        updateGraph:function () {
            var self = this;
            //self.graphOptions.series = this.createSeries();
            self.createSeries();

            self.graph.update();
            //self.graph.render();
        },
        convertDateValueWithoutMillis:function(value) {
    		return Math.round(value.valueOf()/1000);
        },

        renderGraph:function () {
            var self = this;
            this.graphOptions = {
                element:document.querySelector('#' + this.uid),
                width: self.options.width,
                height: self.options.height
            };

            self.graphOptions = _.extend(self.graphOptions, self.options.state.options);


            var resultType = "filtered";
            if (self.options.resultType !== null)
                resultType = self.options.resultType;

            var records = self.model.getRecords(resultType);

            if (!self.series)
                self.series = [];
            else
                self.series.length = 0; // keep reference to old serie

            var series = self.series;

            self.createSeries(records, series);


            if (self.series.length == 0)
            	return;

            self.graphOptions.series = self.series;

            self.graph = new Rickshaw.Graph(self.graphOptions);

            if (self.options.state.unstack) {
                self.graph.renderer.unstack = true;
            }


            self.graph.render();

            var hoverDetailOpt = { graph:self.graph };
            hoverDetailOpt = _.extend(hoverDetailOpt, self.options.state.hoverDetailOpt);


            var hoverDetail = new Rickshaw.Graph.HoverDetail(hoverDetailOpt);

            var xAxisOpt = { graph:self.graph };
            xAxisOpt = _.extend(xAxisOpt, self.options.state.xAxisOptions);


            var xAxis = new Rickshaw.Graph.Axis.Time(xAxisOpt);


            xAxis.render();

            var yAxis = new Rickshaw.Graph.Axis.Y({
                graph:self.graph
            });


            yAxis.render();

            if (self.options.state.events) {

                self.annotator = new Rickshaw.Graph.Annotate({
                    graph:self.graph,
                    element:document.getElementById(self.options.state.events.div || 'timeline')
                });

                var timeField = self.options.state.events.timeField;
                var valueField = self.options.state.events.valueField;
                var endField = self.options.state.events.endField;


                _.each(self.options.state.events.dataset.getRecords(self.options.state.events.resultType), function (d) {
                    if (endField)
                        self.annotator.add(self.convertDateValueWithoutMillis(d.attributes[timeField]), d.attributes[valueField], self.convertDateValueWithoutMillis(d.attributes[endField]));
                    else
                        self.annotator.add(self.convertDateValueWithoutMillis(d.attributes[timeField]), d.attributes[valueField]);

                })

                self.annotator.update()

            }

            if (self.options.state.legend) {
                var legend = new Rickshaw.Graph.Legend({
                    graph:self.graph,
                    element:document.querySelector('#' + self.options.state.legend)
                });

                var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                    graph:self.graph,
                    legend:legend
                });

                var order = new Rickshaw.Graph.Behavior.Series.Order({
                    graph:self.graph,
                    legend:legend
                });

                var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
                    graph:self.graph,
                    legend:legend
                });
            }

        },

        addRecords: function(model) {
            var self= this;
            var series = [];
            this.createSeries([model], series);

            _.each(series, function(c, index) {
                _.each(c.data, function(d) {
                    self.series[index].data.push(d);
                });
            });


            self.graph.update();
        },

        createSeries:function (records, series) {
            var self = this;

            var seriesAttr = this.options.state.series;

            var fillEmptyValuesWith = seriesAttr.fillEmptyValuesWith;

            var unselectedColor = "#C0C0C0";
            if (self.options.state.unselectedColor)
                unselectedColor = self.options.state.unselectedColor;
            var selectionActive = false;
            if (self.model.queryState.isSelected())
                selectionActive = true;



            var xfield = self.model.fields.get(self.options.state.group);


            var uniqueX = [];
            var sizeField;
            if (seriesAttr.sizeField) {
                sizeField = self.model.fields.get(seriesAttr.sizeField);
            }


            // series are calculated on data, data should be analyzed in order to create series
            if (seriesAttr.type == "byFieldValue") {
                var seriesTmp = {};
                var seriesNameField = self.model.fields.get(seriesAttr.seriesField);
                var fieldValue = self.model.fields.get(seriesAttr.valuesField);


                if (!fieldValue) {
                    throw "view.rickshaw: unable to find field [" + seriesAttr.valuesField + "] in model"
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
                    var x;
                    if (xfield.attributes.type == "date")
                        x = Math.floor(doc.getFieldValueUnrendered(xfield) / 1000); // rickshaw don't use millis
                    else
                        x = doc.getFieldValueUnrendered(xfield);

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
                        _.each(self.model.getPartitionedFieldsForAggregationFunction(a, seriesAttr.aggregatedField), function (f) {
                            serieNames.push(f.get("id"));
                        })

                    });

                }

                _.each(serieNames, function (field) {

                    var yfield;
                    if (seriesAttr.type == "byFieldName" && field.fieldName)
                        yfield = self.model.fields.get(field.fieldName);
                    else
                        yfield = self.model.fields.get(field);

                    var fixedColor;
                    if (field.fieldColor)
                        fixedColor = field.fieldColor;

                    var points = [];

                    _.each(records, function (doc, index) {
                        var x;
                        if (xfield.attributes.type == "date")
                            x = Math.floor(doc.getFieldValueUnrendered(xfield) / 1000); // rickshaw don't use millis
                        else
                            x = doc.getFieldValueUnrendered(xfield);

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
                        var ret = {data:points, name:self.getFieldLabel(yfield)};
                        if (color)
                            ret["color"] = color;
                        series.push(ret);
                    }

                });

            } else throw "views.rickshaw.graph.js: unsupported or not defined type " + seriesAttr.type;

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


        },
        getFieldLabel:function (field) {
            var self = this;
            var fieldLabel = field.attributes.label;
            if (field.attributes.is_partitioned)
                fieldLabel = field.attributes.partitionValue;

            if (typeof self.options.state.fieldLabels != "undefined" && self.options.state.fieldLabels != null) {
                var fieldLabel_alternateObj = _.find(self.state.attributes.fieldLabels, function (fl) {
                    return fl.id == fieldLabel
                });
                if (typeof fieldLabel_alternateObj != "undefined" && fieldLabel_alternateObj != null)
                    fieldLabel = fieldLabel_alternateObj.label;
            }

            return fieldLabel;
        }


    });

    return view.Rickshaw;
});