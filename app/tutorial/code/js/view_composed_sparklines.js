require(['recline-extensions-amd', 'd3', 'recline.model.extensions.virtualmodel', 'recline-extensions/views/d3/view.d3.sparkline',
    'recline-extensions/views/view.composed', 'recline-extensions/views/widget.datepicker' ], function (recline, d3) {

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

var virtual = new recline.Model.VirtualDataset({ 
    dataset: dataset, 
    aggregation: {
        dimensions: ["Data"],
        measures: ["Accessi", "Download", "Upload"], 
        aggregationFunctions: ["sum"] 
    }
});

dataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/14/2013"), stop: new Date("01/20/2013 23:59:59")});

dataset.queryState.addFacetNoEvent("UserId");

dataset.fetch();

var myAction = new recline.Action({ /*FOLD_ME*/
    filters:{
        filter_date_range:{type:"range", field:"Data", fieldType:"date"}
    },
    models:[
        {
            model: dataset,
            filters:["filter_date_range"]
        }
    ],
    type:["filter"]
});

var filter_period_ctrl = new recline.View.DatePicker({
    model: dataset,
    fields:{date: "Data", type: "date"},
    actions: [{
        action: myAction,
        mapping:[ {srcField:"date_reference", filter:"filter_date_range"} ],
        event:["selection"]
    }],
    weeklyMode: true
});
$("#datepicker").append(filter_period_ctrl.el);
filter_period_ctrl.render();

var kpis = {
        DOWNLOADS:{
            name:"Downloads",
            title:"DOWNLOADS",
            subtitle:"Download totali (byte)",
            fieldname:"Download",
            shape:"<img src='../tutorial/images/Downloads.png'></img>"
        },
        UPLOADS:{
            name:"Uploads",
            title:"UPLOADS",
            subtitle:"Upload totali (byte)",
            fieldname:"Upload",
            shape:"<img src='../tutorial/images/Uploads.png'></img>"
        },
        ACCESSI:{
            name:"Accessi",
            title:"ACCESSI",
            subtitle:"Num accesi totali",
            fieldname:"Accessi",
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
            view:"D3Sparkline",
            props: {
                field: k.fieldname,
                height: 50,
                width: 100,
                color: "steelblue" 
            }
    });
    // very much the same, only using "_sum" aggregation for displaying totals row
    measureTotals.push(            {
        view:"D3Sparkline",
        props: {
            field: k.fieldname+"_sum",
            height: 50,
            width: 100,
            color: "blue" 
        }
    });
    
});

var composed = new recline.View.Composed({
    model: dataset,
    el: $('#composed'),
    groupBy:"UserId",
    template: "horizontal",
    measures:measures,
    modelTotals: virtual,
    measuresTotals: measureTotals,
    titleTotals: "All users"
});





});