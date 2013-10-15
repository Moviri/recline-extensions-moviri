require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph',
    'recline.model.extensions.virtualmodel', 'recline-extensions/views/widget.genericfilter'], function (recline) {

var percRecords = [];
var STEP = 5;
for (var j = 0; j <= 100; j += 5)
	percRecords.push({percent: j, ratio: j/100});

var percentModel = new recline.Model.Dataset({ 
    records: percRecords,
	fields:[
        {id:'percent', type:'integer' }
        ]
});
percentModel.queryState.addFacetNoEvent("percent");
percentModel.fetch();

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    records:[
        {id:0, country:'Italy', gender:"Female", age:25,  visits: 10},
        {id:1, country:'Italy', gender:"Female", age:35,  visits: 20},
        {id:2, country:'France', gender:"Male", age:32, visits: 30},
        {id:3, country:'Italy', gender:"Male",   age:43, visits: 13},
        {id:4, country:'France', gender:"Male",   age:64, visits: 50},
        {id:5, country:'Greece', gender:"Female", age:15,  visits: 11},
        {id:6, country:'Italy', gender:"Female", age:35,  visits: 20},
        {id:7, country:'France', gender:"Male", age:32, visits: 32},
        {id:8, country:'Italy', gender:"Male",   age:13, visits: 40},
        {id:9, country:'Spain', gender:"Male",   age:24, visits: 61},
        {id:10, country:'Italy', gender:"Female", age:25,  visits: 10},
        {id:11, country:'Spain', gender:"Female", age:35,  visits: 27},
        {id:12, country:'France', gender:"Male", age:17, visits: 13},
        {id:13, country:'Italy', gender:"Male",   age:33, visits: 40},
        {id:14, country:'France', gender:"Male",   age:34, visits: 15},
        {id:15, country:'Spain', gender:"Female", age:55,  visits: 40},
        {id:16, country:'Italy', gender:"Female", age:45,  visits: 13},
        {id:17, country:'France', gender:"Male", age:62, visits: 17},
        {id:18, country:'Italy', gender:"Male",   age:53, visits: 23},
        {id:19, country:'Greece', gender:"Male",   age:34, visits: 38}
    ],

    fields:[
        {id:'id'},
        {id:'country', type:'string'},
        {id:'gender', type:'string'},
        {id:'age', type:'integer' },
        {id:'visits', type:'integer' }
        ]
});

var virtual = new recline.Model.VirtualDataset({ 
	dataset: dataset, 
	aggregation: { 
		dimensions: ["country", "gender"], 
		measures: ["visits"],
		aggregationFunctions: ["sum", "ratioToMax"] 
	},
	totals: { 
		measures: ["visits_sum"],
		aggregationFunctions: ["max"] 
	}
});

dataset.fetch();

var myAction = new recline.Action({
    filters:{
        filter_visits: {type:"termAdvanced", field:"visits_ratioToMax", fieldType:"integer", operator: "lte"}
    },
    models: [{
        model: virtual,
        filters:["filter_visits"]
        }],
    type:["selection"]
});

var filterDateCtrl = new recline.View.GenericFilter({
sourceDataset: percentModel,
sourceFields:[ {field:"percent", controlType:'slider_styled', fieldType:"integer", labelPosition:"left", step: STEP }],
state: { showBackground:false },
actions: [{
            action: myAction,
            mapping:[ {srcField:"ratio", filter:"filter_visits"} ],
            event:["selection"]
        }            
]
});
$('#my_filter').append(filterDateCtrl.el);
filterDateCtrl.render();

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:virtual,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        customHtmlFormatters: [{
            id: "visits_ratioToMax",
            formula: function (record) {
                var percValue = Math.round(record.attributes.visits_ratioToMax*10000)/100;
                return   "<div style='width: 35%;float: left;margin-right: 5%;text-align: right;'>"+
                percValue + "&nbsp;%</div>"+
                    "<div class='percent-complete-bar-background' style='width:45%;float:left;'>"+
                    "<span class='percent-complete-bar' style='width:" + percValue + "%'></span></div>";
            }
        }]
    }
});
grid1.visible = true;
grid1.render();

});