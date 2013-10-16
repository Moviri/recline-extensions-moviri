require(['recline-extensions-amd', 'recline-extensions/views/view.nvd3.graph', 'recline-extensions/backend/backend.extensions.csv'
], function (recline, SlickGridGraph) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Noleggi3.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Noleggi auto',   type:'integer'},
            {id:'Noleggi moto',   type:'integer'},
            {id:'Noleggi bici',   type:'integer'}
           ]
});
dataset.fetch();

var $el = $('#chart1') ;
var graphNoleggi = new recline.View.NVD3Graph({
    model: dataset,
    state:{
        group: 'Regione',
        series: {
            type: "byFieldName", 
            valuesField: ['Noleggi auto']
        }, 
        graphType: 'pieChart',
        width: 850,
        height: 700,
        options: {
            showLegend:false
        }
    }
});
$el.append(graphNoleggi.el); // this command is mandatory for NVD3
graphNoleggi.render();

});