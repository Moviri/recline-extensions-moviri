require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        bootstrap: 'vendor/bootstrap',
        CodeMirror: '../bower_components/CodeMirror/lib/codemirror'
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
