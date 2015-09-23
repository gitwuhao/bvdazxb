(function(global, undefined) {

    classjs({
        className: 'fs.data',
        extendEvent: true,
        singleton: true,
        shops: config.shops,
        shop: config.shops[0],
        type: 'default',
        init: function() {
            this.initData();
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
        initData: function() {
            var me = this;
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + shop.id + '_' + this.type + '.json',
                dataType: 'text',
                success: function(data) {
                    me.doInitData(JSON.parse(data));
                },
                error: function() {
                    console.error('node server no start up...')
                }
            });
        },
        doInitData: function(data) {
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
            this.uploadData();
        },
        uploadData: function() {
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: shop.id + '_' + this.type + '.json',
                    data: JSON.stringify(this.itemData)
                },
                success: function() {},
                error: function() {}
            });
        }
    });

    fs.data.init();


})(window);
