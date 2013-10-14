require(['recline-extensions-amd', 'recline-extensions/views/view.slickgrid_graph'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Stipendi2.csv',
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

dataset.fetch();

var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
    el: $('#grid1'),
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        showLineNumbers: true,
        columnsOrder: ["Regione","Freelance","Dirigenti","Quadri","Impiegati","Operai","Sesso"],
        visibleColumns: ["Regione","Sesso","Operai","Impiegati","Quadri","Dirigenti","Freelance"],
        fieldLabels: [
                      {id: "Regione", label: "Regione italiana"},
                      {id: "Freelance", label: "Stipendio medio freelance"},
                      {id: "Dirigenti", label: "Stipendio medio dirigenti"},
                      {id: "Quadri", label: "Stipendio medio quadri"},
                      {id: "Impiegati", label: "Stipendio medio impiegati"},
                      {id: "Operai", label: "Stipendio medio operai"}
                      ],
        fieldFormatters: [
                          {id: "Regione", cssClass: "regione-cell"},
                          {id: "Freelance", cssClass: "freelance-cell"},
                          {id: "Dirigenti", cssClass: "dirigenti-cell"},
                          {id: "Quadri", cssClass: "quadri-cell"},
                          {id: "Impiegati", cssClass: "impiegati-cell"},
                          {id: "Operai", cssClass: "operai-cell"},
                          {id: "Sesso", cssClass: "sesso-cell"}
                          ]
    }
});
grid1.visible = true;
grid1.render();
});