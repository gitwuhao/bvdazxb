(function(global, undefined) {


    //publishItemSuccess

    classjs({
        className: 'tb.plugin',
        extendEvent: true,
        singleton: true,
        init: function() {
            this.ready();
        },
        ready: function() {
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