(function(global, undefined) {
    var fs = global.fs || {};

    global.fs = fs;

    fs.page = {
        PC_TYPE: 'pc',
        H5_TYPE: 'h5',
        error: {
            id: "40023114821",
            key: "LF4002",
            shopId: "58501945"
        },
        test: function() {
            var me = this;
            this.type = this.PC_TYPE;
            chrome.tabs.create({
                url: 'fsTestCanvas.html'
            }, function(tab) {
                me.activeTab = tab;
            });
        },
        init: function() {
            this.type = this.PC_TYPE;
            fsMain.getShopData(this.loadData.bind(this));
            // setInterval(this.pushLocalStorage.bind(this), 30 * 1000);
        },
        picInitDone: function() {

        },
        loadData: function(shops) {
            var me = this,
                map = {};
            this.shops = shops;
            util.each(shops, function(i, shop) {
                util.it(shop.items, function(key, value) {
                    if (!value.isUpload) {
                        map[key] = {
                            id: key,
                            itemKey: value,
                            shopId: shop.id,
                            shop: shop
                        };
                        return false;
                    }
                });
            });
            this.itemsMap = map;
            this.createTab();
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
            var item;
            util.it(this.itemsMap, function(key, value) {
                item = value;
                return false;
            });
            if (!item) {
                return;
            }
            this.activeWin = win;
            this.activeItem = item;
            this.activeDirMap = item.shop.picDirMap;
            if (this.type == this.H5_TYPE) {
                this.getH5DescHTML(item.id, handle);
            } else {
                this.getPCDescHTML(item.id, handle);
            }
            this.createDir(item);
        },
        createDir: function(item) {
            if (item.dirId) {
                return;
            }
            fs.pictuer.sendMessage({
                topic: 'createDir',
                type: item.shop.name,
                dir: item.id
            });
        },
        getMetaItem: function(item) {
            var itemId = item.id;
            item = item.shop.items[itemId] || {};
            item.shop.items[itemId] = item;
            return item;
        },
        doCreateDirSuccess: function(config) {
            var item = this.itemsMap[config.dir];
            item.dirId = config.id;
            getMetaItem(item).dirId = config.id;
        },
        getPCDescHTML: function(id, handle) {
            var me = this;
            $.ajax({
                // cache: false,
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
                // cache: false,
                url: config.urls.h5desc + id,
                dataType: 'text',
                success: function(html) {
                    me.doH5DescHTML(id, html, handle);
                },
                error: function(msg) {

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
        captureTabPNG: function(index, data, format) {
            var item = this.activeItem;
            fs.pictuer.sendMessage({
                topic: 'upload',
                index: index,
                dirId: item.dirId,
                file: data,
                itemId: item.id,
                file_name: item.itemKey + '_' + index + '.' + format
            });
            // console.info('captureTabPNG[' + index + ']', data);
        },
        doUploadSuccess: function(config) {
            var activeItem = this.activeItem;
            activeItem.picList = activeItem.picList || {};
            var index = config.index;
            delete config.index;
            delete config.itemId;
            delete config.topic;
            activeItem.picList[index] = config;
        },
        captureDone: function() {
            this.uploadShopData();
            this.activeWin.location.reload();
        },
        uploadShopData: function() {
            var activeItem = this.activeItem;
            var shop = activeItem.shop;
            var list = [];
            delete this.itemsMap[this.activeItem.id];
            util.it(activeItem.picList, function(i, item) {
                list.push(item);
            });
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    id: activeItem.itemKey,
                    shop: activeItem.shopId,
                    filename: activeItem.id + '_urls' + '.json',
                    data: JSON.stringify(list)
                },
                success: function(data) {},
                error: function() {}
            });

            getMetaItem(activeItem).isUpload = 1;

            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: 'shop_' + shop.id + '.json',
                    dir: '',
                    data: JSON.stringify(shop)
                },
                success: function(data) {},
                error: function() {}
            });

        },
        testInit: function() {
            fsMain.getShopData(this.testLoadData.bind(this));
        },
        testLoadData: function(shops) {
            var me = this,
                map = {};
            this.shops = shops;
            util.each(shops, function(i, shop) {
                util.it(shop.items, function(key, value) {
                    if (!value.isUpload) {
                        var item = {
                            key: value
                        };
                        shop.items[key] = item;
                        map[key] = {
                            id: key,
                            itemKey: value,
                            shopId: shop.id,
                            shop: shop,
                            metaItem: item
                        };
                    }
                    return false;
                });
            });
            this.itemsMap = map;

            var item;
            util.it(this.itemsMap, function(key, value) {
                item = value;
                return false;
            });
            if (!item) {
                return;
            }

            this.activeItem = item;
            this.createDir(this.activeItem);
        },
        testUploadPic: function() {
            var item = this.activeItem;
            var dirId = item.dirId;
            for (var i = 0; i < 5; i++) {
                fs.pictuer.sendMessage({
                    topic: 'upload',
                    itemId: item.id,
                    index: i,
                    dirId: item.dirId,
                    file: localStorage['image_base64'],
                    file_name: item.id + '_' + i + '.png'
                });
            }
        }
    };


})(window);
