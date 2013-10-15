define(['jquery', 'recline-amd'], function ($, recline) {

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {
        setColorSchema: function () {
            var self = this;

            _.each(self.attributes.colorSchema, function (d) {
                var field = _.find(self.fields.models, function (f) {
                    return d.field === f.id
                });
                if (field != null)
                    field.attributes.colorSchema = d.schema;
            })

        },

        // a color schema is linked to the dataset but colors are not recalculated upon data/field reset
        addStaticColorSchema: function (colorSchema, field) {
            var self = this;
            if (!self.attributes["colorSchema"])
                self.attributes["colorSchema"] = [];

            self.attributes["colorSchema"].push({schema: colorSchema, field: field});

            if (self.fields.length > 0)
                self.setColorSchema();

            self.fields.bind('reset', function () {
                self.setColorSchema();
            });
            self.fields.bind('add', function () {
                self.setColorSchema();
            });
            self.fields.bind('change', function () {
                self.setColorSchema();
            });

        },

        _handleQueryResult: function () {
            var super_init = recline.Model.Dataset.prototype._handleQueryResult;

            return function (queryResult) {

                var self = this;

                super_init.call(this, queryResult);

                if (queryResult.facets) {

                    _.each(queryResult.facets, function (f, index) {

                        recline.Data.ColorSchema.addColorsToTerms(f.id, f.terms, self.attributes.colorSchema);
                    });
                }


            };
        }()
    });


    recline.Model.Record.prototype = $.extend(recline.Model.Record.prototype, {
        getFieldColor: function (field) {
            if (!field.attributes.colorSchema)
                return null;

            if (field.attributes.is_partitioned) {
                return field.attributes.colorSchema.getTwoDimensionalColor(field.attributes.partitionValue, this.getFieldValueUnrendered(field));
            }
            else
                return field.attributes.colorSchema.getColorFor(this.getFieldValueUnrendered(field));

        }
    });


    recline.Model.Field.prototype = $.extend(recline.Model.Field.prototype, {

        getColorForPartition: function () {

            if (!this.attributes.colorSchema)
                return null;

            if (this.attributes.is_partitioned)
                return this.attributes.colorSchema.getColorFor(this.attributes.partitionValue);

            return this.attributes.colorSchema.getColorFor(this.attributes.id);
        }
    });

    return recline;

});