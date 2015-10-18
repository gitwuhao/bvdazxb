(function(global, undefined) {

    classjs({
        className: 'hd.data',
        extendEvent: true,
        singleton: true,
        init: function() {
            this.initEvent();
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
                if (id == -1) {
                    handle(true);
                } else {
                    me.checkSoldOutById(id, function(rs) {
                        if (rs == -1) {
                            handle(true);
                        } else {
                            handle(rs);
                        }
                    });
                }
            });
        },
        getGoodsId: function(key, handle) {
            var me = this;
            $.ajax({
                url: 'http://cn.bing.com/search?q=site%3Awww.handu.com+goods+' + key,
                dataType: 'text',
                success: function(html) {
                    me.doGoodsId(html, handle);
                },
                error: function(msg) {
                    handle(-1);
                }
            });
        },
        doGoodsId: function(html, handle) {
            var args = html.match(/goods\-\d+/);
            if (args && args[0]) {
                args = args[0].match(/(\d+)/);
                handle(args[0]);
            } else {
                handle(-1);
            }
        },
        checkSoldOutById: function(id, handle) {
            var me = this;
            $.ajax({
                url: 'http://www.handu.com/goods-' + id + '.html',
                dataType: 'text',
                success: function(html) {
                    me.doCheckSoldOut(html, handle);
                },
                error: function(msg) {
                    handle(-1);
                }
            });
        },
        doCheckSoldOut: function(html, handle) {
            if (html == '') {
                handle(-1);
                return;
            }
            var result = false;
            var fsHTML = new util.html(html);
            var detail = fsHTML.getById('goods_detail_2');
            var link = detail.querySelector('.cannotbuy');
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