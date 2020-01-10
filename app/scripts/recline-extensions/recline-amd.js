/* global define, recline */
'use strict';
define(['REM/vendor/recline/recline', 'REM/vendor/recline/recline.dataset'], function() {
	recline.CONSTANTS = {"DATA_SERIES_TIMESHIFT_SUFFIX" : "__TIMESHIFTED__"};
	return recline;
});

