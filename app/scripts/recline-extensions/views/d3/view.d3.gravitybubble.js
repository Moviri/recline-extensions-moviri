define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'd3', 'mustache'], function ($, recline, d3, Mustache) {

    recline.View = recline.View || {};

    var view = recline.View;

    "use strict";


    view.D3GravityBubble = Backbone.View.extend({
        template: ' \
	        <div id="{{uid}}"  style="width: {{width}}px; height: {{height}}px;"> \
	        	<div id="{{uid}}_graph" class="span11" ></div> \
	        	<div class="span1"> \
	        		<div id="{{uid}}_legend_color"  style="width:{{color_legend_width}}px;height:{{color_legend_height}}px;{{#colorMargin}}margin:{{colorMargin}}{{/colorMargin}}"></div> \
	        		<div id="{{uid}}_legend_size" style="width:{{size_legend_width}}px;height:{{size_legend_height}}px;{{#sizeMargin}}margin:{{sizeMargin}}{{/sizeMargin}}"></div> \
	        	</div> \
	        </div>',
	    tooltipTemplate: 
	    	'<div> \
				Key = {{title}}<br> \
	    		Color = {{colorValue}}<br> \
	    		Size = {{sizeValue}}<br> \
			</div>',
        initialize: function (options) {
            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw');

            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.render);
            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

            $(window).resize(this.resize);
            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart


            this.margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };
            this.width = (options.width - this.margin.right );
            this.bubbleWidth = this.width * 0.9;
            this.legendWidth = this.width * 0.1;
            this.height = options.height - this.margin.top - this.margin.bottom;

            if (this.options.state.colorLegend) {
                this.options.state.colorLegend.margin = this.options.state.colorLegend.margin || [];
                this.color_legend_width = this.options.state.colorLegend.width + (this.options.state.colorLegend.margin.right || 0) + (this.options.state.colorLegend.margin.left || this.options.state.colorLegend.margin.right || 0);
                this.color_legend_height = this.options.state.colorLegend.height + (this.options.state.colorLegend.margin.top || 0) + (this.options.state.colorLegend.margin.bottom || this.options.state.colorLegend.margin.top || 0);
                this.colorMargin = (this.options.state.colorLegend.margin.top || 0)+"px "+(this.options.state.colorLegend.margin.right || 0)+"px "+(this.options.state.colorLegend.margin.bottom || 0)+"px "+(this.options.state.colorLegend.margin.left || 0)+"px"
            }

            if (this.options.state.sizeLegend) {
                this.options.state.sizeLegend.margin = this.options.state.sizeLegend.margin || [];
                this.size_legend_width = this.options.state.sizeLegend.width + (this.options.state.sizeLegend.margin.right || 0) + (this.options.state.sizeLegend.margin.left || this.options.state.sizeLegend.margin.right || 0);
                this.size_legend_height = this.options.state.sizeLegend.height + (this.options.state.sizeLegend.margin.top || 0) + (this.options.state.sizeLegend.margin.bottom || this.options.state.sizeLegend.margin.top || 0);
                this.sizeMargin = (this.options.state.sizeLegend.margin.top || 0)+"px "+(this.options.state.sizeLegend.margin.right || 0)+"px "+(this.options.state.sizeLegend.margin.bottom || 0)+"px "+(this.options.state.sizeLegend.margin.left || 0)+"px"
            }

            if (this.options.state.customTooltipTemplate) {
                this.tooltipTemplate = this.options.state.customTooltipTemplate;
            }
            //render header & svg container
            var out = Mustache.render(this.template, this);
            this.el.html(out);
        },

        render: function () {
            var self = this;
            var graphid = "#" + this.uid + "_graph";
            var colorLegendId = "#" + this.uid + "_legend_color";
            var sizeLegendId = "#" + this.uid + "_legend_size";

            if (self.graph) {
                jQuery(graphid).empty();
                jQuery(colorLegendId).empty();
                jQuery(sizeLegendId).empty();
            }

            self.graph = d3.select(graphid);

        },

        redraw: function () {
            var self = this;
            var state = self.options.state;

            if(!self.visible)
                return;

            var type;
            if (this.options.resultType) {
                type = this.options.resultType;
            }

            
            self.colorDataFormat = "number";

            var records = _.map(this.options.model.getRecords(type), function (record) {
                state.domains = state.domains || {};

                if(record.fields.get(state.colorField.field).attributes.type == "string")
                    self.colorDataFormat = "string";

                return {
                    "key": record.attributes[state.keyField.field],
                    "color": record.attributes[state.colorField.field], //record.attributes[state.colorField.field],
                    "size": record.attributes[state.sizeField.field],
                    "color_formatted": record.getFieldValue(self.model.fields.get(state.colorField.field)),
                    "size_formatted": record.getFieldValue(self.model.fields.get(state.sizeField.field))
                }
            });

            var sizeDomain = [ d3.min(self.options.model.getRecords(type), function(d) { return (d.attributes[state.sizeField.field]); }),
                               d3.max(self.options.model.getRecords(type), function(d) { return (d.attributes[state.sizeField.field]); }) ]
            
            self.sizeScale =  d3.scale.linear()
                .domain(sizeDomain)
                .range([ 2, 60 ])
                .clamp(true);

		 

	        if(self.colorDataFormat == "string")    {
                self.colorDomain = _.unique( _.map(self.options.model.getRecords(), function(c) { return c.attributes[state.colorField.field] } ));
            } else {
               self.colorDomain = [ d3.min(self.options.model.getRecords(type), function(d) { return (d.attributes[state.colorField.field]); }),
                   d3.max(self.options.model.getRecords(type), function(d) { return (d.attributes[state.colorField.field]); }) ];
            }
             self.colorScale = d3.scale.category20().domain(self.colorDomain);


            var yAxisDomain = _.unique( _.map(self.options.model.getRecords(), function(c) { return c.attributes[state.colorField.field] } ));
            self.yAxis = d3.scale.ordinal().domain(yAxisDomain).range([0, self.height]  );

            if (state.colorLegend) {
                self.drawLegendColor();
            }
            if (state.sizeLegend) {
                self.drawLegendSize(sizeDomain[0], sizeDomain[1]);
            }
            self.colorTitle = state.colorField['label'];
            self.sizeTitle = state.sizeField['label'];

            self.graph = d3.select("#" + self.uid + "_graph");

            this.drawD3(records);
        },

        drawLegendSize: function (minData, maxData) {

            var self = this;
            var legendOpt = self.options.state.sizeLegend;
            var legendWidth = self.size_legend_width;
            var legendHeight = self.size_legend_height;

            legendOpt.margin = $.extend({top: 0, right: 0, bottom: 0, left: 0}, legendOpt.margin);
            var paddingAxis = 20;
            var numTick = legendOpt.numElements;

            var legendid = "#" + this.uid + "_legend_size";
            var transX = (legendWidth / 2 - legendOpt.width / 2) || 0;
            var transY = legendOpt.margin.top || 0;
            var legend = d3.select(legendid).append("svg")
                .attr("width", legendWidth)
                .attr("height", legendHeight);

            var data1 = d3.range(numTick);
            var dataSca = [];


            var rectHeight = (legendOpt.height - paddingAxis * 2 - numTick) / numTick;


            var tickValues = _.map(data1, function (d) {
                return d * (maxData - minData) / (numTick - 1) + minData;
            });

            var circles = legend.selectAll("circle")
                .data(tickValues);

            circles.enter()
                .append("circle")
                .attr({
                    width: legendOpt.width,
                    height: rectHeight,
                    cy: function (d, i) {
                        var r = self.sizeScale(d);
                        var max = self.sizeScale(maxData);
                        return max * 2 - r + 5;
                    },
                    cx: legendOpt.margin.left + self.sizeScale(maxData),
                    r: function (d, i) {
                        return self.sizeScale(d);
                    },
                    fill: "none",
                    //opacity: "0.7",
                    stroke: "black",
                    "stroke-width": "1",
                    "stroke-dasharray": "2,2"
                });

            _.map([minData, (maxData - minData) / 2, maxData], function (a) {
                return (a > 1000) ? d3.format("s")(Math.round(a)) : d3.format(".2f")(a);
            });

            legend.selectAll(".label")
                .data(tickValues).enter().append("text")
                .attr("class", "y label")
                .attr("text-anchor", "middle")
                .attr("y", function (t, i) {
                    var r = self.sizeScale(t);
                    var max = self.sizeScale(maxData);
                    var y = max * 2 - r * 2;
                    if (y == 0) 
                    	y = 20;
                    
                    return y;
                })
                .attr("x", transX + self.sizeScale(maxData)+(self.options.state.sizeLegend.margin.left || 0)/2)
                .text(function (t) {
                    return (t > 1000) ? d3.format("s")(Math.round(t)) : d3.format(".2f")(t);
                });
        },

        drawLegendColor: function () {

            var self = this;
            var legendOpt = self.options.state.colorLegend;
            var legendWidth = self.color_legend_width;
            var legendHeight = this.color_legend_height;
            legendOpt.margin = $.extend({top: 0, right: 0, bottom: 0, left: 0}, legendOpt.margin);

            var rectWidth = 20;//legendOpt.width;
            var paddingAxis = 20;


            var legendid = "#" + this.uid + "_legend_color";
            var transX = (legendWidth / 2 - rectWidth / 2) || 0;
            var transY = legendOpt.margin.top || 0;
            var legend = d3.select(legendid).append("svg")
                .attr("width", legendWidth)
                .attr("height", legendHeight);

            var data1;
            var calculateColor;
            var numTick;
            var tickValues;

            if(self.colorDataFormat == "string") {
               data1 = self.colorDomain;
                calculateColor = function(d) {
                    return self.colorScale(d);
                };
                numTick = self.colorDomain.length;
                tickValues = self.colorDomain;
            }  else {
                numTick =  legendOpt.numElements;
               data1 =  d3.range(numTick);
                calculateColor = function(d) { return self.colorScale(d * (self.colorDomain[1] - self.colorDomain[0]) / numTick + self.colorDomain[0])};

                tickValues = _.map([self.colorDomain[0], self.colorDomain[1]], function (a) {
                    return (a > 1000) ? d3.format("s")(Math.round(a)) : d3.format(".2f")(a);
                });
            }



            var dataSca = [];

            var rects = legend.selectAll("rect")
                .data(data1);
            var rectHeight = (legendOpt.height - paddingAxis * 2 - numTick) / numTick;

            rects.enter()
                .append("rect")
                .attr({
                    width: rectWidth,
                    height: rectHeight,
                    y: function (d, i) {
                        return transY + (5) + i * (rectHeight + 1);
                    },
                    x: transX,
                    fill: function (d, i) {
                        return calculateColor(d);
                    }
                });

            legend.selectAll(".label")
                .data(tickValues).enter().append("text")
                .attr("class", "y label")
                .attr("text-anchor", function(){
                      if(self.colorDataFormat == "string"){
                             return "left";
                      }else{
                          return "middle";
                      }
                 })
                .attr("y", function (t, i) {
                    if(self.colorDataFormat == "string") {
                        return transY + 9 + rectHeight/2 + i * (rectHeight + 1);
                    }  else{
                        return ((legendOpt.height - paddingAxis) / (tickValues.length - 1)) * i + paddingAxis / 2;
                    }

                })
                .attr("x", function(){
                    if(self.colorDataFormat == "string") {
                         return transX+rectWidth+2;
                    }else{
                        return ((legendWidth / 2 - legendOpt.width / 2) || 0) + legendOpt.width / 2;
                    }

                })
                .text(function (t) {
                    return t;
                });
        },

        drawD3: function (data) {
            var self = this;


            function size(d) {
                return d.size;
            }

            function color(d) {
                return d.color;
            }

            function key(d) {
                return d.key;
            }



                var
                    w = self.width,  //width
                    h = self.height, //height
                    center = {                                      //gravity center
                        x : ( w - (self.margin.left + self.margin.right ) ) / 2,
                        y : ( h -  (self.margin.top + self.margin.bottom ) ) / 2
                    },
                    o,            //opacity scale
                    r,            //radius scale
                    z,            //color scale
                    g,            //gravity scale
                    gravity  = -0.01,//gravity constants
                    damper   = 0.2,
                    friction = 0.8,
                    force = d3       //gravity engine
                        .layout
                        .force()
                        .linkStrength(function(c,i) { console.log(" c,i [" + c + "," + i + "]")})
                        .size([ w - (self.margin.left + self.margin.right ),
                            h -  (self.margin.top + self.margin.bottom ) ]),
                    svg = self.graph.append("svg"),
                    circles,         //data representation
                    //tooltip = self.CustomTooltip( "posts_tooltip", 240 );



            // opacity
               /* o = d3.scale.linear()
                    .domain([ d3.min(posts, function(d) { return d.time; }),
                        d3.max(posts, function(d) { return d.time; }) ])
                    .range([ 1, 0.2 ]);
                */
                g = function(d) { return - self.sizeScale(d) * self.sizeScale(d) / 2.5; };

                launch();

                function launch() {

                    force
                        .nodes( data );

                    circles = svg
                        .append("g")
                        .attr("id", "circles")
                        .selectAll("a")
                        .data(force.nodes());

                    // Init all circles at random places on the canvas
                    force.nodes().forEach( function(d, i) {
                        d.x = Math.random() * w;
                        d.y = self.yAxis(color(d));
                    });

                    var node = circles
                        .enter()
                        .append("a")
                        //.attr("xlink:href", function(d) { return d.url; })
                        .append("circle")
                        .attr("r", 0)
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; })
                        .attr("fill", function(d) {
                            return self.colorScale( color(d) );
                        })
                        .attr("stroke-width", 1)
                        .attr("stroke", function(d) { return d3.rgb(self.colorScale( color(d) )).darker(); })
                        .attr("id", function(d) { return "post_#" + key(d); })
                        .attr("title", function(d) { return key(d) })
                        //.style("opacity", function(d) { return o( d.time ); })
                        //.on("mouseover", function(d, i) { force.resume(); highlight( d, i, this ); })
                        //.on("mouseout", function(d, i) { downlight( d, i, this ); });
                        .on("mouseover", self.handleMouseover(self))
                        .on("mouseout", self.mouseout);


                    circles.selectAll("circle")
                        .transition()
                        .delay(function(d, i) { return i * 10; })
                        .duration( 1 )
                        .attr("r", function(d) {
                            if(d) {
                                return self.sizeScale( size(d) );
                            } else return 0;

                        });

                    loadGravity( moveCenter );

                    //Loads gravity
                    function loadGravity( generator ) {
                        force
                            .gravity(gravity)
                            .charge( function(d) { return g( size(d) ); })
                            .friction(friction)
                            .linkStrength( function(d,i) { console.log(c + " - "+ i);}  )
                            .on("tick", function(e) {
                                generator(e.alpha);
                                node
                                    .attr("cx", function(d) { return d.x; })
                                    .attr("cy", function(d) { return d.y; });
                            }).start();
                    }

                    // Generates a gravitational point in the middle
                    function moveCenter( alpha ) {
                        force.nodes().forEach(function(d) {
                            d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
                            d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
                        });
                    }
                }


                /*function highlight( data, i, element ) {
                    d3.select( element ).attr( "stroke", "black" );

                    var content = data.key;

                    tooltip.showTooltip(content, d3.event);
                }

                function downlight( data, i, element ) {
                    d3.select(element).attr("stroke", function(d) { return d3.rgb( z( color(d) )).darker(); });
                }
                */







            self.alreadyDrawed = true;


        },
        handleMouseover: function (self) {
            return function (e) {
                var mapOffset = $(self.el).position()
                var objRect = this.getBoundingClientRect();
                var docRect = document.body.getBoundingClientRect()
                var pos = {
                    left: objRect.left + objRect.width / 2,
                    top: objRect.top + objRect.height / 2 - docRect.top
                };

                var values = {
                    title: e.key,
                    colorLabel: self.colorTitle,
                    colorValue: e.color_formatted,
                    sizeabel: self.sizeTitle,
                    sizeValue: e.size_formatted
                }
                var content = Mustache.render(self.tooltipTemplate, values);
                var $mapElem = $(self.el)
                var gravity = (pos.top < $mapElem[0].offsetTop + $mapElem.height() / 2 ? 'n' : 's');

                nv.tooltip.show([pos.left, pos.top], content, gravity, null, $mapElem[0]);
            };
        },
        mouseout: function () {
            nv.tooltip.cleanup();
        }


    });

    return view.D3GravityBubble;


});
