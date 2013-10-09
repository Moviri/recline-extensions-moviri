define(['jquery', 'recline-extensions-amd'], function ($, recline) {
	recline.Model.Query.prototype = $.extend(recline.Model.Query.prototype, {
	    defaults: function() {
	        return {
	            size: 500000    ,
	            from: 0,
	            q: '',
	            facets: {},
	            filters: []
	        };
	    }
	});
});