require(['REM/recline-extensions/recline-extensions-amd', 'd3', 'mustache', 'REM/recline-extensions/nvd3', 'datejs', 'REM/recline-extensions/model/filteredmodel',
'REM/recline-extensions/views/view.slickgrid_graph', 'REM/recline-extensions/backend/backend.jsonp', 'REM/recline-extensions/model/virtualmodel',
    'REM/recline-extensions/views/widget.genericfilter', 'REM/recline-extensions/views/view.xcharts', 'REM/recline-extensions/views/view.indicator'
    ], function (recline, d3, Mustache) {

var recs = [];

//we build one year of random data starting from today
var today = new Date();
var currDate = new Date(today.getTime()-365*24*3600*1000);
while (currDate.getTime() <= today.getTime())
{
    recs.push({Data: new Date(currDate), Spese: Math.floor(Math.random()*100) });
    currDate.add(1).days();
}

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    records: recs,
    fields: [
         {id:'Data', type:'date'},
         {id:'Spese',   type:'number'}
        ]
});

dataset.queryState.addFacetNoEvent("Data");
var filteredDataset = new recline.Model.FilteredDataset( { dataset: dataset } );
var startingDateFilter = {type:"range", field:"Data", start: new Date(today).add(-6).days(), stop: today.add(1).days()};
dataset.queryState.setSelection(startingDateFilter);
filteredDataset.queryState.addFilter(startingDateFilter);
dataset.fetch();

var virtual = new recline.Model.VirtualDataset({ 
 dataset: filteredDataset, 
 aggregation: { 
     measures: ["Spese"], 
     aggregationFunctions: ["sum"] 
 } 
});

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
 sourceFields:[ {field:"Data", controlType:'month_week_calendar', fieldType:"date", labelPosition:"left" }],
 state: { showBackground:false },
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

var tooltipHtmlTemplate = '<div style="white-space:nowrap;" class="moda_tooltip"> \
	<div style="margin-left:auto;margin-right:auto;display:table;width:100%"> \
		<div style="display:table-row;"> \
			{{#xLabel}} \
			<div style="display:table-cell;padding-right:5px"><span class="tooltip-label-x">{{{xLabel}}}</span></div> \
			{{/xLabel}} \
			<div style="display:table-cell;text-align:right"><span style="text-align:right" class="tooltip-value-x">{{{x}}}</span></div> \
		</div> \
	</div> \
	<div style="margin-left:auto;margin-right:auto;display:table;width:100%;border-top:1px solid lightgrey;padding-top:5px"> \
		<div style="display:table-row;"> \
			{{#yLabel}} \
			<div style="display:table-cell;padding-right:5px"><span class="tooltip-label-y">{{{yLabel}}}</span></div> \
			{{/yLabel}} \
			<div style="display:table-cell;text-align:right"><p style="text-align:right" class="tooltip-value-y">{{{y}}}</p></div> \
		</div> \
	</div> \
</div>';

var $el = $('#chart1'); 

var leftOffset = -($('html').css('padding-left').replace('px', '') + $('body').css('margin-left').replace('px', ''))+10;
var topOffset = -32;

var xChartTooltipTimeFormat = d3.time.format('%d-%m-%Y %H:%M');

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
     width: 600,
     height: 350,
     xAxisTitle: 'Giorno',
     //yAxisTitle: 'Spese (euro)',
     opts: {
         tickFormatX: function(x) {return d3.time.format('%d-%b')(x); },
            dotRadius: 4,
            mouseover: function (d, i) {
                var pos = $(this).offset();
                var values = { x: xChartTooltipTimeFormat(d.x), y: d.y_formatted, xLabel: 'Giorno:', yLabel: 'Valore:' };
                var content = Mustache.render(tooltipHtmlTemplate, values);

                var topOffsetAbs = topOffset + pos.top;
                if (topOffsetAbs < 0) topOffsetAbs = -topOffsetAbs; 
                nv.tooltip.show([pos.left + leftOffset, topOffset + pos.top], content, (pos.left < $el[0].offsetLeft + $el.width()/2 ? 'w' : 'e'), null, $el[0]);
            },
            mouseout: function (d, i) {
                nv.tooltip.cleanup();
            }     }    
    }
});
graphSpese1.render();

//since the model is static we force the query here to ensure correct redrawing of the chart
dataset.query(); 

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

});