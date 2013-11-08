define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'd3', 'mustache'], function ($, recline, d3, Mustache) {

    recline.View = recline.View || {};

    var view = recline.View;

    "use strict";

    view.D3Chord = Backbone.View.extend({
        template: '<div id="{{uid}}" style="width: {{width}}px; height: {{height}}px;"></div>',

        initialize: function (options) {

            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw');

            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart


            this.width = options.width;
            this.height = options.height;


            var out = Mustache.render(this.template, this);
            this.el.html(out);
        },

        render: function () {
            var self = this;
            self.trigger("chart:startDrawing")
            var graphid = "#" + this.uid;

            if (self.graph) {
                jQuery(graphid).empty();
            }

            self.graph = d3.select(graphid);
            self.trigger("chart:endDrawing")
        },


        redraw: function () {
            if (!this.visible) {
                return
            }

            var self = this;
            self.trigger("chart:startDrawing")
            var state = self.options.state;

            var type;
            if (this.options.resultType) {
                type = this.options.resultType;
            }

            var nodes_map = {};
            var nodes = [];
            var size = 0;
            var matrix = [];

            var valueField = this.options.model.fields.get(state.valueField);
            if (!valueField)
                throw "d3.chord.js: unable to fiend field [" + state.valueField + "] in model";
            

            _.each(this.options.model.getRecords(type), function (record) {
                var i = nodes_map[record.attributes[state.startField]];


                if (i == null) {
                     nodes_map[record.attributes[state.startField]] = size;
                    i = size;

                    nodes[size] = record.attributes[state.startField];
                    size++;

                }
                var j = nodes_map[record.attributes[state.endField]];
                if (j == null) {
                    j = size;
                    nodes_map[record.attributes[state.endField]] = size;
                    nodes[size] = record.attributes[state.endField];
                    size++;

                }

                if (!matrix[i])
                    matrix[i] = [];


                matrix[i][j] = record.getFieldValueUnrendered(valueField);
            });

            for (var i = 0; i < size; i++) {
                for (var j = 0; j < size; j++) {
                    if (!matrix[i])
                        matrix[i] = [];

                    if (!matrix[i][j])
                        matrix[i][j] = 0;
                }
            }

            self.graph = d3.select("#" + self.uid);

            this.drawD3(nodes, matrix);

            self.trigger("chart:endDrawing")
        },


        drawD3: function (nodes, matrix) {

            var self = this;
            var sum = 0;
            for (var i = 0; i < matrix.length; i++)
                for (var j = 0; j < matrix[i].length; j++)
                    sum += matrix[i][j];
            
            var state = self.options.state;

            var colorScale = d3.scale.category20();


            var outerRadius = Math.min(self.width, self.height) / 2 - 10,
                innerRadius = outerRadius - 24;
            
            var formatNumber = state.numberFormat || d3.format(",.2f");

            var formatPercent = function(d) {
        		return formatNumber(d)+" ["+d3.format(".1%")(d/sum)+"]";
            }

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

            var layout = d3.layout.chord()
                .padding(.04)
                .sortSubgroups(d3.descending)
                .sortChords(d3.ascending);


            var path = d3.svg.chord()
                .radius(innerRadius);

            var svg =  self.graph.append("svg")
                .attr("width", self.width)
                .attr("height", self.height)
                .append("g")
                .attr("id", "circle")
                .attr("transform", "translate(" + self.width / 2 + "," + self.height / 2 + ")");

            svg.append("circle")
                .attr("r", outerRadius);


            // Compute the chord layout.
            layout.matrix(matrix);

            // Add a group per neighborhood.
            var group = svg.selectAll(".group")
                .data(layout.groups)
                .enter().append("g")
                .attr("class", "group")
                .on("mouseover", mouseover);

            // Add a mouseover title.
            group.append("title").text(function (d, i) {
                return nodes[i] + ": " + formatPercent(d.value, sum) + " of origins";
            });

            // Add the group arc.
            var groupPath = group.append("path")
                .attr("id", function (d, i) {
                    return "group" + i;
                })
                .attr("d", arc)
                .style("fill", function (d, i) {
                    return colorScale(i);
                });

            // Add a text label.
            var groupText = group.append("text")
                .attr("x", 6)
                .attr("dy", 15);

            groupText.append("textPath")
                .attr("xlink:href", function (d, i) {
                    return "#group" + i;
                })
                .text(function (d, i) {
                    return nodes[i];
                });

            // Remove the labels that don't fit. :(
            groupText.filter(function (d, i) {
                return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength();
            })
                .remove();

            // Add the chords.
            var chord = svg.selectAll(".chord")
                .data(layout.chords)
                .enter().append("path")
                .attr("class", "chord")
                .style("fill", function (d) {
                    return colorScale(d.source.index);
                })
                .attr("d", path);

            // Add an elaborate mouseover title for each chord.
            chord.append("title").text(function (d) {
                return nodes[d.source.index]
                    + " → " + nodes[d.target.index]
                    + ": " + formatPercent(d.source.value)
                    + "\n" + nodes[d.target.index]
                    + " → " + nodes[d.source.index]
                    + ": " + formatPercent(d.target.value);
            });

            function mouseover(d, i) {
                chord.classed("fade", function (p) {
                    return p.source.index != i
                        && p.target.index != i;
                });
            }


            /*       var chord = d3.layout.chord()
             .padding(.05)
             .sortSubgroups(d3.descending)
             .matrix(matrix);


             var fill = d3.scale.ordinal()
             .domain(d3.range(4))
             .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

             var svg = self.graph.append("svg")
             .attr("width", self.width)
             .attr("height", self.height)
             .append("g")
             .attr("transform", "translate(" + self.width / 2 + "," + self.height / 2 + ")");

             svg.append("g").selectAll("path")
             .data(chord.groups)
             .enter().append("path")
             .style("fill", function (d) {
             return fill(d.index);
             })
             .style(" stroke", function (d) {
             return fill(d.index);
             })
             .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
             .on("mouseover", fade(.1))
             .on("mouseout", fade(1));


             var ticks = svg.append("g").selectAll("g")
             .data(chord.groups)
             .enter().append("g").selectAll("g")
             .data(groupTicks)
             .enter().append("g")
             .attr("transform", function (d) {
             return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
             + "translate(" + outerRadius + ",0)";
             });


             ticks.append("line")
             .attr("x1", 1)
             .attr("y1", 0)
             .attr("x2", 5)
             .attr("y2", 0)
             .style("stroke", "#000");

             ticks.append("text")
             .attr("x", 8)
             .attr("dy", ".35em")
             .attr("transform", function (d) {
             return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
             })
             .style("text-anchor", function (d) {
             return d.angle > Math.PI ? "end" : null;
             })
             .text(function (d) {
             return d.label;
             });

             svg.append("g")
             .attr("class", "chord")
             .selectAll("path")
             .data(chord.chords)
             .enter().append("path")
             .attr("d", d3.svg.chord().radius(innerRadius))
             .style("fill", function (d) {
             return fill(d.target.index);
             })
             .style("opacity", 1);


             Returns an array of tick angles and labels, given a group.
             function groupTicks(d) {
             var k = (d.endAngle - d.startAngle) / d.value;
             return d3.range(0, d.value, 1000).map(function (v, i) {
             return {
             angle: v * k + d.startAngle,
             label: "ciccio"
             };
             });
             }

             Returns an event handler for fading a given chord group.
             function fade(opacity) {
             return function (g, i) {
             svg.selectAll(".chord path")
             .filter(function (d) {
             return d.source.index != i && d.target.index != i;
             })
             .transition()
             .style("opacity", opacity);
             };
             }
             */

            self.alreadyDrawed = true;

        }






    });

    return view.D3Chord;


});
