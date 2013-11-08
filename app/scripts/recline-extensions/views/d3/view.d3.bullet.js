define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'd3', 'mustache'], function ($, recline, d3, Mustache) {

    recline.View = recline.View || {};

    var view = recline.View;

    "use strict";

    view.D3Bullet = Backbone.View.extend({
        template: '<div id="{{uid}}" style="width: {{width}}px; height: {{height}}px;">',
        firstResizeDone: false,
        initialize:function (options) {

            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw', 'resize');

            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

        	$(window).resize(this.resize);
            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart
            if (options.width)
            	this.width = options.width;
            else this.width = "100"
            if (options.height)
            	this.height = options.height;
            else this.height = "100"
            	
            if (!this.options.animation) {
                this.options.animation = {
                    duration:2000,
                    delay:200
                }
            }

            //render header & svg container
            var out = Mustache.render(this.template, this);
            this.el.html(out);
        },

        resize:function () {
        	this.firstResizeDone = true;
        	var currH = $("#"+this.uid).height()
        	var currW = $("#"+this.uid).width()
        	var $parent = this.el
        	var newH = $parent.height()
        	var newW = $parent.width()
        	if (typeof this.options.width == "undefined")
    		{
            	$("#"+this.uid).width(newW)
            	this.width = newW
    		}
        	if (typeof this.options.height == "undefined")
    		{
	        	$("#"+this.uid).height(newH)
	        	this.height = newH
    		}
        	this.redraw();
        },

        render:function () {
            var self = this;
            var graphid = "#" + this.uid;

            if (self.graph)
                jQuery(graphid).empty();

            self.graph = d3.select(graphid);
            
            if (!self.firstResizeDone)
            	self.resize();
        },

        redraw:function () {
            var self = this;

            var type;
            if(this.options.resultType) {
                type = this.options.resultType;
            }

            var records = _.map(this.options.model.getRecords(type), function (record) {
                var ranges = [];
                _.each(self.options.fieldRanges, function (f) {
                    var field = (type ? self.model[type].fields.get(f) : self.model.fields.get(f));
                    ranges.push(record.getFieldValueUnrendered(field));
                });
                var measures = [];
                _.each(self.options.fieldMeasures, function (f) {
                    var field = (type ? self.model[type].fields.get(f) : self.model.fields.get(f));
                    measures.push(record.getFieldValueUnrendered(field));
                });
                var markers = [];
                _.each(self.options.fieldMarkers, function (f) {
                    var field = (type ? self.model[type].fields.get(f) : self.model.fields.get(f));
                    markers.push(record.getFieldValueUnrendered(field));
                });
                return {ranges:ranges, measures:measures, markers: markers, customTicks: self.options.customTicks, tickFormat: self.options.tickFormat };
            });

            var margin = {top: 5, right: 40, bottom: 40, left: 40};
            var width = self.width - margin.left - margin.right;
            var height = self.height - margin.top - margin.bottom;
            if (width < 0)
            	width = 0;

            if (height < 0)
            	height = 0;

            self.plugin();



            this.chart = d3.bullet()
                .width(width)
                .height(height);

            this.drawD3(records, width, height, margin);
       },

        drawD3:function (data, width, height, margin) {
            var self = this;

            self.graph
                .selectAll(".bullet")
                .remove();

            self.graph.selectAll(".bullet")
                .data(data)
                .enter().append("svg")
                .attr("class", "bullet")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(self.chart);

            self.alreadyDrawed = true

            /*var title = svg.append("g")
             .style("text-anchor", "end")
             .attr("transform", "translate(-6," + height / 2 + ")");

             title.append("text")
             .attr("class", "title")
             .text(function(d) { return d.title; });

             title.append("text")
             .attr("class", "subtitle")
             .attr("dy", "1em")
             .text(function(d) { return d.subtitle; });
              */
        },
        plugin:function () {
            d3.bullet = function () {
                var orient = "left", // TODO top & bottom
                    reverse = false,
                    duration = 0,
                    ranges = bulletRanges,
                    markers = bulletMarkers,
                    measures = bulletMeasures,
                    width = 380,
                    height = 30,
                    tickFormat = bulletTickFormat,
                	customTicks = bulletCustomTicks;

                // For each small multiple
                function bullet(g) {
                    g.each(function (d, i) {
                        var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
                            markerz = markers.call(this, d, i).slice().sort(d3.descending),
                            measurez = measures.call(this, d, i).slice().sort(d3.descending),
                            customTickz = customTicks.call(this, d, i),
                            tickFormatz = tickFormat.call(this, d, i),
                            g = d3.select(this);

                        // Compute the new x-scale.
                        var x1 = d3.scale.linear()
                            .domain([0, Math.max(rangez[0], markerz[0], measurez[0])])
                            .range(reverse ? [width, 0] : [0, width]);

                        // Retrieve the old x-scale, if this is an update.
                        var x0 = this.__chart__ || d3.scale.linear()
                            .domain([0, Infinity])
                            .range(x1.range());

                        // Stash the new scale.
                        this.__chart__ = x1;

                        // Derive width-scales from the x-scales.
                        var w0 = bulletWidth(x0),
                            w1 = bulletWidth(x1);

                        // Update the range rects.
                        var range = g.selectAll("rect.range")
                            .data(rangez);

                        range.enter().append("rect")
                            .attr("class", function (d, i) {
                                return "range s" + i;
                            })
                            .attr("width", w0)
                            .attr("height", height)
                            .attr("x", reverse ? x0 : 0)
                            .transition()
                            .duration(duration)
                            .attr("width", w1)
                            .attr("x", reverse ? x1 : 0);

                        range.transition()
                            .duration(duration)
                            .attr("x", reverse ? x1 : 0)
                            .attr("width", w1)
                            .attr("height", height);

                        // Update the measure rects.
                        var measure = g.selectAll("rect.measure")
                            .data(measurez);

                        measure.enter().append("rect")
                            .attr("class", function (d, i) {
                                return "measure s" + i;
                            })
                            .attr("width", w0)
                            .attr("height", function (d, i) { return height / (i*4+3); })
                            .attr("x", reverse ? x0 : 0)
                            .attr("y", function (d, i) { return (height / 3.0 - height / (i*4+3.0)) /2.0 + height / 3.0; })
                            .transition()
                            .duration(duration)
                            .attr("width", w1)
                            .attr("x", reverse ? x1 : 0);

                        measure.transition()
                            .duration(duration)
                            .attr("width", w1)
                            .attr("height", function (d, i) { return height / (i*4+3); })
                            .attr("x", reverse ? x1 : 0)
                            .attr("y", function (d, i) { return (height / 3.0 - height / (i*4+3.0)) /2.0 + height / 3.0; });

                        // Update the marker lines.
                        var marker = g.selectAll("line.marker")
                            .data(markerz);

                        marker.enter().append("line")
                            .attr("class", "marker")
                            .attr("x1", x0)
                            .attr("x2", x0)
                            .attr("y1", height / 6)
                            .attr("y2", height * 5 / 6)
                            .transition()
                            .duration(duration)
                            .attr("x1", x1)
                            .attr("x2", x1);

                        marker.transition()
                            .duration(duration)
                            .attr("x1", x1)
                            .attr("x2", x1)
                            .attr("y1", height / 6)
                            .attr("y2", height * 5 / 6);

                        var format = tickFormatz || x1.tickFormat(8);

                        // Update the tick groups.
                        var tick = g.selectAll("g.tick")
                            .data(x1.ticks(8), function (d) {
                                return this.textContent || format(d);
                            });
                        
                        // Initialize the ticks with the old scale, x0.
                        var tickEnter = tick.enter().append("g")
                            .attr("class", "tick")
                            .attr("transform", bulletTranslate(x0))
                            .style("opacity", 1e-6);

                        var idx = -1;
                        var customFormat = function() {
                        	if (customTickz && customTickz[++idx])
                        		return customTickz[idx];
                        	else return ""
                        }

                        tickEnter.append("line")
                            .attr("y1", height)
                            .attr("y2", height * 7 / 6);

                        tickEnter.append("text")
                            .attr("text-anchor", "middle")
                            .attr("dy", "1em")
                            .attr("y", height * 7 / 6)
                            .text((customTickz ? customFormat: format));

                        // Transition the entering ticks to the new scale, x1.
                        tickEnter.transition()
                            .duration(duration)
                            .attr("transform", bulletTranslate(x1))
                            .style("opacity", 1);

                        // Transition the updating ticks to the new scale, x1.
                        var tickUpdate = tick.transition()
                            .duration(duration)
                            .attr("transform", bulletTranslate(x1))
                            .style("opacity", 1);

                        tickUpdate.select("line")
                            .attr("y1", height)
                            .attr("y2", height * 7 / 6);

                        tickUpdate.select("text")
                            .attr("y", height * 7 / 6);

                        // Transition the exiting ticks to the new scale, x1.
                        tick.exit().transition()
                            .duration(duration)
                            .attr("transform", bulletTranslate(x1))
                            .style("opacity", 1e-6)
                            .remove();
                    });
                    d3.timer.flush();
                }

                // left, right, top, bottom
                bullet.orient = function (x) {
                    if (!arguments.length) return orient;
                    orient = x;
                    reverse = orient == "right" || orient == "bottom";
                    return bullet;
                };

                // ranges (bad, satisfactory, good)
                bullet.ranges = function (x) {
                    if (!arguments.length) return ranges;
                    ranges = x;
                    return bullet;
                };

                // markers (previous, goal)
                bullet.markers = function (x) {
                    if (!arguments.length) return markers;
                    markers = x;
                    return bullet;
                };

                // measures (actual, forecast)
                bullet.measures = function (x) {
                    if (!arguments.length) return measures;
                    measures = x;
                    return bullet;
                };

                bullet.width = function (x) {
                    if (!arguments.length) return width;
                    width = x;
                    return bullet;
                };

                bullet.height = function (x) {
                    if (!arguments.length) return height;
                    height = x;
                    return bullet;
                };

                bullet.tickFormat = function (x) {
                    if (!arguments.length) return tickFormat;
                    tickFormat = x;
                    return bullet;
                };

                bullet.customTicks = function (x) {
                    if (!arguments.length) return customTicks;
                    customTicks = x;
                    return bullet;
                };

                bullet.duration = function (x) {
                    if (!arguments.length) return duration;
                    duration = x;
                    return bullet;
                };

                
                return bullet;
            };

            function bulletTickFormat(d) {
                return d.tickFormat;
            }

            function bulletCustomTicks(d) {
                return d.customTicks;
            }

            function bulletRanges(d) {
                return d.ranges;
            }

            function bulletMarkers(d) {
                return d.markers;
            }

            function bulletMeasures(d) {
                return d.measures;
            }

            function bulletTranslate(x) {
                return function (d) {
                    return "translate(" + x(d) + ",0)";
                };
            }

            function bulletWidth(x) {
                var x0 = x(0);
                return function (d) {
                    return Math.abs(x(d) - x0);
                };
            }
        }




    });
    return view.D3Bullet;

});