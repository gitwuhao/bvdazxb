(function(global, undefined) {

    classjs({
        className: 'tb.sell',
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
            var me = this;
            this.client.send('getItem', {}, function(data) {
                $('#J_SearchKeyWord,#J_SearchKey').val(data.key);
                setTimeout(function() {
                    E.dispatch($('#J_SearchButton')[0], "click");
                    // E.dispatch($('#J_CatePubBtn')[0], "click");
                }, 3000);
            });
        }
    });

    window.addEventListener('load', function() {
        tb.sell.init();
    });

})(window);