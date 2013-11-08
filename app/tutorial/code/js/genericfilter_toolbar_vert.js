require(['REM/recline-extensions/recline-extensions-amd', 'd3', 'REM/recline-extensions/views/view.slickgrid_graph', 'REM/recline-extensions/backend/backend.jsonp', 'REM/recline-extensions/model/virtualmodel',
    'REM/recline-extensions/views/widget.genericfilter', 'REM/recline-extensions/views/view.xcharts', 'REM/recline-extensions/views/view.indicator', 'REM/recline-extensions/model/filteredmodel'
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
        measures: ["Accessi", "Download", "Upload"], 
        aggregationFunctions: ["sum"] 
    } 
});

dataset.queryState.addFacetNoEvent("UserId");
dataset.fetch();

var myActionUserId = new recline.Action({
     filters:{
         filter_userId: {type:"list", field:"UserId", fieldType:"string"}
     },
     models: [{
         model: filteredDataset,
         filters:["filter_userId"]
         }],
     type:["filter"]
});
var myActionData = new recline.Action({
     filters:{
         filter_data: {type:"range", field:"Data", fieldType:"date"}
     },
     models: [{
         model: filteredDataset,
         filters:["filter_data"]
         }],
     type:["filter"]
});

var multiFilterCtrl = new recline.View.GenericFilter({
 sourceDataset: dataset,
 state: { title: "Filter Toolbar", description: "Vertical toolbar example:<br>select week and userId"},
 sourceFields:[
               {field:"Data", controlType:'dropdown_date_range', fieldType:"date", labelPosition:"top", skipDefaultFilters: true, 
                   userFilters: [ 
                                  { label: 'Week 1', start: "january 1 2013", delta:{days:7}}, 
                                  { label: 'Week 2', start: "january 8 2013", delta:{days:7}}, 
                                  { label: 'Week 3', start: "january 15 2013", delta:{days:7}}, 
                                  { label: 'Week 4', start: "january 22 2013", delta:{days:7}}, 
                                  { label: 'Week 1+2', start: "january 1 2013", delta:{days:14}}, 
                                  { label: 'Week 3+4', start: "january 15 2013", delta:{days:14}}, 
                                  { label: 'Whole Month', start: "january 1 2013", delta:{months:1}} 
                                  ]   
               },
                {field:"UserId", controlType:'list', fieldType:"string", labelPosition:"top" }
                ],
 actions: [{
             action: myActionUserId,
             mapping:[ {srcField:"UserId", filter:"filter_userId", srcCtrlField:"UserId"} ],
             event:["selection"]
         },
         {
             action: myActionData,
             mapping:[ {srcField:"Data", filter:"filter_data", srcCtrlField: "Data"} ],
             event:["selection"]
         }          
 ]
});
$('#my_filter').append(multiFilterCtrl.el);
multiFilterCtrl.render();

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
        width: 550,
        height: 250,
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