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
                $('#J_SearchButton').click(function() {
                    $('#J_CatePubBtn').click();
                });
            });
        }
    });

    window.addEventListener('load', function() {
        tb.sell.init();
    });

})(window);