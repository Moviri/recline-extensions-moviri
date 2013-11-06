var conf =  {
    paths: {
    'jquery': '../bower_components/jquery/jquery',
    //'jquery-ui': '../bower_components/jquery-ui-amd/jquery-ui-1.10.0/jqueryui/',

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
    'nv.tooltips': '../bower_components/nvd3-gianlucaguarini/src/tooltip'
},
shim: {
    'jquery' : { exports: 'jQuery' },
    'jslider' : { deps: ['jquery-ui/widget']},
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
    'xcharts' : { deps: ['mustache', 'd3v2'] },

    'd3': { exports: 'd3' },
    'd3v2': { exports: 'd3' },
    'topojson': { exports: 'topojson' },
    'chosen' : { exports: 'Chosen' },
    'rickshaw' : { exports: 'Rickshaw'},
    'd3cloud' : { deps: ['d3v2']},
    'jquery.event.drag-2.2' : { deps: [ 'jquery' ] },
    'jquery-migrate-1.2.1' : { deps: [ 'jquery' ] },
    'jquery-ui' : { deps: [ 'jquery' ] },
    'slickgrid/slick.editors':  { deps: [ 'jquery' ] },
    'slickgrid/slick.formatters':  { deps: [ 'jquery' ] },
    'slickgrid/slick.rowselectionmodel' : { deps: [ 'jquery' ] },
    'slickgrid/slick.cellrangeselector' : { deps: [ 'jquery' ] },
    'slickgrid/slick.cellselectionmodel' : { deps: [ 'jquery' ] },

    'slickgrid/slick.core' : { deps: [ 'recline-extensions-amd', 'jquery.event.drag-2.2', 'jquery-ui/sortable'] },
    'slickgrid/slick.grid' : { deps: [ 'recline-extensions-amd', 'jquery.event.drag-2.2', 'jquery-ui/sortable'] },
    //'jquery-ui-sortable': { deps: ['jquery-ui-mouse']},
    'recline.model.extensions.virtualmodel' : {
        deps: [ 'crossfilter', 'recline.data.extensions.aggregations' ]
    },
    'recline.model.extensions.filteredmodel' : {
        deps: [ 'recline.model.extensions.facets', 'recline.data.extensions.filters', 'recline.data.extensions.faceting' ]
    },

    'nvd3partial' : { deps: [ 'recline-extensions-amd', 'd3v2' ] , exports: 'nv'},
    'nvd3' : { deps: [ 'nvd3partial', 'd3v2' ] , exports: 'nv'},

    'nv.tooltips' : { deps: ['nvd3'] },
    'chroma' : { exports: 'chroma'},
}};
var reclineVendorPath = "";
var metaObjs = document.getElementsByName("reclineVendorPath");
if (metaObjs.length && metaObjs.length == 1 && metaObjs[0].content)
    reclineVendorPath = metaObjs[0].content;

var newConf = relativizeDependencies(reclineVendorPath);

function mergeLevel(old, new_) {
    var merged = new_;
    for (var key in old) {
        if (typeof merged[key] === "undefined") {
            merged[key] = old[key];
        }
    }
    return merged;
}
var mergedConf = {
    paths: mergeLevel(conf.paths, newConf.paths),
    shim: mergeLevel(conf.shim, newConf.shim)
}
console.log(mergedConf);
require.config(mergedConf);
