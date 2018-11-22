/* global define */
define(['jquery', 'REM/recline-extensions/recline-extensions-amd', 'underscore', 'backbone'], function ($, recline, _, Backbone) {

    recline.View = recline.View || {};

    var view = recline.View;

    "use strict";

    view.AlertMessageView = Backbone.View.extend({
        rendered: false,
        renderedModal: false,
        timeout: 5000,
        container: $(document.body),
        modalContainer: $(document.body),
        activeMessages: [],
        allowMultiple: true,
        initialize:function (args) {
            this.options = args;
            _.bindAll(this, 'showMessage', 'showModalMessage', 'removeMessageFromQueue', 'findMessageFromQueue');
        	if (args.container != null) {
        		this.container = args.container;
            }
            if (args.modalContainer != null) {
                this.modalContainer = args.modalContainer;
            }
            if (args.timeout && _.isFinite(args.timeout)) {
                this.timeout = args.timeout;
            }
            if (_.isBoolean(args.allowMultiple)) {
                this.allowMultiple = args.allowMultiple;
            }
        },
        findMessageFromQueue: function(msg, num) {
            for (var i = 0; i < this.activeMessages.length ; i++) {
                if (num !== undefined) {
                    if (this.activeMessages[i].message === msg && num === this.activeMessages[i].id) {
                        return i;
                    }
                }
                else {
                    if (this.activeMessages[i].message === msg) {
                        return i;
                    }
                }
            }
            return -1;
        },
        removeMessageFromQueue: function(msg, num, destroy) {
            var index = this.findMessageFromQueue(msg, num);
            if (index >= 0) {
                if (destroy) {
                    this.activeMessages[index].el.off();
                    this.activeMessages[index].el.remove();
                }
                if (this.activeMessages[index].timeoutFunc) {
                    clearTimeout(this.activeMessages[index].timeoutFunc);
                }
                this.activeMessages.splice(index, 1);
            }
        },
        showMessage:function(msg, type) {
            var self = this;
            if (!this.rendered) {
                this.$el = $(this.container);
                this.rendered = true;
            }
            if (!type) {
                type = "important";
            }
            var index = new Date().getTime();
            var options = {message: msg, type: type, index: index};
            var messageTemplate = _.template('<div class="label label-<%= type %>" data-id="<%= index %>" style="border-radius:4px;font-size:14px;padding:10px;margin-bottom:5px;color:white;width:350px;float:left;clear:both">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<span class="inner-text"><%= message %></span>' +
            '</div>');

            var $label = $(messageTemplate(options));
            // remove existing label with same message before creating a new one, if needed
            if (this.allowMultiple === false && this.findMessageFromQueue(msg) >= 0) {
                this.removeMessageFromQueue(msg, undefined, true);
            }
            var timeoutFunc = setTimeout(function() {
                $label.remove();
            }, this.timeout);

            this.activeMessages.push({
                message: msg,
                el: $label,
                timeoutFunc: timeoutFunc,
                id: index
            });
            this.$el.append($label);
            $label.on("remove destroy", function(ev) {
                self.removeMessageFromQueue(msg, $(ev.target).data("id"));
            });
        },
        showModalMessage:function(msg) {
            /*  Still work in progress
                REQUIRES a block like this already in the DOM to work:

                <div id="alert-messages-modal-container" class="modal hide" data-backdrop="static">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h3>Warning</h3>
                  </div>
                  <div class="modal-body">
                    <div class="modal-alert-container"></div>
                  </div>
                  <div class="modal-footer">
                    <a id="overview-new-configuration-modal-cancel-btn" class="btn btn-mini btn-warning" data-dismiss="modal" aria-hidden="true">Ok</a>    
                  </div>
                </div>
            */
            var self = this;
            if (!this.renderedModal) {
                this.$elModal = $(this.modalContainer);
                this.renderedModal = true;
            }
            if (this.allowMultiple === true || this.findMessageFromQueue(msg) < 0) {
                this.activeMessages.push({message: msg});
                var messageTemplate = _.template('<div class="alert alert-<%= type %> fade in">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<label><%= message %></label>' +
                    '</div>');
                
                var options = {
                    type: 'error',
                    message: msg
                };

                this.$elModal.find('.modal-alert-container').html(messageTemplate(options));
                this.$elModal.show();

                // ensure the alert is removed once the modal is closed
                this.$elModal.on('hide', function () {
                  self.$elModal.find('.modal-alert-container').empty();
                    self.removeMessageFromQueue(msg);
                });
            }
        }
    });
    return view.AlertMessageView;
});
