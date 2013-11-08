require(['REM/recline-extensions/recline-extensions-amd', 'datejs', 
'REM/recline-extensions/views/view.slickgrid_graph', 'REM/recline-extensions/backend/backend.jsonp', 'REM/recline-extensions/model/virtualmodel',
    'REM/recline-extensions/views/widget.genericfilter', 'REM/recline-extensions/views/view.xcharts', 'REM/recline-extensions/views/view.indicator', 
    'REM/recline-extensions/model/filteredmodel'], function (recline) {

var recs = [];

//we build one year of random data starting from today
//NOTE: using library Date.js to handle dates more easily
var today = Date.today().set({second:0});
var currDate = new Date(today).add(-365).days();
while (currDate.getTime() <= today.getTime())
{
    recs.push({Data: new Date(currDate), Spese: Math.floor(Math.random()*100) });
    currDate.add(1).days();
}

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    records: recs,
    fields: [
         {id:'Data', type:'date'},
         {id:'Spese',   type:'number'}
        ]
});

var filteredDataset = new recline.Model.FilteredDataset( { dataset: dataset } );
var startingDateFilter = {type:"range", field:"Data", start: new Date(today).add(-6).days(), stop: today.add(1).days()};
filteredDataset.queryState.addFilter(startingDateFilter);
dataset.queryState.setSelection(startingDateFilter); // to make sure initial values are set also on control filterDateCtrl 

var virtual = new recline.Model.VirtualDataset({ 
 dataset: filteredDataset, 
 aggregation: { 
     measures: ["Spese"], 
     aggregationFunctions: ["sum"] 
 } 
});

var myAction_selection = new recline.Action({
 filters:{
     select_date: {type:"range", field:"Data", fieldType:"date"}
 },
 models: [{
     model: dataset,
     filters:["select_date"]
     }],
 type:["selection"]
});

var myAction_filter = new recline.Action({
 filters:{
     filter_date: {type:"range", field:"Data", fieldType:"date"}
 },
 models: [{
     model: filteredDataset,
     filters:["filter_date"]
     }],
 type:["filter"]
});

var filterDateCtrl = new recline.View.GenericFilter({
 sourceDataset: dataset,
 sourceFields:[ {field:"Data", controlType:'dropdown_date_range', fieldType:"date", labelPosition:"left", 
     userFilters: [ { label: '(custom) First 15 days this month', start: "1", delta:{days:15}}, 
                    { label: '(custom) Final 15 days this month', start: "15", delta:{days:15}},
                    { label: '(custom) Final 15 days last month', stop: "1", delta:{days:-15} } 
                    ] 
     }],
 state: { showBackground:false },
 actions: [{
             action: myAction_filter,
             mapping:[ {srcField:"Data", filter:"filter_date"} ],
             event:["selection"]
         },
         {
             action: myAction_selection,
             mapping:[ {srcField:"Data", filter:"select_date"} ],
             event:["selection"]
         }            
 ]
});
$('#my_filter').append(filterDateCtrl.el);
filterDateCtrl.render();

var $el = $('#chart1'); 
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphSpese1 = new recline.View.xCharts({
 model: filteredDataset,
 el: $el,
 state:{
     group: 'Data',
     series: {
         type: "byFieldName", 
         valuesField: ['Spese']
        },
     type: 'line-dotted',
     interpolation:'linear',
     xScale: 'time',
     yScale: 'linear',
     width: 850,
     height: 350,
     xAxisTitle: 'Giorno',
     yAxisTitle: 'Spese (euro)',
     opts: {
         tickFormatX: function(x) {return d3.time.format('%d-%b')(x); },
            dotRadius: 3
     }    
    }
});
graphSpese1.render();

//since the model is static we force the query here to ensure correct redrawing of the chart
dataset.query(); 

var indicator1 = new recline.View.Indicator({
 model: virtual,
 state: {
     label: "SPESE",
     description: "Spese totali del periodo selezionato",
     kpi: {field: "Spese_sum"}
 }
});
$("#my_indicator1").append(indicator1.el);
indicator1.render();

});