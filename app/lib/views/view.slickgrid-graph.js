/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, my) {
// ## SlickGrid Dataset View
//
// Provides a tabular view on a Dataset, based on SlickGrid.
//
// https://github.com/mleibman/SlickGrid
//
// Initialize it with a `recline.Model.Dataset`.
//
// NB: you need an explicit height on the element for slickgrid to work
my.SlickGridGraph = Backbone.View.extend({
  initialize: function(modelEtc) {
    var self = this;
    this.el = $(this.el);
    this.discardSelectionEvents = false;
    this.el.addClass('recline-slickgrid');
    _.bindAll(this, 'render');
    _.bindAll(this, 'onSelectionChanged');
    _.bindAll(this, 'handleRequestOfRowSelection');

      this.resultType = "filtered";
      if(self.options.resultType !== null)
          this.resultType = self.options.resultType;



      this.model.records.bind('add', this.render);
    this.model.records.bind('reset', this.render);
    this.model.records.bind('remove', this.render);
    this.model.queryState.bind('selection:done', this.handleRequestOfRowSelection);

    var state = _.extend({
        hiddenColumns: [],
        visibleColumns: [],
        columnsOrder: [],
        columnsSort: {},
        columnsWidth: [],
        fitColumns: false
      }, modelEtc.state
    );
    this.state = new recline.Model.ObjectState(state);
  },

  events: {
  },
  render: function() {
      console.log("View.Slickgrid: render");
      var self = this;

    var options = {
      enableCellNavigation: true,
      enableColumnReorder: true,
      enableExpandCollapse: true,
      explicitInitialization: true,
      syncColumnCellResize: true,
      forceFitColumns: this.state.get('fitColumns'),
      useInnerChart: this.state.get('useInnerChart'),
      innerChartMax: this.state.get('innerChartMax'),
      useStripedStyle: this.state.get('useStripedStyle'),
      useCondensedStyle: this.state.get('useCondensedStyle'),
      useHoverStyle: this.state.get('useHoverStyle'),
      showLineNumbers: this.state.get('showLineNumbers'),
      showTotals: this.state.get('showTotals'),
      showPartitionedData: this.state.get('showPartitionedData'),
      selectedCellFocus: this.state.get('selectedCellFocus')
	};

    // We need all columns, even the hidden ones, to show on the column picker
    var columns = [];
    // custom formatter as default one escapes html
    // plus this way we distinguish between rendering/formatting and computed value (so e.g. sort still works ...)
    // row = row index, cell = cell index, value = value, columnDef = column definition, dataContext = full row values
    var formatter = function(row, cell, value, columnDef, dataContext) {
        var field = self.model.getFields(self.resultType).get(columnDef.id);
      if (field.renderer) {
        return field.renderer(value, field, dataContext);
      } else {
        return value;
      }
    }
    if (options.showLineNumbers == true && self.model.getRecords(self.resultType).length > 0)
	{
        var column = {
                id:'lineNumberField',
                name:'#',
                field:'lineNumberField',
                sortable: (options.showPartitionedData ? false : true),
                maxWidth: 80,
                formatter: Slick.Formatters.FixedCellFormatter
              };
    	columns.push(column); 
	}
    var validFields = [];
    var columnsOrderToUse = this.state.get('columnsOrder');
    if (options.showPartitionedData)
	{
    	var getObjectClass = function (obj) {
    	    if (obj && obj.constructor && obj.constructor.toString) {
    	        var arr = obj.constructor.toString().match(
    	            /function\s*(\w+)/);

    	        if (arr && arr.length == 2) {
    	            return arr[1];
    	        }
    	    }

    	    return undefined;
    	}
    	if (getObjectClass(self.model) != "VirtualDataset")
    		throw "Slickgrid exception: showPartitionedData option can only be used on a partitioned virtualmodel! Exiting";

        // obtain a fake partition field since the virtualmodel is missing it.
        // take the first partitioned field available so that the formatter may work
    	var firstMeasureFieldname = options.showPartitionedData.measures[0].field;
    	var partitionFieldname = options.showPartitionedData.partition;
    	var modelAggregatFields = self.model.getPartitionedFields(partitionFieldname, firstMeasureFieldname);
    	var fakePartitionFieldname = modelAggregatFields[0].id; 

    	validFields = self.model.attributes.aggregation.dimensions.concat([options.showPartitionedData.partition]).concat(
    			_.map(options.showPartitionedData.measures, function(m) { return m.field+"_"+m.aggregation})
    			);
    	// slightly different version of list above. Using fake name instead of real name of column 
    	var validFieldsForOrdering = self.model.attributes.aggregation.dimensions.concat([fakePartitionFieldname]).concat(
    			_.map(options.showPartitionedData.measures, function(m) { return m.field+"_"+m.aggregation})
		);
    	var columnsOrder = this.state.get('columnsOrder'); 
        if (typeof columnsOrder == "undefined" || columnsOrder == null || columnsOrder.length == 0)
        	columnsOrderToUse = validFieldsForOrdering;
        
        
    	var columnPart = {
  	          id: fakePartitionFieldname,
  	          name:options.showPartitionedData.partition,
  	          field: options.showPartitionedData.partition,
  	          sortable: false,
  	          minWidth: 80,
  	          formatter: formatter
  	        };
        var widthInfo = _.find(self.state.get('columnsWidth'),function(c){return c.column == field.id});
        if (widthInfo){
          column['width'] = widthInfo.width;
        }
    	columns.push(columnPart);
	}
    
    _.each(self.model.getFields(self.resultType).toJSON(),function(field){
        var column = {
          id:field['id'],
          name:field['label'],
          field:field['id'],
          sortable: (options.showPartitionedData ? false : true),
          minWidth: 80,
          formatter: formatter,
        };
        if (self.model.queryState.attributes.sort)
    	{
        	 _.each(self.model.queryState.attributes.sort,function(sortCondition){
        		 if (column.sortable && field['id'] == sortCondition.field)
        			 column["sorted"] = sortCondition.order; // this info will be checked when onSort is triggered to reverse to existing order (if any)
        	 });
    	}
        var widthInfo = _.find(self.state.get('columnsWidth'),function(c){return c.column == field.id});
        if (widthInfo){
          column['width'] = widthInfo.width;
        }
        if (options.showPartitionedData)
    	{
        	if (_.contains(validFields, field['id']) || (field['id'] == fakePartitionFieldname && field['field'] == options.showPartitionedData.partition))
        		columns.push(column);
    	}
        else columns.push(column);
    });
	var innerChartSerie1Name = self.state.get('innerChartSerie1');
	var innerChartSerie2Name = self.state.get('innerChartSerie2');
	
	if (options.useInnerChart == true && self.model.getRecords(self.resultType).length > 0)
	{
		columns.push({
        name: self.state.get('innerChartHeader'),
        id: 'innerChart',
        field:'innerChart',
        sortable: false,
		alignLeft: true,
        minWidth: 150,
        // if single series, use percent bar formatter, else twinbar formatter
        formatter: (innerChartSerie1Name && innerChartSerie2Name ? Slick.Formatters.TwinBarFormatter : Slick.Formatters.PercentCompleteBar)
      })
	}
	if (self.state.get('fieldLabels') && self.state.get('fieldLabels').length > 0)
	{
		_.each(self.state.get('fieldLabels'), function(newIdAndLabel) {
			for (var c in columns)
				if (columns[c].id == newIdAndLabel.id)
					columns[c].name = newIdAndLabel.label;
		});
	}
	var visibleColumns = [];
	
	if (self.state.get('visibleColumns').length > 0)
	{
		visibleColumns = columns.filter(function(column) {
		  return (_.indexOf(self.state.get('visibleColumns'), column.id) >= 0 || (options.showLineNumbers == true && column.id == 'lineNumberField'));
		});
		if (self.state.get('useInnerChart') == true && self.model.getRecords(self.resultType).length > 0)
			visibleColumns.push(columns[columns.length - 1]); // innerChart field is last one added
	}
	else
	{
		// Restrict the visible columns
		visibleColumns = columns.filter(function(column) {
		  return _.indexOf(self.state.get('hiddenColumns'), column.id) == -1;
		});
	}
    // Order them if there is ordering info on the state
    if (columnsOrderToUse) {
      visibleColumns = visibleColumns.sort(function(a,b){
        return _.indexOf(columnsOrderToUse,a.id) > _.indexOf(columnsOrderToUse,b.id) ? 1 : -1;
      });
      columns = columns.sort(function(a,b){
        return _.indexOf(columnsOrderToUse,a.id) > _.indexOf(columnsOrderToUse,b.id) ? 1 : -1;
      });
    }

    // Move hidden columns to the end, so they appear at the bottom of the
    // column picker
    var tempHiddenColumns = [];
    for (var i = columns.length -1; i >= 0; i--){
      if (_.indexOf(_.pluck(visibleColumns,'id'),columns[i].id) == -1){
        tempHiddenColumns.push(columns.splice(i,1)[0]);
      }
    }
    columns = columns.concat(tempHiddenColumns);

	var max = 0;
	var adjustMax = function(val) {
		// adjust max in order to return the highest comfortable number
		var valStr = ""+parseInt(val);
		var totDigits = valStr.length;
		if (totDigits <= 1)
			return 10;
		else
		{
			var firstChar = parseInt(valStr.charAt(0));
			var secondChar = parseInt(valStr.charAt(1));
			if (secondChar < 5)
				return (firstChar+0.5)*Math.pow(10, totDigits-1)
			else return (firstChar+1)*Math.pow(10, totDigits-1)
		}
	}


    if (self.state.get('useInnerChart') == true && innerChartSerie1Name && self.model.getRecords(self.resultType).length > 0)
	{
        _.each(self.model.getRecords(self.resultType), function(doc){
		  var row = {};
            _.each(self.model.getFields(self.resultType).models, function(field){
			row[field.id] = doc.getFieldValue(field);
			if (field.id == innerChartSerie1Name || field.id == innerChartSerie2Name)
			{
				var currVal = Math.abs(parseFloat(row[field.id]));
				if (currVal > max)
					max = currVal;
			}
		  });
		});
		max = adjustMax(max);
		options.innerChartMax = max;
	}
    var data = [];
	var rowsToSelect = [];
	var unselectableRowIds = [];
	var jj = 0;
	
    if (options.showPartitionedData)
	{
    	var partitionFieldname = options.showPartitionedData.partition;
    	var dimensionFieldnames = self.model.attributes.aggregation.dimensions;
    	var records = self.model.getRecords(self.resultType);
    	var dimensionValues = []
    	for (var d in dimensionFieldnames)
		{
    		var dimensionFieldname = dimensionFieldnames[d];
    		var currDimensionValues = _.map(records, function(record){ return record.attributes[dimensionFieldname]; });
    		dimensionValues[d] = _.uniq(currDimensionValues); // should be already sorted
		}
    	var firstMeasureFieldname = options.showPartitionedData.measures[0].field;
    	var modelAggregatFields = self.model.getPartitionedFields(partitionFieldname, firstMeasureFieldname);
		var allPartitionValues = _.map(modelAggregatFields, function(f){ return f.attributes.partitionValue; });
		var partitionValues = _.uniq(allPartitionValues); // should be already sorted
    		
    	var row = {};
    	var useSingleDimension = false;
    	if (dimensionFieldnames.length == 1)
		{
    		useSingleDimension = true;
    		dimensionValues[1] = [""]
    		dimensionFieldnames[1] = "___fake____";
		}
    	
    	for (var i0 in dimensionValues[0])
		{
    		row = {};
    		var dimensionFieldname0 = dimensionFieldnames[0];
	    	for (var i1 in dimensionValues[1])
			{
	    		row = {};
	    		var dimensionFieldname1 = dimensionFieldnames[1];
    			var rec = _.find(records, function(r) { return r.attributes[dimensionFieldname0] == dimensionValues[0][i0] && (useSingleDimension || r.attributes[dimensionFieldname1] == dimensionValues[1][i1]); });
		    	for (var i2 in partitionValues)
		    	{
		    		row = {};
		    		if (i1 == 0 && i2 == 0)
		    			row[dimensionFieldname0] = dimensionValues[0][i0];

		    		if (i2 == 0)
		    			row[dimensionFieldname1] = dimensionValues[1][i1];
		    		
		    		row[partitionFieldname] = partitionValues[i2];
		    		
    	    		for (var m in options.showPartitionedData.measures)
        			{
    	    			var measureField = options.showPartitionedData.measures[m];
    	    			var measureFieldName = measureField.field
    	    			var modelAggregationFields = self.model.getPartitionedFields(partitionFieldname, measureFieldName);
    	    			var modelField = _.find(modelAggregationFields, function(f) { return f.attributes.partitionValue == partitionValues[i2]});
    	    			if (modelField)
	    				{
    	    				if (rec)
	    					{
    	    					var formattedValue = rec.getFieldValue(modelField);
    	    					if (formattedValue)
        	    					row[measureFieldName+"_"+measureField.aggregation] = rec.getFieldValue(modelField);
            	    			else row[measureFieldName+"_"+measureField.aggregation] = 0;
	    					}
        	    			else row[measureFieldName+"_"+measureField.aggregation] = 0;
	    				}
        			}
	
		    		if (options.showLineNumbers == true)
					    row['lineNumberField'] = jj;
		    		
		    		data.push(row);
		    	}
		    	if (options.showPartitionedData.showSubTotals)
	    		{
		    		row = {};
		    		row[partitionFieldname] = "<b>Total(s)</b>";
    	    		for (var m in options.showPartitionedData.measures)
        			{
    	    			var measureField = options.showPartitionedData.measures[m];
    	    			var measureFieldName = measureField.field+"_"+measureField.aggregation
    	    			var modelField = _.find(self.model.getFields(self.resultType).models, function(f) { return f.attributes.id == measureFieldName});
    	    			if (modelField && rec)
	    				{
	    					var formattedValue = rec.getFieldValue(modelField);
	    					if (formattedValue)
    	    					row[measureFieldName] = "<b>"+rec.getFieldValue(modelField)+"</b>";
        	    			else row[measureFieldName] = "<b>"+0+"</b>";
	    				}
    	    			else row[measureFieldName] = "<b>"+0+"</b>";
        			}
    	    		unselectableRowIds.push(data.length)
		    		data.push(row);
	    		}
			}
		}
	}
    else
	{
      _.each(self.model.getRecords(self.resultType), function(doc){
	      if (doc.is_selected)
			rowsToSelect.push(jj);
			
		  var row = {schema_colors: []};
	
	        _.each(self.model.getFields(self.resultType).models, function(field){
	        row[field.id] = doc.getFieldValue(field);
	        if (innerChartSerie1Name && field.id == innerChartSerie1Name)
	    		row.schema_colors[0] = doc.getFieldColor(field);
	        
	        if (innerChartSerie2Name && field.id == innerChartSerie2Name)
	    		row.schema_colors[1] = doc.getFieldColor(field);
	      });
		  
		  if (self.state.get('useInnerChart') == true && innerChartSerie1Name)
		  {
			  if (innerChartSerie2Name)
				  row['innerChart'] = [ row[innerChartSerie1Name], row[innerChartSerie2Name], max ]; // twinbar for 2 series
			  else row['innerChart'] = row[innerChartSerie1Name]; // percent bar for 1 series
		  }
		  
	
		  data.push(row);
			
	      jj++;
	      
		  if (options.showLineNumbers == true)
			    row['lineNumberField'] = jj;
	    });
	}
      
      if (options.showTotals && self.model.records.length > 0)
	  {
    	  options.totals = {};
    	  var totalsRecord = self.model.getRecords("totals");
    	  for (var f in options.showTotals)
		  {
    		  var currTotal = options.showTotals[f];
    		  var fieldObj = self.model.getField_byAggregationFunction("totals"+(currTotal.filtered ? "_filtered" : ""), currTotal.field, currTotal.aggregation);
    		  if (typeof fieldObj != "undefined")
    			  options.totals[currTotal.field] = totalsRecord[0].getFieldValue(fieldObj);
		  }
	  }

	if (this.options.actions != null && typeof this.options.actions != "undefined")
	{
		_.each(this.options.actions, function(currAction) {
			if (_.indexOf(currAction.event, "hover") >= 0)
				options.trackMouseHover = true;
		});
	}
    data.getItemMetadata = function (row) 
	{
        if (_.contains(unselectableRowIds, row))
          return { "selectable": false }
	}
	
    this.grid = new Slick.Grid(this.el, data, visibleColumns, options);
	
    var classesToAdd = ["s-table"];
    if (options.useHoverStyle)
    	classesToAdd.push("s-table-hover")
    if (options.useCondensedStyle)
    	classesToAdd.push("s-table-condensed")
    if (options.useStripedStyle)
    	classesToAdd.push("s-table-striped")
    	
	this.grid.addClassesToGrid(classesToAdd);
	this.grid.removeClassesFromGrid(["ui-widget"]);
	
	this.grid.setSelectionModel(new Slick.RowSelectionModel());
	//this.grid.getSelectionModel().setSelectedRows(rowsToSelect);
	
    var sortedColumns = []
    _.each(self.model.queryState.attributes.sort,function(sortCondition){
    	sortedColumns.push({ columnId: sortCondition.field, sortAsc: sortCondition.order == "asc" })
    });
    this.grid.setSortColumns(sortedColumns);
	
    this.grid.onSelectedRowsChanged.subscribe(function(e, args){
    	if (!self.discardSelectionEvents)
    		self.onSelectionChanged(args.rows)
    	
    	self.discardSelectionEvents = false
	});

    // Column sorting
//    var sortInfo = this.model.queryState.get('sort');
//    // TODO sort is not present in slickgrid
//    if (sortInfo){
//      var column = sortInfo[0].field;
//      var sortAsc = !(sortInfo[0].order == 'desc');
//      this.grid.sort(column, sortAsc);
//    }

    this.grid.onSort.subscribe(function(e, args){
      var order = (args.sortAsc) ? 'asc':'desc';
      if (args.sortCol.sorted)
	  {
    	  // already ordered! switch ordering
    	  if (args.sortCol.sorted == "asc")
    		  order = "desc"
    	  if (args.sortCol.sorted == "desc")
    		  order = "asc"
	  }
      var sort = [{
        field: args.sortCol.field,
        order: order
      }];
      self.model.query({sort: sort});
    });

    this.grid.onColumnsReordered.subscribe(function(e, args){
      self.state.set({columnsOrder: _.pluck(self.grid.getColumns(),'id')});
    });

    this.grid.onColumnsResized.subscribe(function(e, args){
        var columns = args.grid.getColumns();
        var defaultColumnWidth = args.grid.getOptions().defaultColumnWidth;
        var columnsWidth = [];
        _.each(columns,function(column){
          if (column.width != defaultColumnWidth){
            columnsWidth.push({column:column.id,width:column.width});
          }
        });
        self.state.set({columnsWidth:columnsWidth});
    });

      //
    this.grid.onRowHoverIn.subscribe(function(e, args){
		//console.log("HoverIn "+args.row)
		var selectedRecords = [];
		selectedRecords.push(self.model.records.models[args.row]);
		var actions = self.options.actions;
		actions.forEach(function(currAction){				
			currAction.action.doAction(selectedRecords, currAction.mapping);
		});
    });
	
    var columnpicker = new Slick.Controls.ColumnPicker(columns, this.grid,
                                                       _.extend(options,{state:this.state}));

    if (self.visible){
      self.grid.init();
      self.rendered = true;
    } else {
      // Defer rendering until the view is visible
      self.rendered = false;
    }

    function resizeSlickGrid()
    {
    	if (self.model.getRecords(self.resultType).length > 0)
    	{
    		var container = self.el.parent();
            if (typeof container != "undefined" && container != null && 
            		((container[0].style && container[0].style.height && container[0].style.height.indexOf("%") > 0)
            		|| container.hasClass("h100") ) )
        	{
        		//console.log("Resizing container height from "+self.el.height()+" to "+self.el.parent()[0].offsetHeight)
	        	
            	// force container height to element height 
	        	self.el.height(self.el.parent()[0].offsetHeight);
	        	self.grid.invalidateAllRows();
	        	self.grid.resizeCanvas();
	        	self.grid.render();
        	}    		
    	}
    }
    resizeSlickGrid();
    nv.utils.windowResize(resizeSlickGrid);
    this.handleRequestOfRowSelection();
    
    return this;
 },
  handleRequestOfRowSelection: function() {
	  console.log("handleRequestOfRowSelection")
	  this.discardSelectionEvents = true;
	  var rowsToSelect = [];
	  var myRecords = this.model.getRecords(this.resultType); 
	  var selRow;
	  for (row in myRecords) 
	      if (myRecords[row].is_selected)
	      {
	    	  rowsToSelect.push(row)
	    	  selRow = row
	      }
	  
	  this.grid.getSelectionModel().setSelectedRows(rowsToSelect)
	  if (selRow && this.options.state.selectedCellFocus)
		  this.grid.scrollRowToTop(selRow);
  },
  onSelectionChanged: function(rows) {
	var self = this;
	var selectedRecords = [];
	_.each(rows, function(row) {
		selectedRecords.push(self.model.getRecords(self.resultType)[row]);//self.model.records.models[row]);
	});
	var actions = this.options.actions;
	   if(actions != null)
        actions.forEach(function(currAction){
		    currAction.action.doAction(selectedRecords, currAction.mapping);
	    });
  },
  show: function() {
    // If the div is hidden, SlickGrid will calculate wrongly some
    // sizes so we must render it explicitly when the view is visible
    if (!this.rendered){
      if (!this.grid){
        this.render();
      }
      this.grid.init();
      this.rendered = true;
    }
    this.visible = true;
  },

  hide: function() {
    this.visible = false;
  }
});

})(jQuery, recline.View);

/*
* Context menu for the column picker, adapted from
* http://mleibman.github.com/SlickGrid/examples/example-grouping
*
*/
(function ($) {
  function SlickColumnPicker(columns, grid, options) {
    var $menu;
    var columnCheckboxes;

    var defaults = {
      fadeSpeed:250
    };

    function init() {
      grid.onHeaderContextMenu.subscribe(handleHeaderContextMenu);
      options = $.extend({}, defaults, options);

      $menu = $('<ul class="dropdown-menu slick-contextmenu" style="display:none;position:absolute;z-index:20;" />').appendTo(document.body);

      $menu.bind('mouseleave', function (e) {
        $(this).fadeOut(options.fadeSpeed)
      });
      $menu.bind('click', updateColumn);

    }

    function handleHeaderContextMenu(e, args) {
      e.preventDefault();
      $menu.empty();
      columnCheckboxes = [];

      var $li, $input;
      for (var i = 0; i < columns.length; i++) {
        $li = $('<li />').appendTo($menu);
        $input = $('<input type="checkbox" />').data('column-id', columns[i].id).attr('id','slick-column-vis-'+columns[i].id);
        columnCheckboxes.push($input);

        if (grid.getColumnIndex(columns[i].id) != null) {
          $input.attr('checked', 'checked');
        }
        $input.appendTo($li);
        $('<label />')
            .text(columns[i].name)
            .attr('for','slick-column-vis-'+columns[i].id)
            .appendTo($li);
      }
      $('<li/>').addClass('divider').appendTo($menu);
      $li = $('<li />').data('option', 'autoresize').appendTo($menu);
      $input = $('<input type="checkbox" />').data('option', 'autoresize').attr('id','slick-option-autoresize');
      $input.appendTo($li);
      $('<label />')
          .text('Force fit columns')
          .attr('for','slick-option-autoresize')
          .appendTo($li);
      if (grid.getOptions().forceFitColumns) {
        $input.attr('checked', 'checked');
      }

      $menu.css('top', e.pageY - 10)
          .css('left', e.pageX - 10)
          .fadeIn(options.fadeSpeed);
    }

    function updateColumn(e) {
      if ($(e.target).data('option') == 'autoresize') {
        var checked;
        if ($(e.target).is('li')){
            var checkbox = $(e.target).find('input').first();
            checked = !checkbox.is(':checked');
            checkbox.attr('checked',checked);
        } else {
          checked = e.target.checked;
        }

        if (checked) {
          grid.setOptions({forceFitColumns:true});
          grid.autosizeColumns();
        } else {
          grid.setOptions({forceFitColumns:false});
        }
        options.state.set({fitColumns:checked});
        return;
      }

      if (($(e.target).is('li') && !$(e.target).hasClass('divider')) ||
            $(e.target).is('input')) {
        if ($(e.target).is('li')){
            var checkbox = $(e.target).find('input').first();
            checkbox.attr('checked',!checkbox.is(':checked'));
        }
        var visibleColumns = [];
        var hiddenColumnsIds = [];
        $.each(columnCheckboxes, function (i, e) {
          if ($(this).is(':checked')) {
            visibleColumns.push(columns[i]);
          } else {
            hiddenColumnsIds.push(columns[i].id);
          }
        });


        if (!visibleColumns.length) {
          $(e.target).attr('checked', 'checked');
          return;
        }

        grid.setColumns(visibleColumns);
        options.state.set({hiddenColumns:hiddenColumnsIds});
      }
    }
    init();
  }

  // Slick.Controls.ColumnPicker
  $.extend(true, window, { Slick:{ Controls:{ ColumnPicker:SlickColumnPicker }}});
})(jQuery);
