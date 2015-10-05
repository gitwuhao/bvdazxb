(function(global, undefined) {

    classjs({
        className: 'fs.image.main',
        extend: 'fs.dir',
        data_type: 'handu_pc',
        task_type: 'main',
        initEvent: function() {
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'imageInitDone')) {
                        me.uploadMainImage();
                    } else if (this.is(request, 'uploadSuccess')) {
                        me.doUploadSuccess(request);
                    } else {
                        console.error('no request handle:', request);
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
            var shop = this.shop;
            cfg.data.getDetailImages(item.id, function(array) {
                me.createTask(array);
            });
        },
        createTask: function(item, array) {
            var me = this;
            me.task = new util.task({
                item: item,
                dir_id: dir.dir_id,
                shop: shop,
                array: array,
                timeout: 0,
                autoRun: true,
                execute: function(taskItem) {
                    var index = this.index;
                    var key = taskItem.key;
                    var dir_id = this.dir_id;
                    var type = taskItem.type;
                    var format = 'jpg';
                    var activeItem = this.item;
                    var task = this;
                    var shop_name = this.shop.name;
                    util.image.getDataBySrc(taskItem.src, function(data) {
                        me.server.request('uploadImage', {
                            dirId: dir_id,
                            data: data,
                            rate: '0.95',
                            type: type,
                            key: key,
                            itemId: activeItem.id,
                            file_name: activeItem.key + '_' + shop_name + '_' + type + '_' + index + '.' + format
                        }, function() {

                        });
                    }, format);
                },
                finish: function() {
                    me.uploadJob(this.item.id);
                    // me.uploadMainImage();
                }
            });
        },
        /*
        index: 1
        itemId: 40383157998
        picId: "106140123855287987"
        url: 
        */
        doUploadSuccess: function(request) {
            var item = this.metaItemMap[request.itemId];
            var oldRequest = request.request;
            if (oldRequest.type == 'sku') {
                item.skuPics = item.skuPics || {};
                item.skuPics[oldRequest.key] = request.url;
            } else {
                item.urls = item.urls || {};
                item.urls[oldRequest.key] = request.url;
            }
            this.task.next();
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