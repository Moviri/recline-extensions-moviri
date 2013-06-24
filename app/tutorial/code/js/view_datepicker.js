var referenceDataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../data/Spese1.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Spese',   type:'number'}
           ]
});

var compareDataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../data/Spese1.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Spese',   type:'number'}
           ]
});
referenceDataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/09/2012"), stop: new Date("01/15/2012 23:59:59")});
compareDataset.queryState.addFilter({type:"range", field:"Data", start: new Date("01/02/2012"), stop: new Date("01/08/2012 23:59:59")});

referenceDataset.fetch();
compareDataset.fetch();

var myAction_reference = new recline.Action({ /*FOLD_ME*/
    filters:{
        filter_date_range_reference:{type:"range", field:"Data", fieldType:"date"}
    },
    models:[
        {
            model: referenceDataset,
            filters:["filter_date_range_reference"]
        }
    ],
    type:["filter"]
});

var myAction_compare = new recline.Action({ /*FOLD_ME*/
    filters:{
        filter_date_range_compare:{type:"range", field:"Data", fieldType:"date"}
    },
    models:[
        {
            model: compareDataset,
            filters:["filter_date_range_compare"]
        }
    ],
    type:["filter"]
});

var filter_period_ctrl = new recline.View.DatePicker({
    model: referenceDataset,
    fields:{date: "Data", type: "date"},
    compareModel: compareDataset,
    compareFields:{date:"Data", type: "date"},
    actions: [{
        action: myAction_reference,
        mapping:[ {srcField:"date_reference", filter:"filter_date_range_reference"} ],
        event:["selection"]
    },
    {
        action: myAction_compare,
        mapping:[ {srcField:"date_compare", filter:"filter_date_range_compare"}  ],
        event:["selection"]
    }],
    weeklyMode: true
});
$("#datepicker").append(filter_period_ctrl.el);
filter_period_ctrl.render();

var $el = $('#chart1'); 
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphSpese1 = new recline.View.xCharts({
    model: referenceDataset,
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
        height: 270,
        xAxisTitle: 'Reference Period',
        yAxisTitle: 'Spese (euro)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%a %d-%m-%Y')(x); },
			dotRadius: 5
        }    
	}
});
graphSpese1.render();

var $el = $('#chart2'); 
$el.addClass("recline-graph"); // this applies the same styles to NVD3 and xCharts
var graphSpese2 = new recline.View.xCharts({
    model: compareDataset,
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
        height: 270,
        xAxisTitle: 'Compare Period',
        yAxisTitle: 'Spese (euro)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%a %d-%m-%Y')(x); },
			dotRadius: 5
        }    
	}
});
graphSpese2.render();