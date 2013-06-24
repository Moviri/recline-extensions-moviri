this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function ($, view) {

    "use strict";

    view.D3Cloud = Backbone.View.extend({
        template: '<div id="{{uid}}" style="width: {{width}}px; height: {{height}}px;"></div>',
		defaultfontRange: [20, 100],
        initialize: function (options) {

            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw');

            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart

            this.margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 100.5};
			if (options.width)
				this.width = options.width - this.margin.right;
			else throw "Missing cloud width!";
			
			if (options.height)
				this.height = options.height - this.margin.top - this.margin.bottom;
			else throw "Missing cloud height!";

            var out = Mustache.render(this.template, this);
            this.el.html(out);
        },

        render: function () {
            var self = this;
            self.trigger("chart:startDrawing")
            var graphid = "#" + this.uid;

            if (self.graph)            {
                jQuery(graphid).empty();
            }

            self.graph = d3.select(graphid);
            self.trigger("chart:endDrawing")
        },


        redraw: function () {
            if(!this.visible)  { return }

            var self = this;
            self.trigger("chart:startDrawing")
             var state = self.options.state;

            var type;
            if (this.options.resultType) {
                type = this.options.resultType;
            }
			var domain = [Infinity, -Infinity];

            var records = _.map(this.options.model.getRecords(type), function (record) {
				var newRec = { key: record.attributes[state.wordField], value: (record.attributes[state.dimensionField] ? record.attributes[state.dimensionField] : 0.00000001) };
				if (state.colorField && record.attributes[state.colorField])
					newRec.color = record.attributes[state.colorField];
				return newRec;
            });

			records =  _.sortBy(records, function(f){ return f.value; });
			if (records.length == 0)
				return;

            domain = [records[0].value, records[records.length-1].value];


            if (domain[0] == domain[1]) {
			domain = [domain[0] / 2, domain[0] * 2];
		}
            	self.graph = d3.select("#" + self.uid);
		self.domain = domain;
            this.drawD3(records);

          self.trigger("chart:endDrawing")
        },



        drawD3: function (data) {

            var self=this;
            var state = self.options.state;
            var fontSize = d3.scale.log().domain(self.domain).range(state.fontRange || self.defaultFontRange);
            var font = "Impact";

            if(state.font)
                font = state.font;

            if(state.scale)
                fontSize = state.scale;
            
            if (typeof state.angle_start == "undefined" && typeof state.angle_end == "undefined")
        	{
            	state.angle_start = -90;
            	state.angle_end = 90;
        	}
            if (typeof state.orientations == "undefined")
            	state.orientations = 10;

            d3.layout.cloud().size([self.width, self.height])
                .words(data.map(function(d) {
                        return {text: d.key, size: d.value, color: d.color };
                    }))
                .rotate(function() {

                    var tick =  Math.floor(Math.random() * state.orientations);
                    var angle = Math.floor(tick*(state.angle_end-state.angle_start)/state.orientations + state.angle_start);
               
                    return angle;
                })
                .font(font)
                .fontSize(function(d) {
                    return fontSize(+d.size);
                })
                .on("end", self.drawCloud(this))
                .start();

            self.alreadyDrawed = true;

        },

        drawCloud: function(graph){
           return  function(words) {
            var self=graph;
			var mouseover = function (d) { };
			var mouseout = function (d) { };
			var click = function (d) { };
			var mouseoverCustom;
			var mouseoutCustom;
			var clickCustom;
			if (self.options.state.customTooltipTemplate)
			{
				mouseoverCustom = function (d) {
					var leftOffset = -($('html').css('padding-left').replace('px', '') + $('body').css('margin-left').replace('px', ''))+10;
					var topOffset = d.size/2;
					var pos = $(this).offset();
					var content = Mustache.render(self.options.state.customTooltipTemplate, d);

					var topOffsetAbs = topOffset + pos.top;
					if (topOffsetAbs < 0) topOffsetAbs = -topOffsetAbs; 
					 nv.tooltip.show([pos.left + leftOffset, topOffset + pos.top], content, 'w', null, self.el[0]);
				};
				mouseoutCustom = function () {
					nv.tooltip.cleanup();
				}
			}
			else if (self.options.state.mouseover && self.options.state.mouseout)
			{
				mouseoverCustom = self.options.state.mouseover;
				mouseoutCustom = self.options.state.mouseout;
			}
			if (self.options.state.click)
				clickCustom = self.options.state.click;
			
            var fill = d3.scale.log().range(['#DEEBF7', '#3182BD']);
            self.graph.append("svg")
                .attr("width", self.width)
                .attr("height", self.height)
                .append("g")
                .attr("transform", "translate("+self.width/2+","+self.height/2+")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .style("fill", function(d, i) { 
					return (d.color ? d.color : fill(d.size)); 
				})
				.style("cursor", "pointer")
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; })
				.on("mouseover", mouseoverCustom || mouseover)
				.on("mouseout", mouseoutCustom || mouseout)
				.on("click", clickCustom || click)
			};
        }
    });
})(jQuery, recline.View);
