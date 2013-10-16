require(['recline-extensions-amd', 'recline-extensions/views/d3/view.d3.cloud'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Regioni.csv',
    backend:'csv',
    id: 'model_regioni',
    fieldsType: [
            {id:'Popolazione',   type:'number'},
            {id:'Superficie',   type:'number'},
            {id:'Densita',   type:'number'},
            {id:'Comuni',   type:'number'}
           ]
});

dataset.fetch();

var cloud = new recline.View.D3Cloud({
    model: dataset,
    el: $('#chart1'),
    width: 750,
    height: 700,
    state: {
        wordField: "Regione",
        dimensionField: $("#settore").val(),
        angle_start: -75, // optional
        angle_end: 75, // optional
        orientations: 10 // optional
    }
});
cloud.render();
cloud.visible = true;

$("#settore").bind("change", function() {
    cloud.options.state.dimensionField = $("#settore").val();
    cloud.render();
    cloud.redraw();
});

});