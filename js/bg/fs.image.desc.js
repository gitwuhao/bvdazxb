(function(global, undefined) {

    classjs({
        className: 'fs.image.desc',
        extend: 'fs.dir',
        desc_type: 'pc',
        PC_TYPE: 'pc',
        H5_TYPE: 'h5',
        data_type: 'handu_pc',
        task_type: 'desc',
        ready: function() {
            this.callSuper();
            this.initPlugin();
        },
        initPlugin: function() {
            this.on('captureImage', this.doCaptureImage);
            this.on('captureDone', this.doCaptureDone);
            fsPlugin.register(this);
        },
        initEvent: function() {
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'imageInitDone')) {
                        me.createTab();
                    } else if (this.is(request, 'uploadSuccess')) {
                        me.doUploadSuccess(request);
                    } else {
                        console.error('no request handle:', request);
                    }
                }
            });
        },
        doCaptureImage: function(event) {
            var item = this.activeItem;
            var dir = this.itemDirMap[item.id];
            var shop_name = this.shop.name;
            var file_name = item.key + '_' + shop_name + '_desc_' + this.desc_type + '_' + event.index + '.' + event.format;
            this.activeWin.document.title = file_name;
            this.server.request('uploadImage', {
                dirId: dir.dir_id,
                data: event.data,
                rate: '0.95',
                itemId: item.id,
                index: event.index,
                file_name: file_name
            }, function() {

            });
        },
        doCaptureDone: function() {
            var me = this;
            this.activeWin.document.title = 'doCaptureDone...';
            setTimeout(function() {
                var item = me.activeItem;
                me.uploadJob(item.id);
                me.activeWin.location.reload();
            }, 1000);
        },
        createTab: function() {
            var me = this,
                url = 'fsPCCanvas.html';
            if (this.desc_type == this.H5_TYPE) {
                url = 'fsH5Canvas.html';
            }

            chrome.tabs.create({
                url: url
            }, function(tab) {
                me.activeTab = tab;
            });
        },
        getDescHTML: function(win, handle) {
            var item = this.getItem();
            if (!item) {
                return;
            }
            this.activeWin = win;
            this.activeItem = item;
            if (this.desc_type == this.H5_TYPE) {
                this.getH5DescHTML(item.id, handle);
            } else {
                this.getPCDescHTML(item.id, handle);
            }
        },
        getPCDescHTML: function(id, handle) {
            var me = this;
            $.ajax({
                url: config.urls.pcdesc + id,
                dataType: 'text',
                success: function(html) {
                    me.doPCDescHTML(id, html, handle);
                },
                error: function(msg) {

                }
            });
        },
        getPCDesc: function(fsHTML) {
            var array = fsHTML.getTagContext('script');
            if (array.length < 1) {
                alert('finish...');
                return null;
            }
            return fsHTML.getDataByKey('wdescData', array);
        },
        doPCDescHTML: function(id, html, handle) {
            var fsHTML = new util.html(html);
            var data = this.getPCDesc(fsHTML);
            var html = data.tfsContent;
            html = util.html.decodeHTML(html);
            if (handle) {
                handle(html);
            }
            return html;
        },
        getH5DescHTML: function(id, handle) {
            var me = this;
            $.ajax({
                url: config.urls.h5desc + id,
                dataType: 'text',
                success: function(html) {
                    me.doH5DescHTML(id, html, handle);
                },
                error: function(msg) {

                }
            });
        },
        doH5DescHTML: function(itemId, html, handle) {
            var fsHTML = new util.html(html);
            var data = this.getH5Desc(fsHTML);
            var html = data.wdescContent.pages.join('');
            fsHTML = new util.html(html);
            var array = fsHTML.getTagContext('img');
            html = array.join('');
            // if (handle) {
            this.doUploadH5DescImage(itemId, array);
            // }
            // return html;
        },
        doUploadH5DescImage: function(itemId, array) {
            var item = this.getItem();
            var dir = this.itemDirMap[item.id];
            var shop = this.shop;
            this.task = new util.task({
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
                        setTimeout(task.complete.bind(task, src), 1 * 1000);
                    }, format);
                },
                finish: function() {
                    me.uploadJob(this.item.id);
                    me.uploadMainImage();
                }
            });
        },
        getH5Desc: function(fsHTML) {
            var array = fsHTML.getTagContext('script');
            if (array.length < 1) {
                return null;
            }
            return fsHTML.getDataByKey('wdescData', array);
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
        className: 'fs.image.desc.handu',
        extend: 'fs.image.desc',
        shop: config.shops[0],
        data_type: 'handu_pc'
    });



    classjs({
        className: 'fs.image.desc.amh',
        extend: 'fs.image.desc',
        shop: config.shops[1],
        data_type: 'amh_pc'
    });


})(window);
