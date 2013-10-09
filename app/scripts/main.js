require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        'jquery-ui': '../bower_components/jquery-ui/ui/jquery-ui',
        'jquery-ui.draggable':'../bower_components/jquery-ui/ui/jquery.ui.draggable',
        'jquery-ui.mouse':'../bower_components/jquery-ui/ui/jquery.ui.mouse',
        'jquery-ui.widget':'../bower_components/jquery-ui/ui/jquery.ui.widget',
        'jquery-ui.sortable':'../bower_components/jquery-ui/ui/jquery.ui.sortable',
        'jquery-ui.position':'../bower_components/jquery-ui/ui/jquery.ui.position',
        'jquery-ui.custom.slickgrid': 'vendor/jquery-ui-1.8.23.custom.slickgrid',
        bootstrap: 'vendor/bootstrap',
        CodeMirror: '../bower_components/codemirror/lib/codemirror',
        'CodeMirror-extensions' : '../bower_components/codemirror/addon/lint/lint',
        underscore: '../bower_components/underscore-amd/underscore',
        backbone: '../bower_components/backbone-amd/backbone',
        accounting: '../bower_components/accounting/accounting',
        mustache:   '../bower_components/mustache/mustache',
        'recline.dataset': 'vendor/recline/recline.dataset',
        recline: 'vendor/recline/recline.min',
        'recline-extensions-amd': 'recline-extensions/recline-extensions-amd',


        'recline.model.extensions.generic' : 'recline-extensions/model/model.extensions.generic',
        'recline.model.extensions.query': 'recline-extensions/model/model.extensions.query',
        'recline.model.extensions.facets': 'recline-extensions/model/model.extensions.facets',
        'recline.model.extensions.filteredmodel': 'recline-extensions/model/filteredmodel',
        'recline.model.extensions.virtualmodel': 'recline-extensions/model/virtualmodel',
        'recline.model.extensions.joinedmodel': 'recline-extensions/model/joinedmodel',
        'recline.model.extensions.unionmodel': 'recline-extensions/model/unionmodel',
        'recline.model.extensions.customfilter': 'recline-extensions/model/model.extensions.customfilter',
        'recline.model.extensions.customformatter': 'recline-extensions/model/model.extensions.customformatter',
        'recline.model.extensions.selection': 'recline-extensions/model/model.extensions.selection',
        'recline.data.extensions.aggregations' : 'recline-extensions/data/data.aggregations',
        'recline.data.extensions.colors' : 'recline-extensions/data/data.colors',
        'recline.data.extensions.faceting' : 'recline-extensions/data/data.faceting',
        'recline.data.extensions.filters' : 'recline-extensions/data/data.filters',
        'recline.data.extensions.actions' : 'recline-extensions/data/action',
        'recline.data.extensions.shapes' : 'recline-extensions/data/data.shapes',



        'slickgrid/slick.core': '../bower_components/slickgrid-moviri/slick.core',
        'slickgrid/slick.grid': '../bower_components/slickgrid-moviri/slick.grid',

        'slickgrid/slick.editors': '../bower_components/slickgrid-moviri/slick.editors',
        'slickgrid/slick.formatters': '../bower_components/slickgrid-moviri/slick.formatters',
        'slickgrid/slick.rowselectionmodel': '../bower_components/slickgrid-moviri/plugins/slick.rowselectionmodel',
        'slickgrid/slick.cellrangeselector': '../bower_components/slickgrid-moviri/plugins/slick.cellrangeselector',
        'slickgrid/slick.cellselectionmodel': '../bower_components/slickgrid-moviri/plugins/slick.cellselectionmodel',

        'jquery.event.drag-2.2': 'vendor/jquery.event.drag-2.2',
        'jquery-migrate-1.2.1': 'vendor/jquery-migrate-1.2.1.min', //needed for compatibility of slickgrid moviri and jquery 1.9

        'crossfilter' : '../bower_components/crossfilter/crossfilter'
    },
    shim: {
        bootstrap: {
            deps: [ 'jquery' ],
            exports: 'jquery'
        },
        recline: {
            deps: [ 'backbone', 'bootstrap', 'mustache']
        },
        'recline-extensions-amd' : {
            deps: [ 'recline'/*, 'recline.model.extensions.query', 'recline.model.extensions.facets', 'recline.model.extensions.generic'*/],
            exports: 'recline'
        },
        'slickgrid/slick.grid' : {
            deps: [ 'jquery.event.drag-2.2']
        },
        'recline.model.extensions.virtualmodel' : {
            deps: [ 'crossfilter', 'recline.data.extensions.aggregations' ]
        },
        'CodeMirror' : {
            exports: 'CodeMirror'
        },
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

require(['app', 'jquery', 'bootstrap', 'recline' ], function (app) {
    'use strict';
    // use app here
});
