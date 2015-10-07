(function(global, undefined) {

    classjs({
        className: 'tb.checkitem',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            setTimeout(function() {
                me.ready();
            }, 10 * 1000);
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
            var me = this;
            var myItemId = window.location.href.match(/\d{10,13}/);

            this.client.send('getItemByMyItemId', {
                id: myItemId
            }, function(item) {
                me.activeItem = item;
                me.initData();
            });
        }
    });



})(window);