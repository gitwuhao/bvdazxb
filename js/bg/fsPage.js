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
            setInterval(this.pushLocalStorage.bind(this), 3 * 60 * 1000);
        },
        picInitDone: function() {

        },
        loadLS: function() {
            this.type = this.PC_TYPE;
            var data = localStorage['items_map'];
            this.itemsMap = JSON.parse(data);
            this.createTab();
            setInterval(this.pushLocalStorage.bind(this), 3 * 60 * 1000);
        },
        loadData: function(shops) {
            var me = this,
                map = {};
            util.each(shops, function(i, shop) {
                me.loadShopDirMap(shop);
                util.it(shop.items, function(key, value) {
                    if (!value.picList) {
                        var item = {
                            key: value
                        };
                        shop.items[key] = item;
                        map[key] = {
                            id: key,
                            itemKey: value,
                            shopId: shop.id,
                            shop: shop,
                            item: item
                        };
                    }
                    return false;
                });
            });
            this.itemsMap = map;
            this.createTab();
        },
        loadShopDirMap: function(shop) {
            shop.ls_dir_key = 'pic_dir_map' + shop.id;
            var data = localStorage[shop.ls_dir_key];
            if (data) {
                data = JSON.parse(data);
            }
            shop.picDirMap = data || {};
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
            var dirId = this.activeDirMap[item.id];
            fs.pictuer.sendMessage({
                topic: 'upload',
                index: index,
                dirId: dirId,
                file: data,
                file_name: item.itemKey + '.' + format
            });
            // console.info('captureTabPNG[' + index + ']', data);
        },
        doUploadSuccess: function(config) {
            var item = this.itemsMap[config.itemId].item;
            item.picList = item.picList || {};
            var index = config.index;
            delete config.index;
            item.picList[index] = config;
        },
        captureDone: function() {

        },
        captureDone2: function(captures) {
            var me = this;
            var item = this.activeItem;
            new fs.AjaxTask({
                array: captures,
                _index_: 0,
                getAjaxcfg: function(capture) {
                    return {
                        type: 'POST',
                        url: config.urls.upload,
                        data: {
                            id: item.key,
                            shop: item.shopId,
                            filename: item.id + '_' + (++this._index_) + '.png',
                            dir: '',
                            data: capture.data
                        }
                    };
                },
                handle: function(capture, data) {

                },
                finish: function() {
                    me.finishCapture();
                }
            });
        },
        finishCapture: function() {
            delete this.itemsMap[this.activeItem.id];
            this.activeWin.location.reload();
        },
        pushLocalStorage: function() {
            var shop = this.activeItem.shop;
            // var data = JSON.stringify(this.itemsMap);
            // localStorage['items_map'] = data;

            // $.ajax({
            //     type: 'POST',
            //     url: config.urls.upload,
            //     data: {
            //         filename: 'items_map.json',
            //         dir: '',
            //         data: data
            //     },
            //     success: function(data) {},
            //     error: function() {}
            // });


            // var dirData = JSON.stringify(this.activeDirMap);
            // localStorage[shop.ls_dir_key] = dirData;


            // $.ajax({
            //     type: 'POST',
            //     url: config.urls.upload,
            //     data: {
            //         filename: shop.ls_dir_key + '.json',
            //         dir: '',
            //         data: dirData
            //     },
            //     success: function(data) {},
            //     error: function() {}
            // });

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
        createDir: function(item) {
            if (this.activeDirMap[item.id]) {
                return;
            }
            fs.pictuer.sendMessage({
                topic: 'createDir',
                type: item.shop.name,
                dir: item.id
            });
        },
        doCreateDirSuccess: function(config) {
            this.activeDirMap[config.dir] = config.id;
        }
    };


})(window);