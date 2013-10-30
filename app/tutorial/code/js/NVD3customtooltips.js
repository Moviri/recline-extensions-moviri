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

var tooltipHtmlTemplate = '<div style="white-space:nowrap;"> \
    <div style="margin-left:auto;margin-right:auto;display:table;width:100%"> \
        <div style="display:table-row;"> \
            {{#xLabel}} \
            <div style="display:table-cell;padding-right:15px"><h6 class="tooltip-label-x">{{xLabel}}</h5></div> \
            {{/xLabel}} \
            <div style="display:table-cell"><h4 style="text-align:center" class="tooltip-value-x">{{x}}</h4></div> \
        </div> \
    </div> \
    <div style="margin-left:auto;margin-right:auto;display:table;width:100%;border-top:1px solid lightgrey;padding-top:10px"> \
        <div style="display:table-row;"> \
            {{#yLabel}} \
            <div style="display:table-cell;padding-right:15px"><h6 class="tooltip-label-y">{{yLabel}}</h5></div> \
            {{/yLabel}} \
            <div style="display:table-cell"><p style="text-align:center" class="tooltip-value-y">{{y}}</p></div> \
        </div> \
    </div> \
</div>';

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
        width: 850,
        height: 700,
        xLabel: 'Giorno',
        options: {
            tooltips:false,
            customTooltips: tooltipHtmlTemplate,
            showControls:true,
            showLegend:true,
            margin: {top: 0, right: 0, bottom: 50, left: 120} // use left margin to ensure labels aren't clipped
        }
    }
});
$el.append(graphNoleggi.el); // this command is mandatory for NVD3
graphNoleggi.render();

});