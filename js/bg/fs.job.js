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
            classjs.log();
            this.loadJobData();
        },
        initEvent: function() {},
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
            return this.shop.id + '_' + this.task_type + '_' + this.data_type + '_' + fs.data.jobIndex + '.json';
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
                url: config.urls.data + this.shop.id + '_job_data' + fs.data.jobIndex + '.json',
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
            this.emit('loadJobAfter');
        },
        getItem: function() {
            classjs.log();
            var data = this.itemData;
            var shop = this.shop;
            var item = data.list[data.index];
            if (!item) {
                console.error("no item job...");
                return null;
            }

            var activeItem = util.merger({}, item, {
                type: shop.name
            });

            this.activeItem = activeItem;

            return activeItem;
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
            classjs.log();
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
            console.warn('>>upload job meta item data index:' + this.itemData.index);
        },
        getJobFileName: function() {
            return this.shop.id + '_' + this.task_type + '_job_' + fs.data.jobIndex + '_' + this.data_type + '.json';
        },
        uploadErrorJobData: function() {
            var list = [];
            util.each(this.itemData.list, function(i, item) {
                if (item.isError) {
                    delete item.isError;
                    list.push(item);
                }
            });
            var data = {
                index: 0,
                list: list
            };
            var shop = this.shop;
            $.ajax({
                type: 'POST',
                url: config.urls.upload,
                data: {
                    filename: this.getJobFileName(),
                    data: JSON.stringify(data)
                },
                success: function() {},
                error: function() {}
            });
        }
    });

})(window);