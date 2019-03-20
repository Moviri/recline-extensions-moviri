define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'mustache'], function ($, recline, Mustache) {

    recline.View = recline.View || {};

    var view = recline.View;
    var debugLoader = ($.cookie("debug_mode") === "DEBUG_LOADER" || $.cookie("debug_mode") === "DEBUG");

    "use strict";

    view.Loader = Backbone.View.extend({
    	divOver:  null,
    	loaderCount : 0,
    	defaultDivStyle : 'display:none;opacity:0.7;background:#f9f9f9;position:absolute;top:0;z-index:100;width:100%;height:100%;',
    	htmlLoaderTemplate : 
    		'<div id="__loadingImage__" style="display:block;"> \
    			<div style="position:absolute;top:45%;left:45%;width:150px;height:80px;z-index:100"> \
    				<p style="margin-left:auto;margin-right: auto;text-align: center;"> \
    					{{^iconName}} \
    						<img src="{{baseurl}}images/ajax-loader-blue.gif" > \
    					{{/iconName}} \
						{{#iconName}} \
    						<img src="{{iconName}}" > \
						{{/iconName}} \
    				</p> \
    			</div> \
    		</div>',
        initialize:function (args) {
            this.options = args;
            _.bindAll(this, 'render', 'incLoaderCount', 'decLoaderCount', 'bindDatasets', 'bindDataset', 'bindCharts', 'bindChart');
        	this.divOver = $('<div id="__grayedOutBackground__"/>');
        	this.divOver.attr('style', args.style || this.defaultDivStyle);
        	this.datasets = args.datasets;
        	this.charts = args.charts;
        	this.baseurl = "/"
        	if (args.baseurl)
        		this.baseurl = args.baseurl;
        	if (args.container != null)
        		this.container = args.container;
        	else this.container = $(document.body)
        	
    		this.container.append(this.divOver);
        },
        render:function () {
        	var out = Mustache.render(this.htmlLoaderTemplate, this.options);
        	this.container.append(out);
        	this.divOver.show();
        	this.bindDatasets(this.datasets);
        	this.bindCharts(this.charts);
        },

    	incLoaderCount : function(obj) {
            var self = this;
    		this.loaderCount++;
            if (debugLoader) {
                if (obj.constructor.name === "Dataset") {
            		console.log("Start task - loaderCount = "+this.loaderCount + " for Dataset "+obj.id + " cid " + obj.cid);
                }
                else {
                    console.log("Start task - loaderCount = "+this.loaderCount + " for Chart "+obj.cid + " $el "+ obj.$el.attr("id") + " using model "+ obj.model.cid);   
                }
            }
			setTimeout(function() {
				self.divOver.show();
				$("#__loadingImage__").show();
			}, 0);
    	},
    	decLoaderCount : function(obj) { 
    		var self = this;
    		this.loaderCount--;
            if (debugLoader) {
                if (obj.constructor.name === "Dataset") {
        		    console.log("End task - loaderCount = "+this.loaderCount + " for Dataset "+obj.id + " cid " + obj.cid);
                }
                else {
                    console.log("End task - loaderCount = "+this.loaderCount + " for Chart "+obj.cid + " $el "+ obj.$el.attr("id") +" using model "+ obj.model.cid);    
                }
            }
    		if (this.loaderCount <= 0) {
    			// setTimeout ensure task run async so that it can display even during blocking operations
    			setTimeout(function() {
    				$("#__loadingImage__").hide();
    				self.divOver.hide();
    			}, 0)
    			this.loaderCount = 0;
    		}
    	},
    	bindDatasets: function(datasets) {
    		var self = this;
    		_.each(datasets, function (dataset) {
    			dataset.bind('query:start', function() {self.incLoaderCount(dataset);});
    			dataset.bind('query:done query:fail', function() {self.decLoaderCount(dataset)});
    		});
    	},
    	
    	bindDataset: function(dataset) {
            var self = this;
    		dataset.bind('query:start', function() {self.incLoaderCount(dataset)});
    		dataset.bind('query:done query:fail', function() {self.decLoaderCount(dataset)});
    	},
    	bindCharts:function(charts) {
    		var self = this;
    		_.each(charts, function (chart) {
    			chart.bind('chart:startDrawing', function() {self.incLoaderCount(chart)});
    			chart.bind('chart:endDrawing', function() {self.decLoaderCount(chart)});
    		});
    	},
    	bindChart:function(chart) {
            var self = this;
    		chart.bind('chart:startDrawing', function() {self.incLoaderCount(chart)});
    		chart.bind('chart:endDrawing', function() {self.decLoaderCount(chart)});
    	}    
    });

    return view.Loader;

});
