(function(global, undefined) {

    classjs({
        className: 'fs.image.dir',
        extend: 'fs.job',
        ready: function() {
            this.on('loadJobAfter', function() {
                this.initServer();
            });
            this.callSuper();
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
                    }
                }
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
                dir_name: item.id,
                parent_dir_name: this.data_type
            });
        },
        doCreateDirSuccess: function(request) {
            var item = this.metaItemMap[request.itemId];
            item.dir_id = request.id;
            this.uploadJob(item.id);
            setTimeout(this.doCreateDir.bind(this),  1000);
        }
    });

    classjs({
        className: 'fs.image.dir.handu',
        extend: 'fs.image.dir',
        shop: config.shops[0],
        data_type: 'handu_pc'
    });

    classjs({
        className: 'fs.image.dir.handuh5',
        extend: 'fs.image.dir',
        shop: config.shops[0],
        data_type: 'handu_h5'
    });

    classjs({
        className: 'fs.image.dir.amh',
        extend: 'fs.image.dir',
        shop: config.shops[1],
        data_type: 'amh_pc'
    });

    classjs({
        className: 'fs.image.dir.amhh5',
        extend: 'fs.image.dir',
        shop: config.shops[1],
        data_type: 'amh_h5'
    });
})(window);