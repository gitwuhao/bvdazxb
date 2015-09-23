(function(global, undefined) {

    classjs({
        className: 'fs.dir',
        extend: 'fs.job',
        ready: function() {
            this.on('loadJobAfter', function() {
                this.loadDirMap();
            });
            this.callSuper();
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
            this.initEvent();
        }
    });

})(window);
