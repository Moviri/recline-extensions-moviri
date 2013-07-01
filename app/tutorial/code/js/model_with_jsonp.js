require(['recline-extensions-amd', 'recline-extensions/data/data.formatters', 'recline-extensions/backend/backend.jsonp',
    'recline-extensions/views/view.slickgrid_graph'
], function (recline, SlickGridGraph, Backbone) {

    var dataset = new recline.Model.Dataset({
        url: 'tutorial/data/testDataDemo.jsonp',
        backend: 'jsonp',
        id: 'myTestData',
        fieldsFormat: [
            {id: "data", format: "localeTimeString"}
        ],
        renderer: recline.Data.Formatters.Renderers
    });

    dataset.fetch();

    var $el = $('#grid1');
    var grid1 = new SlickGridGraph({
        model: dataset,
        el: $el,
        state: {  fitColumns: true,
            useHoverStyle: true,
            useStripedStyle: true,
            useCondensedStyle: true
        }
    });
    grid1.visible = true;
    grid1.render();

});