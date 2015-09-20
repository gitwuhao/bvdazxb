(function(global, undefined) {

    classjs({
        className: 'fs.data',
        extendEvent: true,
        statics: {
            reloadHotSell: function(index) {

            },
            getShopList: function(index, page, sort) {
                var me = this;
                var shop = this.shops[index],
                    url = 'https://' + shop.name + '.m.tmall.com/shop/shop_auction_search.do',
                    data = {
                        index: index,
                        spm: 'a320p.7692171.0.0',
                        suid: shop.suid,
                        sort: sort || 'hotsell',
                        p: page || 1,
                        page_size: 12,
                        from: 'h5',
                        shop_id: shop.id,
                        ajson: 1,
                        source: 'tmallsearch'
                    };

                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    data: data,
                    success: function(json) {
                        me.doItemListJson(json, data);
                    },
                    error: function(msg) {

                    }
                });
            },
            doItemListJson: function(json, data) {
                var me = this;
                var shop = this.shops[data.index];
                if (json.items) {
                    util.each(json.items, function(i, item) {
                        shop.items[item.item_id] = me.getKey(item.title);
                    });

                    if (json.items.length == json.page_size) {
                        setTimeout(function() {
                            me.getShopList(data.index, data.p + 1, data.sort);
                        }, 3000);
                    } else {
                        localStorage[shop.id] = JSON.stringify(shop);
                    }
                }
            }
        }
    });




})(window);