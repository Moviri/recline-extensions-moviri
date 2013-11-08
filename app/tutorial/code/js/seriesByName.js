require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.slickgrid_graph', 'd3', 'REM/recline-extensions/views/view.xcharts', 'REM/recline-extensions/backend/backend.extensions.csv'
], function (recline, SlickGridGraph, d3) {

var dataset = new recline.Model.Dataset({
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
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphNoleggi = new recline.View.xCharts({
    model: dataset,
    el: $el,
    state:{
        group: 'Data',
        series: {
            type: "byFieldName", 
            valuesField: ['Noleggi auto', 'Noleggi moto', 'Noleggi bici']
		},
        type: 'line-dotted',
        interpolation:'linear',
        xScale: 'time',
        yScale: 'linear',
        width: 850,
        height: 300,
        xAxisTitle: 'Giorno',
        yAxisTitle: 'Noleggi (euro)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%d-%b')(x); }
        }    
	}
});
graphNoleggi.render();

var $el1 = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
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