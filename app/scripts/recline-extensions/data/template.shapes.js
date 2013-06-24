this.recline = this.recline || {};
this.recline.Template = this.recline.Template || {};
this.recline.Template.Shapes = this.recline.Template.Shapes || {};

(function($, my) {

   my.Shapes = {
        circle: function(color, isNode, isSVG) {
            var template = '<circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="{{color}}"/>';

            var data = {color: color};

            return my._internalDataConversion(isNode, isSVG, template, data );


        },
       empty: function(color, isNode, isSVG) { my._internalDataConversion(isNode, isSVG,  ""); }
   };

   my._internalDataConversion = function(isNode, isSVG, mustacheTemplate, mustacheData) {
       if(isSVG) {
           mustacheTemplate = "<svg>"+ mustacheTemplate +"</svg>";
       }
       var res =  Mustache.render(mustacheTemplate, mustacheData);

        if(isNode)
            return jQuery(res);
        else
            return res;
   }

}(jQuery, this.recline.Template));
