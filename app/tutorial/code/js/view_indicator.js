require(['recline-extensions-amd', 'd3', 'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.virtualmodel',
    'recline-extensions/views/widget.genericfilter', 'recline-extensions/views/view.xcharts', 'recline-extensions/views/view.indicator',
    'recline-extensions/views/widget.datepicker'
], function (recline, d3) {

var referenceDataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/UserNetworkUsage.csv',
    backend:'csv',
    id: 'model_network_usage_ref',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'UserId',   type:'string'},
            {id:'Accessi',   type:'integer'},
            {id:'Download',   type:'integer'},
            {id:'Upload',   type:'integer'}
           ]
});

var compareDataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/UserNetworkUsage.csv',
    backend:'csv',
    id: 'model_network_usage_compare',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'UserId',   type:'string'},
            {id:'Accessi',   type:'integer'},
            {id:'Download',   type:'integer'},
            {id:'Upload',   type:'integer'}
           ]
});
referenceDataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/14/2013"), stop: new Date("01/20/2013 23:59:59")});
compareDataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/07/2013"), stop: new Date("01/13/2013 23:59:59")});

var virtualReference = new recline.Model.VirtualDataset({ 
    dataset: referenceDataset, 
    aggregation: {
        dimensions: ["Data"],
        measures: ["Accessi", "Download", "Upload"], 
        aggregationFunctions: ["sum"] 
    },
    totals: { 
        measures: ["Accessi_sum", "Download_sum", "Upload_sum"],
        aggregationFunctions: ["sum"] 
    }
});

var virtualCompare = new recline.Model.VirtualDataset({ 
    dataset: compareDataset, 
    aggregation: { 
        dimensions: ["Data"],
        measures: ["Accessi", "Download", "Upload"], 
        aggregationFunctions: ["sum"] 
    },
    totals: { 
        measures: ["Accessi_sum", "Download_sum", "Upload_sum"],
        aggregationFunctions: ["sum"] 
    }    
});

referenceDataset.fetch();
compareDataset.fetch();

var myAction_reference = new recline.Action({ /*FOLD_ME*/
    filters:{
        filter_date_range_reference:{type:"range", field:"Data", fieldType:"date"}
    },
    models:[
        {
            model: referenceDataset,
            filters:["filter_date_range_reference"]
        }
    ],
    type:["filter"]
});

var myAction_compare = new recline.Action({ /*FOLD_ME*/
    filters:{
        filter_date_range_compare:{type:"range", field:"Data", fieldType:"date"}
    },
    models:[
        {
            model: compareDataset,
            filters:["filter_date_range_compare"]
        }
    ],
    type:["filter"]
});

var filter_period_ctrl = new recline.View.DatePicker({
    model: referenceDataset,
    fields:{date: "Data", type: "date"},
    compareModel: compareDataset,
    compareFields:{date:"Data", type: "date"},
    actions: [{
        action: myAction_reference,
        mapping:[ {srcField:"date_reference", filter:"filter_date_range_reference"} ],
        event:["selection"]
    },
    {
        action: myAction_compare,
        mapping:[ {srcField:"date_compare", filter:"filter_date_range_compare"}  ],
        event:["selection"]
    }],
    weeklyMode: true
});
$("#datepicker").append(filter_period_ctrl.el);
filter_period_ctrl.render();

var INCREASE_ICON = "<img src='../images/arrow-up.png'></img>";
var DECREASE_ICON = "<img src='../images/arrow-down.png'></img>";
var CONSTANT_ICON = "<img src='../images/arrow-constant.png'></img>";

var indicator1 = new recline.View.Indicator({
    model: virtualReference,
    modelCompare: virtualCompare,
    state: {
        label: "DOWNLOAD",
        description: "Download totali (byte)",
        kpi: {type: "totals", field: "Download_sum_sum"},
        compareWith: { 
            type: "totals", field: "Download_sum_sum", compareType: "percentageVariation", 
            shapes: { decrease: DECREASE_ICON, increase: INCREASE_ICON, constant: CONSTANT_ICON }
        }
    }
});
$("#my_indicator1").append(indicator1.el);
indicator1.render();

var indicator2 = new recline.View.Indicator({
    model: virtualReference,
    modelCompare: virtualCompare,
    state: {
        label: "UPLOAD",
        description: "Upload totali (byte)",
        kpi: {type: "totals", field: "Upload_sum_sum"},
        compareWith: { type: "totals", field: "Upload_sum_sum", compareType: "percentageVariation", 
            shapes: { decrease: DECREASE_ICON, increase: INCREASE_ICON, constant: CONSTANT_ICON }
        }
    }
});
$("#my_indicator2").append(indicator2.el);
indicator2.render();

var indicator3 = new recline.View.Indicator({
    model: virtualReference,
    modelCompare: virtualCompare,
    state: {
        label: "ACCESSI",
        description: "Accessi totali",
        kpi: {type: "totals", field: "Accessi_sum_sum"},
        compareWith: { type: "totals", field: "Accessi_sum_sum", compareType: "percentageVariation", 
            shapes: { decrease: DECREASE_ICON, increase: INCREASE_ICON, constant: CONSTANT_ICON }
        }
    }
});
$("#my_indicator3").append(indicator3.el);
indicator3.render();

$('#chart1').addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graph1 = new recline.View.xCharts({
    model: virtualReference,
    el: $('#chart1'),
    state:{
        group: 'Data',
        series: {
            type: "byFieldName", 
            valuesField: ['Download_sum']
        },
        type: 'line-dotted',
        interpolation:'linear',
        xScale: 'time',
        yScale: 'exponential',
        width: 850,
        height: 220,
        xAxisTitle: 'Reference Period',
        yAxisTitle: 'Download (byte)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%a %d-%m-%Y')(x); },
            tickFormatY: d3.format('s'),
            dotRadius: 4
        }    
    }
});
graph1.render();

$('#chart2').addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graph2 = new recline.View.xCharts({
    model: virtualCompare,
    el: $('#chart2'),
    state:{
        group: 'Data',
        series: {
            type: "byFieldName", 
            valuesField: ['Download_sum']
        },
        type: 'line-dotted',
        interpolation:'linear',
        xScale: 'time',
        yScale: 'exponential',
        width: 850,
        height: 220,
        xAxisTitle: 'Compare Period',
        yAxisTitle: 'Download (byte)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%a %d-%m-%Y')(x); },
            tickFormatY: d3.format('s'),
            dotRadius: 4
        }    
    }
});
graph2.render();

});
