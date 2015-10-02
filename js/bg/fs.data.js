(function(global, undefined) {

    classjs({
        className: 'fs.data',
        extendEvent: true,
        singleton: true,
        shops: config.shops,
        shop: config.shops[0],
        jobIndex: 1,
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
                        var activeItem = me.getItem(id);
                        cfg.data.getDetail(activeItem.id, function(data) {
                            activeItem.mainData = data;
                            callback(activeItem);
                        });

                    } else if (this.is(request, 'getAttrUL')) {
                        cfg.data.getAttrUL(id, function(html) {
                            callback({
                                html: html
                            });
                        });
                    } else if (this.is(request, 'getDetail')) {
                        if (!me.h5DescImageMap[id] || !me.pcDescImageMap[id] || !me.mainImageMap[id]) {
                            me.doPublishError(id);
                            callback({
                                isError: true
                            });
                            return;
                        }
                        var data = me.activeItem.mainData;
                        data.h5DescUrls = me.h5DescImageMap[id].urls;
                        data.pcDescUrls = me.pcDescImageMap[id].urls;
                        data.mainImageUrls = me.mainImageMap[id].urls;
                        data.shop = me.shop;
                        callback(data);
                    } else if (this.is(request, 'getProperty')) {
                        cfg.data.getProperty(id, function(data) {
                            callback(data);
                        });
                    } else if (this.is(request, 'publish')) {
                        callback(me.doPublish(id));
                    } else if (this.is(request, 'publishError')) {
                        callback(me.doPublishError(id));

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
            var map = {};
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
                    console.error('node server no start up...');
                }
            });
        },
        getItem: function(id) {
            var item;
            var shop = this.shop;
            if (id) {
                item = this.metaItemMap[id];
            } else {
                var data = this.itemData;
                item = data.list[data.index];
            }
            item.type = shop.name;

            var activeItem = util.merger({}, item);

            this.activeItem = activeItem;

            return activeItem;
        },
        doPublish: function(itemId) {
            if (!itemId) {
                itemId = this.activeItem.id;
            }
            this.itemData.index = this.itemIdMapIndex[itemId] + 1;
            this.uploadData();
            console.warn('meta item data index:' + this.itemData.index);
        },
        doPublishError: function(itemId) {
            if (!itemId) {
                itemId = this.activeItem.id;
            }
            var index = this.itemIdMapIndex[itemId];
            this.itemData.list[index].isError = true;
            this.itemData.index = index + 1;
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
        uploadNewJobData: function(index) {
            if (index == undefined) {
                index = this.itemData.index;
            }
            var list = this.itemData.list.slice(index, index + 200);
            var data = {
                start: index,
                end: index + list.length,
                index: 0,
                list: list
            };
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: shop.id + '_job_data' + this.jobIndex + '.json',
                    data: JSON.stringify(data)
                },
                success: function() {},
                error: function() {}
            });
        }
    });

    fs.data.init();


})(window);