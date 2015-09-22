(function(global, undefined) {

    classjs({
        className: 'fs.data',
        extendEvent: true,
        singleton: true,
        shops: config.shops,
        shop: config.shops[0],
        type: 'default',
        init: function() {
            this.loadItem();
            this.initEvent();
        },
        initEvent: function() {
            var me = this;

            new connect.server({
                id: 'data',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'getItem')) {
                        callback(me.getItem());
                    } else if (this.is(request, 'publish')) {
                        callback(me.doPublish(request.id));
                    }
                }
            });
        },
        loadItem: function() {
            var me = this;
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + shop.id + '_' + this.type + '.json',
                dataType: 'text',
                success: function(data) {
                    me.doLoadItems(JSON.parse(data));
                },
                error: function() {}
            });
        },
        doLoadItems: function(data) {
            this.itemData = data;
            var map = {};
            util.each(data.list, function(i, item) {
                map[item.id] = i;
            });
            this.itemIdMapIndex = map;
        },
        getItem: function() {
            var data = this.itemData;
            var shop = this.shop;
            return util.merger({}, data.list[data.index], {
                type: shop.name
            });
        },
        doPublish: function(itemId) {
            this.itemData.index = this.itemIdMapIndex[itemId] + 1;
            this.uploadData(this.shop.id, this.type, JSON.stringify(this.itemData));
        },
        downloadItemData: function() {
            var me = this;
            util.each(this.shops, function(i, shop) {
                var newShop = {};
                util.merger(newShop, shop);
                newShop.items = [];
                setTimeout(function() {
                    me.getShopList(newShop, 1, 'hotsell', 100);
                }, 1000);
            });
        },
        getShopList: function(shop, page, sort, maxLength) {
            var me = this;
            var url = 'https://' + shop.name + '.m.tmall.com/shop/shop_auction_search.do',
                data = {
                    spm: 'a320p.7692171.0.0',
                    suid: shop.suid,
                    //default、hotsell、oldstarts
                    sort: sort || 'default',
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
                    me.doItemListJson(shop, json, data, maxLength);
                },
                error: function(msg) {

                }
            });
        },
        doItemListJson: function(shop, json, data, maxLength) {
            var me = this;
            if (!json.items) {
                return;
            }
            util.each(json.items, function(i, item) {
                shop.items.push({
                    id: item.item_id,
                    key: me.getKey(item.title)
                });
            });

            if (parseInt(json.current_page) >= parseInt(json.total_page) || (maxLength && shop.items.length >= maxLength)) {
                this.uploadData(shop.id, data.sort, JSON.stringify({
                    index: 0,
                    list: shop.items
                }));
            } else {
                setTimeout(function() {
                    me.getShopList(shop, data.p + 1, data.sort, maxLength);
                }, 3000);
            }

        },
        uploadData: function(shopId, type, data) {
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: shopId + '_' + type + '.json',
                    data: data
                },
                success: function() {},
                error: function() {}
            });
        }
    });

    fs.data.init();


})(window);
