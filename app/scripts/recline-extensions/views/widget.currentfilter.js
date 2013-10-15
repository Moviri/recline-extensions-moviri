define(['backbone', 'recline-extensions-amd', 'mustache'], function (Backbone, recline, Mustache,) {

    recline.View = recline.View || {};

    var my = recline.View;

    my.CurrentFilter = Backbone.View.extend({
        template:'\
    	<script> \
    	$(function() { \
    		$(".chzn-select-deselect").chosen({allow_single_deselect:true}); \
    	}); \
    	</script> \
      <div"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}"> \
			<select class="chzn-select-deselect data-control-id" multiple data-placeholder="{{label}}"> \
            {{#values}} \
            <option value="{{dataset_index}}-{{filter_index}}" selected>{{val}}</option> \
            {{/values}} \
          </select> \
        </fieldset> \
      </div>',
        events:{
            'change .chzn-select-deselect':'onFilterValueChanged'
        },

        initialize:function (args) {
            var self = this;
            this.el = $(this.el);
            _.bindAll(this, 'render');

            this._sourceDatasets = args.models;
            this.uid = args.id || Math.floor(Math.random() * 100000);

            _.each(this._sourceDatasets, function (d) {
                d.bind('query:done', self.render);
                d.queryState.bind('selection:done', self.render);
            });

        },

        render:function () {
            var self = this;
            var tmplData = {
                id:self.uid,
                label:"Active filters"
            };

            var values = [];
            _.each(self._sourceDatasets, function (ds, ds_index) {
                _.each(ds.queryState.get('filters'), function (filter, filter_index) {
                    var v = {dataset_index:ds_index, filter_index:filter_index};
                    v["val"] = self.filterDescription[filter.type](filter, ds);

                    values.push(v);

                });
            });
            tmplData["values"] = values;


            var out = Mustache.render(self.template, tmplData);
            this.el.html(out);
        },

        filterDescription:{
            term:function (filter, dataset) {
                return dataset.fields.get(filter.field).attributes.label + ": " + filter.term;
            },
            range:function (filter, dataset) {
                return dataset.fields.get(filter.field).attributes.label + ": " + filter.start + "-" + filter.stop;
            },
            list:function (filter, dataset) {
                var val = dataset.fields.get(filter.field).attributes.label + ": ";
                _.each(filter.list, function (data, index) {
                    if (index > 0)
                        val += ",";

                    val += data;
                });

                return val;
            }
        },

        onFilterValueChanged:function (e) {
            var self=this;

            e.preventDefault();
            var $target = $(e.target).parent();
           var values = $target.find('.data-control-id')[0][0].value.split("-");

            var dataset_index = values[0];
            var filter_index = values[1];

            self._sourceDatasets[dataset_index].queryState.removeFilter(filter_index);


        }


    });
    return my.CurrentFilter;

});
