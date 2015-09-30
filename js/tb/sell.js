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
            this.client.send('getItem', {}, function(item) {
                me.execute(item);
            });
        },
        execute: function(item) {

            this.categoryId = item.mainData.detail.itemDO.categoryId;


            var array = [];
            var key = item.key;
            var me = this;
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
                timeout: 1000,
                handle: function(task) {
                    task();
                }
            });

        },
        checkCount: 0,
        checkSelected: function() {
            this.checkCount++;
            var $li = $('#J_SearchResult [data-sid=' + this.categoryId + ']:first');
            if ($li[0]) {
                E.dispatch($li[0], "dblclick");
            }
            if (this.checkCount > 5) {
                this.client.send('publishError');
                return;
            }
            setTimeout(this.checkSelected.bind(this), 5 * 1000);
        }
    });

    window.addEventListener('load', function() {

        var src = config.getURL('js/lib/s.js');

        $(document.body).append('<script src="' + src + '" charset="utf-8"></script>');

        tb.sell.init();
    });



})(window);
