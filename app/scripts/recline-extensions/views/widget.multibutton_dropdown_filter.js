/* global define */
/*jshint multistr: true */
define(['backbone', 'REM/recline-extensions/recline-extensions-amd', 'mustache', 'underscore', 
        'REM/vendor/bootstrap-multiselect/bootstrap-multiselect', 'REM/recline-extensions/views/view.alertMessages'],
  function (Backbone, recline, Mustache, _) {
    
    recline.View = recline.View || {};

    var my = recline.View;

    my.MultiButtonDropdownFilter = Backbone.View.extend({
        template: '<div class="btn-toolbar"> \
                        <div class="btn-group data-control-id"> \
                        {{^noAllButton}} \
                            <button type="button" class="btn btn-mini grouped-button AllButton {{allButtonSelectedClass}}" val="All">All</button> \
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
        DUPE_KEY_SUFFIX: '_$%_',
        GENERIC_GROUP_NAME: "##GENERIC##",
        GENERIC_GROUP_DROPDOWN_LABEL: "Others",
        useExtraDropdownForGenericValues: false,
        _sourceDataset:null,
        _selectedClassName:"btn-primary", // use bootstrap ready-for-use classes to highlight list item selection (avail classes are success, warning, info & error)
        _partlySelectedClassName:"btn-info",
        hasValueChanges: false,
        documentClickAssigned: false,
        maxSelectionLimit: 1000000,
        initialize:function (args) {
            this.el = $(this.el);
            this.options = args;
            _.bindAll(this, 'render', 'update', 'onButtonsetClicked', 'getDropdownSelections', 'getAllSelections', 'getRecordByValue', 'handleChangedSelections', 'onDropdownSelectAll', 'showSelectionLimitReachedAlert', 'removeSelectionLimitReachedAlert');

            this._sourceDataset = args.sourceDataset;
            this.uid = args.id || Math.floor(Math.random() * 100000); // unique id of the view containing all filters
            this.numId = 0; // auto-increasing id used for a single filter

            this.sourceField = args.sourceField;
            this.nullSelectionNotAllowed = args.nullSelectionNotAllowed;
            this._actions = args.actions;
            this.noAllButton = args.sourceField.noAllButton || false;
            this.allButtonRemovesFilter = args.sourceField.allButtonRemovesFilter || false;
            this.exclusiveButtonValue = args.sourceField.exclusiveButtonValue || (!this.noAllButton && !this.allButtonRemovesFilter ? "All" : undefined);
            this.separator = this.sourceField.separator;
            this.numColumns = args.numColumns;
            this.columnWidth = args.columnWidth;
            this.tooltipsOnly = args.tooltipsOnly;
            this.buttonTextMaxItems = args.buttonTextMaxItems || 4;
            this.buttonTextMaxChars = args.buttonTextMaxChars;
            this.tooltipValueSeparator = args.tooltipValueSeparator;
            this.tooltipButtonLabelField = args.tooltipButtonLabelField;
            this.tooltipButtonDescriptionField = args.tooltipButtonDescriptionField;
            this.maxButtonsThreshold = args.maxButtonsThreshold || -1;
            this.maxItemsInExtraDropDown = args.maxItemsInExtraDropDown || 1000000;
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
            if (args.maxSelectionLimit) {
                this.maxSelectionLimit = args.maxSelectionLimit;
            }
            if (args.alertMessageContainer) {
                this.alertMessageContainer = args.alertMessageContainer;
                this.alertMessageView = new recline.View.AlertMessageView({
                    container: this.alertMessageContainer,
                    allowMultiple: false,
                    timeout: 5000
                });
                this.selectionLimitReachedMsg = "Unable to select more filters. Limit reached: "+ this.maxSelectionLimit;
            }

            this.multiSelects = [];
        },
        showSelectionLimitReachedAlert: function() {
            // cannot allow another selection. Ignore it and show error message
            if (this.alertMessageContainer) {
                this.alertMessageView.showMessage(this.selectionLimitReachedMsg, "info");
            }
            else {
                console.log(this.selectionLimitReachedMsg);
            }
        },
        removeSelectionLimitReachedAlert: function() {
            if (this.alertMessageContainer) {
                this.alertMessageView.removeMessageFromQueue(this.selectionLimitReachedMsg, undefined, true);
            }
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
            var records = self._sourceDataset.getRecords();
            // filter out invalid fields with null values
            if (records && records.length) {
                records = _.filter(records, function(currRec) {
                    return currRec.get(self.sourceField.field);
                });
            }

            var field = this._sourceDataset.fields.get(this.sourceField.field);
            var extraDropdownLabels = [];
            if(field) {
                var fieldId = field.get("id")

                // sort all values or they will not be sorted in extraDropdowns
                records = _.sortBy(records, function(obj) {
                    return obj.get(fieldId);
                });

                if (this.maxButtonsThreshold > 0 && records.length > 0) {
                    // perform prescan of all records to count total number of top-level buttons
                    var grouped = _.groupBy(records, function(rec) {
                        var value = rec.get(fieldId);
                        if (value) {
                            if (value.indexOf(self.separator) < 0) {
                                return self.GENERIC_GROUP_NAME;
                            }
                            else {
                                return value.split(self.separator)[0];
                            }
                        }
                    });
                    this.useExtraDropdownForGenericValues = false;
                    if (grouped && grouped[ self.GENERIC_GROUP_NAME] && grouped[ self.GENERIC_GROUP_NAME].length > this.maxButtonsThreshold) {
                        this.useExtraDropdownForGenericValues = true;
                        var allGroupedGenericValues = _.map(grouped[ self.GENERIC_GROUP_NAME], function(obj) {
                            return obj.get(fieldId);
                        });
                        var totExtraDropdowns = Math.floor(allGroupedGenericValues.length / self.maxItemsInExtraDropDown) + 1;
                        for (var idx = 0; idx < totExtraDropdowns; idx ++) {
                            var firstLetter;
                            var lastLetter;
                            if (idx === 0) {
                                firstLetter = "A";
                            }
                            else {
                                firstLetter = records[idx * self.maxItemsInExtraDropDown].get(fieldId)[0];
                            }
                            if (idx === totExtraDropdowns - 1) {
                                lastLetter = "Z";
                            }
                            else {
                                lastLetter = records[(idx + 1) * self.maxItemsInExtraDropDown - 1].get(fieldId)[0];
                            }
                            extraDropdownLabels.push(self.GENERIC_GROUP_DROPDOWN_LABEL + " "+firstLetter+"-"+lastLetter);
                        }
                    }
                }
            }
            else if (this._sourceDataset.fields.length) {
                throw "widget.multibutton_dropdown_filter: unable to find field ["+this.sourceField.field+"] in dataset";
            }

            self.buttonsData = {};
            var allButtonSelected;
            if (!this.allButtonRemovesFilter) {
                allButtonSelected = (records && self.sourceField.list && records.length == self.sourceField.list.length && !self.noAllButton);
            }
            else {
                allButtonSelected = (!self.sourceField.list || self.sourceField.list.length == 0 || (self.sourceField.list.length == 1 && self.sourceField.list[0] === "_ALL_") && !self.noAllButton);   
            }
            tmplData.allButtonSelectedClass = (allButtonSelected ? this._selectedClassName : "")
            
            var totItemsInExtraDropdown = 0;
            var alreadyInsertedValues = [];
            _.each(records, function(record, index) {
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
                            self.buttonsData[levelValues[0]].options.push({fullValue: fullLevelValue, value: levelValues[1], record: record, selected: !allButtonSelected && _.contains(self.sourceField.list, fullLevelValue), index: indexLabel, descLabel: descLabel});
                        else {
                            // handle special case in which it exists both CALLER_PIPPO and CALLER_PIPPO.SUB1 and they must be SEPARATE callers
                            if (self.buttonsData[levelValues[0]] && !self.buttonsData[levelValues[0]].options) {
                                // a BUTTON (not dropdown) already exists with this name. Move it to a different key
                                self.buttonsData[levelValues[0]+self.DUPE_KEY_SUFFIX] = self.buttonsData[levelValues[0]];
                            }
                            self.buttonsData[levelValues[0]] = { self: self, options: [{fullValue: fullLevelValue, value: levelValues[1], record: record, selected: !allButtonSelected && _.contains(self.sourceField.list, fullLevelValue), index: indexLabel, descLabel: descLabel}]};
                        }
                    }
                    else if (self.useExtraDropdownForGenericValues && valueUnrendered != self.exclusiveButtonValue) {
                        // Must create dropdown "Others" or "Others 2" or "Others 3" (and so on) to ensure each extraDropdown has at most maxItemsInExtraDropDown items
                        var currDropdownKey = self.GENERIC_GROUP_DROPDOWN_LABEL;
                        var extraDropdownIndex = 1 + Math.floor(totItemsInExtraDropdown / self.maxItemsInExtraDropDown);
                        if (extraDropdownIndex > 1) {
                            currDropdownKey = currDropdownKey + " " + extraDropdownIndex;
                        }
                        if (self.buttonsData[currDropdownKey] && self.buttonsData[currDropdownKey].options) {
                            self.buttonsData[currDropdownKey].options.push({fullValue: fullLevelValue, value: fullLevelValue, record: record, selected: !allButtonSelected && _.contains(self.sourceField.list, fullLevelValue), index: indexLabel, descLabel: descLabel});
                        }
                        else {
                            self.buttonsData[currDropdownKey] = { self: self, genericExtraGroup: extraDropdownIndex, options: [{fullValue: fullLevelValue, value: fullLevelValue, record: record, selected: !allButtonSelected && _.contains(self.sourceField.list, fullLevelValue), index: indexLabel, descLabel: descLabel}]};
                        }
                        // contruct a button label like "Others A-Z", depending on contained items
                        self.buttonsData[currDropdownKey]._buttonLabel = self.GENERIC_GROUP_DROPDOWN_LABEL + " " + self.buttonsData[currDropdownKey].options[0].fullValue[0] + "-" + self.buttonsData[currDropdownKey].options[totItemsInExtraDropdown % self.maxItemsInExtraDropDown].fullValue[0];
                        totItemsInExtraDropdown++;
                    }
                    else
                    {
                        self.buttonsData[valueUnrendered] = { value: fullLevelValue, valueUnrendered: valueUnrendered, record: record, selected: !allButtonSelected && _.contains(self.sourceField.list, valueUnrendered), self: self, index: indexLabel, descLabel: descLabel };
                    }
                    alreadyInsertedValues.push(fullLevelValue);
                }
            });
            self.allValues = alreadyInsertedValues;

             // transform to array
            tmplData.buttonsData = _.map(self.buttonsData, function(obj, key){
                obj.__mainKey = key;
                return obj; 
            });
            
            _.each(tmplData.buttonsData, function(tbd) {
                if (tbd.options) {
                    tbd.options = _.sortBy(tbd.options, function(opt) { 
                        return opt.value;
                    });
                }
            });
            
            // ensure buttons with multiple options are moved to the end of the control toolbar to safeguard look & feel  
            tmplData.buttonsData = _.sortBy(tmplData.buttonsData, function(obj) { 
                if (obj.options) {
                    if (obj.genericExtraGroup) {
                        return 1+obj.genericExtraGroup;
                    }
                    else {
                        return 1;
                    }
                }
                else
                {
                    if (self.exclusiveButtonValue && self.exclusiveButtonValue == obj.valueUnrendered) // if ALL button present, put to the extreme left
                        return -1;
                    else return 0;
                }
            });
            // ensure self.buttonsData is aligned too!
            _.each(tmplData.buttonsData, function(obj, index) {
                self.buttonsData[obj.__mainKey].orderId = index;
            })

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
                    if (self.buttonTextMaxChars !== undefined) {
                        selected = selectedItems.join(", ");
                        if (selected.length > self.buttonTextMaxChars) {
                            selected = selected.substring(0, self.buttonTextMaxChars)+' ('+selectedItems.length+')';
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
                self.hasValueChanges = true;
                var multiselect = element.parent();
                var multiselectObj = multiselect.data('multiselect');
                var multiselectContainer = multiselectObj.container;
                var totSelectedObjs = element.parent().find("[selected='selected']");
                var totObjs = element.parent().find("option");
                if (totSelectedObjs.length) {
                    if (totSelectedObjs.length < totObjs.length) {
                        var listaValori2 = self.getAllSelections();
                        if (checked && listaValori2.length > self.maxSelectionLimit) {
                            self.hasValueChanges = false;
                            self.showSelectionLimitReachedAlert();
                            // remove last selection if limit reached
                            element.removeAttr("selected");
                            var checkBoxObjs = _.filter($("input[type='checkbox']", multiselectContainer), function(obj) {return $(obj).attr("value") == element.val(); });
                            if (checkBoxObjs && checkBoxObjs.length) {
                                $(checkBoxObjs[0]).removeAttr("checked");
                                // there are two levels of checkboxes and both must be disabled and GUI control will go out of sync with actual values
                                if (checkBoxObjs.length > 0) {
                                    $(checkBoxObjs[1]).removeAttr("checked");
                                }
                            }
                            var buttonHtml2 = multiselectObj.options.buttonText($("option:selected", element.parent()));
                            $('button.select-all-button', multiselectContainer).html(buttonHtml2);
                        }
                        else {
                            $('button', multiselectContainer).addClass(self._partlySelectedClassName);  // multiselect
                        }
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
                            if (checkBoxObj) {
                                $(checkBoxObj).attr("checked", "checked");
                            }
                            var buttonHtml = multiselectObj.options.buttonText($("option:selected", element.parent()));
                            $('button.select-all-button', multiselectContainer).html(buttonHtml);
                        }
                    }
                    $('button', multiselectContainer).removeClass(self._selectedClassName).removeClass(self._partlySelectedClassName); // multiselect
                }
                if (!checked) {
                    var listaValori3 = self.getAllSelections();
                    if (listaValori3.length <= self.maxSelectionLimit) {
                        self.removeSelectionLimitReachedAlert();
                    }
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

            var totButtonData = _.keys(self.buttonsData).length;
            var lastObj = _.find(self.buttonsData, function(obj, key) { return obj.orderId === totButtonData - 1;});
            var lastKey = (lastObj ? lastObj.__mainKey : undefined);
            var firstObj = _.find(self.buttonsData, function(obj, key) { return obj.orderId === 0;});
            var firstKey =  (firstObj ? firstObj.__mainKey : undefined);
            var key;
            
            self.multiSelects = [];
            var totMultiselect = 0;
            var totButtons = 0;
            // count total number of multiselect before creating them
            for (key in self.buttonsData)
            {
                if (self.buttonsData[key].options) {
                    totMultiselect++;
                }
                else {
                    totButtons++;
                }
            }
            var k = 0; // index of current dropdown
            var jj = 0; // index of current extra dropdown
            for (var orderId = 0 ; orderId < totButtonData; orderId++)
            {
                var currObj = _.find(self.buttonsData, function(obj, key) { return obj.orderId === orderId;});
                key = currObj.__mainKey;
                if (self.buttonsData[key] && self.buttonsData[key].options)
                {
                    var offset = 0;
                    if (self.columnWidth && self.numColumns) {
                        // offset is:
                        if (totButtons > 2) {
                            var max = (self.columnWidth*(self.numColumns-1));
                            offset = - self.columnWidth - (self.multiSelects.length)/totMultiselect * max;
                        }
                        else {
                            // 0 for first dropdown
                            // (1-totCols)*columnSize for last dropdown
                            // an interpolated value for all middle dropdowns
                            var max = (self.columnWidth*(self.numColumns))+100;
                            offset = - (self.multiSelects.length)/totMultiselect * max;
                        }
                    }
                    var mainValue = key;
                    if (self.useExtraDropdownForGenericValues && key.indexOf(self.GENERIC_GROUP_DROPDOWN_LABEL) == 0 && jj < extraDropdownLabels.length) {
                        mainValue = extraDropdownLabels[jj];
                        jj++;
                    }
                    var multiselect = self.$el.find('#dropdown' + self.uid + '_' + k).multiselect({
                                                                                    mainValue: mainValue,
                                                                                    buttonClass:'btn btn-mini'+(key == lastKey ? ' btn-last' : ''),
                                                                                    buttonClassFirst:'btn btn-mini'+(key == firstKey && self.noAllButton ? ' btn-first' : ''),
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
                tmplData.options = _.sortBy(buttonData.options, function(opt) {
                    return opt.fullValue;
                });
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
            // filter out invalid fields with null values
            if (records && records.length) {
                records = _.filter(records, function(currRec) {
                    return currRec.get(self.sourceField.field);
                });
            }

            if (records && self.sourceField.list && records.length == self.sourceField.list.length && !self.noAllButton && !self.allButtonRemovesFilter)
            {
                // just select button "All"
                self.el.find('div.btn-toolbar button.AllButton').addClass(self._selectedClassName);
            }
            else if (records && self.sourceField.list && records.length && self.allButtonRemovesFilter && self.sourceField.list.length == 0) {
                // do nothing 
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
                        var currOptVal = $(opt).val();
                        if (currOptVal == "All") {
                            currOptVal = "_ALL_"
                        }
                        if (!_.contains(valueList, currOptVal))
                            $(opt).removeAttr("selected");
                        else 
                        {
                            $(opt).attr("selected", "selected");
                            valueList = _.without(valueList, currOptVal);
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
            if (!$target.hasClass(self._selectedClassName) && (self.exclusiveButtonValue || self.allButtonRemovesFilter))
            {
                if (self.exclusiveButtonValue == $target.attr("val") ||
                    self.allButtonRemovesFilter && $target.attr("val") == "All")
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
                        $select.data('multiselect').deselectAllLevel0Options();
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
            if (!$target.hasClass(self._selectedClassName)) {
                var listaValoriBefore = this.getAllSelections();
                if (listaValoriBefore.length >= this.maxSelectionLimit) {
                    this.showSelectionLimitReachedAlert();
                    return;
                }
            }
            $target.toggleClass(self._selectedClassName);
            var listaValori = this.getAllSelections();
            if (listaValori.length <= this.maxSelectionLimit) {
                this.removeSelectionLimitReachedAlert();
            }
            if (this.nullSelectionNotAllowed && !listaValori.length ) {
                $target.addClass(self._selectedClassName);
            }
            this.handleChangedSelections();
        },
        
        onDropdownSelectAll: function(e) {
            var self = this;
            self.hasValueChanges = true;
            var $target = $(e.currentTarget);
            var multiselect = $target.parent().prev('select');
            var multiselectContainer = multiselect.data('multiselect').container;
            var totSelectedObjs = multiselect.find("[selected='selected']");
            var totObjs = multiselect.find("option");
            if ((totSelectedObjs.length > 0 && totObjs.length > totSelectedObjs.length) || !$target.hasClass(self._selectedClassName)) // multiselect
            {
                var listaValori = self.getAllSelections();
                if (listaValori.length + (totObjs.length - totSelectedObjs.length) > this.maxSelectionLimit) {
                    this.showSelectionLimitReachedAlert();
                    return;
                }

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
            var listaValori2 = self.getAllSelections();
            if (listaValori2.length <= this.maxSelectionLimit) {
                this.removeSelectionLimitReachedAlert();
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
            
            if (deselectExclusiveButton) {
                self.el.find("div.btn-toolbar button.grouped-button[val='"+self.exclusiveButtonValue+"']").removeClass(self._selectedClassName);
                if (self.allButtonRemovesFilter) {
                    self.el.find("div.btn-toolbar button.grouped-button[val='All']").removeClass(self._selectedClassName);
                }
            }
                        
            var listaValori = this.getAllSelections();
            
            var res = [];
            _.each(listaValori, function(valore) {
                res.push(self.getRecordByValue(valore));
            });

            self.hasValueChanges = false;
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
            var $allButton = this.el.find("div.btn-toolbar button.grouped-button[val='All']");
            if (!this.allButtonRemovesFilter || !$allButton.hasClass(this._selectedClassName)) {
                if (listaValori.length == 1 && listaValori[0] == "All")
                    listaValori = this.allValues;
                else 
                    listaValori = listaValori.concat(this.getDropdownSelections());
            }
            else {
                if (listaValori.length == 1 && listaValori[0] == "All")
                    listaValori = [];
            }
            //console.log("Total selections: "+listaValori.length);
            return listaValori;
        },
        getRecordByValue:function(val) {
            var self = this;
            if (self.buttonsData[val] && self.buttonsData[val].record)
                return self.buttonsData[val].record;
            if (self.buttonsData[val+self.DUPE_KEY_SUFFIX] && self.buttonsData[val+self.DUPE_KEY_SUFFIX].record)
                return self.buttonsData[val+self.DUPE_KEY_SUFFIX].record;
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
            if (self.useExtraDropdownForGenericValues) {
                if (self.buttonsData[self.GENERIC_GROUP_DROPDOWN_LABEL]) {
                    var correctOpt = _.find(self.buttonsData[self.GENERIC_GROUP_DROPDOWN_LABEL].options, function (opt) { return opt.fullValue == val; }); 
                    if (correctOpt) {
                        return correctOpt.record;
                    }
                }
                for (var k = 0; k < 10; k++) {
                    var currDropdownKey = self.GENERIC_GROUP_DROPDOWN_LABEL + " " + k;
                    if (self.buttonsData[currDropdownKey]) {
                        var correctOpt = _.find(self.buttonsData[currDropdownKey].options, function (opt) { return opt.fullValue == val; }); 
                        if (correctOpt) {
                            return correctOpt.record;
                        }
                    }
                }
            }
            return null;
        }
    });

});
