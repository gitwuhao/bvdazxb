(function(global, undefined) {

    classjs({
        className: 'hd.idmapping',
        extendEvent: true,
        singleton: true,
        LS_KEY: 'hd.idmapping.data.idmap',
        init: function() {
            if (localStorage['isInitClient']) {
                this.initClient();
            }
        },
        initClient: function() {
            var me = this;
            this.client = new connect.client({
                id: 'hd.idmapping',
                onConnect: function() {
                    me.doClientInitDone();
                },
                onMessage: function(request, sender) {
                    classjs.log();
                    this.callPrototype();
                    if (this.is(request, 'uploadItemIdData')) {
                        me.uploadItemIdData(request);
                    } else if (this.is(request, 'nextPage')) {
                        me.nextPage();
                    }
                }
            });
        },
        doClientInitDone: function() {
            this.client.send('ready');
        },
        uploadItemIdData: function() {
            var map = {};
            util.each($('a[href^=goods]'), function(i, a) {
                var key = config.getKey(a.title);
                if (key) {
                    var value = a.href.match(/(\d+)/) || [];
                    map[key] = value[0] || '';
                }
            });
            this.client.send('doUploadItemIdData', {
                data: map
            });
        },
        nextPage: function() {
            E.dispatch($('.search_page .page.next')[0], "click");
        }
    });

    //
    window.addEventListener('load', function() {
        hd.idmapping.init();
    });


})(window);
