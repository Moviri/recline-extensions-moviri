(function ($) {
    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {


        getFacetByFieldId:function (fieldId) {
            return _.find(this.facets.models, function (facet) {
                return facet.id == fieldId;
            });
        }

    });







}(jQuery));

recline.Model.Query.prototype = $.extend(recline.Model.Query.prototype, {
    addFacetNoEvent:function (fieldId) {
        var facets = this.get('facets');
        // Assume id and fieldId should be the same (TODO: this need not be true if we want to add two different type of facets on same field)
        if (_.contains(_.keys(facets), fieldId)) {
            return;
        }
        facets[fieldId] = {
            terms:{ field:fieldId }
        };
        this.set({facets:facets}, {silent:true});

    }

});