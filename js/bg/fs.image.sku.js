(function(global, undefined) {

    classjs({
        className: 'fs.image.sku',
        extend: 'fs.dir',
        data_type: 'handu_pc',
        task_type: 'sku',
        initEvent: function() {
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'imageInitDone')) {
                        me.uploadSkuPics();
                    } else if (this.is(request, 'uploadSuccess')) {
                        me.doUploadSuccess(request);
                    } else {
                        console.error('no request handle:', request);
                    }
                }
            });
        },
        uploadSkuPics: function() {
            var me = this;
            var item = this.getItem();
            if (!item) {
                return;
            }
            cfg.data.getSkuPics(item.id, function(detail) {
                me.createTask(item, detail || {});
            });
        },
        createTask: function(item, detail) {
            var valItemInfo = detail.valItemInfo || {};
            var skuPics = valItemInfo.skuPics;
            if (!skuPics) {
                this.doUploadError(item.id);
                return;
            }
            var me = this;
            var array = [];
            util.it(skuPics, function(key, value) {
                array.push({
                    skuId: key,
                    src: value
                });
            })
            var dir = this.itemDirMap[item.id];
            var shop = this.shop;
            me.task = new util.task({
                item: item,
                dir_id: dir.dir_id,
                shop: shop,
                array: array,
                timeout: 0,
                autoRun: true,
                handle: function(task) {
                    var index = this.index;
                    var skuId = task.skuId;
                    var dir_id = this.dir_id;
                    var format = 'jpg';
                    var activeItem = this.item;
                    var shop_name = this.shop.name;
                    util.image.getDataBySrc(task.src, function(data) {
                        me.server.request('uploadImage', {
                            dirId: dir_id,
                            data: data,
                            rate: '0.95',
                            index: skuId,
                            itemId: activeItem.id,
                            file_name: activeItem.key + '_' + shop_name + '_sku_' + index + '.' + format
                        }, function() {

                        });
                    }, format);
                },
                finish: function() {
                    me.uploadJob(this.item.id);
                    me.uploadSkuPics();
                }
            });
        },
        doUploadError: function(itemId) {
            var index = this.itemIdMapIndex[itemId];
            this.itemData.list[index].isError = true;
            this.uploadJob(itemId);
            this.uploadSkuPics();
        },
        /*
        index: 1
        itemId: 40383157998
        picId: "106140123855287987"
        url: 
        */
        doUploadSuccess: function(request) {
            var item = this.metaItemMap[request.itemId];
            item.skuPics = item.skuPics || {};
            item.skuPics[request.index] = request.url;
        }
    });


    classjs({
        className: 'fs.image.sku.handu',
        extend: 'fs.image.sku',
        shop: config.shops[0],
        data_type: 'handu_pc'
    });


    classjs({
        className: 'fs.image.sku.amh',
        extend: 'fs.image.sku',
        shop: config.shops[1],
        data_type: 'amh_pc'
    });


})(window);