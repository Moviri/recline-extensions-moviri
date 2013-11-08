require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/view.slickgrid_graph', 'REM/recline-extensions/views/d3/view.d3.sparkline'], function (recline) {


var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Bullet1.csv',
    backend:'csv',
    id: 'model_data',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Mese',   type:'integer'},
            {id:'Periodo',   type:'integer'},
            {id:'Stimato',   type:'integer'},
            {id:'Effettivo',   type:'integer'}
           ]
});

dataset.fetch();

var chart1 = new recline.View.D3Sparkline({
    model: dataset,
    el: $('#chart1'),
	field: "Stimato",
	height: 100,
	width: 200,
	color: "blue" 
});
chart1.render();

var chart2 = new recline.View.D3Sparkline({
    model: dataset,
    el: $('#chart2'),
	field: "Effettivo",
	height: 100,
	width: 200,
	color: "green" 
});
chart2.render();

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
