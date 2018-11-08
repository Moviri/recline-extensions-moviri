/* global define */
define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'underscore', 'backbone'], function ($, recline, _, Backbone) {

    recline.View = recline.View || {};

    var view = recline.View;

    "use strict";

    view.AlertMessageView = Backbone.View.extend({
        rendered: false,
        timeout: 5000,
        container: $(document.body),
        //htmlInternalContainer: '<div id="alert-messages-container" style="position:absolute;top:5%;right:5%;z-index:100">',
        htmlErrorMessageLabel: '<div class="label label-important" style="border-radius:4px;font-size:14px;padding:10px;margin-bottom:5px;color:white;width:350px;float:left;clear:both"> \
                <button type="button" class="close" data-dismiss="alert">&times;</button> \
                <span class="inner-text">Error!</span> \
            </div>',
        initialize:function (args) {
            this.options = args;
            _.bindAll(this, 'showMessage');
        	if (args.container != null) {
        		this.container = args.container;
            }
            if (args.timeout && _.isFinite(args.timeout)) {
                this.timeout = args.timeout;
            }
        },
        showMessage:function(msg) {
            if (!this.rendered) {
                this.$el = $(this.container);
                this.rendered = true;
            }
            var $label = $(this.htmlErrorMessageLabel);
            $label.find(".inner-text").text(msg);
            this.$el.append($label);
            setTimeout(function() {
                $label.remove();
            }, this.timeout);
        }
    });
    return view.AlertMessageView;
});
