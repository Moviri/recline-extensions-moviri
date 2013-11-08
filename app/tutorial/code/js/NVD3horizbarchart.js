require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.nvd3.graph', 'REM/recline-extensions/backend/backend.extensions.csv'
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

var $el = $('#chart1'); 
var graphNoleggi = new recline.View.NVD3Graph({
    model: dataset,
    state:{
        group: 'Regione',
        series: {
            type: "byFieldName", 
            valuesField: ['Noleggi auto', 'Noleggi moto', 'Noleggi bici']
        }, 
        graphType: 'multiBarHorizontalChart',
        width: 800,
        height: 680,
        xLabel: 'Giorno',
        options: {
            showControls:true,
            showLegend:true,
            margin: {top: 0, right: 0, bottom: 50, left: 120} // use left margin to ensure labels aren't clipped
        }
    }
});
$el.append(graphNoleggi.el); // this command is mandatory for NVD3
graphNoleggi.render();

});