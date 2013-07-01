define(['jquery', 'recline-extensions-amd'], function ($, recline) {
    recline.Backend = recline.Backend || {};
    recline.Backend.CSV = recline.Backend.CSV || {};

    var my = recline.Backend.CSV;


	my.setFieldsAttributesCSV = function(fields, model, records) {
        // if type is declared and was unspecified (typical for CSV), it's updated 
        if (model.attributes.fieldsType) {
            // if type is declared in dataset properties merge it;
        	if (model.attributes.fieldsType.length)
    		{
                _.each(model.attributes.fieldsType, function (d) {
                    var field = _.find(fields, function (f) {
                        return d.id === f.id
                    });
                    if (field != null && (typeof field.type == "undefined" || field.type == null) && field.type != d.type)
                	{
                        field.type = d.type;
                        if (model.backend.__type__ == "csv" && records && field.type != "string")
                    	{
                        	_.each(records, function(rec) {
                        		if (field.type == "date")
                        			rec[d.id] = new Date(rec[d.id])
                        		else if (field.type == "integer")
                        			rec[d.id] = parseInt(rec[d.id])
                        		else if (field.type == "number")
                        			rec[d.id] = parseFloat(rec[d.id])
                        	})
                    	}
                	}
                })
    		}
        	else throw "Wrong fieldsType parameter. Must be an array, not a single object!"
        }
    }
});

