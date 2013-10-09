define(['jquery', 'recline-extensions-amd'], function ($, recline) {

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {
        /*fetch:function () {
            var super_init = recline.Model.Dataset.prototype.fetch;
            return function () {
                super_init.call(this);
                var self = this;
                if (self.attributes.renderer) {

                    _.each(self.fields.models, function (f) {
                        f.renderer = self.attributes.renderer;
                    });

                }
                ;


            }
        }()*/


        initialize:function () {
            var super_init = recline.Model.Dataset.prototype.initialize;
            return function () {
                super_init.call(this);
                _.bindAll(this, 'applyRendererToFields');

                this.fields.bind('reset', this.applyRendererToFields);
            };
        }(),

        applyRendererToFields: function() {
            var self = this;
            if (self.attributes.renderer) {
                _.each(self.fields.models, function (f) {
                    f.renderer = self.attributes.renderer;
                });
            }

        }



    });
});