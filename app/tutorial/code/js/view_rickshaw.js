require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.slickgrid_graph', 'REM/recline-extensions/views/view.rickshaw'], function (recline) {

var colorSchema = new recline.Data.ColorSchema({
    colors:["#0000FF", "#8084FF", "#0084FF"],
    fields: ["Noleggi auto", "Noleggi bici", "Noleggi moto"]
});

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Noleggi1.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Noleggi auto',   type:'integer'},
            {id:'Noleggi moto',   type:'integer'},
            {id:'Noleggi bici',   type:'integer'}
           ]
});

colorSchema.setDataset(dataset);
dataset.fetch();

var annotationDataset = new recline.Model.Dataset({ 
    records:[
       { when: new Date("January 3, 2013 00:00:00 GMT+1"), end: new Date("January 5, 2013 00:00:00 GMT+1"), eventDescription: "Prima promozione prezzi per noleggio auto e moto"},
       { when: new Date("January 9, 2013 00:00:00 GMT+1"), end: new Date("January 10, 2013 18:00:00 GMT+1"), eventDescription: "Crollo borse dopo crisi di governo"},
       { when: new Date("January 11, 2013 00:00:00 GMT+1"), end: new Date("January 13, 2013 18:00:00 GMT+1"), eventDescription: "Borse recuperano dopo annuncio ritrovata stabilita'"},
       { when: new Date("January 19, 2013 00:00:00 GMT+1"), end: new Date("January 25, 2013 00:00:00 GMT+1"), eventDescription: "Seconda promozione prezzi per noleggio auto e moto"},
       { when: new Date("January 26, 2013 00:00:00 GMT+1"), end: new Date("January 28, 2013 18:00:00 GMT+1"), eventDescription: "Piazza Affari euforica"},
       { when: new Date("January 29, 2013 00:00:00 GMT+1"), end: new Date("January 31, 2013 00:00:00 GMT+1"), eventDescription: "Il gruppo Fiat annuncia licenziamenti"}
      ],
    fields:[
       {id:'when', type:'date'},
       {id:'end', type:'date'},
       {id:'eventDescription',   type:'string'}
      ],
      fieldsFormat: [{id: "when", format: "localeString"}, {id: "end", format: "localeString"}]
 });

annotationDataset.fetch();

var graph1 = new recline.View.Rickshaw({
    model:dataset,
    el: $('#chart1'),
    state:{
        //unstack: true,
        group:["Data"],
        series:{type:"byFieldName", valuesField:["Noleggi auto", "Noleggi moto", "Noleggi bici"]},
        legend: "legenddiv",
        events:{div: 'time_line', dataset: annotationDataset, resultType: "unfiltered", timeField: "when", valueField: "eventDescription", endField:"end"}
    },
    height: 400
});

if(graph1) {
    graph1.render();
    graph1.redraw();
}


var $el1 = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
    el:$el1,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true
    }

});
grid1.visible = true;
grid1.render();

});