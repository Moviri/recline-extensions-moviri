define(["backbone", "recline", "recline.dataset" ], function(Backbone, recline) {
    require(["recline-extensions/model/model.extensions.query", "recline-extensions/model/model.extensions.facets" ]);

    return this.recline;
})
