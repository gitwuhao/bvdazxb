(function(global, undefined) {




    classjs({
        className: 'tb.plugin',
        singleton: true,
        init: function() {
            tb.publish.init();
        }
    });



    classjs({
        className: 'tb.publish',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            this.client = new connect.client({
                id: 'data',
                onConnect: function() {
                    me.doClientInitDone();
                }
            });
        },
        doClientInitDone: function() {
            this.client.send('publish');
            setTimeout(function() {
                window.location.href = "https://upload.taobao.com/auction/sell.jhtml";
            }, 3 * 1000);
        }
    });



})(window);