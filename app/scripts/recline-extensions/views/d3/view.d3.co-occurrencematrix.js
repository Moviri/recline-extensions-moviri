define(['jquery', 'recline-extensions-amd', 'd3', 'mustache'], function ($, recline, d3, Mustache) {

  recline.View = recline.View || {};

  var my = recline.View;

    my.D3CooccurrenceMatrix = Backbone.View.extend({
    	rendered: false,
    	template:'<svg x="0" y="0" width="{{width}}" height="{{height}}" xmlns="http://www.w3.org/2000/svg" version="1.1" style="margin-left:{{marginLeft}}px"> \
    			<g transform="translate({{marginLeft}}, {{marginTop}})"> \
    		</svg>',
        defaultTooltipTemplate: '<div> \
				<b>Correlation:</b><table> \
					<tr><td>Cluster 1: </td><td>{{name1}}</td></tr> \
					<tr><td>Cluster 2: </td><td>{{name2}}</td></tr> \
					<tr><td>Correlation: </td><td>{{value}}</td></tr> \
				</table> \
			  </div>',    		
        events: {
        },
        rendered:false,
        initialize:function (options) {
            var self = this;

            _.bindAll(this, 'render', 'redraw', 'computeData');

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

            this.uid = "" + new Date().getTime() + Math.floor(Math.random() * 10000); // generating an unique id for the map
            this.$el = options.el;
            this.axisField = options.axisField;
            this.valueField = options.valueField;
            this.filterField = options.filterField;
            this.filterValue = options.filterValue;
            this.series1Field = options.series1Field;
            this.series2Field = options.series2Field;
            
            var margin = {top: 120, right: 0, bottom: 10, left: 120}
            
            this.width = this.options.state.width || 200
            this.height = this.options.state.height || 200
            
            if (this.options.state.customTooltipTemplate)
            	this.tooltipTemplate = this.options.state.customTooltipTemplate
            else this.tooltipTemplate = this.defaultTooltipTemplate
         
            var tmplData = {
            					width: this.width+margin.left+margin.right,
            					height: this.height+margin.top+margin.bottom,
            					marginLeft: margin.left,
            					marginTop: margin.top 
            				}
            var out = Mustache.render(this.template, tmplData);
            this.$el.html(out);
            
            this.svg = d3.select("#"+this.$el[0].id+" svg g")
        },
        computeData: function() {
            var self = this;

            var matrix = [];
            // filter records for the co-occurrence
            var records = [];
            if (self.filterField && self.filterValue)
            	records = _.filter(this.model.getRecords(), function(rec) { return rec.attributes[self.filterField] == self.filterValue; });
            else records = this.model.getRecords();
            
            if (records.length == 0)
            	return null;
            
            var series1Values = _.uniq(_.map(records, function(rec) { return rec.attributes[self.series1Field]})) 
            var series2Values = _.uniq(_.map(records, function(rec) { return rec.attributes[self.series2Field]})) 
            var seriesValues = _.uniq(series1Values.concat(series2Values))
            
            var nodes = [];
            var n = seriesValues.length;            
            // Set index in each node
            _.each(seriesValues, function(val, i) {
            	var node = {}
                node.index = i;
                node.val = 0;
                node.name = val;
                matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
                nodes.push(node);
            });
            
            var min,max;
            // populate matrix
            _.each(records, function(rec) {
            	var source = rec.attributes[self.series1Field]
            	var target = rec.attributes[self.series2Field]
            	var src = _.find(nodes, function(node) {return node.name == source}).index
            	var trg = _.find(nodes, function(node) {return node.name == target}).index
            	var value = rec.attributes[self.valueField]
            	if (src != trg)
        		{
                	if (min)
                		min = (value < min ? value : min)
                	else min = value;

                	if (max)
                		max = (value > max ? value : max)
                	else max = value;
        		}
            	matrix[src][trg].z = value
            	nodes[src].val += value
            	nodes[trg].val += value
            });
            // compute clusters
            var groups = [];
            var assignedIdxs = [];
            
            function assignGroup(currGroup, riga) {
            	if (typeof groups[currGroup] == "undefined" || groups[currGroup] == null)
        		{
            		groups[currGroup] = [riga]
            		assignedIdxs.push(riga);
        		}
            	
	            for (var c = 0; c < n; c++)
	            	if (matrix[riga][c].z > 0 && !_.contains(assignedIdxs, c))
            		{
	            		groups[currGroup].push(c);
	            		assignedIdxs.push(c);
            		}
	            
	            for (var i = 0; i <groups[currGroup].length; i++)
	        	{
	            	var currCol = groups[currGroup][i];
	            	for (var r = 0; r < n; r++)
	                	if (matrix[r][currCol].z > 0 && !_.contains(assignedIdxs, currCol))
                		{
	                		groups[currGroup].push(currCol)
		            		assignedIdxs.push(currCol);
                		}
	        	}
            }
            function findGroupByIndex(idx) {
            	for (var g = 0; g < groups.length; g++)
            		if (_.contains(groups[g], idx))
            			return g;
            	
            	return groups.length;
            }
            
            assignGroup(0, 0);
            
        	for (r = 1; r < n; r++)
        		if (groups.length < 9 && assignedIdxs.length < n)
        			if (!_.contains(assignedIdxs, r))
        				assignGroup(groups.length, r);
        			else assignGroup(findGroupByIndex(r), r);
        	
        	_.each(nodes, function(currNode) {
        		var g = findGroupByIndex(currNode.index);
        		currNode.group = g;
        	})
            
            var x = d3.scale.ordinal().rangeBands([0, this.width]);
            var z = d3.scale.linear().domain([min, max]).clamp(true);
            var c = d3.scale.category10().domain(d3.range(10));
            
            // Precompute the orders.
            var orders = {
                name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
                val: d3.range(n).sort(function(a, b) { return nodes[b].val - nodes[a].val; }),
                group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
              };

            if (self.options.orderMode)
        	{
                if (self.options.orderMode.toLowerCase().indexOf("cluster") >= 0)
                	x.domain(orders.group);
                else if (self.options.orderMode.toLowerCase().indexOf("name") >= 0)
                	x.domain(orders.name);
                else if (self.options.orderMode.toLowerCase().indexOf("value") >= 0)
                	x.domain(orders.val);
        	}
            else x.domain(orders.group);
            
            return {matrix: matrix, nodes: nodes, x: x, z: z, c: c } 
        },
        render:function () {
        	var self = this;
        	var chartData = this.computeData();
        	if (!chartData)
        		return null;
        	
        	var matrix = chartData.matrix;
        	var nodes = chartData.nodes;
        	var x = chartData.x;
        	var z = chartData.z;
        	var c = chartData.c;
        	
              this.svg.append("rect")
                  .attr("class", "background")
                  .attr("width", self.width)
                  .attr("height", self.height);

              var row = this.svg.selectAll(".row")
                  .data(matrix)
                .enter().append("g")
                  .attr("class", "row")
                  .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
                  .each(row);

              row.append("line")
                  .attr("class", "line")
                  .attr("x2", this.width);

              row.append("text")
                  .attr("x", -6)
                  .attr("y", x.rangeBand() / 2)
                  .attr("dy", ".32em")
                  .attr("text-anchor", "end")
                  .text(function(d, i) { return nodes[i].name; });

              var column = this.svg.selectAll(".column")
                  .data(matrix)
                .enter().append("g")
                  .attr("class", "column")
                  .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

              column.append("line")
                  .attr("class", "line")
                  .attr("x1", -this.width);

              column.append("text")
                  .attr("x", 6)
                  .attr("y", x.rangeBand() / 2)
                  .attr("dy", ".32em")
                  .attr("text-anchor", "start")
                  .text(function(d, i) { return nodes[i].name; });
              
              this.rendered = true;

              function row(row) {
                var cell = d3.select(this).selectAll(".cell")
                    .data(row.filter(function(d) { return d.z; }))
                  .enter().append("rect")
                    .attr("class", "cell")
                    .attr("x", function(d) { return x(d.x); })
                    .attr("width", x.rangeBand())
                    .attr("height", x.rangeBand())
                    .style("fill-opacity", function(d) { return z(d.z); })
                    .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout);
              }

              function mouseover(p) {
              	// start:  display tooltip  
              	var matrixOffset = self.$el.position()
                  var objRect = this.getBoundingClientRect();
                  var docRect = document.body.getBoundingClientRect()
                  var pos = {
                      left: objRect.left + objRect.width / 2,
                      top: objRect.top + objRect.height / 2 - docRect.top
                  };

                  var values = {
                      name1: nodes[p.x].name,
                      name2: nodes[p.y].name,
                      value: p.z,
                  }
                  var content = Mustache.render(self.tooltipTemplate, values);
                  var $matrixElem = self.$el
                  var gravity = (pos.top < $matrixElem[0].offsetTop + $matrixElem.height() / 2 ? 'n' : 's');

                  nv.tooltip.show([pos.left, pos.top], content, gravity, null, $matrixElem[0]);
              	// end:  display tooltip  

                d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
                d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
              }

              function mouseout() {
            	  nv.tooltip.cleanup();
            	  
                d3.selectAll("text").classed("active", false);
              }
        },

        redraw:function () {
            var self = this;
            if (!this.rendered)
            	return this.render.apply(this);
            
        	var chartData = this.computeData();
        	if (!chartData)
        		return null;
        	
        	var matrix = chartData.matrix;
        	var nodes = chartData.nodes;
        	var x = chartData.x;
        	var z = chartData.z;
        	var c = chartData.c;

          var t = self.svg.transition().duration(200);

          t.selectAll(".row")
              .delay(function(d, i) { return x(i); })
              .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .selectAll(".cell")
              .delay(function(d) { return x(d.x); })
              .attr("x", function(d) { return x(d.x); });

          t.selectAll(".column")
              .delay(function(d, i) { return x(i); })
              .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
        
            },
    });
    return my.D3CooccurrenceMatrix;

});

