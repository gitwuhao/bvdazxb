(function(global, undefined) {

    //http://upload.taobao.com/auction/publish/edit.htm?itemNumId=522761265384&auto=false

    classjs({
        className: 'tb.plugin',
        singleton: true,
        init: function() {
            var me = this;
            setTimeout(function() {
                me.ready();
            }, 10 * 1000);
        },
        ready: function() {
            var me = this;
            this.client = new connect.client({
                id: 'data',
                onConnect: function() {
                    me.doClientInitDone();
                }
            });
        },
        // isStopRun: false,
        goSell: function() {
            // var me = this;
            // setTimeout(function() {
            //     if (!me.isStopRun) {
            //         window.location.href = "https://upload.taobao.com/auction/sell.jhtml";
            //     }
            // }, 3 * 1000);
        },
        doPublishError: function() {
            // this.client.send('publishError');
            // this.goSell();
        },
        doClientInitDone: function() {
            var me = this;
            var itemId = $('#outerIdId').val();
            this.client.send('getItem', {
                id: itemId
            }, function(item) {
                me.activeItem = item;
                me.initData();
            });
        },
        initData: function() {
            this.includeCSS();
            this.initDetailBox();
            this.loadDetailData();
        },
        loadDetailData: function() {
            var me = this;
            var id = this.activeItem.id;

            this.client.send('getDetail', {
                id: id
            }, function(data) {
                if (data.isError) {
                    me.goSell();
                } else {
                    me.doDetailData(data);
                }
            });

        },
        doDetailData: function(data) {
            this.mainData = data;
            this.initDetailInfo();

            var taskArray = [];
            this.initSizeValues(taskArray);

            this.initColorValues(taskArray);

            this.initSkuFieldValues(taskArray);

            taskArray.push(this.initSKUPics.bind(this));


            new util.task({
                array: taskArray,
                timeout: 1000,
                handle: function(task) {
                    task();
                }
            });

        }
    });



})(window);