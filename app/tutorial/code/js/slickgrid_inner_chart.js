require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph', 'recline.model.extensions.virtualmodel'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Stipendi2.csv',
    backend:'csv',
    id: 'model_stipendi',
    fieldsType: [
            {id:'Operai',   type:'number'},
            {id:'Impiegati',   type:'number'},
            {id:'Quadri',   type:'number'},
            {id:'Dirigenti',   type:'number'},
            {id:'Freelance',   type:'number'},
            {id:'Media',   type:'number'},
            {id:'Delta Perc',   type:'number'}
           ]
});

var virtual = new recline.Model.VirtualDataset({ 
	dataset: dataset, 
	aggregation: { 
		dimensions: ["Regione"], 
		measures: ["Operai", "Impiegati", "Quadri", "Dirigenti", "Freelance"],
		partitions: ["Sesso"],
		aggregationFunctions: ["sum","avg"] 
	} 
});

dataset.fetch();

var grid1 = new recline.View.SlickGridGraph({
    model:virtual,
    el: $('#grid1'),
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        visibleColumns: ["dimension", "Operai_avg", "Impiegati_avg", "Quadri_avg", "Dirigenti_avg", "Freelance_avg","Media_avg"],
        columnsOrder: ["dimension", "Operai_avg", "Impiegati_avg", "Quadri_avg", "Dirigenti_avg", "Freelance_avg","Media_avg"],
        fieldLabels: [
              {id: "dimension", label: "Regione"},
              {id: "Operai_avg", label: "Operai (media)"},
              {id: "Impiegati_avg", label: "Impiegati (media)"},
              {id: "Quadri_avg", label: "Quadri (media)"},
              {id: "Dirigenti_avg", label: "Dirigenti (media)"},
              {id: "Freelance_avg", label: "Freelance (media)"}
                      ],
        useInnerChart: true,
        innerChartSerie1: "Impiegati_by_Sesso_Femmina_avg",
        innerChartSerie2: "Impiegati_by_Sesso_Maschio_avg",
        innerChartHeader: "Femmina / Maschio"
    }
});
grid1.visible = true;
grid1.render();

});