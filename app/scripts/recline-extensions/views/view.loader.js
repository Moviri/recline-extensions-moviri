define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'mustache'], function ($, recline, Mustache) {

    recline.View = recline.View || {};

    var view = recline.View;

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

    	incLoaderCount : function() {
            var self = this;
    		this.loaderCount++;
    		//console.log("Start task - loaderCount = "+this.loaderCount)
			setTimeout(function() {
				self.divOver.show();
				$("#__loadingImage__").show();
			}, 0);
    	},
    	decLoaderCount : function() { 
    		var self = this;
    		this.loaderCount--;
    		//console.log("End task - loaderCount = "+this.loaderCount)
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
    			dataset.bind('query:start', self.incLoaderCount);
    			dataset.bind('query:done query:fail', self.decLoaderCount);
    		});
    	},
    	
    	bindDataset: function(dataset) {
    		dataset.bind('query:start', this.incLoaderCount);
    		dataset.bind('query:done query:fail', this.decLoaderCount);
    	},
    	bindCharts:function(charts) {
    		var self = this;
    		_.each(charts, function (chart) {
    			chart.bind('chart:startDrawing', self.incLoaderCount);
    			chart.bind('chart:endDrawing', self.decLoaderCount);
    		});
    	},
    	bindChart:function(chart) {
    		chart.bind('chart:startDrawing', this.incLoaderCount);
    		chart.bind('chart:endDrawing', this.decLoaderCount);
    	}    
    });

    return view.Loader;

});
