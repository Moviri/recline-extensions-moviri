define(['jquery', 'recline-extensions-amd', 'd3', 'mustache', 'datejs'], function ($, recline, d3, Mustache) {

    recline.View = recline.View || {};

    var my = recline.View;

    my.D3CalendarView = Backbone.View.extend({
    	template: '<style> \
        	.calendar-view { \
        	  shape-rendering: crispEdges; \
        	} \
        	.calendar-view svg .day { \
        	  fill: #fff; \
        	  stroke: #ccc; \
        	} \
        	.calendar-view svg  .month { \
        	  fill: none; \
        	  stroke: #000; \
        	  stroke-width: 2px; \
        	} \
    		.calendar-view svg.RdYlGn .q0-11{fill:rgb(165,0,38)} \
    		.calendar-view svg.RdYlGn .q1-11{fill:rgb(215,48,39)} \
    		.calendar-view svg.RdYlGn .q2-11{fill:rgb(244,109,67)} \
    		.calendar-view svg.RdYlGn .q3-11{fill:rgb(253,174,97)} \
    		.calendar-view svg.RdYlGn .q4-11{fill:rgb(254,224,139)} \
    		.calendar-view svg.RdYlGn .q5-11{fill:rgb(255,255,191)} \
    		.calendar-view svg.RdYlGn .q6-11{fill:rgb(217,239,139)} \
    		.calendar-view svg.RdYlGn .q7-11{fill:rgb(166,217,106)} \
    		.calendar-view svg.RdYlGn .q8-11{fill:rgb(102,189,99)} \
    		.calendar-view svg.RdYlGn .q9-11{fill:rgb(26,152,80)} \
    		.calendar-view svg.RdYlGn .q10-11{fill:rgb(0,104,55)} \
    	</style>',
    	initialize:function (options) {

            var self = this;

            _.bindAll(this, 'render');
            
            this.model = options.model;
            this.model.bind('query:done', this.render);
            
            this.el = options.el;
            $(this.el).addClass('calendar-view');
            this.dateField = options.dateField;
            this.valueField = options.valueField;
            this.scaleDomain = options.valueDomain
            var out = Mustache.render(this.template, this);
            $(this.el).html(out);
        },
        
        render:function () {
            var self = this;
            
            function getCurrDate(dateStr) {
            	if (dateStr.getDate)
            		return dateStr // already a date obj
            	else return Date.parse(dateStr) || Date.parse(dateStr.replace(/\.\d\d\d\+\d+$/, '')) || Date.parse(dateStr.split('T')[0]) || new Date(dateStr)
            }
            
            if (this.model.getRecords().length)
        	{
                var width = self.options.cellSize * 56 || 960,
                height = self.options.cellSize * 8 || 136,
                cellSize = self.options.cellSize || 17; // cell size

                //var svg = d3.select(this.el+" svg")

    	        var day = d3.time.format("%w"),
    	            week = d3.time.format("%U"),
    	            percent = d3.format(".1%"),
    	            format = d3.time.format("%Y-%m-%d");
    	
    	        var color = d3.scale.quantize()
    	            .domain(self.scaleDomain)
    	            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
    	        
    	        var records = this.model.getRecords()
    	        var minYear;
    	        var maxYear;
    	        _.each(records, function(rec) {
    	        	var currYear = getCurrDate(rec.attributes[self.dateField]).getFullYear()
    	        	if (minYear)
	        		{
    	        		if (minYear > currYear)
    	        			minYear = currYear
	        		}
    	        	else minYear = currYear
    	        	if (maxYear)
	        		{
    	        		if (maxYear < currYear)
    	        			maxYear = currYear
	        		}
    	        	else maxYear = currYear
    	        });
    	        var yearRange = d3.range(minYear, maxYear)
    	        if (minYear == maxYear)
    	        	yearRange = [minYear]
    	        
    	        var data = d3.nest()
    	            .key(function(d) { return getCurrDate(d.attributes[self.dateField]).toString("yyyy-MM-dd") ; })
    	            .rollup(function(d) { return d[0].attributes[self.valueField] || 0; })
    	            .map(records);
    	
    	        // clear all old values to allow redraw
    	        d3.select(this.el).selectAll("svg").data([]).exit().remove()
    	        
    	        var svg = d3.select(this.el).selectAll("svg")
    	            .data(yearRange)
    	          .enter()
    	          .append("svg")
    	            .attr("width", width)
    	            .attr("height", height)
    	            .attr("class", "RdYlGn")
    	          .append("g")
    	            .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
    	
    	        svg.append("text")
    	            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    	            .style("text-anchor", "middle")
    	            .text(function(d) { return d; });
    	
    	        var rect = svg.selectAll(".day")
    	            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    	          .enter().append("rect")
    	            .attr("class", "day")
    	            .attr("width", cellSize)
    	            .attr("height", cellSize)
    	            .attr("x", function(d) { return week(d) * cellSize; })
    	            .attr("y", function(d) { return day(d) * cellSize; })
    	            .datum(format);
    	
    	        rect.append("title")
    	            .text(function(d) { return d; });
    	
    	        function monthPath(t0) {
      	          var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      	              d0 = +day(t0), w0 = +week(t0),
      	              d1 = +day(t1), w1 = +week(t1);
      	          return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      	              + "H" + w0 * cellSize + "V" + 7 * cellSize
      	              + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      	              + "H" + (w1 + 1) * cellSize + "V" + 0
      	              + "H" + (w0 + 1) * cellSize + "Z";
      	        }
    	
    	        svg.selectAll(".month")
		            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		    		.enter().append("path")
		            .attr("class", "month")
		            .attr("d", monthPath);
	
    	        rect.filter(function(d) { return d in data; })
    	            .attr("class", function(d) { 
    	            	return "day " + color(data[d]); 
    	            })
    	            .select("title")
    	            .text(function(d) { 
    	            	return d + ": " + data[d]; 
    	            });
    	
    	        d3.select(self.frameElement).style("height", height+"px");
        	}
        },
    });

    return my.D3CalendarView;


});

