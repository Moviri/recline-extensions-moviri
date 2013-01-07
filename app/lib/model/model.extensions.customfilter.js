(function ($) {

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {
            addCustomFilterLogic: function(f) {
            if(this.attributes.customFilterLogic)
                this.attributes.customFilterLogic.push(f);
            else
                this.attributes.customFilterLogic = [f];
        }
    });


}(jQuery));