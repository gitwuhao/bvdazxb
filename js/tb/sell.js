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
        doPublishError: function() {
            this.client.send('publishError');
            this.goSell();
        },
        goSell: function() {
            setTimeout(function() {
                window.location.reload();
            }, 3 * 1000);
        },
        execute: function(data) {
            var mainData = data.mainData;
            var detail = mainData.detail;
            var mdskip = mainData.mdskip;

            if (!mdskip.defaultModel) {
                this.doPublishError();
                return;
            }

            var item = detail.itemDO;
            if (item.title.match(/鞋|靴|背包|女包|男包|皮带/)) {
                this.doPublishError();
                return;
            }
            var itemData = {
                title: item.title,
                itemId: item.itemId,
                price: item.reservePrice,
                list: []
            };
            this.categoryId = item.categoryId;


            var array = [];
            var key = data.key;
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
                this.doPublishError();
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