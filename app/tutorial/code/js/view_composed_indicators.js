require(['REM/recline-extensions/recline-extensions-amd', 'd3', 'REM/recline-extensions/model/virtualmodel',
    'REM/recline-extensions/views/view.indicator', 'REM/recline-extensions/views/view.composed', 'REM/recline-extensions/views/widget.datepicker'
    ], function (recline, d3) {

var referenceDataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/UserNetworkUsage.csv',
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
    url:'../tutorial/data/UserNetworkUsage.csv',
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


var virtualReference = new recline.Model.VirtualDataset({ 
    dataset: referenceDataset, 
    aggregation: {
        dimensions: ["UserId"],
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
        dimensions: ["UserId"],
        measures: ["Accessi", "Download", "Upload"], 
        aggregationFunctions: ["sum"] 
    },
    totals: { 
        measures: ["Accessi_sum", "Download_sum", "Upload_sum"],
        aggregationFunctions: ["sum"] 
    }    
});


referenceDataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/14/2013"), stop: new Date("01/20/2013 23:59:59")});
compareDataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/07/2013"), stop: new Date("01/13/2013 23:59:59")});

virtualReference.queryState.addFacetNoEvent("UserId");
virtualCompare.queryState.addFacetNoEvent("UserId");


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

var INCREASE_ICON = "<img src='../tutorial/images/arrow-up.png'></img>";
var DECREASE_ICON = "<img src='../tutorial/images/arrow-down.png'></img>";
var CONSTANT_ICON = "<img src='../tutorial/images/arrow-constant.png'></img>";

var kpis = {
        DOWNLOADS:{
            name:"Downloads",
            title:"DOWNLOADS",
            subtitle:"Download totali (byte)",
            fieldname:"Download_sum",
            shape:"<img src='../tutorial/images/Downloads.png'></img>"
        },
        UPLOADS:{
            name:"Uploads",
            title:"UPLOADS",
            subtitle:"Upload totali (byte)",
            fieldname:"Upload_sum",
            shape:"<img src='../tutorial/images/Uploads.png'></img>"
        },
        ACCESSI:{
            name:"Accessi",
            title:"ACCESSI",
            subtitle:"Num accesi totali",
            fieldname:"Accessi_sum",
            shape:"<img src='../tutorial/images/Accessi.png'></img>"
        }
};

var measures = [];
var measureTotals = [];
_.each(kpis, function(k) {
    measures.push(            {
            title: k.title,
            subtitle:k.subtitle,
            rawhtml: k.shape,
            view:"Indicator",
            props: {
                modelCompare: virtualCompare,
                state: {
                    kpi: {field: k.fieldname},
                    compareWith: { 
                        field: k.fieldname, compareType: "percentageVariation", 
                        shapes: { decrease: DECREASE_ICON, increase: INCREASE_ICON, constant: CONSTANT_ICON }
                    }
                }
            }
    });
    // very much the same, only using "_sum" aggregation for displaying totals row
    measureTotals.push(            {
        view:"Indicator",
        props: {
            modelCompare: virtualCompare,
            state: {
                kpi: {type: "totals", field: k.fieldname+"_sum"},
                compareWith: { 
                    type: "totals", field: k.fieldname+"_sum", compareType: "percentageVariation", 
                    shapes: { decrease: DECREASE_ICON, increase: INCREASE_ICON, constant: CONSTANT_ICON }
                }
            }
        }
    });
    
});

var composed = new recline.View.Composed({
    model: virtualReference,
    el: $('#composed'),
    groupBy:"UserId",
    template: "horizontal",
    measures:measures,
    modelTotals: virtualReference,
    measuresTotals: measureTotals,
    titleTotals: "All users"
});





});