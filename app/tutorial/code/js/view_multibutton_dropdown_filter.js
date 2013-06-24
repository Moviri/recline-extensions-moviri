var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../data/SmsOverTime2.csv',
    backend:'csv',
    id: 'model_sms_over_time',
    fieldsType: [
            {id:'Anno', type:'string'},
            {id:'Telefoni',   type:'integer'},
            {id:'SMS',   type:'integer'},
            {id:'Messengers',   type:'integer'}
           ]
});

var filteredDataset = new recline.Model.FilteredDataset({dataset: dataset});

var virtual = new recline.Model.VirtualDataset({ 
    dataset: filteredDataset,
    fieldLabelForFields: "{originalFieldLabel}",
    aggregation: {
        dimensions: ["Anno"],
        measures: ["Telefoni", "SMS", "Messengers"], 
        aggregationFunctions: ["sum"] 
    },
    totals: { 
        measures: ["Telefoni_sum", "SMS_sum", "Messengers_sum"],
        aggregationFunctions: ["sum"] 
    }    
});

dataset.queryState.addFacetNoEvent("Tipo");
dataset.fetch();

var myAction = new recline.Action({
     filters:{
         filter_tipo: {type:"list", field:"Tipo", fieldType:"string"}
     },
     models: [{
         model: filteredDataset,
         filters:["filter_tipo"]
         }],
     type:["filter"]
});

var filterDateCtrl = new recline.View.MultiButtonDropdownFilter({
	sourceDataset: dataset,
	sourceField:{field:"Tipo", separator:'.', fieldType:"string"},
	actions: [{
             action: myAction,
             mapping:[ {srcField:"Tipo", filter:"filter_tipo"} ],
             event:["selection"]
         }            
 ]
});
$('#my_filter').append(filterDateCtrl.el);
filterDateCtrl.render();

var $el = $('#chart1'); 
var graph1 = new recline.View.NVD3Graph({
    model: virtual,
    state:{
        group: 'dimension',
        series: {
            type: "byFieldName", 
            valuesField: ['SMS_sum', 'Messengers_sum']
        },
        graphType: 'multiBarChart',
        width: 850,
        height: 500,
        tickFormatX: d3.format('d'),
        tickFormatY: d3.format('s'),
        xLabel: 'Anno',
        options: {
            showControls:true,
            showLegend:true,
            minmax:false
        }
    }
});
$el.append(graph1.el); // this command is mandatory for NVD3
graph1.render();

var indicator1 = new recline.View.Indicator({
     model: virtual,
     state: {
         label: "TELEFONI",
         description: "Numero cellulari e/o tablet (migliaia)",
         kpi: {type: "totals", field: "Telefoni_sum_sum"}
     }
});
$("#my_indicator1").append(indicator1.el);
indicator1.render();

var indicator2 = new recline.View.Indicator({
     model: virtual,
     state: {
         label: "SMS",
         description: "SMS tradizionali spediti a pagamento",
         kpi: {type: "totals", field: "SMS_sum_sum"}
     }
});
$("#my_indicator2").append(indicator2.el);
indicator2.render();

var indicator3 = new recline.View.Indicator({
     model: virtual,
     state: {
         label: "MESSENGERS",
         description: "Messaggi spediti gratuitam tramite messenger",
         kpi: {type: "totals", field: "Messengers_sum_sum"}
     }
});
$("#my_indicator3").append(indicator3.el);
indicator3.render();

