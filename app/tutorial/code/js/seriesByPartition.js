require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.virtualmodel', 'recline-extensions/views/view.nvd3.graph', 'recline-extensions/backend/backend.extensions.csv'
], function (recline, SlickGridGraph) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Noleggi5.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Noleggi auto',   type:'number'},
            {id:'Noleggi moto',   type:'number'},
            {id:'Noleggi bici',   type:'number'}
           ]
});

var virtual = new recline.Model.VirtualDataset({ 
	dataset: dataset, 
	aggregation: { 
		dimensions: ["Data"],
		measures: ["Noleggi auto", "Noleggi moto", "Noleggi bici"],
		partitions: ["Regione"],
		aggregationFunctions: ["sum"] 
	} 
});
dataset.fetch();

var $el = $('#chart1'); 
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphNoleggi = new recline.View.NVD3Graph({
    model: virtual,
    state:{
        group: 'Data',
        series: {
            type: "byPartitionedField",
            aggregatedField: "Noleggi auto", 
            aggregationFunctions: ["sum"]
		},
        graphType: 'lineDottedChart',
        width: 850,
        height: 300,
        xLabel: 'Giorno',
        yLabel: 'Noleggi auto (euro)',
        options: {
            showControls:false,
            showLegend:true
        }
    },
});
$el.append(graphNoleggi.el); // this command is mandatory for NVD3
graphNoleggi.render();

var $el1 = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
    el:$el1,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        visibleColumns: ["Data", "Regione", "Noleggi auto"]
    }

});
grid1.visible = true;
grid1.render();

});