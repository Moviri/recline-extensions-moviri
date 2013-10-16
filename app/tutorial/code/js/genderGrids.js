require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.virtualmodel'], function (recline) {

var dataset, virtual;

initModels();

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }

});
grid1.visible = true;
grid1.render();

$el = $('#grid2');
var grid2 = new recline.View.SlickGridGraph({
    model:virtual,
    el:$el,
    state:{
        fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        showTotals: [ {field: "visits_sum", aggregation: "sum" } ]
    }

});
grid2.visible = true;
grid2.render();

function initModels() { /*FOLD_ME*/
    var agebin = function (value, field, record) {
        var v = record.attributes.age;
        if (v < 10)
            return " 1-10";
        else if (v < 20)
            return "11-20";

        return v;
    };

    dataset = new recline.Model.Dataset({
        records:[
            {id:0, country:'Italy', gender:"Female", age:5,  visits: 10},
            {id:1, country:'Italy', gender:"Female", age:5,  visits: 20},
            {id:2, country:'Italy', gender:"Female", age:12, visits: 30},
            {id:3, country:'Italy', gender:"Male",   age:13, visits: 40},
            {id:4, country:'Italy', gender:"Male",   age:14, visits: 50}
        ],

        fields:[
            {id:'id'},
            {id:'country', type:'string'},
            {id:'gender', type:'string'},
            {id:'age', type:'integer' },
            {id:'agebin', type:'integer', deriver:agebin},
            {id:'visits', type:'integer' }
            ]
        });

    virtual = new recline.Model.VirtualDataset(
        {
            dataset: dataset,
            aggregation: {
                dimensions:             ["country", "gender"],
                measures:               ["visits"],
                aggregationFunctions:   ["sum"],
                partitions:             ["agebin"]
        },
        totals: {
            measures:               ["visits_sum"],
            aggregationFunctions:   ["sum"]
            }
        });
    }
});