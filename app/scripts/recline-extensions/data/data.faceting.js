define(['recline-extensions-amd', 'recline-extensions/model/model.extensions.colors'], function(recline) {

    recline.Data = recline.Data || {};
    recline.Data.Format = recline.Format || {};
    recline.Data.Faceting = recline.Faceting || {};

    var my = recline.Data;


    my.Faceting.computeFacets = function (records_in, queryObj) {
        var self = this;
        var facetResults = {};
        if (!queryObj.facets) {
            return facetResults;
        }
        _.each(queryObj.facets, function (query, facetId) {
            // TODO: remove dependency on recline.Model
                facetResults[facetId] = new recline.Model.Facet({id:facetId}).toJSON();
            facetResults[facetId].termsall = {};

        });
        // faceting
        _.each(records_in, function (doc) {
            _.each(queryObj.facets, function (query, facetId) {
                var fieldId = query.terms.field;
                var val = doc[fieldId];
                var tmp = facetResults[facetId];
                if (val != null && typeof val != "undefined") {
                    if( tmp.termsall[val] ) {
                        tmp.termsall[val].records.push(doc);
                        tmp.termsall[val].count = tmp.termsall[val].count + 1;
                    } else {
                        tmp.termsall[val] =  {count:1, value:val, records: [doc]};
                    }

                } else {
                    tmp.missing = tmp.missing + 1;
                }
            });
        });

        // if all_terms is specified add terms not presents
        self.updateDistinctFieldsForFaceting(queryObj);

        _.each(queryObj.facets, function (query, facetId) {
            var tmp = facetResults[facetId];

            var termsWithZeroCount =
                _.difference(
                    self.distinctFieldsValues[facetId],
                    _.map(tmp.termsall, function (d) {
                        return d.value
                    })
                );

            _.each(termsWithZeroCount, function (d) {
                tmp.termsall[d] = {count:0, value:d, records: [] };
            });

        });


        _.each(queryObj.facets, function (query, facetId) {
            var tmp = facetResults[facetId];
            var terms = _.map(tmp.termsall, function (res, term) {
                return { term:res.value, count:res.count, records: res.records };
            });
            tmp.terms = _.sortBy(terms, function (item) {
                // want descending order
                return -item.count;
            });
        });


        return facetResults;
    };


    //update uniq values for each terms present in facets with value all_terms
    my.Faceting.updateDistinctFieldsForFaceting = function (queryObj) {
        var self = this;
        if (this.distinctFieldsValues == null)
            this.distinctFieldsValues = {};

        var fieldsToBeCalculated = [];

        _.each(queryObj.facets, function (query, fieldId) {
            if (query.terms.all_terms && self.distinctFieldsValues[fieldId] == null) {
                fieldsToBeCalculated.push(fieldId);
            }
        });

        if (fieldsToBeCalculated.length > 0) {
            _.each(fieldsToBeCalculated, function (d) {
                self.distinctFieldsValues[d] = []
            });

            _.each(self.data, function (d) {
                _.each(fieldsToBeCalculated, function (field) {
                    self.distinctFieldsValues[field].push(d[field]);
                });
            });
        }

        _.each(fieldsToBeCalculated, function (d) {
            self.distinctFieldsValues[d] = _.uniq(self.distinctFieldsValues[d])
        });

    };


});
