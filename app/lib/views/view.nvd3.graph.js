/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function ($, my) {

// ## Linegraph view for a Dataset using nvd3 graphing library.
//
// Initialization arguments (in a hash in first parameter):
//
// * model: recline.Model.Dataset
// * state: (optional) configuration hash of form:
//
//        { 
//          group: {column name for x-axis},
//          series: [{column name for series A}, {column name series B}, ... ],
//          colors: ["#edc240", "#afd8f8", ...]
//        }
//
// NB: should *not* provide an el argument to the view but must let the view
// generate the element itself (you can then append view.el to the DOM.
    my.NVD3Graph = Backbone.View.extend({

        template:'<div class="recline-graph"> \
      <div class="panel nvd3graph_{{viewId}}"style="display: block;"> \
        <div id="nvd3chart_{{viewId}}"><svg class="bstrap"></svg></div>\
      </div> \
    </div> ',

        initialize:function (options) {
            var self = this;

            this.uid = options.id || ("" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart
            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw', 'graphResize', 'changeDimensions');


            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);
            this.model.bind('dimensions:change', this.changeDimensions);


            var stateData = _.extend({
                    group:null,
                    seriesNameField:[],
                    seriesValues:[],
                    colors:["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
                    graphType:"lineChart",
                    xLabel:"",
                    id:0



                },
                options.state
            );
            this.state = new recline.Model.ObjectState(stateData);


        },

        changeDimensions: function() {
            var self=this;
            self.state.attributes.group = self.model.getDimensions();
        },

        render:function () {
            var self = this;

            var tmplData = this.model.toTemplateJSON();
            tmplData["viewId"] = this.uid;

            delete this.chart;


            var htmls = Mustache.render(this.template, tmplData);
            $(this.el).html(htmls);
            this.$graph = this.el.find('.panel.nvd3graph_' + tmplData["viewId"]);
            return this;
        },

        getActionsForEvent:function (eventType) {
            var actions = [];

            _.each(this.options.actions, function (d) {
                if (_.contains(d.event, eventType))
                    actions.push(d);
            });

            return actions;
        },

        redraw:function () {

            var self = this;

            var state = this.state;
            var seriesNVD3 = this.createSeriesNVD3();

            var graphType = this.state.get("graphType");

            var viewId = this.uid;

            var model = this.model;
            var state = this.state;
            var xLabel = this.state.get("xLabel");
            var yLabel = this.state.get("yLabel");


            nv.addGraph(function () {
                self.chart = self.getGraph[graphType](self);

                if (self.state.attributes.options) {
                    _.each(_.keys(self.state.attributes.options), function (d) {
                        try {
                            self.addOption[d](self.chart, self.state.attributes.options[d]);
                        }
                        catch (err) {
                            console.log("view.nvd3.graph.js: cannot add options " + d + " for graph type " + graphType)
                        }
                    });
                }
                ;

                d3.select('#nvd3chart_' + self.uid + '  svg')
                    .datum(seriesNVD3)
                    .transition()
                    .duration(500)
                    .call(self.chart);

                nv.utils.windowResize(self.graphResize);
                nv.utils.windowResize(self.graphResize);
                //self.graphResize()
                return  self.chart;
            });
        },

        graphResize:function () {
            var self = this;
            var viewId = this.uid;

            // this only works by previously setting the body height to a numeric pixel size (percentage size don't work)
            // so we assign the window height to the body height with the command below
            var container = self.el;
            while (!container.hasClass('container-fluid') && !container.hasClass('container'))
            	container = container.parent();
            
            if (typeof container != "undefined" && container != null 
            		&& (container.hasClass('container') || container.hasClass('container-fluid'))
            		&& container[0].style && container[0].style.height
            		&& container[0].style.height.indexOf("%") > 0) 
            {
	            $("body").height($(window).innerHeight() - 10);
	
	            var currAncestor = self.el;
	            while (!currAncestor.hasClass('row-fluid') && !currAncestor.hasClass('row'))
	                currAncestor = currAncestor.parent();
	
	            if (typeof currAncestor != "undefined" && currAncestor != null && (currAncestor.hasClass('row-fluid') || currAncestor.hasClass('row'))) {
	                var newH = currAncestor.height();
	                $('#nvd3chart_' + viewId).height(newH);
	                $('#nvd3chart_' + viewId + '  svg').height(newH);
	            }
            }
            self.chart.update(); // calls original 'update' function
        },


        setAxis:function (axis, chart) {
            var self = this;

            var xLabel = self.state.get("xLabel");

            if (axis == "all" || axis == "x") {
                var xfield = self.model.fields.get(self.state.attributes.group);

                // set label
                if (xLabel == null || xLabel == "" || typeof xLabel == 'undefined')
                    xLabel = xfield.get('label');

                // set data format
                chart.xAxis
                    .axisLabel(xLabel)
                    .tickFormat(self.getFormatter[xfield.get('type')]);

            } else if (axis == "all" || axis == "y") {
                var yLabel = self.state.get("yLabel");

                if (yLabel == null || yLabel == "" || typeof yLabel == 'undefined')
                    yLabel = self.state.attributes.seriesValues.join("/");

                // todo yaxis format must be passed as prop
                chart.yAxis
                    .axisLabel(yLabel)
                    .tickFormat(d3.format('s'));
            }
        },

        getFormatter:{
            "string":d3.format(',s'),
            "float":d3.format(',r'),
            "integer":d3.format(',r'),
            "date":function (d) {
                return d3.time.format('%x')(new Date(d));
            }

        },

        addOption:{
            "staggerLabels":function (chart, value) {
                chart.staggerLabels(value);
            },
            "tooltips":function (chart, value) {
                chart.tooltips(value);
            },
            "showValues":function (chart, value) {
                chart.showValues(value);
            },
            "tooltip": function(chart, value) {
                var t = function(key, x, y, e, graph) {
                    return value.replace("{x}", x)
                        .replace("{y}", y)
                        .replace("{key}", key);
                };
                chart.tooltip(t);
            },
            "minmax":function () {
            },
            "trendlines":function () {
            }

        },


        getGraph:{
            "multiBarChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.multiBarChart();

                view.setAxis("all", chart);
                return chart;
            },
            "lineChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.lineChart();
                view.setAxis("all", chart);
                return chart;
            },
            "lineWithFocusChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.lineWithFocusChart();

                view.setAxis("all", chart);
                return chart;
            },
            "indentedTree":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.indentedTree();
            },
            "stackedAreaChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.stackedAreaChart();
                view.setAxis("all", chart);
                return chart;
            },

            "historicalBar":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.historicalBar();
                return chart;
            },
            "multiBarHorizontalChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.multiBarHorizontalChart();
                view.setAxis("all", chart);

                return chart;
            },
            "multiBarHorizontalChart2":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.multiBarHorizontalChart();
                
                // remove ticks on Y axis (NOTE Y axis ticks are on xAxis for this chart type)
                chart.xAxis.tickFormat(function (d) { return ''; });

                return chart;
            },
            "legend":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.legend();
                return chart;
            },
            "line":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.line();
                return chart;
            },
            "sparkline":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.sparkline();
                return chart;
            },
            "sparklinePlus":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.sparklinePlus();
                return chart;
            },

            "multiChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.multiChart();
                return chart;
            },


            "bulletChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.bulletChart();
                return chart;
            },
            "linePlusBarChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.linePlusBarChart();
                view.setAxis("all", chart);
                return chart;
            },
            "cumulativeLineChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.cumulativeLineChart();
                view.setAxis("all", chart);
                return chart;
            },
            "scatterChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.scatterChart();
                chart.showDistX(true)
                    .showDistY(true);
                view.setAxis("all", chart);
                return chart;
            },
            "discreteBarChart":function (view) {
                var actions = view.getActionsForEvent("selection");
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.discreteBarChart();
                view.setAxis("all", chart);

                if (actions.length > 0)
                    chart.discretebar.dispatch.on('elementClick', function (e) {
                        view.doActions(actions, [e.point.record]);
                    });
                return chart;
                var actions = view.getActionsForEvent("selection");
                var options = {};

                if (view.state.attributes.options) {
                    if (view.state.attributes.options("trendlines"))
                        options["trendlines"] = view.state.attributes.options("trendlines");
                    if (view.state.attributes.options("minmax"))
                        options["minmax"] = view.state.attributes.options("minmax");

                }


                if (actions.length > 0) {
                    options["callback"] = function (x) {

                        // selection is done on x axis so I need to take the record with range [min_x, max_x]
                        // is the group attribute
                        var record_min = _.min(x, function (d) {
                            return d.min.x
                        });
                        var record_max = _.max(x, function (d) {
                            return d.max.x
                        });

                        view.doActions(actions, [record_min.min.record, record_max.max.record]);

                    };
                } else
                    options["callback"] = function () {
                    };
            },
            "lineWithBrushChart":function (view) {


                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.lineWithBrushChart(options);
                view.setAxis("all", chart);
                return  chart
            },
            "multiBarWithBrushChart":function (view) {
                var actions = view.getActionsForEvent("selection");
                var options = {};

                if (view.state.attributes.options) {
                    if (view.state.attributes.options("trendlines"))
                        options["trendlines"] = view.state.attributes.options("trendlines");
                    if (view.state.attributes.options("minmax"))
                        options["minmax"] = view.state.attributes.options("minmax");

                }

                if (actions.length > 0) {
                    options["callback"] = function (x) {

                        // selection is done on x axis so I need to take the record with range [min_x, max_x]
                        // is the group attribute
                        var record_min = _.min(x, function (d) {
                            return d.min.x
                        });
                        var record_max = _.max(x, function (d) {
                            return d.max.x
                        });

                        view.doActions(actions, [record_min.min.record, record_max.max.record]);

                    };
                } else
                    options["callback"] = function () {
                    };

                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.multiBarWithBrushChart(options);

                return chart;
            },

            "pieChart":function (view) {
                var chart;
                if (view.chart != null)
                    chart = view.chart;
                else
                    chart = nv.models.pieChart();

                chart.values(function(d) {
                    var ret=[];
                    _.each(d.values, function(dd) {
                        ret.push({x: dd.x, y:dd.y});
                    });
                    return ret;
                });

                return chart;
            }

        },


        doActions:function (actions, records) {

            _.each(actions, function (d) {
                d.action.doAction(records, d.mapping);
            });

        },

        getFieldLabel: function(field){
            var self=this;
            var fieldLabel = field.attributes.label;
            if (field.attributes.is_partitioned)
                fieldLabel = field.attributes.partitionValue;

            if (typeof self.state.attributes.fieldLabels != "undefined" && self.state.attributes.fieldLabels != null) {
                var fieldLabel_alternateObj = _.find(self.state.attributes.fieldLabels, function (fl) {
                    return fl.id == fieldLabel
                });
                if (typeof fieldLabel_alternateObj != "undefined" && fieldLabel_alternateObj != null)
                    fieldLabel = fieldLabel_alternateObj.label;
            }

            return fieldLabel;
        },


        createSeriesNVD3:function () {

            var self = this;
            var series = [];

            //  {type: "byFieldName", fieldvaluesField: ["y", "z"]}
            var seriesAttr = this.state.attributes.series;

            var fillEmptyValuesWith = seriesAttr.fillEmptyValuesWith;

            //var seriesNameField = self.model.fields.get(this.state.attributes.seriesNameField) ;
            //var seriesValues = self.model.fields.get(this.state.attributes.seriesValues);
            //if(seriesValues == null)
            //var seriesValues = this.state.get("seriesValues") ;

            var xAxisIsDate = false;
            var unselectedColor = "#C0C0C0";
            if (self.state.attributes.unselectedColor)
                unselectedColor = self.state.attributes.unselectedColor;
            var selectionActive = false;
            if (self.model.queryState.isSelected())
                selectionActive = true;

            var resultType = "filtered";
            if(self.options.resultType !== null)
                resultType = self.options.resultType;

            var records = self.model.getRecords(resultType);  //self.model.records.models;

            var xfield = self.model.fields.get(self.state.attributes.group);
            if(!xfield)
                throw "View.nvd3: unable to find field [" + self.state.attributes.group + "] on model"

            if (xfield.get('type') === 'date') {
                xAxisIsDate = true;
            }

            var uniqueX = [];
            var sizeField;
            if (seriesAttr.sizeField) {
                sizeField = self.model.fields.get(seriesAttr.sizeField);

                if(!sizeField)
                    throw "View.nvd3: unable to find field [" + seriesAttr.sizeField + "] on model"
            }


            // series are calculated on data, data should be analyzed in order to create series
            if (seriesAttr.type == "byFieldValue") {
                var seriesTmp = {};
                var seriesNameField = self.model.fields.get(seriesAttr.seriesField);
                if(!seriesNameField)
                    throw "View.nvd3: unable to find field [" + seriesAttr.seriesField + "] on model"

                var fieldValue = self.model.fields.get(seriesAttr.valuesField);
                if(!fieldValue)
                    throw "View.nvd3: unable to find field [" + seriesAttr.valuesField + "] on model"


                _.each(records, function (doc, index) {

                    // key is the field that identiy the value that "build" series
                    var key = doc.getFieldValueUnrendered(seriesNameField);
                    var tmpS;

                    // verify if the serie is already been initialized
                    if (seriesTmp[key] != null) {
                        tmpS = seriesTmp[key]
                    }
                    else {
                        tmpS = {key:key, values:[]};

                        var color = doc.getFieldColor(seriesNameField);

                        if (color != null)
                            tmpS["color"] = color;


                    }
                    var shape = doc.getFieldShapeName(seriesNameField);

                    var x = doc.getFieldValueUnrendered(xfield);
                    var y = doc.getFieldValueUnrendered(fieldValue);


                    var point = {x:x, y:y, record:doc};
                    if (sizeField)
                        point["size"] = doc.getFieldValueUnrendered(sizeField);
                    if(shape != null)
                        point["shape"] = shape;

                    tmpS.values.push(point);

                    if (fillEmptyValuesWith != null) {
                        uniqueX.push(x);

                    }

                    seriesTmp[key] = tmpS;

                });

                for (var j in seriesTmp) {
                    series.push(seriesTmp[j]);
                }

            }
            else if (seriesAttr.type == "byFieldName" || seriesAttr.type == "byPartitionedField") {
                var serieNames;

                // if partitions are active we need to retrieve the list of partitions
                if (seriesAttr.type == "byFieldName")
                    serieNames = seriesAttr.valuesField;
                else {
                    serieNames = [];
                    _.each(seriesAttr.aggregationFunctions, function (a) {
                        _.each(self.model.getPartitionedFieldsForAggregationFunction(a, seriesAttr.aggregatedField), function (f) {
                            serieNames.push(f.get("id"));
                        })

                    });

                }

                _.each(serieNames, function (field) {
                    var yfield = self.model.fields.get(field);

                    if(!yfield)
                        throw "View.nvd3: unable to find field [" + field + "] on model"

                    var points = [];

                    _.each(records, function (doc, index) {

                        var x = doc.getFieldValueUnrendered(xfield);

                        try {

                            var y = doc.getFieldValueUnrendered(yfield);
                            if (y != null) {
                                var color;

                                if (selectionActive) {
                                    if (doc.isRecordSelected())
                                        color = doc.getFieldColor(yfield);
                                    else
                                        color = unselectedColor;
                                } else
                                    color = doc.getFieldColor(yfield);

                                var shape = doc.getFieldShapeName(yfield);

                                var point = {x:x, y:y, record:doc};

                                if(color != null)
                                    point["color"] = color;
                                if(shape != null)
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

                    if (points.length > 0)
                        series.push({values:points, key:self.getFieldLabel(yfield), color:yfield.getColorForPartition()});
                });

            } else throw "views.nvd3.graph.js: unsupported or not defined type " + seriesAttr.type;

            // foreach series fill empty values
            if (fillEmptyValuesWith != null) {
                uniqueX = _.unique(uniqueX);
                _.each(series, function (s) {
                    // foreach series obtain the unique list of x
                    var tmpValues = _.map(s.values, function (d) {
                        return d.x
                    });
                    // foreach non present field set the value
                    _.each(_.difference(uniqueX, tmpValues), function (diff) {
                        s.values.push({x:diff, y:fillEmptyValuesWith});
                    });

                });
            }

            return series;
        }


    });


})(jQuery, recline.View);

