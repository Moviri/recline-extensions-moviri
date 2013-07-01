require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline-extensions/model/filteredmodel'], function(recline, SlickGridGraph, FitleredDataset) {

var dataset1 = new recline.Model.Dataset({ /*FOLD_ME*/
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

$("#ageSelect").on("change", function(e) {
	dataset1.queryState.clearFilter("age");
	var selection = $("#ageSelect").val();
	console.log(selection);
	if (selection !== "")
	{
		var filters = selection.split(",");
		_.each(filters, function(flt) {
			var filterParts = flt.split("|");
			console.log("term="+filterParts[1]+" operator="+filterParts[0]);
			dataset1.queryState.setFilter({type:"termAdvanced", field:"age", term: filterParts[1], operator: filterParts[0], fieldType: "string"});
		});
	}
	dataset1.query();
});

var dataset2 = new FitleredDataset( { dataset: dataset1 } );

$("#countrySelect").on("change", function(e) {
	var selection = $("#countrySelect").val();
	if (selection !== "")
		dataset2.queryState.setFilter({type:"term", field:"country", term: selection});
	else dataset2.queryState.clearFilter("country");
	
	dataset2.query();
});

$("#genderSelect").on("change", function(e) {
	var selection = $("#genderSelect").val();
	if (selection !== "")
		dataset2.queryState.setFilter({type:"term", field:"gender", term: selection});
	else dataset2.queryState.clearFilter("gender");
	
	dataset2.query();
});

$("#sortFieldSelect").on("change", function(e) {
	dataset2.queryState.clearSortCondition();
	dataset2.queryState.setSortCondition({field: $("#sortFieldSelect").val(), order:"asc"});
	dataset2.query();
});

dataset1.fetch();

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:dataset1,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useCondensedStyle:true
    }
});
grid1.visible = true;
grid1.render();

var $el2 = $('#grid2');
var grid2 = new recline.View.SlickGridGraph({
    model:dataset2,
    el:$el2,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useCondensedStyle:true
    }
});
grid2.visible = true;
grid2.render();
});