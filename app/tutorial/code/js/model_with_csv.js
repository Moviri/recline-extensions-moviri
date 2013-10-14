require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline-extensions/backend/backend.extensions.csv'
], function (recline, SlickGridGraph) {


var dataset = new recline.Model.Dataset({
    url:'tutorial/data/Noleggi4.csv',
    backend:'csv',
    id: 'model_noleggi',
// press "?" button in run panel to read important
// information on CSV models
    fieldsType: [ 
            {id:'Data', type:'date'},
            {id:'Noleggi auto',   type:'number'},
            {id:'Noleggi moto',   type:'number'},
            {id:'Noleggi bici',   type:'number'},
            {id:'Auto noleggiate',   type:'integer'},
            {id:'Moto noleggiate',   type:'integer'},
            {id:'Bici noleggiate',   type:'integer'}
           ]
});

dataset.fetch();

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }
});
grid1.visible = true;
grid1.render();

});