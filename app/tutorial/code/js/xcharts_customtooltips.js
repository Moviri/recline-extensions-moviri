require(['recline-extensions-amd', 'd3', 'mustache', 'nv.tooltips', 'recline-extensions/views/view.xcharts', 'recline-extensions/backend/backend.extensions.csv'
], function (recline, d3, Mustache) {

var dataset = new recline.Model.Dataset({/*FOLD_ME*/
    url:'../tutorial/data/Noleggi2.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Valore',   type:'integer'}
           ]
});

var mycolorschema = new recline.Data.ColorSchema({   
    type: "scaleWithDistinctData",   
    colors: ['#FF0000', '#0000FF'] 
});
mycolorschema.setDataset(dataset, "Tipo");  

dataset.fetch();

var tooltipHtmlTemplate = '<div style="white-space:nowrap;" class="moda_tooltip"> \
	<div style="margin-left:auto;margin-right:auto;display:table;width:100%"> \
		<div style="display:table-row;"> \
			{{#xLabel}} \
			<div style="display:table-cell;padding-right:5px"><span class="tooltip-label-x">{{{xLabel}}}</span></div> \
			{{/xLabel}} \
			<div style="display:table-cell;text-align:right"><span style="text-align:right" class="tooltip-value-x">{{{x}}}</span></div> \
		</div> \
		<div style="display:table-row;"> \
			{{#legendField}} \
			<div style="display:table-cell;padding-right:5px"><span class="tooltip-label-x">{{{legendField}}}</span></div> \
			{{/legendField}} \
			{{#legendValue}} \
			<div style="display:table-cell;text-align:right"><span style="text-align:right" class="tooltip-value-x">{{{legendValue}}}</span></div> \
			{{/legendValue}} \
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
var graphNoleggi = new recline.View.xCharts({
    model: dataset,
    el: $el,
    state:{
        group: 'Data',
        series: {
            type: "byFieldValue", 
            seriesField: "Tipo", 
            valuesField: "Valore"
		},
        type: 'line-dotted',
        dotRadius: 4,
        interpolation:'linear',
        xScale: 'time',
        yScale: 'linear',
        legend: $('#legend'),
        width: 850,
        height: 500,
        xAxisTitle: 'Giorno',
        yAxisTitle: 'Noleggi (euro)',
        opts: {
            tickFormatX: function(x) {return d3.time.format('%d-%b')(x); },
            mouseover: function (d, i) {
                var pos = $(this).offset();
                var values = { x: xChartTooltipTimeFormat(d.x), y: d.y_formatted, xLabel: 'Giorno:', yLabel: 'Valore:', legendField: d.legendField+':', legendValue: d.legendValue };
                var content = Mustache.render(tooltipHtmlTemplate, values);

                var topOffsetAbs = topOffset + pos.top;
                if (topOffsetAbs < 0) topOffsetAbs = -topOffsetAbs; 
                nv.tooltip.show([pos.left + leftOffset, topOffset + pos.top], content, (pos.left < $el[0].offsetLeft + $el.width()/2 ? 'w' : 'e'), null, $el[0]);
            },
            mouseout: function (d, i) {
                nv.tooltip.cleanup();
            }       
            
        }    
	}
});

graphNoleggi.render();

});