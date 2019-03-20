/* global define */
define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'd3', 'mustache', 'underscore', 'backbone', 'REM/recline-extensions/backend/backend.jsonp', 'REM/recline-extensions/model/filteredmodel'
    ], function ($, recline, d3, Mustache, _, Backbone) {

    "use strict";

    recline.View = recline.View || {};

    var view = recline.View;

    var debugComposedView = ($.cookie("debug_mode") === "DEBUG_COMPOSED_VIEW" || $.cookie("debug_mode") === "DEBUG");

    // max 1000 total rows (including top header and totals footer) to avoid display:grid bug in chrome. https://github.com/rachelandrew/gridbugs/issues/28
    // mozilla can go up to 9997 data rows (+ heading and totals = 9999 rows)
    var MAX_ROWS = 998; 

    view.Composed = Backbone.View.extend({
        templates: {
            vertical: '<div id="{{uid}}">' +
                '<div class="composedview_table" style="display:table">' +
                '<div class="c_group c_header" style="display:table-header-group">' +
                '<div class="c_row" style="display:table-row">' +
                '<div class="cell cell_empty" style="display:table-cell"></div>' +
                '{{#dimensions}}' +
                '<div class="cell cell_name" style="display:table-cell"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
                '{{/dimensions}}' +
                '{{#dimensions_totals}}' +
                '<div class="cell cell_name" style="display:table-cell"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
                '{{/dimensions_totals}}' +                
                '</div>' +
                '</div>' +
                '<div class="c_group c_body" style="display:table-row-group">' +
                '{{#noData}}}<div class="c_row"><div class="cell cell_empty"/>{{{noData}}}</div>{{/noData}}' +
                '{{#measures}}' +
                '<div class="c_row" style="display:table-row">' +
                '<div class="cell cell_title" style="display:table-cell"><div style="white-space:nowrap;"><div class="rawhtml" style="vertical-align:middle;float:left">{{{rawhtml}}}</div><div style="vertical-align:middle;float:left"><div class="title">{{{title}}}</div><div class="subtitle">{{{subtitle}}}</div></div><div class="shape" style="vertical-align:middle;float:left">{{shape}}</div></div></div>' +
                '{{#dimensions}}' +
                '<div class="cell cell_graph" style="display:table-cell" id="{{#getDimensionIDbyMeasureID}}{{measure_id}}{{/getDimensionIDbyMeasureID}}" term="{{measure_id}}"></div>' +
                '{{/dimensions}}' +
                '{{#dimensions_totals}}' +
    			'<div class="cell cell_graph" style="display:table-cell" id="{{#getDimensionIDbyMeasureTotalsID}}{{measure_id}}{{/getDimensionIDbyMeasureTotalsID}}"></div>' +
    			'{{/dimensions_totals}}' +
                '</div>' +
                '{{/measures}}' +
                '</div>' +
                '<div class="c_group c_footer"></div>' +
                '</div>' +
                '</div>',

            horizontal: '<div id="{{uid}}">' +
                '<table><tr><td>' +
                '<div class="composedview_table" style="display:table">' +
                '<div class="c_group c_header" style="display:table-header-group">' +
                '<div class="c_row" style="display:table-row">' +
                '<div class="cell cell_empty" style="display:table-cell"></div>' +
                '{{#measures}}' +
                '<div class="cell cell_title" style="display:table-cell"><div style="white-space:nowrap;"><div class="rawhtml" style="vertical-align:middle;float:left">{{{rawhtml}}}</div><div style="float:left;vertical-align:middle"><div class="title"><a class="link_tooltip" href="#" data-toggle="tooltip" title="{{{subtitle}}}">{{{title}}}</a></div></div><div class="shape" style="float:left;vertical-align:middle">{{shape}}</div></div></div>' +
                '{{/measures}}' +
                '</div>' +
                '</div>' +
                '<div class="c_group c_body" style="display:table-row-group">' +
                '{{#dimensions}}' +
	                '<div class="c_row" style="display:table-row">' +
	                	'<div class="cell cell_name" style="display:table-cell"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
	                	'{{#measures}}' +
	                		'<div class="cell cell_graph c_rownum_{{rownum}} c_colnum_{{colnum}}" style="display:table-cell" id="{{viewid}}"></div>' +
	                	'{{/measures}}' +
	                '</div>' +
                '{{/dimensions}}' +
	                '<div class="c_row c_totals" style="display:table-row">' +
		            	'{{#dimensions_totals}}' +
		            		'<div class="cell cell_name" style="display:table-cell"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
	            			'{{#measures_totals}}' +
	            				'<div class="cell cell_graph c_rownum_totals c_colnum_{{colnum}}" style="display:table-cell" id="{{viewid}}"></div>' +
	            			'{{/measures_totals}}' +
		            	'{{/dimensions_totals}}' +
		            '</div>' +
                '</div>' +                
                '</div>' +
                '</td></tr><tr><td>{{{noData}}}</td></tr></table>' +
                '</div>',

            horizontalScrollable: '<div id="{{uid}}">' +
                '<div class="composedview_grid" style="grid-template-columns: max-content{{#measures}} max-content{{/measures}}">'+ //;height:100px;overflow:auto">' +
                '<div class="c_header cell cell_empty"></div>' +
                '{{#measures}}' +
                    '<div class="c_header cell cell_title"><div style="white-space:nowrap;"><div class="rawhtml" style="vertical-align:middle;float:left">{{{rawhtml}}}</div><div style="float:left;vertical-align:middle"><div class="title"><a class="link_tooltip" href="#" data-toggle="tooltip" data-placement="bottom" title="{{{subtitle}}}">{{{title}}}</a></div></div><div class="shape" style="float:left;vertical-align:middle">{{shape}}</div></div></div>' +
                '{{/measures}}' +
                '{{#dimensions}}' +
                    '<div class="c_row cell cell_name"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
                    '{{#measures}}' +
                        '<div class="c_row cell cell_graph c_rownum_{{rownum}} c_colnum_{{colnum}}"></div>' +
                    '{{/measures}}' +
                '{{/dimensions}}' +
                '{{#dimensions_totals}}' +
                    '<div class="c_row c_totals c_footer cell cell_name"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
                    '{{#measures_totals}}' +
                        '<div class="c_row c_totals c_footer cell cell_graph c_rownum_totals c_colnum_{{colnum}}"></div>' +
                    '{{/measures_totals}}' +
                '{{/dimensions_totals}}' +
                '</div>' +
                '</div>'
        },

        semaphore: {
            totals: false,
            model: false
        },

        generateUid: function(seed, col) {
            if (seed) {
                if (col !== undefined) {
                    seed = seed + "_" + col;                    
                }
                  var hash = 0, i, chr;
                  if (seed.length === 0) {
                      return "composedcell_" + hash;
                  }
                  for (i = 0; i < seed.length; i++) {
                    chr   = seed.charCodeAt(i);
                    hash  = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                  }
                  return "composedcell_" + hash;
            }
            return new Date().getTime() + "_" + Math.floor(Math.random() * 1e6);
        },

        // if total is present i need to wait for both redraw events
        redrawSemaphore: function (type) {
            if (this.options.modelTotals) {
                this.semaphore[type] = true;
                if (this.semaphore.model && this.semaphore.totals) {
                    this.semaphore.model =false;
                    // always redraw for every new models that finishes the query, regardless of modelTotals. Fixes N/A bug with telefonica
                    // in the end modelTotals is just one record and is usually faster than model (100-1000 rows)
                    //this.semaphore.totals =false;
                    this.redraw();
                }
            } else {
                this.redraw();
            }
        },

        initialize: function (options) {
            var self = this;
            this.options = options;
            
            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw', 'redrawSemaphore');


            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', function () {
                self.redrawSemaphore("model");
            });

            if (this.options.maxDataRows) {
                this.maxDataRows = this.options.maxDataRows;
            }
            else {
                this.maxDataRows = MAX_ROWS;
            }

            if (this.options.modelTotals) {
                this.options.modelTotals.bind('change', this.render);
                this.options.modelTotals.fields.bind('reset', this.render);
                this.options.modelTotals.fields.bind('add', this.render);

                this.options.modelTotals.bind('query:done', function () {
                    self.redrawSemaphore("totals");
                });
            }

            this.uid = options.id || ("composed_" + this.generateUid()); // generating an unique id for the chart

            _.each(this.options.measures, function (m, index) {
                self.options.measures[index]["measure_id"] = self.generateUid();
            });

            _.each(this.options.measuresTotals, function (m, index) {
                self.options.measuresTotals[index]["measure_id"] = self.generateUid();
            });

            //contains the array of views contained in the composed view
            this.views = [];

            //if(this.options.template)
            //    this.template = this.options.template;

        },

        render: function () {
            var self = this;
            var graphid = "#" + this.uid;

            if (self.graph){
                jQuery(graphid).empty();
            }
        },

        getViewFunction: function () {
            return function (measureID) {
                var measure = _.find(this.measures, function (f) {
                    return f.measure_id == measureID;
                });
                return measure.viewid;
            };
        },

        redraw: function () {
            var self = this;

            self.dimensions = [ ];
            self.noData = "";

            // if a dimension is defined I need a facet to identify all possibile values
            if (self.options.groupBy) {
                var facets = this.model.getFacetByFieldId(self.options.groupBy);
                var field = this.model.fields.get(self.options.groupBy);

                if(!field)
                    throw "ComposedView: unable to find groupBy field ["+ self.options.groupBy +"] in model ["+this.model.id+"]";

                if (!facets) {
                    throw "ComposedView: no facet present for groupby field [" + self.options.groupBy + "]. Define a facet on the model before view render";
                }

                if (facets.attributes.terms.length == 0 && !self.options.modelTotals) {
                    self.noData = new recline.View.NoDataMsg().create2();
                }
                else {
                    var records = self.model.getRecords();
                    var termHashes = _.groupBy(records, function(rec) { return rec.attributes[self.options.groupBy]});

                    for (var idx = 0; idx < facets.attributes.terms.length && this.dimensions.length < self.maxDataRows; idx++) {
                        var t = facets.attributes.terms[idx];
                        if (t.count > 0) {
                            // facet has no renderer, so we need to retrieve the first record that matches the value and use its renderer
                            // This is needed to solve the notorious "All"/"_ALL_" issue
                            var term_rendered;
                            var termValue = t.term;
                            if (termValue)
                        	{
                            	var validRecs = termHashes[termValue];
                                if (validRecs && validRecs.length) {
                                	term_rendered = validRecs[0].getFieldValue(field);
                                }
                        	}
                            var uid = self.generateUid(termValue); // generating an unique id for the chart
                            	
                            var term_desc;
                            if (self.options.rowTitle) {
                                term_desc = self.options.rowTitle(t);
                            }
                            else if (self.options.dictionary && termValue && self.options.dictionary[termValue]) {
                                term_desc = self.options.dictionary[termValue];
                            }
                            else if (self.options.titlePrefix) {
                                term_desc = self.options.titlePrefix + termValue;
                            }
                            else {
                                term_desc = term_rendered || termValue;
                            }

                            var dim = {term: termValue, term_desc: term_desc, id_dimension: uid, shape: t.shape, rownum: idx};

                            dim["getDimensionIDbyMeasureID"] = function () {
                                return function (measureID) {
                                    var measure = _.find(this.measures, function (f) {
                                        return f.measure_id == measureID;
                                    });
                                    return measure.viewid;
                                };
                            };
                            self.dimensions.push(self.addFilteredMeasuresToDimension(dim, field, termHashes[termValue]));
                        }
                    }

                    function calcPercVariation(kpi, compare) {
                        return Math.round(10000* (kpi-compare) / compare) / 100;
                    }
                    if (debugComposedView) {
                        // this code is not generic. Just showing USER_ACTIVITY and EFFECTIVENESS
                        var realResults = _.map(this.dimensions, function(m) {
                            var user_activity = m.measures[0].dataset.records.models[0].attributes.USER_ACTIVITY;
                            var old_user_activity = m.measures[0].dataset.records.models[0].attributes.COMPARE_USER_ACTIVITY;
                            var effectiveness = m.measures[1].dataset.records.models[0].attributes.IMPACT;
                            var old_effectiveness = m.measures[1].dataset.records.models[0].attributes.COMPARE_IMPACT;
                            var delta_user_activity = "N/A";
                            var delta_effectiveness = "N/A";
                            if (old_user_activity) {
                                delta_user_activity = calcPercVariation(user_activity, old_user_activity);
                            }
                            if (old_effectiveness) {
                                delta_effectiveness = calcPercVariation(effectiveness, old_effectiveness);
                            }

                            return {
                                name: m.term, 
                                USER_ACTIVITY: user_activity, 
                                OLD_USER_ACTIVITY: old_user_activity,
                                DELTA_USER_ACTIVITY: delta_user_activity,
                                EFFECTIVENESS: effectiveness,
                                OLD_EFFECTIVENESS: old_effectiveness,
                                DELTA_EFFECTIVENESS: delta_effectiveness
                            }
                        });
                        var realResultsSorted = _.sortBy(realResults, function(r) {
                            if (r && r.USER_ACTIVITY !== undefined) return -r.USER_ACTIVITY
                        });
                        console.log(realResultsSorted);
                    }
                }
            } else {
                var uid = this.generateUid(); // generating an unique id for the chart
                var dim;

                if (self.options.type == "groupByRecord")
                    dim = self.addMeasuresToDimension({id_dimension: uid});
                else
                    dim = self.addMeasuresToDimensionAllModel({id_dimension: uid}, self.options.measures);

                _.each(dim, function (f, index) {
                    f["getDimensionIDbyMeasureID"] = self.getViewFunction;
                    dim[index] = f;
                });

                self.dimensions = dim;
            }
            this.measures = this.options.measures;


            if (self.options.modelTotals) {
                var data = [];
                var uid = self.generateUid();
                var dim = {id_dimension: uid, measures: data};

                if(self.options.titleTotals) {
                    dim["term_desc"] = self.options.titleTotals;
                }

                _.each(self.options.measuresTotals, function (d, idx) {

                    var val = {
                        view: d.view,
                        viewid: self.generateUid(),
                        colnum: idx,
                        measure_id: d.measure_id,
                        props: d.props,
                        dataset: self.options.modelTotals,
                        title: d.title,
                        subtitle: d.subtitle,
                        rawhtml: d.rawhtml};
                    data.push(val);

                });
                dim["getDimensionIDbyMeasureTotalsID"] = function () {
                    return function (measureID) {
                    	var j = -1;
                        var measure = _.find(self.measures, function (f) {
                            j++;
                        	return f.measure_id == measureID;
                        });
                    	if (measure && j >= 0 && j < self.measures_totals.length)
                    		return self.measures_totals[j].viewid;
                    };
                };

                self.dimensions_totals = [dim];
                self.measures_totals = data;
            }


            var tmpl = this.templates.vertical;
            if (this.options.template)
                tmpl = this.templates[this.options.template];
            if (this.options.customTemplate)
                tmpl = this.options.customTemplate;

            var out = Mustache.render(tmpl, self);
            this.el.html(out);

            if (this.options.thinTotalsLine) {
                this.el.find("div.c_row.c_totals").removeClass("c_totals");
            }

            this.attachViews();

            // for use when indicators are present in composed view
            var $indicatorsList = this.el.find('div.indicator');
            if ($indicatorsList.length) {
                $indicatorsList.on('comparison_disabled', function() {
                    self.comparisonDisabled = true;
                });
                $indicatorsList.on('comparison_enabled', function() {
                    self.comparisonDisabled = false;
                });
            }
            if (self.options.postRender){
            	self.options.postRender.call();
            }
            // force a resize to ensure that contained object have the correct amount of width/height
            this.el.trigger('resize');
        },

        attachViews: function () {
            var self = this;
            self.views = [];

            _.each(self.dimensions, function (dim, dim_idx) {
                _.each(dim.measures, function (m, meas_idx) {
                    var $el = self.$el.find(".c_rownum_"+ dim_idx + ".c_colnum_" + meas_idx); // $('#' + m.viewid);
                    m.props.el = $el;
                    m.props.model = m.dataset;
                    if (!m.props.state) {
                        m.props.state = {};
                    }
                    m.props.state.comparisonDisabled = self.comparisonDisabled;
                    m.props.state.fillCompareSpace = self.comparisonDisabled;

                    var view = new recline.View[m.view](m.props);
                    self.views.push(view);

                    if (typeof(view.render) != 'undefined') {
                        view.render();
                    }
                    if (typeof(view.redraw) != 'undefined') {
                        view.redraw();
                    }

                });
            });

            _.each(self.dimensions_totals, function (dim) {
                _.each(dim.measures, function (m, meas_idx) {
                    var $el = self.$el.find(".c_rownum_totals.c_colnum_" + meas_idx); // $('#' + m.viewid);
                    m.props.el = $el;
                    m.props.model = m.dataset;
                    if (!m.props.state) {
                        m.props.state = {};
                    }
                    m.props.state.comparisonDisabled = self.comparisonDisabled;
                    m.props.state.fillCompareSpace = self.comparisonDisabled;
                    var view = new recline.View[m.view](m.props);
                    self.views.push(view);

                    if (typeof(view.render) != 'undefined') {
                        view.render();
                    }
                    if (typeof(view.redraw) != 'undefined') {
                        view.redraw();
                    }

                });
            });
        },

        /*
         for each facet pass to the view a new model containing all rows with same facet value
         */
        addFilteredMeasuresToDimension: function (currentRow, dimensionField, filteredRecords) {
            var self = this;

            // now creating a single row model with the requested data, instead of querying each time (slow and sometimes causing unwanted N/A cells)
            var filtereddataset = new recline.Model.Dataset({ records: [filteredRecords[0].attributes], fields: filteredRecords[0].fields.toJSON(), renderer: self.model.attributes.renderer});

            var data = [];
            _.each(self.options.measures, function (m, idx) {
                var val = {
                    view: m.view,
                    rownum: currentRow.rownum,
                    colnum: idx,
                    viewid: self.generateUid(currentRow.term, idx),
                    measure_id: m.measure_id,
                    props: m.props,
                    dataset: filtereddataset,
                    title: m.title,
                    subtitle: m.subtitle,
                    rawhtml: m.rawhtml
                };
                data.push(val);
            });

            currentRow["measures"] = data;
            return currentRow;
        },

        /*
         for each record pass to the view a new model containing only that row
         */

        addMeasuresToDimension: function (currentRow) {
            var self = this;
            var ret = [];

            _.each(self.model.records.models, function (r, rec_idx) {
                var data = [];
                _.each(self.options.measures, function (m, meas_idx) {
                    var model = new recline.Model.Dataset({ records: [r.toJSON()], fields: r.fields.toJSON(), renderer: self.model.attributes.renderer});
                    model.fields = r.fields;

                    var val = {
                        view: m.view,
                        rownum: rec_idx,
                        colnum: meas_idx,
                        viewid: self.generateUid(currentRow.term, meas_idx),
                        measure_id: m.measure_id,
                        props: m.props,
                        dataset: model,
                        title: m.title,
                        subtitle: m.subtitle,
                        rawhtml: m.rawhtml
                    };
                    data.push(val);
                });
                var currentRec = {measures: data, id_dimension: currentRow.id_dimension};
                ret.push(currentRec);
            });
            return ret;
        },

        /*
         pass to the view all the model
         */

        addMeasuresToDimensionAllModel: function (currentRow, measures, totals) {
            var self = this;

            var data = [];


            _.each(measures, function (d, idx) {
                var view;
                var props;
                if (totals) {
                    view = d.totals.view;
                    if (d.totals.props)
                        props = d.totals.props;
                    else
                        props = {};
                }
                else {
                    view = d.view;
                    props = d.props;
                }


                var val = {
                    view: view,
                    colnum: idx,
                    viewid: self.generateUid(currentRow.term, idx),
                    measure_id: d.measure_id,
                    props: props,
                    dataset: self.model,
                    title: d.title,
                    subtitle: d.subtitle,
                    rawhtml: d.rawhtml
                };
                data.push(val);
            });

            currentRow["measures"] = data;
            return [currentRow];
        }
    });

    return view.Composed;

});