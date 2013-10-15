require(['recline-extensions-amd', 'recline-extensions/views/d3/view.d3.gravitybubble'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Rendita Regioni.csv',
    backend:'csv',
    id: 'model_rendita_regioni',
    fieldsType: [
            {id:'Agricoltura',   type:'number'},
            {id:'Industria',   type:'number'},
            {id:'Produzione',   type:'number'},
            {id:'Servizi',   type:'number'},
            {id:'Turismo',   type:'number'}
           ]
});

dataset.fetch();

var tooltipHtmlBubbleTemplate = '<div style="white-space:nowrap;" class="moda_tooltip"> \
	<div style="margin-left:auto;margin-right:auto;display:table;width:100%"> \
		<div style="display:table-row;"> \
			<div style="display:table-cell;padding-right:5px"><span class="tooltip-label-x">Regione:</span></div> \
			<div style="display:table-cell;text-align:right"><span style="text-align:right" class="tooltip-value-x">{{title}}</span></div> \
		</div> \
	</div> \
	<div style="margin-left:auto;margin-right:auto;display:table;width:100%"> \
		<div style="display:table-row;"> \
			<div style="display:table-cell;padding-right:5px"><span class="tooltip-label-x">Periodo:</span></div> \
			<div style="display:table-cell;text-align:right"><span style="text-align:right" class="tooltip-value-x">{{colorValue}}</span></div> \
		</div> \
	</div> \
	<div style="margin-left:auto;margin-right:auto;display:table;width:100%;border-top:1px solid lightgrey;padding-top:5px"> \
		<div style="display:table-row;"> \
			<div style="display:table-cell;padding-right:5px"><span class="tooltip-label-y">Valore:</span></div> \
			<div style="display:table-cell;text-align:right"><p style="text-align:right" class="tooltip-value-y">{{sizeValue}}</p></div> \
		</div> \
	</div> \
</div>';

var bubble = new recline.View.D3GravityBubble({
    model: dataset,
    el: $('#chart1'),
    width: 750,
    height: 650,
    state: {
        colorLegend: {
            width: 200,
            height: 300,
            numElements: 15,
            margin: {top: 10, right: 0, bottom: 0, left: -40}
        },
        sizeLegend: {
            width: 200,
            height: 150,
            numElements: 3,
            margin: {top: 0, right: 0, bottom: 0, left: 10}
        },
        sizeField: {
            field: $("#settore").val()
        },
        keyField: {
            field: "Periodo"
        },
        colorField: {
            field: "Regione"
        },
        customTooltipTemplate: tooltipHtmlBubbleTemplate
    }
});
bubble.render();
bubble.visible = true;

$("#settore").bind("change", function() {
	bubble.options.state.sizeField.field = $("#settore").val();
	bubble.render();
	bubble.redraw();
});

});