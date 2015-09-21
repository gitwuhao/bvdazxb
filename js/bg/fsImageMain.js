(function(global, undefined) {

    classjs({
        className: 'fs.image.main',
        singleton: true,
        shops: config.shops,
        shop: config.shops[0],
        data_type: 'images',
        dir_suffix: 'main',
        init: function() {
            this.loadItem();
        },
        initServer: function() {
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'imageInitDone')) {
                        me.uploadMainImage();
                    } else if (this.is(request, 'uploadSuccess')) {
                        // me.doUploadSuccess(request);
                    }
                }
            });
        },
        uploadMainImage: function() {
            var me = this;
            var item = this.getItem();
            var dir = this.itemDirMap[item.id];
            util.data.getDetailMainImage(item.id, function(array) {
                new util.task({
                    item: item,
                    dir_id: dir.dir_id,
                    array: array,
                    timeout: 300,
                    autoRun: true,
                    execute: function(src) {
                        var index = this.index;
                        var dir_id = this.dir_id;
                        var format = 'jpg';
                        var activeItem = this.item;
                        var task = this;
                        util.image.getDataBySrc(src, function(data) {
                            me.server.request('uploadImage', {
                                dirId: dir_id,
                                data: data,
                                rate: '0.95',
                                itemId: activeItem.id,
                                file_name: activeItem.key + '_main_' + index + '.' + format
                            }, function() {

                            });
                            setTimeout(task.complete.bind(task, src), 1000);
                        }, format);
                    },
                    finish: function() {
                        me.uploadMainImage();
                        me.uploadItem(this.item.id);
                    }
                });
            });
        },
        uploadItem: function(itemId) {
            this.itemData.index = this.itemIdMapIndex[itemId] + 1;
            this.uploadData();
        },
        initLoadItemData: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.shop.id + '_default.json',
                dataType: 'text',
                success: function(data) {
                    data = JSON.parse(data);
                    data.index = 0;
                    me.doLoadItems(data);
                },
                error: function() {}
            });
        },
        getItemDirMapFileName: function() {
            return this.shop.id + '_dir.json';
        },
        loadItem: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getItemDataFileName(),
                dataType: 'text',
                success: function(data) {
                    me.doLoadItems(JSON.parse(data));
                },
                error: function() {
                    me.initLoadItemData();
                }
            });
        },
        doLoadItems: function(data) {
            this.itemData = data;
            var map = {};
            util.each(data.list, function(i, item) {
                map[item.id] = i;
            });
            this.itemIdMapIndex = map;
            this.loadItemDirMap();
        },
        getItemDirMapFileName: function() {
            return this.shop.id + '_dir.json';
        },
        loadItemDirMap: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getItemDirMapFileName(),
                dataType: 'text',
                success: function(data) {
                    me.doLoadItemDirMap(JSON.parse(data));
                },
                error: function() {}
            });
        },
        doLoadItemDirMap: function(data) {
            this.itemDirMap = data || {};
            this.initServer();
        },
        getItem: function() {
            var data = this.itemData;
            var shop = this.shop;
            var item = data.list[data.index];
            if (!item || data.index >= 200) {
                return null;
            }
            return util.merger({}, item, {
                type: shop.name
            });
        },
        uploadItem: function(itemId) {
            this.itemData.index = this.itemIdMapIndex[itemId] + 1;
            this.uploadData();
        },
        getItemDataFileName: function() {
            return this.shop.id + '_' + this.dir_suffix + '_' + this.data_type + '.json';
        },
        uploadData: function(shopId, data) {
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getItemDataFileName(),
                    data: JSON.stringify(this.itemData)
                },
                success: function() {},
                error: function() {}
            });
        }
    });

})(window);
