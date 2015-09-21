(function(global, undefined) {

    classjs({
        className: 'fs.image.desc',
        extendEvent: true,
        singleton: true,
        shops: config.shops,
        shop: config.shops[0],
        PC_TYPE: 'pc',
        H5_TYPE: 'h5',
        data_type: 'images',
        dir_suffix: 'desc',
        init: function() {
            this.type = this.PC_TYPE;
            this.loadItem();
            this.initEvent();
            fsPlugin.register(this);
        },
        initEvent: function() {
            this.on('captureImage', this.doCaptureImage);
            this.on('captureDone', this.doCaptureDone);
        },
        initServer: function() {
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'imageInitDone')) {
                        me.createTab();
                    } else if (this.is(request, 'uploadSuccess')) {
                        me.doUploadSuccess(request);
                    }
                }
            });
        },
        doCaptureImage: function(event) {
            var item = this.activeItem;
            var dir = this.itemDirMap[item.id];
            this.server.request('uploadImage', {
                dirId: dir.dir_id,
                data: event.data,
                rate: '0.95',
                itemId: item.id,
                index: event.index,
                file_name: item.key + '_desc_' + event.index + '.' + event.format
            }, function() {

            });
        },
        doCaptureDone: function() {
            var me = this;
            setTimeout(function() {
                var item = me.activeItem;
                me.itemData.index = me.itemIdMapIndex[item.id] + 1;
                me.uploadData();
                me.activeWin.location.reload();
            }, 1000);
        },
        createTab: function() {
            var type = this.type,
                me = this,
                url = 'fsPCCanvas.html';
            if (type == this.H5_TYPE) {
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
            if (this.type == this.H5_TYPE) {
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
        doH5DescHTML: function(id, html, handle) {
            var fsHTML = new util.html(html);
            var data = this.getH5Desc(fsHTML);
            var html = data.wdescContent.pages.join('');
            fsHTML = new util.html(html);
            var array = fsHTML.getTagContext('img');
            html = array.join('');
            if (handle) {
                handle(array);
            }
            return html;
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
            item.urls = item.urls || [];
            item.urls.push(request.url);
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
        doLoadItems: function(data) {
            this.itemData = data;
            var map = {};
            var metaItemMap = {};

            util.each(data.list, function(i, item) {
                map[item.id] = i;
                metaItemMap[item.id] = item;
            });
            this.itemIdMapIndex = map;
            this.metaItemMap = metaItemMap;
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
        getItemDataFileName: function() {
            return this.shop.id + '_' + this.dir_suffix + '_' + this.data_type + '.json';
        },
        uploadData: function() {
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