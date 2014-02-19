/* global define */
/*jshint multistr: true */
define(['backbone', 'REM/recline-extensions/recline-extensions-amd', 'mustache', 'underscore', 'REM/vendor/bootstrap-multiselect/bootstrap-multiselect'], function (Backbone, recline, Mustache, _) {
    
    recline.View = recline.View || {};

    var my = recline.View;

    my.MultiButtonDropdownFilter = Backbone.View.extend({
        template: '<div class="btn-toolbar"> \
                        <div class="btn-group data-control-id"> \
                        {{^noAllButton}} \
                            <button type="button" class="btn btn-mini grouped-button AllButton {{allButtonSelected}}" val="All">All</button> \
                        {{/noAllButton}} \
                        {{#buttonsData}} \
                            {{{buttonRender}}} \
                        {{/buttonsData}} \
                    </div> \
                </div>',
        buttonTemplate: '<button type="button" class="btn btn-mini grouped-button {{selected}}" val="{{value}}">{{valueLabel}}</button>',
        buttonTemplate2: '<button type="button" class="btn btn-mini btn-tooltip grouped-button {{selected}}"  data-toggle="tooltip" title="{{descLabel}}" val="{{value}}">{{index}}</button>',
        dropdownTemplate: '<select id="dropdown{{uid}}_{{numId}}" multiple="multiple"> \
                            {{#options}} \
                                <option value="{{fullValue}}" {{#selected}}selected="selected"{{/selected}}>{{value}}</option> \
                            {{/options}} \
                            </select>',
        events:{
            'click .grouped-button':'onButtonsetClicked',
            'click button.select-all-button' : 'onDropdownSelectAll' 
        },
        _sourceDataset:null,
        _selectedClassName:"btn-primary", // use bootstrap ready-for-use classes to highlight list item selection (avail classes are success, warning, info & error)
        _partlySelectedClassName:"btn-info",
        hasValueChanges: false,
        documentClickAssigned: false,
        initialize:function (args) {
            this.el = $(this.el);
            _.bindAll(this, 'render', 'update', 'onButtonsetClicked', 'getDropdownSelections', 'getAllSelections', 'getRecordByValue', 'handleChangedSelections', 'onDropdownSelectAll');

            this._sourceDataset = args.sourceDataset;
            this.uid = args.id || Math.floor(Math.random() * 100000); // unique id of the view containing all filters
            this.numId = 0; // auto-increasing id used for a single filter

            this.sourceField = args.sourceField;
            this.nullSelectionNotAllowed = args.nullSelectionNotAllowed;
            this._actions = args.actions;
            this.noAllButton = args.sourceField.noAllButton || false;
            this.exclusiveButtonValue = args.sourceField.exclusiveButtonValue || (!this.noAllButton ? "All" : undefined);
            this.separator = this.sourceField.separator;
            this.numColumns = args.numColumns;
            this.columnWidth = args.columnWidth;
            this.tooltipsOnly = args.tooltipsOnly;
            this.buttonTextMaxItems = args.buttonTextMaxItems || 4;
            this.buttonTextMaxChars = args.buttonTextMaxChars;
            this.tooltipValueSeparator = args.tooltipValueSeparator;
            this.tooltipButtonLabelField = args.tooltipButtonLabelField;
            this.tooltipButtonDescriptionField = args.tooltipButtonDescriptionField;
            if (this._sourceDataset) {
                this._sourceDataset.bind('query:done', this.render);
                this._sourceDataset.queryState.bind('selection:done', this.update);
            }
            if (args.selectedClassName) {
                this._selectedClassName = args.selectedClassName;
            }
            if (args.partlySelectedClassName) {
                this._partlySelectedClassName = args.partlySelectedClassName;
            }
            this.multiSelects = [];
        },
        render:function () {
            var self = this;
            this.el.html("");
            this.numId = 0;
            
            var tmplData = {noAllButton: this.noAllButton};
            //  Retain user selections
            if (self._sourceDataset) {
                _.each(self._sourceDataset.queryState.get('selections'), function (filter) {
                    if (self.sourceField.field == filter.field);
                    {
                        self.sourceField.list = filter.list;
                        self.sourceField.term = filter.term;
                    }
                });
            }
            
            self.buttonsData = {};
            var records = self._sourceDataset.getRecords();
            tmplData.allButtonSelected = (records && self.sourceField.list && records.length == self.sourceField.list.length && !self.noAllButton);
            
            var alreadyInsertedValues = [];
            _.each(records, function(record, index) {
                var field = self._sourceDataset.fields.get(self.sourceField.field);
                if(!field) {
                    throw "widget.multibutton_dropdown_filter: unable to find field ["+self.sourceField.field+"] in dataset";
                }

                var fullLevelValue = record.getFieldValue(field);
                var valueUnrendered = record.getFieldValueUnrendered(field);
                
                var indexLabel;
                if (self.tooltipButtonLabelField){
                    indexLabel = record.getFieldValue(self._sourceDataset.fields.get(self.tooltipButtonLabelField));
                }
                if (indexLabel == null || indexLabel == ''){
                    indexLabel = index;
                }
                var descLabel;
                if (self.tooltipButtonDescriptionField){
                    descLabel = record.getFieldValue(self._sourceDataset.fields.get(self.tooltipButtonDescriptionField));
                } 
                
                if (!_.contains(alreadyInsertedValues, fullLevelValue))
                {
                    if (self.separator && fullLevelValue.indexOf(self.separator) > 0)
                    {
                        var levelValues = fullLevelValue.split(self.separator);
                        // if more that 2 separators, join all the rest so that it's not lost
                        if (levelValues.length > 2) {
                            levelValues[1] = levelValues.slice(1).join(self.separator);
						}
                        if (self.buttonsData[levelValues[0]] && self.buttonsData[levelValues[0]].options)
                            self.buttonsData[levelValues[0]].options.push({fullValue: fullLevelValue, value: levelValues[1], record: record, selected: !tmplData.allButtonSelected && _.contains(self.sourceField.list, fullLevelValue), index: indexLabel, descLabel: descLabel});
                        else
                            self.buttonsData[levelValues[0]] = { self: self, options: [{fullValue: fullLevelValue, value: levelValues[1], record: record, selected: !tmplData.allButtonSelected && _.contains(self.sourceField.list, fullLevelValue), index: indexLabel, descLabel: descLabel}]};
                    }
                    else
                    {
                        self.buttonsData[valueUnrendered] = { value: fullLevelValue, valueUnrendered: valueUnrendered, record: record, selected: !tmplData.allButtonSelected && _.contains(self.sourceField.list, valueUnrendered), self: self, index: indexLabel, descLabel: descLabel };
                    }
                    alreadyInsertedValues.push(fullLevelValue);
                }
            });
            self.allValues = alreadyInsertedValues;
            
            tmplData.buttonsData = _.map(self.buttonsData, function(obj, key){ return obj; }); // transform to array
            
            _.each(tmplData.buttonsData, function(tbd) {
                if (tbd.options) {
                    tbd.options = _.sortBy(tbd.options, function(opt) { 
                        return opt.value;
                    });
                }
            });
            
            // ensure buttons with multiple options are moved to the end of the control toolbar to safeguard look & feel  
            tmplData.buttonsData = _.sortBy(tmplData.buttonsData, function(obj) { 
                if (obj.options) 
                    return 1; 
                else
                {
                    if (self.exclusiveButtonValue && self.exclusiveButtonValue == obj.valueUnrendered) // if ALL button present, put to the extreme left
                        return -1;
                    else return 0;
                }
            }); 
            tmplData.buttonRender = self.buttonRender;

            var out = Mustache.render(this.template, tmplData);
            this.el.html(out);
            
            if (self.tooltipsOnly){
                self.el.find(".btn-tooltip").tooltip({html:true, placement:"bottom"});  
            }
            
            
            var buttonText = function(options) {
                var $select = $(options.context);
                var totOptions = $select.find("option").length;
                if (options.length == 0 || options.length == totOptions) 
                    return this.mainValue;//+' <b class="caret"></b>';
                else {
                    var selected = '';
                    var selectedItems = [];
                    if (self.numColumns) {
                        // preprocess selected items and try to group selections if possible
                        // for instance, if user selected CINEMA.ANON and CINEMA.REGISTERED and CINEMA only has two possible values, selection must become CINEMA
                        var groupedOptions = _.groupBy(options, function(opt){ 
                            return $(opt).attr("data-group");
                        });
                        _.each(_.keys(groupedOptions), function(group) {
                            var $first = $(groupedOptions[group][0]);
                            if (groupedOptions[group].length == 1 || groupedOptions[group].length < $first.attr("data-group-count")) {
                                _.each(groupedOptions[group], function(opt) {
                                    selectedItems.push($(opt).text());
                                });
                            }
                            else {
                                selectedItems.push(group);
                            }
                        });
                    }
                    else {
                        _.each(options, function(opt) {
                            selectedItems.push($(opt).text());
                        });
                    }
                    if (self.buttonTextMaxChars) {
                        selected = selectedItems.join(", ");
                        if (selected.length > self.buttonTextMaxChars) {
                            selected = selected.substring(0, self.buttonTextMaxChars)+'...('+selectedItems.length+')';
                        }
                    }
                    else {
                        if (selectedItems.length <= self.buttonTextMaxItems) {
                            selected = selectedItems.join(", ");
                        }
                        else {
                            selected = selectedItems.slice(0, self.buttonTextMaxItems).join(", ") +(selectedItems.length - self.buttonTextMaxItems)+' other options';
                        }
                    }
                    return this.mainValue+' <span style="opacity:0.5">'+ selected + '</span>';// <b class="caret"></b>';
                }
            };
            
            var onChange = function(element, checked){
                self.hasValueChanges =  true;
                var multiselect = element.parent();
                var multiselectObj = multiselect.data('multiselect');
                var multiselectContainer = multiselectObj.container;
                var totSelectedObjs = element.parent().find("[selected='selected']");
                var totObjs = element.parent().find("option");
                if (totSelectedObjs.length) {
                    if (totSelectedObjs.length < totObjs.length) {
                        $('button', multiselectContainer).addClass(self._partlySelectedClassName);  // multiselect
                    }
                    else {
                        $('button', multiselectContainer).removeClass(self._partlySelectedClassName).addClass(self._selectedClassName);  // multiselect
                    }
                }
                else {
                    if (self.nullSelectionNotAllowed) {
                        var listaValori = self.getAllSelections();
                        if (!listaValori.length) {
                            // restore original selection
                            element.attr("selected", "selected");
                            var checkBoxObj = _.find($("input[type='checkbox']", multiselectContainer), function(obj) {return $(obj).attr("value") == element.val(); });
                            if (checkBoxObj)
                                $(checkBoxObj).attr("checked", "checked");
                                
                            var buttonHtml = multiselectObj.options.buttonText($("option:selected", element.parent()));
                            $('button.select-all-button', multiselectContainer).html(buttonHtml);
                                
                            return;
                        }
                    }
                    $('button', multiselectContainer).removeClass(self._selectedClassName).removeClass(self._partlySelectedClassName); // multiselect
                }
                if (!self.documentClickAssigned)
                {
                    $(document).on("click.dropdownbtn", function (e) {
                        if (!$('button', multiselectContainer).parent().hasClass("open")) {
                            self.handleChangedSelections(true);
                        }
                    });
                    self.documentClickAssigned = true;
                }
            };

            var lastKey;
            var firstKey = null;
            var key;
            for (key in self.buttonsData) {
                if (firstKey == null)
                    firstKey = key;
                
                if (self.buttonsData[key].options)
                    lastKey = key;
            }
            var k = 0;
            var tot = 0;
            self.multiSelects = [];
            var totMultiselect = 0;
            // count total number of multiselect before creating them
            for (key in self.buttonsData)
            {
                if (self.buttonsData[key].options) {
                    totMultiselect++;
                }
            }

            for (key in self.buttonsData)
            {
                if (self.buttonsData[key].options)
                {
                    var offset = 0;
                    if (self.columnWidth && self.numColumns) {
                        // offset is:
                        // 0 for first dropdown
                        // (1-totCols)*columnSize for last dropdown
                        // an interpolated value for all middle dropdowns
                        var max = (self.columnWidth*(self.numColumns-1));
                        offset = - (self.multiSelects.length)/totMultiselect * max;
                    }
                    var multiselect = self.$el.find('#dropdown' + self.uid + '_' + k).multiselect({
                                                                                    mainValue:key,
                                                                                    buttonClass:'btn btn-mini'+(key == lastKey ? ' btn-last' : ''),
                                                                                    buttonClassFirst:'btn btn-mini'+(key == firstKey ? ' btn-first' : ''),
                                                                                    buttonText:buttonText, 
                                                                                    onChange: onChange,
                                                                                    numColumns: self.numColumns,
                                                                                    separator: self.separator, 
                                                                                    columnWidth: self.columnWidth,
                                                                                    offset: offset
                                                                                });
                    
                    var multiselectContainer = multiselect.data('multiselect').container;
                    var optionsSelected = _.filter(self.buttonsData[key].options, function(optn) {return optn.selected;});
                    if (optionsSelected && optionsSelected.length) {
                        if (optionsSelected.length === self.buttonsData[key].options.length) {
                            $('button', multiselectContainer).addClass(self._selectedClassName); // multiselect
                        }
                        else {
                            $('button', multiselectContainer).addClass(self._partlySelectedClassName); // multiselect
                        }
                    }
                        
                    self.multiSelects.push(multiselect);
                    k++;
                }
                tot++;
            }
        },
        buttonRender: function() {
            var buttonData = this;
            var self = buttonData.self;
            var tmplData = {};
            
            if (buttonData.options)
            {
                tmplData.numId = self.numId;
                tmplData.uid = self.uid;
                tmplData.options = buttonData.options;
                self.numId++;
                return Mustache.render(self.dropdownTemplate, tmplData);
            }
            else
            {
                tmplData.index = buttonData.index;
                tmplData.value = buttonData.valueUnrendered;
                
                if (buttonData.selected)
                    tmplData.selected = " "+self._selectedClassName+" "; 
                
                if (self.tooltipsOnly){
                    
                    if ((buttonData.descLabel || buttonData.value) && self.tooltipValueSeparator){
                        if (buttonData.descLabel){
                            tmplData.descLabel = buttonData.descLabel.split(self.tooltipValueSeparator).join('<br/>');
                        } else {
                            tmplData.descLabel = buttonData.value.split(self.tooltipValueSeparator).join('<br/>');  
                        }                       
                    } else {
                        if (buttonData.descLabel){
                            tmplData.descLabel = buttonData.descLabel || "";
                        } else {
                            tmplData.descLabel = buttonData.value || "";    
                        }                       
                    }
                    return Mustache.render(self.buttonTemplate2, tmplData);
                } else {
                    tmplData.valueLabel = buttonData.value;
                     return Mustache.render(self.buttonTemplate, tmplData);
                }
            }
        },

        update:function () {
            var self = this;
            if (self.sourceField.userChanged)
            {
                self.sourceField.userChanged = false;
                return;
            }
            // retrieve selection values
            _.each(self._sourceDataset.queryState.get('selections'), function (filter) {
                if (self.sourceField.field == filter.field)
                {
                    self.sourceField.list = filter.list;
                    self.sourceField.term = filter.term;
                }
            });
            var valueList = this.computeUserChoices(self.sourceField);
            
            var records = self._sourceDataset.getRecords();
            if (records && self.sourceField.list && records.length == self.sourceField.list.length && !self.noAllButton)
            {
                // just select button "All"
                self.el.find('div.btn-toolbar button.AllButton').addClass(self._selectedClassName);
            }
            else
            {
                self.el.find('div.btn-toolbar button').not('.select-all-button').each(function () {
                    if (!$(this).hasClass("dropdown-toggle"))
                    {
                        if (!_.contains(valueList, $(this).attr("val")))
                        {
                            $(this).removeClass(self._selectedClassName);
                            valueList = _.without(valueList, $(this).attr("val"));
                        }
                        else 
                        {
                            $(this).addClass(self._selectedClassName);
                            valueList = _.without(valueList, $(this).attr("val"));
                        }
                    }
                });
                
                _.each(self.multiSelects, function ($select) {
                    var totOptions = $select.find("option");
                    _.each(totOptions, function(opt) {
                        if (!_.contains(valueList, $(opt).val()))
                            $(opt).removeAttr("selected");
                        else 
                        {
                            $(opt).attr("selected", "selected");
                            valueList = _.without(valueList, $(opt).val());
                        }
                        // update selection of drop-down buttons
                        var multiselectContainer = $select.data('multiselect').container;
                        if ($select.find('option:selected').length) {
                            if ($select.find('option:selected').length === totOptions.length) {
                                $('button', multiselectContainer).removeClass(self._partlySelectedClassName).addClass(self._selectedClassName);  // multiselect
                            }
                            else {
                                $('button', multiselectContainer).addClass(self._partlySelectedClassName);  // multiselect
                            }
                        }
                        else {
                            $('button', multiselectContainer).removeClass(self._selectedClassName).removeClass(self._partlySelectedClassName); // multiselect
                        }
                    });
                });
            }
        },

        computeUserChoices:function (sourceField) {
            var valueList = sourceField.list;
            if ((typeof valueList == "undefined" || valueList == null) && sourceField.term)
                valueList = [sourceField.term];

            return valueList;
        },

        onButtonsetClicked:function (e) {
            var self = this;
            e.preventDefault();
            var $target = $(e.currentTarget);
            if (!$target.hasClass(self._selectedClassName) && self.exclusiveButtonValue)
            {
                if (self.exclusiveButtonValue == $target.attr("val"))
                {
                    // pressed ALL button. Deselect everything else
                    // 1: deselect all non-dropdown buttons
                    self.el.find('div.btn-toolbar button.' + self._selectedClassName).not('.select-all-button').each(function () {
                        if (!$(this).hasClass("dropdown-toggle"))
                            $(this).removeClass(self._selectedClassName);
                    });
                    // 2: deselect all dropdown buttons and options
                    _.each(self.multiSelects, function ($select) {
                        _.each($select.find("option[selected='selected']"), function(opt) {
                            $(opt).removeAttr("selected"); // deselect options
                        });
                        // deselect buttons
                        var multiselectContainer = $select.data('multiselect').container;
                        _.each(multiselectContainer.find("button."+self._selectedClassName), function(btn) { // multiselect
                            $(btn).removeClass(self._selectedClassName); // multiselect
                        });
                        _.each(multiselectContainer.find("button."+self._partlySelectedClassName), function(btn) { // multiselect
                            $(btn).removeClass(self._partlySelectedClassName); // multiselect
                        });
                        // erase all options strings left inside main dropdown button
                        $select.multiselect("refresh");
                    });
                }
                else
                {
                    // pressed a normal button. Deselect ALL button
                    $target.parent().find("button.grouped-button[val='"+self.exclusiveButtonValue+"']").removeClass(self._selectedClassName);
                }
            }
            
            $target.toggleClass(self._selectedClassName);
            var listaValori = this.getAllSelections();
            if (this.nullSelectionNotAllowed && !listaValori.length) {
                $target.toggleClass(self._selectedClassName);
            }
            else {
                this.handleChangedSelections();
            }
        },
        
        onDropdownSelectAll: function(e) {
            var self = this;
            self.hasValueChanges =  true;
            var $target = $(e.currentTarget);
            var multiselect = $target.parent().prev('select');
            var multiselectContainer = multiselect.data('multiselect').container;
            var totSelectedObjs = multiselect.find("[selected='selected']");
            var totObjs = multiselect.find("option");
            if ((totSelectedObjs.length > 0 && totObjs.length > totSelectedObjs.length) || !$target.hasClass(self._selectedClassName)) // multiselect
            {
                // select all
                _.each(totObjs, function(opt) {
                    $(opt).attr("selected", "selected");
                    multiselect.data('multiselect').selectAllLevel0Options();
                });
                $('button', multiselectContainer).removeClass(self._partlySelectedClassName).addClass(self._selectedClassName); // multiselect
            }
            else
            {
                if (this.nullSelectionNotAllowed && this.getAllSelections().length === totSelectedObjs.length)
                    return;
                    
                // deselect all
                _.each(totObjs, function(opt) { 
                    $(opt).removeAttr("selected"); 
                    multiselect.data('multiselect').deselectAllLevel0Options();
                });
                $('button', multiselectContainer).removeClass(self._selectedClassName).removeClass(self._partlySelectedClassName); // multiselect         
            }
            multiselect.multiselect("refresh");
            self.handleChangedSelections(true);
        },
        
        handleChangedSelections:function(deselectExclusiveButton) {
            var self = this;
            $(document).off("click.dropdownbtn");
            self.documentClickAssigned = false;
            // close all open menus
            $("div.btn-toolbar .btngroup-multiselect.open").removeClass("open");
            
            if (deselectExclusiveButton)
                self.el.find("div.btn-toolbar button.grouped-button[val='"+self.exclusiveButtonValue+"']").removeClass(self._selectedClassName);
                        
            var listaValori = this.getAllSelections();
            
            var res = [];
            _.each(listaValori, function(valore) {
                res.push(self.getRecordByValue(valore));
            });

            self.hasValueChanges =  false;
            self.sourceField.userChanged = true;
            self.sourceField.list = listaValori;
            var actions = self.options.actions;
            actions.forEach(function(currAction){
                currAction.action.doAction(res, currAction.mapping);
            });
        },
        getDropdownSelections:function() {
            var self = this;
            var listaValori = [];
            _.each(self.multiSelects, function ($select) {
                _.each($select.find("option[selected='selected']"), function(opt) {
                    listaValori.push($(opt).val());
                });
            });
            return listaValori;
        },
        getAllSelections: function() {
            var listaValori = [];
            this.el.find('div.btn-toolbar button.' + this._selectedClassName).not('.select-all-button').each(function (obj) {
                if (!$(this).hasClass("dropdown-toggle"))
                    listaValori.push($(this).attr('val').valueOf()); // in case there's a date, convert it with valueOf
            });
            if (listaValori.length == 1 && listaValori[0] == "All")
                listaValori = this.allValues;
            else listaValori = listaValori.concat(this.getDropdownSelections());
            
            return listaValori;
        },
        getRecordByValue:function(val) {
            var self = this;
            if (self.buttonsData[val])
                return self.buttonsData[val].record;
            else if (self.separator)
            {
                var levelValues = val.split(self.separator, 2);
                if (self.buttonsData[levelValues[0]])
                {
                    var correctOpt = _.find(self.buttonsData[levelValues[0]].options, function (opt) { return opt.fullValue == val; }); 
                    if (correctOpt)
                        return correctOpt.record; 
                }
            }
            return null;
        }
    });

});
