define(['jquery', 'REM/recline-extensions/recline-amd'], function ($, recline) {
    recline.Backend = recline.Backend || {};
    recline.Backend.ParallelUnionBackend = recline.Backend.ParallelUnionBackend || {};

    var my = recline.Backend.ParallelUnionBackend;
    // Behaviour is used to choose the content of the query to be executed on relative backend
    // if behaviour is not specified all different orid will be executed on backend[1] in parallel
    // query item must must have a "orid" attributes
    // e.g. {field: "fieldname", type:"term", term:"fieldvalue", fieldType:"string", orid="year" };

    /*BackendConfigurationExample =  {
        backends:
            [{
                    id:1,
                    backend:"Jsonp",
                    params:{ url:"http://" }
                }],
        behaviour:
        [
            {
                orid:"year",
                backend:1
            },
            {
                orid:"month",
                backend:1
            },
            {
                orid:"week",
                backend:1
            },
            {
                orid:"day",
                backend:1
            }
        ]
    }*/

    // common sono i valori non in or
    // il field deve essere singolo term
    // il valore del field determina il backend
    // passare id del dataset nei params

    my.__type__ = 'ParallelUnionBackend';

    my.deferreds = function(dataset) {
        var backendsFetch = [];
        _.each(dataset.backendConfiguration.backends, function(b) {
            b["instance"] = my._backendFromString(b.backend);
            var deferred = b.instance.fetch(b["props"]);
            deferred.done(function(res) {
                _.extend(data, res);
            });
            backendsFetch.push(deferred) ;
        });
        return backendsFetch;
    },

    my.fetch = function (dataset) {
        var dfd = new $.Deferred();
        var data = { fields: [], records: [], useMemoryStore: false};

        var backendsFetch = [];
        _.each(dataset.backendConfiguration.backends, function(b) {
            b["instance"] = my._backendFromString(b.backend);
            var deferred = b.instance.fetch(b["props"]);
            deferred.done(function(res) {
               if(data.useMemoryStore) {
                   data["useMemoryStore"] =  true;
               }
                // make the union of fields
                _.each(res.fields, function(f) {
                    if(!_.find(data.fields, function(ff) { return f.id==ff.id })) {
                        data.fields.push(f);
                    }
                });

            });
            backendsFetch.push(deferred) ;
        });

        $.when.apply(window, backendsFetch).done(function() {
            dfd.resolve(data).fail(my.errorOnFetching);
        });

        return dfd.promise();
    };

    my.query = function (queryObj, dataset) {
        var dfd = new $.Deferred();
        var data = { fields: [], hits: [], useMemoryStore: false, facets: [], total: 0};

        var backendsFetch = [];

        if(dataset.backendConfiguration.backendChoser) {
            var be = dataset.backendConfiguration.backendChoser(queryObj);
            _.each(be, function(b) {
                var query = _.clone(queryObj);
                query.filters = b.filters;
                b["instance"] = my._backendFromString(b.backend.backend);
                var deferred = b.instance.query(query, b.backend["props"]);
                deferred.done(function(res) {
                    if(data.useMemoryStore) {
                        data["useMemoryStore"] =  true;
                    }
                    // make the union of fields
                    _.each(res.fields, function(f) {
                        if(!_.find(data.fields, function(ff) { return f.id==ff.id })) {
                            data.fields.push(f);
                        }
                    });
                    data.hits = $.merge(data.hits, res.hits);
                    data.facets = $.merge(data.facets, res.facets);
                    data["total"] = data["total"] + data.hits.length;

                });
                backendsFetch.push(deferred) ;
            });

        } else {
            _.each(dataset.backendConfiguration.backends, function(b) {
                b["instance"] = my._backendFromString(b.backend);
                var deferred = b.instance.query(queryObj, b["props"]);
                deferred.done(function(res) {
                    if(data.useMemoryStore) {
                        data["useMemoryStore"] =  true;
                    }
                    // make the union of fields
                    _.each(res.fields, function(f) {
                        if(!_.find(data.fields, function(ff) { return f.id==ff.id })) {
                            data.fields.push(f);
                        }
                    });
                    data.hits = $.merge(data.hits, res.hits);
                    data.facets = $.merge(data.facets, res.facets);
                    data["total"] = data["total"] + data.hits.length;

                });
                backendsFetch.push(deferred) ;
            });

        }


        $.when.apply(window, backendsFetch).done(function() {
            dfd.resolve(my.prepareResults(data, dataset.backendConfiguration.result)).fail(my.errorOnFetching);
        });

        return dfd.promise();
    };


    // if results myst be aggregated
    // a group function is applied and then for each group the sum is calculated
    my.prepareResults = function(data, resulttype) {
        if(resulttype.type == "union") {
            return data;
        }
        else if(resulttype.type == "sum") {
            var groupBy = resulttype.groupBy;
            var res;
            if(groupBy.constructor == Array) {
              res = _.groupBy(data.hits, function(c) {
                  var tmp = "";
                  _.each(groupBy, function(a) {
                      tmp = tmp + "#" + c[a];
                  })
                  return tmp;
              });
            } else {
              res = _.groupBy(data.hits, groupBy);
            }

            var ret = [];
            _.each(res, function(group, iterator) {
                var r = {};
                _.each(groupBy, function(rec) {
                    r[rec] = group[0][rec]; // take first value for grouped dim
                })
                //r[groupBy] = iterator;
                _.each(group, function(record){
                    _.each(resulttype.fields, function(field, itField) {
                        if(r[field])
                            r[field] = r[field] + record[field];
                        else
                            r[field] = record[field];
                    })
                })
                ret.push(r);
            })
            data.hits=ret;
            data["total"] = data.hits.length;
            return data;
        }
    }

    my.errorOnFetching = function() {
        return {
            message:'Request Error: error on fetching union parallel backends'
        };
    };

    my._backendFromString = function(backendString) {
        var backend = null;
        if (recline && recline.Backend) {
            _.each(_.keys(recline.Backend), function(name) {
                if (name.toLowerCase() === backendString.toLowerCase()) {
                    backend = recline.Backend[name];
                }
            });
        }
        return backend;
    }


});
