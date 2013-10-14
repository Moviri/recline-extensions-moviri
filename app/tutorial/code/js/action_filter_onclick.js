require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.filteredmodel', 'recline-extensions/views/widget.genericfilter'
], function (recline) {

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

var filteredDataset = new recline.Model.FilteredDataset({ dataset: dataset });

var myAction = new recline.Action({
    filters:{
        filter_country: {type:"term", field:"country", fieldType:"string"},
        filter_gender: {type:"term", field:"gender", fieldType:"string"}
    },
    models: [{
        model: filteredDataset,
        filters:["filter_country", "filter_gender"]
        }],
    type:["filter"]
});

// assign facets so that the model supplies the list of 
// unique values to the dropdown lists
dataset.queryState.addFacetNoEvent("country");
dataset.queryState.addFacetNoEvent("gender");
//dataset.queryState.addFacet("country", {silent: true});
//dataset.queryState.addFacet("gender", {silent: true});
dataset.fetch();

filteredDataset.query();

// create a dropdown filter control (for country) that generates actions 
var filterCountryCtrl = new recline.View.GenericFilter({
    sourceDataset: dataset,
    sourceFields:[ {field:"country", controlType:'dropdown', type:'term', fieldType:"string", label: "Country", labelPosition:"left" } ],
    actions: [{
            action: myAction,
            mapping:[ {srcField:"country", filter:"filter_country"} ],
            event:["selection"]
    }],
    state: { showBackground:false }
});
$('#countrySelect').append(filterCountryCtrl.el);
filterCountryCtrl.render();

//create a dropdown filter control (for gender) that generates actions 
var filterGenderCtrl = new recline.View.GenericFilter({
    sourceDataset: dataset,
    sourceFields:[ {field:"gender", controlType:'dropdown', type:'term', fieldType:"string", label: "Gender", labelPosition:"left" } ],
    actions: [{
            action: myAction,
            mapping:[ {srcField:"gender", filter:"filter_gender"} ],
            event:["selection"]
    }],
    state: { showBackground:false }
});
$('#genderSelect').append(filterGenderCtrl.el);
filterGenderCtrl.render();

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: filteredDataset,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useCondensedStyle:true
     }
});
grid1.visible = true;
grid1.render();

});