require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline-extensions/views/view.xcharts', 'recline-extensions/backend/backend.extensions.csv'
], function (recline, SlickGridGraph) {

var dataset = new recline.Model.Dataset({
    url:'../tutorial/data/Noleggi2.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Valore',   type:'integer'}
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
            type: "byFieldValue", 
            seriesField: "Tipo", 
            valuesField: "Valore"
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
            tickFormatX: d3.time.format('%a %d-%b')
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