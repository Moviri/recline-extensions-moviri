define(['backbone', 'REM/recline-extensions/recline-extensions-amd', 'mustache', 'REM/recline-extensions/views/view.slickgrid_graph'], function (Backbone, recline, Mustache) {

    recline.View = recline.View || {};

    var view = recline.View;

    "use strict";

    // param
    // model
    // facet span

    view.FacetDashboard = Backbone.View.extend({
        template:'<div id="facet-widget-{{uid}}">' +
                '<div id="facet-selector-{{uid}}"></div>' +
                '<div id="facet-container-{{uid}}">' +
                    '<div class="row" id="facet-container-row-{{uid}}"></div>' +
                '</div>' +
            '</div>',

        initialize:function (options) {
            var self=this;
            this.options = options;
            this.uid = ("facet_" + new Date().getTime() + Math.floor(Math.random() * 10000));

            this.el = $(this.el);

            this.listenTo(this.model.facets, 'reset', function (facets) {
                self.render();
            });

            this.listenTo(this.model.facets, 'add', function (facet) {
                self.addFacet(facet);
            });

            var out = Mustache.render(this.template, this);
            this.el.html(out);

            this.render();
        },


        render:function () {
            var self = this;

            _.each(self.model.facets.toJSON(), function(f) {
                 self.addFacet(f.id, f.terms);
            });

        },

        /*
                data: {count:, term:}
         */
        addFacet: function(name, data){
            var self=this;
            var o = self.options;

            var model = new recline.Model.Dataset({
                records: data,
                fields:[ {id:'count', type:'number'}, {id:'term', type:'string'} ]
            });

            var el = $('#facet-container-row-' + self.uid);

            if($("#facet-" + self.uid + "-" + name).length == 0 ) {
                el.append("<div class='" + o.facetClass + "' id='facet-" + self.uid + "-" + name + "'>"+ name
                    +"<div style='height:"+ o.facetHeight + "px' id='facet-table-"+self.uid+ "-" + name + "'></div></div>");
            }

            var filterAction = new recline.Action({
                filters:{
                    filter_facet: {type:"list", field:name}
                },
                models: [{ model: model, filters:["filter_facet"]  }],
                type:["filter"]
            });

            var grid1 = new recline.View.SlickGridGraph({
                model:model,
                el:$("#facet-table-" + self.uid + "-" + name ),
                actions: [{
                    action: filterAction,
                    mapping:[ {srcField:"term", filter:"filter_facet"} ],
                    event:["selection"]
                }]
            });
            grid1.visible = true;

            model.fetch();

        },

        redraw:function () {
          var self=this;
        }
    });
    return view.FacetDashboard;
});