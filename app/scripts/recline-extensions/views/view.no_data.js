this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function ($, view) {
    "use strict";

    view.NoDataMsg = Backbone.View.extend({
    	templateP1:"<div class='noData' style='display:table;width:100%;height:100%;'>" +
    			"<p style='display:table-cell;width:100%;height:100%;margin-left: auto;margin-right: auto;text-align: center;margin-bottom: auto;margin-top: auto;vertical-align: middle;'>",
    	template2P1:"<div class='noData' style='width:100%;height:100%;'>" +
    			"<p style='width:100%;height:100%;margin-left: auto;margin-right: auto;text-align: center;margin-bottom: 10px;margin-top:10px;'>",
    	_internalMsg : "No Data Available!",
    	templateP2:"</p></div>",
        initialize:function() {
        },
        create:function(msg) {
        	if (msg)
        		return this.templateP1+msg+this.templateP2;
        	
        	return this.templateP1+this._internalMsg+this.templateP2
        },
        create2:function(msg) {
        	if (msg)
        		return this.template2P1+msg+this.templateP2;
        	
        	return this.template2P1+this._internalMsg+this.templateP2
        }
    });
})(jQuery, recline.View);
