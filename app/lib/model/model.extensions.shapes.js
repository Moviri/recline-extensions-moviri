(function ($) {

    recline.Model.Dataset.prototype = $.extend(recline.Model.Dataset.prototype, {
        setShapeSchema:function () {
            var self = this;
            _.each(self.attributes.shapeSchema, function (d) {
                var field = _.find(self.fields.models, function (f) {
                    return d.field === f.id
                });
                if (field != null)
                    field.attributes.shapeSchema = d.schema;
            })
        }
    });


    recline.Model.Record.prototype = $.extend(recline.Model.Record.prototype, {
        getFieldShapeName:function (field) {
            if (!field.attributes.shapeSchema)
                return null;

            if (field.attributes.is_partitioned) {
                return field.attributes.shapeSchema.getShapeNameFor(field.attributes.partitionValue);
            }
            else
                return field.attributes.shapeSchema.getShapeNameFor(this.getFieldValueUnrendered(field));

        },

        getFieldShape:function (field, isSVG, isNode) {
            if (!field.attributes.shapeSchema)
                return recline.Template.Shapes["empty"](null, isNode, isSVG);

            var fieldValue;
            var fieldColor = this.getFieldColor(field);

            if (field.attributes.is_partitioned) {
                fieldValue = field.attributes.partitionValue;
            }
            else
                fieldValue = this.getFieldValueUnrendered(field);


            return field.attributes.shapeSchema.getShapeFor(fieldValue, fieldColor, isSVG, isNode);
        }
    });


}(jQuery));