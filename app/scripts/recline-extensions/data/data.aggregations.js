define(['jquery', 'REM/recline-extensions/recline-amd'], function ($, recline) {
    recline.Data = recline.Data || {};

    var my = recline.Data;
	
	my.Aggregations = {};

    my.Aggregations.aggregationFunctions = {
        sum         : function (p,v) {
            if(p==null) p=0;
            return p+v;
        },
        avg         : function (p, v) {},
        max         : function (p, v) {
            if(p==null)
                return v;
            return Math.max(p, v);
        },
        min         : function (p, v) {
            if(p==null)
                return v;
            return Math.min(p, v);
        },
        maxScaled: function (p, v) {},
        minScaled: function (p, v) {},
        ratioToReport: function (p, v) {},
        ratioToMax: function (p, v) {},
        runningTotal: function (p, v) {}
    };

    my.Aggregations.initFunctions = {
        sum           : function () {},
        avg           : function () {},
        max           : function () {},
        min           : function () {},
        maxScaled     : function () {},
        minScaled     : function () {},
        ratioToReport : function () {},
        ratioToMax    : function () {},
        runningTotal  : function () {}
    };

    my.Aggregations.resultingDataType = {
        sum           : function (original) { return original },
        avg           : function (original) { return "float"},
        max           : function (original) { return original},
        min           : function (original) { return original},
        maxScaled     : function (original) { return original},
        minScaled     : function (original) { return original},
        ratioToReport : function (original) { return "float"},
        ratioToMax :    function (original) { return "float"},
        runningTotal  : function (original) { return original}
    },

    my.Aggregations.finalizeFunctions = {
        sum         : function () {},
        avg         : function (resultData, aggregatedFields, partitionsFields) {
            resultData.avg = function(aggr, part){
                return function(){
                    var map = {};
                    for(var o=0;o<aggr.length;o++){
                        map[aggr[o]] = this.sum[aggr[o]] / this.count;
                    }
                    return map;
                }
            }(aggregatedFields, partitionsFields);

            if(partitionsFields != null && partitionsFields.length > 0) {
                resultData.partitions.avg = function(aggr, part) {
                	return function(){
	                    var map = {};
	                    for (var j=0;j<part.length;j++) {
	                        if(resultData.partitions.sum[part[j]])   {
	                            map[part[j]] = {
	                                value: resultData.partitions.sum[part[j]].value / resultData.partitions.count[part[j]].value,
	                                partition: resultData.partitions.sum[part[j]].partition
	                            };
	                        }
	                    }
	                    return map;
                	}
                }(aggregatedFields, partitionsFields);
            }
        },
        max                     : function () {},
        min                     : function () {},
        maxScaled              : function (resultData, aggregatedFields) {
            resultData.maxScaled = function(aggr){
                return function(){
                    var map = {};
                    for(var o=0;o<aggr.length;o++){
                        map[aggr[o]] = this.max[aggr[o]] * this.count;
                    }
                    return map;
                }
            }(aggregatedFields);
        },
        minScaled              : function (resultData, aggregatedFields) {
            resultData.minScaled = function(aggr){
                return function(){
                    var map = {};
                    for(var o=0;o<aggr.length;o++){
                        map[aggr[o]] = this.min[aggr[o]] * this.count;
                    }
                    return map;
                }
            }(aggregatedFields);
        },
        ratioToReport           : function () {},
        ratioToMax              : function () {},
        runningTotal            : function () {}
    };

    my.Aggregations.tableCalculations = {
        ratioToReport : function (aggregatedFields, p, r, totalRecords) {
            _.each(aggregatedFields, function(f) {
                if(totalRecords[f + "_sum_sum"] > 0)
                    r[f + "_ratioToReport"]  = r[f + "_sum"] / totalRecords[f + "_sum_sum"];
            });
            return r;
        },
            ratioToMax : function (aggregatedFields, p, r, totalRecords) {
            _.each(aggregatedFields, function(f) {
                if(totalRecords[f + "_sum_max"] > 0)
                    r[f + "_ratioToMax"]  = r[f + "_sum"] / totalRecords[f + "_sum_max"];
            });
                return r;
        },
        runningTotal : function (aggregatedFields, p, r, totalRecords) {
            _.each(aggregatedFields, function(f) {
                if(p)
                    r[f + "_runningTotal"]  =  r[f + "_sum"] + p[f + "_runningTotal"] ;
                else
                    r[f + "_runningTotal"] = r[f + "_sum"];
            });
            return r;
        }
    };
    
	var myIsEqual = function (object, other, key) {

        var spl = key.split('.'),
            val1, val2;

        if (spl.length > 0) {
            val1 = object;
            val2 = other;

            for (var k = 0; k < spl.length; k++) {
                arr = spl[k].match(/(.*)\[\'?(\d*\w*)\'?\]/i);
                if (arr && arr.length == 3) {
                    val1 = (val1[arr[1]]) ? val1[arr[1]][arr[2]] : val1[spl[k]];
                    val2 = (val2[arr[1]]) ? val2[arr[1]][arr[2]] : val2[spl[k]];
                } else {
                    val1 = val1[spl[k]];
                    val2 = val2[spl[k]];
                }
            }
        }
        return _.isEqual(val1, val2);
    };

    my.Aggregations.intersectionObjects = my.Aggregations.intersectObjects = function (key, array) {
        var slice = Array.prototype.slice;
        // added this line as a utility
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function (item) {
            return _.every(rest, function (other) {
                //return _.indexOf(other, item) >= 0;
                return _.any(other, function (element) {
                    var control = myIsEqual(element, item, key);
                    if (control) _.extend(item, element);
                    return control;
                });
            });
        });
    };

    my.Aggregations.checkTableCalculation = function(aggregationFunctions, totalsConfig) {
      var tableCalc = _.intersection(aggregationFunctions, ["runningTotal", "ratioToReport", "ratioToMax"]);
      if(tableCalc.length > 0) {
          _.each(tableCalc, function(d) {
             if(!_.intersection(totalsConfig.aggregationFunctions, my.Aggregations.tableCalculationDependencies[d]))
                 throw "Data.Aggregation: unable to calculate " + d + ", totals aggregation function ["+ my.Aggregations.tableCalculationDependencies[d] + "] must be defined";
          });
      }

        return tableCalc;
    };

    my.Aggregations.tableCalculationDependencies =  {
        runningTotal: [],
        avg: ["sum"],
        minScaled: ["min"],
        maxScaled: ["max"],
        ratioToReport: ["sum"],
        ratioToMax: ["max"]
    };

    return my.Aggregations;

});