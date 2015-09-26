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
            this.initPCDescImageData();
            this.initH5DescImageData();
            this.initMainImageData();
            this.initEvent();
        },
        initEvent: function() {
            var me = this;
            new connect.server({
                id: 'data',
                onMessage: function(request, sender, callback) {
                    var id = request.id;
                    if (this.is(request, 'getItem')) {
                        var item;
                        if (id) {
                            item = me.metaItemMap[id];
                        } else {
                            item = me.getItem();
                        }
                        callback(item);
                    } else if (this.is(request, 'getAttrUL')) {
                        cfg.data.getAttrUL(id, function(html) {
                            callback({
                                html: html
                            });
                        });
                    } else if (this.is(request, 'getDetail')) {
                        cfg.data.getDetail(id, function(data) {
                            data.h5DescUrls = me.h5DescImageMap[id].urls;
                            data.pcDescUrls = me.pcDescImageMap[id].urls;
                            data.mainImageUrls = me.mainImageMap[id].urls;
                            data.shop = me.shop;
                            callback(data);
                        });
                    } else if (this.is(request, 'getProperty')) {
                        cfg.data.getProperty(id, function(data) {
                            callback(data);
                        });
                    } else if (this.is(request, 'publish')) {
                        callback(me.doPublish(id));
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
            var metaItemMap = {};
            this.itemData = data;
            util.each(data.list, function(i, item) {
                map[item.id] = i;
                metaItemMap[item.id] = item;
            });
            this.metaItemMap = metaItemMap;
            this.itemIdMapIndex = map;
        },
        getDataURL: function(shop, dataType, type) {
            return config.urls.data + shop.id + '_' + dataType + '_' + shop.name + '_' + type + '.json';
        },
        initPCDescImageData: function() {
            var me = this;
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                async: false,
                url: this.getDataURL(shop, 'desc', 'pc'),
                dataType: 'text',
                success: function(data) {
                    me.pcDescImageMap = JSON.parse(data);
                },
                error: function() {
                    console.error('node server no start up...')
                }
            });
        },
        initH5DescImageData: function() {
            var me = this;
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                async: false,
                url: this.getDataURL(shop, 'desc', 'h5'),
                dataType: 'text',
                success: function(data) {
                    me.h5DescImageMap = JSON.parse(data);
                },
                error: function() {
                    console.error('node server no start up...')
                }
            });
        },
        initMainImageData: function() {
            var me = this;
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                async: false,
                url: this.getDataURL(shop, 'main', 'pc'),
                dataType: 'text',
                success: function(data) {
                    me.mainImageMap = JSON.parse(data);
                },
                error: function() {
                    console.error('node server no start up...')
                }
            });
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
        },
        getPCDescHTML: function(itemId, handel) {

        }
    });

    fs.data.init();


})(window);