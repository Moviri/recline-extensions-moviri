/*jshint multistr:true */
this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function ($, my) {

    my.GenericFilter = Backbone.View.extend({
        className:'recline-filter-editor well',
        template:'<div class="filters" {{#backgroundColor}}style="background-color:{{backgroundColor}}"{{/backgroundColor}}> \
      <div class="form-stacked js-edit"> \
	  	<div class="label label-info" style="display:{{titlePresent}}" > \
		  	<h4>{{{filterDialogTitle}}}</h4> \
		  	{{{filterDialogDescription}}} \
	  	</div> \
        {{#filters}} \
          {{{filterRender}}} \
		  <hr style="display:{{hrVisible}}"> \
        {{/filters}} \
      </div> \
    </div>',
        templateHoriz:'<style> .separated-item { padding-left:20px;padding-right:20px; } </style> <div class="filters" style="background-color:{{backgroundColor}}"> \
      <table > \
	  	<tbody> \
	  		<tr>\
	  			<td class="separated-item" style="display:{{titlePresent}}">\
				  	<div class="label label-info"> \
					  	<h4>{{{filterDialogTitle}}}</h4> \
					  	{{{filterDialogDescription}}} \
				  	</div> \
				</td>\
			  	{{#filters}} \
			  	<td class="separated-item">\
          			{{{filterRender}}} \
          		</td>\
  				{{/filters}} \
        	</tr>\
  		</tbody>\
  	   </table> \
    </div> ',
        filterTemplates:{
            term:' \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
    		<div style="float:left;padding-right:10px;padding-top:2px;display:{{useLeftLabel}}">{{label}}</div> \
          <input type="text" value="{{term}}" name="term" class="data-control-id" /> \
          <input type="button" class="btn" id="setFilterValueButton" value="Set"></input> \
        </fieldset> \
      </div> \
    ',
            slider:' \
	<script> \
		$(document).ready(function(){ \
			$( "#slider{{ctrlId}}" ).slider({ \
				min: {{min}}, \
				max: {{max}}, \
            	{{#step}}step: {{step}}{{/step}}, \
				value: {{term}}, \
				slide: function( event, ui ) { \
					$( "#amount{{ctrlId}}" ).html( "{{label}}: "+ ui.value ); \
				} \
			}); \
			$( "#amount{{ctrlId}}" ).html( "{{label}}: "+ $( "#slider{{ctrlId}}" ).slider( "value" ) ); \
		}); \
	</script> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}" style="min-width:100px"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}} \
			<a class="js-remove-filter" href="#" title="Remove this filter">&times;</a> \
		</legend>  \
		  <label id="amount{{ctrlId}}">{{label}}: </label> \
		  <div id="slider{{ctrlId}}" class="data-control-id"></div> \
		  <br> \
          <input type="button" class="btn" id="setFilterValueButton" value="Set"></input> \
        </fieldset> \
      </div> \
    ',
            slider_styled:' \
	<style> \
		 .layout-slider { padding-bottom:15px;width:150px } \
	</style> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}} \
			<a class="js-remove-filter" href="#" title="Remove this filter">&times;</a> \
		</legend>  \
		<div style="float:left;padding-right:15px;display:{{useLeftLabel}}">{{label}} \
			<a class="js-remove-filter" href="#" title="Remove this filter">&times;</a> \
		</div> \
	    <div style="float:left" class="layout-slider" > \
	    	<input type="slider" id="slider{{ctrlId}}" value="{{term}}" class="slider-styled data-control-id" /> \
	    </div> \
        </fieldset> \
      </div> \
    ',
            range:' \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
          <label class="control-label" for="">From</label> \
          <input type="text" value="{{start}}" name="start"  class="data-control-id-from" style="width:auto"/> \
          <label class="control-label" for="">To</label> \
          <input type="text" value="{{stop}}" name="stop" class="data-control-id-to"  style="width:auto"/> \
		  <br> \
          <input type="button" class="btn" id="setFilterValueButton" value="Set"></input> \
        </fieldset> \
      </div> \
    ',
            range_slider:' \
	<script> \
		$(document).ready(function(){ \
			$( "#slider-range{{ctrlId}}" ).slider({ \
				range: true, \
				min: {{min}}, \
				max: {{max}}, \
				values: [ {{from}}, {{to}} ], \
				slide: function( event, ui ) { \
					$( "#amount{{ctrlId}}" ).html(  "{{label}}: " + ui.values[ 0 ] + " - " + ui.values[ 1 ] ); \
				} \
			}); \
			$( "#amount{{ctrlId}}" ).html(  "{{label}}: " + $( "#slider-range{{ctrlId}}" ).slider( "values", 0 ) + " - " + $( "#slider-range{{ctrlId}}" ).slider( "values", 1 ) ); \
		}); \
	</script> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}" style="min-width:100px"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
		  <label id="amount{{ctrlId}}">{{label}} range: </label> \
		  <div id="slider-range{{ctrlId}}" class="data-control-id" ></div> \
		  <br> \
          <input type="button" class="btn" id="setFilterValueButton" value="Set"></input> \
        </fieldset> \
      </div> \
    ',
            range_slider_styled:' \
	<style> \
	 .layout-slider { padding-bottom:15px;width:150px } \
	</style> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}} \
		</legend>  \
		<div style="float:left;padding-right:15px;display:{{useLeftLabel}}">{{label}}</div> \
	    <div style="float:left" class="layout-slider" > \
	    	<input type="slider" id="slider{{ctrlId}}" value="{{from}};{{to}}" class="slider-styled data-control-id" /> \
	    </div> \
        </fieldset> \
      </div> \
    ',
            month_week_calendar:' \
	  <style> \
		.list-filter-item { cursor:pointer; } \
		.list-filter-item:hover { background: lightblue;cursor:pointer; } \
	  </style> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}  \
            <a class="js-remove-filter" href="#" title="Remove this filter">&times;</a> \
			</legend> \
			Year<br> \
			<select class="drop-down2 fields data-control-id" > \
            {{#yearValues}} \
            <option value="{{val}}" {{selected}}>{{val}}</option> \
            {{/yearValues}} \
          </select> \
			<br> \
			Type<br> \
			<select class="drop-down3 fields" > \
				{{#periodValues}} \
				<option value="{{val}}" {{selected}}>{{val}}</option> \
				{{/periodValues}} \
			</select> \
			<br> \
			<div class="month_week_scroller" style="max-height:500px;width:100%;border:1px solid grey;overflow:auto;"> \
				<table class="table table-striped table-hover table-condensed" style="width:100%" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
				<tbody>\
				{{#values}} \
				<tr class="{{selected}}"><td class="list-filter-item " myValue="{{val}}" startDate="{{startDate}}" stopDate="{{stopDate}}">{{label}}</td></tr> \
				{{/values}} \
				</tbody> \
			  </table> \
		  </div> \
	    </fieldset> \
      </div> \
	',
            range_calendar:' \
	<script> \
	$(function() { \
		$( "#from{{ctrlId}}" ).datepicker({ \
			defaultDate: "{{startDate}}", \
			changeMonth: true, \
			numberOfMonths: 1, \
			dateFormat: "D M dd yy", \
			onSelect: function( selectedDate ) { \
				$( "#to{{ctrlId}}" ).datepicker( "option", "minDate", selectedDate ); \
			} \
		}); \
		$( "#to{{ctrlId}}" ).datepicker({ \
			defaultDate: "{{endDate}}", \
			changeMonth: true, \
			numberOfMonths: 1, \
			dateFormat: "D M dd yy", \
			onSelect: function( selectedDate ) { \
				$( "#from{{ctrlId}}" ).datepicker( "option", "maxDate", selectedDate ); \
			} \
		}); \
	}); \
	</script> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
			<label for="from{{ctrlId}}">From</label> \
			<input type="text" id="from{{ctrlId}}" name="from{{ctrlId}}" class="data-control-id-from" value="{{startDate}}" style="width:auto"/> \
			<br> \
			<label for="to{{ctrlId}}">to</label> \
			<input type="text" id="to{{ctrlId}}" name="to{{ctrlId}}" class="data-control-id-to" value="{{endDate}}" style="width:auto"/> \
 		  <br> \
          <input type="button" class="btn" id="setFilterValueButton" value="Set"></input> \
       </fieldset> \
      </div> \
	',
            dropdown:' \
      <script>  \
    	function updateColor(elem) { \
    		if (elem.prop("selectedIndex") == 0) elem.addClass("dimmed"); else elem.removeClass("dimmed"); \
  		} \
      </script> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}} \
    		</legend>  \
    		<div style="float:left;padding-right:10px;padding-top:2px;display:{{useLeftLabel}}">{{label}}</div> \
    		<select class="drop-down fields data-control-id dimmed" onchange="updateColor($(this))"> \
			<option class="dimmedDropDownText">{{innerLabel}}</option> \
            {{#values}} \
            <option class="normalDropDownText" value="{{val}}" {{selected}}>{{valCount}}</option> \
            {{/values}} \
          </select> \
        </fieldset> \
      </div> \
    ',
            dropdown_styled:' \
    	<script> \
    	$(function() { \
    		$(".chzn-select-deselect").chosen({allow_single_deselect:true}); \
    	}); \
    	</script> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
			<div style="float:left;padding-right:10px;padding-top:3px;display:{{useLeftLabel}}">{{label}}</div> \
    		<select class="chzn-select-deselect data-control-id" data-placeholder="{{innerLabel}}"> \
    		<option></option> \
            {{#values}} \
            <option value="{{val}}" {{selected}}>{{valCount}}</option> \
            {{/values}} \
          </select> \
        </fieldset> \
      </div> \
    ',
            dropdown_date_range:' \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}} \
    		</legend>  \
    		<div style="float:left;padding-right:10px;padding-top:3px;display:{{useLeftLabel}}">{{label}}</div> \
			<select class="drop-down fields data-control-id" > \
			<option></option> \
            {{#date_values}} \
            <option startDate="{{startDate}}" stopDate="{{stopDate}}" {{selected}}>{{val}}</option> \
            {{/date_values}} \
          </select> \
        </fieldset> \
      </div> \
    ',
            list:' \
	  <style> \
		.list-filter-item { cursor:pointer; } \
		.list-filter-item:hover { background: lightblue;cursor:pointer; } \
	  </style> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}  \
            <a class="js-remove-filter" href="#" title="Remove this filter">&times;</a> \
			</legend> \
    		<div style="float:left;padding-right:10px;display:{{useLeftLabel}}">{{label}} \
    			<a class="js-remove-filter" href="#" title="Remove this filter">&times;</a> \
    		</div> \
			<div style="max-height:500px;width:100%;border:1px solid grey;overflow:auto;"> \
				<table class="table table-striped table-hover table-condensed" style="width:100%" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" > \
				<tbody>\
				{{#values}} \
				<tr class="{{selected}}"><td class="list-filter-item" >{{val}}</td><td style="text-align:right">{{count}}</td></tr> \
				{{/values}} \
				</tbody>\
			  </table> \
		  </div> \
	    </fieldset> \
      </div> \
	',
            listbox:' \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
    		<div style="float:left;padding-right:10px;display:{{useLeftLabel}}">{{label}}</div> \
			<select class="fields data-control-id"  multiple SIZE=10> \
            {{#values}} \
            <option value="{{val}}" {{selected}}>{{valCount}}</option> \
            {{/values}} \
          </select> \
		  <br> \
          <input type="button" class="btn" id="setFilterValueButton" value="Set"></input> \
        </fieldset> \
      </div> \
    ',
            listbox_styled:' \
    	<script> \
    	$(function() { \
    		$(".chzn-select-deselect").chosen({allow_single_deselect:true}); \
    	}); \
    	</script> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}} \
    		</legend>  \
    		<div style="float:left;padding-right:10px;padding-top:4px;display:{{useLeftLabel}}">{{label}}</div> \
			<select class="chzn-select-deselect data-control-id" multiple data-placeholder="{{innerLabel}}"> \
            {{#values}} \
            <option value="{{val}}" {{selected}}>{{valCount}}</option> \
            {{/values}} \
          </select> \
        </fieldset> \
      </div> \
    ',
            radiobuttons:' \
        <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
            <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
                <legend style="display:{{useLegend}}">{{label}}</legend>  \
    			<div style="float:left;padding-right:10px;padding-top:4px;display:{{useLeftLabel}}">{{label}}</div> \
    			<div class="btn-group data-control-id" > \
            		{{^noAllButton}} \
            		<button class="btn btn-mini grouped-button btn-primary">All</button> \
            		{{/noAllButton}} \
    	            {{#values}} \
    	    		<button class="btn btn-mini grouped-button {{selected}}" val="{{value}}" {{tooltip}}>{{{val}}}</button> \
    	            {{/values}} \
              	</div> \
            </div> \
        </div> \
        ',
         hierarchic_radiobuttons:' \
        <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
            <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
                <legend style="display:{{useLegend}}">{{label}}</legend>  \
    			<div style="float:left;padding-right:10px;padding-top:4px;display:{{useLeftLabel}}">{{label}}</div> \
    			<div class="btn-group data-control-id" level="1" style="float:left"> \
            		{{#useAllButton}} \
            		<button class="btn btn-mini grouped-button {{all1Selected}}" val="All">All</button> \
            		{{/useAllButton}} \
    	            {{#values}} \
    	    		<button class="btn btn-mini grouped-button {{selected}}" val="{{value}}" {{tooltip}}>{{{val}}}</button> \
    	            {{/values}} \
              	</div> \
        		{{#useLevel2}} \
	    			<div class="btn-group level2" level="2" style="float:left;display:{{showLevel2}}"> \
     		{{#useAllButton}} \
        	 			<button class="btn btn-mini grouped-button {{all2Selected}}" val="">All</button> \
     		{{/useAllButton}} \
			            {{#valuesLev2}} \
	            			<button class="btn btn-mini grouped-button {{selected}}" val="{{value}}" {{tooltip}}>{{{val}}}</button> \
			            {{/valuesLev2}} \
	            	</div> \
            		{{#useLevel3}} \
		    			<div class="btn-group level3" level="3" style="float:left;display:{{showLevel3}}"> \
      		{{#useAllButton}} \
	            			<button class="btn btn-mini grouped-button {{all3Selected}}" val="">All</button> \
     		{{/useAllButton}} \
				            {{#valuesLev3}} \
			        			<button class="btn btn-mini grouped-button {{selected}}" val="{{value}}" {{tooltip}}>{{{val}}}</button> \
				            {{/valuesLev3}} \
			        	</div> \
            		{{/useLevel3}} \
        		{{/useLevel2}} \
            </div> \
        </div> \
        ',
        multibutton:' \
    <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
    		<legend style="display:{{useLegend}}">{{label}} \
    		</legend>  \
    		<div style="float:left;padding-right:10px;padding-top:4px;display:{{useLeftLabel}}">{{label}}</div> \
    		<div class="btn-group data-control-id" > \
	            {{#values}} \
	    		<button class="btn btn-mini grouped-button {{selected}}" val="{{value}}" {{tooltip}}>{{{val}}}</button> \
	            {{/values}} \
          </div> \
        </fieldset> \
    </div> \
    ',
            legend:' \
	  <style> \
      .legend-item { \
					border-top:2px solid black;border-left:2px solid black; \
					border-bottom:2px solid darkgrey;border-right:2px solid darkgrey; \
					width:16px;height:16px;padding:1px;margin:5px; \
					opacity: 0.85; \
            		cursor: pointer; \
					}  \
	 .legend-item.not-selected { background-color:transparent !important; } /* the idea is that the color "not-selected" overrides the original color (this way we may use a global style) */ \
	  </style> \
      <div class="filter-{{type}} filter" id="{{ctrlId}}"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
			<div style="float:left;padding-right:10px;display:{{useLeftLabel}}">{{label}}</div> \
			<table style="width:100%;background-color:transparent">\
			{{#values}} \
				<tr> \
				<td style="width:25px"><div class="legend-item {{notSelected}}" myValue="{{val}}" style="background-color:{{color}}"></td> \
				<td style="vertical-align:middle"><label class="legend-label" style="color:{{color}};text-shadow: black 1px 1px, black -1px -1px, black -1px 1px, black 1px -1px, black 0px 1px, black 0px -1px, black 1px 0px, black -1px 0px">{{val}}</label></td>\
				<td><label style="text-align:right">[{{count}}]</label></td>\
				</tr>\
			{{/values}}\
			</table> \
	    </fieldset> \
      </div> \
	',
            color_legend:' \
	<div class="filter-{{type}} filter" id="{{ctrlId}}" style="width:{{totWidth2}}px;max-height:{{totHeight2}}px"> \
        <fieldset data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" data-control-type="{{controlType}}"> \
            <legend style="display:{{useLegend}}">{{label}}</legend>  \
				<div style="float:left;padding-right:10px;height:{{lineHeight}}px;display:{{useLeftLabel}}"> \
					<label style="line-height:{{lineHeight}}px">{{label}}</label> \
				</div> \
            	<div class="data-control-id" style="width:{{totWidth}}px;height:{{totHeight}}px;display:inline" > \
					<svg height="{{totHeight}}" xmlns="http://www.w3.org/2000/svg"> \
            		<g> \
					{{#colorValues}} \
				    	<rect width="{{width}}" height={{lineHeight}} fill="{{color}}" x="{{x}}" y={{y}}/> \
            			{{#showValueLabels}} \
            			<text width="{{width}}" fill="{{textColor}}" x="{{x}}" y="{{yplus30}}">{{val}}</text> \
            			{{/showValueLabels}} \
            		{{/colorValues}}\
            		</g> \
            		<g> \
            			{{^showValueLabels}} \
            			{{#totWidth}} \
            			<path d="M0,0 L{{totWidth}},0 L{{totWidth}},{{totHeight}} L0,{{totHeight}} L0,0" style="fill:none;"/> \
            			{{/totWidth}} \
            			{{#colorValues2}} \
            			<text width="{{width}}" fill="{{textColor}}" x="{{x}}" y="{{yplus30}}">{{val}}</text> \
            			{{/colorValues2}} \
            			{{/showValueLabels}} \
            		</g> \
					</svg>		\
				</div> \
	    </fieldset> \
	</div> \
	'
        },

        FiltersTemplate:{
            "range_calendar":{ needFacetedField:false},
            "month_week_calendar":{ needFacetedField:true},
            "list":{ needFacetedField:true},
            "legend":{ needFacetedField:true},
            "dropdown":{ needFacetedField:true},
            "dropdown_styled":{ needFacetedField:true},
            "dropdown_date_range":{ needFacetedField:false},
            "listbox":{ needFacetedField:true},
            "listbox_styled":{ needFacetedField:true},
            "term":{ needFacetedField:false},
            "range":{ needFacetedField:true},
            "slider":{ needFacetedField:true},
            "slider_styled":{ needFacetedField:true},
            "range_slider":{ needFacetedField:true},
            "range_slider_styled":{ needFacetedField:true},
            "color_legend":{ needFacetedField:true},
            "multibutton":{ needFacetedField:true},
            "radiobuttons":{ needFacetedField:true},
            "hierarchic_radiobuttons":{ needFacetedField:false}
        },

        events:{
            'click .js-remove-filter':'onRemoveFilter',
            'click .js-add-filter':'onAddFilterShow',
            'click #addFilterButton':'onAddFilter',
            'click .list-filter-item':'onListItemClicked',
            'click .legend-item':'onLegendItemClicked',
            'click .legend-label':'onLegendItemClicked',
            'click #setFilterValueButton':'onFilterValueChanged',
            'change .drop-down':'onFilterValueChanged',
            'change .chzn-select-deselect':'onFilterValueChanged',
            'change .drop-down2':'onListItemClicked',
            'change .drop-down3':'onPeriodChanged',
            'click .grouped-button':'onButtonsetClicked',
        },

        activeFilters:new Array(),
        _sourceDataset:null,
        _selectedClassName:"info", // use bootstrap ready-for-use classes to highlight list item selection (avail classes are success, warning, info & error)

        initialize:function (args) {
            this.el = $(this.el);
            _.bindAll(this, 'render');
            _.bindAll(this, 'update');
            _.bindAll(this, 'getFieldType');
            _.bindAll(this, 'onRemoveFilter');
            _.bindAll(this, 'onPeriodChanged');
            _.bindAll(this, 'findActiveFilterByField');
            _.bindAll(this, 'updateDropdown');
            _.bindAll(this, 'updateDropdownStyled');
            _.bindAll(this, 'updateSlider');
            _.bindAll(this, 'updateSliderStyled');
            _.bindAll(this, 'updateRadiobuttons');
            _.bindAll(this, 'updateRangeSlider');
            _.bindAll(this, 'updateRangeSliderStyled');
            _.bindAll(this, 'updateRangeCalendar');
            _.bindAll(this, 'updateMonthWeekCalendar');
            _.bindAll(this, 'updateDropdownDateRange');
            _.bindAll(this, 'updateList');
            _.bindAll(this, 'updateListbox');
            _.bindAll(this, 'updateListboxStyled');
            _.bindAll(this, 'updateLegend');
            _.bindAll(this, 'updateColorLegend');
            _.bindAll(this, 'updateMultibutton');
            _.bindAll(this, 'redrawGenericControl');
            _.bindAll(this, 'fixHierarchicRadiobuttonsSelections');
            _.bindAll(this, 'changeFilterField');

            this._sourceDataset = args.sourceDataset;
            this.uid = args.id || Math.floor(Math.random() * 100000); // unique id of the view containing all filters
            this.numId = 0; // auto-increasing id used for a single filter

            this.sourceFields = args.sourceFields;
            if (args.state) {
                this.filterDialogTitle = args.state.title;
                this.filterDialogDescription = args.state.description;
                this.useHorizontalLayout = args.state.useHorizontalLayout;
                this.showBackground = args.state.showBackground;
                if (this.showBackground == false) {
                    $(this).removeClass("well");
                    $(this.el).removeClass("well");
                }

                this.backgroundColor = args.state.backgroundColor;
            }
            this.activeFilters = new Array();

            this._actions = args.actions;

            if (this.sourceFields && this.sourceFields.length)
                for (var k in this.sourceFields)
                    this.addNewFilterControl(this.sourceFields[k]);

            // not all filters required a source of data
            if (this._sourceDataset) {
                //this._sourceDataset.facets.bind('reset', this.render);
                this._sourceDataset.bind('query:done', this.render);
                this._sourceDataset.queryState.bind('selection:done', this.update);
            }
        },

        areValuesEqual:function (a, b) {
            // this also handles date equalities.
            // For instance comparing a Date obj with its corresponding timer value now returns true
            if (typeof a == "undefined" || typeof b == "undefined")
                return false;

            if (a == b)
                return true;
            if (a && a.valueOf() == b)
                return true;
            if (b && a == b.valueOf())
                return true;
            if (a && b && a.valueOf() == b.valueOf())
                return true;

            return false;
        },

        update:function () {
            var self = this;
            // retrieve filter values (start/from/term/...)
            _.each(this._sourceDataset.queryState.get('selections'), function (filter) {
                for (var j in self.activeFilters) {
                    if (self.activeFilters[j].field == filter.field) {
                        self.activeFilters[j].list = filter.list
                        self.activeFilters[j].term = filter.term
                        self.activeFilters[j].start = filter.start
                        self.activeFilters[j].stop = filter.stop
                        self.fixHierarchicRadiobuttonsSelections(self.activeFilters[j])
                    }
                }
            });

            var currFilters = this.el.find("div.filter");
            _.each(currFilters, function (flt) {
                var currFilterCtrl = $(flt).find(".data-control-id");
                if (typeof currFilterCtrl != "undefined" && currFilterCtrl != null) {
                    //console.log($(currFilterCtrl));
                }
                else {
                    var currFilterCtrlFrom = $(flt).find(".data-control-id-from");
                    var currFilterCtrlTo = $(flt).find(".data-control-id-to");
                }
                var currActiveFilter = null;
                for (var j in self.activeFilters) {
                    if (self.activeFilters[j].ctrlId == flt.id) {
                        currActiveFilter = self.activeFilters[j]
                        break;
                    }
                }
                if (currActiveFilter != null) {
                    if (currActiveFilter.userChanged) {
                        // skip the filter that triggered the change
                        currActiveFilter.userChanged = undefined;
                        return;
                    }
                    switch (currActiveFilter.controlType) {
                        // term
                        case "dropdown" :
                            return self.updateDropdown($(flt), currActiveFilter, $(currFilterCtrl));
                        case "dropdown_styled" :
                            return self.updateDropdownStyled($(flt), currActiveFilter, $(currFilterCtrl));
                        case "slider" :
                            return self.updateSlider($(flt), currActiveFilter, $(currFilterCtrl));
                        case "slider_styled" :
                            return self.updateSliderStyled($(flt), currActiveFilter, $(currFilterCtrl));
                        case "radiobuttons" :
                            return self.updateRadiobuttons($(flt), currActiveFilter, $(currFilterCtrl));
                        case "hierarchic_radiobuttons" :
                            return self.updateHierarchicRadiobuttons($(flt), currActiveFilter, $(currFilterCtrl));
                        // range
                        case "range_slider" :
                            return self.updateRangeSlider($(flt), currActiveFilter, $(currFilterCtrl));
                        case "range_slider_styled" :
                            return self.updateRangeSliderStyled($(flt), currActiveFilter, $(currFilterCtrl));
                        case "range_calendar" :
                            return self.updateRangeCalendar($(flt), currActiveFilter, $(currFilterCtrlFrom), $(currFilterCtrlTo));
                        case "month_week_calendar" :
                            return self.updateMonthWeekCalendar($(flt), currActiveFilter, $(currFilterCtrl));
                        case "dropdown_date_range" :
                            return self.updateDropdownDateRange($(flt), currActiveFilter, $(currFilterCtrl));
                        // list
                        case "list" :
                            return self.updateList($(flt), currActiveFilter, $(currFilterCtrl));
                        case "listbox":
                            return self.updateListbox($(flt), currActiveFilter, $(currFilterCtrl));
                        case "listbox_styled":
                            return self.updateListboxStyled($(flt), currActiveFilter, $(currFilterCtrl));
                        case "legend" :
                            return self.updateLegend($(flt), currActiveFilter, $(currFilterCtrl));
                        case "color_legend" :
                            return self.updateColorLegend($(flt), currActiveFilter, $(currFilterCtrl));
                        case "multibutton" :
                            return self.updateMultibutton($(flt), currActiveFilter, $(currFilterCtrl));
                    }
                }
            });
        },

        computeUserChoices:function (currActiveFilter) {
            var valueList = currActiveFilter.list;
            if ((typeof valueList == "undefined" || valueList == null) && currActiveFilter.term)
                valueList = [currActiveFilter.term];

            return valueList;
        },

        redrawGenericControl:function (filterContainer, currActiveFilter) {
            var out = this.createSingleFilter(currActiveFilter);
            filterContainer.parent().html(out);
            if (currActiveFilter.controlType == "month_week_calendar" && currActiveFilter.period == "Weeks")
        	{
            	var $scroller = $("#"+currActiveFilter.ctrlId).find(".month_week_scroller")
            	var $tableRow = $scroller.first("table tr")
            	$scroller.scrollTop((currActiveFilter.term -1) * parseInt($tableRow.css("line-height")))
        	}
        },

        updateDropdown:function (filterContainer, currActiveFilter, filterCtrl) {
            var valueList = this.computeUserChoices(currActiveFilter);

            if (valueList != null && valueList.length == 1) {
                filterCtrl[0].style.color = "";
                filterCtrl.val(valueList[0]);
            }
            else
                filterCtrl.find("option:first").prop("selected", "selected");

            if (filterCtrl.prop("selectedIndex") == 0)
                filterCtrl.addClass("dimmed");
            else filterCtrl.removeClass("dimmed");
        },
        updateDropdownStyled:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateSlider:function (filterContainer, currActiveFilter, filterCtrl) {
            var valueList = this.computeUserChoices(currActiveFilter);
            if (valueList != null && valueList.length == 1) {
                filterCtrl.slider("value", valueList[0]);
                $("#amount" + currActiveFilter.ctrlId).html(currActiveFilter.label + ": " + valueList[0]); // sistema di riserva
                filterCtrl.trigger("slide", filterCtrl); // non pare funzionare
            }
        },
        updateSliderStyled:function (filterContainer, currActiveFilter, filterCtrl) {
            var valueList = this.computeUserChoices(currActiveFilter);
            if (valueList != null && valueList.length == 1)
                filterCtrl.jslider("value", valueList[0]);
        },
        updateHierarchicRadiobuttons:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateRadiobuttons:function (filterContainer, currActiveFilter, filterCtrl) {
            var valueList = this.computeUserChoices(currActiveFilter);

            var buttons = filterCtrl.find("button.grouped-button");
            _.each(buttons, function (btn) {
                $(btn).removeClass("btn-primary")
            });
            if (valueList != null && typeof valuelist != "undefined") {
                if (valueList.length == 1) {
                    // do not use each or other jquery/underscore methods since they don't work well here
                    for (var i = 0; i < buttons.length; i++) {
                        var btn = $(buttons[i]);
                        for (var j = 0; j < valueList.length; j++) {
                            var v = valueList[j];
                            if (this.areValuesEqual(v, btn.html())) {
                                btn.addClass("btn-primary");
                                break;
                            }
                        }
                    }
                }
                else if (valueList.length == 0 && !currActiveFilter.noAllButton)
                    $(buttons[0]).addClass("btn-primary"); // select button "All" if present
            }
            else if (!currActiveFilter.noAllButton)
            	$(buttons[0]).addClass("btn-primary"); // select button "All" if present
        },
        updateRangeSlider:function (filterContainer, currActiveFilter, filterCtrl) {
            var valueList = this.computeUserChoices(currActiveFilter);
            if (valueList && valueList.length == 2) {
                filterCtrl.slider("values", 0, valueList[0]);
                filterCtrl.slider("values", 1, valueList[1]);
                $("#amount" + currActiveFilter.ctrlId).html(currActiveFilter.label + ": " + valueList[0] + " - " + valueList[1]); // sistema di riserva
                filterCtrl.trigger("slide", filterCtrl); // non pare funzionare
            }
        },
        updateRangeSliderStyled:function (filterContainer, currActiveFilter, filterCtrl) {
            var valueList = this.computeUserChoices(currActiveFilter);
            if (valueList && valueList.length == 2)
                filterCtrl.jslider("value", valueList[0], valueList[1]);
        },
        updateRangeCalendar:function (filterContainer, currActiveFilter, filterCtrlFrom, filterCtrlTo) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateMonthWeekCalendar:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateDropdownDateRange:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateList:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateListbox:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateListboxStyled:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateLegend:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateColorLegend:function (filterContainer, currActiveFilter, filterCtrl) {
            this.redrawGenericControl(filterContainer, currActiveFilter);
        },
        updateMultibutton:function (filterContainer, currActiveFilter, filterCtrl) {
            var valueList = this.computeUserChoices(currActiveFilter);
            var classToUse = currActiveFilter.selectedClassName || "btn-info";
            var buttons = filterCtrl.find("button.grouped-button");
            _.each(buttons, function (btn) {
                $(btn).removeClass(classToUse)
            });

            // from now on, do not use each or other jquery/underscore methods since they don't work well here
            if (valueList)
                for (var i = 0; i < buttons.length; i++) {
                    var btn = $(buttons[i]);
                    for (var j = 0; j < valueList.length; j++) {
                        var v = valueList[j];
                        if (this.areValuesEqual(v, btn.html()))
                            btn.addClass(classToUse);
                    }
                }
        },

        filterRender:function () {
            return this.self.createSingleFilter(this); // make sure you pass the current active filter
        },
        createSingleFilter:function (currActiveFilter) {
            var self = currActiveFilter.self;

            //check facet
            var filterTemplate = self.FiltersTemplate[currActiveFilter.controlType];
            var facetTerms;

            if (!filterTemplate)
                throw("GenericFilter: Invalid control type " + currActiveFilter.controlType);

            if (filterTemplate.needFacetedField) {
            	if (!self._sourceDataset.getRecords().length)
            		return
            		
                currActiveFilter.facet = self._sourceDataset.getFacetByFieldId(currActiveFilter.field);

                if (currActiveFilter.facet == null || typeof currActiveFilter.facet == "undefined")
                    throw "GenericFilter: no facet present for field [" + currActiveFilter.field + "]. Define a facet before filter render"
                
                if (currActiveFilter.fieldType == "integer" || currActiveFilter.fieldType == "number") // sort if numeric (Chrome issue)
                	currActiveFilter.facet.attributes.terms = _.sortBy(currActiveFilter.facet.attributes.terms, function(currObj) {
                		return currObj.term;
                	});
                    
                facetTerms = currActiveFilter.facet.attributes.terms;
            } else if (self._sourceDataset) {
                // if facet are not defined I use all dataset records


            }
            if (typeof currActiveFilter.label == "undefined" || currActiveFilter.label == null)
                currActiveFilter.label = currActiveFilter.field;

            currActiveFilter.useLegend = "block";
            if (currActiveFilter.labelPosition != 'top')
                currActiveFilter.useLegend = "none";

            currActiveFilter.useLeftLabel = "none";
            if (currActiveFilter.labelPosition == 'left')
                currActiveFilter.useLeftLabel = "block";

            if (currActiveFilter.labelPosition == 'inside')
                currActiveFilter.innerLabel = currActiveFilter.label;

            currActiveFilter.values = new Array();

            // add value list to selected filter or templating of record values will not work
            if (currActiveFilter.controlType.indexOf('calendar') >= 0) {
                if (currActiveFilter.start)
                    currActiveFilter.startDate = self.dateConvert(currActiveFilter.start);

                if (currActiveFilter.stop)
                    currActiveFilter.endDate = self.dateConvert(currActiveFilter.stop);
            }
            if (currActiveFilter.controlType.indexOf('slider') >= 0) {
                if (facetTerms.length > 0 && typeof facetTerms[0].term != "undefined") {
                    currActiveFilter.max = facetTerms[0].term;
                    currActiveFilter.min = facetTerms[0].term;
                }
                else {
                    currActiveFilter.max = 100;
                    currActiveFilter.min = 0;
                }
            }

            if (currActiveFilter.controlType == "month_week_calendar") {
                currActiveFilter.weekValues = [];

                var currYear = currActiveFilter.year;
                var januaryFirst = new Date(currYear, 0, 1);
                var januaryFirst_time = januaryFirst.getTime();
                var weekOffset = januaryFirst.getDay();
                var finished = false;
                for (var w = 0; w <= 53 && !finished; w++) {
                    var weekStartTime = januaryFirst_time + 7 * 86400000 * (w - 1) + (7 - weekOffset) * 86400000;
                    var weekEndTime = weekStartTime + 7 * 86400000;
                    if (w == 0)
                        weekStartTime = januaryFirst_time;

                    if (new Date(weekEndTime).getFullYear() > currYear) {
                        weekEndTime = new Date(currYear + 1, 0, 1).getTime();
                        finished = true;
                    }
                    var currWeekValues = {
                    		val:w + 1,
                            label:"" + (w + 1) + " [" + d3.time.format("%x")(new Date(weekStartTime)) + " -> " + d3.time.format("%x")(new Date(weekEndTime - 1000)) + "]",
                            startDate:new Date(weekStartTime),
                            stopDate:new Date(weekEndTime)
                    }
                    if (currActiveFilter.term == w + 1 || 
                    	(currActiveFilter.start && currActiveFilter.start.getTime() == weekStartTime
                    	&& currActiveFilter.stop && currActiveFilter.stop.getTime() == weekEndTime)) 
                    {
                    	currWeekValues.selected = self._selectedClassName;
                    	currActiveFilter.term = w + 1;
                        if (currActiveFilter.period == "")
                        	currActiveFilter.period = "Weeks";
                    }
                    currActiveFilter.weekValues.push(currWeekValues);
                }

                currActiveFilter.monthValues = [];
                for (m = 1; m <= 12; m++) {
                    var endYear = currYear;
                    var endMonth = m;
                    if (m == 12) {
                        endYear = currYear + 1;
                        endMonth = 0;
                    }
                    var currMonthValues = {
                		val:d3.format("02d")(m),
                        label:d3.time.format("%B")(new Date(m + "/01/2012")) + " " + currYear,
                        startDate:new Date(currYear, m - 1, 1, 0, 0, 0, 0),
                        stopDate:new Date(endYear, endMonth, 1, 0, 0, 0, 0),
                    }
                    if (currActiveFilter.term == m || 
                    	(currActiveFilter.start && currActiveFilter.start.getTime() == currMonthValues.startDate.getTime()
                    	&& currActiveFilter.stop && currActiveFilter.stop.getTime() == currMonthValues.stopDate.getTime())) 
                    {
                    	currMonthValues.selected = self._selectedClassName;
                        if (currActiveFilter.period == "")
                        	currActiveFilter.period = "Months";
                    }
                    currActiveFilter.monthValues.push(currMonthValues);
                }
                currActiveFilter.periodValues = [
                     {val:"Months", selected:(currActiveFilter.period == "Months" ? "selected" : "")},
                     {val:"Weeks", selected:(currActiveFilter.period == "Weeks" ? "selected" : "")}
                ]
                if (currActiveFilter.period == "Months")
                    currActiveFilter.values = currActiveFilter.monthValues;
                else if (currActiveFilter.period == "Weeks")
                    currActiveFilter.values = currActiveFilter.weekValues;

                currActiveFilter.yearValues = [];
                var startYear = 2010;
                var endYear = parseInt(d3.time.format("%Y")(new Date()))
                for (var y = startYear; y <= endYear; y++)
                    currActiveFilter.yearValues.push({val:y, selected:(currActiveFilter.year == y ? "selected" : "")});
            }
            else if (currActiveFilter.controlType == "dropdown_date_range") {
                currActiveFilter.date_values = [];

                var defaultDateFilters = [
                    { label:'This week', start:"sunday", stop:"next sunday"},
                    { label:'This month', start:"1", delta:{months:1}},
                    { label:'This year', start:"january 1", delta:{years:1}},
                    { label:'Past week', stop:"sunday", delta:{days:-7}},
                    { label:'Past month', stop:"1", delta:{months:-1}},
                    { label:'Past 2 months', stop:"1", delta:{months:-2}},
                    { label:'Past 3 months', stop:"1", delta:{months:-3}},
                    { label:'Past 6 months', stop:"1", delta:{months:-6}},
                    { label:'Past year', stop:"january 1", delta:{years:-1}},
                    { label:'Last 7 days', start:"-6", stop:"t +1 d"},
                    { label:'Last 30 days', start:"-29", stop:"t +1 d"},
                    { label:'Last 90 days', start:"-89", stop:"t +1 d"},
                    { label:'Last 365 days', start:"-1 y", stop:"t +1 d"},
                ]
                var fullDateFilters = defaultDateFilters;
                if (currActiveFilter.skipDefaultFilters)
                    fullDateFilters = [];

                if (currActiveFilter.userFilters)
                    fullDateFilters = fullDateFilters.concat(currActiveFilter.userFilters);

                for (var i in fullDateFilters) {
                    var flt = fullDateFilters[i];
                    var startDate = null;
                    var stopDate = null;
                    if (flt.start && flt.stop) {
                        startDate = Date.parse(flt.start);
                        stopDate = Date.parse(flt.stop);
                    }
                    else if (flt.start && flt.delta) {
                        startDate = Date.parse(flt.start);
                        if (startDate) {
                            stopDate = new Date(startDate);
                            stopDate.add(flt.delta);
                        }
                    }
                    else if (flt.stop && flt.delta) {
                        stopDate = Date.parse(flt.stop);
                        if (stopDate) {
                            startDate = new Date(stopDate);
                            startDate.add(flt.delta);
                        }
                    }
                    if (startDate && stopDate && flt.label)
                        currActiveFilter.date_values.push({ val:flt.label,
                            startDate:startDate,
                            stopDate:stopDate
                        });
                }
                for (var j in currActiveFilter.date_values)
                    if (currActiveFilter.date_values[j].val == currActiveFilter.term ||
                    	(currActiveFilter.date_values[j].startDate == currActiveFilter.start && currActiveFilter.date_values[j].stopDate == currActiveFilter.stop)) {
                        currActiveFilter.date_values[j].selected = "selected";
                        break;
                    }
            }
            else if (currActiveFilter.controlType == "legend") {
                // this code somehow works but it's not correct
                currActiveFilter.tmpValues = _.pluck(currActiveFilter.facet.attributes.terms, "term");

                if (typeof currActiveFilter.origLegend == "undefined") {
                    currActiveFilter.origLegend = currActiveFilter.tmpValues;
                    currActiveFilter.legend = currActiveFilter.origLegend;
                }
                currActiveFilter.tmpValues = currActiveFilter.origLegend;
                var legendSelection = currActiveFilter.legend;
                for (var i in currActiveFilter.tmpValues) {
                    var v = currActiveFilter.tmpValues[i];
                    var notSelected = "";
                    if ((currActiveFilter.fieldType != "date" && legendSelection.indexOf(v) < 0)
                        || (currActiveFilter.fieldType == "date" && legendSelection.indexOf(v) < 0 && legendSelection.indexOf(new Date(v).valueOf()) < 0))
                        notSelected = "not-selected";

                    currActiveFilter.values.push({val:v, notSelected:notSelected, color:currActiveFilter.facet.attributes.terms[i].color, count:currActiveFilter.facet.attributes.terms[i].count});
                }
            }
            else if (currActiveFilter.controlType == "color_legend") {
            	if (typeof currActiveFilter.showValueLabels == "undefined")
            		currActiveFilter.showValueLabels = true;
            	
                currActiveFilter.colorValues = [];

                currActiveFilter.tmpValues = _.filter(_.pluck(currActiveFilter.facet.attributes.terms, "term"), function(val){ return typeof val != "undefined" && val != null; });
                var ruler = document.getElementById("my_string_width_calculation_ruler");
                if (typeof ruler == "undefined" || ruler == null) {
                    ruler = document.createElement("span");
                    ruler.setAttribute('id', "my_string_width_calculation_ruler");
                    ruler.style.visibility = "hidden";
                    ruler.style.width = "auto";
                    document.body.appendChild(ruler);
                }
                if (currActiveFilter.showValueLabels)
            	{
                    var maxWidth = self.$el.width() || 250;
                    currActiveFilter.lineHeight = 40;
                    
	                if (currActiveFilter.fieldType == "float" || currActiveFilter.fieldType == "number" || currActiveFilter.fieldType == "integer")
	                    for (var jj in currActiveFilter.tmpValues)
		                	currActiveFilter.tmpValues[jj] = Math.floor(currActiveFilter.tmpValues[jj])
	                	
	                currActiveFilter.tmpValues = _.uniq(currActiveFilter.tmpValues)
	
	                var pixelW = 0;
	                // calculate needed pixel width for every string
	                for (var i in currActiveFilter.tmpValues) {
	                    var v = currActiveFilter.tmpValues[i];
	                    ruler.innerHTML = v;
	                    var w = ruler.offsetWidth
	                    if (w > pixelW)
	                        pixelW = w;
	                }
	                pixelW += 2;
	
	                // calculate needed row number and columns per row
	                var maxColsPerRow = Math.floor(maxWidth / pixelW);
	                var totRighe = Math.ceil(currActiveFilter.tmpValues.length / maxColsPerRow);
	                var colsPerRow = Math.ceil(currActiveFilter.tmpValues.length / totRighe);
	                currActiveFilter.totWidth = colsPerRow * pixelW;
	                currActiveFilter.totWidth2 = currActiveFilter.totWidth + (currActiveFilter.labelPosition == 'left' ? currActiveFilter.label.length * 10 : 10)
	                currActiveFilter.totHeight = totRighe * currActiveFilter.lineHeight;
	                currActiveFilter.totHeight2 = currActiveFilter.totHeight + currActiveFilter.lineHeight;
	
	                var riga = 0;
	                var colonna = 0;
	
	                for (var i in currActiveFilter.tmpValues) {
	                    var v = currActiveFilter.tmpValues[i];
	                    var color = currActiveFilter.facet.attributes.terms[i].color;
	                    if (colonna == colsPerRow) {
	                        riga++;
	                        colonna = 0;
	                    }
	                    currActiveFilter.colorValues.push({width:pixelW, color:color, textColor:self.complementColor(color),
	                        val:v, x:pixelW * colonna, y:riga * currActiveFilter.lineHeight, yplus30:riga * currActiveFilter.lineHeight + 25 });
	
	                    colonna++;
	                }
            	}
                else
            	{
                    currActiveFilter.colorValues2 = [];
                    currActiveFilter.lineHeight = 20;

                	currActiveFilter.minValue = currActiveFilter.tmpValues[0]
                	currActiveFilter.maxValue = currActiveFilter.tmpValues[currActiveFilter.tmpValues.length-1]
                	
                	var maxWidth = self.el.width() || 250
                	var colsPerRow = currActiveFilter.tmpValues.length
                	var pixelW = Math.floor(maxWidth / colsPerRow)
                	
	                currActiveFilter.totWidth = colsPerRow * pixelW;
	                currActiveFilter.totWidth2 = currActiveFilter.totWidth + (currActiveFilter.labelPosition == 'left' ? currActiveFilter.label.length * 10 : 10)
	                currActiveFilter.totHeight = currActiveFilter.lineHeight;
	                currActiveFilter.totHeight2 = currActiveFilter.totHeight + currActiveFilter.lineHeight;
	                for (var i in currActiveFilter.tmpValues) {
	                    var v = currActiveFilter.tmpValues[i];
	                    var color = currActiveFilter.facet.attributes.terms[i].color;
	                    // also set first and last label
	                    if (i == 0 || i == currActiveFilter.tmpValues.length-1)
                    	{
	                    	if (!isNaN(v)){
	                    		v = v.toFixed(2);	                    		
	                    	}
	                    	ruler.innerHTML = v;
		                    var w = ruler.offsetWidth
		                    currActiveFilter.colorValues2.push({width:w, color:color, val:v, x:(i==0 ? 2 : currActiveFilter.totWidth-w-2), y:0, yplus30:15, textColor:self.complementColor(color)});
                    	}
	                    currActiveFilter.colorValues.push({width:pixelW, color:color, val:"", x:pixelW * i, y:0, yplus30:15 });
	                }
            	}
            }
            else if (currActiveFilter.controlType == "hierarchic_radiobuttons") {
                var lev1Values = []
                var fullLevelValues = []
                var totLevels = 1;
                var userSelection = null;
        		currActiveFilter.all1Selected = "btn-primary";
                if (currActiveFilter.term)
                	userSelection = currActiveFilter.term
                else if (typeof currActiveFilter.list != "undefined" && currActiveFilter.list && currActiveFilter.list.length == 1) 
                	userSelection = currActiveFilter.list[0];
                
                if (currActiveFilter.term || (currActiveFilter.list && currActiveFilter.list.length < self._sourceDataset.getRecords()))
                	currActiveFilter.all1Selected = ""
                

                var storedValues = []; // to avoid dulicates
                _.each(self._sourceDataset.getRecords(), function(record) {
                    var field = self._sourceDataset.fields.get(currActiveFilter.field);
                    if(!field) {
                        throw "widget.genericfilter: unable to find field ["+currActiveFilter.field+"] in dataset";
                    }

                    var v = record.getFieldValue(field);
                    var vUnrendered = record.getFieldValueUnrendered(field);
                    if (!_.contains(storedValues, vUnrendered))
                	{
                    	storedValues.push(vUnrendered);
                        var shape = record.getFieldShape(field, false, false);
                        fullLevelValues.push(v);
                        if (v.indexOf(currActiveFilter.separator) < 0)
                        	lev1Values.push({value: v, valueUnrendered: vUnrendered, record: record, shape: shape});
                        else
                    	{
                        	var valueSet = v.split(currActiveFilter.separator);
                            var lev1Val = valueSet[0]
                            if (_.find(lev1Values, function(currVal){ return currVal.value == lev1Val }))
                            	{ /* skip already present */ }
                            else 
                        	{
                            	lev1Values.push({value: lev1Val, valueUnrendered: lev1Val, record: null, shape: shape});
                            	if (valueSet.length > totLevels)
                            		totLevels = valueSet.length
                        	}
                    	}
                	}
            	});
            	if (totLevels > 1)
        		{
            		currActiveFilter.useLevel2 = true;
            		currActiveFilter.showLevel2 = "none";
            		currActiveFilter.all2Selected = "btn-primary";
        		}
            	if (totLevels > 2)
        		{
            		currActiveFilter.useLevel3 = true;
            		currActiveFilter.showLevel3 = "none";
            		currActiveFilter.all3Selected = "btn-primary";
        		}
            	// populate level 1
            	_.each(lev1Values, function(lev1Val) {
                    var selected = "";
                    var v = lev1Val.value;
                    var vUnrendered = lev1Val.valueUnrendered;
                    var record = lev1Val.record;
                    
                	if (userSelection && userSelection != "" && self.areValuesEqual(userSelection.split(currActiveFilter.separator)[0], vUnrendered))
                        selected = 'btn-primary'
                        	
                    if (currActiveFilter.useShapeOnly == true)
                	{
                        var shape = lev1Val.shape;
                    	if (shape && shape.indexOf("undefined") < 0)
                    	{
                        	tooltip = "rel=tooltip title="+v
                        	v = "<div class='shape'>"+shape+"</div>"
                    	}
                    	else v = "<div class='shapeH'>"+v+"</div>"
                	}
                    currActiveFilter.values.push({value: vUnrendered, val:v, record:record, selected:selected, valCount: v, tooltip: tooltip });
                });
            	// handle user selection
            	if (userSelection && userSelection != "")
        		{
            		currActiveFilter.valuesLev2 = []
            		var userSelectionParts = userSelection.split(currActiveFilter.separator)
            		var subValues = _.filter(fullLevelValues, function(currVal){ return currVal.indexOf(userSelectionParts[0] + currActiveFilter.separator) == 0 })
            		if (subValues && subValues.length)
        			{
            			// 2 or more levels
            			// populate level 2
            			currActiveFilter.showLevel2 = "block";
                		_.each(subValues, function(subValue) {
                            var selected = "";
                            var subValueParts = subValue.split(currActiveFilter.separator) 
                            var v = subValueParts[1];
                            var val = v;
                            if (_.find(currActiveFilter.valuesLev2, function(valueLev2) { return valueLev2.value == v}))
                        	{
                            	// do nothing. Item already present
                        	}
                            else
                        	{
                                var record = null;
                                if (subValueParts.length == 2)
                            	{
                                	record = _.find(self._sourceDataset.getRecords(), function(record) {
                                        var field = self._sourceDataset.fields.get(currActiveFilter.field);
                                        var currV = record.getFieldValue(field);
                                        return currV == subValue; 
                                	});
                            	}
                                if (self.areValuesEqual(userSelectionParts[0], subValueParts[0]) && self.areValuesEqual(userSelectionParts[1], subValueParts[1]))
                            	{
                                    selected = 'btn-primary'
                                    currActiveFilter.all2Selected = ""
                            	}
                                if (currActiveFilter.useShapeOnly == true)
                            	{
                                	var shape = record.getFieldShape(field, false, false);
                                	if (shape && shape.indexOf("undefined") < 0)
                                	{
                                    	tooltip = "rel=tooltip title="+v
                                    	v = "<div class='shape'>"+shape+"</div>"
                                	}
                                	else v = "<div class='shapeH'>"+v+"</div>"
                            	}
                    			currActiveFilter.valuesLev2.push({value: val, val:v, selected:selected, valCount: v, tooltip: tooltip, record: record });
                        		// check if 3 levels must be shown
                    			if (subValueParts.length >= 2 && userSelectionParts.length >= 2)
                    			{
                            		var subSubValues = _.filter(fullLevelValues, function(currVal){ return currVal.indexOf(userSelectionParts[0] + currActiveFilter.separator + userSelectionParts[1]) == 0 })
                            		if (subSubValues && subSubValues.length)
                        			{
                            			// populate level 3
                            			currActiveFilter.showLevel3 = "block";
                            			currActiveFilter.valuesLev3 = []
	                            		_.each(subSubValues, function(subSubValue) {
	                                        var selected = "";
	                                        var subValueParts = subSubValue.split(currActiveFilter.separator) 
	                                        var v = subValueParts[2];
	                                        var val = v;
	                                        if (_.find(currActiveFilter.valuesLev3, function(valueLev3) { return valueLev3.value == v}))
	                                    	{
	                                        	// do nothing. Item already present
	                                    	}
	                                        else
	                                    	{
	                                            var record = null;
	                                            if (subValueParts.length == 3)
	                                        	{
	                                            	record = _.find(self._sourceDataset.getRecords(), function(record) {
	                                                    var field = self._sourceDataset.fields.get(currActiveFilter.field);
	                                                    var currV = record.getFieldValue(field);
	                                                    return currV == subSubValue; 
	                                            	});
	                                        	}
	                                            if (self.areValuesEqual(userSelection, subSubValue))
	                                        	{
	                                                selected = 'btn-primary'
	                                                currActiveFilter.all2Selected = ""
	                                        	}
	                                            if (currActiveFilter.useShapeOnly == true)
	                                        	{
	                                            	var shape = record.getFieldShape(field, false, false);
	                                            	if (shape && shape.indexOf("undefined") < 0)
	                                            	{
	                                                	tooltip = "rel=tooltip title="+v
	                                                	v = "<div class='shape'>"+shape+"</div>"
	                                            	}
	                                            	else v = "<div class='shapeH'>"+v+"</div>"
	                                        	}
	                                			currActiveFilter.valuesLev3.push({value: val, val:v, selected:selected, valCount: v, tooltip: tooltip, record: record });
	                                    	}
	                            		})
                        			}
                    			}
                        	}
                		})
        			}
        		}
            }
            else {
                var lastV = null;
                if (typeof currActiveFilter.step == "undefined") // do not reset if user specified its own step value
                	currActiveFilter.step = null;

                if(facetTerms) {
                    for (var i in facetTerms) {
                        var selected = "";
                        var tooltip = "";
                        var v = facetTerms[i].term;
                        // facet has no renderer, so we need to retrieve the first record that matches the value and use its renderer
                        // This is needed to solve the notorious "All"/"_ALL_" issue
                        if (facetTerms[i].term)
                    	{
                        	var validRec = _.find(self._sourceDataset.getRecords(), function(rec) { return rec.attributes[currActiveFilter.field] == facetTerms[i].term })
                            if (validRec)
                        	{
                            	var validRecField = validRec.fields.get(currActiveFilter.field)
                            	if (validRecField)
                            		v = validRec.getFieldValue(validRecField)
                        	}
                    	}
                        var vUnrendered = facetTerms[i].term;
                        var val = v;
                        var count = facetTerms[i].count
                        if (currActiveFilter.controlType == "list") {
                            if (count > 0)
                                selected = self._selectedClassName;
                        }
                        else if (currActiveFilter.controlType == "radiobuttons") {
                            var classToUse = currActiveFilter.selectedClassName || "btn-primary"

                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered) || (typeof currActiveFilter.list != "undefined" && currActiveFilter.list && currActiveFilter.list.length == 1 && self.areValuesEqual(currActiveFilter.list[0], vUnrendered)))
                                selected = classToUse
                            
                            if (currActiveFilter.useShapeOnly == true)
                            	if (facetTerms[i].shape && facetTerms[i].shape.indexOf("undefined") < 0)
	                        	{
	                            	tooltip = "rel=tooltip title="+v
	                            	v = "<div class='shape'>"+facetTerms[i].shape+"</div>"
	                        	}
                            	else v = "<div class='shapeH'>"+v+"</div>"
                        }
                        else if (currActiveFilter.controlType == "multibutton") {
                            var classToUse = currActiveFilter.selectedClassName || "btn-info"

                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered))
                                selected = classToUse
                            else if (typeof currActiveFilter.list != "undefined" && currActiveFilter.list != null) {
                                for (var j in currActiveFilter.list)
                                    if (self.areValuesEqual(currActiveFilter.list[j], vUnrendered))
                                        selected = classToUse
                            }
                            if (currActiveFilter.useShapeOnly == true)
                            	if (facetTerms[i].shape && facetTerms[i].shape.indexOf("undefined") < 0)
	                        	{
	                            	tooltip = "rel=tooltip title="+v
	                            	v = "<div class='shape'>"+facetTerms[i].shape+"</div>"
	                        	}
                            	else v = "<div class='shapeH'>"+v+"</div>"
                        }
                        else if (currActiveFilter.controlType == "dropdown" || currActiveFilter.controlType == "dropdown_styled") {
                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered) || (typeof currActiveFilter.list != "undefined" && currActiveFilter.list && currActiveFilter.list.length == 1 && self.areValuesEqual(currActiveFilter.list[0], vUnrendered)))
                                selected = "selected"
                        }
                        else if (currActiveFilter.controlType == "listbox" || currActiveFilter.controlType == "listbox_styled") {
                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered))
                                selected = "selected"
                            else if (typeof currActiveFilter.list != "undefined" && currActiveFilter.list != null) {
                                for (var j in currActiveFilter.list)
                                    if (self.areValuesEqual(currActiveFilter.list[j], vUnrendered))
                                        selected = "selected"
                            }
                        }
                        if (currActiveFilter.showCount)
                            currActiveFilter.values.push({value: vUnrendered, val:v, selected:selected, valCount: v+"\t["+count+"]", count: "["+count+"]", tooltip: tooltip });
                        else currActiveFilter.values.push({value: vUnrendered, val:v, selected:selected, valCount: v, tooltip: tooltip });

                        if (currActiveFilter.controlType.indexOf('slider') >= 0) {
                            if (v > currActiveFilter.max)
                                currActiveFilter.max = v;

                            if (v < currActiveFilter.min)
                                currActiveFilter.min = v;

                            if (currActiveFilter.controlType.indexOf('styled') > 0 && lastV != null) {
                                if (currActiveFilter.step == null || typeof currActiveFilter.step == "undefined")
                                    currActiveFilter.step = v - lastV;
                                else if (v - lastV != currActiveFilter.step)
                                    currActiveFilter.step = 1;
                            }
                        }
                        lastV = v;
                    }
                } else if(self._sourceDataset) {
                    _.each(self._sourceDataset.getRecords(), function(record) {
                        var selected = "";
                        var tooltip = "";
                        var field = self._sourceDataset.fields.get(currActiveFilter.field);
                        if(!field) {
                            throw "widget.genericfilter: unable to find field ["+currActiveFilter.field+"] in dataset";
                        }

                        var v = record.getFieldValue(field);
                        var vUnrendered = record.getFieldValueUnrendered(field);
                        var val = v;
                        if (currActiveFilter.controlType == "radiobuttons") {
                        	var classToUse = currActiveFilter.selectedClassName || "btn-primary"
                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered) || (typeof currActiveFilter.list != "undefined" && currActiveFilter.list && currActiveFilter.list.length == 1 && self.areValuesEqual(currActiveFilter.list[0], vUnrendered)))
                                selected = classToUse
                                	
                            if (currActiveFilter.useShapeOnly == true)
                        	{
                            	var shape = record.getFieldShape(field, false, false);
                            	if (shape && shape.indexOf("undefined") < 0)
	                        	{
	                            	tooltip = "rel=tooltip title="+v
	                            	v = "<div class='shape'>"+shape+"</div>"
	                        	}
                            	else v = "<div class='shapeH'>"+v+"</div>"
                        	}
                        }
                        else if (currActiveFilter.controlType == "multibutton") {
                        	var classToUse = currActiveFilter.selectedClassName || "btn-info"
                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered))
                                selected = classToUse
                            else if (typeof currActiveFilter.list != "undefined" && currActiveFilter.list != null) {
                                for (var j in currActiveFilter.list)
                                    if (self.areValuesEqual(currActiveFilter.list[j], vUnrendered))
                                        selected = classToUse
                            }
                            if (currActiveFilter.useShapeOnly == true)
                        	{
                            	var shape = record.getFieldShape(field, false, false);
                            	if (shape && shape.indexOf("undefined") < 0)
	                        	{
	                            	tooltip = "rel=tooltip title="+v
	                            	v = "<div class='shape'>"+shape+"</div>"
	                        	}
                            	else v = "<div class='shapeH'>"+v+"</div>"
                        	}
                        }
                        else if (currActiveFilter.controlType == "dropdown" || currActiveFilter.controlType == "dropdown_styled") {
                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered) || (typeof currActiveFilter.list != "undefined" && currActiveFilter.list && currActiveFilter.list.length == 1 && self.areValuesEqual(currActiveFilter.list[0], vUnrendered)))
                                selected = "selected"
                        }
                        else if (currActiveFilter.controlType == "listbox" || currActiveFilter.controlType == "listbox_styled") {
                            if (self.areValuesEqual(currActiveFilter.term, vUnrendered))
                                selected = "selected"
                            else if (typeof currActiveFilter.list != "undefined" && currActiveFilter.list != null) {
                                for (var j in currActiveFilter.list)
                                    if (self.areValuesEqual(currActiveFilter.list[j], vUnrendered))
                                        selected = "selected"
                            }
                        }
                        currActiveFilter.values.push({value: vUnrendered, val:v, record:record, selected:selected, valCount: v, tooltip: tooltip });

                        if (currActiveFilter.controlType.indexOf('slider') >= 0) {
                            if (v > currActiveFilter.max)
                                currActiveFilter.max = v;

                            if (v < currActiveFilter.min)
                                currActiveFilter.min = v;

                            if (currActiveFilter.controlType.indexOf('styled') > 0 && lastV != null) {
                                if (currActiveFilter.step == null || typeof currActiveFilter.step == "undefined")
                                    currActiveFilter.step = v - lastV;
                                else if (v - lastV != currActiveFilter.step)
                                    currActiveFilter.step = 1;
                            }
                        }
                        lastV = v;

                    })
                } else {
                    throw "widget.genericfilter: nor facet or dataset present to build filter"
                }

                if (currActiveFilter.controlType.indexOf('slider') >= 0) {
                    if (typeof currActiveFilter.from == "undefined")
                        currActiveFilter.from = currActiveFilter.min;

                    if (typeof currActiveFilter.to == "undefined")
                        currActiveFilter.to = currActiveFilter.max;

                    if (typeof currActiveFilter.term == "undefined")
                        currActiveFilter.term = currActiveFilter.min;

                    if (currActiveFilter.controlType.indexOf('styled') > 0) {
                        if (currActiveFilter.min % 2 == 0 && currActiveFilter.max % 2 == 0) {
                            currActiveFilter.step1 = (currActiveFilter.max - currActiveFilter.min) / 4 + currActiveFilter.min
                            currActiveFilter.mean = (currActiveFilter.max - currActiveFilter.min) / 2
                            currActiveFilter.step2 = (currActiveFilter.max - currActiveFilter.min) * 3 / 4 + currActiveFilter.min
                            if (currActiveFilter.step1 != Math.floor(currActiveFilter.step1) || currActiveFilter.step2 != Math.floor(currActiveFilter.step2)) {
                                currActiveFilter.step1 = "|"
                                currActiveFilter.step2 = "|"
                            }
                        }
                        else {
                            currActiveFilter.step1 = "|"
                            currActiveFilter.mean = "|"
                            currActiveFilter.step2 = "|"
                        }
                    }
                }
            }
            currActiveFilter.ctrlId = self.uid + "_" + self.numId;
            self.numId++;

            return Mustache.render(self.filterTemplates[currActiveFilter.controlType], currActiveFilter);
        },
        fixHierarchicRadiobuttonsSelections:function(filter) {
        	var self = this;
            // ensures previous hierarchic_radiobutton selections are retained, if any (coming from the session cookie) [PART 1]
            if (filter.controlType == "hierarchic_radiobuttons" && filter.type == "list"
            	&& filter.list && filter.list.length > 1)
        	{
            	var valueParts = filter.list[0].split(filter.separator)
            	if (valueParts.length > 1)
        		{
                	var commonSelection = valueParts.splice(0, valueParts.length - 1).join(filter.separator)
                	var lung = commonSelection.length
                	var allRecordsFound = true
                	var allRecords = self._sourceDataset.getRecords() 
                	for (var r in allRecords)
            		{
                		var record = allRecords[r]
                        var field = self._sourceDataset.fields.get(filter.field);
                        var currV = record.getFieldValue(field);
                        if (currV.substring(0, lung) === commonSelection)
                    	{
                        	if (!_.contains(filter.list, currV))
                    		{
                            	allRecordsFound = false;
                            	break;
                    		}
                    	}
            		}
                	if (allRecordsFound)
                		filter.term = commonSelection
        		}
        	}
        	
        },
        

        render:function () {
            var self = this;
            console.log("Render "+this._sourceDataset.id+" ["+this._sourceDataset.getRecords().length+"]")
            var tmplData = {filters:this.activeFilters};
            _.each(tmplData.filters, function (flt) {
                flt.hrVisible = 'block';
                flt.self = self; // pass self to filters!
            });

            //  map them to the correct controlType and retain their values (start/from/term/...)
            if (self._sourceDataset) {
                _.each(self._sourceDataset.queryState.get('selections'), function (filter) {
                    for (var j in tmplData.filters) {
                        if (tmplData.filters[j].field == filter.field) {
                            tmplData.filters[j].list = filter.list
                            tmplData.filters[j].term = filter.term
                            tmplData.filters[j].start = filter.start
                            tmplData.filters[j].stop = filter.stop
                            self.fixHierarchicRadiobuttonsSelections(tmplData.filters[j])
                        }
                    }
                });

                tmplData.fields = this._sourceDataset.fields.toJSON();

            }

            if (tmplData.filters.length > 0)
                tmplData.filters[tmplData.filters.length - 1].hrVisible = 'none'

            var resultType = "filtered";
            if (self.options.resultType !== null)
                resultType = self.options.resultType;

            tmplData.filterDialogTitle = this.filterDialogTitle;
            tmplData.filterDialogDescription = this.filterDialogDescription;
            if (this.filterDialogTitle || this.filterDialogDescription)
                tmplData.titlePresent = "block";
            else tmplData.titlePresent = "none";
            tmplData.dateConvert = self.dateConvert;
            tmplData.filterRender = self.filterRender;
            var currTemplate = this.template;
            if (this.useHorizontalLayout)
                currTemplate = this.templateHoriz

            if (self.showBackground == false) {
                self.className = self.className.replace("well", "")
                $(self).removeClass("well");
                $(self.el).removeClass("well");
            }
            else {
                tmplData.backgroundColor = self.backgroundColor;
                if (self.showBackground == true) {
                    if (self.className.indexOf("well") < 0)
                        self.className += " well";

                    $(self).addClass("well");
                    $(self.el).addClass("well");
                }
            }

            var out = Mustache.render(currTemplate, tmplData);
            this.el.html(out);
            
            // ensure range_slider_styled is attached correctly to the event
            for (var jj in tmplData.filters)
            	if (tmplData.filters[jj].controlType.indexOf("slider_styled") >= 0) {
            		var currData = tmplData.filters[jj];
        			$( "#slider"+currData.ctrlId).jslider({
        				from: currData.min,
        				to: currData.max,
        				scale: [currData.min,"|",currData.step1,"|",currData.mean,"|", currData.step2,"|",currData.max],
        				limits: false,
                    	step: currData.step,
        				skin: (tmplData.filters[jj].controlType.indexOf("range") == 0 ? "round_plastic" : "plastic"),
                    	onstatechange: self.onStyledSliderValueChanged
        			});
        			$( "#slider"+currData.ctrlId).data("self", self);
            	}
            
            // ensures previous hierarchic_radiobutton selections are retained, if any (coming from the session cookie) [PART 2]
            _.each(tmplData.filters, function(currActiveFilter) {
                if (currActiveFilter.controlType == "hierarchic_radiobuttons" && currActiveFilter.type == "list" 
                	&& currActiveFilter.list && currActiveFilter.list.length > 1)
            	{
                    var flt;
                    if (currActiveFilter.ctrlId)
                    	flt = self.el.find("#"+currActiveFilter.ctrlId);
                    else flt = this.el.find("div.filter");
                    
            		var currFilterCtrl = $(flt).find(".data-control-id");
            		self.updateHierarchicRadiobuttons($(flt), currActiveFilter, $(currFilterCtrl));                		
            	}
            });
        },

        complementColor:function (c) {
            // calculates a readable color to use over a given color
            // usually returns black for light colors and white for dark colors.
//	  var c1 = c.hsv();
//	  if (c1[2] >= 0.5)
//		  return chroma.hsv(c1[0],c1[1],0);
//	  else return chroma.hsv(c1[0],c1[1],1);
            var c1 = c.rgb;
            if (c1[0] + c1[1] + c1[2] < 255 * 3 / 2)
                return "white";
            else return "black";
        },
        onButtonsetClicked:function (e) {
            e.preventDefault();
            var self = this;
            var $target = $(e.currentTarget);
            var $fieldSet = $target.parent().parent();
            var type = $fieldSet.attr('data-filter-type');
            var fieldId = $fieldSet.attr('data-filter-field');
            var controlType = $fieldSet.attr('data-control-type');
            if (controlType == "hierarchic_radiobuttons")
        	{
                var currActiveFilter = this.findActiveFilterByField(fieldId, controlType);
                // ensure one and only one selection is performed
                var classToUse = currActiveFilter.selectedClassName || "btn-primary"
                $target.parent().find('button.' + classToUse).each(function () {
                    $(this).removeClass(classToUse);
                });
                $target.addClass(classToUse);
                var currLevel = $target.parent().attr("level")
                var prefix = ""
                if (currLevel >= 2)
                {
                	var lev1Selection = $fieldSet.find('div.data-control-id button.' + classToUse); 
                	prefix = lev1Selection.attr('val').valueOf() + currActiveFilter.separator;
                }
    			if (currLevel == 3)
				{
                	var lev2Selection = $fieldSet.find('div.level2 button.' + classToUse); 
                	prefix += lev2Selection.attr('val').valueOf() + currActiveFilter.separator;
				}
                var listaValori = [];
                if ($target.attr('val') && $target.attr('val').length)
                	listaValori.push(prefix + $target.attr('val').valueOf());
                else if (prefix.length)
                	listaValori.push(prefix.substring(0, prefix.length-1))
                	
                currActiveFilter.userChanged = true;

                if (listaValori.length == 1 && listaValori[0] == "All" && !currActiveFilter.noAllButton) {
                	// "All" pressed. Pass all records to the action 
                    currActiveFilter.term = "";
                    currActiveFilter.showLevel2 = "none";
                    currActiveFilter.showLevel3 = "none";
                    var actions = this.options.actions;
                    actions.forEach(function(currAction){
                        currAction.action.doAction(self._sourceDataset.getRecords(), currAction.mapping);
                    });
                }
                else
            	{
                	// check if leaf or if it has sublevels
                	var currSelectedValue = $target.attr('val').valueOf();
                	var currActiveFilterValue = null;
                	if (currLevel == 1)
                		currActiveFilterValue = _.find(currActiveFilter.values, function (currVal) {return currVal.value == currSelectedValue})
                	else if (currLevel == 2)
                		currActiveFilterValue = _.find(currActiveFilter.valuesLev2, function (currVal) {return currVal.value == currSelectedValue})
                	else if (currLevel == 3)
                		currActiveFilterValue = _.find(currActiveFilter.valuesLev3, function (currVal) {return currVal.value == currSelectedValue})
                		
                	if (currActiveFilterValue && currActiveFilterValue.record)
            		{
                    	currActiveFilter.term = prefix + currSelectedValue;
                    	if (currLevel == 1)
                		{
                    		var divLev2 = $fieldSet.find('div.level2') 
                    		if (divLev2.length > 0)
                			{
                    			divLev2[0].style.display="none"
                        		var divLev3 = $fieldSet.find('div.level3') 
                        		if (divLev3.length)
                        			divLev3[0].style.display="none"
                			}
                		}
                    	else if (currLevel == 2)
                		{
                    		var divLev3 = $fieldSet.find('div.level3') 
                    		if (divLev3.length > 0)
                    			divLev3[0].style.display="none"
                		}
                    	// must also send currSelectedValue to all models!!!!
                        this.doAction("onButtonsetClicked", fieldId, listaValori, "add", currActiveFilter);
            		}
                	else
            		{
                		currActiveFilter.term = prefix + currSelectedValue;
                		if (currActiveFilter.term.length && currActiveFilter.term[currActiveFilter.term.length-1] == currActiveFilter.separator)
                			currActiveFilter.term = currActiveFilter.term.substring(0, currActiveFilter.term.length-1)
                			
                		// redraw the filter!!!
	                    var flt;
	                    if (currActiveFilter.ctrlId)
	                    	flt = self.el.find("#"+currActiveFilter.ctrlId);
	                    else flt = this.el.find("div.filter");
	                    
	            		var currFilterCtrl = $(flt).find(".data-control-id");
	            		this.updateHierarchicRadiobuttons($(flt), currActiveFilter, $(currFilterCtrl));                		
                		
                		listaValori = [];
                		// THEN send a list of all values compatible with the choice. Eg: if user selected ANDROID
                		// which has sublevels TABLET & SMARTPHONE, both ANDROID.TABLET and ANDROID.SMARTPHONE must be sent
                    	_.each(this._sourceDataset.getRecords(), function(record) {
                            var field = self._sourceDataset.fields.get(currActiveFilter.field);
                            var currV = record.getFieldValue(field);
                            var searchString = prefix + currSelectedValue+currActiveFilter.separator;
                            if (currSelectedValue == "")
                            	searchString = prefix;
                            
                            if (currV.indexOf(searchString) == 0  && !_.contains(listaValori, currV))
                            	listaValori.push(currV)
                    	});
                    	// must also send currSelectedValue to all models!!!!
                		this.doAction("onButtonsetClicked", fieldId, listaValori, "add", currActiveFilter);
            		}
                	
            	}
        	}
            else
        	{
                var $fieldSet = $target.parent().parent();
                var type = $fieldSet.attr('data-filter-type');
                var fieldId = $fieldSet.attr('data-filter-field');
                var controlType = $fieldSet.attr('data-control-type');
                var currActiveFilter = this.findActiveFilterByField(fieldId, controlType);
                var classToUse = currActiveFilter.selectedClassName || "btn-info"
                if (controlType == "multibutton") {
                	$target.toggleClass(classToUse);
                	if (currActiveFilter.nullSelectionNotAllowed)
            		{
                		if ($fieldSet.find('div.btn-group button.' + classToUse).length == 0)
            			{
                			// too few selections
                			// re-select the button then exit 
                        	$target.toggleClass(classToUse);
                			return;
            			}
            		}                
                }
                else if (controlType == "radiobuttons") {
                	classToUse = currActiveFilter.selectedClassName || "btn-primary"
                	if (currActiveFilter.allowDeselection)
            		{
                		var wasSelected = $target.hasClass(classToUse) 
                        $fieldSet.find('div.btn-group button.' + classToUse).each(function () {
                            $(this).removeClass(classToUse);
                        });
                		if (!wasSelected)
                			$target.addClass(classToUse)
            		}
                	else
            		{
                        // ensure one and only one selection is performed
                        $fieldSet.find('div.btn-group button.' + classToUse).each(function () {
                            $(this).removeClass(classToUse);
                        });
                        $target.addClass(classToUse);
            		
            		}
                }
                var listaValori = [];
                $fieldSet.find('div.btn-group button.' + classToUse).each(function () {
                	var currVal = $(this).attr('val'); 
                	if (currVal != null && typeof currVal != "undefined")
                		listaValori.push(currVal.valueOf()); // in case there's a date, convert it with valueOf
                });
                currActiveFilter.userChanged = true;
                if (controlType == "multibutton")
                    currActiveFilter.list = listaValori;
                else if (controlType == "radiobuttons") {
                    if (listaValori.length == 1 && listaValori[0] == "All" && !currActiveFilter.noAllButton
                    	|| listaValori.length == 0 && currActiveFilter.allowDeselection) {
	                        listaValori = [];
	                        currActiveFilter.term = "";
                    }
                    else 
                    {
                    	var currVal = $(this).attr('val'); 
                    	if (currVal != null && typeof currVal != "undefined")
                    		currActiveFilter.term = currVal.valueOf();
                    }
                }
                this.doAction("onButtonsetClicked", fieldId, listaValori, "add", currActiveFilter);
        	}
        },
        onLegendItemClicked:function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            // switch to checkbox if user pressed on label
            if ($target.is("label"))
            	$target = $target.parent().prev().children('.legend-item')
            	
            var $fieldSet = $target.parent().parent().parent().parent().parent();
            var type = $fieldSet.attr('data-filter-type');
            var fieldId = $fieldSet.attr('data-filter-field');
            var controlType = $fieldSet.attr('data-control-type');

            $target.toggleClass("not-selected");
            var listaValori = [];
            $fieldSet.find('div.legend-item').each(function () {
                if (!$(this).hasClass("not-selected"))
                    listaValori.push($(this).attr("myValue").valueOf()); // in case there's a date, convert it with valueOf
            });

            // make sure at least one value is selected
            if (listaValori.length > 0) {
                var currActiveFilter = this.findActiveFilterByField(fieldId, controlType)
                currActiveFilter.userChanged = true;
                currActiveFilter.legend = listaValori;

                this.doAction("onLegendItemClicked", fieldId, listaValori, "add", currActiveFilter);
            }
            else $target.toggleClass("not-selected"); // reselect the item and exit
        },
        onListItemClicked:function (e) {
            e.preventDefault();
            // let's check if user clicked on combobox or table and behave consequently
            var $target = $(e.currentTarget);
            var $table;
            var $targetTD;
            var $targetOption;
            var $combo;
            if ($target.is('td')) {
                $targetTD = $target;
                $table = $target.parent().parent().parent();
                var type = $table.attr('data-filter-type');
                if (type == "range")
                    $combo = $table.parent().parent().find(".drop-down2");
            }
            else if ($target.is('select')) {
                $combo = $target;
                $table = $combo.parent().find(".table");
            }
            this.handleListItemClicked($targetTD, $table, $combo, e.ctrlKey);
        },
        handleListItemClicked:function ($targetTD, $table, $combo, ctrlKey) {
            var fieldId = $table.attr('data-filter-field');
            var controlType = $table.attr('data-control-type');
            var type = $table.attr('data-filter-type');
            if (type == "range" && typeof $targetTD == "undefined") {
                // case month_week_calendar
                // user clicked on year combo
                var year = parseInt($combo.val());
                // update year value in filter (so that the value is retained after re-rendering)
                this.findActiveFilterByField(fieldId, controlType).year = year;
                this.render();
            }
            if (typeof $targetTD != "undefined") {
                // user clicked on table
                if (!ctrlKey) {
                    $table.find('tr').each(function () {
                        $(this).removeClass(this._selectedClassName);
                    });
                }
                $targetTD.parent().addClass(this._selectedClassName);
                var listaValori = [];
                if (type == "list") {
                    $table.find('tr.' + this._selectedClassName + " td").each(function () {
                        listaValori.push($(this).text());
                    });
                }

                var currFilter = this.findActiveFilterByField(fieldId, controlType);
                currFilter.userChanged = true;

                if (type == "range") {
                    // case month_week_calendar
                    var year = parseInt($combo.val());
                    var startDate = new Date($targetTD.attr('startDate'));
                    var endDate = new Date($targetTD.attr('stopDate'));

                    currFilter.term = $targetTD.attr('myValue'); // save selected item for re-rendering later

                    this.doAction("onListItemClicked", fieldId, [startDate, endDate], "add", currFilter);
                }
                else if (type == "list") {
                    this.doAction("onListItemClicked", fieldId, listaValori, "add", currFilter);
                }
                else if (type == "term") {
                    this.doAction("onListItemClicked", fieldId, [$targetTD.text()], "add", currFilter);
                }
            }
        },

        // action could be add or remove
        doAction:function (eventType, fieldName, values, actionType, currFilter) {
            var self=this;
            if (currFilter.fieldType == "integer" || currFilter.fieldType == "number" || currFilter.fieldType == "float")
            	for (var j in values)
            		values[j] = parseFloat(values[j]);

            var actions = this.options.actions;
            if (currFilter.facet) 
            {
                actions.forEach(function(currAction){
                    currAction.action.doActionWithFacets(currFilter.facet.attributes.terms, values, currAction.mapping, fieldName);
                });                
            }
            else
            {
            	// I'm using record (not facet) so I can pass it to actions
                var res = [];
                
                if (currFilter.values && currFilter.values.length)
            	{
                    // make sure you use all values, even 2nd or 3rd level if present (hierarchic radiobuttons only)
                    var allValues = currFilter.values
                    if (currFilter.valuesLev3)
                    	allValues = currFilter.values.concat(currFilter.valuesLev2, currFilter.valuesLev3)
                    else if (currFilter.valuesLev2)
                    	allValues = currFilter.values.concat(currFilter.valuesLev2)
                    	
                    // TODO it is not efficient, record must be indexed by term
                    _.each(allValues, function(v) {
                      if (v.record) {
                          var field = v.record.fields.get(currFilter.field);
                          var recordValue = v.record.getFieldValueUnrendered(field);
                          for (var jj in values)
                        	  if (self.areValuesEqual(recordValue, values[jj]))
                        	  {
                        		  res.push(v.record);
                        		  break;
                        	  }
                      }
                    });            	
            	}
                if (res.length)
            	{
                    actions.forEach(function(currAction){
                        currAction.action.doAction(res, currAction.mapping);
                    });
            	}
                else if (values.length)
            	{
                    actions.forEach(function(currAction){
                        currAction.action.doActionWithValueArray(values, currAction.mapping, fieldName);
                    });
            	}
            } 
        },

        dateConvert:function (d) {
            var dd = new Date(d);
            return dd.toDateString();
        },

        dateConvertBack:function (d) {
            // convert 01/31/2012  to 2012-01-31 00:00:00
            try {
                var p = d.split(/\D/);
                return p[2] + "-" + p[0] + "-" + p[1] + " 00:00:00";
            }
            catch (ex) {
                return d;
            }
        },
        onStyledSliderValueChanged:function (value) {
        	var self = this.inputNode.data("self");
        	if (self)
    		{
                var $target = this.domNode.parent().parent();
                var fieldId = $target.attr('data-filter-field');
                var fieldType = $target.attr('data-filter-type');
                var controlType = $target.attr('data-control-type');

                var activeFilter = self.findActiveFilterByField(fieldId, controlType);
                activeFilter.userChanged = true;
                if (controlType == "range_slider_styled")
            	{
                    var fromTo = value.split(";");
                    var from = fromTo[0];
                    var to = fromTo[1];
                    activeFilter.from = from;
                    activeFilter.to = to;
                    self.doAction("onStyledRangeSliderValueChanged", fieldId, [from, to], "add", activeFilter);
            	}
                else
            	{
                  activeFilter.term = value;
                  activeFilter.list = [value];
                  self.doAction("onStyledSliderValueChanged", fieldId, [value], "add", activeFilter);
            	}
    		}
        },
        onFilterValueChanged:function (e) {
            e.preventDefault();
            var $target = $(e.target).parent();
            var fieldId = $target.attr('data-filter-field');
            var fieldType = $target.attr('data-filter-type');
            var controlType = $target.attr('data-control-type');

            var activeFilter = this.findActiveFilterByField(fieldId, controlType);
            activeFilter.userChanged = true;
            if (fieldType == "term") {
                var term;
                var op = "add";
                var termObj = $target.find('.data-control-id');
                switch (controlType) {
                    case "term":
                        term = termObj.val();
                        break;
                    case "slider":
                        term = termObj.slider("value");
                        break;
                    case "slider_styled":
                        term = termObj.attr("value");
                        if (term == "")
                        	term = null;
                        break;
                    case "dropdown":
                    case "dropdown_styled":
                        term = termObj.val();
                        if (term == "")
                        	term = null;
                        break;
                    case "listbox":
                        term = termObj.val();
                        break;
                }
                activeFilter.term = term;
                if (term)
                	activeFilter.list = [term];
                else activeFilter.list = [null];
                
                this.doAction("onFilterValueChanged", fieldId, activeFilter.list, op, activeFilter);
            }
            else if (fieldType == "list") {
                var list = new Array();
                var listObj = $target.find('.data-control-id')[0]; //return a plain HTML select obj
                for (var i in listObj.options)
                    if (listObj.options[i].selected)
                        list.push(listObj.options[i].value);

                activeFilter.list = list;
                this.doAction("onFilterValueChanged", fieldId, list, "add", activeFilter);
            }
            else if (fieldType == "range") {
                var from;
                var to;
                var fromTo;
                var fromObj = $target.find('.data-control-id-from');
                var toObj = $target.find('.data-control-id-to');
                var fromToObj = $target.find('.data-control-id');
                switch (controlType) {
                    case "range":
                        from = fromObj.val();
                        to = toObj.val();
                        break;
                    case "range_slider":
                        from = fromToObj.slider("values", 0);
                        to = fromToObj.slider("values", 1);
                        break;
                    case "range_slider_styled":
                        fromTo = fromToObj.attr("value").split(";");
                        from = fromTo[0];
                        to = fromTo[1];
                        break;
                    case "range_calendar":
                        from = new Date(fromObj.val());
                        to = new Date(toObj.val());
                        break;
                    case "dropdown_date_range":
                        from = fromToObj.find(":selected").attr("startDate");
                        to = fromToObj.find(":selected").attr("stopDate");
                        activeFilter.term = fromToObj.val();
                        break;
                }
                activeFilter.from = from;
                activeFilter.to = to;
                this.doAction("onFilterValueChanged", fieldId, [from, to], "add",activeFilter);
            }
        },
        onAddFilterShow:function (e) {
            e.preventDefault();
            var $target = $(e.target);
            $target.hide();
            this.el.find('div.js-add').show();
        },
        hidePanel:function (obj) {
            $(function () {
                obj.hide("blind", {}, 1000, function () {
                });
            });
        },
        getFilterTypeFromControlType:function (controlType) {
            switch (controlType) {
                case "dropdown" :
                case "dropdown_styled" :
                case "slider" :
                case "slider_styled" :
                case "radiobuttons" :
                    return "term";
                case "range_slider" :
                case "range_slider_styled" :
                case "range_calendar" :
                case "month_week_calendar" :
                case "dropdown_date_range" :
                    return "range";
                case "list" :
                case "listbox":
                case "listbox_styled":
                case "legend" :
                case "multibutton" :
                case "hierarchic_radiobuttons" :
                    return "list";
            }
            return controlType;
        },
        getFieldType:function (field) {
            var fieldFound = this._sourceDataset.fields.find(function (e) {
                return e.get('id') === field
            })
            if (typeof fieldFound != "undefined" && fieldFound != null)
                return fieldFound.get('type');

            return "string";
        },
        onAddFilter:function (e) {
            e.preventDefault();
            var $target = $(e.target).parent().parent();
            $target.hide();
            var controlType = $target.find('select.filterType').val();
            var filterType = this.getFilterTypeFromControlType(controlType);
            var field = $target.find('select.fields').val();
            this.addNewFilterControl({type:filterType, field:field, controlType:controlType});
        },
        addNewFilterControl:function (newFilter) {
            if (typeof newFilter.type == 'undefined')
                newFilter.type = this.getFilterTypeFromControlType(newFilter.controlType)

            if (typeof newFilter.fieldType == 'undefined')
                newFilter.fieldType = this.getFieldType(newFilter.field)

            if (newFilter.controlType == "radiobuttons" || newFilter.controlType == "hierarchic_radiobuttons")
        	{
            	if (newFilter.noAllButton && newFilter.noAllButton == true)
            		newFilter.useAllButton = false 
            	else newFilter.useAllButton = true
        	}
            if (newFilter.controlType == "radiobuttons" || newFilter.controlType == "multibutton")
            	newFilter.useShapeOnly = (newFilter.useShapeOnly && newFilter.useShapeOnly == true)

            if (newFilter.controlType == "month_week_calendar") {
                if (typeof newFilter.period == "undefined")
                    newFilter.period = "Months"

                if (typeof newFilter.year == "undefined")
                    newFilter.year = new Date().getFullYear();
            }
            this.activeFilters.push(newFilter);

        },
        onPeriodChanged:function (e) {
            e.preventDefault();
            var $table = $(e.target).parent().find(".table");
            //var $yearCombo = $(e.target).parent().find(".drop-down2");
            var fieldId = $table.attr('data-filter-field');
            var controlType = $table.attr('data-control-type');

            var type = $table.attr('data-filter-type');
            var currFilter = this.findActiveFilterByField(fieldId, controlType);
            currFilter.period = $(e.target).val();
            currFilter.term = null;
            this.render();
        },
        findActiveFilterByField:function (fieldId, controlType) {
            for (var j in this.activeFilters) {
                if (this.activeFilters[j].field == fieldId && this.activeFilters[j].controlType == controlType)
                    return this.activeFilters[j];
            }
            return new Object(); // to avoid "undefined" errors
        },
        changeFilterField: function(idx, fieldId) {
            if (this.activeFilters[idx])
            	this.activeFilters[idx].field = fieldId
        },
        onRemoveFilter:function (e) {
            e.preventDefault();
            var $target = $(e.target);
            var field = $target.parent().parent().attr('data-filter-field');
            var controlType = $target.parent().parent().attr('data-control-type');
            var currFilter = this.findActiveFilterByField(field, controlType);
            currFilter.term = undefined;
            currFilter.value = [];
            currFilter.userChanged = undefined;

            if (currFilter.controlType == "list" || currFilter.controlType == "month_week_calendar") {
                $table = $target.parent().parent().find(".table")
                if (typeof $table != "undefined") {
                    $table.find('tr').each(function () {
                        $(this).removeClass(this._selectedClassName);
                    });
                }
            }
            else if (currFilter.controlType == "slider_styled") {
                var filterCtrl = $target.parent().parent().find(".slider-styled")
                filterCtrl.jslider("value", filterCtrl.jslider().settings.from);
            }

            this.doAction("onRemoveFilter", field, [], "remove", currFilter);

        },

        composeStateData:function () {
            var self = this;
            var queryString = '?';
            var items = [];
            $.each(self._sourceDataset.queryState.toJSON(), function (key, value) {
                if (typeof(value) === 'object') {
                    value = JSON.stringify(value);
                }
                items.push(key + '=' + encodeURIComponent(value));
            });

            return items;
        },


    });

})(jQuery, recline.View);
