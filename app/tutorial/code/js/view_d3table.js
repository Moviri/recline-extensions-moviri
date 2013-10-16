require(['recline-extensions-amd', 'recline-extensions/views/d3/view.d3.table', 'recline.data.extensions.formatters'], function (recline) {

var dataset = new recline.Model.Dataset({ /*FOLD_ME*/
    records:[
        {id:0, country:'Italy', gender:"Female", age:25,  visits: 10, efficiency: 95, efficiency2: 99},
        {id:1, country:'Italy', gender:"Female", age:35,  visits: 20, efficiency: 85, efficiency2: 99},
        {id:2, country:'France', gender:"Male", age:32, visits: 30, efficiency: 76, efficiency2: 54},
        {id:3, country:'Italy', gender:"Male",   age:43, visits: 13, efficiency: 23, efficiency2: 34},
        {id:4, country:'France', gender:"Male",   age:64, visits: 50, efficiency: 45, efficiency2: 21},
        {id:5, country:'Greece', gender:"Female", age:15,  visits: 11, efficiency: 21, efficiency2: 64},
        {id:6, country:'Italy', gender:"Female", age:35,  visits: 20, efficiency: 75, efficiency2: 45},
        {id:7, country:'France', gender:"Male", age:32, visits: 32, efficiency: 64, efficiency2: 90},
        {id:8, country:'Italy', gender:"Male",   age:13, visits: 40, efficiency: 90, efficiency2: 32},
        {id:9, country:'Spain', gender:"Male",   age:24, visits: 61, efficiency: 35, efficiency2: 25},
        {id:10, country:'Italy', gender:"Female", age:25,  visits: 10, efficiency: 26, efficiency2: 89},
        {id:11, country:'Spain', gender:"Female", age:35,  visits: 27, efficiency: 17, efficiency2: 27},
        {id:12, country:'France', gender:"Male", age:17, visits: 13, efficiency: 23, efficiency2: 42},
        {id:13, country:'Italy', gender:"Male",   age:33, visits: 40, efficiency: 63, efficiency2: 56},
        {id:14, country:'France', gender:"Male",   age:34, visits: 15, efficiency: 42, efficiency2: 86},
        {id:15, country:'Spain', gender:"Female", age:55,  visits: 40, efficiency: 78, efficiency2: 49},
        {id:16, country:'Italy', gender:"Female", age:45,  visits: 13, efficiency: 91, efficiency2: 18},
        {id:17, country:'France', gender:"Male", age:62, visits: 17, efficiency: 83, efficiency2: 37},
        {id:18, country:'Italy', gender:"Male",   age:53, visits: 23, efficiency: 38, efficiency2: 85},
        {id:19, country:'Greece', gender:"Male",   age:34, visits: 38, efficiency: 47, efficiency2: 49}
    ],

    fields:[
        {id:'id'},
        {id:'country', type:'string'},
        {id:'gender', type:'string'},
        {id:'age', type:'integer' },
        {id:'visits', type:'integer' },
        {id:'efficiency', type:'integer' },
        {id:'efficiency2', type:'integer' }
        ]
});

dataset.fetch();

var grid1 = new recline.View.D3table({
    model:dataset,
    columns: [
        {  
             name: "id",  
             fields: [{id:"id"}],   
             width: "5%",
             label: "#",
             sortable: true  
        },
        {  
             name: "country",  
             fields: [{id:"country"}],   
             width: "10%",
             label: "country",
             sortable: false  
        },
        {  
             name: "gender",  
             fields: [{id:"gender"}],   
             width: "10%",
             label: "gender",
             sortable: false  
        },
        {  
             name: "age",  
             fields: [{id:"age"}],   
             width: "10%",
             label: "age",
             sortable: true  
        },
        {  
             name: "visits",  
             fields: [{id:"visits"}],   
             width: "10%",
             label: "visits",
             sortable: true  
        },
        {  
             name: "efficiency",  
             fields: [{id:"efficiency",color:"blue"},{id:"efficiency2", color: "#4040A0"}],  
             type: "barchart",  
             scale: recline.Data.Formatters.scale({type: 'linear', invertEven: true, domain: ['efficiency','efficiency2']}),  
             range: 1,  
             width: "25%",
             label: "Efficiency",
             sortable: true  
        }        
    ],
    conf: {row_height: 20, height: 400},
    el: $('#grid1')
});
grid1.visible = true;
grid1.render();
grid1.redraw();

});