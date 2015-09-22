(function(global, undefined) {

    classjs({
        className: 'fs.image.main',
        extend: 'fs.job',
        shops: config.shops,
        shop: config.shops[0],
        data_type: 'handu_pc',
        task_type: 'main',
        initServer: function() {
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'imageInitDone')) {
                        me.uploadMainImage();
                    } else if (this.is(request, 'uploadSuccess')) {
                        me.doUploadSuccess(request);
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
            util.data.getDetailMainImage(item.id, function(array) {
                new util.task({
                    item: item,
                    dir_id: dir.dir_id,
                    shop: shop,
                    array: array,
                    timeout: 0,
                    autoRun: true,
                    execute: function(src) {
                        var index = this.index;
                        var dir_id = this.dir_id;
                        var format = 'jpg';
                        var activeItem = this.item;
                        var task = this;
                        var shop_name = this.shop.name;
                        util.image.getDataBySrc(src, function(data) {
                            me.server.request('uploadImage', {
                                dirId: dir_id,
                                data: data,
                                rate: '0.95',
                                index: index,
                                itemId: activeItem.id,
                                file_name: activeItem.key + '_' + shop_name + '_main_' + index + '.' + format
                            }, function() {

                            });
                            setTimeout(task.complete.bind(task, src), 300);
                        }, format);
                    },
                    finish: function() {
                        me.uploadJob(this.item.id);
                        me.uploadMainImage();
                    }
                });
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
            item.urls = item.urls || {};
            item.urls[request.index] = request.url;
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
