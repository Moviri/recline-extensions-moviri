require(['REM/recline-extensions/recline-extensions-amd', 'd3v2', 'REM/recline-extensions/views/view.slickgrid_graph',
    'REM/recline-extensions/views/view.xcharts', 'REM/recline-extensions/views/view.nvd3.graph',
    'REM/recline-extensions/views/widget.genericfilter'
], function (recline, d3, SlickGridGraph, xCharts, NVD3Graph, GenericFilter) {


    var dataset = new recline.Model.Dataset({/*FOLD_ME*/
        url: '../tutorial/data/Noleggi2b.csv',
        backend: 'csv',
        id: 'model_noleggi',
        fieldsType: [
            {id: 'Valore', type: 'integer'}
        ]
    });


var mycolorschema = new recline.Data.ColorSchema({
    type: "scaleWithDistinctData",
    colors: ['#FF0000', '#00FF00', '#0000FF']
});
//possible values for "Tipo" are only ['Noleggi auto','Noleggi moto','Noleggi bici'] 
// so the three color supplied will be assigned to these three values 
mycolorschema.setDataset(dataset, "Tipo");

// creates a donutChart with color schema

dataset.fetch();
var $el = $('#chart1');
var graph1 = new NVD3Graph({
    model: dataset,
    state: {
        group: 'Tipo',
        series: {
            type: "byFieldName",
            valuesField: ["Valore"]
        },
        graphType: 'donutChart',
        width: 850,
        height: 600,
        donutRatio: 0.4,
        options: {
            showLegend: true
        }
    }
});
$el.append(graph1.el); // this command is mandatory for NVD3
graph1.render();

});