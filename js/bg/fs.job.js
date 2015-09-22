(function(global, undefined) {

    classjs({
        className: 'fs.job',
        extendEvent: true,
        shops: config.shops,
        // shop: config.shops[0],
        task_type: 'dir',
        data_type: 'handu_pc',
        index: 0,
        maxSize: 200,
        ready: function() {
            this.loadJobData();
        },
        initServer: function() {},
        loadJobData: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getJobDataFileName(),
                dataType: 'text',
                success: function(data) {
                    me.doLoadJobData(JSON.parse(data));
                },
                error: function() {
                    me.doLoadJobData();
                }
            });
        },
        doLoadJobData: function(data) {
            this.metaItemMap = data;
            this.loadJob();
        },
        getJobDataFileName: function() {
            return this.shop.id + '_' + this.task_type + '_' + this.data_type + '.json';
        },
        loadJob: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getJobFileName(),
                dataType: 'text',
                success: function(data) {
                    me.doLoadJob(JSON.parse(data));
                },
                error: function() {
                    me.initLoadJob();
                }
            });
        },
        initLoadJob: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.shop.id + '_default.json',
                dataType: 'text',
                success: function(data) {
                    data = JSON.parse(data);
                    me.doInitLoadJob(data);
                },
                error: function() {}
            });
        },
        doInitLoadJob: function(data) {
            var jobData = {
                index: this.index,
                list: data.list.slice(this.index, this.index + this.maxSize)
            };
            this.doLoadJob(jobData);
        },
        doLoadJob: function(data) {
            var me = this;
            var map = {};
            var metaItemMap = this.metaItemMap;
            if (!metaItemMap) {
                metaItemMap = {};
            }
            this.itemData = data;
            util.each(data.list, function(i, item) {
                map[item.id] = i;
                if (!me.metaItemMap) {
                    metaItemMap[item.id] = util.merger({}, item);
                }
            });
            if (!this.metaItemMap) {
                this.metaItemMap = metaItemMap;
            }
            this.itemIdMapIndex = map;
            this.loadDirMap();
        },
        getDirMapFileName: function() {
            return this.shop.id + '_dir_' + this.data_type + '.json';
        },
        loadDirMap: function() {
            var me = this;
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + this.getDirMapFileName(),
                dataType: 'text',
                success: function(data) {
                    me.doLoadDirMap(JSON.parse(data));
                },
                error: function() {}
            });
        },
        doLoadDirMap: function(data) {
            this.itemDirMap = data;
            this.initServer();
        },
        getItem: function() {
            var data = this.itemData;
            var shop = this.shop;
            var item = data.list[data.index];
            if (!item) {
                console.error("no item job...");
                return null;
            }
            return util.merger({}, item, {
                type: shop.name
            });
        },
        uploadJobData: function() {
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getJobDataFileName(),
                    data: JSON.stringify(this.metaItemMap)
                },
                success: function() {},
                error: function() {}
            });
        },
        uploadJob: function(itemId) {
            this.itemData.index = this.itemIdMapIndex[itemId] + 1;
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getJobFileName(),
                    data: JSON.stringify(this.itemData)
                },
                success: function() {},
                error: function() {}
            });
            this.uploadJobData();
        },
        getJobFileName: function() {
            return this.shop.id + '_' + this.task_type + '_job_' + this.data_type + '.json';
        }
    });

})(window);
