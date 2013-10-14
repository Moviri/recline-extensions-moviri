var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Chord.csv',
    backend:'csv',
    id: 'model_chord',
    fieldsType: [
            {id:'valore',   type:'number'}
           ]
});

dataset.fetch();

var chord = new recline.View.D3Chord({
    model: dataset,
    el: $('#chart1'),
    width: 750,
    height: 700,
    state: {
        valueField: "valore",
        startField: "row",
        endField: "col",
        numberFormat: d3.format(",.0f") // optional
    }
});
chord.render();
chord.visible = true;
