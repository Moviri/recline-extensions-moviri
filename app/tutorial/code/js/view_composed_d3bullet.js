require(['recline-extensions-amd', 'd3', 'recline.model.extensions.virtualmodel', 'recline-extensions/views/d3/view.d3.bullet',
     'recline-extensions/views/view.composed', 'recline-extensions/views/widget.datepicker'], function (recline, d3) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/UserNetworkUsage.csv',
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

var virtual = new recline.Model.VirtualDataset({ /*FOLD_ME*/
    dataset: dataset, 
    aggregation: {
        dimensions: ["UserId"],
        measures: ["Accessi", "Download", "Upload"], 
        aggregationFunctions: ["sum"] 
    },
    totals: {
        measures: ["Accessi_sum", "Download_sum", "Upload_sum"], 
        aggregationFunctions: ["sum", "avg", "min", "minScaled", "max", "maxScaled"] 
    }
});

dataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/14/2013"), stop: new Date("01/20/2013 23:59:59")});

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

var filter_period_ctrl = new recline.View.DatePicker({ /*FOLD_ME*/
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
            fieldname:"Download_sum",
            shape:"<img src='../images/Downloads.png'></img>"
        },
        UPLOADS:{
            name:"Uploads",
            title:"UPLOADS",
            subtitle:"Upload totali (byte)",
            fieldname:"Upload_sum",
            shape:"<img src='../images/Uploads.png'></img>"
        },
        ACCESSI:{
            name:"Accessi",
            title:"ACCESSI",
            subtitle:"Num accesi totali",
            fieldname:"Accessi_sum",
            shape:"<img src='../images/Accessi.png'></img>"
        }
};

var measures = [];
var measureTotals = [];
_.each(kpis, function(k) {
    measures.push(            {
            title: k.title,
            subtitle:k.subtitle,
            rawhtml: k.shape,
            view:"D3Bullet",
            props: {
                resultType: "totals",
                width: 650,
                height: 100,
                tickFormat: d3.format("s"),
                fieldRanges: [k.fieldname+"_minScaled", k.fieldname, k.fieldname+"_maxScaled"],
                fieldMeasures: [k.fieldname+"_sum"],
                fieldMarkers: [k.fieldname+"_sum"]
            }
    });
});

var composed = new recline.View.Composed({
    model: virtual,
    el: $('#composed'),
    template: "vertical",
    measures:measures
});




});
