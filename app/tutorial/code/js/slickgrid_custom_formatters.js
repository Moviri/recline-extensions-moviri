require(['REM/recline-extensions/recline-extensions-amd', 'accounting', 'REM/recline-extensions/views/view.slickgrid_graph' ], function (recline, accounting) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    url:'../tutorial/data/Stipendi2.csv',
    backend:'csv',
    id: 'model_stipendi',
    fieldsType: [
            {id:'Operai',   type:'number'},
            {id:'Impiegati',   type:'number'},
            {id:'Quadri',   type:'number'},
            {id:'Dirigenti',   type:'number'},
            {id:'Freelance',   type:'number'},
            {id:'Media',   type:'number'},
            {id:'Delta Perc',   type:'number'}
           ]
});

dataset.fetch();

var customHtmlFormatters = [
    {
        id: "Sesso",
        formula: function (record) {
            var value = record.attributes.Sesso;
            if (value == "Maschio")
                return "<img src='../tutorial/images/male.png'></img>&nbsp;"+value;
            else return "<img src='../tutorial/images/female.png'></img>&nbsp;"+value;
        }
    },
    {
        id: "Operai",
        formula: function (record) {
            var value1 = record.attributes.Operai;
            var value2 = record.attributes.Impiegati;
            var formattedValue1 = accounting.formatMoney(value1, { symbol: "",  format: "%v %s", decimal : ".", thousand: ",", precision : 0 }) + "<small class='muted'>€</small>";
            var formattedValue2 = accounting.formatMoney(value2, { symbol: "",  format: "%v %s", decimal : ".", thousand: ",", precision : 0 }) + "<small class='muted'>€</small>";
            return   "<div class='split-top'  style='background-color:#F0F0E0'>"+formattedValue1 + "</div>"+
                "<div class='split-bottom'  style='background-color:#E8E8E8'>"+formattedValue2 + "</div>";
        }
    },
    {
        id: "Quadri",
        formula: function (record) {
            var value1 = record.attributes.Quadri;
            var value2 = record.attributes.Dirigenti;
            var formattedValue1 = accounting.formatMoney(value1, { symbol: "",  format: "%v %s", decimal : ".", thousand: ",", precision : 0 }) + "<small class='muted'>€</small>";
            var formattedValue2 = accounting.formatMoney(value2, { symbol: "",  format: "%v %s", decimal : ".", thousand: ",", precision : 0 }) + "<small class='muted'>€</small>";
            return   "<div class='split-top' style='background-color:#E8E8E8'>"+formattedValue1 + "</div>"+
            "<div class='split-bottom'  style='background-color:#E0F0E0'>"+formattedValue2 + "</div>";
        }
    },
    {
        id: "Media",
        formula: function (record) {
            var value = record.attributes.Media;
            var formattedValue = accounting.formatMoney(value, { symbol: "",  format: "%v %s", decimal : ".", thousand: ",", precision : 0 }) + "<small class='muted'>€</small>";
            var ratio = record.attributes["Delta Perc"];
            return   "<div style='width: 35%;float: left;margin-right: 5%;text-align: right;'>"+
                formattedValue + "</div>"+
                "<div class='percent-complete-bar-background' style='width:45%;float:left;'>"+
                "<span class='percent-complete-bar' style='width:" + ratio + "%'></span></div>";
        }
    }
    ];

var grid1 = new recline.View.SlickGridGraph({
    model:dataset,
    el: $('#grid1'),
    state:{  fitColumns:true,
        useHoverStyle:true,
        //useStripedStyle:true,
        //useCondensedStyle:true,
        visibleColumns: ["Regione", "Sesso", "Operai", "Quadri", "Freelance", "Media"],
        fieldLabels: [{id: "Operai", label: "Operai / Impiegati"}, {id: "Quadri", label: "Quadri / Dirigenti"}, {id: "Media", label: "Media / Delta %"}],
        fieldFormatters: [{id: "Freelance", cssClass: 'freelance'}],
        customHtmlFormatters: customHtmlFormatters
    }
});
grid1.visible = true;
grid1.render();

});