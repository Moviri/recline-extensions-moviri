this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function ($, view) {

    "use strict";

    view.xCharts = Backbone.View.extend({
        template:'<figure style="clear:both; width: {{width}}px; height: {{height}}px;" id="{{uid}}"></figure><div class="xCharts-title-x" style="width:{{width}}px;text-align:center;margin-left:50px">{{xAxisTitle}}</div>',

        initialize:function (options) {

            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw');


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
        	   options.state.opts = {}
        },

        render:function (width) {
        //	console.log("View.xCharts: render");
            if (!isNaN(width)){
        		this.width = width;	
        	}
        	        	 
            var self = this;
            self.trigger("chart:startDrawing")

            var graphid = "#" + this.uid;
            if (false/*self.graph*/)
            {
            	self.updateGraph();
//                jQuery(graphid).empty();
//                delete self.graph;
//                console.log("View.xCharts: Deleted old graph");
            }
            else
        	{
                var out = Mustache.render(this.template, this);
                this.el.html(out);
        	}
            self.trigger("chart:endDrawing")
        },

        redraw:function () {
       // 	console.log("View.xCharts: redraw");
        	
        	var self = this;
            self.trigger("chart:startDrawing")

       //     console.log(self.model.records.toJSON());

            if (false /*self.graph*/)
                self.updateGraph();
            else
                self.renderGraph();

            self.trigger("chart:endDrawing")
        },

        updateGraph:function () {
     //       console.log("View.xCharts: updateGraph");
            var self = this;
            if (this.model.recordCount)
            {
	            self.updateSeries();
	            
	            if (self.series.main && self.series.main.length && self.series.main[0].data && self.series.main[0].data.length)
	        	{
	            	this.el.find('figure div.noData').remove()
	            	
	            	this.el.find('div.xCharts-title-x').html(self.options.state.xAxisTitle)
	                var state =  self.options.state;
	                self.updateState(state);
	                self.graph._options = state.opts;
	
	                self.graph.setData(self.series);
	                self.updateOptions();
	
	                self.graph.setType(state.type);
	
	                if(state.legend)
	                    self.createLegend();
	
	        	}
	            else
	        	{
	            	// display NO DATA MSG
	            	
	            	//self.graph.setData(self.series);
	                var graphid = "#" + this.uid;
	                if (self.graph)
	                {
	                	// removes resize event or last chart will popup again!
	                	d3.select(window).on('resize.for.' + graphid, null);
	                	$(graphid).off()
	                    $(graphid).empty();
	                    delete self.graph;
	                }
	                this.el.find('figure').html("");
	                this.el.find('figure').append(new recline.View.NoDataMsg().create());
	                this.el.find('div.xCharts-title-x').html("")
	            	self.graph = null
	        	}
            }
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
                    var content = '<div class="moda_tooltip annotation-description">'+d.text+'</div>'

                    var topOffsetAbs = topOffset + pos.top;
                    if (topOffsetAbs < 0) topOffsetAbs = -topOffsetAbs; 
                    nv.tooltip.show([pos.left + leftOffset, topOffset + pos.top], content, (pos.left < self.el[0].offsetLeft + self.el.width()/2 ? 'w' : 'e'), null, self.el[0]);
                }
                var mouseoutAnnotation = function () {
                	nv.tooltip.cleanup();
                }
                state.opts.mouseoverAnnotation = mouseoverAnnotation;
                state.opts.mouseoutAnnotation = mouseoutAnnotation;
        	}
            
        },

        updateOptions: function() {
            var self=this;
            this.el.find('div.xCharts-title-x').html(self.options.state.xAxisTitle)

            // add Y-Axis title
            if (self.options.state.yAxisTitle)
            {
                var fullHeight = self.graph._height + self.graph._options.axisPaddingTop + self.graph._options.axisPaddingBottom

                self.graph._g.selectAll('g.axisY g.titleY').data([self.options.state.yAxisTitle]).enter()
                    .append('g').attr('class', 'titleY').attr('transform', 'translate(-60,'+fullHeight/2+') rotate(-90)')
                    .append('text').attr('x', -3).attr('y', 0).attr('dy', ".32em").attr('text-anchor', "middle").text(function(d) { return d; });
            }
        },

        changeDataset: function(model) {
        	
        	_.bindAll(this, 'render', 'redraw');

//        	this.model.off('change', this.render);
//        	this.model.fields.off('reset', this.render);
//        	this.model.fields.off('add', this.render);
//
//        	this.model.off('query:done', this.redraw);
//        	this.model.queryState.off('selection:done', this.redraw);

        	this.model.unbind();
        	
        	this.model = model;

        	this.model.bind('change', this.render);
        	this.model.fields.bind('reset', this.render);
        	this.model.fields.bind('add', this.render);

        	this.model.bind('query:done', this.redraw);
        	this.model.queryState.bind('selection:done', this.redraw);

        	
    	},
        	
        renderGraph:function () {
            //console.log("View.xCharts: renderGraph");

            var self = this;
            var state = self.options.state;
            if (this.model.recordCount)
            {
                self.updateSeries();
                

                if(state.legend)
                    self.createLegend();


                if (self.series.main && self.series.main.length && self.series.main[0].data && self.series.main[0].data.length)
            	{
                	self.el.find('figure div.noData').remove() // remove no data msg (if any) 
                	self.el.find('figure svg g').remove() // remove previous graph (if any)
                		
                    self.updateState(state);

                    if (state.interpolation)
                        state.opts.interpolation = state.interpolation;
                    
                    if (state.type == 'line-dotted' && state.dotRadius)
                        state.opts.dotRadius = state.dotRadius;

                    self.graph = new xChart(state.type, self.series, '#' + self.uid, state.opts);
                    if (state.timing != null && typeof state.timing != "undefined")
                    	self.graph._options.timing = state.timing;


                    self.updateOptions();

                }
                else
                {
                	// display NO DATA MSG
                    var graphid = "#" + this.uid;
                    if (self.graph)
                    {
                    	// removes resize event or last chart will popup again!
                    	d3.select(window).on('resize.for.' + graphid, null);
                    	$(graphid).off()
                        $(graphid).empty();
                        delete self.graph;
                    }
                    this.el.find('figure').html("");
                	this.el.find('figure').append(new recline.View.NoDataMsg().create());
                	this.el.find('div.xCharts-title-x').html("")
                }
            }
            
        },

        createLegend: function() {
            var self=this;
            var res = $("<div/>");
            var i =0;
            
            
    		$("<script>" +
				"function changeSeriesVisibility(i){"+
	            	"var isVisible = $('g .color'+i).attr('display');"+
	            	" if (isVisible === 'none') {isVisible = false;} else {isVisible = true;}"+
	            	"if (isVisible){"+
	            	"	$('g .color'+i).attr('display', 'none');"+
	            	"	$('.legend_item_value.legendcolor'+i).addClass('noFillLegendBullet');"+
	            	"} else {"+
	            		"$('g .color'+i).attr('display', 'inline');"+
	            		"$('.legend_item_value.legendcolor'+i).removeClass('noFillLegendBullet');"+
	            	"}"+
	            "}"+
           	"</script>").appendTo("head");		
            _.each(self.series.main, function(d) {
            	if (d.color){
                	$("<style type='text/css'> " +
                			".color"+i+"{ color:rgb("+d.color.rgb+");} " +
                			".legendcolor"+i+"{ color:rgb("+d.color.rgb+"); background-color:rgb("+d.color.rgb+"); } " +
                			".xchart .color"+i+" .fill { fill:rgba("+d.color.rgb+",0.1);} " +
        					".xchart .color"+i+" .line { stroke:rgb("+d.color.rgb+");} " +    
        					".xchart .color"+i+" rect, .xchart .color"+i+" circle { fill:rgb("+d.color.rgb+");} " +
    					"</style>").appendTo("head");
                	var legendItem = $('<div class="legend_item" onClick="changeSeriesVisibility('+i+')"/>');
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
            })

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
                var serie = {color:d.color, name:d.key, label: d.label, data:_.map(d.values, function(c) { return {x:c.x, y:c.y, x_formatted: c.x_formatted, y_formatted: c.y_formatted, legendField: c.legendField, legendValue: c.legendValue } })};
                data.main.push(serie);
            });
            if (self.options.state.useAnnotations && series.length)
            	recline.Data.SeriesUtility.createSerieAnnotations(self.options.state.useAnnotations.dataset, self.options.state.useAnnotations.dateField, self.options.state.useAnnotations.textField, data.main, self.options.state.useAnnotations.seriesField, self.options.state.useAnnotations.strictPositioning)

            self.series = data;
        }




    });
})(jQuery, recline.View);