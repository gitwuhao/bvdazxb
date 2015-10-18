(function(global, undefined) {


    classjs({
        className: 'connect.port',
        extendEvent: true,
        statics: {
            INIT_CLIENT: '###init_client###',
            connects: {},
            register: function(connect) {
                this.connects[connect.id] = connect;
                console.info('server #' + connect.id + ' register success', connect);
            },
            /*
             *{
             *   id:
             *   tabId:
             *
             *}
             */
            init: function(config) {
                var connect = this.connects[config.id];
                if (!connect) {
                    console.error('no find server:', config);
                } else {
                    connect.create(config);
                }
            }
        },
        id: 'port',
        ready: function() {},
        create: function(config) {},
        initEvent: function() {},
        send: function(topic, data) {

        },
        onMessage: function(request, sender) {

        },
        createMessage: function(topic, data) {
            var message = data || {};
            message.__topic__ = topic;
            message.__queue_id__ = this.queueIndex;
            return message;
        },
        is: function(request, topic) {
            if (request.__topic__ == topic) {
                return true;
            }
            return false;
        }
    });

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        var tab = sender.tab;
        if (request.__topic__ == connect.port.INIT_CLIENT) {
            connect.port.init({
                id: request.id,
                tabId: tab.id,
                __queue_id__: request.__queue_id__
            });
        }
        // chrome.tabs.executeScript(tab.id, {
        //     file: "js/lib/s.js",
        //     runAt: "document_start"
        // }, function() {

        // });
    });



    classjs({
        className: 'connect.client',
        extend: 'connect.port',
        id: 'client',
        queueIndex: Date.now(),
        msgQueue: {},
        ready: function() {
            this.create();
        },
        create: function() {
            var me = this;

            chrome.extension.onConnect.addListener(function(port) {
                me.port = port;
                me.initEvent();
                me.onConnect();
            });

            chrome.extension.sendMessage(this.createMessage(connect.port.INIT_CLIENT, {
                id: this.id
            }), function(portId) {

            });

            this.create = util.emptyFn;
        },
        initEvent: function() {
            var me = this;
            this.port.onMessage.addListener(function(request, sender) {
                me.onMessage(request, sender);
            });
        },
        send: function(topic, data, callback) {
            var message = this.createMessage(topic, data);
            message.__request_id__ = 'queue::' + (this.queueIndex++);
            if (callback) {
                this.msgQueue[message.__request_id__] = callback;
            }
            this.port.postMessage(message);
        },
        onMessage: function(request, sender) {
            var callback = this.msgQueue[request.__request_id__];
            if (callback) {
                callback(request);
            }
        },
        onConnect: function() {

        }
    });


    classjs({
        className: 'connect.server',
        extend: 'connect.port',
        id: 'server',
        queueIndex: Date.now(),
        msgQueue: {},
        portMap: {},
        ready: function() {
            connect.port.register(this);
        },
        initPort: function(port) {
            var me = this;
            port.onMessage.addListener(function(request, sender) {
                request.port = port;
                me.onMessage(request, sender, function(data) {
                    if (util.isString(data)) {
                        request.__topic__ = data;
                        data = {};
                    }
                    me.response(port, request, data);
                });
                var callback = me.msgQueue[request.__request_id__];
                if (callback) {
                    callback(request);
                }
            });
        },
        response: function(port, request, data) {
            var message = this.createMessage(request.__topic__, data);
            message.__request_id__ = request.__request_id__;
            port.postMessage(message);
        },
        request: function(port, topic, data, callback) {
            var message = this.createMessage(topic, data);
            message.__request_id__ = 'queue::' + (this.queueIndex++);
            if (callback) {
                this.msgQueue[message.__request_id__] = callback;
            }
            port.postMessage(message);
        },
        send: function(topic, data) {
            var message = this.createMessage(topic, data);
            this.port.postMessage(message);
        },
        getPort: function(message) {
            return this.portMap[message.__queue_id__];
        },
        create: function(config) {
            var me = this;
            var port = chrome.tabs.connect(config.tabId);
            this.portMap[config.__queue_id__] = port;
            this.initPort(port);
            // this.create = util.emptyFn;
        }
    });


})(window);