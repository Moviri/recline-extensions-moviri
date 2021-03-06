/* global define */
define(['underscore', 'backbone', 'REM/recline-extensions/recline-extensions-amd', 'mustache', 'd3v2', 'REM/vendor/xcharts/xcharts', 'REM/recline-extensions/views/view.no_data'], 
    function (_, Backbone, recline, Mustache, d3, xChart) {

    "use strict";

    recline.View = recline.View || {};
    var my = recline.View;

    my.xCharts = Backbone.View.extend({
        template:'<figure style="clear:both; width: {{width}}px; height: {{height}}px;" id="{{uid}}"></figure><div class="xCharts-title-x" style="width:{{width}}px;text-align:center;margin-left:50px">{{xAxisTitle}}</div>',
        initialize:function (options) {
            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw', 'displayNoDataMsg', 'deleteOldGraph');

            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.redraw);
           // this.model.records.bind('reset', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart

            this.options = options;

            this.height= options.state.height;
            this.width = options.state.width;
            this.xAxisTitle = options.state.xAxisTitle;
            this.yAxisTitle = options.state.yAxisTitle;
            if (options.state.loader)
                options.state.loader.bindChart(this);
           if (options.state.widths){
               this.widths = options.state.widths;   
           }
           if (options.state.opts == null || typeof options.state.opts == "undefined")
               options.state.opts = {};
        },

        render:function (width) {
        //  console.log("View.xCharts: render");
            if (!isNaN(width)){
                this.width = width; 
            }
                         
            var self = this;
            self.trigger("chart:startDrawing");

            var out = Mustache.render(this.template, this);
            this.el.html(out);

            self.trigger("chart:endDrawing");
        },

        redraw:function () {
       //   console.log("View.xCharts: redraw");
            this.trigger("chart:startDrawing");
            this.renderGraph();
            this.trigger("chart:endDrawing");
        },

        updateState: function(state) {
            var self=this;

            if (self.options.state.yAxisTitle)
                state.opts.paddingLeft = 90;  // accomodate space for y-axis title (original values was 60)
            
            if (state.useAnnotations)
            {
                var mouseoverAnnotation = function (d) {
                    var leftOffset = -($('html').css('padding-left').replace('px', '') + $('body').css('margin-left').replace('px', ''))+10;
                    var topOffset = -5;
                    var pos = $(this).offset();
                    var content = '<div class="moda_tooltip annotation-description">'+d.text+'</div>';

                    var topOffsetAbs = topOffset + pos.top;
                    if (topOffsetAbs < 0) topOffsetAbs = -topOffsetAbs; 
                    nv.tooltip.show([pos.left + leftOffset, topOffset + pos.top], content, (pos.left < self.el[0].offsetLeft + self.el.width()/2 ? 'w' : 'e'), null, self.el[0]);
                };
                var mouseoutAnnotation = function () {
                    nv.tooltip.cleanup();
                };
                state.opts.mouseoverAnnotation = mouseoverAnnotation;
                state.opts.mouseoutAnnotation = mouseoutAnnotation;
            }
            
        },

        updateOptions: function() {
            var self=this;
            this.el.find('div.xCharts-title-x').html(self.options.state.xAxisTitle);

            // add Y-Axis title
            if (self.options.state.yAxisTitle)
            {
                var fullHeight = self.graph._height + self.graph._options.axisPaddingTop + self.graph._options.axisPaddingBottom;

                self.graph._g.selectAll('g.axisY g.titleY').data([self.options.state.yAxisTitle]).enter()
                    .append('g').attr('class', 'titleY').attr('transform', 'translate(-60,'+fullHeight/2+') rotate(-90)')
                    .append('text').attr('x', -3).attr('y', 0).attr('dy', ".32em").attr('text-anchor', "middle").text(function(d) { return d; });
            }
        },

        changeDataset: function(model) {
            
            _.bindAll(this, 'render', 'redraw');

//          this.model.off('change', this.render);
//          this.model.fields.off('reset', this.render);
//          this.model.fields.off('add', this.render);
//
//          this.model.off('query:done', this.redraw);
//          this.model.queryState.off('selection:done', this.redraw);

            this.model.unbind();

            if (model) {
                this.model = model;

                this.model.bind('change', this.render);
                this.model.fields.bind('reset', this.render);
                this.model.fields.bind('add', this.render);

                this.model.bind('query:done', this.redraw);
                this.model.queryState.bind('selection:done', this.redraw);
            }
        },
            
        renderGraph:function () {
            //console.log("View.xCharts: renderGraph");
            var self = this;
            var state = this.options.state;
            if (this.model.recordCount)
            {
                this.updateSeries();
                
                if (this.series.main && this.series.main.length && this.series.main[0].data && this.series.main[0].data.length)
                {
                    this.el.find('figure div.noData').remove(); // remove no data msg (if any) 
                    this.el.find('figure svg g').remove(); // remove previous graph (if any)
                        
                    this.updateState(state);

                    if (state.interpolation)
                        state.opts.interpolation = state.interpolation;
                    
                    if (state.type == 'line-dotted' && state.dotRadius)
                        state.opts.dotRadius = state.dotRadius;

                    var graphIdx = 0;
                    if (state.graphIdx !== undefined) {
                        graphIdx = state.graphIdx;
                        state.opts.graphIdx = graphIdx;
                    }

                    // delete old chart before every redraw
                    if (this.graph) {
                        this.deleteOldGraph();
                    }

                    this.graph = new xChart(state.type, this.series, '#' + this.uid, state.opts);
                    //console.log("Created new xCharts");
                    $('#' + this.uid+' svg').attr("id", "svgxchart"+graphIdx);

                    if(state.legend && state.legend.length)
                        this.createLegend();

                    if (state.timing != null && typeof state.timing != "undefined")
                        this.graph._options.timing = state.timing;

                    this.updateOptions();

                }
                else this.displayNoDataMsg();
            }
            else this.displayNoDataMsg();
        },
        displayNoDataMsg: function() 
        {
            this.deleteOldGraph();
            // display NO DATA MSG
            this.el.find('figure').append(new recline.View.NoDataMsg().create());
        },
        deleteOldGraph: function(deleteModel) {
            var graphid = "#" + this.uid;
            // removes resize event or last chart will popup again!
            // WH-587. Delete even if this.graph is null. The chart is probably still waiting to be drawn (probably waiting for model)
            d3.select(window).on('resize.for.' + graphid, null);
            this.el.find('figure svg g').remove(); // remove previous graph (if any)
            d3.selectAll(graphid+' svg').remove();
            $(graphid).off();
            $(graphid).empty();
            delete this.graph;
            if (deleteModel && this.model) {
                this.model.off();
                if (this.model.records) {
                    this.model.records.off();
                    if (this.model.records.reset) {
                        this.model.records.reset();
                    }
                }
                if (this.model.fields) {
                    this.model.fields.off();
                }
                if (this.model.queryState) {
                    this.model.queryState.off();
                }
            }
            this.el.find('figure').html("");
            this.el.find('div.xCharts-title-x').html("");
            this.graph = null;
        },        

        createLegend: function() {
            var self=this;
            var res = $("<div/>");
            var i = 0;
            var graphIdx = (this.options.state.graphIdx ? this.options.state.graphIdx : 0); // graph index in case there's more than one chart on the same page
            var legendId = self.options.state.legend[0].id;

            if (!$("#style_noFillLegendBullet").length) {
                $("<style id='style_noFillLegendBullet'>.noFillLegendBullet { background: transparent !important; }</style>").appendTo("head"); 
            }
            if (!$("#script_changeSeriesVisibility").length) {
                $("<script id='script_changeSeriesVisibility'>" +
                    "function changeSeriesVisibility(j,legendId,i){"+
                        "var colorPrefix = (j !== undefined ? j+'-' : '');" +
                        "if (j === undefined) {j=0};"+
                        "var $svg = $('#svgxchart'+j);"+
                        "var isVisible = $svg.find('g .color'+colorPrefix+i).attr('display');"+
                        " if (isVisible === 'none') {isVisible = false;} else {isVisible = true;}"+
                        "if (isVisible){"+
                        "   $svg.find('g .color'+colorPrefix+i).attr('display', 'none');"+
                        "   $('#'+legendId+' .legend_item_value.legendcolor'+i).addClass('noFillLegendBullet');"+
                        "} else {"+
                            "$svg.find('g .color'+colorPrefix+i).attr('display', 'inline');"+
                            "$('#'+legendId+' .legend_item_value.legendcolor'+i).removeClass('noFillLegendBullet');"+
                        "}"+
                    "}"+
                "</script>").appendTo("head"); 
            }

            var colorPrefix = (this.options.state.graphIdx !== undefined ? this.options.state.graphIdx + "-" : "");
            var $svg = this.$el.find('#svgxchart'+graphIdx);
            _.each(self.series.main, function(d) {
                if (d.color){
                    // remove from HEAD old style with same name, if present
                    $("#style_"+legendId+"_legendcolor"+i).remove();

                    // add new legend color style
                    $("<style type='text/css' id='style_"+legendId+"_legendcolor"+i+"'> " +
                            "#"+legendId+" .legendcolor"+i+"{ color:rgb("+d.color.rgb+"); background-color:rgb("+d.color.rgb+"); } " +
                            "#"+legendId+" .color"+colorPrefix+i+"{ color:rgb("+d.color.rgb+");} " +
                        "</style>").appendTo("head");

                    // remove from SVG old style ith same name, if present
                    $svg.find("#style_svg_xchart_color"+colorPrefix+i).remove();
                    // add new SVG color style
                    $svg.prepend("<style id='style_svg_xchart_color"+colorPrefix+i+"'>" +
                            ".xchart .color"+colorPrefix+i+" .fill { fill:rgba("+d.color.rgb+",0.1) !important;} " +
                            ".xchart .color"+colorPrefix+i+" .line { stroke:rgb("+d.color.rgb+") !important;} " +    
                            ".xchart .color"+colorPrefix+i+" rect, .xchart .color"+colorPrefix+i+" circle { fill:rgb("+d.color.rgb+") !important;} " +
                        "</style>");
                    var legendItem = $('<div class="legend_item" onClick="changeSeriesVisibility('+self.options.state.graphIdx+',\''+legendId+'\','+i+')"/>');
                    var name = $("<span/>");
                    name.html(d.label);
                    legendItem.append(name);
                    var value = $('<div class="legend_item_value"/>');
                    value.addClass("legendcolor"+i);
                    legendItem.append(value);
                    res.append(legendItem);
                } else {
                    console.log('d.color not defined');
                }   
                
                i++;
            });

            self.options.state.legend.html(res);
        },

        updateSeries: function() {
            var self = this;
            var state = self.options.state;
            var series =  recline.Data.SeriesUtility.createSeries(
                state.series,
                state.unselectedColor,
                self.model,
                self.resultType,
                state.group,
                state.scaleTo100Perc,
                state.groupAllSmallSeries);
            

            var data = { main: [],
                xScale: state.xScale,
                yScale: state.yScale
            };
            _.each( series, function(d) {
                var serie = {color:d.color, name:d.key, label: d.label, data:_.map(d.values, function(c) { return {x:c.x, y:c.y, x_formatted: c.x_formatted, y_formatted: c.y_formatted, legendField: c.legendField, legendValue: c.legendValue }; })};
                data.main.push(serie);
            });
            if (self.options.state.useAnnotations && series.length) {
                recline.Data.SeriesUtility.createSerieAnnotations(self.options.state.useAnnotations.dataset, self.options.state.useAnnotations.dateField, self.options.state.useAnnotations.textField, data.main, self.options.state.useAnnotations.seriesField, self.options.state.useAnnotations.strictPositioning);
            }

            self.series = data;
        }




    });

    return my.xCharts;
});