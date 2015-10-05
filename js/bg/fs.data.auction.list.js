(function(global, undefined) {

    classjs({
        className: 'fs.data.auction.list',
        extendEvent: true,
        singleton: true,
        init: function() {
            this.initMainData();
        },
        ready: function() {
            this.initEvent();
            var type = 1;
            if (type) {
                type = 'isHanDu';
            } else {
                type = 'isAMH';
            }
            chrome.tabs.create({
                url: 'https://sell.taobao.com/auction/merchandise/auction_list.htm?type=1#' + type
            }, function(tab) {});
        },
        initEvent: function() {
            var me = this;
            this.server = new connect.server({
                id: 'auction_list',
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
            var mainData = {};
            util.it(data, function(key, value) {
                var list = mainData[key] || [];
                list.push(value);
                mainData[key] = list;
            });
            this.mainData = mainData;
            this.ready();
        },
        doUploadItemIdData: function(data) {
            var me = this;
            var mainData = this.mainData;
            util.it(data, function(key, value) {
                var list = mainData[key] || [];
                list.push(value);
                if (list.length > 1) {
                    console.info('repeat id:' + key);
                }
                mainData[key] = list;
            });
            this.nextPage();
            // console.info(mainData);
        },
        findRepeatMainData: function() {
            var me = this;
            var mainData = this.mainData;
            util.it(mainData, function(key, array) {
                var list = array || [];
                if (list.length > 1) {
                    console.info('repeat id:' + key);
                }
                mainData[key] = array[0];
            });
        },
        getDataFileName: function() {
            return 'item_id_map.json';
        },
        uploadItemIdMap: function() {
            this.findRepeatMainData();
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getDataFileName(),
                    data: JSON.stringify(this.mainData)
                },
                success: function() {},
                error: function() {}
            });
        },
        nextPage: function() {
            this.server.request('nextPage');
        }
    });


    console.info('https://sell.taobao.com/auction/merchandise/auction_list.htm?type=1');


})(window);