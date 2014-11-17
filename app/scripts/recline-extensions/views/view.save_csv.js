define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'mustache', 'file-saver'], function ($, recline, Mustache) {

	recline.View = recline.View || {};

	var view = recline.View;

	view.SaveCSV = Backbone.View.extend({
		template:'<a id="{{uid}}" style="text-decoration: none;cursor: pointer;"><i class="icon-download" title="Download as csv file"></i></a>',
		id : 'save',

		initialize:function (options) {
		    this.el = $(this.el);
		    _.bindAll(this, 'render');
		
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
			 var self = this;
			 var saveDataset = function() {
				var res = []; // tmp array in which we store the dataset and then
								// we use it to generate csv

				var records = self.model.records;

				// parse records of dataset and fill the array
				var header = []
				_.each(self.options.visibleColumns,
						function(attribute) {
							if (attribute.indexOf('_sum', attribute.length - '_sum'.length) !== -1) {
								attribute = attribute.substring(0, attribute.length - 4);
							}

							if ( self.options.fieldLabels ){
								var tmp = _.find( self.options.fieldLabels, function(x) {
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
				_.each(records.models, function(record) {
					var r = [];
					_.each(self.options.visibleColumns, function(attribute) {
						r.push(record.getFieldValueUnrendered(record.fields.get(attribute))); // str.replace(str.match('<[^>]*>'),'').replace(str.match('</[^>]*>'),'')
					});
					res.push(r);
				});

				// convert to comma separated value
				var str = '';
				var line = '';
				for ( var i = 0; i < res.length; i++) {
					var line = '';
					for ( var index in res[i]) {
						var value = res[i][index] + "";
						line += '"' + value.replace(/"/g, '""') + '",';
					}
					line = line.slice(0, -1);
					str += line + '\r\n';
				}
				
				saveAs(new Blob([ str ], { type : "text/plain;charset=" + document.characterSet}), "data.csv"); // use FileSaver.js
				
			};
			
			var out = Mustache.render(this.template, self);
			this.el.off('click');
			this.el.click(function (){ return saveDataset() });
			this.el.html(out);
		},

	});
	return view.SaveCSV;
});
