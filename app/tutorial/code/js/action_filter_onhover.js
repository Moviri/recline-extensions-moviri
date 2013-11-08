require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.slickgrid_graph', 'REM/recline-extensions/model/virtualmodel', 
    'REM/recline-extensions/backend/backend.jsonp', 'REM/recline-extensions/views/view.nvd3.graph', 'REM/recline-extensions/backend/backend.extensions.csv', 'REM/recline-extensions/model/filteredmodel'
], function (recline, SlickGridGraph) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Noleggi5.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Regione', type:'string'},
            {id:'Noleggi auto',   type:'number'},
            {id:'Noleggi moto',   type:'number'},
            {id:'Noleggi bici',   type:'number'}
           ]
});

var datasetSomme = new recline.Model.VirtualDataset({ /*FOLD_ME*/
	dataset: dataset, 
	aggregation: { 
		dimensions: ["Regione"], 
		measures: ["Noleggi auto", "Noleggi moto", "Noleggi bici"], 
		aggregationFunctions: ["sum"] 
	},
	fieldLabelForFields: "{originalFieldLabel}"   // ensure field names are retained (don't add "_sum" to the label)
});

var filteredDataset= new recline.Model.FilteredDataset({ dataset: dataset });

dataset.fetch();
filteredDataset.query();

var myAction = new recline.Action({
    filters:{
        filter_country: {type:"term", field:"Regione", fieldType:"string"}
    },
    models: [{
        model: filteredDataset,
        filters:["filter_country"]
        }],
    type:["filter"]
});

var $el = $('#chart1'); 
var graphNoleggi = new recline.View.NVD3Graph({
    model: datasetSomme,
    state:{
        group: 'dimension',
        series: {
            type: "byFieldName", 
            valuesField: ['Noleggi auto_sum', 'Noleggi moto_sum', 'Noleggi bici_sum']
        }, 
        graphType: 'multiBarHorizontalChart',
        width: 800,
        height: 300,
        options: {
            stacked:true,
            showControls:true,
            showLegend:true,
            margin: {top: 0, right: 0, bottom: 0, left: 120} // use left margin to ensure labels aren't clipped
        }
    },
    actions: [{
        action: myAction,
        mapping:[ {srcField:"Regione", filter:"filter_country"} ],
        event:["hover"]
}]    
});
$el.append(graphNoleggi.el); // this command is mandatory for NVD3
graphNoleggi.render();

var $el1 = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: filteredDataset,
    el:$el1,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }

});
grid1.visible = true;
grid1.render();

});