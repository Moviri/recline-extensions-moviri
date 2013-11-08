require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.xcharts', 'REM/recline-extensions/backend/backend.extensions.csv'
], function (recline) {

var dataset = new recline.Model.Dataset({/*FOLD_ME*/
    url:'../tutorial/data/Noleggi2.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Valore',   type:'integer'}
           ]
});

var mycolorschema = new recline.Data.ColorSchema({   
    type: "scaleWithDistinctData",   
    colors: ['#FF0000', '#0000FF'] 
});
//possible values for "Tipo" are only ['Noleggi auto','Noleggi moto','Noleggi bici'] 
// so the three color supplied will be assigned to these three values 
mycolorschema.setDataset(dataset, "Tipo");  

dataset.fetch();

var $el = $('#chart1'); 
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphNoleggi = new recline.View.xCharts({
    model: dataset,
    el: $el,
    state:{
        group: 'Data',
        series: {
            type: "byFieldValue", 
            seriesField: "Tipo", 
            valuesField: "Valore"
		},
        type: 'line-dotted',
        interpolation:'linear',
        dotRadius: 4,
        xScale: 'time',
        yScale: 'linear',
        legend: $('#legend'),
        width: 850,
        height: 500,
        xAxisTitle: 'Giorno',
        yAxisTitle: 'Noleggi (euro)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%d-%b')(x); }
        }
    }
});
graphNoleggi.render();
});