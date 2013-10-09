define(['jquery', 'recline-extensions-amd'], function ($, recline) {

    recline.Model = recline.Model || {};
    recline.Model.SocketDataset = recline.Model.SocketDataset || {};


    var my = recline.Model;

    my.SocketDataset = Backbone.Model.extend({
        constructor: function SocketDataset() {
            Backbone.Model.prototype.constructor.apply(this, arguments);
        },


        initialize: function () {
            var self = this;


            this.records = new my.RecordList();
            this.fields = new my.FieldList()

            self.fields.reset(this.get("fields"));

            this.recordCount = 0;

            this.queryState = new my.Query();


        },


        attach: function () {
            var self = this;
            this.trigger('attach:start');

            var queryObj = self.queryState.toJSON();


            self.socket = io.connect(self.attributes.url, {'force new connection': true, port: self.attributes.port, resource: self.attributes.resource});

            var socket = self.socket;

            socket.on('connect', function (data) {
                socket.emit('subscribe', self.attributes.subscribeData);
            });

            socket.on(self.attributes.queue, function (data) {

                self.records.add(data, {at: 0});


                self.recordCount = self.records.length;


                while (self.recordCount > self.attributes.queueSize) {
                    var m = self.records.at(self.recordCount - 1);
                    self.records.remove(m);

                    m.destroy();
                    self.recordCount = self.records.length;
                }

            });


            self.trigger('attach:done');

        },
        deattach: function() {
            this.socket.disconnect();
        },
        getRecords: function () {
            return this.records.models;
        },

        getFields: function (type) {
            return this.fields;
        },

        toTemplateJSON: function () {
            var data = this.records.toJSON();
            data.recordCount = this.recordCount;
            data.fields = this.fields.toJSON();
            return data;
        },

        getFieldsSummary: function () {
            return this.attributes.dataset.getFieldsSummary();
        },

        addCustomFilterLogic: function (f) {
            if (this.attributes.customFilterLogic)
                this.attributes.customFilterLogic.push(f);
            else
                this.attributes.customFilterLogic = [f];
        },
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
        toFullJSON: function (resultType) {
            var self = this;
            return _.map(self.records.models, function (r) {
                var res = {};

                _.each(self.fields.models, function (f) {
                    res[f.id] = r.getFieldValueUnrendered(f);
                });

                return res;

            });
        }



    })


});

