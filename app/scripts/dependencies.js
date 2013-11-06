function relativizeDependencies(path) {
    var pathsShim = {
        paths: {
            'bootstrap' : path +  'vendor/bootstrap',
            'recline.dataset': path +  'vendor/recline/recline.dataset',
            'recline' : path +  'vendor/recline/recline.min',
            'recline-extensions-amd': path +  'recline-extensions/recline-extensions-amd',
            'recline-amd': path + 'recline-extensions/recline-amd',

            'recline.model.extensions.all': path +  'recline-extensions/model/model.extensions.all',

            'recline.backend.extensions.csv' : path +  'recline-extensions/backend/backend.extensions.csv',
            'recline.backend.extensions.jsonp' : path +  'recline-extensions/backend/backend.jsonp',
            'recline.backend.extensions.jsonp_memory' : path +  'recline-extensions/backend/backend.jsonp.memorystore',
            'recline.backend.extensions.union' : path + 'recline-extensions/backend/union.backend',

            'recline.model.extensions.filteredmodel': path +  'recline-extensions/model/filteredmodel',
            'recline.model.extensions.virtualmodel': path +  'recline-extensions/model/virtualmodel',
            'recline.model.extensions.joinedmodel': path +  'recline-extensions/model/joinedmodel',
            'recline.model.extensions.unionmodel': path +  'recline-extensions/model/unionmodel',
            'recline.model.extensions.socketmodel': path +  'recline-extensions/model/socket.model',
            'recline.model.extensions.facets': path + 'recline-extensions/model/model.extensions.facets',

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

            'recline.views.extensions.d3bubble': path + 'recline-extensions/views/d3/view.d3.bubble',
            'recline.views.extensions.d3bullet': path + 'recline-extensions/views/d3/view.d3.bullet',
            'recline.views.extensions.d3calendarview': path + 'recline-extensions/views/d3/view.d3.calendarview',
            'recline.views.extensions.d3chord': path + 'recline-extensions/views/d3/view.d3.chord',
            'recline.views.extensions.d3choroplethmap': path + 'recline-extensions/views/d3/view.d3.choroplethmap',
            'recline.views.extensions.d3cloud': path + 'recline-extensions/views/d3/view.d3.cloud',
            'recline.views.extensions.d3cooccurencematrix': path + 'recline-extensions/views/d3/view.d3.co-occurencematrix',
            'recline.views.extensions.d3gravitybubble': path + 'recline-extensions/views/d3/view.d3.gravitybubble',
            'recline.views.extensions.d3sparkline': path + 'recline-extensions/views/d3/view.d3.sparkline',
            'recline.views.extensions.d3table': path + 'recline-extensions/views/d3/view.d3.table',
            'recline.views.extensions.d3treemap': path + 'recline-extensions/views/d3/view.d3.treemap',

            'recline.views.extensions.composedView': path + 'recline-extensions/views/view.composed',
            'recline.views.extensions.googleMaps': path + 'recline-extensions/views/view.GoogleMaps',
            'recline.views.extensions.indicator': path + 'recline-extensions/views/view.indicator',
            'recline.views.extensions.kartograph': path + 'recline-extensions/views/view.kartograph',
            'recline.views.extensions.loader': path +  'recline-extensions/views/view.loader',
            'recline.views.extensions.no_data': path +  'recline-extensions/views/view.no_data',
            'recline.views.extensions.nvd3_graph' : path + 'recline-extensions/views/view.nvd3.graph',
            'recline.views.extensions.rickshaw': path +  'recline-extensions/views/view.rickshaw',
            'recline.views.extensions.saveCsv': path + 'recline-extensions/views/view.save_csv',
            'recline.views.extensions.slickgrid_graph': path +  'recline-extensions/views/view.slickgrid_graph',
            'recline.views.extensions.xcharts' : path + 'recline-extensions/views/view.xcharts',
            'recline.views.extensions.widget_currentfilter' : path + 'recline-extensions/views/widget.currentfilter',
            'recline.views.extensions.widget_datepicker' : path + 'recline-extensions/views/widget.datepicker',
            'recline.views.extensions.widget_facetdashboard' : path + 'recline-extensions/views/widget.facet.dashboard',
            'recline.views.extensions.widget_genericfilter' : path + 'recline-extensions/views/widget.genericfilter',
            'recline.views.extensions.widget_multibutton_dropdown_filter' : path + 'recline-extensions/views/widget.multibutton_dropdown_filter',
            'recline.views.extensions.widget_visualsearch' : path + 'recline-extensions/views/widget.visual.search',

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

            'nvd3' : path +  'recline-extensions/nvd3-extensions/nv.d3.lineDottedChart',

            'DateRangesWidget' : path + 'vendor/datepicker/1.0.0/js/DateRangesWidget',

        },
        shim: {
            'DateRangesWidget' : { deps: [ 'jquery' ] },
            'datepicker' : {
                deps: [ path + 'vendor/datepicker/1.0.0/js/DateRange', path + 'vendor/datepicker/1.0.0/js/DateRangesWidget']
            }
        }
    };

    return pathsShim;
}