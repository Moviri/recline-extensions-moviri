function relativizeDependencies(path) {
    var pathsShim = {
        paths: {
            'jquery-ui': path +  'vendor/jquery-ui/jquery-ui-1.8.23.custom.slickgrid',
            'bootstrap' : path +  'vendor/bootstrap',
            'recline.dataset': path +  'vendor/recline/recline.dataset',
            'recline' : path +  'vendor/recline/recline.min',
            'recline-extensions-amd': path +  'recline-extensions/recline-extensions-amd',
            'recline-amd': path +  'recline-extensions/recline-amd',

            'recline.model.extensions.all': path +  'recline-extensions/model/model.extensions.all',

            'recline.backend.extensions.csv' : path +  'recline-extensions/backend/backend.extensions.csv',
            'recline.backend.extensions.jsonp' : path +  'recline-extensions/backend/backend.jsonp',
            'recline.backend.extensions.union' : path + 'recline-extensions/backend/union.backend',

            'recline.model.extensions.filteredmodel': path +  'recline-extensions/model/filteredmodel',
            'recline.model.extensions.virtualmodel': path +  'recline-extensions/model/virtualmodel',
            'recline.model.extensions.joinedmodel': path +  'recline-extensions/model/joinedmodel',
            'recline.model.extensions.unionmodel': path +  'recline-extensions/model/unionmodel',
            'recline.model.extensions.socketmodel': path +  'recline-extensions/model/socket.model',

            'recline.data.extensions.aggregations' : path +  'recline-extensions/data/data.aggregations',
            'recline.data.extensions.colors' : path +  'recline-extensions/data/data.colors',
            'recline.data.extensions.faceting' : path +  'recline-extensions/data/data.faceting',
            'recline.data.extensions.fieldsutilities' : path +  'recline-extensions/data/data.fieldsutilities',
            'recline.data.extensions.filters' : path +  'recline-extensions/data/data.filters',
            'recline.data.extensions.actions' : path +  'recline-extensions/data/action',
            'recline.data.extensions.shapes' : path +  'recline-extensions/data/data.shapes',
            'recline.data.extensions.statemanagement' : path +  'recline-extensions/data/data.statemanagement',
            'recline.data.extensions.formatters' : path +  'recline-extensions/data/data.formatters',
            'recline.data.extensions.seriesutility' : path +  'recline-extensions/data/data.series.utility',
            'recline.data.extensions.templateshapes' : path +  'recline-extensions/data/template.shapes',

            'recline.views.extensions.no_data': path +  'recline-extensions/views/view.no_data',
            'recline.views.extensions.slickgrid_graph': path +  'recline-extensions/views/view.slickgrid_graph',
            'recline.views.extensions.widget_genericfilter' : path + 'recline-extensions/views/widget.genericfilter',
            'recline.views.extensions.xcharts' : path + 'recline-extensions/views/view.xcharts',
            'recline.views.extensions.widget_datepicker' : path + 'recline-extensions/views/widget.datepicker',
            'recline.views.extensions.nvd3_graph' : path + 'recline-extensions/views/view.nvd3.graph',
            'recline.views.extensions.widget_multibutton_dropdown_filter' : path + 'recline-extensions/views/widget.multibutton_dropdown_filter',
            'recline.views.extensions.loader': path +  'recline-extensions/views/view.loader',
            'recline.views.extensions.indicator': path + 'recline-extensions/views/view.indicator',

            'jquery.event.drag-2.2': path +  'vendor/jquery.event.drag-2.2',
            'jquery-migrate-1.2.1': path +  'vendor/jquery-migrate-1.2.1.min', //needed for compatibility of slickgrid moviri and jquery 1.9

            'bootstrap-multiselect': path +  'vendor/bootstrap-multiselect/bootstrap-multiselect',

            'topojson' : path +  'vendor/topojson/topojson.v0.min',
            'toAscii' : path +  'vendor/toAscii/toAscii',

            'xcharts' : path +  'vendor/xcharts/xcharts',

            'chroma' : path +  'vendor/chroma.js/chroma.min',
            'chosen' : path +  'vendor/chosen/chosen.jquery',
            'jslider' : path +  'vendor/jquery-slider/js/jquery.slider.min',
            'datepicker' : path +  'vendor/datepicker/1.0.0/js/datepicker',
            'markerclusterer' : path +  'vendor/google-maps/markerclusterer',

            'd3v2' : path +  'vendor/d3/v2/d3.v2.custom.min',

            'nvd3' : path +  'vendor/nvd3-extensions/nv.d3.lineDottedChart',

            'DateRangesWidget' : path + 'vendor/datepicker/1.0.0/js/DateRangesWidget',
        },
        shim: {
            'DateRangesWidget' : { deps: [ 'jquery' ] },
            'datepicker' : {
                deps: [ path + 'vendor/datepicker/1.0.0/js/DateRange', path + 'vendor/datepicker/1.0.0/js/DateRangesWidget']
            },

            'recline.views.extensions.widget_genericfilter' : { deps: ['jquery-ui']},
        }
    }

    return pathsShim;
}