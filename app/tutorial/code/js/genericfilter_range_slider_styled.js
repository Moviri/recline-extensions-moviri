require(['recline-extensions-amd',
'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.filteredmodel', 'recline.model.extensions.virtualmodel',
    'recline-extensions/views/widget.genericfilter', 'recline-extensions/views/view.indicator'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    records:[
        {id:1, age:35,  visits: 20},
        {id:2, age:32, visits: 30},
        {id:3, age:43, visits: 13},
        {id:4, age:64, visits: 50},
        {id:5, age:15,  visits: 11},
        {id:6, age:35,  visits: 20},
        {id:7, age:32, visits: 32},
        {id:8, age:13, visits: 40},
        {id:9, age:24, visits: 61},
        {id:10, age:25,  visits: 10},
        {id:11, age:35,  visits: 27},
        {id:12, age:17, visits: 13},
        {id:13, age:33, visits: 40},
        {id:14, age:34, visits: 15},
        {id:15, age:55,  visits: 40},
        {id:16, age:45,  visits: 13},
        {id:17, age:62, visits: 17},
        {id:18, age:53, visits: 23},
        {id:19, age:34, visits: 38},
        {id:20, age:25,  visits: 10}
    ],
    fields:[
        {id:'id', type:'integer'},
        {id:'age', type:'integer' },
        {id:'visits', type:'integer' }
        ]
});

var filteredDataset = new recline.Model.FilteredDataset( { dataset: dataset } );

var virtual = new recline.Model.VirtualDataset({ 
    dataset: filteredDataset, 
    aggregation: { 
        measures: ["age", "visits"], 
        aggregationFunctions: ["sum", "avg"] 
    } 
});

dataset.queryState.addFacetNoEvent("id");
dataset.fetch();

var myAction_selection = new recline.Action({
    filters:{
        select_id: {type:"range", field:"id", fieldType:"integer"}
    },
    models: [{
        model: dataset,
        filters:["select_id"]
        }],
    type:["selection"]
});

var myAction_filter = new recline.Action({
    filters:{
        filter_id: {type:"range", field:"id", fieldType:"integer"}
    },
    models: [{
        model: filteredDataset,
        filters:["filter_id"]
        }],
    type:["filter"]
});

var filterIdCtrl = new recline.View.GenericFilter({
    sourceDataset: dataset,
    sourceFields:[ {field:"id", controlType:'range_slider_styled', fieldType:"integer", label: "Id", labelPosition:"left" } ],
    state: { showBackground:false },
    actions: [{
                action: myAction_filter,
                mapping:[ {srcField:"id", filter:"filter_id"} ],
                event:["selection"]
            },
            {
                action: myAction_selection,
                mapping:[ {srcField:"id", filter:"select_id"} ],
                event:["selection"]
            }            
    ]
});
$('#my_filter').append(filterIdCtrl.el);
filterIdCtrl.render();

var indicator1 = new recline.View.Indicator({
    model: virtual,
    state: {
        label: "AGE",
        description: "Displays average age of visitors",
        kpi: {field: "age_avg"}
    }
});
$("#my_indicator1").append(indicator1.el);
indicator1.render();

var indicator2 = new recline.View.Indicator({
    model: virtual,
    state: {
        label: "VISITS",
        description: "Displays total number of visits",
        kpi: {field: "visits_sum"}
    }
});
$("#my_indicator2").append(indicator2.el);
indicator2.render();

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: dataset,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useCondensedStyle:true,
        selectedCellFocus: true
     }
});
grid1.visible = true;
grid1.render();

});