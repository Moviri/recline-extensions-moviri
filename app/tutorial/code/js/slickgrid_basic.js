require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.slickgrid_graph'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Stipendi2.csv',
    backend:'csv',
    id: 'model_stipendi',
    fieldsType: [
            {id:'Operai',   type:'number'},
            {id:'Impiegati',   type:'number'},
            {id:'Quadri',   type:'number'},
            {id:'Dirigenti',   type:'number'},
            {id:'Freelance',   type:'number'},
            {id:'Media',   type:'number'},
            {id:'Delta Perc',   type:'number'}
           ]
});

dataset.fetch();

var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
    el: $('#grid1'),
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }
});
grid1.visible = true;
grid1.render();

});