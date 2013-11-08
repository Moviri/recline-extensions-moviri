require.config({
    paths: {
    'jquery': '../bower_components/jquery/jquery',
    'jquery-ui': '../bower_components/jquery-ui-amd/jquery-ui-1.10.0/jqueryui/',

    'underscore': '../bower_components/underscore-amd/underscore',
    'backbone': '../bower_components/backbone-amd/backbone',
    'accounting' : '../bower_components/accounting/accounting',
    'mustache' :   '../bower_components/mustache/mustache',
    'd3' : '../bower_components/d3/d3',
    'd3v2' : '../bower_components/d3amd/d3amd.v2',
    'datejs': '../bower_components/datejs/build/date',

    'slickgrid/slick.core': '../bower_components/slickgrid-moviri/slick.core',
    'slickgrid/slick.grid': '../bower_components/slickgrid-moviri/slick.grid',

    'slickgrid/slick.editors': '../bower_components/slickgrid-moviri/slick.editors',
    'slickgrid/slick.formatters': '../bower_components/slickgrid-moviri/slick.formatters',
    'slickgrid/slick.rowselectionmodel': '../bower_components/slickgrid-moviri/plugins/slick.rowselectionmodel',
    'slickgrid/slick.cellrangeselector': '../bower_components/slickgrid-moviri/plugins/slick.cellrangeselector',
    'slickgrid/slick.cellselectionmodel': '../bower_components/slickgrid-moviri/plugins/slick.cellselectionmodel',

    'crossfilter' : '../bower_components/crossfilter/crossfilter.min',
    'rickshaw' : '../bower_components/rickshaw/rickshaw',
    'd3cloud' : '../bower_components/d3cloud/d3.layout.cloud',

    'async' : '../bower_components/requirejs-plugins/src/async',

    'nvd3partial': '../bower_components/nvd3-gianlucaguarini/nv.d3',
    'nv.tooltips': '../bower_components/nvd3-gianlucaguarini/src/tooltip',

    //'REM' : '.',

    //////////////////////////// DA CAMBIARE!!!!!

            //'bootstrap' : 'REM/vendor/bootstrap',
            // 'recline.dataset': 'REM/vendor/recline/recline.dataset',
            // 'recline' : 'REM/vendor/recline/recline.min',
            // 'recline-extensions-amd': 'REM/recline-extensions/recline-extensions-amd',
            // 'recline-amd': 'REM/recline-extensions/recline-amd',

            // 'recline.model.extensions.all': 'REM/recline-extensions/model/model.extensions.all',

            // 'recline.backend.extensions.csv' : 'REM/recline-extensions/backend/backend.extensions.csv',
            // 'recline.backend.extensions.jsonp' : 'REM/recline-extensions/backend/backend.jsonp',
            // 'recline.backend.extensions.jsonp_memory' : 'REM/recline-extensions/backend/backend.jsonp.memorystore',
            // 'recline.backend.extensions.union' : 'REM/recline-extensions/backend/union.backend',

            // 'recline.model.extensions.filteredmodel': 'REM/recline-extensions/model/filteredmodel',
            // 'recline.model.extensions.virtualmodel': 'REM/recline-extensions/model/virtualmodel',
            // 'recline.model.extensions.joinedmodel': 'REM/recline-extensions/model/joinedmodel',
            // 'recline.model.extensions.unionmodel': 'REM/recline-extensions/model/unionmodel',
            // 'recline.model.extensions.socketmodel': 'REM/recline-extensions/model/socket.model',
            // 'recline.model.extensions.facets': 'REM/recline-extensions/model/model.extensions.facets',

            // 'recline.data.extensions.aggregations' : 'REM/recline-extensions/data/data.aggregations',
            // 'recline.data.extensions.colors' : 'REM/recline-extensions/data/data.colors',
            // 'recline.data.extensions.faceting' : 'REM/recline-extensions/data/data.faceting',
            // 'recline.data.extensions.fieldsutilities' : 'REM/recline-extensions/data/data.fieldsutilities',
            // 'recline.data.extensions.filters' : 'REM/recline-extensions/data/data.filters',
            // 'recline.data.extensions.actions' : 'REM/recline-extensions/data/action',
            // 'recline.data.extensions.shapes' : 'REM/recline-extensions/data/data.shapes',
            // 'recline.data.extensions.statemanagement' : 'REM/recline-extensions/data/data.statemanagement',
            // 'recline.data.extensions.formatters' : 'REM/recline-extensions/data/data.formatters',
            // 'recline.data.extensions.seriesutility' : 'REM/recline-extensions/data/data.series.utility',
            // 'recline.data.extensions.templateshapes' : 'REM/recline-extensions/data/template.shapes',

            // 'recline.views.extensions.d3bubble': 'REM/recline-extensions/views/d3/view.d3.bubble',
            // 'recline.views.extensions.d3bullet': 'REM/recline-extensions/views/d3/view.d3.bullet',
            // 'recline.views.extensions.d3calendarview': 'REM/recline-extensions/views/d3/view.d3.calendarview',
            // 'recline.views.extensions.d3chord': 'REM/recline-extensions/views/d3/view.d3.chord',
            // 'recline.views.extensions.d3choroplethmap': 'REM/recline-extensions/views/d3/view.d3.choroplethmap',
            // 'recline.views.extensions.d3cloud': 'REM/recline-extensions/views/d3/view.d3.cloud',
            // 'recline.views.extensions.d3cooccurencematrix': 'REM/recline-extensions/views/d3/view.d3.co-occurencematrix',
            // 'recline.views.extensions.d3gravitybubble': 'REM/recline-extensions/views/d3/view.d3.gravitybubble',
            // 'recline.views.extensions.d3sparkline': 'REM/recline-extensions/views/d3/view.d3.sparkline',
            // 'recline.views.extensions.d3table': 'REM/recline-extensions/views/d3/view.d3.table',
            // 'recline.views.extensions.d3treemap': 'REM/recline-extensions/views/d3/view.d3.treemap',

            // 'recline.views.extensions.composedView': 'REM/recline-extensions/views/view.composed',
            // 'recline.views.extensions.googleMaps': 'REM/recline-extensions/views/view.GoogleMaps',
            // 'recline.views.extensions.indicator': 'REM/recline-extensions/views/view.indicator',
            // 'recline.views.extensions.kartograph': 'REM/recline-extensions/views/view.kartograph',
            // 'recline.views.extensions.loader': 'REM/recline-extensions/views/view.loader',
            // 'recline.views.extensions.no_data': 'REM/recline-extensions/views/view.no_data',
            // 'recline.views.extensions.nvd3_graph' : 'REM/recline-extensions/views/view.nvd3.graph',
            // 'recline.views.extensions.rickshaw': 'REM/recline-extensions/views/view.rickshaw',
            // 'recline.views.extensions.saveCsv': 'REM/recline-extensions/views/view.save_csv',
            // 'recline.views.extensions.slickgrid_graph': 'REM/recline-extensions/views/view.slickgrid_graph',
            // 'recline.views.extensions.xcharts' : 'REM/recline-extensions/views/view.xcharts',
            // 'recline.views.extensions.widget_currentfilter' : 'REM/recline-extensions/views/widget.currentfilter',
            // 'recline.views.extensions.widget_datepicker' : 'REM/recline-extensions/views/widget.datepicker',
            // 'recline.views.extensions.widget_facetdashboard' : 'REM/recline-extensions/views/widget.facet.dashboard',
            // 'recline.views.extensions.widget_genericfilter' : 'REM/recline-extensions/views/widget.genericfilter',
            // 'recline.views.extensions.widget_multibutton_dropdown_filter' : 'REM/recline-extensions/views/widget.multibutton_dropdown_filter',
            // 'recline.views.extensions.widget_visualsearch' : 'REM/recline-extensions/views/widget.visual.search',

            // 'jquery.event.drag-2.2': 'REM/vendor/jquery.event.drag-2.2',
            // 'jquery-migrate-1.2.1': 'REM/vendor/jquery-migrate-1.2.1.min', //needed for compatibility of slickgrid moviri and jquery 1.9

            // 'bootstrap-multiselect': 'REM/vendor/bootstrap-multiselect/bootstrap-multiselect',

            // 'topojson' : 'REM/vendor/topojson/topojson.v0.min',
            // 'toAscii' : 'REM/vendor/toAscii/toAscii',

            // 'xcharts' : 'REM/vendor/xcharts/xcharts',

            // 'chroma' : 'REM/vendor/chroma.js/chroma.min',
            // 'chosen' : 'REM/vendor/chosen/chosen.jquery',
            // 'jslider' : 'REM/vendor/jquery-slider/js/jquery.slider.min',
            // 'datepicker' : 'REM/vendor/datepicker/1.0.0/js/datepicker',
            // 'markerclusterer' : 'REM/vendor/google-maps/markerclusterer',

            //'nvd3' : 'REM/recline-extensions/nvd3',

            // 'DateRangesWidget' : 'REM/vendor/datepicker/1.0.0/js/DateRangesWidget'
},
shim: {
    'app' : { deps: [ 'jquery' ]},
    'jquery' : { exports: '$' },
    'REM/vendor/jquery-slider/js/jquery.slider.min' : { deps: ['jquery-ui/widget']},
    'REM/vendor/bootstrap': {
        deps: [ 'jquery' ]
    },
    'REM/vendor/recline/recline.min': {
        deps: ['jquery', 'backbone', 'underscore', 'REM/vendor/bootstrap', 'mustache']
    },
    'REM/recline-extensions/recline-amd': {
        deps: ['backbone', 'underscore', 'REM/vendor/bootstrap', 'mustache']
    },
    'REM/recline-extensions/model/model.extensions.all' : {
        deps: ['REM/recline-extensions/recline-amd', 'backbone', 'underscore', 'REM/vendor/bootstrap', 'mustache']
    },
    'REM/recline-extensions/recline-extensions-amd' : {
        deps: [ 'REM/recline-extensions/model/model.extensions.all'],
        exports: 'recline'
    },
    'async!https://maps.googleapis.com/maps/api/js?v=3&sensor=true' : { deps: ['async'], exports : 'google'},
    'mustache' : { exports: 'Mustache' },
    'REM/vendor/xcharts/xcharts' : { deps: ['mustache', 'd3v2'] },

    'd3': { exports: 'd3' },
    'd3v2': { exports: 'd3' },
    'REM/vendor/topojson/topojson.v0.min': { exports: 'topojson' },
    'REM/vendor/chosen/chosen.jquery' : { exports: 'Chosen' },
    'rickshaw' : { exports: 'Rickshaw'},
    'd3cloud' : { deps: ['d3v2']},
    'REM/vendor/jquery.event.drag-2.2' : { deps: [ 'jquery' ] },
    'REM/vendor/jquery-migrate-1.2.1.min' : { deps: [ 'jquery' ] },
    'jquery-ui' : { deps: [ 'jquery' ] },
    'crossfilter' : { exports: 'crossfilter'},
    'slickgrid/slick.editors':  { deps: [ 'jquery' ] },
    'slickgrid/slick.formatters':  { deps: [ 'jquery' ] },
    'slickgrid/slick.rowselectionmodel' : { deps: [ 'jquery' ] },
    'slickgrid/slick.cellrangeselector' : { deps: [ 'jquery' ] },
    'slickgrid/slick.cellselectionmodel' : { deps: [ 'jquery' ] },

    'slickgrid/slick.core' : { deps: [ 'REM/recline-extensions/recline-extensions-amd', 'REM/vendor/jquery.event.drag-2.2', 'jquery-ui/sortable'] },
    'slickgrid/slick.grid' : { deps: [ 'REM/recline-extensions/recline-extensions-amd', 'REM/vendor/jquery.event.drag-2.2', 'jquery-ui/sortable'] },
    'REM/recline-extensions/model/virtualmodel' : {
        deps: [ 'crossfilter', 'REM/recline-extensions/data/data.aggregations' ]
    },
    'REM/recline-extensions/model/filteredmodel' : {
        deps: [ 'REM/recline-extensions/model/model.extensions.facets', 'REM/recline-extensions/data/data.filters', 'REM/recline-extensions/data/data.faceting' ]
    },

    'nvd3partial' : { deps: [ 'REM/recline-extensions/recline-extensions-amd', 'd3v2' ] , exports: 'nv'},
    'REM/recline-extensions/nvd3' : { deps: [ 'nvd3partial', 'd3v2' ] , exports: 'nv'},

    'nv.tooltips' : { deps: ['REM/recline-extensions/nvd3'] },
    'REM/vendor/chroma.js/chroma.min' : { exports: 'chroma'},
    'REM/vendor/datepicker/1.0.0/js/DateRangesWidget' : { deps: [ 'jquery' ] },
    'REM/vendor/datepicker/1.0.0/js/datepicker' : {
        deps: [ 'REM/vendor/datepicker/1.0.0/js/DateRange', 'REM/vendor/datepicker/1.0.0/js/DateRangesWidget']
    }

}
});

// var reclineVendorPath = '';
// var metaObjs = document.getElementsByName('reclineVendorPath');
// if (metaObjs.length && metaObjs.length === 1 && metaObjs[0].content) {
//     reclineVendorPath = metaObjs[0].content;
// }
// var newConf = relativizeDependencies(reclineVendorPath);

// function mergeLevel(old, new_) {
//     'use strict';
//     var merged = new_;
//     for (var key in old) {
//         if (typeof merged[key] === 'undefined') {
//             merged[key] = old[key];
//         }
//     }
//     return merged;
// }
// var mergedConf = {
//     paths: mergeLevel(conf.paths, newConf.paths),
//     shim: mergeLevel(conf.shim, newConf.shim)
// };
// console.log(mergedConf);
// require.config(mergedConf);
