this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function ($, view) {
	
	"use strict";

    view.D3Treemap = Backbone.View.extend({
        template: '<div id="{{uid}}" style="width: {{width}}px; height: {{height}}px;"> <div> ',

        initialize: function (options) {

            this.el = $(this.el);
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


            self.treemap = d3.layout.treemap()
                 .size([this.width, this.height])
                 .sticky(false)
                 .value(function(d) {
                    console.log(d);
                    return d.size; });

            self.color = d3.scale.category20c();



            self.div = d3.select(graphid).append("div")
                .style("position", "relative")
                .style("width", this.width + "px")
                .style("height", this.height + "px");
        },

        redraw: function () {     
            console.log("redraw");
            var fieldValue = this.model.fields.get(this.options.fieldValue);
            var fieldName = this.model.fields.get(this.options.fieldName);

            var records = _.map(this.options.model.getRecords(this.options.resultType.type), function(record) {
                return {name: record.getFieldValue(fieldName), size: record.getFieldValueUnrendered(fieldValue) };
            });



            this.drawD3(records, "#" + this.uid);
        },
        drawD3: function(data, graphid) {
            var self=this;

            function cell() {
                this
                    .style("left", function(d) { return d.x + "px"; })
                    .style("top", function(d) { return d.y + "px"; })
                    .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
                    .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
            }

            var leaves = self.treemap(data);


            _.each(data, function(x) {
                self.div.data([x]).selectAll("div")
                    .data(self.treemap.nodes)
                    .enter().append("div")
                    .attr("class", "cell")
                    .style("background", function(d) { self.color(d.name); })
                    .call(cell)
                    .text(function(d) {
                        console.log(d);
                        return d.name; });

            });






            // display the line by appending an svg:path element with the data line we created above
            /*if(self.alreadyDrawed)
                self.graph.select("path").transition().duration(self.options.animation.duration).delay(self.options.animation.delay).attr("d", line(data));
            else
                self.graph.append("svg:path").attr("d", line(data));
            */
            self.alreadyDrawed = true;
        }

    });
})(jQuery, recline.View);