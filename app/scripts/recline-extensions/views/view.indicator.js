/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function ($, my) {

// ## Indicator view for a Dataset 
//
// Initialization arguments (in a hash in first parameter):
//
// * model: recline.Model.Dataset (should be a VirtualDataset that already performs the aggregation
// * state: (optional) configuration hash of form:
//
//        { 
//          series: [{column name for series A}, {column name series B}, ... ],   // only first record of dataset is used
//			format: (optional) format to use (see D3.format for reference)
//        }
//
// NB: should *not* provide an el argument to the view but must let the view
// generate the element itself (you can then append view.el to the DOM.
    my.Indicator = Backbone.View.extend({
        defaults:{
            format:'d'
        },

        compareType:{
            self:this,
            percentage:function (kpi, compare, templates, condensed, shapeAfter) {
                var tmpField = new recline.Model.Field({type:"number", format:"percentage"});
                var unrenderedValue = kpi / compare * 100;
                var data = recline.Data.Formatters.Renderers(unrenderedValue, tmpField);
                var template = templates.templatePercentage;
                if (condensed == true){
                	if (shapeAfter == true){
                		template = templates.templateCondensedShapeAfter;
                	} else {
                		template = templates.templateCondensed;	
                	}                	
                }
                return {data:data, template:template, unrenderedValue: unrenderedValue, percentageMsg: " % of total: "};
            },
            percentageVariation:function (kpi, compare, templates, condensed, shapeAfter) {
                var tmpField = new recline.Model.Field({type:"number", format:"percentage"});
                var unrenderedValue = (kpi-compare) / compare * 100;
                var data = recline.Data.Formatters.Renderers( unrenderedValue, tmpField);
                var template = templates.templatePercentage;
                if (condensed == true){
                	if (shapeAfter == true){
                		template = templates.templateCondensedShapeAfter;
                	} else {
                		template = templates.templateCondensed;	
                	} 
                }	
                return {data:data, template:template, unrenderedValue: unrenderedValue, percentageMsg: ""};
            },
            nocompare: function (kpi, compare, templates, condensed, shapeAfter){
                var template = templates.templateBase;
                if (condensed == true){
                	if (shapeAfter == true){
                		template = templates.templateCondensedShapeAfter;
                	} else {
                		template = templates.templateCondensed;	
                	}                	
                }
            	
                return {data:null, template:template, unrenderedValue:null};
            }


        },

        templates:{
   templateBase:
   '<div class="indicator"> \
      <div class="panel indicator_{{viewId}}"> \
        <div id="indicator_{{viewId}}"> \
			<table class="indicator-table"> \
                <tr class="titlerow"><td></td><td style="text-align: center;" class="title">{{{label}}}</td></tr>    \
                <tr class="descriptionrow"><td></td><td style="text-align: center;" class="description"><small>{{description}}</small></td></tr>    \
                <tr class="shaperow"> \
	   				<td><div class="shape">{{{shape}}}</div> \
	   				<div class="compareshape">{{{compareShape}}}</div> \
	   				</td><td class="value-cell"><div class="kpi_value">{{{value}}}</div></td>\
	   				<td class="aftershape">{{{afterShape}}}</td> \
	   			</tr> \
             </table>  \
		</div>\
      </div> \
    </div> ',
    templateCondensed:
        '<div class="indicator round-border-dark" > \
    	    <div class="panel indicator_{{viewId}}" > \
        		<div id="indicator_{{viewId}}" class="indicator-container" > \
        			<div class="round-border" style="float:left;margin:2px 2px 0px 2px"> \
    					{{#compareShape}} \
    					<div class="compareshape" style="float:left">{{{compareShape}}}</div> \
    					{{/compareShape}} \
						{{#shape}} \
    	                <div class="shape" style="float:left">{{{shape}}}</div> \
    					{{/shape}} \
        				<div class="value-cell" style="float:left"><div class="kpi_value">{{{value}}}</div></div> \
    					<div class="aftershape" style="float:left">{{{afterShape}}}</div> \
    				</div> \
    				{{#label}}<div class="title">&nbsp;&nbsp;{{{label}}}</div>{{/label}}\
    			</div> \
    	    </div> \
        </div>',
    templateCondensedShapeAfter:
        '<div class="indicator round-border-dark" > \
    	    <div class="panel indicator_{{viewId}}" > \
    			<div class="title">{{{label}}}</div>\
        		<div id="indicator_{{viewId}}" class="indicator-container"> \
			    	<div class="round-border" style="float:left;margin:2px 2px 0px 2px"> \
    				<div class="value-cell" style="float:left">{{{value}}}</div> \
					{{#compareShape}} \
					<div class="compareshape" style="float:left">{{{compareShape}}}</div> \
					{{/compareShape}} \
					{{#shape}} \
			        <div class="shape" style="float:left">{{{shape}}}</div> \
					{{/shape}} \
    			</div> \
    			</div> \
    	    </div> \
        </div>',
	templatePercentage:
	   '<div class="indicator"> \
	      <div class="panel indicator_{{viewId}}"> \
	        <div id="indicator_{{viewId}}"> \
				 <div class="indicator-table"> \
	                <div class="titlerow"><span class="title">{{{label}}}</span></div>    \
	                <div class="descriptionrow"><span class="description"><small>{{description}}</small></span></div>    \
	                <div class="shaperow"> \
						<div class="shape">{{{shape}}}</div> \
						<span class="value-cell"> \
							<div style="white-space: nowrap;"> \
								<div class="kpi_value">{{{value}}}</div> \
								<div class="kpi_compare_shape_container"> \
									<div class="kpi_compare_shape_shape" >{{{compareShape}}}</div> \
									<div class="kpi_compare_shape_msg">{{{percentageMsg}}}{{{compareValue}}}</div>\
								</div> \
							</div> </span> \
					</div>  \
	             </div>  \
			</div>\
	      </div> \
	    </div> '
	
        },
        initialize:function (options) {
            var self = this;

            this.el = $(this.el);
            _.bindAll(this, 'render');
            this.uid = options.id || ("" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart

            this.model.bind('query:done', this.render);
            
            if (this.options.modelCompare)
        	{
            	this.modelCompare = this.options.modelCompare
            	this.modelCompare.bind('query:done', this.render);
        	}
            else this.modelCompare = this.model;
        },
        render:function () {
            //console.log("View.Indicator: render");

            var self = this;
            var tmplData = {};
            tmplData["viewId"] = this.uid;
            tmplData.label = this.options.state && this.options.state["label"];

            var kpi = self.model.getRecords(self.options.state.kpi.type);

            var field;
            if (self.options.state.kpi.aggr)
                field = self.model.getField_byAggregationFunction(self.options.state.kpi.type, self.options.state.kpi.field, self.options.state.kpi.aggr);
            else
                field = self.model.getFields(self.options.state.kpi.type).get(self.options.state.kpi.field);

            if (!field){
            	if (self.model.attributes.dataset && !self.model.attributes.dataset.recordCount)
        		{
            		// virtual model has no valid fields since starting model has no record. Must only display N/A
        		}
            	else throw "View.Indicator: unable to find field [" + self.options.state.kpi.field + "] on model"
            }     
                
            var textField = null;
            if (self.options.state.condensed == true && self.options.state.kpi.textField)
        	{
                if (self.options.state.kpi.aggr)
                	textField = self.model.getField_byAggregationFunction(self.options.state.kpi.type, self.options.state.kpi.textField, self.options.state.kpi.aggr);
                else
                	textField = self.model.getFields(self.options.state.kpi.type).get(self.options.state.kpi.textField);

                if (!textField)
                    throw "View.Indicator: unable to find field [" + self.options.state.kpi.textField + "] on model"
        	}

            var kpiValue;


            if (kpi.length > 0 && field) {
                kpiValue = kpi[0].getFieldValueUnrendered(field);
                tmplData["value"] = kpi[0].getFieldValue(field);
                tmplData["shape"] = kpi[0].getFieldShape(field, true, false);
                if (self.options.state.condensed == true && textField){
                	if (self.options.maxLabelLength){ // TODO DOCUMENT the maxLabelLength option
                		var fullText =  kpi[0].getFieldValue(textField);

                		if ( fullText && fullText.length > self.options.maxLabelLength){
                            var truncatedText = fullText.substring(0, self.options.maxLabelLength);
                            tmplData["label"] = '<abbr title="' + fullText + '">'+truncatedText+'...</abbr>';
                		} else {
                			tmplData["label"] = kpi[0].getFieldValue(textField);
                		}                			
                	} else {
                		tmplData["label"] = kpi[0].getFieldValue(textField);	
                	}                	
                }	
            }
            else tmplData["value"] = "N/A";

            var template = this.templates.templateBase;
            if (self.options.state.condensed == true)
            	template = self.templates.templateCondensed;            

            if (self.options.state.compareWith) {
                var compareWithRecord = self.modelCompare.getRecords(self.options.state.compareWith.type);

                if(compareWithRecord.length > 0) {
                    var compareWithField;

                    if (self.options.state.kpi.aggr)
                        compareWithField = self.modelCompare.getField_byAggregationFunction(self.options.state.compareWith.type, self.options.state.compareWith.field, self.options.state.compareWith.aggr);
                    else
                        compareWithField = self.modelCompare.getFields(self.options.state.compareWith.type).get(self.options.state.compareWith.field);

                    if (!compareWithField) {
                    	if (self.modelCompare.attributes && self.modelCompare.attributes.dataset && self.modelCompare.attributes.dataset.recordCount)
                    	   throw "View.Indicator: unable to find field [" + self.options.state.compareWith.field + "] on model"
                    	else return; // parent model is empty. skip the rendering
                    } 
                	 tmplData["compareWithValue"] = compareWithRecord[0].getFieldValue(compareWithField);
                     var compareWithValue = compareWithRecord[0].getFieldValueUnrendered(compareWithField);

                     var compareValue;

                     var compareValue = self.compareType[self.options.state.compareWith.compareType](kpiValue, compareWithValue, self.templates, self.options.state.condensed, self.options.state.shapeAfter);
                     if(!compareValue){
                    	   throw "View.Indicator: unable to find compareType [" + self.options.state.compareWith.compareType + "]";	 
                     }
                	 tmplData["compareValue"] = compareValue.data;

                     if(self.options.state.compareWith.shapes) {
                         if(compareValue.unrenderedValue == 0)
                             tmplData["compareShape"] = self.options.state.compareWith.shapes.constant;
                         else if(compareValue.unrenderedValue > 0)
                             tmplData["compareShape"] = self.options.state.compareWith.shapes.increase;
                         else if(compareValue.unrenderedValue < 0)
                             tmplData["compareShape"] = self.options.state.compareWith.shapes.decrease;
                     }

                     if(compareValue.template)
                         template = compareValue.template;	 
                
                }
            } else if (self.options.state.fillCompareSpace){
            	template = this.templates.templatePercentage;
            }
            if ((tmplData["shape"] == null || typeof tmplData["shape"] == "undefined") 
            	&& (tmplData["compareShape"] == null || typeof tmplData["compareShape"] == "undefined"))
            	tmplData["compareShape"] = " " // ensure the space is filled

            if (this.options.showPercentageBar){
            	tmplData["afterShape"] = "<div class='indicator-percent-complete-bar-background' style='float:left;'>"
                    + "<span class='indicator-percent-complete-bar' style='width:" + tmplData["value"] + "'></span></div>"
            }
            
            if (this.options.state.description)
                tmplData["description"] = this.options.state.description;
            
            if (compareValue && compareValue.percentageMsg)
            	tmplData["percentageMsg"] = compareValue.percentageMsg; 

            var htmls = Mustache.render(template, tmplData);
            $(this.el).html(htmls);


            //this.$graph = this.el.find('.panel.indicator_' + tmplData["viewId"]);


            return this;
        }






    });


})(jQuery, recline.View);
