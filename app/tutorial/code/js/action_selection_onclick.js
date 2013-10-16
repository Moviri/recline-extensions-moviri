require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline-extensions/views/widget.genericfilter'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Stipendi.csv',
    backend:'csv',
    id: 'model_stipendi',
    fieldsType: [
            {id:'Operai',   type:'number'},
            {id:'Impiegati',   type:'number'},
            {id:'Quadri',   type:'number'},
            {id:'Dirigenti',   type:'number'},
            {id:'Freelance',   type:'number'}
           ]
});

dataset.queryState.addFacetNoEvent("Regione");
dataset.queryState.setSortCondition({field: "Regione", order:"asc"});
dataset.fetch();

var dataset2 = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Rendita Regioni.csv',
    backend:'csv',
    id: 'model_rendita_regioni',
    fieldsType: [
            {id:'Agricoltura',   type:'number'},
            {id:'Industria',   type:'number'},
            {id:'Produzione',   type:'number'},
            {id:'Servizi',   type:'number'},
            {id:'Turismo',   type:'number'}
           ]
});

dataset2.queryState.setSortCondition({field: "Regione", order:"asc"});
dataset2.fetch();


var myAction = new recline.Action({
    filters:{
        filter_regione: {type:"term", field:"Regione", fieldType:"string"}
    },
    models: [{
        model: dataset,
        filters:["filter_regione"]
        },{
            model: dataset2,
            filters:["filter_regione"]
        }],        
    type:["selection"]
});

//create a listbox filter control (for region) that generates actions 
var filterRegioneCtrl = new recline.View.GenericFilter({
    sourceDataset: dataset,
    sourceFields:[ {field:"Regione", controlType:'dropdown_styled', type:'term', fieldType:"string", labelPosition:"left" } ],
    actions: [{
            action: myAction,
            mapping:[ {srcField:"Regione", filter:"filter_regione"} ],
            event:["selection"]
    }],
    state: { showBackground:false }
});
$('#regionFilter').append(filterRegioneCtrl.el);
filterRegioneCtrl.render();

var $el1 = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: dataset,
    el:$el1,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        selectedCellFocus: true
    }
});
grid1.visible = true;
grid1.render();

var $el2 = $('#grid2');
var grid2 = new recline.View.SlickGridGraph({
    model: dataset2,
    el:$el2,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        selectedCellFocus: true
    }
});
grid2.visible = true;
grid2.render();

});