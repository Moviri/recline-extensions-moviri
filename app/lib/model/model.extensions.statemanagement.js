recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {

    initialize: function () {
        var super_init = recline.Model.Dataset.prototype.initialize;
        return function(){
            super_init.call(this);

            if (this.get('initialState')) {
                this.get('initialState').setState(this);
            }

        };
    }()



});

