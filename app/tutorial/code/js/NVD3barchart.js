require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.nvd3.graph', 'REM/recline-extensions/backend/backend.extensions.csv'
], function (recline, SlickGridGraph) {


var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Noleggi1.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Noleggi auto',   type:'integer'},
            {id:'Noleggi moto',   type:'integer'},
            {id:'Noleggi bici',   type:'integer'}
           ]
});
dataset.fetch();

var $el = $('#chart1'); 
var graphNoleggi = new recline.View.NVD3Graph({
    model: dataset,
    state:{
        group: 'Data',
        series: {
            type: "byFieldName", 
            valuesField: ['Noleggi auto', 'Noleggi moto', 'Noleggi bici']
		}, 
        graphType: 'multiBarChart',
        width: 850,
        height: 700,
        xLabel: 'Giorno',
        yLabel: 'Noleggi (euro)',
        tickFormatX: d3.time.format('%d'),
        options: {
            showControls:true,
            showLegend:true,
            reduceXTicks: false
        }
    }
});
$el.append(graphNoleggi.el); // this command is mandatory for NVD3
graphNoleggi.render();
});