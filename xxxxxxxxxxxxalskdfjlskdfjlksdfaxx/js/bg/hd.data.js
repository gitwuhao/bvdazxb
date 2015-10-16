(function(global, undefined) {

    classjs({
        className: 'hd.data',
        extendEvent: true,
        singleton: true,
        init: function() {
            this.ready();
        },
        ready: function() {
            this.initEvent();
            chrome.tabs.create({
                url: 'https://sell.taobao.com/auction/merchandise/auction_list.htm?type=11#isRun'
            }, function(tab) {});

        },
        initEvent: function() {
            var me = this;
            new connect.server({
                id: 'data',
                onMessage: function(request, sender, callback) {
                    var id = request.id;
                    if (this.is(request, 'checkSoldOut')) {
                        me.checkSoldOutByKey(request.key, function(isSoldOut) {
                            callback({
                                id: id,
                                isSoldOut: isSoldOut
                            });
                        });
                    }
                }
            });
        },
        checkSoldOutByKey: function(key, handle) {
            var me = this;
            this.getGoodsId(key, function(id) {
                me.checkSoldOutById(id, handle);
            });
        },
        getGoodsId: function(key, callback) {
            $.ajax({
                url: 'http://cn.bing.com/search?q=site%3Awww.handu.com+' + key,
                dataType: 'text',
                success: function(html) {
                    me.doGoodsId(key, html, callback);
                },
                error: function(msg) {

                }
            });
        },
        doGoodsId: function(key, html, callback) {
            var args = html.match(/goods\-\d+/);
            if (args && args[0]) {
                args = args[0].match(/(\d+)/);
                callback(args[0]);
            }
        },
        checkSoldOutById: function(id, handle) {
            $.ajax({
                url: 'http://www.handu.com/goods-' + id + '.html',
                dataType: 'text',
                success: function(html) {
                    me.doCheckSoldOut(html, handle);
                },
                error: function(msg) {

                }
            });
        },
        doCheckSoldOut: function(html, handle) {
            var result = false;
            var fsHTML = new util.html(html);
            var detail = fsHTML.getById('goods_detail_2');
            var link = detail.querySelectorAll('.cannotbuy');
            if (link) {
                var title = link.getAttribute('title') || '';
                if (title.match(/下架|无货/)) {
                    result = true;
                }
            }
            if (handle) {
                handle(result);
            }
        }
    });

})(window);