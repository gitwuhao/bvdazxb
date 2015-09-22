(function(global, undefined) {

    classjs({
        className: 'fs.image.main',
        shops: config.shops,
        shop: config.shops[0],
        data_type: 'images',
        ready: function() {
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
            if (!item) {
                return;
            }
            var dir = this.itemDirMap[item.id];
            util.data.getDetailMainImage(item.id, function(array) {
                new util.task({
                    item: item,
                    dir_id: dir.dir_id,
                    array: array,
                    timeout: 0,
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
                            setTimeout(task.complete.bind(task, src), 300);
                        }, format);
                    },
                    finish: function() {
                        me.uploadItem(this.item.id);
                    }
                });
            });
        },
        uploadItem: function(itemId) {
            this.itemData.index = this.itemIdMapIndex[itemId] + 1;
            this.uploadData();
            this.uploadMainImage();
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
        loadItem: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getMainJobFileName(),
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
            return this.shop.id + '_dir_' + this.data_type + '.json';
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
                alert('finish...');
                return null;
            }
            return util.merger({}, item, {
                type: shop.name
            });
        },
        getMainJobFileName: function() {
            return this.shop.id + '_main_job_' + this.data_type + '.json';
        },
        uploadData: function() {
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getMainJobFileName(),
                    data: JSON.stringify(this.itemData)
                },
                success: function() {},
                error: function() {}
            });
        }
    });


    classjs({
        className: 'fs.image.main.handu',
        extend: 'fs.image.main',
        shop: config.shops[0],
        data_type: 'handu_pc'
    });


    classjs({
        className: 'fs.image.main.amh',
        extend: 'fs.image.main',
        shop: config.shops[1],
        data_type: 'amh_pc'
    });


})(window);
