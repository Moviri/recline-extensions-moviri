require.config({
    paths: {
        'jquery': '../bower_components/jquery/jquery',
        'jquery-ui': 'vendor/jquery-ui/jquery-ui-1.8.23.custom.slickgrid',
        'bootstrap' : 'vendor/bootstrap',
        'CodeMirror' : '../bower_components/codemirror/lib/codemirror',
        'CodeMirror-extensions' : '../bower_components/codemirror/addon/lint/lint',
        'underscore': '../bower_components/underscore-amd/underscore',
        'backbone': '../bower_components/backbone-amd/backbone',
        'accounting' : '../bower_components/accounting/accounting',
        'mustache' :   '../bower_components/mustache/mustache',
        'recline.dataset': 'vendor/recline/recline.dataset',
        'recline' : 'vendor/recline/recline.min',
        'd3' : '../bower_components/d3/d3.min',
        'datejs': '../bower_components/datejs/build/date',
        'recline-extensions-amd': 'recline-extensions/recline-extensions-amd',
        'recline-amd': 'recline-extensions/recline-amd',

        'recline.model.extensions.all': 'recline-extensions/model/model.extensions.all',

        'recline.model.extensions.filteredmodel': 'recline-extensions/model/filteredmodel',
        'recline.model.extensions.virtualmodel': 'recline-extensions/model/virtualmodel',
        'recline.model.extensions.joinedmodel': 'recline-extensions/model/joinedmodel',
        'recline.model.extensions.unionmodel': 'recline-extensions/model/unionmodel',
        'recline.model.extensions.socketmodel': 'recline-extensions/model/socket.model',

        'recline.data.extensions.aggregations' : 'recline-extensions/data/data.aggregations',
        'recline.data.extensions.colors' : 'recline-extensions/data/data.colors',
        'recline.data.extensions.faceting' : 'recline-extensions/data/data.faceting',
        'recline.data.extensions.filters' : 'recline-extensions/data/data.filters',
        'recline.data.extensions.actions' : 'recline-extensions/data/action',
        'recline.data.extensions.shapes' : 'recline-extensions/data/data.shapes',
        'recline.data.extensions.formatters' : 'recline-extensions/data/data.formatters',
        'recline.data.extensions.seriesutility' : 'recline-extensions/data/data.series.utility',
        'recline.data.extensions.templateshapes' : 'recline-extensions/data/template.shapes',

        'slickgrid/slick.core': '../bower_components/slickgrid-moviri/slick.core',
        'slickgrid/slick.grid': '../bower_components/slickgrid-moviri/slick.grid',

        'slickgrid/slick.editors': '../bower_components/slickgrid-moviri/slick.editors',
        'slickgrid/slick.formatters': '../bower_components/slickgrid-moviri/slick.formatters',
        'slickgrid/slick.rowselectionmodel': '../bower_components/slickgrid-moviri/plugins/slick.rowselectionmodel',
        'slickgrid/slick.cellrangeselector': '../bower_components/slickgrid-moviri/plugins/slick.cellrangeselector',
        'slickgrid/slick.cellselectionmodel': '../bower_components/slickgrid-moviri/plugins/slick.cellselectionmodel',

        'jquery.event.drag-2.2': 'vendor/jquery.event.drag-2.2',
        'jquery-migrate-1.2.1': 'vendor/jquery-migrate-1.2.1.min', //needed for compatibility of slickgrid moviri and jquery 1.9

        'crossfilter' : '../bower_components/crossfilter/crossfilter.min',
        'bootstrap-multiselect': 'vendor/bootstrap-multiselect/bootstrap-multiselect',

        'topojson' : 'vendor/topojson/topojson.v0.min',
        'toAscii' : 'vendor/toAscii/toAscii',

        'xcharts' : 'vendor/xcharts/xcharts',

        'chroma' : 'vendor/chroma.js/chroma.min', // diverso!!! '../bower_components/chroma-js/chroma',
        //'chosen-selectParser' : '../compiled/chosen/coffee/lib/select-parser',
        //'chosen-abstract' : '../compiled/chosen/coffee/lib/abstract-chosen',
        'chosen' : '../compiled/chosen/chosen.jquery' , //'vendor/chosen/chosen.jquery',
        'jslider' : 'vendor/jquery-slider/js/jquery.slider.min',
        'datepicker' : 'vendor/datepicker/1.0.0/js/datepicker',
        'rickshaw' : '../bower_components/rickshaw/rickshaw',
        'd3cloud' : '../bower_components/d3cloud/d3.layout.cloud',

        'async' : '../bower_components/requirejs-plugins/src/async',
        'markerclusterer' : 'vendor/google-maps/markerclusterer',

        'd3v2' : 'vendor/d3/v2/d3.v2.custom.min',

        'nvd3partial': '../bower_components/nvd3-gianlucaguarini/nv.d3',
        'nvd3' : 'vendor/nvd3-extensions/nv.d3.lineDottedChart', // 'vendor/nvd3/0.0.1/nv.d3.min',
        'nv.tooltips': '../bower_components/nvd3-gianlucaguarini/src/tooltip'
    },
    shim: {
        'jquery' : { exports: 'jQuery' },
        'bootstrap': {
            deps: [ 'jquery' ]
        },
        'recline': {
            deps: ['jquery', 'backbone', 'underscore', 'bootstrap', 'mustache']
        },
        'recline-amd': {
            deps: ['backbone', 'underscore', 'bootstrap', 'mustache']
        },
        'recline.model.extensions.all' : {
            deps: ['recline-amd', 'backbone', 'underscore', 'bootstrap', 'mustache']
        },
        'recline-extensions-amd' : {
            deps: [ 'recline.model.extensions.all'],
            exports: 'recline'
        },
        'async!https://maps.googleapis.com/maps/api/js?v=3&sensor=true' : { deps: ['async'], exports : 'google'},
        'mustache' : { exports: 'Mustache' },
        'xcharts' : { deps: ['mustache'] },

        'd3': { exports: 'd3' },
        'd3v2': { exports: 'd3' },
        'topojson': { exports: 'topojson' },
        //'chosen-selectParser' : { exports: 'SelectParser'},
        //'chosen-abstract' : { exports: 'AbstractChosen'},
        'chosen' : {
            //deps: ['chosen-abstract'],
            exports: 'Chosen'
        },
        'rickshaw' : { exports: 'Rickshaw'},
        'vendor/datepicker/1.0.0/js/DateRangesWidget' : { deps: [ 'jquery' ] },
        'datepicker' : {
            deps: ['vendor/datepicker/1.0.0/js/DateRange', 'vendor/datepicker/1.0.0/js/DateRangesWidget']
        },
        'd3cloud' : { deps: ['d3']},
        'jquery.event.drag-2.2' : { deps: [ 'jquery' ] },
        'jquery-migrate-1.2.1' : { deps: [ 'jquery' ] },
        'jquery-ui' : { deps: [ 'jquery' ] },
        'slickgrid/slick.editors':  { deps: [ 'jquery' ] },
        'slickgrid/slick.formatters':  { deps: [ 'jquery' ] },
        'slickgrid/slick.rowselectionmodel' : { deps: [ 'jquery' ] },
        'slickgrid/slick.cellrangeselector' : { deps: [ 'jquery' ] },
        'slickgrid/slick.cellselectionmodel' : { deps: [ 'jquery' ] },

        'slickgrid/slick.core' : { deps: [ 'recline-extensions-amd', 'jquery.event.drag-2.2', 'd3' ] },
        'slickgrid/slick.grid' : { deps: [ 'recline-extensions-amd', 'jquery.event.drag-2.2', 'd3' ] },
        'recline.model.extensions.virtualmodel' : {
            deps: [ 'crossfilter', 'recline.data.extensions.aggregations' ]
        },
        'recline.model.extensions.filteredmodel' : {
            deps: [ 'recline-extensions/model/model.extensions.facets', 'recline.data.extensions.filters', 'recline.data.extensions.faceting' ]
        },

        'nvd3partial' : { deps: [ 'recline-extensions-amd', 'd3' ] , exports: 'nv'},
        'nvd3' : { deps: [ 'nvd3partial' ] , exports: 'nv'}, // { deps: [ 'recline-extensions-amd', 'd3v2' ] , exports: 'nv'},

        'nv.tooltips' : { deps: ['nvd3'] },
        'chroma' : { exports: 'chroma'},

        'recline-extensions/views/widget.genericfilter' : { deps: ['jquery-ui']},

        'CodeMirror' : { exports: 'CodeMirror' },
        '../bower_components/codemirror/addon/fold/foldcode': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/fold/brace-fold': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/fold/indent-fold': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/fold/xml-fold': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/edit/closetag': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/edit/closebrackets.js': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/edit/matchbrackets': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/mode/javascript/javascript': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/mode/css/css': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/mode/xml/xml': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/mode/htmlmixed/htmlmixed': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/lint/javascript-lint': { deps: ['CodeMirror'] },
        '../bower_components/codemirror/addon/lint/json-lint': { deps: ['CodeMirror'] },
        'vendor/jshint-2.1.4' : { exports: 'JSHINT'}
    }
});

// require(['app', 'jquery', 'bootstrap' ], function (app, $) {
//    'use strict';
//    // load app.js!
// });    
