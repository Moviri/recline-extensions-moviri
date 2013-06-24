this.recline = this.recline || {};
this.recline.Backend = this.recline.Backend || {};
this.recline.Backend.JsonpMemoryStore = this.recline.Backend.JsonpMemoryStore || {};

(function ($, my) {
    my.__type__ = 'JsonpMemoryStore';
    // Timeout for request (after this time if no response we error)
    // Needed because use JSONP so do not receive e.g. 500 errors
    my.timeout = 60000;

    // ## load
    //
    // Load data from a URL
    //
    // Returns array of field names and array of arrays for records


    my.fetch = function (dataset) {

        console.log("Fetching data structure " + dataset.url);

        // var data = {onlydesc:"true"}; due to the fact that we use memory store we need to get all data even in first fetch
        if(dataset.fetchFilters) {
            var data = buildRequestFromQuery(dataset.fetchFilters);
            return requestJson(dataset, "fetch", data);
        }
        else
            return requestJson(dataset, "fetch", {});

    };

    my.query = function (queryObj, dataset) {


        var data = buildRequestFromQuery(queryObj);
        console.log("Querying JsonpMemoryStore backend for ");
        console.log(data);
        return requestJson(dataset, "query", data, queryObj);

    };


    function requestJson(dataset, requestType, data, queryObj) {
        var dfd = $.Deferred();

        var jqxhr = $.ajax({
            url:dataset.url,
            dataType:'jsonp',
            jsonpCallback:dataset.id,
            data:data,
            cache:true
        });

        _wrapInTimeout(jqxhr).done(function (results) {

            // verify if returned data is not an error
            if (results.results.length != 1 || results.results[0].status.code != 0) {
                console.log("Error in fetching data: " + results.results[0].status.message + " Statuscode:[" + results.results[0].status.code + "] AdditionalInfo:[" + results.results[0].status.additionalInfo + "]");
                dfd.reject(results.results[0].status);
            } else
                dfd.resolve(_handleJsonResult(results.results[0].result, queryObj, requestType));
        })
            .fail(function (arguments) {
                dfd.reject(arguments);
            });

        return dfd.promise();

    }

    ;


    function _handleJsonResult(data, queryObj, requestType) {
        if (data.data == null) {
            return {
                fields:_handleFieldDescription(data.description),
                useMemoryStore:true
            }
        }
        else {
            var fields = _handleFieldDescription(data.description);
            var facets = [];
            if (queryObj)
                var facets = recline.Data.Faceting.computeFacets(data.data, queryObj);

            if (requestType == "fetch") {
                return {
                    records:_normalizeRecords(data.data, fields),
                    fields:fields,
                    facets:facets,
                    useMemoryStore:true,
                    total:data.data.length
                }
            } else {
                return {
                    hits:_normalizeRecords(data.data, fields),
                    fields:fields,
                    facets:facets,
                    useMemoryStore:true,
                    total:data.data.length
                }
            }
        }

    }

    ;


    // convert each record in native format
    // todo verify if could cause performance problems
    function _normalizeRecords(records, fields) {

        _.each(fields, function (f) {
            if (f != "string")
                _.each(records, function (r) {
                    r[f.id] = recline.Data.FormattersMoviri[f.type](r[f.id]);
                })
        });

        return records;

    }

    ;


    // todo should be in backend
    function getDate(temp) {
        var tmp = new Date();

        var dateStr = padStr(temp.getFullYear()) + "-" +
            padStr(1 + temp.getMonth()) + "-" +
            padStr(temp.getDate()) + " " +
            padStr(temp.getHours()) + ":" +
            padStr(temp.getMinutes()) + ":" +
            padStr(temp.getSeconds());
        return dateStr;
    }

    function padStr(i) {
        return (i < 10) ? "0" + i : "" + i;
    }


    function buildRequestFromQuery(filters) {

        var data = [];
        var multivsep = "|";


        // register filters
        var filterFunctions = {
            term:function term(filter) {
                var parse = dataParsers[filter.fieldType];
                var value = filter.field;
                var term = parse(filter.term);

                return (value + " eq " + term);
            }, // field = value
            termAdvanced:function termAdvanced(filter) {
                var parse = dataParsers[filter.fieldType];
                var value = filter.field;
                var term = parse(filter.term);
                var operator = filter.operator;

                return (value + " " + operator + " " + term);
            }, // field (operator) value
            range:function range(filter) {
                var parse = dataParsers[filter.fieldType];
                var value = filter.field;
                var start = parse(filter.start);
                var stop = parse(filter.stop);
                return (value + " lte " + stop + "," + value + " gte " + start);

            }, // field > start and field < end
            list:function list(filter) {
                var parse = dataParsers[filter.fieldType];
                var value = filter.field;
                var list = filter.list;

                var ret = value + " bw ";
                for (var i in filter.list) {
                    if (i > 0)
                        ret = ret + multivsep;

                    ret = ret + list[i];
                }

                return ret;

            }
        };

        var dataParsers = {
            number:function (e) {
                return parseFloat(e, 10);
            },
            string:function (e) {
                return e.toString()
            },
            date:function (e) {
                var tmp = new Date(e);
                //console.log("---> " + e  + " ---> "+ getDate(tmp)) ;
                return getDate(tmp);

                // return new Date(e).valueOf()
            },
            integer:function (e) {
                return parseInt(e);
            }
        };

        for (var i = 0; i < filters.length; i++) {
            data.push(filterFunctions[filters[i].type](filters[i]));
        }

        // build sort options
        var res = "";



        var outdata = {};
        if (data.length > 0)
            outdata["filters"] = data.toString();

        if (res.length > 0)
            outdata["orderby"] = res;

        return outdata;

    }


    // ## _wrapInTimeout
    //
    // Convenience method providing a crude way to catch backend errors on JSONP calls.
    // Many of backends use JSONP and so will not get error messages and this is
    // a crude way to catch those errors.
    var _wrapInTimeout = function (ourFunction) {
        var dfd = $.Deferred();
        var timer = setTimeout(function () {
            dfd.reject({
                message:'Request Error: Backend did not respond after ' + (my.timeout / 1000) + ' seconds'
            });
        }, my.timeout);
        ourFunction.done(function (arguments) {
            clearTimeout(timer);
            dfd.resolve(arguments);
        })
            .fail(function (arguments) {
                clearTimeout(timer);
                dfd.reject(arguments);
            })
        ;
        return dfd.promise();
    }

    function _handleFieldDescription(description) {

        var dataMapping = {
            STRING:"string",
            DATE:"date",
            INTEGER:"integer",
            DOUBLE:"number"
        };


        var res = [];
        for (var k in description) {

            res.push({id:k, type:dataMapping[description[k]]});
        }

        return res;
    }


}(jQuery, this.recline.Backend.JsonpMemoryStore));
