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
                me.execute(data);
            });
        },
        execute: function(data) {
            var array = [];
            var key = data.key;
            var $keyword = $('#J_SearchKeyWord');


            array.push(function() {
                E.dispatch($keyword[0], "focus");
                $keyword.val(key);
            });


            array.push(function() {
                E.dispatch($keyword[0], "blur");
            });

            array.push(function() {
                E.dispatch($('#J_SearchButton')[0], "click");
            });


            array.push(function() {
                E.dispatch($('#J_CatePubBtn')[0], "click");
            });


            new util.task({
                array: array,
                timeout: 500,
                handle: function(task) {
                    task();
                }
            });

        }
    });

    window.addEventListener('load', function() {
        tb.sell.init();
    });

})(window);
