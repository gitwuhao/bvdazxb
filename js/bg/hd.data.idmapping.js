(function(global, undefined) {

    classjs({
        className: 'hd.data.idmapping',
        extendEvent: true,
        singleton: true,
        init: function() {
            this.initMainData();
        },
        ready: function() {
            var me = this;
            this.initEvent();
            chrome.tabs.create({
                url: 'http://www.handu.com/search.php?brand=1#isAutoRun'
            }, function(tab) {
                me.activeTab = tab;
                chrome.tabs.executeScript(tab.id, {
                        file: "js/lib/initClient.js",
                        runAt: "document_start"
                    },
                    function() {

                    });
            });

        },
        initEvent: function() {
            var me = this;
            this.server = new connect.server({
                id: 'hd.idmapping',
                onMessage: function(request, sender, callback) {
                    var id = request.id;
                    if (this.is(request, 'doUploadItemIdData')) {
                        me.doUploadItemIdData(request.data);
                    } else if (this.is(request, 'ready')) {
                        this.request('uploadItemIdData');
                    }
                }
            });
        },
        initMainData: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getDataFileName(),
                dataType: 'text',
                success: function(data) {
                    data = JSON.parse(data);
                    me.doInitMainData(data);
                },
                error: function() {
                    me.doInitMainData();
                }
            });
        },
        doInitMainData: function(data) {
            this.mainData = data || {};
            this.initmainData();
            this.ready();
        },
        doUploadItemIdData: function(data) {
            var me = this;
            var mainData = this.mainData;
            util.it(data, function(key, value) {
                mainData[key] = value;
            });
            this.nextPage();
        },
        getDataFileName: function() {
            return 'hd_item_id_map.json';
        },
        uploadItemIdMap: function() {
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getDataFileName(),
                    data: JSON.stringify(this.mainData || {})
                },
                success: function() {},
                error: function() {}
            });
        },
        nextPage: function() {
            this.server.request('nextPage');
        },
        initmainData: function() {
            var data = this.mainData;
            var myItemIdMap = {};
            util.it(data, function(key, value) {
                myItemIdMap[value] = key;
            });
            this.myItemIdMap = myItemIdMap;
            this.handuItemIdMap = data;
        },
        getMyItemId: function(id) {
            return this.handuItemIdMap[id];
        },
        getHanduItemId: function(id) {
            return this.myItemIdMap[id];
        },
        downloadAllItemIds: function() {
            var me = this;
            $.ajax({
                url: 'http://s.handu.com/themes/handuyishe/goods/js/goods_no0550.js',
                dataType: 'text',
                success: function(data) {
                    me.doDownloadAllItemIds(data);
                },
                error: function(msg) {

                }
            });
        },
        doDownloadAllItemIds: function(data) {
            var me = this;
            var ids = util.html.getDataByKey('goods_no_11', [data]);
            var array = [];
            util.it(ids, function(key, value) {
                array.push(key);
            });

            this.itemKeyAllMap = {};

            me.task = new util.task({
                array: array,
                timeout: 1000,
                autoRun: true,
                url: 'http://cn.bing.com/search?q=site%3Awww.handu.com+',
                execute: function(key) {
                    $.ajax({
                        url: this.url + key,
                        dataType: 'text',
                        success: function(html) {
                            me.getGoodsId(key, html);
                        },
                        error: function(msg) {

                        }
                    });
                },
                finish: function() {
                    me.uploadAllItemIds();
                }
            });

        },
        getGoodsId: function(key, html) {
            var args = html.match(/goods\-\d+/);
            if (args && args[0]) {
                args = args[0].match(/(\d+)/);
                this.itemKeyAllMap[key] = args[0];
            }

            this.task.next();
        },
        getAllItemIdsFileName: function() {
            return 'hd_all_item_ids.json';
        },
        uploadAllItemIds: function() {
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getAllItemIdsFileName(),
                    data: JSON.stringify(this.itemKeyAllMap)
                },
                success: function() {},
                error: function() {}
            });
        },
        initAllItemIds: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                url: config.urls.data + this.getAllItemIdsFileName(),
                dataType: 'text',
                success: function(data) {
                    data = JSON.parse(data);
                    me.doInitAllItemIds(data);
                },
                error: function() {}
            });
        },
        doInitAllItemIds: function(data) {
            this.itemKeyAllMap = data;
        },
        checkSoldOut: function(key, handle) {
            $.ajax({
                url: 'http://www.handu.com/goods-1031196.html',
                dataType: 'text',
                success: function(html) {
                    me.doCheckSoldOut(key, html, handle);
                },
                error: function(msg) {

                }
            });
        },
        doCheckSoldOut: function(key, html, handle) {
            var result = false;
            var fsHTML = new util.html(html);
            var detail = fsHTML.getById('goods_detail_2');
            var link = detail.querySelectorAll('.cannotbuy');
            if (link) {
                var title = link.getAttribute('title') || '';
                if (title.match(/下架|无货/)) {
                    result = true;
                }
            }
            if (handle) {
                handle(result);
            }
        }
    });




})(window);
