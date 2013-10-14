var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'tutorial/data/Noleggi6.csv',
    backend:'csv',
    id: 'model_noleggi',
    fieldsType: [
            {id:'Data', type:'date'},
            {id:'Noleggi auto',   type:'number'},
            {id:'Noleggi moto',   type:'number'},
            {id:'Noleggi bici',   type:'number'},
            {id:'Num noleggi auto',   type:'number'},
            {id:'Num noleggi moto',   type:'number'},
            {id:'Num noleggi bici',   type:'number'}
           ]
});

dataset.fetch();

var myAction = new recline.Action({
    filters:{
        filter_country: {type:"term", field:"Regione", fieldType:"string"}
    },
    models: [{
        model: dataset,
        filters:["filter_country"]
        }],
    type:["selection"]
});

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
        height: 300,
        options: {
            stacked:true,
            showControls:true,
            showLegend:true,
            margin: {top: 0, right: 0, bottom: 0, left: 120} // use left margin to ensure labels aren't clipped
        }
    },
    actions: [{
        action: myAction,
        mapping:[ {srcField:"Regione", filter:"filter_country"} ],
        event:["hover"]
}]    
});
$el.append(graphNoleggi.el); // this command is mandatory for NVD3
graphNoleggi.render();

var $el1 = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: dataset,
    el:$el1,
    state:{  fitColumns:true,
        useHoverStyle:true,
        useStripedStyle:true,
        useCondensedStyle:true,
        selectedCellFocus: true
    }
});
grid1.visible = true;
grid1.render();

