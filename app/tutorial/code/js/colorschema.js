require(['REM/recline-extensions/recline-extensions-amd', 'd3v2', 'REM/recline-extensions/views/view.slickgrid_graph',
    'REM/recline-extensions/views/view.xcharts', 'REM/recline-extensions/views/view.nvd3.graph',
    'REM/recline-extensions/views/widget.genericfilter'
], function (recline, d3, SlickGridGraph, xCharts, NVD3Graph, GenericFilter) {


    var dataset = new recline.Model.Dataset({/*FOLD_ME*/
        url: '../tutorial/data/Noleggi2.csv',
        backend: 'csv',
        id: 'model_noleggi',
        fieldsType: [
            {id: 'Data', type: 'date'},
            {id: 'Valore', type: 'integer'}
        ]
    })


var mycolorschema = new recline.Data.ColorSchema({
    type: "scaleWithDistinctData",
    colors: ['#FF0000', '#00FF00', '#0000FF']
});
//possible values for "Tipo" are only ['Noleggi auto','Noleggi moto','Noleggi bici'] 
// so the three color supplied will be assigned to these three values 
mycolorschema.setDataset(dataset, "Tipo");

dataset.fetch();

var $el = $('#chart1');
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphNoleggi = new xCharts({ /*FOLD_ME*/
    model: dataset,
    el: $el,
    state: {
        group: 'Data',
        series: {
            type: "byFieldValue",
            seriesField: "Tipo",
            valuesField: "Valore"
        },
        type: 'line-dotted',
        interpolation: 'linear',
        xScale: 'time',
        yScale: 'linear',
        legend: $('#legend'),
        width: 650,
        height: 250,
        //xAxisTitle: 'Giorno',
        yAxisTitle: 'Noleggi (euro)',
        opts: {
            tickFormatX: function (x) {
                return d3.time.format('%d-%b')(x);
            }
        }
    }
});
graphNoleggi.render();

var $el2 = $('#chart_noleggi2');
var graphNoleggi2 = new NVD3Graph({ /*FOLD_ME*/
    model: dataset,
    state: {
        group: 'Data',
        series: {
            type: "byFieldValue",
            seriesField: "Tipo",
            valuesField: "Valore"
        },
        graphType: 'multiBarChart',
        width: 850,
        height: 250,
        tickFormatX: d3.time.format('%d'),
        //xLabel: 'Giorno',
        yLabel: 'Noleggi (euro)',
        options: {
            showControls: true,
            showLegend: true,
            reduceXTicks: false
        }
    }
});
$el2.append(graphNoleggi2.el); // this command is mandatory for NVD3
graphNoleggi2.render();

// create color legend. A facet on the field "Tipo" is needed
dataset.queryState.addFacetNoEvent("Tipo");
var color_legend_filter = new GenericFilter({
    sourceDataset: dataset,
    sourceFields: [
        {field: "Tipo", controlType: 'color_legend', fieldType: 'string', labelPosition: "left", showValueLabels: true}
    ],
    state: {
        showBackground: false
    }
});
$('#color_legend').append(color_legend_filter.el);
color_legend_filter.render();

})
;