define(['jquery', 'recline-extensions-amd'], function ($, recline) {

    recline.View = recline.View || {};

    var my = recline.View;

    my.GoogleMaps = Backbone.View.extend({
        iconaMarkerSimple: 'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|{ICONCOLOR}|14|_|{TEXT}',
        iconaMarker: 'https://chart.googleapis.com/chart?chst=d_simple_text_icon_above&chld={TEXT}|14|{TEXTCOLOR}|{MARKERICON}|{ICONSIZE}|{ICONCOLOR}|404040',
        initialize:function (options) {
            _.bindAll(this, 'render', 'redraw', 'clearAllMarkers', 'getMarkerColor', 'openInfoWindow');
            this.model.bind('query:done', this.redraw);
            this.mapEl = document.getElementById(this.options.el);
            this.render();
            if (options.state.markerIcon == "simple")
                this.iconaMarker = this.iconaMarkerSimple;
            else if (options.state.markerIconLongName)
                this.iconaMarker = options.state.markerIconLongName;
        },
        clearAllMarkers: function() {
            _.each(this.markers, function (marker) {
                marker.setMap(null);
            })
            this.markers = []
        },
        getMarkerColor : function(val, htmlType) {
            var self = this;
            var min, max;
            if (self.options.state.redThreshold.indexOf("min") >= 0 || self.options.state.redThreshold.indexOf("max") >= 0
                || self.options.state.greenThreshold.indexOf("min") >= 0 || self.options.state.greenThreshold.indexOf("max") >= 0)
            {
                var fieldValues = _.map(this.model.getRecords(), function(rec) { return rec.attributes[self.options.state.valueField] })
                min = _.min(fieldValues);
                max = _.max(fieldValues);
            }
            if (val <= eval(self.options.state.redThreshold))
                return (htmlType ? "#FF0000": "red")
            else if (val <= eval(self.options.state.greenThreshold))
                return (htmlType ? "#FFFF00" : "yellow")
            else return (htmlType ? "#00FF00" : "green");
        },
        render:function() {
            var self = this;

            var googleOptions = {};
            if (this.options.state.googleOptions)
                googleOptions = _.extend(googleOptions, this.options.state.googleOptions)
            if (this.options.state.mapCenter)
                googleOptions.center = new google.maps.LatLng(this.options.state.mapCenter[0], this.options.state.mapCenter[1])
            if (this.options.state.mapType)
                googleOptions.mapTypeId = google.maps.MapTypeId[this.options.state.mapType]

            this.map = new google.maps.Map(this.mapEl, googleOptions);
            if (this.options.state.clustererOptions)
                mc = new MarkerClusterer(this.map,[], this.options.state.clustererOptions);
            
            if (this.options.events && this.options.events.mapClick)
                google.maps.event.addListener(this.map, 'click', this.options.events.mapClick);
            
            if (this.options.events && this.options.events.mapDblClick)
                google.maps.event.addListener(this.map, 'dblclick', this.options.events.mapDblClick);

            if (this.options.events && this.options.events.mapRightClick)
                google.maps.event.addListener(this.map, 'rightclick', this.options.events.mapRightClick);
            
            if (this.options.state.infoWindowTemplate)
            {
                this.infowindow = new google.maps.InfoWindow({ content: '' });
                this.infowindow.close();
            }
            this.redraw();
        },

        redraw: function() {
            var self = this;
            
            this.clearAllMarkers();
            if (this.options.state.clustererOptions && mc)
                mc.clearMarkers();
            
            var latField = self.options.state.latField;
            var longField = self.options.state.longField;
            var valueField = self.options.state.valueField;
            var markerIconName = self.options.state.markerIcon;
            
            _.each(this.model.getRecords("unfiltered"), function(rec) {
                var latlng = new google.maps.LatLng(rec.attributes[latField], rec.attributes[longField]);
                var color = self.getMarkerColor(rec.attributes[valueField], true).replace("#","")
                var text = self.iconaMarker.replace("{TEXT}", (self.options.state.showValue ? rec.attributes[valueField].toString() : ""))
                text = text.replace("{ICONCOLOR}", color)
                text = text.replace("{TEXTCOLOR}", color)
                text = text.replace("{MARKERICON}", self.options.state.markerIcon)
                text = text.replace("{ICONSIZE}", self.options.state.markerSize)
                
                var mark = new google.maps.Marker({position:latlng, map:self.map, animation:null, icon:text, value: rec.attributes[valueField], color: self.getMarkerColor(rec.attributes[valueField]), record: rec});
                
                if (self.options.state.infoWindowTemplate)
                    google.maps.event.addListener(mark, 'click', function() {self.openInfoWindow(mark)});

                if (self.options.actions)
                {
                    var markerClickActions = self.getActionsForEvent("selection");
                    var mappings = self.options.state.mapping
                    google.maps.event.addListener(mark, 'click', function() {
                        var rec = this.record
                        markerClickActions.forEach(function (currAction) {
                            currAction.action.doAction([rec], currAction.mapping);
                        });
                    });
                    var markerHoverActions = self.getActionsForEvent("hover");
                    var mappings = self.options.state.mapping
                    google.maps.event.addListener(mark, 'mouseover', function() {
                        var rec = this.record
                        markerHoverActions.forEach(function (currAction) {
                            currAction.action.doAction([rec], currAction.mapping);
                        });
                    });
                }
                if (self.options.events && self.options.events.markerClick)
                    google.maps.event.addListener(mark, 'click', self.options.events.markerClick);
                
                if (self.options.events && self.options.events.markerDblClick)
                    google.maps.event.addListener(mark, 'dblclick', self.options.events.markerDblClick);

                if (self.options.events && self.options.events.markerRightClick)
                    google.maps.event.addListener(mark, 'rightclick', self.options.events.markerRightClick);                

                self.markers.push(mark)
            })
            if (this.options.state.clustererOptions && mc)
            {
                mc.addMarkers(this.markers);
                mc.repaint();   
            }
        },
        getActionsForEvent:function (eventType) {
            var self = this;
            var actions = [];

            _.each(self.options.actions, function (d) {
                if (_.contains(d.event, eventType))
                    actions.push(d);
            });
            return actions;
        },
        openInfoWindow: function(marker) {
            var tmplData = {
                value: marker.value,
                color: marker.color,
            }
            tmplData = _.extend(tmplData, marker.record.attributes);
            var html = Mustache.render(this.options.state.infoWindowTemplate, tmplData);
            this.infowindow.setContent(html);
            this.infowindow.setPosition(marker.position);
            this.infowindow.open(this.map);
        },
        closeInfoWindow : function() {
            this.infowindow.setContent('')
            this.infowindow.close();            
        }
    });
});