/* global define, d3 */
define(['backbone', 'REM/recline-extensions/recline-extensions-amd', 'mustache', 'underscore', 'REM/vendor/datepicker/1.0.0/js/datepicker'], function (Backbone, recline, Mustache, _) {

    "use strict";

    recline.View = recline.View || {};

    var view = recline.View;

    view.DatePicker = Backbone.View.extend({

        template:'<div style="width: 230px;" id="datepicker-calendar-{{uid}}"></div>',
        fullyInitialized:false,
        maindateFromChanged:false,
        maindateToChanged:false,
        comparedateFromChanged:false,
        comparedateToChanged:false,
        initialize:function (options) {
            this.options = options;
            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw', 'redrawCompare', 'calculateMonday', 'calculateFirstDayOfMonth', 'calculateLastDayOfMonth');

            if (this.model) {
                this.model.bind('query:done', this.redraw);
                this.model.queryState.bind('selection:done', this.redraw);
            }
            else return;

            if (this.options.compareModel) {
                this.options.compareModel.bind('query:done', this.redrawCompare);
                this.options.compareModel.queryState.bind('selection:done', this.redrawCompare);
            }

            $(window).resize(this.resize);
            this.uid = options.id || (new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id

            var out = Mustache.render(this.template, this);
            this.el.html(out);
        },

        daterange:{
            yesterday:"day",
            lastweeks:"week",
            lastdays:"day",
            lastmonths:"month",
            lastquarters:"quarter",
            lastyears:"year",
            previousyear:"year",
            custom:"day"
        },

        onChange:function (view) {
            //console.log("on change")
            var exec = function (data, widget) {
                var value = [];
                var actions = view.getActionsForEvent("selection");
                if (actions.length > 0) {
                    //reference
                    var startDate_reference = new Date(parseInt(data.dr1from_millis, 10));
                    var endDate_reference = new Date(parseInt(data.dr1to_millis, 10));
                    var rangetype_reference = view.daterange[data.daterangePreset];

                    value = [
                        {field:"date_reference", value:[startDate_reference.toString(), endDate_reference.toString()]},
                        {field:"rangetype_reference", value:[rangetype_reference]}
                    ];

                    var rangetype_compare = rangetype_reference;
                    if (data.comparisonPreset != "previousperiod")
                        rangetype_compare = view.daterange[data.comparisonPreset];

                    if (data.comparisonEnabled) {
                        view.trigger("compare_disabled", false);
                        var startDate_compare = new Date(parseInt(data.dr2from_millis, 10));
                        var endDate_compare = new Date(parseInt(data.dr2to_millis, 10));
                        if (startDate_compare != null && endDate_compare != null) {
                            value.push({field:"date_compare", value:[startDate_compare.toString(), endDate_compare.toString()]});
                            value.push({field:"rangetype_compare", value:[rangetype_compare]});
                        }
                    }
                    else
                	{
                        view.trigger("compare_disabled", true);
//                    	// clear values for comparison dates or a redraw event may inadvertently restore them 
//                        $('.dr2.from', view.datepicker).val("");
//                        $('.dr2.to', view.datepicker).val("");
//                        $('.dr2.from_millis', view.datepicker).val("");
//                        $('.dr2.to_millis', view.datepicker).val("");
//                        var values = view.datepicker.data("DateRangesWidget").options.values;
//                        values.dr2from = null;
//                        values.dr2from_millis = null;
//                        values.dr2to = null;
//                        values.dr2to_millis = null;
//                        var datepickerOptions = $(".datepicker.selectableRange").data('datepicker')
//                        datepickerOptions.date = datepickerOptions.date.slice(0, 2) 
//                        $(".datepicker.selectableRange").data('datepicker', datepickerOptions)
                	}
                    view.doActions(actions, value);
                }


            };
            return exec;
        },

        doActions:function (actions, values) {

            _.each(actions, function (d) {
                d.action.doActionWithValues(values, d.mapping);
            });
        },

        render:function () {
            var self = this;
            var uid = this.uid;

            self.datepicker = $('#datepicker-calendar-' + uid).DateRangesWidget(
                {
                    aggregations:[],
                    values:{
                        comparisonEnabled:false,
                        daterangePreset:"lastweeks",
                        comparisonPreset:"previousperiod"
                    },
                    onChange:self.onChange(self)
                });

            self.redraw();
            self.redrawCompare();

            var weeklyMode = (self.options.weeklyMode ? true : false);
            var monthlyMode = (self.options.monthlyMode ? true : false);
            var persistentCompare = (self.options.persistentCompare ? true : false);
            if (weeklyMode || monthlyMode) {
                $('#datepicker-dropdown .daterange-preset').attr("disabled", "disabled");
                $('#datepicker-dropdown .comparison-preset').attr("disabled", "disabled");
            }
            else {
                $('#datepicker-dropdown .daterange-preset', self.datepicker).removeAttr("disabled");
                $('#datepicker-dropdown .comparison-preset', self.datepicker).removeAttr("disabled");
            }

            var options = $(".datepicker.selectableRange").data('datepicker');
            if (options) {
                options.weeklyMode = weeklyMode;
                options.monthlyMode = monthlyMode;
                options.persistentCompare = persistentCompare;
            }
            else {
                $(".datepicker.selectableRange").data('datepicker', 'weeklyMode', weeklyMode);
                $(".datepicker.selectableRange").data('datepicker', 'monthlyMode', monthlyMode);
                $(".datepicker.selectableRange").data('datepicker', 'persistentCompare', persistentCompare);
            }

            $("#datepicker-dropdown .enable-comparison").change(function(ev) {
                var $target = $(ev.target);
                if ($target.is(":checked")) {
                    $("#datepicker-dropdown .btn-group").css("margin-top", "0px");
                    $("#datepicker-dropdown .comparison-daterange").show();
                }
                else {
                    $("#datepicker-dropdown .comparison-daterange").hide();
                    $("#datepicker-dropdown .btn-group").css("margin-top", "30px");
                }
            });
        },

        redraw:function () {
            //console.log("Widget.datepicker: redraw");
            // todo must use dateranges methods
            if (!this.model || this.model == "undefined")
                return;

            if (this.options.weeklyMode || this.options.monthlyMode) {
                $('#datepicker-dropdown .daterange-preset').attr("disabled", "disabled");
            }
            else {
                $('#datepicker-dropdown .daterange-preset').removeAttr("disabled");
            }

            var self = this;
            var dates = $('.date-ranges-picker').DatePickerGetDate();
            if (dates) {
                var period = dates[0];

                var f = self.model.queryState.getFilterByFieldName(self.options.fields.date);
                if (f && f.type == "range") {
                    period[0] = new Date(f.start);
                    period[1] = new Date(f.stop);
                }
                f = self.model.queryState.getFilterByFieldName(self.options.fields.type);
                if (f && f.type == "term") {
                    // check custom weeks/month

                }

                var values = {};
                if (self.datepicker.data("DateRangesWidget") && self.datepicker.data("DateRangesWidget").options) {
                    values = self.datepicker.data("DateRangesWidget").options.values;
                }

                if (!period[0] || !period[1]) {
                    values.dr1from = "N/A";
                    values.dr1from_millis = "";
                    values.dr1to = "N/A";
                    values.dr1to_millis = "";
                }
                else {
                    values.daterangePreset = "custom";
                    values.dr1from = self.retrieveDateStr(period[0]);
                    values.dr1from_millis = (new Date(period[0])).getTime();
                    values.dr1to = self.retrieveDateStr(period[1]);
                    values.dr1to_millis = (new Date(period[1])).getTime();
                }


                $('.date-ranges-picker').DatePickerSetDate(period, true);

                if (values.dr1from && values.dr1to) {
                    $('span.main', self.datepicker).text(values.dr1from + ' - ' + values.dr1to);
                }
                $('.dr1.from', self.datepicker).val(values.dr1from);
                $('.dr1.to', self.datepicker).val(values.dr1to);
                $('.dr1.from_millis', self.datepicker).val(values.dr1from_millis);
                $('.dr1.to_millis', self.datepicker).val(values.dr1to_millis);


                if (!self.fullyInitialized) {
                    $('.dr1.from').bind("keypress", function (e) {
                        self.maindateFromChanged = true;
                    });
                    $('.dr1.to').bind("keypress", function (e) {
                        self.maindateToChanged = true;
                    });
                    $('.dr1.from').bind("blur", function (e) {
                        if (self.maindateFromChanged) {
                            if (self.options.weeklyMode) {
                                var monday = self.calculateMonday($(this).val());
                                var sunday = self.calculateSundayFromMonday(monday);
                                var mondayDateStr = self.retrieveDateStr(monday);
                                var sundayDateStr = self.retrieveDateStr(sunday);
                                $('.dr1.from').val(mondayDateStr);
                                $('.dr1.to').val(sundayDateStr);
                                self.applyTextInputDateChange(monday, mondayDateStr, self, true, true);
                                self.applyTextInputDateChange(sunday, sundayDateStr, self, true, false);
                            }
                            else if (self.options.monthlyMode) {
                                var firstDay = self.calculateFirstDayOfMonth($(this).val());
                                var lastDay = self.calculateLastDayOfMonth($(this).val());
                                var firstDayDateStr = self.retrieveDateStr(firstDay);
                                var lastDayDateStr = self.retrieveDateStr(lastDay);
                                $('.dr1.from').val(firstDayDateStr);
                                $('.dr1.to').val(lastDayDateStr);
                                self.applyTextInputDateChange(firstDay, firstDayDateStr, self, true, true);
                                self.applyTextInputDateChange(lastDay, lastDayDateStr, self, true, false);
                            }
                            else
                        	{
                            	var d = self.retrieveDMYDate($(this).val());
                            	self.applyTextInputDateChange(d, $(this).val(), self, true, true);
                        	}
                            self.maindateFromChanged = false;
                        }
                    });
                    $('.dr1.to').bind("blur", function (e) {
                        if (self.maindateToChanged) {
                            if (self.options.weeklyMode) {
                                var monday = self.calculateMonday($(this).val());
                                var sunday = self.calculateSundayFromMonday(monday);
                                var mondayDateStr = self.retrieveDateStr(monday);
                                var sundayDateStr = self.retrieveDateStr(sunday);
                                $('.dr1.from').val(mondayDateStr);
                                $('.dr1.to').val(sundayDateStr);
                                self.applyTextInputDateChange(monday, mondayDateStr, self, true, true);
                                self.applyTextInputDateChange(sunday, sundayDateStr, self, true, false);
                            }
                            else if (self.options.monthlyMode) {
                                var firstDay = self.calculateFirstDayOfMonth($(this).val());
                                var lastDay = self.calculateLastDayOfMonth($(this).val());
                                var firstDayDateStr = self.retrieveDateStr(firstDay);
                                var lastDayDateStr = self.retrieveDateStr(lastDay);
                                $('.dr1.from').val(firstDayDateStr);
                                $('.dr1.to').val(lastDayDateStr);
                                self.applyTextInputDateChange(firstDay, firstDayDateStr, self, true, true);
                                self.applyTextInputDateChange(lastDay, lastDayDateStr, self, true, false);
                            }
                            else
                        	{
                            	var d = self.retrieveDMYDate($(this).val()).getTime() + 24 * 3600000 - 1;
                            	self.applyTextInputDateChange(new Date(d), $(this).val(), self, true, false);
                        	}
                            self.maindateToChanged = false;
                        }
                    });
                }
            }
        },
        redrawCompare:function () {
            //console.log("Widget.datepicker: redrawcompare");
            var self = this;

            var dates = $('.date-ranges-picker').DatePickerGetDate();
            if (dates) {
                var period = dates[0];
                var values = {};
                if (self.datepicker.data("DateRangesWidget") && self.datepicker.data("DateRangesWidget").options) {
                    values = self.datepicker.data("DateRangesWidget").options.values;
                }
                if (this.options.compareModel) 
                {
                	// If the datepicker is already initialized and a redraw event is issued, 
                	// we must not recreate the compare dates if they already were disabled
                	if (self.fullyInitialized && !values.comparisonEnabled)
            			return;

                    $('.enable-comparison').parent().show();

                    if (this.options.persistentCompare) {
                        $('.enable-comparison').attr("disabled", "disabled");
                        $('.enable-comparison').attr("checked", "checked");
                    }
                    else {
                        $('.enable-comparison').removeAttr("disabled");
                    }   

                    if (this.options.weeklyMode || this.options.monthlyMode) {
                        $('#datepicker-dropdown .comparison-preset').attr("disabled", "disabled");
                    }
                    else {
                        $('#datepicker-dropdown .comparison-preset').removeAttr("disabled");
                    }

                    var f = self.options.compareModel.queryState.getFilterByFieldName(self.options.compareFields.date);
                    if (f && f.type == "range") {
                        period[2] = new Date(f.start);
                        period[3] = new Date(f.stop);
                    }
                    f = self.model.queryState.getFilterByFieldName(self.options.fields.type);
                    if (f && f.type == "term") {
                        // check custom weeks/month

                    }

                    if (period[2] && period[3]) {
                        values.comparisonEnabled = true;
                        values.comparisonPreset = "custom";
                        values.dr2from = self.retrieveDateStr(period[2]);
                        values.dr2from_millis = (new Date(period[2])).getTime();
                        values.dr2to = self.retrieveDateStr(period[3]);
                        values.dr2to_millis = (new Date(period[3])).getTime();
                        $('.comparison-preset').val("custom");
                    }
                    else {
                        values.comparisonEnabled = false;
                        values.dr2from = "N/A";
                        values.dr2from_millis = "";
                        values.dr2to = "N/A";
                        values.dr2to_millis = "";
                        $('.comparison-preset').val("previousperiod");
                    }

                    $('.date-ranges-picker').DatePickerSetDate(period, true);

                    if (values.comparisonEnabled && values.dr2from && values.dr2to) {
                        $('span.comparison', self.datepicker).text(values.dr2from + ' - ' + values.dr2to);
                        $('span.comparison', self.datepicker).show();
                        $('span.comparison-divider', self.datepicker).show();
                    } else {
                        $('span.comparison-divider', self.datepicker).hide();
                        $('span.comparison', self.datepicker).hide();
                    }

                    $('.dr2.from', self.datepicker).val(values.dr2from);
                    $('.dr2.to', self.datepicker).val(values.dr2to);

                    $('.dr2.from_millis', self.datepicker).val(values.dr2from_millis);
                    $('.dr2.to_millis', self.datepicker).val(values.dr2to_millis);


                    if (!self.fullyInitialized) {
                        $('.dr2.from').bind("keypress", function (e) {
                            self.comparedateFromChanged = true;
                        });
                        $('.dr2.to').bind("keypress", function (e) {
                            self.comparedateToChanged = true;
                        });
                        $('.dr2.from').bind("blur", function (e) {
                            if (self.comparedateFromChanged) {
                                if (self.options.weeklyMode) {
                                    var monday = self.calculateMonday($(this).val());
                                    var sunday = self.calculateSundayFromMonday(monday);
                                    var mondayDateStr = self.retrieveDateStr(monday);
                                    var sundayDateStr = self.retrieveDateStr(sunday);
                                    $('.dr2.from').val(mondayDateStr);
                                    $('.dr2.to').val(sundayDateStr);
                                    self.applyTextInputDateChange(monday, mondayDateStr, self, false, true);
                                    self.applyTextInputDateChange(sunday, sundayDateStr, self, false, false);
                                }
                                else if (self.options.monthlyMode) {
                                    var firstDay = self.calculateFirstDayOfMonth($(this).val());
                                    var lastDay = self.calculateLastDayOfMonth($(this).val());
                                    var firstDayDateStr = self.retrieveDateStr(firstDay);
                                    var lastDayDateStr = self.retrieveDateStr(lastDay);
                                    $('.dr2.from').val(firstDayDateStr);
                                    $('.dr2.to').val(lastDayDateStr);
                                    self.applyTextInputDateChange(firstDay, firstDayDateStr, self, false, true);
                                    self.applyTextInputDateChange(lastDay, lastDayDateStr, self, false, false);
                                }
                                else
                            	{
                                	var d = self.retrieveDMYDate($(this).val());
                                	self.applyTextInputDateChange(d, $(this).val(), self, false, true);
                            	}
                                self.comparedateFromChanged = false;
                            }
                        });
                        $('.dr2.to').bind("blur", function (e) {
                            if (self.comparedateToChanged) {
                                if (self.options.weeklyMode) {
                                    var monday = self.calculateMonday($(this).val());
                                    var sunday = self.calculateSundayFromMonday(monday);
                                    var mondayDateStr = self.retrieveDateStr(monday);
                                    var sundayDateStr = self.retrieveDateStr(sunday);
                                    $('.dr2.from').val(mondayDateStr);
                                    $('.dr2.to').val(sundayDateStr);
                                    self.applyTextInputDateChange(monday, mondayDateStr, self, false, true);
                                    self.applyTextInputDateChange(sunday, sundayDateStr, self, false, false);
                                }
                                else if (self.options.monthlyMode) {
                                    var firstDay = self.calculateFirstDayOfMonth($(this).val());
                                    var lastDay = self.calculateLastDayOfMonth($(this).val());
                                    var firstDayDateStr = self.retrieveDateStr(firstDay);
                                    var lastDayDateStr = self.retrieveDateStr(lastDay);
                                    $('.dr2.from').val(firstDayDateStr);
                                    $('.dr2.to').val(lastDayDateStr);
                                    self.applyTextInputDateChange(firstDay, firstDayDateStr, self, false, true);
                                    self.applyTextInputDateChange(lastDay, lastDayDateStr, self, false, false);
                                } 
                                else
                            	{
                                	var d = self.retrieveDMYDate($(this).val()).getTime() + 24 * 3600000 - 1;
                                	self.applyTextInputDateChange(new Date(d), $(this).val(), self, false, false);
                            	}
                                self.comparedateToChanged = false;
                            }
                        });
                        self.fullyInitialized = true;
                    }
                }
                else {
                	// disable and hide all comparison controls
                    values.comparisonEnabled = false;
                    values.comparisonPreset = "previousperiod";
                    $('.comparison-preset').val("previousperiod");
                    $('.comparison-preset').attr("disabled", "disabled");
                    $('.enable-comparison').removeAttr("checked");
                    $('.enable-comparison').change();
                    $('.comparison-daterange').hide();
                    $('.enable-comparison').parent().hide();
                    $('#datepicker-dropdown').css('min-height', "140px");
                }
            }
        },
        calculateMonday:function (dateStr) {
            var d = this.retrieveDMYDate(dateStr);
            var day = d.getDay();
            var diff = (day == 0 ? -6 : 1) - day; // adjust when day is sunday
            return new Date(d.getTime() + diff * 24 * 3600000);
        },
        calculateSundayFromMonday:function (monday) {
            return new Date(monday.getTime() + 7 * 24 * 3600000 - 1); // returns sunday at 23:59:59.999
        },
        calculateFirstDayOfMonth:function (dateStr) {
            var d = this.retrieveDMYDate(dateStr);
            d.setDate(1);
            return d;
        },
        calculateLastDayOfMonth:function (dateStr) {
            var d = this.retrieveDMYDate(dateStr);
            d.setDate(1);
            var month = d.getMonth() + 1;
            if (month == 12)
        	{
            	d.setMonth(0);
            	d.setFullYear(d.getFullYear()+1);
        	}
            else d.setMonth(month);
            return new Date(d.getTime() - 1);
        },
        retrieveDMYDate:function (dateStr) {
            // Expect input as d/m/y
            var bits = dateStr.split('\/');
            if (bits.length < 3)
                return null;

            var d = new Date(bits[2], parseInt(bits[1], 10) - 1, bits[0]);
            if (bits[2] >= 1970 && d && (d.getMonth() + 1) == bits[1] && d.getDate() == Number(bits[0]))
                return d;
            else return null;
        },
        retrieveDateStr:function (d) {
            return d3.time.format("%d/%m/%Y")(d);
        },
        applyTextInputDateChange:function (d, currVal, self, isMain, isFrom) {
            var values = {};
            if (self.datepicker.data("DateRangesWidget") && self.datepicker.data("DateRangesWidget").options) {
                values = self.datepicker.data("DateRangesWidget").options.values;
            }
            var datepickerOptions = $(".datepicker.selectableRange").data('datepicker');
            if (isMain) {
                if (isFrom) {
                    values.dr1from = currVal;
                    values.dr1from_millis = d.getTime();
                    $('.dr1.from_millis').val(d.getTime());
                    datepickerOptions.date[0] = d.getTime();
                }
                else {
                    values.dr1to = currVal;
                    values.dr1to_millis = d.getTime();
                    $('.dr1.to_millis').val(d.getTime());
                    datepickerOptions.date[1] = d.getTime();
                }
                if (datepickerOptions.mode == 'tworanges')
                    datepickerOptions.lastSel = 2;
            }
            else {
                if (isFrom) {
                    values.dr2from = currVal;
                    values.dr2from_millis = d.getTime();
                    $('.dr2.from_millis').val(d.getTime());
                    datepickerOptions.date[2] = d.getTime();
                }
                else {
                    values.dr2to = currVal;
                    values.dr2to_millis = d.getTime();
                    $('.dr2.to_millis').val(d.getTime());
                    datepickerOptions.date[3] = d.getTime();
                }
                if (datepickerOptions.mode == 'tworanges')
                    datepickerOptions.lastSel = 0;
            }
            // scroll month accordingly inside calendar section on the left
            datepickerOptions.current = d;
            // this hack is used to force a refresh of the month calendar, since setmode calls fill() method
            $('.date-ranges-picker').DatePickerSetMode($('.date-ranges-picker').DatePickerGetMode());
        },

        getActionsForEvent:function (eventType) {
            var actions = [];

            _.each(this.options.actions, function (d) {
                if (_.contains(d.event, eventType))
                    actions.push(d);
            });

            return actions;
        }


    });
    return view.DatePicker;
});