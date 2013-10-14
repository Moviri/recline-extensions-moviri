define(['jquery', 'recline-extensions-amd', 'd3'], function ($, recline, d3v3) {

    recline.View = recline.View || {};

    var my = recline.View


    my.D3ChoroplethMap = Backbone.View.extend({
    	rendered: false,
    	template:'{{#showZoomCtrl}}<input type="range" id="mapZoomCtrl" step="500" min="0" max="30000" value="{{scale}}" \
    				{{#mapWidth}} width={{mapWidth}}{{/mapWidth}} \
    				{{#mapHeight}} height={{mapHeight}}{{/mapHeight}} \
    			  >Zoom</input>{{/showZoomCtrl}} \
    			  <svg x="0" y="0" xmlns="http://www.w3.org/2000/svg" version="1.1" style="{{svgStyle}}"> \
    			  		<g class="regions"></g> \
    					<g class="regionLabels" pointer-events="none"></g> \
    					<g class="places" pointer-events="none"></g> \
    				</svg>',
        events: {
        	'change #mapZoomCtrl':'onZoomChanged',
        },    			  
        initialize:function (options) {
            var self = this;

            _.bindAll(this, 'render', 'redraw', 'getRecordByValue', 'getActionsForEvent', 'onZoomChanged', 'getLabelFor');

            this.model.bind('change', self.render);
            this.model.fields.bind('reset', self.render);
            this.model.fields.bind('add', self.render);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);

            this.uid = "" + new Date().getTime() + Math.floor(Math.random() * 10000); // generating an unique id for the map
            this.el = options.el;
            
            this.unselectedColor = "#C0C0C0";
            if (this.options.state.unselectedColor)
                this.unselectedColor = this.options.state.unselectedColor;

            this.mapWidth = this.options.state.width // optional. May be undefined
            this.mapHeight = this.options.state.height // optional. May be undefined
         
            var svgCustomStyle = '';
            if (this.options.state.svgStyle){
            	svgCustomStyle = this.options.state.svgStyle;
            } 
            if (this.mapWidth == null || typeof this.mapWidth == "undefined")
            	this.mapWidth = $(this.el).width()
            	
            if (this.mapHeight == null || typeof this.mapHeight == "undefined")
            	this.mapHeight = $(this.el).height()
            	
            this.scale = this.options.state.scale
            
            this.fieldLabels = this.options.state.fieldLabels;

            var tmplData = {scale: this.scale,  mapWidth: this.mapWidth, mapHeight: this.mapHeight, svgStyle: svgCustomStyle/*, showZoomCtrl: this.options.state.showZoomCtrl*/}
            var out = Mustache.render(this.template, tmplData);
            $(this.el).html(out);
            
            this.svg = d3v3.select(this.el+" svg")
        },
        getLabelFor: function(fieldName) {
        	if (this.fieldLabels && this.fieldLabels[fieldName])
        		return this.fieldLabels[fieldName]
        	
        	return fieldName;
        },

        render:function () {
            var self = this;


            var mapJson = this.options.state["mapJson"];
            var layer = this.options.state["layer"];
            var showRegionNames = this.options.state["showRegionNames"]
            var showCities = this.options.state["showCities"]
            var randomColors = this.options.state["randomColors"]
            
            var rotation = self.options.state["rotation"]
            if (rotation == null || rotation == "undefined")
            	rotation = [0,0]
            
            var clickFunction = function() {
        		$(self.el+" svg path.region").each( function() {
        			$(this).attr("class", $(this).attr("class").replace(" selected", ""))
        		});
        		$(this).attr("class", $(this).attr("class")+" selected")
        		
        		d3v3.event.preventDefault();
        	}
            var hoverFunction = function() {/*console.log("HOVERING "+this.attributes.regionName.nodeValue)*/}
            
            // find all fields of this layer
            //  mapping: [{srcShapeField: "state", srcValueField: "value", destAttribute: "name", destLayer: "usa"}],
            var fields = _.filter(this.options.state["mapping"], function(m) {
                return m.destLayer == layer;
            });

            if(fields.length > 1)
                throw "view.D3.ChoroplethMap.js: more than one field associated with layer, impossible to link with actions"

            if(fields.length == 1)
        	{
                // find all actions for selection and hover
                var clickEvents = self.getActionsForEvent("selection");
                var hoverEvents = self.getActionsForEvent("hover");

                // filter actions that doesn't contain fields
                var clickActions = _.filter(clickEvents, function(d) {
                    return d.mapping.srcField == fields.srcShapeField;
                });
                var hoverActions = _.filter(hoverEvents, function(d) {
                    return d.mapping.srcField == fields.srcShapeField;
                });
                if (clickActions.length)
            	{
                	clickFunction = function() {
    					var region = this.attributes.regionName.nodeValue
    					var mappings = self.options.state.mapping
    					mappings.forEach(function(m) {
        		            var selectedRecord = self.getRecordByValue(m.srcShapeField, region);
    		            	clickActions.forEach(function (currAction) {
    		                    currAction.action.doAction([selectedRecord], currAction.mapping);
    		                });
    					})
            		}
            	}
                var handleMouseover = function () {}
                
                if (self.options.state.customTooltipTemplate)
                	handleMouseover = function (e) {
                		//console.log(e)
                		var mapOffset = $(self.el).position()
                		var objRect = this.getBoundingClientRect();
                		var docRect = document.body.getBoundingClientRect()
    	                var pos = {left: objRect.left+objRect.width/2, top: objRect.top+objRect.height/2 - docRect.top};
    	                var selectedKpi = self.getLabelFor(self.options.state.mapping[0].srcValueField)+':';
    	                var newXLabel = self.getLabelFor(self.options.state.mapping[0].srcShapeField)+':';
    	                var region = this.attributes.regionName.nodeValue;
    	                var selectedRecord = self.getRecordByValue(self.options.state.mapping[0].srcShapeField, region);
    	                var val = "N/A"
    	                if (selectedRecord)
                    	{
    	                	var field = self.model.fields.get(self.options.state.mapping[0].srcValueField)
    	                	if (field)
    	                		val = selectedRecord.getFieldValue(field)
                    	}
    	                if (typeof val != "string" || val.indexOf("N/A") == -1){
    	                	var values = { x: region, y: val, xLabel: newXLabel, yLabel: selectedKpi }
        	                var content = Mustache.render(self.options.state.customTooltipTemplate, values);
        	                var $mapElem = $(self.el)
        	                //console.log("Tooltip for "+region+" at "+pos.left+","+pos.top)
        	                //var gravity = (pos.left < $mapElem[0].offsetLeft + $mapElem.width()/2 ? 'w' : 'e');
        	                var gravity = (pos.top < $mapElem[0].offsetTop + $mapElem.height()/2 ? 'n' : 's');
        	                
        	                nv.tooltip.show([pos.left, pos.top], content, gravity, null, $mapElem[0]);	
    	                }
    	                
    	            };
                var mouseout = function () {
                	nv.tooltip.cleanup();
                }
                if (hoverActions.length)
            	{
                    hoverFunction = function() {
    					var region = this.attributes.regionName.nodeValue
    					var mappings = self.options.state.mapping
    					mappings.forEach(function(m) {
        		            var selectedRecord = self.getRecordByValue(m.srcShapeField, region);
        		            hoverActions.forEach(function (currAction) {
    		                    currAction.action.doAction([selectedRecord], currAction.mapping);
    		                });
    					})
            		}
            	}
                else hoverFunction = handleMouseover
        	}
            
	        d3v3.json(mapJson, function(error, map) {
	        	self.mapObj = map
	        	if (map == null || typeof map == "undefined")
	        		return;
	        	
	        	self.regionNames = _.pluck(self.mapObj.objects[layer].geometries, 'id')   // build list of names for later use
	        	
	        	var regions = topojson.object(map, map.objects[layer]);
	
	        	var projection = d3v3.geo.mercator()
	        		.center(self.options.state["center"])
	        		.rotate(rotation)
	        		.scale(self.scale)
	        		.translate([self.mapWidth / 2, self.mapHeight / 2]);
	        	
	        	var path = d3v3.geo.path().projection(projection);
	        	
	        	var assignColors = function() {
	        		return self.unselectedColor;
	        	}
	        	if (randomColors)
	        		assignColors = function() {
		        		var c = Math.floor(Math.random()*4+6)
		        		var h = Math.floor(Math.random()*2)*8
		        		return "#"+c+h+c+h+c+h; 
	        	}
	        	// draw regions
	        	self.svg.select("g.regions").selectAll(".region")
		            .data(regions.geometries)
		        	.enter().append("path")
		        	.on("click", clickFunction)
		        	.on("mouseover", hoverFunction)
		        	.on("mouseout", mouseout)
		            .attr("class", function(d) { return "region " + toAscii(d.id); })
		            .attr("regionName", function(d) { return d.id; })
		        	.attr("fill", assignColors)
		            .attr("d", path)
	
	        	// draw region names
	            if (showRegionNames)
            	{
	            	var minArea = self.options.state["minRegionArea"] || 6 
	            	var onlyBigRegions = {
	            							geometries: _.filter(map.objects[layer].geometries, function(r) { return r.properties.Shape_Area > minArea}),
	            							type: "GeometryCollection"
	            						}
	            	self.svg.select("g.regionLabels").selectAll(".region-label")
			            .data(topojson.object(map, onlyBigRegions).geometries)
			            .enter().append("text")
			            .attr("class", function(d) { return "region-label " + toAscii(d.id); })
			            .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
			            .attr("regionName", function(d) { return d.id; })
			            .attr("dy", ".35em")
			            .text(function(d) { return d.id; });
            	}
	        	
	        	if (map.objects.cities && showCities)
	        	{
	        		// draw circles for cities
	        		self.svg.select("g.places").append("path")
		        	    .datum(topojson.object(map, map.objects.cities))
		        	    .attr("d", path)
		        	    .attr("class", "place");
	        		
	        		// draw city names
	        		self.svg.select("g.places").selectAll(".place-label")
		        	    .data(topojson.object(map, map.objects.cities).geometries)
		        		.enter().append("text")
		        	    .attr("class", "place-label")
		        	    .attr("transform", function(d) { return "translate(" + projection(d.coordinates) + ")"; })
		        	    .attr("dy", ".35em")
		        	    .attr("dx", ".8em")
		        	    .text(function(d) { return d.properties.name; });
	        	}
	        	if (randomColors == null || typeof randomColors == "undefined")
	        		self.redraw(); // apply color schema colors if present
	        	
		        self.rendered = true;
	        });
            return this;
        },

        redraw:function () {
            var self = this;
        	
            if(!self.rendered || !self.mapObj)
                return;
            
            var layer = this.options.state["layer"];
            var mapping = this.options.state["mapping"];

            _.each(mapping, function (currentMapping) {
                var filteredResults = self._getDataFor(
                    self.regionNames,
                    currentMapping["srcShapeField"],
                    currentMapping["srcValueField"]);

	            self.svg.selectAll("path.region")
					.attr("fill", function () {
						var region = this.attributes.regionName.nodeValue 
						//console.log(region)
                        var res = filteredResults[region];

                        // check if current shape is present into results
                           if(res != null)
                                return res.color;
                            else
                                return self.unselectedColor;
                    });
            });


        },
        onZoomChanged: function(e) {
            var $target = $(e.currentTarget);
            this.scale = $target.val;
            // WORK IN PROGRESS. NOT IMPLEMENTED
            //$(this.el).find("svg path").remove();
            //$(this.el).find("svg text").remove();
            //this.render();
        },

        // todo this is not efficient, a list of data should be built before and used as a filter
        // to avoid arrayscan
        _getDataFor:function (paths, srcShapeField, srcValueField) {
            var self=this;
            var resultType = "filtered";
            if (self.options.useFilteredData !== null && self.options.useFilteredData === false)
                resultType = "original";

            var records = self.model.getRecords(resultType);  //self.model.records.models;
            var srcShapef = self.model.fields.get(srcShapeField);
            var srcValuef = self.model.fields.get(srcValueField);

            var selectionActive = false;
            if (self.model.queryState.isSelected())
                selectionActive = true;

            var res = {};
            if (srcShapef && srcValuef)
        	{
	            _.each(records, function (d) {
	
	                if(_.contains(paths, d.getFieldValueUnrendered(srcShapef))) {
	                    var color = self.unselectedColor;
	                    if(selectionActive) {
	                        if(d.isRecordSelected())
	                            color = d.getFieldColor(srcValuef);
	                    }
	                    else 
	                    {
	                    	var newColor = d.getFieldColor(srcValuef);
	                        if (newColor != null) 
	                        	color = newColor; 
	                    }
	
	                    res[d.getFieldValueUnrendered(srcShapef)] =  {record: d, field: srcValuef, color: color, value:d.getFieldValueUnrendered(srcValuef) };
	
	                }
	            });
        	}
            //else throw "Invalid model for map! Missing "+srcShapeField+" and/or "+srcValueField
            return res;
        },
        getRecordByValue:function (srcShapeField, value) {
            var self=this;
            var resultType = "filtered";
            if (self.options.useFilteredData !== null && self.options.useFilteredData === false)
                resultType = "original";

            var records = self.model.getRecords(resultType);  //self.model.records.models;
            var srcShapef = self.model.fields.get(srcShapeField);

            return _.find(records, function(d) { return d.getFieldValueUnrendered(srcShapef) == value; });
        },        

        getActionsForEvent:function (eventType) {
            var self = this;
            var actions = [];

            _.each(self.options.actions, function (d) {
                if (_.contains(d.event, eventType))
                    actions.push(d);
            });

            return actions;
        }


    });


});

