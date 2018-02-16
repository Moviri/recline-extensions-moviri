require.config({
    paths: {
    'jquery': '../bower_components/jquery/jquery',
    'jquery-ui': '../bower_components/jquery-ui-amd/jquery-ui-1.10.0/jqueryui/',
    'bootstrap': '../bower_components/bootstrap/docs/assets/js/bootstrap',

    'underscore': '../bower_components/underscore-amd/underscore',
    'backbone': '../bower_components/backbone/backbone',
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
    'slickgrid/slick.autotooltips': '../bower_components/slickgrid-moviri/plugins/slick.autotooltips',

    'crossfilter' : '../bower_components/crossfilter/crossfilter.min',
    'rickshaw' : '../bower_components/rickshaw/rickshaw',
    'd3cloud' : '../bower_components/d3cloud/d3.layout.cloud',

    'async' : '../bower_components/requirejs-plugins/src/async',

    'nvd3partial': '../bower_components/nvd3/nv.d3',
    'file-saver': '../bower_components/file-saver/FileSaver'
    //,'REM': '.' // uncomment this line if you want to create a single html page copied from a tutorial example
},
shim: {
    'app' : { deps: [ 'jquery' ]},
    'jquery' : { exports: '$' },
    'backbone': {
        deps: [
            'underscore',
            'jquery'
        ],
        exports: 'Backbone'
    },
    'REM/vendor/jquery-slider/js/jquery.slider.min' : { deps: ['jquery-ui/widget']},
    'bootstrap': {
        deps: [ 'jquery' ]
    },
    'REM/vendor/recline/recline.min': {
        deps: ['jquery', 'backbone', 'underscore', 'bootstrap', 'mustache']
    },
    'REM/recline-extensions/recline-amd': {
        deps: ['backbone', 'underscore', 'bootstrap', 'mustache']
    },
    'REM/recline-extensions/model/model.extensions.all' : {
        deps: ['REM/recline-extensions/recline-amd', 'backbone', 'underscore', 'bootstrap', 'mustache']
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

    'REM/vendor/chroma.js/chroma.min' : { exports: 'chroma'},
    'REM/vendor/datepicker/1.0.0/js/DateRangesWidget' : { deps: [ 'jquery' ] },
    'REM/vendor/datepicker/1.0.0/js/datepicker' : {
        deps: [ 'REM/vendor/datepicker/1.0.0/js/DateRange', 'REM/vendor/datepicker/1.0.0/js/DateRangesWidget']
    }

}
});
