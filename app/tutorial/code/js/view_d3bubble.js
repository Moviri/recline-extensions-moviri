var SETTORI = { /*FOLD_ME*/
		"Commercio dettaglio": [	"Alimentari", "Arredamento, articoli per la casa", "Grande distribuzione", "Ristoranti, bar", "Rivenditori veicoli e stazioni servizio", "Varie"],
		"Commercio ingrosso": [	"Commercio ingrosso beni durevoli" ],
		"Industria, produzione" : [	"Attrezzature da trasporto", "Attrezzature elettriche ed elettroniche", "Industrie manifatturiere varie" ],
		"Servizi vari" : [ "Alberghi", "Autofficine, autonoleggi, leasing di automezzi", "Scuole e servizi educativi", "Servizi personali", "Servizi ricreativi", "Servizi sanitari" ],
		"Trasporti, distribuzione"	: ["Distribuzione elettricita, acqua, gas, servizi affini"]
};

var colorDomain = [];
var records = [];
_.each(SETTORI, function(settori, macroSettore) {
	colorDomain.push(macroSettore);
	_.each(settori, function(settore) {
		for (var n = 0; n < 1000; n+=100) {
			records.push({
				x: Math.random()*50+n,
				y: Math.random()*1000,
				z: Math.random()*150,
				macrosettore: macroSettore,
				settore: settore
			});
		}
	});
});
		
var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
	records: records,
    fields: [
             {id:'x',   type:'integer'},
             {id:'y',   type:'integer'},
            {id:'z',   type:'number'},
            {id:'macrosettore',   type:'string'},
            {id:'settore',   type:'string'}
           ]
});

dataset.fetch();

var bubble = new recline.View.D3Bubble({
    model: dataset,
    el: $('#chart1'),
    width: 750,
    height: 650,
    state: {
        colorLegend: {
            width: 350,
            height: 200,
            margin: {top: 10, right: 0, bottom: 0, left: -40}
        },
        sizeLegend: {
            width: 200,
            height: 150,
            numElements: 3,
            margin: {top: 0, right: 0, bottom: 0, left: 10}
        },
        xField: {
            field: "x"
        },
        yField: {
            field: "y"
        },
        sizeField: {
            field: "z"
        },
        keyField: {
            field: "settore"
        },
        colorField: {
            field: "macrosettore"
        }
    }
});
bubble.render();
bubble.visible = true;
bubble.redraw();


