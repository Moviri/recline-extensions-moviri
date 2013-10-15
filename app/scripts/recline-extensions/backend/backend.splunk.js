define(['jquery', 'recline-amd'], function ($, recline) {

    recline.Backend = recline.Backend || {};
    recline.Backend.Splunk = recline.Backend.Splunk || {};

    va my = recline.Backend.Splunk;

    my.__type__ = 'Splunk';
    // Timeout for request (after this time if no response we error)
    // Needed because use JSONP so do not receive e.g. 500 errors
    my.timeout = 60000;

    // ## load
    //
    // Load data from a URL
    //
    // Returns array of field names and array of arrays for records

    //my.queryStateInMemory = new recline.Model.Query();
    //my.queryStateOnBackend = new recline.Model.Query();

    // todo has to be merged with query (part is in common)
    my.fetch = function (dataset) {
        throw("recline-splunk: fetch not implemented");
        //var data = {onlydesc:"true"};
        //return requestJson(dataset, data);

    };

    my.query = function (queryObj, dataset) {


        var data = buildRequestFromQuery(queryObj);
        console.log("Querying splunk backend [" + (dataset.id ? dataset.id : dataset.url) + "] for ");
        console.log(data);
        return requestSplunk(dataset, data, queryObj);

    };


    function requestSplunk(dataset, data, queryObj) {
        var dfd = $.Deferred();

        var http = new splunkjs.ProxyHttp(dataset.proxyUrl);


        var service = new splunkjs.Service(http, {
            username: dataset.username,
            password: dataset.password,
            scheme: dataset.scheme,
            host: dataset.host,
            port: dataset.port,
            version: dataset.version
        });

        //  var mySavedSearches = service.savedSearches();

        var jobOptions = {};
        if(queryObj) {
            if(queryObj.size)
                jobOptions["count"] = queryObj.size;

            jobOptions["search"] = buildRequestFromQuery(queryObj);
        } else
        {
            jobOptions["search"] = "search *";
        }

        var searchParams = {
            exec_mode: "normal",
            earliest_time: dataset.earliestTime
        };


        service.search(
            jobOptions["search"],
            searchParams,
            function(err, job) {

                // Display the job's search ID
                console.log("Job SID: ", job.sid);

                // Poll the status of the search job
                job.track({period: 200}, {
                    done: function(job) {
                        console.log("Done!");

                        // Print out the statics
                        console.log("Job statistics:");
                        console.log("  Event count:  " + job.properties().eventCount);
                        console.log("  Result count: " + job.properties().resultCount);
                        console.log("  Disk usage:   " + job.properties().diskUsage + " bytes");
                        console.log("  Priority:     " + job.properties().priority);

                        // Get the results and print them
                        job.results(jobOptions, function(err, results, job) {

                                dfd.resolve(_handleResult(results, queryObj));

                        });

                    },
                    failed: function(job) {
                        dfd.reject("Job failed");
                    },
                    error: function(err) {
                        dfd.reject(err);
                    }
                });

            }
        );

        /*mySavedSearches.fetch(function (err, mySavedSearches) {


            // Retrieve the saved search that was created earlier
            var mySavedSearch = mySavedSearches.item(dataset.searchName);

            // Run the saved search and poll for completion
            mySavedSearch.dispatch(function (err, job) {

                // Display the job's search ID
                console.log("Job SID: ", job.sid);

                // Poll the status of the search job
                job.track({
                    period: 200
                }, {
                    done: function (job) {
                        console.log("Done!");

                        // Print out the statics
                        console.log("Job statistics:");
                        console.log("  Event count:  " + job.properties().eventCount);
                        console.log("  Result count: " + job.properties().resultCount);
                        console.log("  Disk usage:   " + job.properties().diskUsage + " bytes");
                        console.log("  Priority:     " + job.properties().priority);

                        // Get 10 results and print them
                        job.results( jobOptions, function (err, results, job) {
                            dfd.resolve(_handleResult(results, queryObj));
                        });


                    },
                    failed: function (job) {
                        dfd.reject("Splunk job failed");
                    },
                    error: function (err) {
                        dfd.reject(err);

                    }
                });
            });
        });
        */

        return dfd.promise();

    };


    function _handleResult(data, queryObj) {
        var fields = _handleFieldDescription(data.fields);

        if (queryObj)
            var facets = recline.Data.Faceting.computeFacets(data.records, queryObj);

        return {
            fields: fields,
            useMemoryStore: false,
            facets: facets,
            total: data.rows.length,
            hits: _normalizeRecords(data.rows, fields)
        }

    }

    // convert each record in native format
    // todo verify if could cause performance problems
    function _normalizeRecords(data, fields) {
        var records = [];
        _.each(data, function (r) {
            var record = {};
            _.each(fields, function (f) {
                record[f.id] = recline.Data.FormattersMoviri[f.type](r[f.index]);
            })
            records.push(record);

        });

        return records;

    }


    function buildRequestFromQuery(queryObj) {

        var filters = queryObj.filters;
        var data = [];


        // register filters
        var filterFunctions = {
            term: function term(filter) {
                var parse = dataParsers[filter.fieldType];
                var value = filter.field;
                var term = parse(filter.term);

                return (value + "=" + term);
            }, // field = value
            range: function range(filter) {
                var parse = dataParsers[filter.fieldType];
                var value = filter.field;
                var start = parse(filter.start);
                var stop = parse(filter.stop);
                return (value + " bw " + start + multivsep + stop);

            }, // field > start and field < end
            list: function list(filter) {
                var parse = dataParsers[filter.fieldType];
                var value = filter.field;
                var list = filter.list;

                var ret = value + " in ";
                for (var i in list) {
                    if (i > 0)
                        ret = ret + multivsep;

                    ret = ret + list[i];
                }

                return ret;

            }
        };

        var dataParsers = {
            number: function (e) {
                return parseFloat(e, 10);
            },
            string: function (e) {
                return e.toString()
            },
            date: function (e) {
                var tmp = new Date(e);
                //console.log("---> " + e  + " ---> "+ getDate(tmp)) ;
                return getDate(tmp);

                // return new Date(e).valueOf()
            },
            integer: function (e) {
                return parseInt(e);
            }
        };

        for (var i = 0; i < filters.length; i++) {
            data.push(filterFunctions[filters[i].type](filters[i]));
        }


        // filters definitions


        var outdata = "search ";
        if (data.length > 0)
            outdata += data.toString();
        else
            outdata += "*";

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
                message: 'Request Error: Backend did not respond after ' + (my.timeout / 1000) + ' seconds'
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

    function _handleFieldDescription(fields, index) {

        var dataMapping = {
            STRING: "string",
            DATE: "date",
            INTEGER: "integer",
            DOUBLE: "number"
        };

        // TODO how can we determine field type?

        var res = [];
        _.each(fields, function(f, idx){
            res.push({id: f, type: dataMapping["STRING"], index: idx});
        });

        return res;
    }


});
