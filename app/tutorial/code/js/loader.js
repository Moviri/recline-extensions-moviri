require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.filteredmodel', 
    'recline-extensions/backend/backend.jsonp', 'recline-extensions/views/view.nvd3.graph', 'recline-extensions/views/view.loader'
    ], function (recline) {

var dataset = new recline.Model.Dataset({
    url:'../tutorial/data/bigDataDemo.jsonp',
    backend:'jsonp',
    id: 'myTestData',
    fieldsFormat: [{id:"data", format: "localeTimeString"}],
    renderer: recline.Data.Formatters.Renderers,
    useMemory: true
});

var filteredDatasetChart = new recline.Model.FilteredDataset({dataset: dataset });
var filteredDatasetGrid = new recline.Model.FilteredDataset({dataset: dataset });

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: filteredDatasetGrid,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }
});
grid1.visible = true;
grid1.render();

$('#chart1').addClass("recline-graph");
var chart1 = new recline.View.NVD3Graph({
    model: filteredDatasetChart,
    state:{
        group: 'data',
        series: {
            type: "byFieldName",
            valuesField: ["valore1", "valore2"]
        },
        graphType: 'lineChart',
        width: 800,
        height: 500,
        xLabel: 'Giorno',
        yLabel: 'Valore',
        options: {
            showLegend:true
        }
    }
});
$('#chart1').append(chart1.el);


var loader = new recline.View.Loader({
    datasets: [dataset, filteredDatasetChart, filteredDatasetGrid],
    container: $('#my-container'), // if missing appends to BODY
    iconName: '/images/ajax-loader-blue.gif'
});
loader.render();

function setRandomFilter() {
    var startDate = new Date(Math.floor(Math.random()*3)+2010, Math.floor(Math.random()*10), 1).getTime();
    var stopDate = startDate+3600*24*1000*10;
    filteredDatasetChart.queryState.setFilter({type:"range", field:"data", fieldType: "date", start: new Date(startDate), stop: new Date(stopDate) });
    // we fetch the dataset again to use async JSONP that ensure proper display of loader. The filtered dataset will be updated automatically
    dataset.fetch(); 
}

setRandomFilter();

chart1.render();

$("#refresh").click(setRandomFilter);

});