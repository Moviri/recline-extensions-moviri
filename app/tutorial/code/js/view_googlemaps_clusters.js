var datasetMappa = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../data/SpeseMappa.csv',
    backend:'csv',
    id: 'model_mappa',
    fieldsType:[
                  {id:'LAT', type:'number'},
                  {id:'LONG', type:'number'},
                  {id:'TOT_EURO', type:'number'}
                 ]
});

var datasetMappaFiltered = new recline.Model.FilteredDataset({ dataset: datasetMappa});

var datasetSpeseMappa = new recline.Model.VirtualDataset({ /*FOLD_ME*/
    dataset: datasetMappa, 
    aggregation: { 
        dimensions: ['LAT', 'LONG' ], 
        measures: ['TOT_EURO'], 
        aggregationFunctions: ['sum'] 
    } 
});

datasetMappa.fetch();

var googleOptions = {
        zoom: 11,
        minZoom: 6,
        scaleControl: true
};

var mcOptions = {
    gridSize: 40,
    zoomOnClick:true,
    ignoreHidden:true,
    averageCenter:true,
    showSum: true,
    styles: [
             {
                url: '../images/cluster/green-shopping-cart-icon.png',
                height: 48,
                width: 48,
                anchor: [24, 70],
                zIndex: 1100,
                textSize: 18,
                textColor: 'black',
                textShadow: '2px 2px white'
            }, {
                url:  '../images/cluster/yellow-shopping-cart-icon.png',
                height: 48,
                width: 48,
                anchor: [24, 70],
                zIndex: 1100,
                textSize: 18,
                textColor: 'black',
                textShadow: '2px 2px white'
            }, {
                url: '../images/cluster/red-shopping-cart-icon.png',
                height: 48,
                width: 48,
                anchor: [24, 70],
                zIndex: 1100,
                textSize: 18,
                textColor: 'yellow',
                textShadow: '2px 2px black'
            } 
        ]
};

var action_marker_selection = new recline.Action({
    filters:{
        filter_marker_lat:{
            type:"term",
            field:"LAT",
            fieldType:"number"
        },
        filter_marker_long:{
            type:"term",
            field:"LONG",
            fieldType:"number"
        }
    },
    models: [{model: datasetMappaFiltered, filters:["filter_marker_lat", "filter_marker_long"]}],
    type:["filter"]
});

function resetMarkerFilter() 
{
    datasetMappaFiltered.queryState.clearFilter("LAT");
    datasetMappaFiltered.queryState.clearFilter("LONG");
    datasetMappaFiltered.query();
}
 
function selectMarkerRectangle(event)
{
    // select all markers in a rectangle within +-0.02 of the orig coords
    var latLng = event.latLng;
    var lat = latLng.lat();
    var lng = latLng.lng();
    datasetMappaFiltered.queryState.addFilter({type:"termAdvanced", field:"LAT",  operator: "lte", term: lat+0.02 });
    datasetMappaFiltered.queryState.addFilter({type:"termAdvanced", field:"LAT",  operator: "gte", term: lat-0.02 });
    datasetMappaFiltered.queryState.addFilter({type:"termAdvanced", field:"LONG",  operator: "lte", term: lng+0.02 });
    datasetMappaFiltered.queryState.addFilter({type:"termAdvanced", field:"LONG",  operator: "gte", term: lng-0.02 });
    datasetMappaFiltered.query();
}



var map = new recline.View.GoogleMaps({
    model: datasetSpeseMappa,
    el: "map",
    state:{
        valueField: "TOT_EURO_sum",
        latField: "LAT",
        longField: "LONG",
        markerIcon: "shoppingcart",
        markerSize: 24,
        showValue: true,
        mapCenter: [45.484844, 9.19805],
        mapType: "ROADMAP",
        googleOptions: googleOptions,
        clustererOptions: mcOptions,
        //infoWindowTemplate: "<div>Value: {{value}}<br>Color: {{color}}",
        greenThreshold: "(max-min)*3/4+min",
        redThreshold: "(max-min)/10+min"
    },
    events: {
        mapClick: resetMarkerFilter, 
        markerRightClick: selectMarkerRectangle
    },    
    actions: [{
        action: action_marker_selection,
        mapping:[ 
                  {srcField:"LAT", filter:"filter_marker_lat" },
                  {srcField:"LONG", filter:"filter_marker_long" }
        ],
        event:["selection"]
    }]            
});

var grid1 = new recline.View.SlickGridGraph({
    model: datasetMappaFiltered,
    el: $('#grid1'),
    state: {  fitColumns:true,
        useHoverStyle: true,
        useStripedStyle: true,
        useCondensedStyle: true
    }
});
grid1.visible = true;
grid1.render();
