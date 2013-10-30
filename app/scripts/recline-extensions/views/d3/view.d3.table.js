define(['jquery', 'recline-extensions-amd', 'd3v2', 'mustache', 'recline.data.extensions.aggregations'], function ($, recline, d3, Mustache) {
  recline.View = recline.View || {};

	"use strict";	

  var view = recline.View;

	var fetchRecordValue = function(record, dimension){
		var val = null;		
		dimension.fields.forEach(function(field, i){
			if(i==0) val = record.getFieldValue(field);
			else val+= record.getFieldValue(field);
		});
		return val;
	};

	var frv = fetchRecordValue;
	
	var rowClick = function(actions, activeRecords){
				
		return function(row){
			if(actions.length && row){
				//console.log("rowClick");	
						
				var ctrlKey = d3.event.ctrlKey;
				var adding = !d3.select(d3.event.target.parentNode).classed("info");

				if(adding){
					if(ctrlKey){
						activeRecords.push(row);
					}else{
						activeRecords = [row];
					}
				}else{
					if(ctrlKey){
						activeRecords = _.difference(activeRecords, [row]);
					}else{
						activeRecords = [];
					}
				}
				
				actions.forEach(function(actioncontainer){				
					actioncontainer.action.doAction(activeRecords, actioncontainer.mapping);
				});
								
				
			}		
		};
	};
	
	var rowOver = function(actions,activeRecords){
		return function(row){
			if(actions.length && row){
                activeRecords = [];
                activeRecords.push(row);

                actions.forEach(function(actioncontainer){
                    actioncontainer.action.doAction(activeRecords, actioncontainer.mapping);
                });
			}
		};		
	};
	
	var scrollBarWidth = function(){
		  document.body.style.overflow = 'hidden'; 
		  var width = document.body.clientWidth;
		  document.body.style.overflow = 'scroll'; 
		  width -= document.body.clientWidth; 
		  if(!width) width = document.body.offsetWidth - document.body.clientWidth;
		  document.body.style.overflow = ''; 
		  return width; 
	};

	var sort=function(rowHeight, tableId) {
	    return function (dimension) {
	        var dimensionName = dimension.fields[0].id,
	            descending = d3.select(this)
	                .classed("g-ascending");

	        d3.selectAll(".g-descending")
	            .classed("g-descending", false);
	        d3.selectAll(".g-ascending")
	            .classed("g-ascending", false);

	        if (!descending) {
	            d3.select(this)
	                .classed("g-ascending", true);
	            var orderQuantitative = function (a, b) {
	                return (isNaN(frv(a, dimension)) - isNaN(frv(b, dimension))) || (frv(a, dimension) - frv(b, dimension)) || (a.index - b.index);
	            };

	            var orderName = function (a, b) {
	                return b.name.localeCompare(a.name);
	            };
	        } else {
	            d3.select(this)
	                .classed("g-descending", true);

	            var orderQuantitative = function (a, b) {
	                return (isNaN(frv(b, dimension)) - isNaN(frv(a, dimension))) || (frv(b, dimension) - frv(a, dimension)) || (b.index - a.index);
	            };

	            var orderName = function (a, b) {
	                return a.name.localeCompare(b.name);
	            };
	        }

	        d3.selectAll("#"+tableId+" .g-tbody .g-tr")
	            .sort(dimensionName === "name" ? orderName : orderQuantitative)
	            .each(function (record, i) {
	            record.index = i;
	        })
	            .transition()
	            .delay(function (record, i) {
	            return (i - 1) * 10;
	        })
	            .duration(750)
	            .attr("transform", function (record, i) {
	            return "translate(0," + i * rowHeight + ")";
	        });
	    }
	};
	
	var computeWidth=function(view){		
		var tbodycontainer =  d3.select('#'+view.graphId+' .g-tbody-container');
		var thead = view.el.find('.g-thead');
		var tbody = d3.select('#'+view.graphId +' .g-tbody');
		var tfoot = d3.select('#'+view.graphId +' .g-tfoot');
		
		var translationAcc = 0;
		var translationRectAcc = 0;
		
		return d3.sum(view.columns, function(column, i){
            	var th = thead.find('.g-th:nth-child('+(i+1)+')');
            	column.padding_left = parseInt(th.css("padding-left").replace("px", ""));
                column.padding_right = parseInt(th.css("padding-right").replace("px", ""));
                column.computed_width = th.outerWidth(true);               

				column.fields.forEach(function (field, fieldI) {
					field.width = column.width;
					field.computed_width = column.computed_width;					
				});
	           
				var transl = translationAcc;
				translationAcc += column.computed_width;
				column.translation = transl;
				
				if (column.scale) {
                	var scale = column.scale(view.model.records.models, column.computed_width, (column.range || 1.0));
                    //dimension.scale = scale.scale; //mantain the orginal function
                    column.d3scale = scale.scale;
                    column.axisScale = scale.axisScale;
                    column.fields.forEach(function (field, i) {
                        field.scale = column.d3scale;
                        field.axisScale = column.axisScale[field.id];
                    });
                }
						
            	return column.computed_width;
            });
	};


    view.D3table = Backbone.View.extend({
        className: 'recline-table-editor',
        template: ' \
  				<div id="{{graphId}}" class="g-table g-table-hover g-table-striped g-table-bordered"> \
  					<h2 class="g-title">{{title}}</h2> \
  					<p class="lead">{{instructions}}</p> \
  					<small>{{summary}}</small> \
  				\
  				<div> \
  				\
  			',
        templateHeader: ' \
        			<div class="g-thead"> \
  						<div class="g-tr"> \
  							{{#columns}} \
  							<div class="g-th {{#sortable}}g-sortable{{/sortable}}" style="width: {{hwidth}}"><div>{{label}}</div></div> \
  							{{/columns}} \
  						</div> \
  					</div> \
  					\
  					',
        templateBody: ' \
  					<div class="g-tbody-container" style="width:{{scrollWidth}}px; height:{{height}}px;"> \
  						<div style="width:{{width}}px;"> \
  							<svg class="g-tbody"> \
							</svg> \
						</div> \
					</div> \
					\
  					',
        templateFooter: '\
  					<div class="g-tfoot-container"> \
						<svg class="g-tfoot"> \
						</svg> \
					</div> \
					\
					',
        events: {
            'click .g-thead': 'onEvent'
        },
        initialize: function (options) {
            
            _.defaults(options.conf,{"row_height": 20, "height":200});
            options.actions = options.actions || [];
            this.el = $(this.el);
    		_.bindAll(this, 'render', 'redraw', 'refresh', 'resize');
                     
            this.rowHeight = options.conf.row_height;
            
            var clickActions=[], hoverActions=[];
            //processing actions
            {
            	options.actions.forEach(function(action){
            		action.event.forEach(function(event){
            			if(event==='selection') clickActions.push(action);
            			else if(event==='hover')  hoverActions.push(action);
            		});
            	});
            }           
            
            this.clickActions = clickActions;
            this.hoverActions = hoverActions; 

            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', this.redraw);
            this.model.queryState.bind('selection:done', this.redraw);


			$(window).resize(this.resize);

			//create a nuew columns array with default values 
            this.columns = _.map(options.columns, function (column) {
                return _.defaults(column, {
                    label: "",
                    type: "text",
                    sortable: false,
                    fields: {}
                });
            });
            
            //render table  				
            this.columns.forEach(function (column, i) {
            	column.width = column.width || 160;
                column.hwidth = column.width;
            }, this);
            
            this.height = options.conf.height;
            this.title = options.title;
            this.summary = options.summary;
            this.instructions = options.instructions;
            this.graphId = options.id || 'd3table_'+Math.floor(Math.random()*1000);

            //render header & svg container
            var out = Mustache.render(this.template, this);
            this.el.html(out);
            this.el.find('#'+this.graphId).append(Mustache.render(this.templateHeader, this));
            
            this.width = options.conf.width;
            //this.render(); 								
        },
        
        resize: function(){
        	console.log('resize');
        	var tbodycontainer =  d3.select('#'+this.graphId+' .g-tbody-container');
        	var tbody = d3.select('#'+this.graphId +' .g-tbody');
        	var tfoot = d3.select('#'+this.graphId +' .g-tfoot');
        	        	
        	this.width = computeWidth(this);            
            this.scrollWidth = scrollBarWidth()+this.width;            
            
            this.el.find('.g-tbody-container').css('width',this.scrollWidth);
            this.el.find('.g-tbody-container > div').css('width',this.width);
            
            var row = tbodycontainer.select('.g-tbody')
                .selectAll(".g-tr");
                
            row.each(function (record) {
            	 var cell = d3.select(this)
                    .selectAll(".g-td").attr("transform", function (dimension, i) {
                    	return "translate(" + (dimension.translation+dimension.padding_left) + ")";
                	});
                	
                
            	//move and resize barchart
            					//barchart               
                var barChartCell = cell.filter(function (dimension) {           	
                    return dimension.scale && dimension.type === 'barchart';
                });
                barChartCell.selectAll(".g-bar").attr("width", function (field, index) {
                    	return field.scale(record.getFieldValue(field));
               		})
                    .attr("transform", function (field, i) {
                    	                    	
	                    var translation = Math.ceil((i === 0) ? ((field.computed_width) / 2) - field.scale(record.getFieldValue(field)) : i * (field.computed_width) / 2);
	
	                    if (i == 0) {
	                        return "translate(" + translation + ")";
	                    } else {
	                        return "translate(" + translation + ")";
	                    }
                	});            	
            });   
                 
            //move vertical lines
            {
            	tbodycontainer.select('.g-tbody').selectAll(".g-column-border").attr("class", "g-column-border").attr("transform", function(dimension) {
					return "translate(" + (dimension.translation) + ",0)";
				}).attr("y2", "100%");
            }     
            
            //move compare lines
            tbodycontainer.select('.g-tbody').selectAll(".g-compare").data(this.columns.filter(function(column) {
				return column.scale;
			})).attr("transform", function(column) {
				return "translate(" + (column.translation+column.padding_left+column.computed_width/2) + ",0)";
			}).attr("y2", "100%");        
            
            //move axis
            {
            	var axisRow = d3.select('#'+this.graphId+' .g-tfoot');
	            
	            var cell = axisRow.selectAll('.g-td')
	                    .attr("width", function (dimension, i) {
	                    	return (dimension.computed_width);
	                	})
	                	.attr("transform", function (dimension, i) {
	                    	return "translate(" + (dimension.translation+dimension.padding_left)+ ")";
                		});
	            
	            var barChartCell = cell.filter(function (dimension) {
                    return dimension.scale && dimension.type === 'barchart';
                });
                
				barChartCell.selectAll(".g-axis").remove();
                
				var fieldNum;
                var range;	
				barChartCell.selectAll(".g-axis").data(function (dimension) {
                		fieldNum = dimension.fields.length;
                		range = dimension.range;
                    	return dimension.fields;
               	  })
               	  .enter()
               	  .append('g')
               	  .attr('class', function(field,i){
               	  	return 'g-axis';
               	  })
               	  .attr("transform", function (field, i) {
               	  			var trans = 0;
               	  			var w = field.computed_width/fieldNum;
               	  			            	  			
               	  			if(i==0) trans = w - w*range;
               	  			else trans = i * w;
               	  			
               	  			return "translate(" + trans + ")";
                		})
               	  .each(function(field, i){
               	  		var axis = d3.svg.axis().scale(field.axisScale).ticks(Math.abs(field.axisScale.range()[1] - field.axisScale.range()[0]) / 80).orient("bottom");
               	  		d3.select(this).call(axis);
               	  	});
                             	  	
           }          		    
           
            
        },
        refresh: function() {
			console.log('d3Table.refresh');

        },
        reset: function () {
            console.log('d3Table.reset');
        },
        render: function () {
            console.log('d3Table.render');
            
            //render table divs            
            //manage width and scrolling
			this.width = computeWidth(this);
            this.scrollWidth = scrollBarWidth()+this.width;
            
            //compile mustache templates
            this.el.find('#'+this.graphId).append(Mustache.render(this.templateBody, this)).append(Mustache.render(this.templateFooter, this));
            
			//merge columns with dimensions
            this.columns.forEach(function (column, i) {
                column.fields = recline.Data.Aggregations.intersectionObjects('id', column.fields, this.model.fields.models);
                column.index = i;
            }, this);
        },
        redraw: function () {     
            console.log('d3Table.redraw');   
            
            var rowHeight = this.rowHeight;
            var columns = this.columns;
            var records = this.model.records.models;
            var activeRecords = []; 
            
			records.forEach(function (record, i) {
                record.index = i;
                if(record.isRecordSelected()) activeRecords.push(record);
            });
            
            //manage width and scrolling
			this.width = computeWidth(this); //this function compute width for each cells and adjust scales
            this.scrollWidth = scrollBarWidth()+this.width;
            
            var tbodycontainer = d3.select('#'+this.graphId+' .g-tbody-container');
            
            tbodycontainer.select('div').style('height',(rowHeight)*records.length+'px');            
            tbodycontainer.classed('g-tbody-container-overflow',(rowHeight)*records.length>this.height);
            
            tbodycontainer.selectAll('.g-tbody .g-tr').remove();            			
            var row = tbodycontainer.select('.g-tbody')
              .selectAll(".g-tr")
              .data(records)
              .enter()
              .append("g")
                .attr("class", "g-tr")
                .attr("transform", function (record, i) {
                	return "translate(0," + i * (rowHeight) + ")";
            	}).classed('info',function(record, i){
            		return record.isRecordSelected();
            	});

            row.append("rect")
                .attr("class", "g-background")
                .attr("width", "100%")
                .attr("height", rowHeight)
                .on('click', rowClick(this.clickActions, activeRecords))
                .on('mouseover', rowOver(this.hoverActions, activeRecords));

            row.each(function (record) {
								
                var cell = d3.select(this)
                  .selectAll(".g-td")
                  .data(columns)
                  .enter()
                  .append("g")
                    .attr("class", "g-td")
                    .classed("g-quantitative", function (dimension) {
                    	return dimension.scale;
                	}).classed("g-categorical", function (dimension) {
                    	return dimension.categorical;
                	}).attr("transform", function (dimension, i) {
                    	return "translate(" + (dimension.translation+dimension.padding_left) + ")";
                	});
                	
                //horizontal lines
               	d3.select(this).append('line').attr('class', 'g-row-border').attr('y1',rowHeight).attr('y2',rowHeight).attr('x2','100%');
               
				//barchart               
                var barChartCell = cell.filter(function (dimension) {           	
                    return dimension.scale && dimension.type === 'barchart';
                });
                barChartCell.selectAll(".g-bar")
                  .data(function (dimension) {
                    	return dimension.fields;
               	  })
                  .enter()
                  .append("rect")
                    .attr("class", "g-bar")
                    .attr("width", function (field, index) {
                    	return field.scale(record.getFieldValue(field));
               		})
                    .attr("height", rowHeight-1)
                    .attr("transform", function (field, i) {
                    	                    	
	                    var translation = Math.ceil((i === 0) ? ((field.computed_width) / 2) - field.scale(record.getFieldValue(field)) : i * (field.computed_width) / 2);
												
	                    if (i == 0) {
	                        return "translate(" + translation + ")";
	                    } else {
	                        return "translate(" + translation + ")";
	                    }
                	})
                    .style("fill", function (field, index) {
                    	return field.color;
                	});


                cell.filter(function (dimension) {           	
                    return !dimension.scale;
                }).append("text")
                    .attr("class", "g-value")
                    .attr("x", function (dimension) {
                    return dimension.scale ? 3 : 0;
                })
                    .attr("y", function (dimension) {
                    return dimension.categorical ? 9 : 10;
                })
                    .attr("dy", ".35em")
                    .classed("g-na", function (dimension) { //null values
                    return frv(record, dimension) === undefined;
                })
                    .text(function (dimension) {
                    return frv(record, dimension);
                })
                    .attr("clip-path", function (dimension) {
                    return (dimension.clipped = this.getComputedTextLength() > ((dimension.computed_width))-20) ? "url(#g-clip-cell)" : null;
                });

                cell.filter(function (dimension) {
                    return dimension.clipped;
                }).append("rect")
                    .style("fill", "url(#g-clip-gradient)")
                    .attr("x", function (dimension) {
                    	return dimension.hwidth;
                	})
                    .attr("width", 20)
                    .attr("height", rowHeight);
            });
            
            //axis management
            {
				var tfoot = d3.select('#'+this.graphId+' .g-tfoot');
				tfoot.selectAll('.axisRow').remove();						
				var axisRow = tfoot.append("g")
	                .attr("class", "axisRow");
	                	            
	            var cell = axisRow.selectAll('.g-td').data(columns).enter().append('g')
	                    .attr("class", "g-td")
	                    .attr("width", function (dimension, i) {
	                    	return (dimension.computed_width);
	                	})
	                	.attr("transform", function (dimension, i) {
	                    	return "translate(" + (dimension.translation+dimension.padding_left)+ ")";
                		});
	            
	            var barChartCell = cell.filter(function (dimension) {
                    return dimension.scale && dimension.type === 'barchart';
                });
                
                var fieldNum;
                var range;
                barChartCell.selectAll(".g-axis").data(function (dimension) {
                		fieldNum = dimension.fields.length;
                		range = dimension.range;
                    	return dimension.fields;
               	  })
               	  .enter()
               	  .append('g')
               	  .attr('class', function(field,i){
               	  	return 'g-axis';
               	  })
               	  .attr("transform", function (field, i) {
               	  			var trans = 0;
               	  			var w = field.computed_width/fieldNum;
               	  			            	  			
               	  			if(i==0) trans = w - w*range;
               	  			else trans = i * w;
               	  			
               	  			return "translate(" + trans + ")";
                		})
               	  .each(function(field, i){
               	  		var axis = d3.svg.axis().scale(field.axisScale).ticks(Math.abs(field.axisScale.range()[1] - field.axisScale.range()[0]) / 80).orient("bottom");
               	  		d3.select(this).call(axis);
               	  	});        
               	  	
            }

			//add sorting
            d3.selectAll('#'+this.graphId+' .g-thead .g-th.g-sortable')
                .data(columns)
                .on("click", sort(rowHeight, this.graphId));    
                
            //vertical lines
            {
            	tbodycontainer.select('.g-tbody').selectAll(".g-column-border").remove();
            	tbodycontainer.select('.g-tbody').selectAll(".g-column-border").data(columns)
            	.enter().append("line").attr("class", "g-column-border").attr("transform", function(dimension) {
					return "translate(" + (dimension.translation) + ",0)";
				}).attr("y2", "100%");
            }            

			//axis lines
			{
				tbodycontainer.select('.g-tbody').selectAll(".g-compare").remove();
				tbodycontainer.select('.g-tbody').selectAll(".g-compare").data(columns.filter(function(dimension) {
					return dimension.scale;
				})).enter().append("line").attr("class", "g-compare").attr("transform", function(dimension) {
					return "translate(" + (dimension.translation+dimension.padding_left + dimension.computed_width/2) + ",0)";
				}).attr("y2", "100%"); 
			}
			
        },
        onEvent: function (e) {}
    });
});