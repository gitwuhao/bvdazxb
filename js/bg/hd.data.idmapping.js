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
                    data: JSON.stringify(this.mainData)
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
        }
    });




})(window);
