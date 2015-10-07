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
            return this.shop.id + '_dir_' + this.data_type + '_' + fs.data.jobIndex + '.json';
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
        getDirItem: function(id) {
            return this.itemDirMap[id] || {


            };
        },
        doLoadDirMap: function(data) {
            this.itemDirMap = data;
            this.initEvent();
            console.warn('wait client connect,open http://tadget.taobao.com/redaction/manager.htm#isImage ...');
        }
    });

})(window);