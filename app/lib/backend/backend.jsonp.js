this.recline = this.recline || {};
this.recline.Backend = this.recline.Backend || {};
this.recline.Backend.Jsonp = this.recline.Backend.Jsonp || {};

(function ($, my) {
    my.__type__ = 'Jsonp';
    // Timeout for request (after this time if no response we error)
    // Needed because use JSONP so do not receive e.g. 500 errors
    my.timeout = 30000;

    // ## load
    //
    // Load data from a URL
    //
    // Returns array of field names and array of arrays for records

    //my.queryStateInMemory = new recline.Model.Query();
    //my.queryStateOnBackend = new recline.Model.Query();

    // todo has to be merged with query (part is in common)
    my.fetch = function (dataset) {

        console.log("Fetching data structure " + dataset.url);

        var data = {onlydesc:"true"};
        return requestJson(dataset, data);

    };

    my.query = function (queryObj, dataset) {

        //var tmpQueryStateInMemory = new recline.Model.Query();
        //var tmpQueryStateOnBackend = new recline.Model.Query();


        //if (dataset.inMemoryQueryFields == null && !queryObj.facets && !dataset.useMemoryStore) {
        //    dataset.useMemoryStore = [];
        //} else
        //    self.useMemoryStore = true;

        /*var filters = queryObj.filters;
         for (var i = 0; i < filters.length; i++) {
         // verify if filter is specified in inmemoryfields

         if (_.indexOf(dataset.inMemoryQueryFields, filters[i].field) == -1) {
         //console.log("filtering " + filters[i].field + " on backend");
         tmpQueryStateOnBackend.addFilter(filters[i]);
         }
         else {
         //console.log("filtering " + filters[i].field + " on memory");
         tmpQueryStateInMemory.addFilter(filters[i]);
         }
         }
         tmpQueryStateOnBackend.set({sort: queryObj.sort});
         tmpQueryStateInMemory.set({sort: queryObj.sort});

         var changedOnBackend = false;
         var changedOnMemory = false;
         var changedFacets = false;

         // verify if filters on backend are changed since last query
         if (self.firstFetchExecuted == null ||
         !_.isEqual(self.queryStateOnBackend.attributes.filters, tmpQueryStateOnBackend.attributes.filters) ||
         !_.isEqual(self.queryStateOnBackend.attributes.sort, tmpQueryStateOnBackend.attributes.sort)
         ) {
         self.queryStateOnBackend = tmpQueryStateOnBackend;
         changedOnBackend = true;
         self.firstFetchExecuted = true;
         }

         // verify if filters on memory are changed since last query
         if (dataset.inMemoryQueryFields && dataset.inMemoryQueryFields.length > 0
         && !_.isEqual(self.queryStateInMemory.attributes.filters, tmpQueryStateInMemory.attributes.filters)
         && !_.isEqual(self.queryStateInMemory.attributes.sort, tmpQueryStateInMemory.attributes.sort)
         ) {
         self.queryStateInMemory = tmpQueryStateInMemory;
         changedOnMemory = true;
         }

         // verify if facets are changed
         if (queryObj.facets && !_.isEqual(self.queryStateInMemory.attributes.facets, queryObj.facets)) {
         self.queryStateInMemory.attributes.facets = queryObj.facets;
         changedFacets = true;
         }
         */

        //if (changedOnBackend) {
        var data = buildRequestFromQuery(queryObj);
        console.log("Querying backend for ");
        console.log(data);
        return requestJson(dataset, data, queryObj);
        //}

        /*if (self.inMemoryStore == null) {
         throw "No memory store available for in memory query, execute initial load"
         }*/

        /*var dfd = $.Deferred();
         dfd.resolve(applyInMemoryFilters());
         return dfd.promise();
         */

    };

    function isArrayEquals(a, b) {
        return !(a < b || b < a);
    }

    ;


    function requestJson(dataset, data, queryObj) {
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
                console.log("Error in fetching data: " + results.results[0].status.message + " Statuscode:[" + results.results[0].status.code + "] AdditionalInfo:["+results.results[0].status.additionalInfo+"]");

                dfd.reject(results.results[0].status);
            } else
                dfd.resolve(_handleJsonResult(results.results[0].result, queryObj));

        })
            .fail(function (arguments) {
                dfd.reject(arguments);
            });

        return dfd.promise();

    }

    ;

    function _handleJsonResult(data, queryObj) {
            if (data.data == null) {
                return {
                    fields:_handleFieldDescription(data.description),
                    useMemoryStore:false
                }
            }
            else {
                var fields = _handleFieldDescription(data.description);
                var facets = recline.Data.Faceting.computeFacets(data.data, queryObj);

                return {
                    hits:_normalizeRecords(data.data, fields),
                    fields: fields,
                    facets: facets,
                    useMemoryStore:false,
                    total: data.data.length
                }
            }
        /*
         var self = this;
         var fields;
         if (data.description) {
         fields = _handleFieldDescription(data.description);
         //my.memoryFields = _handleFieldDescription(data.description);
         }

         // Im fetching only record description
         if (data.data == null) {
         return prepareReturnedData(data);
         }

         var result = data;
         */

        /*if (my.useMemoryStore) {
         // check if is the first time I use the memory store
         my.inMemoryStore = new recline.Backend.Memory.Store(result.data, _handleFieldDescription(result.description));
         my.data = my.inMemoryStore.data;
         return applyInMemoryFilters();

         }
         else {
         // no need to query on memory, return json data
         return prepareReturnedData(result);
         } */
        //return prepareReturnedData(result);
    }

    ;

    /*
     function applyInMemoryFilters() {
     var self=this;
     var tmpValue;

     my.inMemoryStore.query(my.queryStateInMemory.toJSON())
     .done(function (value) {
     tmpValue = value;
     tmpValue["fields"] = my.memoryFields;
     });


     return tmpValue;
     };
     */

    /*function prepareReturnedData(data) {

        if (data.hits == null)


            if (data.data == null) {

                return {
                    fields:my.memoryFields,
                    useMemoryStore:false
                }
            }
            else {

                return {
                    hits:_normalizeRecords(data.data, my.memoryFields),
                    fields:my.memoryFields,
                    useMemoryStore:false
                }
            }

        return data;
    }

    ;*/

    // convert each record in native format
    // todo verify if could cause performance problems
    function _normalizeRecords(records, fields) {

        _.each(fields, function (f) {
            if (f != "string")
                _.each(records, function (r) {
                    r[f.id] = recline.Data.FormattersMODA[f.type](r[f.id]);
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


    function buildRequestFromQuery(queryObj) {

        var filters = queryObj.filters;
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
                for (var i = 0; i < filter.list.length; i++) {
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

        _.each(queryObj.sort, function (sortObj) {
            if (res.length > 0)
                res += ";"

            var fieldName = sortObj.field;
            res += fieldName;
            if (sortObj.order) {
                res += ":" + sortObj.order;
            }

        });


        // filters definitions


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


}(jQuery, this.recline.Backend.Jsonp));
