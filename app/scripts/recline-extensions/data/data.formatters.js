define(['recline.model.extensions.all', 'accounting'], function(recline, accounting) {

    recline.Data = recline.Data || {};
    recline.Data.Format = recline.Format || {};
    recline.Data.Formatters = recline.Formatters || {};

    var my = recline.Data;


    // formatters define how data is rapresented in internal dataset
    my.FormattersMoviri = {
        integer : function (e) { return (isFinite(e) ? parseInt(e, 10) : 0);},
        string  : function (e) { return (e ? e.toString() : null); }, 
        date    : function (e) { return new Date(parseInt(e)).valueOf() },
        float   : function (e) { return (isFinite(e) ? parseFloat(e, 10) : 0);},
        number  : function (e) { return (isFinite(e) ? parseFloat(e, 10) : 0);}
    };

    
    //my.Format.decimal = d3.format(".00f");
	
	my.Format.scale = function(options) {
		var calculateRange = function(rangePerc, dimwidth){			
			return [0, rangePerc*dimwidth];
		};
		
		return function(records, width, range) {			
			var ret = {}, count;
			
			ret.axisScale = {};
			var calcRange = calculateRange(range, width);
			
			if (options.type === 'linear') {
				var max = d3.max(records, function(record) {
					var max=0;
					count=0;
					_.each(options.domain, function(field) {
						max = (record.getFieldValue({"id":field}) > max) ? record.getFieldValue({"id":field}) : max;
						count++;
					});
					return max*count;
				});
								
				_.each(options.domain, function(field, i){
					var domain;
					var frange = [calcRange[0],calcRange[1]/count];
					
					if(i%2==1 && options.invertEven){
						domain = [max/count, 0];
					}else{
						domain=[0, max/count];
					}					

					ret.axisScale[field] = d3.scale.linear().domain(domain).range(frange);
				});			
				
				ret.scale = d3.scale.linear().domain([0, max]).range(calcRange);
			}
			
			return ret;
		};
	};

    my.Formatters.Renderers = function(val, field, doc)   {

        var r = my.Formatters.RenderersImpl[field.attributes.type];
        if(r==null) {
            throw "No custom renderers defined for field type " + field.attributes.type;
        }

        return r(val, field, doc);
    };

    my.Formatters.RenderersConvert_ALL_ = function(val, field, doc)   {

    	var stringFormatterFor_ALL_ = function(val, field, doc) {
    		//console.log(">>> My formatter: orig value is "+val)
    		//console.log(doc)
            var format = field.get('format');
            if (format === 'markdown') {
                if (typeof Showdown !== 'undefined') {
                    var showdown = new Showdown.converter();
                    out = showdown.makeHtml(val);
                    return out;
                } else {
                    return val;
                }
            } else if (format == 'plain') {
            	if (val)
            		return val.replace(/\b_ALL_\b/g, "All")
            	else return val;
            } else {
                // as this is the default and default type is string may get things
                // here that are not actually strings
                if (val && typeof val === 'string') {
                    val = val.replace(/(https?:\/\/[^ ]+)/g, '<a href="$1">$1</a>').replace(/\b_ALL_\b/g, "All");
                }
                return val
            }
        }
    	
        var r = my.Formatters.RenderersImpl[field.attributes.type];
        if(r==null) {
            throw "No custom renderers defined for field type " + field.attributes.type;
        }
        if (field.attributes.type == "string")
        	r = stringFormatterFor_ALL_;

        return r(val, field, doc);
    };

    // renderers use fieldtype and fieldformat to generate output for getFieldValue
    my.Formatters.RenderersImpl = {
        object: function(val, field, doc) {
            return JSON.stringify(val);
        },
        integer: function(val, field, doc) {
            var format = field.get('format');
            if(format === "currency_euro") {
               // return "€ " + val;
            	return accounting.formatMoney(val, { symbol: "€",  format: "%v %s", decimal : ".", thousand: ",", precision : 0 }); // �4,999.99
            }           
            return accounting.formatNumber(val, 0, ",");
        },
        date: function(val, field, doc) {
            var format = field.get('format');
            if(format == null || format == "date"){
            	return val;
            } else if(format === "localeTimeString") {
                return (new Date(val)).toLocaleString();
            } else if(format === "timeString"){
            	return (new Date(val)).toUTCString();
            }
            return new Date(val).toUTCString();
        },
        geo_point: function(val, field, doc) {
            return JSON.stringify(val);
        },
        number: function(val, field, doc) {
            var format = field.get('format');
            
            if (format === 'percentage') {
                try {
                    return accounting.formatNumber(val, 2, ",", ".") + '<small class="muted">%</small>';
                } catch(err) {
                    return "-";
                }

                
            } else if(format === "percentage_0to1") {
            	 try {
//            		 if (val > 1){ /***** FIXME: REMOVE *****/
//            			 return accounting.formatNumber(val, 2, ",", ".") + '<small class="muted">%</small>';
//            		 } else {
//            			 return accounting.formatNumber(val*100, 2, ",", ".") + '<small class="muted">%</small>';	 
//            		 }
            		 return accounting.formatNumber(val*100, 2, ",", ".") + '<small class="muted">%</small>';
                 } catch(err) {
                     return "-";
                 }
            } else if(format === "currency_euro") {
                try {
                    return accounting.formatMoney(val, { symbol: "",  format: "%v %s", decimal : ".", thousand: ",", precision : 0 }) + '<small class="muted">€</small>'; 
                 
                     
            		
                    // return "€ " + parseFloat(val.toFixed(2));
                } catch(err) {
                    return "-";
                }
            } else if(format === "currency_euro_decimal") {
                try {
                	return accounting.formatMoney(val, { symbol: "",  format: "%v %s", decimal : ".", thousand: ",", precision : 2 }) + '<small class="muted">€</small>';
                    
                    // return "€ " + parseFloat(val.toFixed(2));
                } catch(err) {
                    return "-";
                }
            }   else if (format === 'time') {
            	var sec_numb    = parseInt(val);
                var hours   = Math.floor(sec_numb / 3600);
                var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
                var seconds = sec_numb - (hours * 3600) - (minutes * 60);
                if (hours   < 10) {hours   = "0"+hours;}
                if (minutes < 10) {minutes = "0"+minutes;}
                if (seconds < 10) {seconds = "0"+seconds;}
                var time    = hours+':'+minutes+':'+seconds;
                return time;
               
            }  else if(format === "integer") {
                try {
                	return accounting.formatNumber(val, 0, ",", ".");
                } catch(err) {
                    return "-";
                }
            }

            try {
            	return accounting.formatNumber(val, 2, ",", ".");
                // return parseFloat(val.toFixed(2));
            }
            catch(err) {
                //console.log("Error in conferting val " + val + " toFixed");
                return "-";
            }


        },
        string: function(val, field, doc) {
            var format = field.get('format');
            if (format === 'markdown') {
                if (typeof Showdown !== 'undefined') {
                    var showdown = new Showdown.converter();
                    out = showdown.makeHtml(val);
                    return out;
                } else {
                    return val;
                }
            } else if (format == 'plain') {
                return val;
            } else if (format === 'time') {
            	var sec_numb    = parseInt(val);
                var hours   = Math.floor(sec_numb / 3600);
                var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
                var seconds = sec_numb - (hours * 3600) - (minutes * 60);
                if (hours   < 10) {hours   = "0"+hours;}
                if (minutes < 10) {minutes = "0"+minutes;}
                if (seconds < 10) {seconds = "0"+seconds;}
                var time    = hours+':'+minutes+':'+seconds;
                return time;
            } else {
                // as this is the default and default type is string may get things
                // here that are not actually strings
                if (val && typeof val === 'string') {
                    val = val.replace(/(https?:\/\/[^ ]+)/g, '<a href="$1">$1</a>');
                }
                return val
            }
        }
    },

    my.Formatters.getFieldLabel = function (field, fieldLabels) {

        var fieldLabel = field.attributes.label;
        if (field.attributes.is_partitioned)
            fieldLabel = field.attributes.partitionValue;

        if (fieldLabels) {
            var fieldLabel_alternateObj = _.find(fieldLabels, function (fl) {
                return fl.id == fieldLabel
            });
            if (typeof fieldLabel_alternateObj != "undefined" && fieldLabel_alternateObj != null)
                fieldLabel = fieldLabel_alternateObj.label;
        }

        return fieldLabel;
    }

    return recline;

});

