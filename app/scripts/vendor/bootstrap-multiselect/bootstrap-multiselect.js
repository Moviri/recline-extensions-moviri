/**
 * bootstrap-multiselect.js 1.0.0
 * https://github.com/davidstutz/bootstrap-multiselect
 *
 * Copyright 2012 David Stutz
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
!function ($) {

    "use strict"; // jshint ;_;

    if(typeof ko != 'undefined' && ko.bindingHandlers && !ko.bindingHandlers.multiselect){
        ko.bindingHandlers.multiselect = {
            init: function (element) {
                var ms = $(element).data('multiselect');

                if(!ms)
                    throw new Error("Bootstrap-multiselect's multiselect() has to be called on element before applying the Knockout View model!");

                var prev = ms.options.onChange;

                ms.options.onChange = function(option, checked){
                    // We dont want to refresh the multiselect since it would delete / recreate all items
                    $(element).data('blockRefresh', true);

                    // Force the binding to be updated by triggering the change event on the select element
                    $(element).trigger('change');

                    // Call any defined change handler
                    return prev(option, checked);
                }
            },
            update: function (element) {
                var blockRefresh = $(element).data('blockRefresh') || false;
                if (!blockRefresh) { $(element).multiselect("refresh"); }
                $.data(element, 'blockRefresh', false);
            }
        };
    }

    function Multiselect(select, options) {
        var self = this;

        this.options = this.getOptions(options);
        this.select = $(select);

        this.container = $(this.options.buttonContainer)
            .append('<button type="button" class="'+ this.options.buttonClassFirst +' select-all-button"></button><button type="button" class="dropdown-toggle ' + this.options.buttonClass + '" data-toggle="dropdown"><b class="caret"></b></button>')
            .append('<ul class="dropdown-menu"></ul>');
        
        if (this.options.numColumns) {
            var columnWidth = this.options.columnWidth || 250;
            $('ul', this.container).css({
                'width': (columnWidth*this.options.numColumns)+'px',
                'overflow': 'hidden',
            });
            if (this.options.offset) {
                $('ul', this.container).css("left", this.options.offset+"px");
            }
        }
        // Set max height of dropdown menu to activate auto scrollbar.
        else if (this.options.maxHeight) {
            $('ul', this.container).css({
                'max-height': this.options.maxHeight + 'px',
                'overflow-x': 'hidden',
                'overflow-y': 'auto',
            });
        }

        // Manually add the multiple attribute, if its not already set.
        if (!this.select.attr('multiple')) {
            this.select.attr('multiple', true);
        }
        var allOptions = this.select.find("option");
        if (this.options.numColumns) {
            var c;
            var columnIndexStartEnd = [];
            var groupVals = [];
            var portionSize = Math.ceil(allOptions.length/this.options.numColumns);
            if (this.options.separator) {
                var lastGroup;
                var groupIdx = 0;

                var addGroupValue = function(idx, val) {
                    if (idx === groupVals.length) {
                        groupVals.push([]);
                    }
                    groupVals[idx].push(val);
                };
                var totItemsInColumn = 0;
                var lastItemNum = 0;

                allOptions.each(function(i, element) {
                    var currText = $(element).text();
                    var currGroup = "";
                    if (currText.indexOf(self.options.separator)) {
                        var nameParts = currText.split(".");
                        currGroup = nameParts[0];
                        currText = nameParts.slice(1, nameParts.length).join(self.options.separator);
                    }
                    if (lastGroup !== currGroup && lastGroup) {
                        self.select.find("option[data-group='"+lastGroup+"']").attr("data-group-count", groupVals[groupIdx].length);
                        groupIdx++;
                        if (totItemsInColumn >= portionSize) {
                            columnIndexStartEnd.push({start: lastItemNum, end: lastItemNum + totItemsInColumn});
                            lastItemNum += totItemsInColumn;
                            totItemsInColumn = 0;
                        }
                    }
                    addGroupValue(groupIdx, $(element).val());

                    $(element).attr("data-group", currGroup);
                    $(element).attr("data-group-index", groupIdx);
                    $(element).attr("data-text", currText);
                    totItemsInColumn++;
                    lastGroup = currGroup;
                });
                if (columnIndexStartEnd.length < this.options.numColumns) {
                    columnIndexStartEnd.push({start: lastItemNum, end: allOptions.length});
                }
            }
            else {
                // no separator? split in equal parts
                for (c = 0; c < this.options.numColumns; c++) {
                    columnIndexStartEnd.push({start: c*portionSize, end: Math.min((c+1)*portionSize, allOptions.length)});
                }
            }
            // update button text now that all sub-groups have been created and assigned to select options
            this.container.find("button.select-all-button").html(this.options.buttonText($('option:selected', select)));
            this.columnIndexStartEnd = columnIndexStartEnd;
            this.groupVals = groupVals;

            var $dropdownMenu = this.container.find("ul.dropdown-menu");
            for (c = 0; c < this.options.numColumns; c++) {
                $dropdownMenu.append("<li class='li-column'><ul class='container-column column"+c+"'></ul></li>");
                this.buildDrowdown(select, this.options, columnIndexStartEnd[c].start, columnIndexStartEnd[c].end, this.container.find(".container-column.column"+c).parent(), groupVals);
            }
        }
        else {
            this.container.find("button.select-all-button").html(this.options.buttonText($('option:selected', select)));
            this.buildDrowdown(select, this.options, 0, allOptions.length);
        }
        this.select
            .hide()
            .after(this.container);
    }

    Multiselect.prototype = {
        selectAllLevel0Options: function() {
            $('ul li.li-level0 input[type="checkbox"]', this.container).each(function(i, inputLev0) {
                $(inputLev0).attr('selected', 'selected').prop('selected', 'selected').attr('checked', 'checked').prop('checked', 'checked');
            });
        },
        deselectAllLevel0Options: function() {
            $('ul li.li-level0 input[type="checkbox"]', this.container).each(function(i, inputLev0) {
                $(inputLev0).attr('selected', 'selected').removeAttr('selected').removeAttr('checked');
            });
        },
        selectLevel0OptionIfNeeded: function($targetContainer, currGroup, $targetLevel0Parent) {
            // if all level1 options have been selected, force selection of level 0 parent option
            if (!$targetLevel0Parent) {
                $targetLevel0Parent = $targetContainer.find('li.li-level0 input[data-group="'+currGroup+'"]');
            }
            var $totChildOptions = $targetContainer.find('li.li-level1 input[data-group="'+currGroup+'"]');
            var $selectedChildOptions = $targetContainer.find('li.active.li-level1 input[data-group="'+currGroup+'"]');
            if ($selectedChildOptions.length === $totChildOptions.length) {
                $targetLevel0Parent.attr('selected', 'selected');
                $targetLevel0Parent.prop('selected', 'selected');
                $targetLevel0Parent.attr('checked', 'checked');
                $targetLevel0Parent.prop('checked', 'checked');
            }
        },
        buildDrowdown: function(select, options, start, end, container, groupVals){
            var self = this;
            if (!container) {
                container = this.container;
            }

            var lastGroup; // holds name of last group (used AFTER creation of level1 to select checkbox of level 0 if needed)
            var currGroupIdx = -1;
            var lastGroupIdx = -1;
            var newlevel0Created = false;
            var lastItemIdx = end-start-1;
            // Build the dropdown.
            $('option', this.select).slice(start, end).each($.proxy(function(index, element) {
                if ($(element).is(':selected')) {
                    $(element).attr('selected', 'selected');
                    $(element).prop('selected', 'selected');
                }
                var currText = $(element).text();
                var currGroup = $(element).attr("data-group");
                if (!lastGroup) {
                    lastGroup = currGroup;
                }
                if ($(element).attr("data-group-index")) {
                    currText = $(element).attr("data-text");
                    currGroupIdx = $(element).attr("data-group-index");
                    if (currGroupIdx !== lastGroupIdx) {
                        newlevel0Created = true;
                        $('ul', container).append('<li class="li-level0"><a href="javascript:void(0);" style="padding:0;"><label style="margin:0;padding:0px 0px 0px 5px;width:100%;height:100%;cursor:pointer"><input style="margin-bottom:5px;" type="checkbox" data-group="'+currGroup+'" value="' + groupVals[currGroupIdx] + '" /> ' + currGroup + '</label</a></li>');
                        lastGroupIdx = currGroupIdx;
                    }
                }

                $('ul', container).append('<li class="li-level1"><a href="javascript:void(0);" style="padding:0;"><label style="margin:0;padding:0px 0px 0px 5px;width:100%;height:100%;cursor:pointer;"><input style="margin-bottom:5px;" type="checkbox" data-group="'+currGroup+'" value="' + $(element).val() + '" /> ' + currText + '</label</a></li>');

                var selected = $(element).prop('selected') || false;
                var checkbox = $('ul li input[value="' + $(element).val() + '"]', container);

                checkbox.prop('checked', selected);

                if (selected) {
                    checkbox.parents('li').addClass('active');
                }
                if (newlevel0Created) {
                    newlevel0Created = false;
                    self.selectLevel0OptionIfNeeded(container.find("ul.container-column"), lastGroup);
                    lastGroup = currGroup;
                }
                else if (index === lastItemIdx) {
                    self.selectLevel0OptionIfNeeded(container.find("ul.container-column"), currGroup);
                }
            }, this));

            // Bind the change event on the level0 elements.
            $('ul li.li-level0 input[type="checkbox"]', container).off().on('change', function(ev, a, b, c) {
                var $target = $(ev.target);
                var checked = $target.prop('checked') || false;
                var values = $target.val().split(",");
                for (var j in values) {
                    var $targetChild = $target.parents('ul.container-column').find('li.li-level1 input[value="'+values[j]+'"]');
                    var childChecked = $targetChild.prop('checked') || false;
                    if (childChecked != checked) {
                        // simulate a mouse click on the child checkbox so that all level1 events are correctly called
                        var clickEvent = new MouseEvent('click', {
                            'view': window,
                            'bubbles': true,
                            'cancelable': true
                        });
                        $targetChild[0].dispatchEvent(clickEvent); 
                    }
                }
            });


            // Bind the change event on level1 elements and proxy them to dropdown elements.
            $('ul li.li-level1 input[type="checkbox"]', container).off().on('change', $.proxy(function(event) {
                var $target = $(event.target);
                var currGroup = $target.attr("data-group");
                var $targetContainer = $target.parents('ul.container-column');
                var $targetLevel0Parent = $targetContainer.find('li.li-level0 input[data-group="'+currGroup+'"]');
                var checked = $target.prop('checked') || false;

                if (checked) {
                    $target.parents('li').addClass('active');
                    self.selectLevel0OptionIfNeeded($targetContainer, currGroup, $targetLevel0Parent);
                }
                else {
                    $(event.target).parents('li').removeClass('active');
                    // since we deselected a level1 options, force deselection of level 0 parent option
                    $targetLevel0Parent.removeAttr('selected');
                    $targetLevel0Parent.removeAttr('checked');
                }

                var option = $('option[value="' + $target.val() + '"]', this.select);

                if (checked) {
                    option.attr('selected', 'selected');
                    option.prop('selected', 'selected');
                }
                else {
                    option.removeAttr('selected');
                }
                
                var options = $('option:selected', this.select);
                $('button.select-all-button', self.container).html(this.options.buttonText(options));

                this.options.onChange(option, checked);
            }, this));

            $('ul li a', container).on('click', function(event) {
                event.stopPropagation();
            });
        },
        
        defaults: {
            // Default text function will either print 'None selected' in case no option is selected,
            // or a list of the selected options up to a length of 3 selected options.
            // If more than 3 options are selected, the number of selected options is printed.
            buttonText: function(options) {
                if (options.length == 0) {
                    return 'None selected <b class="caret"></b>';
                }
                else if (options.length > 3) {
                    return options.length + ' selected <b class="caret"></b>';
                }
                else {
                    var selected = '';
                    options.each(function() {
                        selected += $(this).text() + ', ';
                    });
                    return selected.substr(0, selected.length -2) + ' <b class="caret"></b>';
                }
            },
            // Is triggered on change of the selected options.
            onChange: function() {

            },
            buttonClass: 'btn',
            buttonWidth: 'auto',
            //buttonContainer: '<div class="btn-group" />',
            buttonContainer: '<span class="btn-group btn-group-multiselect"/>',
            // Maximum height of thet dropdown menu.
            // If maximum height is exceeded a scrollbar will be displayed.
            maxHeight: 400,
        },

        constructor: Multiselect,

        // Destroy - unbind - the plugin.
        destroy: function() {
            this.container.remove();
            this.select.show();
        },

        // Refreshs the checked options based on the current state of the select.
        refresh: function() {
            $('option', this.select).each($.proxy(function(index, element) {
                if ($(element).is(':selected')) {
                    $('ul li input[value="' + $(element).val() + '"]', this.container).prop('checked', true);
                    $('ul li input[value="' + $(element).val() + '"]', this.container).parents('li').addClass('active');
                }
                else {
                    $('ul li input[value="' + $(element).val() + '"]', this.container).prop('checked', false);
                    $('ul li input[value="' + $(element).val() + '"]', this.container).parents('li').removeClass('active');
                }
            }, this));

            $('button.select-all-button', this.container).html(this.options.buttonText($('option:selected', this.select)));
        },

		rebuild: function() {
			$('ul', this.container).html('');
            if (this.options.numColumns) {
                var $dropdownMenu = this.container.find("ul.dropdown-menu");
                for (var c = 0; c < this.options.numColumns; c++) {
                    $dropdownMenu.append("<li class='li-column'><ul class='container-column column"+c+"'></ul></li>");
                    this.buildDrowdown(this.select, this.options, this.columnIndexStartEnd[c].start, this.columnIndexStartEnd[c].end, this.container.find(".container-column.column"+c).parent(), this.groupVals);
                }

            }
            else {
                var allOptions = this.select.find("option");
                this.buildDrowdown(this.select, this.options, 0, allOptions.length);
            }
		},

        // Get options by merging defaults and given options.
        getOptions: function(options) {
            return $.extend({}, this.defaults, options);
        },


    };

    $.fn.multiselect = function (option) {
        return this.each(function () {
            var data = $(this).data('multiselect'),
                options = typeof option == 'object' && option;

            if (!data) {
                $(this).data('multiselect', (data = new Multiselect(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    }
}(window.jQuery);
