(function(global, undefined) {

    classjs({
        className: 'fs.image.main',
        extend: 'fs.job',
        data_type: 'handu_pc',
        task_type: 'main',
        ready: function() {
            this.on('loadJobAfter', function() {
                this.initEvent();
                console.warn('wait client connect,open http://tadget.taobao.com/redaction/manager.htm#isImage ...');
            });
            this.callSuper();
        },
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
            cfg.data.getDetailImages(item.id, function(data) {
                me.executeTask(item, data);
            });
        },
        executeTask: function(item, data) {

            this.activeTaskData = data;
            this.activeItem = item;

            this.executeMainTask();
        },
        executeMainTask: function() {
            var data = this.activeTaskData;
            var item = this.activeItem;
            var main = data.main;
            var array = [];
            util.each(main, function(i, src) {
                array.push({
                    key: i,
                    src: src
                });
            });
            this.createTask(item, 'main', array, this.executeAttachTask.bind(this));
        },
        executeAttachTask: function() {
            var data = this.activeTaskData;
            var item = this.activeItem;
            var attach = data.attach;
            var array = [];
            util.each(attach, function(i, src) {
                array.push({
                    key: i,
                    src: src
                });
            });
            this.createTask(item, 'attach', array, this.executeSKUTask.bind(this));
        },
        executeSKUTask: function() {
            var data = this.activeTaskData;
            var item = this.activeItem;
            var sku = data.sku;
            var array = [];
            util.it(sku, function(key, value) {
                array.push({
                    key: key,
                    src: value
                });
            });
            this.createTask(item, 'sku', array, this.finishAllTask.bind(this));
        },
        finishAllTask: function() {
            var item = this.activeItem;
            this.uploadJob(item.id);
            this.uploadMainImage();
        },
        createTask: function(item, type, array, finish) {
            var shop = this.shop;
            var me = this;
            me.task = new util.task({
                shop: shop,
                array: array,
                timeout: 0,
                autoRun: true,
                execute: function(taskItem) {
                    var index = this.index;
                    var format = 'jpg';
                    var task = this;
                    var shop_name = this.shop.name;
                    util.image.getDataBySrc(taskItem.src, function(data) {
                        me.server.request('uploadImage', {
                            data: data,
                            rate: '0.95',
                            type: type,
                            key: taskItem.key,
                            itemId: item.id,
                            file_name: item.key + '_' + shop_name + '_' + type + '_' + index + '.' + format
                        }, function() {

                        });
                    }, format);
                },
                finish: function() {
                    if (finish) {
                        finish();
                    }
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
                item.sku = item.sku || {};
                item.sku[oldRequest.key] = request.url;
            } else if (oldRequest.type == 'attach') {
                item.attach = item.attach || {};
                item.attach[oldRequest.key] = request.url;
            } else if (oldRequest.type == 'main') {
                item.main = item.main || {};
                item.main[oldRequest.key] = request.url;
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