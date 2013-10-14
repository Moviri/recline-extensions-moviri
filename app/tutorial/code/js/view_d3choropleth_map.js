var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Regioni.csv',
    backend:'csv',
    id: 'model_regioni',
    fieldsType: [
         {id:'Popolazione', type:'integer'},
         {id:'Superficie',   type:'integer'},
         {id:'Densita',   type:'integer'},
         {id:'Comuni',   type:'integer'}
        ]
});

var colorSchema = new recline.Data.ColorSchema({
    type: "scaleWithDataMinMax",
    colors: ['#F7E1C5', '#6A000B']
});

colorSchema.setDataset(dataset, "Densita");
dataset.queryState.addFacetNoEvent("Densita");

var action1 = new recline.Action({
    filters: {
        filter_value_list:   {type: "list",  field: "Regione",  fieldType: "integer"},
        filter_state_term: {type: "term", field: "Regione", fieldType: "string"}

    },
    models: [
        {model: dataset, filters:["filter_value_list", "filter_state_term"]}
    ],
    type: ["selection"]
});


var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: dataset,
    el: $el,
    state: {  fitColumns:true,
        useHoverStyle: true,
        useStripedStyle: true,
        useCondensedStyle: true,
        selectedCellFocus:true
    },
    actions: [{
        action: action1,
        mapping: [
            {srcField: "Regione", filter: "filter_value_list"}
        ],
        event: ["selection"]
    }]

});
grid1.visible = true;
grid1.render();

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

var map =  new recline.View.D3ChoroplethMap({
    model: dataset,
    el: '#map',
    state: {
        mapJson: 'ITA.json',
        layer: 'itaRegions',
        scale: 12000,
        center: [12.5, 41.5],
        mapping: [{srcShapeField: "Regione", srcValueField: "Densita", destLayer: "itaRegions"}],
        unselectedColor: "#C0C0C0",
        showCities: true,
        customTooltipTemplate: tooltipHtmlTemplate,
        width:550,
        height:550,
        svgStyle:'height:550px;width:550px'
    },
     actions: [{
         action: action1,
         mapping: [
             {srcField: "Regione", filter: "filter_state_term"}
         ],
         event: ["selection"]
     }]
});
map.render();

dataset.fetch();

