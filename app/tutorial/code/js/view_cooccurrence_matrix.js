var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Cognomi.csv',
    backend:'csv',
    id: 'model_cognomi',
    fieldsType: [
         {id:'Cognome1', type:'string'},
         {id:'Cognome2',   type:'string'},
         {id:'Incontri',   type:'integer'}
        ]
});

dataset.fetch();

$("#mode").on("change", function(e) {
	matrix.options.orderMode = $("#mode").val();
	matrix.redraw();
});

var matrix = new recline.View.D3CooccurrenceMatrix({
	model: dataset, 
	el: $('#matrix'),
	series1Field: "Cognome1",
	series2Field: "Cognome2",
	valueField: "Incontri",
	orderMode: $("#mode").val(),
	state: {
		width: 500,
		height: 500
	}
});
matrix.render();