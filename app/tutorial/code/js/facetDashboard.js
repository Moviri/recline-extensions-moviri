require(['recline-extensions-amd', 'recline-extensions/views/widget.facet.dashboard'], function (recline) {


var dataset = new recline.Model.Dataset({
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


dataset.queryState.addFacetNoEvent("country");
dataset.queryState.get("facets").country.terms_all = true;

dataset.queryState.addFacetNoEvent("gender");
dataset.queryState.get("facets").gender.terms_all = true;

dataset.queryState.addFacetNoEvent("age");
dataset.queryState.get("facets").age.terms_all = true;

dataset.queryState.addFacetNoEvent("visits");
dataset.queryState.get("facets").visits.terms_all = true;

var $el = $('#facet');
var viewer = new recline.View.FacetDashboard({
    model: dataset,
    el:$el,
    facetClass: "span2",
    facetHeight: 500
});


dataset.fetch();

});