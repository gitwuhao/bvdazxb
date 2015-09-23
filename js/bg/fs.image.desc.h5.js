(function(global, undefined) {

    classjs({
        className: 'fs.image.desc.h5',
        extend: 'fs.dir',
        desc_type: 'h5',
        data_type: 'handu_pc',
        task_type: 'desc',
        initEvent: function() {
            classjs.log();
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    classjs.log();
                    if (this.is(request, 'imageInitDone')) {
                        me.uploadImage();
                    } else if (this.is(request, 'uploadSuccess')) {
                        me.doUploadSuccess(request);
                    } else {
                        console.error('no request handle:', request);
                    }
                }
            });
        },
        uploadImage: function() {
            classjs.log();
            var item = this.getItem();
            if (!item) {
                return;
            }
            var me = this;
            $.ajax({
                url: config.urls.h5desc + item.id,
                dataType: 'text',
                success: function(html) {
                    me.doH5DescHTML(item.id, html);
                },
                error: function(msg) {

                }
            });
        },
        doH5DescHTML: function(itemId, html) {
            var item = this.metaItemMap[itemId];
            var fsHTML = new util.html(html);
            var data = this.getH5Desc(fsHTML);
            if (data) {
                html = data.wdescContent.pages.join('');
                fsHTML = new util.html(html);
                this.doUploadH5DescImage(item, fsHTML.getTagContext('img'));
            } else {
                item.isUrls = false;
                console.error('no find h5 desc', item);
                this.uploadJob(item.id);
                this.uploadImage();
            }
        },
        getH5Desc: function(fsHTML) {
            var array = fsHTML.getTagContext('script');
            if (array.length < 1) {
                return null;
            }
            return fsHTML.getDataByKey('wdescData', array);
        },
        doUploadH5DescImage: function(item, array) {
            var me = this;
            var dir = this.itemDirMap[item.id];
            this.task = new util.task({
                item: item,
                dir_id: dir.dir_id,
                shop: this.shop,
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
                    var file_name = activeItem.key + '_' + shop_name + '_desc_h5_' + index + '.' + format;
                    util.image.getDataBySrc(src, function(data) {
                        me.server.request('uploadImage', {
                            dirId: dir_id,
                            data: data,
                            rate: '0.95',
                            index: index,
                            itemId: activeItem.id,
                            file_name: file_name
                        }, function() {

                        });
                    }, format);
                },
                finish: function() {
                    classjs.log();
                    me.uploadJob(this.item.id);
                    setTimeout(function() {
                        me.uploadImage();
                    }, 1000);
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
            item.urls = item.urls || {};
            item.urls[request.index] = request.url;
            this.task.next();
        }
    });

    classjs({
        className: 'fs.image.desc.handuh5',
        extend: 'fs.image.desc.h5',
        shop: config.shops[0],
        data_type: 'handu_h5'
    });


    classjs({
        className: 'fs.image.desc.amhh5',
        extend: 'fs.image.desc.h5',
        shop: config.shops[1],
        data_type: 'amh_h5'
    });
})(window);
