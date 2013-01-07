(function ($) {
    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {


        getFacetByFieldId:function (fieldId) {
            return _.find(this.facets.models, function (facet) {
                return facet.id == fieldId;
            });
        }

    });

}(jQuery));