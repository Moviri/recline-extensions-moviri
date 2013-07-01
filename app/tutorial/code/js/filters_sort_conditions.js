require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph'], function(recline, SlickGridGraph) {

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

$("#countrySelect").on("change", function(e) {
	var selection = $("#countrySelect").val();
	if (selection !== "")
		dataset.queryState.setFilter({type:"term", field:"country", term: selection});
	else dataset.queryState.clearFilter("country");
	
	dataset.fetch();
});

$("#genderSelect").on("change", function(e) {
	var selection = $("#genderSelect").val();
	if (selection !== "")
		dataset.queryState.setFilter({type:"term", field:"gender", term: selection});
	else dataset.queryState.clearFilter("gender");
	
	dataset.fetch();
});

$("#sortFieldSelect").on("change", function(e) {
	dataset.queryState.clearSortCondition();
	dataset.queryState.setSortCondition({field: $("#sortFieldSelect").val(), order:"asc"});
	dataset.fetch();
});

dataset.fetch();

var $el = $('#grid1');
var grid1 = new SlickGridGraph({
    model:dataset,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useCondensedStyle:true
    }
});
grid1.visible = true;
grid1.render();

});