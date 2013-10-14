var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Spese1.csv',
    backend:'csv',
    id: 'model_spese',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Spese',   type:'number'}
           ]
});

var filteredDataset = new recline.Model.FilteredDataset( { dataset: dataset } );
var startingDateFilter = {type:"range", field:"Data", start: new Date(2012, 0, 2, 0,0,0,0), stop: new Date(2012, 0, 15, 23, 59, 59, 999)};
filteredDataset.queryState.addFilter(startingDateFilter);
dataset.queryState.setSelection(startingDateFilter); // to make sure initial values are set also on control filterDateCtrl 

var virtual = new recline.Model.VirtualDataset({ 
    dataset: filteredDataset, 
    aggregation: { 
        measures: ["Spese"], 
        aggregationFunctions: ["sum"] 
    } 
});

dataset.fetch();

var myAction_selection = new recline.Action({
    filters:{
        select_date: {type:"range", field:"Data", fieldType:"date"}
    },
    models: [{
        model: dataset,
        filters:["select_date"]
        }],
    type:["selection"]
});

var myAction_filter = new recline.Action({
    filters:{
        filter_date: {type:"range", field:"Data", fieldType:"date"}
    },
    models: [{
        model: filteredDataset,
        filters:["filter_date"]
        }],
    type:["filter"]
});

var filterDateCtrl = new recline.View.GenericFilter({
    sourceDataset: dataset,
    sourceFields:[ {field:"Data", controlType:'range_calendar', fieldType:"date", labelPosition:"none" } ],
    //state: { showBackground:false },
    actions: [{
                action: myAction_filter,
                mapping:[ {srcField:"Data", filter:"filter_date"} ],
                event:["selection"]
            },
            {
                action: myAction_selection,
                mapping:[ {srcField:"Data", filter:"select_date"} ],
                event:["selection"]
            }            
    ]
});
$('#my_filter').append(filterDateCtrl.el);
filterDateCtrl.render();

var $el = $('#chart1'); 
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphSpese1 = new recline.View.xCharts({
    model: filteredDataset,
    el: $el,
    state:{
        group: 'Data',
        series: {
            type: "byFieldName", 
            valuesField: ['Spese']
		},
        type: 'line-dotted',
        interpolation:'linear',
        xScale: 'time',
        yScale: 'linear',
        width: 850,
        height: 350,
        xAxisTitle: 'Giorno',
        yAxisTitle: 'Spese (euro)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%d-%b')(x); },
			dotRadius: 3
        }    
	}
});
graphSpese1.render();

var indicator1 = new recline.View.Indicator({
    model: virtual,
    state: {
        label: "SPESE",
        description: "Spese totali del periodo selezionato",
        kpi: {field: "Spese_sum"}
    }
});
$("#my_indicator1").append(indicator1.el);
indicator1.render();