(function(global, undefined) {

    classjs({
        className: 'fs.data',
        extendEvent: true,
        singleton: true,
        shops: config.shops,
        shop: config.shops[0],
        jobIndex: 2,
        type: 'default',
        init: function() {
            this.initData();
            this.initEvent();
        },
        initEvent: function() {
            var me = this;
            new connect.server({
                id: 'data',
                onMessage: function(request, sender, callback) {
                    var id = request.id;
                    if (this.is(request, 'getItemDetailByMyItemId')) {
                        me.doGetItemDetailByMyItemId(id, callback);
                    }
                }
            });
        },
        initData: function() {
            this.initMyMapHDData();
            this.initHDKeyMapData();
            this.initItemIdKeyData();
        },
        initItemIdKeyData: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + 'item_id_key.json',
                dataType: 'text',
                success: function(data) {
                    data = JSON.parse(data);
                    me.doInitItemIdKeyData(data);
                },
                error: function() {}
            });
        },
        doInitItemIdKeyData: function(data) {
            this.itemIdKeyMap = data;
        },
        initHDKeyMapData: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + 'hd_key_map.json',
                dataType: 'text',
                success: function(data) {
                    data = JSON.parse(data);
                    me.doInitHDKeyMapData(data);
                },
                error: function() {}
            });
        },
        doInitHDKeyMapData: function(data) {
            this.hdKeyMap = data;
        },
        initMyMapHDData: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + 'my_map_hd.json',
                dataType: 'text',
                success: function(data) {
                    data = JSON.parse(data);
                    me.doInitMyMapHDData(data);
                },
                error: function() {}
            });
        },
        doInitMyMapHDData: function(data) {
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
        getHDIdByKey: function(key) {
            return this.hdKeyMap[key];
        },
        doGetItemDetailByMyItemId: function(id, callback) {
            id = this.getHanduItemId(id);
            if (id) {
                var key = this.itemIdKeyMap[id];
                var hdId = this.getHDIdByKey(key);
                cfg.data.getDetail(id, function(data) {
                    callback({
                        id: id,
                        hdId: hdId,
                        data: data
                    });
                });
            }
        }
    });

    fs.data.init();


})(window);
