var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Bullet1.csv',
    backend:'csv',
    fieldsType: [ 
            {id:'Data', type:'date'},
            {id:'Mese',   type:'integer'},
            {id:'Periodo',   type:'integer'},
            {id:'Stimato',   type:'integer'},
            {id:'Effettivo',   type:'integer'}
           ]
});

dataset.fetch();

var virtual = new recline.Model.VirtualDataset({  /*FOLD_ME*/
	dataset: dataset, 
	aggregation: { 
		dimensions: ["Mese"],
		partitions: ["Periodo"], 
		measures: ["Stimato", "Effettivo"], 
		aggregationFunctions: ["sum", "avg", "min", "max"] 
	} 
});

dataset.fetch();

var $el = $('#chart'); 
var graphBullet = new recline.View.D3Bullet({
    model: virtual,
    width: 850,
    height: 80,
    fieldRanges: ["Stimato_min", "Stimato_avg", "Stimato_max"],
    fieldMeasures: ["Effettivo_by_Periodo_2_min", "Effettivo_by_Periodo_2_avg", "Effettivo_by_Periodo_2_max"],
    fieldMarkers: ["Effettivo_by_Periodo_1_avg"]
});
$el.append(graphBullet.el); // this command is mandatory for NVD3
graphBullet.render();

var legend_dataset = new recline.Model.Dataset({
    records:[
        {x0:10, x1:25, x2:40, y0:15, y1: 20, y2: 35, z: 30 }
    ],
    fields:[
        {id:'x0', type:"integer"},
        {id:'x1', type:"integer"},
        {id:'x2', type:"integer"},
        {id:'y0', type:"integer"},
        {id:'y1', type:"integer"},
        {id:'y2', type:"integer"},
        {id:'z', type:"integer"}
    ]
});
var bulletLegend = new recline.View.D3Bullet({
    model: legend_dataset,
    fieldRanges: ["x0", "x1", "x2"],
    fieldMeasures: ["y0", "y1", "y2"],
    fieldMarkers: ["z"],
    height: 70,
    width: 300,
	customTicks: [null, null, "MinS", "MinE", "Curr", "AvgS", "Prev", "MaxE", "MaxS"]
});
$('#bullet_legend').append(bulletLegend.el);
bulletLegend.render();
bulletLegend.redraw();

var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:virtual,
    el:$el,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        visibleColumns: ["Stimato_min", "Stimato_avg", "Stimato_max", "Effettivo_by_Periodo_2_min", "Effettivo_by_Periodo_2_avg", "Effettivo_by_Periodo_2_max", "Effettivo_by_Periodo_1_avg"],
        columnsOrder: ["Stimato_min", "Stimato_avg", "Stimato_max", "Effettivo_by_Periodo_1_avg", "Effettivo_by_Periodo_2_min", "Effettivo_by_Periodo_2_avg", "Effettivo_by_Periodo_2_max"],
        fieldLabels: [
                      {id: "Stimato_min", label: "Stimato min"},
                      {id: "Stimato_avg", label: "Stimato avg"},
                      {id: "Stimato_max", label: "Stimato max"},
                      {id: "Effettivo_by_Periodo_1_avg", label: "Effettivo Period 1 avg"},
                      {id: "Effettivo_by_Periodo_2_min", label: "Effettivo Period 2 min"},
                      {id: "Effettivo_by_Periodo_2_avg", label: "Effettivo Period 2 avg"},
                      {id: "Effettivo_by_Periodo_2_max", label: "Effettivo Period 2 max"}
                      ]
    }
});
grid1.visible = true;
grid1.render();

