/* global define */
define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'd3', 'mustache', 'underscore', 'backbone', 'REM/recline-extensions/backend/backend.jsonp', 'REM/recline-extensions/model/filteredmodel'
    ], function ($, recline, d3, Mustache, _, Backbone) {

    "use strict";

    recline.View = recline.View || {};

    var view = recline.View;


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
	                		'<div class="cell cell_graph" style="display:table-cell" id="{{viewid}}"></div>' +
	                	'{{/measures}}' +
	                '</div>' +
                '{{/dimensions}}' +
	                '<div class="c_row c_totals" style="display:table-row">' +
		            	'{{#dimensions_totals}}' +
		            		'<div class="cell cell_name" style="display:table-cell"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
	            			'{{#measures_totals}}' +
	            				'<div class="cell cell_graph" style="display:table-cell" id="{{viewid}}"></div>' +
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
                        '<div class="c_row cell cell_graph" id="{{viewid}}"></div>' +
                    '{{/measures}}' +
                '{{/dimensions}}' +
                '{{#dimensions_totals}}' +
                    '<div class="c_row c_totals c_footer cell cell_name"><div class="title" style="float:left">{{term_desc}}</div><div class="shape" style="float:left">{{{shape}}}</div></div>' +
                    '{{#measures_totals}}' +
                        '<div class="c_row c_totals c_footer cell cell_graph" id="{{viewid}}"></div>' +
                    '{{/measures_totals}}' +
                '{{/dimensions_totals}}' +
                '</div>' +
                '</div>'

        },

        generateUid: function() {
            return new Date().getTime() + "_" + Math.floor(Math.random() * 1e6);
        },

        // if total is present i need to wait for both redraw events
        redrawSemaphore: function (type, self) {

            if (!self.semaphore) {
                self.semaphore = "";
            }
            if (self.options.modelTotals) {
                if (type == "model") {
                    if (self.semaphore == "totals") {
                        self.semaphore = "";
                        self.redraw();
                    } else {
                        self.semaphore = "model";
                    }
                } else {
                    if (self.semaphore == "model") {
                        self.semaphore = "";
                        self.redraw();
                    } else {
                        self.semaphore = "totals";
                    }
                }
            } else {
                self.redraw();
            }
        },

        initialize: function (options) {
            var self = this;
            this.options = options;
            
            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw');


            this.model.bind('change', this.render);
            this.model.fields.bind('reset', this.render);
            this.model.fields.bind('add', this.render);

            this.model.bind('query:done', function () {
                self.redrawSemaphore("model", self);
            });

            if (this.options.modelTotals) {
                this.options.modelTotals.bind('change', this.render);
                this.options.modelTotals.fields.bind('reset', this.render);
                this.options.modelTotals.fields.bind('add', this.render);

                this.options.modelTotals.bind('query:done', function () {
                    self.redrawSemaphore("totals", self);
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

            if (self.graph)
                jQuery(graphid).empty();

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

                if (facets.attributes.terms.length == 0 && !self.options.modelTotals)
                    self.noData = new recline.View.NoDataMsg().create2();

                else _.each(facets.attributes.terms, function (t) {
                    if (t.count > 0) {
                        var uid = self.generateUid(); // generating an unique id for the chart

                        // facet has no renderer, so we need to retrieve the first record that matches the value and use its renderer
                        // This is needed to solve the notorious "All"/"_ALL_" issue
                        var term_rendered;
                        var termValue = t.term;
                        if (termValue)
                    	{
                        	var validRec = _.find(self.model.getRecords(), function(rec) { return rec.attributes[self.options.groupBy] == termValue; });
                            if (validRec)
                            	term_rendered = validRec.getFieldValue(field);
                    	}
                        	
                        var term_desc;
                        if (self.options.rowTitle)
                            term_desc = self.options.rowTitle(t);
                        else if (self.options.dictionary && termValue && self.options.dictionary[termValue]) {
                            term_desc = self.options.dictionary[termValue];
                        }
                        else if (self.options.titlePrefix) {
                            term_desc = self.options.titlePrefix + termValue;
                        }
                        else
                            term_desc = term_rendered || termValue;

                        var dim = {term: termValue, term_desc: term_desc, id_dimension: uid, shape: t.shape};

                        dim["getDimensionIDbyMeasureID"] = function () {
                            return function (measureID) {
                                var measure = _.find(this.measures, function (f) {
                                    return f.measure_id == measureID;
                                });
                                return measure.viewid;
                            };
                        };

                        self.dimensions.push(self.addFilteredMeasuresToDimension(dim, field));
                    }
                });



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

                _.each(self.options.measuresTotals, function (d) {

                    var val = {
                        view: d.view,
                        viewid: self.generateUid(),
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

            _.each(self.dimensions, function (dim) {
                _.each(dim.measures, function (m) {
                    var $el = $('#' + m.viewid);
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
                _.each(dim.measures, function (m) {
                    var $el = $('#' + m.viewid);
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
        addFilteredMeasuresToDimension: function (currentRow, dimensionField) {
            var self = this;

            // dimension["data"] = [view]
            // a filtered dataset should be created on the original data and must be associated to the view
            var filtereddataset = new recline.Model.FilteredDataset({dataset: self.model});

            var filter = {field: dimensionField.get("id"), type: "term", term: currentRow.term, term_desc: currentRow.term, fieldType: dimensionField.get("type") };
            filtereddataset.queryState.addFilter(filter);
            filtereddataset.query();
            // foreach measure we need to add a view do the dimension

            var data = [];
            _.each(self.options.measures, function (d) {
                var val = {
                    view: d.view,
                    viewid: self.generateUid(),
                    measure_id: d.measure_id,
                    props: d.props,
                    dataset: filtereddataset,
                    title: d.title,
                    subtitle: d.subtitle,
                    rawhtml: d.rawhtml
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


            _.each(self.model.records.models, function (r) {
                var data = [];
                _.each(self.options.measures, function (d) {


                    var model = new recline.Model.Dataset({ records: [r.toJSON()], fields: r.fields.toJSON(), renderer: self.model.attributes.renderer});
                    model.fields = r.fields;

                    var val = {
                        view: d.view,
                        viewid: self.generateUid(),
                        measure_id: d.measure_id,
                        props: d.props,
                        dataset: model,
                        title: d.title,
                        subtitle: d.subtitle,
                        rawhtml: d.rawhtml};
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


            _.each(measures, function (d) {
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
                    viewid: self.generateUid(),
                    measure_id: d.measure_id,
                    props: props,
                    dataset: self.model,
                    title: d.title,
                    subtitle: d.subtitle,
                    rawhtml: d.rawhtml};
                data.push(val);


            });


            currentRow["measures"] = data;
            return [currentRow];

        }


    });

    return view.Composed;

});