require(['recline-extensions-amd',
'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.filteredmodel', 'recline.model.extensions.virtualmodel',
    'recline-extensions/views/widget.genericfilter', 'recline-extensions/views/view.nvd3.graph', 'recline-extensions/views/view.indicator'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Paesi1.csv',
    backend:'csv',
    fieldsType:[
        {id:'giorno', type: 'integer'},
        {id:'country', type:'string'},
        {id:'kpi', type:'integer' }
        ]
});

var mycolorschema = new recline.Data.ColorSchema({   
    type: "scaleWithDistinctData",   
    colors: ['#FF0000', '#00FF00'] 
});
mycolorschema.setDataset(dataset, "country"); 

var filteredDataset = new recline.Model.FilteredDataset({ dataset: dataset });

dataset.queryState.addFacetNoEvent("country");
dataset.fetch();



var myAction = new recline.Action({
    filters:{
        filter_country: {type:"list", field:"country", fieldType:"string"}
    },
    models: [{
        model: filteredDataset,
        filters:["filter_country"]
        }],
    type:["filter"]
});

var filterDateCtrl = new recline.View.GenericFilter({
    sourceDataset: dataset,
    sourceFields:[ {field:"country", controlType:'legend', fieldType:"string", labelPosition:"none"}],
    actions: [{
                action: myAction,
                mapping:[ {srcField:"country", filter:"filter_country"} ],
                event:["selection"]
            }            
    ]
});
$('#my_filter').append(filterDateCtrl.el);
filterDateCtrl.render();

var graph1 = new recline.View.NVD3Graph({
    model: filteredDataset,
    state:{
        group: 'giorno',
        series: {
            type: "byFieldValue", 
            seriesField: "country", 
            valuesField: "kpi",
            fillEmptyValuesWith: 0
        }, 
        graphType: 'multiBarChart',
        width: 600,
        height: 350,
        xLabel: 'giorno',
        yLabel: 'kpi',
        options: {
            showControls:true,
            showLegend:false,
            stacked:true
        }
    }
});
$('#chart1').append(graph1.el); // this command is mandatory for NVD3
graph1.render();

var grid1 = new recline.View.SlickGridGraph({
    model: filteredDataset,
    el: $('#grid1'),
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }
});
grid1.visible = true;
grid1.render();

});