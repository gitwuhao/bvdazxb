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

            array.push(this.checkSelected.bind(this));

            new util.task({
                array: array,
                timeout: 500,
                handle: function(task) {
                    task();
                }
            });

        },
        checkSelected: function() {
            var $selected = $('#J_SearchResult .selected:first');
            if ($selected[0]) {
                E.dispatch($selected[0], "dblclick");
                setTimeout(function() {
                    window.location.reload();
                }, 50 * 1000);
            } else {
                setTimeout(this.checkSelected.bind(this), 1000);
            }

        }
    });

    window.addEventListener('load', function() {

        var src = config.getURL('js/lib/s.js');

        $(document.body).append('<script src="' + src + '" charset="utf-8"></script>');

        tb.sell.init();
    });



})(window);