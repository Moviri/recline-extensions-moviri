define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'd3', 'mustache'], function ($, recline, d3, Mustache) {

    recline.View = recline.View || {};

    var view = recline.View;
	
	"use strict";

    view.D3Sparkline = Backbone.View.extend({
        template: '<div id="{{uid}}" style="width: {{width}}px; height: {{height}}px;"> <div> ',

        initialize: function (options) {

            this.el = $(this.el);
            this.options = options;
    		_.bindAll(this, 'render', 'redraw');
                     

            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);


			$(window).resize(this.resize);
            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart
            this.width = options.width;
            this.height = options.height;

            if(!this.options.animation) {
                this.options.animation = {
                    duration: 2000,
                    delay: 200
                }
            }

            //render header & svg container
            var out = Mustache.render(this.template, this);
            this.el.html(out);

        },
        
        resize: function(){

        },

        render: function () {
            var self=this;
            var graphid="#" + this.uid;

            if(self.graph)
                jQuery(graphid).empty();

            self.graph = d3.select(graphid)
                .append("svg:svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .style("stroke", function() { return self.options.color || "steelblue"; })
                .style("stroke-width", 1)
                .style("fill", "none");
        },

        redraw: function () {     
            console.log("redraw");
            var field = this.model.fields.get(this.options.field);
            var type = this.options.resultType || ""
            var records = _.map(this.options.model.getRecords(type), function(record) {
                return record.getFieldValueUnrendered(field);
            });



            this.drawD3(records, "#" + this.uid);
        },
        drawD3: function(data, graphid) {
            var self=this;


                // X scale will fit values from 0-10 within pixels 0-100
            var x = d3.scale.linear().domain([0, data.length]).range([0, this.width]);
            // Y scale will fit values from 0-10 within pixels 0-100
            var y = d3.scale.linear().domain([_.min(data), _.max(data)]).range([0, this.height]);

            // create a line object that represents the SVN line we're creating
            var line = d3.svg.line()
                // assign the X function to plot our line as we wish
                .x(function(d,i) {
                    // verbose logging to show what's actually being done
                    //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                    // return the X coordinate where we want to plot this datapoint
                    return x(i);
                })
                .y(function(d) {
                    // verbose logging to show what's actually being done
                    //console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
                    // return the Y coordinate where we want to plot this datapoint
                    return y(d);
                })


            // display the line by appending an svg:path element with the data line we created above
            if(self.alreadyDrawed)
                self.graph.select("path").transition().duration(self.options.animation.duration).delay(self.options.animation.delay).attr("d", line(data));
            else
                self.graph.append("svg:path").attr("d", line(data));

            self.alreadyDrawed = true;
        }

    });
    
    return view.D3Sparkline;

});