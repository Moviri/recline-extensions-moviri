require(['recline-extensions-amd', 'd3', 'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.filteredmodel', 'recline.model.extensions.virtualmodel',
    'recline-extensions/views/widget.genericfilter', 'recline-extensions/views/view.xcharts', 'recline-extensions/views/view.indicator'
], function (recline, d3) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/UserNetworkUsage.csv',
    backend:'csv',
    id: 'model_network_usage',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'UserId',   type:'string'},
            {id:'Accessi',   type:'integer'},
            {id:'Download',   type:'integer'},
            {id:'Upload',   type:'integer'}
           ]
});

var filteredDataset = new recline.Model.FilteredDataset({dataset: dataset});

var virtual = new recline.Model.VirtualDataset({ 
    dataset: filteredDataset, 
    aggregation: { 
        //dimensions: ["UserId"], 
        measures: ["Accessi", "Download", "Upload"], 
        aggregationFunctions: ["sum"] 
    } 
});

dataset.queryState.addFacetNoEvent("UserId");
dataset.fetch();

var myAction = new recline.Action({
     filters:{
         filter_userId: {type:"term", field:"UserId", fieldType:"string"}
     },
     models: [{
         model: filteredDataset,
         filters:["filter_userId"]
         }],
     type:["filter"]
});

var filterDateCtrl = new recline.View.GenericFilter({
 sourceDataset: dataset,
 sourceFields:[ {field:"UserId", controlType:'radiobuttons', fieldType:"string", labelPosition:"left" }],
 state: { showBackground:false },
 actions: [{
             action: myAction,
             mapping:[ {srcField:"UserId", filter:"filter_userId"} ],
             event:["selection"]
         }            
 ]
});
$('#my_filter').append(filterDateCtrl.el);
filterDateCtrl.render();

var $el = $('#chart1'); 
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graph1 = new recline.View.xCharts({
    model: filteredDataset,
    el: $el,
    state:{
        group: 'Data',
        series: {
            type: "byFieldValue", 
            seriesField: "UserId", 
            valuesField: "Download"
        },
        type: 'line-dotted',
        interpolation:'linear',
        xScale: 'time',
        yScale: 'exponential',
        width: 850,
        height: 300,
        xAxisTitle: 'Giorno',
        yAxisTitle: 'Download',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%d-%b')(x); }
        }    
    }
});
graph1.render();

var indicator1 = new recline.View.Indicator({
     model: virtual,
     state: {
         label: "DOWNLOAD",
         description: "Download totali utente selezionato (byte)",
         kpi: {field: "Download_sum"}
     }
});
$("#my_indicator1").append(indicator1.el);
indicator1.render();

var indicator2 = new recline.View.Indicator({
     model: virtual,
     state: {
         label: "UPLOAD",
         description: "Upload totali utente selezionato (byte)",
         kpi: {field: "Upload_sum"}
     }
});
$("#my_indicator2").append(indicator2.el);
indicator2.render();

var indicator3 = new recline.View.Indicator({
     model: virtual,
     state: {
         label: "ACCESSI",
         description: "Accessi totali utente selezionato",
         kpi: {field: "Accessi_sum"}
     }
});
$("#my_indicator3").append(indicator3.el);
indicator3.render();

var grid1 = new recline.View.SlickGridGraph({
    model:filteredDataset,
    el: $('#grid1'),
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }

});
grid1.visible = true;
grid1.render();

});