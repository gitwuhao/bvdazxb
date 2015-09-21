(function(global, undefined) {

    classjs({
        className: 'fs.dir',
        extendEvent: true,
        shops: config.shops,
        shop: config.shops[0],
        parent_dir_name: 'handu_pc',
        data_type: 'images',
        dir_suffix: 'desc',
        ready: function() {
            this.loadItem();
        },
        initServer: function() {
            var me = this;
            this.server = new connect.server({
                id: 'image',
                onMessage: function(request, sender, callback) {
                    if (this.is(request, 'imageInitDone')) {
                        me.doCreateDir();
                    } else if (this.is(request, 'createDirSuccess')) {
                        me.doCreateDirSuccess(request);
                    } else if (this.is(request, 'uploadSuccess')) {
                        me.doUploadSuccess(request);
                    }
                }
            });
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
            util.each(data.list, function(i, item) {
                map[item.id] = i;
            });
            this.itemIdMapIndex = map;
            this.loadItemDirMap();
        },
        getItemDirMapFileName: function() {
            return this.shop.id + '_dir.json';
        },
        loadItemDirMap: function() {
            var me = this;
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getItemDirMapFileName(),
                dataType: 'text',
                success: function(data) {
                    me.doLoadItemDirMap(JSON.parse(data));
                },
                error: function() {
                    me.doLoadItemDirMap();
                }
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
        doCreateDir: function() {
            var item = this.getItem();
            if (!item) {
                return;
            }
            this.activeItem = util.merger({}, item);
            this.server.send('createDir', {
                itemId: item.id,
                dir_name: item.id + '_' + this.dir_suffix,
                parent_dir_name: this.parent_dir_name
            });
        },
        doCreateDirSuccess: function(request) {
            var item = this.activeItem;
            item.dir_id = request.id;
            this.itemDirMap[item.id] = item;
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getItemDirMapFileName(),
                    data: JSON.stringify(this.itemDirMap)
                },
                success: function() {},
                error: function() {}
            });
            this.uploadItem(this.activeItem.id);
            setTimeout(this.doCreateDir.bind(this), 3 * 1000);
        },
        doUploadSuccess: function(request) {

        },
        uploadItem: function(itemId) {
            this.itemData.index = this.itemIdMapIndex[itemId] + 1;
            this.uploadData();
        },
        getItemDataFileName: function() {
            return this.shop.id + '_' + this.dir_suffix + '_' + this.data_type + '.json';
        },
        uploadData: function(shopId, data) {
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

    // fs.dir.init();
})(window);
