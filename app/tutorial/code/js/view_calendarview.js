require(['REM/recline-extensions/recline-extensions-amd', 'REM/recline-extensions/views/d3/view.d3.calendarview', 'datejs'], function(recline) {

var recs = [];

//we build three years of random data ending today
//NOTE: using library Date.js to handle dates more easily
var today = new Date(2012,12,31);
var currDate = new Date(2010,0,1);
while (currDate.getTime() <= today.getTime())
{
    recs.push({Data: new Date(currDate), Spese: Math.floor(Math.random()*100) });
    currDate.add(1).days();
}

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    records: recs,
    fields: [
         {id:'Data', type:'date'},
         {id:'Spese',   type:'number'}
        ]
});

dataset.query(); 

var calendarView =  new recline.View.D3CalendarView({
    model: dataset,
    el: "#grid1",
    dateField: "Data",
    valueField: "Spese",
    valueDomain: [100,0],
    cellSize: 15
});
calendarView.render();

});