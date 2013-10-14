define(['underscore', 'recline'], function (_, recline) {

    recline.Data = recline.Data || {};
    recline.Data.FieldsUtility = recline.Data.FieldsUtility || {};
    var my = recline.Data.FieldsUtility;

    my.setFieldsAttributes = function (fields, model, records) {


        // if labels are declared in dataset properties merge it;
        if (model.attributes.fieldLabels) {
            for (var i = 0; i < fields.length; i++) {
                var tmp = _.find(model.attributes.fieldLabels, function (x) {
                    return x.id == fields[i].id;
                });
                if (tmp != null)
                    fields[i].label = tmp.label;


            }

        }

        // if format is declared it is updated
        if (model.attributes.fieldsFormat) {
            // if format is declared in dataset properties merge it;
            if (model.attributes.fieldsFormat.length) {
                _.each(model.attributes.fieldsFormat, function (d) {
                    var field = _.find(fields, function (f) {
                        return d.id === f.id
                    });
                    if (field != null)
                        field.format = d.format;
                })
            }
            else throw "Wrong fieldsFormat parameter. Must be an array, not a single object!"
        }

        // assignment of color schema to fields
        if (model.attributes.colorSchema) {
            _.each(model.attributes.colorSchema, function (d) {
                var field = _.find(fields, function (f) {
                    return d.field === f.id
                });
                if (field != null)
                    field.colorSchema = d.schema;
            })
        }

        // assignment of shapes schema to fields
        if (model.attributes.shapeSchema) {
            _.each(model.attributes.shapeSchema, function (d) {
                var field = _.find(fields, function (f) {
                    return d.field === f.id
                });
                if (field != null)
                    field.shapeSchema = d.schema;
            })
        }
    }


});
