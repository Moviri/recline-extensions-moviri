/* global define */
define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'mustache', 'underscore', 'backbone', 'file-saver'], function ($, recline, Mustache, _, Backbone) {

	recline.View = recline.View || {};

	var view = recline.View;

	view.SaveCSV = Backbone.View.extend({
		template:'<a id="{{uid}}" style="text-decoration: none;cursor: pointer;"><i class="icon-download" title="Download as csv file"></i></a>',
		id : 'save',

        events:{
            'click':'saveDataset'
        },

		initialize:function (options) {
		    this.el = $(this.el);
		    _.bindAll(this, 'render', 'updateState', 'saveDataset', 'changeDataset');

			this.model.bind('change', this.render);
			this.model.fields.bind('reset add', this.render);
			this.model.records.bind('reset', this.render);
			this.model.queryState.bind('selection:done', this.render);
			
			this.uid = options.id || ("save_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id

		    this.options = options;		    
		},
		updateState: function(options) {
			this.options.visibleColumns = options.visibleColumns;
		},
		render : function() {
			var out = Mustache.render(this.template, this);
			this.el.html(out);
		},
		saveDataset : function() {
		 	var self = this;
			var res = []; // tmp array in which we store the dataset and then
							// we use it to generate csv

			var formatters = this.options.formatters;

			// parse records of dataset and fill the array
			var header = [];
			_.each(this.options.visibleColumns, function(attribute) {
				if (attribute.indexOf('_sum', attribute.length - '_sum'.length) !== -1) {
					attribute = attribute.substring(0, attribute.length - 4);
				}

				if (self.options.fieldLabels ){
					var tmp = _.find(self.options.fieldLabels, function(x) {
						return x.id == attribute;
					});
					if (tmp) {
						header.push(tmp.label);
					} else {
						header.push(attribute);
					}
				} else {
					header.push(attribute);
				}
			});

			res.push(header);
			_.each(this.model.records.models, function(record) {
				var r = [];
				_.each(self.options.visibleColumns, function(attribute) {
					if (formatters && formatters[attribute]){
						var formatter = formatters[attribute];
						r.push(formatter(record.getFieldValueUnrendered(record.fields.get(attribute)))); 
					} else {
						r.push(record.getFieldValueUnrendered(record.fields.get(attribute))); // str.replace(str.match('<[^>]*>'),'').replace(str.match('</[^>]*>'),'')	
					}
					
				});
				res.push(r);
			});

			// convert to comma separated value
			var str = '';
			var line = '';
			for ( var i = 0; i < res.length; i++) {
				line = '';
				for ( var index in res[i]) {
					var value = res[i][index] + "";
					line += '"' + value.replace(/"/g, '""') + '",';
				}
				line = line.slice(0, -1);
				str += line + '\r\n';
			}
			
			saveAs(new Blob([ str ], { type : "text/plain;charset=" + document.characterSet}), "data.csv"); // use FileSaver.js
			
		},
		changeDataset : function(newModel) {
			if (this.model !== newModel) {
				this.model.unbind('change', this.render);
				this.model.fields.unbind('reset add', this.render);
				this.model.records.unbind('reset', this.render);
				this.model.queryState.unbind('selection:done', this.render);

				this.model = newModel;

				this.model.bind('change', this.render);
				this.model.fields.bind('reset add', this.render);
				this.model.records.bind('reset', this.render);
				this.model.queryState.bind('selection:done', this.render);
			}
		}

	});
	return view.SaveCSV;
});
