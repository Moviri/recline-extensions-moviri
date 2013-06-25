require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        "jquery-ui": '../bower_components/jquery-ui/ui/jquery-ui',
        "jquery-ui.draggable":'../bower_components/jquery-ui/ui/jquery.ui.draggable',
        "jquery-ui.mouse":'../bower_components/jquery-ui/ui/jquery.ui.mouse',
        "jquery-ui.widget":'../bower_components/jquery-ui/ui/jquery.ui.widget',
        "jquery-ui.sortable":'../bower_components/jquery-ui/ui/jquery.ui.sortable',
        "jquery-ui.position":'../bower_components/jquery-ui/ui/jquery.ui.position',
        "jquery-ui.custom.slickgrid": 'vendor/jquery-ui-1.8.23.custom.slickgrid',
        bootstrap: 'vendor/bootstrap',
        CodeMirror: '../bower_components/codemirror/lib/codemirror',
        underscore: '../bower_components/underscore-amd/underscore',
        backbone: '../bower_components/backbone-amd/backbone',
        "recline.dataset": 'vendor/recline/recline.dataset.min',
        recline: 'vendor/recline/recline.min',
        "recline-extensions-amd": 'recline-extensions/recline-extensions-amd',

        "slickgrid/slick.core": '../bower_components/slickgrid-moviri/slick.core',
        "slickgrid/slick.grid": '../bower_components/slickgrid-moviri/slick.grid',

        "slickgrid/slick.editors": '../bower_components/slickgrid-moviri/slick.editors',
        "slickgrid/slick.formatters": '../bower_components/slickgrid-moviri/slick.formatters',
        "slickgrid/slick.cellrangeselector": '../bower_components/slickgrid-moviri/slick.cellrangeselector',
        "slickgrid/slick.cellselectionmodel": '../bower_components/slickgrid-moviri/slick.cellselectionmodel',
        "slickgrid/slick.rowselectionmodel": '../bower_components/slickgrid-moviri/slick.rowselectionmodel',
        "slickgrid/plugins/slick.rowselectionmodel": '../bower_components/slickgrid-moviri/plugins/slick.rowselectionmodel',

        "jquery.event.drag-2.2": 'vendor/jquery.event.drag-2.2',
        "jquery-migrate-1.2.1": 'vendor/jquery-migrate-1.2.1.min' //needed for compatibility of slickgrid moviri and jquery 1.9
    },
    shim: {
        bootstrap: {
            deps: [
                'jquery'
            ],
            exports: 'jquery'
        }
    }
});

require(['app', 'jquery', 'bootstrap' ], function (app, $) {
    'use strict';
    // use app here
});
