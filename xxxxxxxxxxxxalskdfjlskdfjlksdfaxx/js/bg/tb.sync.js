(function(global, undefined) {

    classjs({
        className: 'tb.sync',
        extendEvent: true,
        singleton: true,
        init: function() {
            this.initEvent();
            this.initMainData();
        },
        initEvent: function() {
            var me = this;
            this.server = new connect.server({
                id: 'tb.sync',
                onMessage: function(request, sender, callback) {
                    var id = request.id;
                    if (this.is(request, 'doUploadTaskItemIdData')) {
                        me.doUploadTaskItemIdData(request.data);
                    } else if (this.is(request, 'ready')) {
                        this.request('uploadTaskItemIdData');
                    } else if (this.is(request, 'dofinish')) {
                        me.createTask();
                    }
                }
            });


        },
        initMainData: function() {
            this.taskArray = [];
            setTimeout(function() {

                chrome.tabs.create({
                    url: 'https://sell.taobao.com/auction/merchandise/auction_list.htm?type=11'
                }, function(tab) {});

            }, 15 * 1000);
        },
        doUploadTaskItemIdData: function(data) {
            var me = this;
            var mainData = this.mainData;
            util.it(data, function(key, value) {
                me.taskArray.push({
                    auctionId: key,
                    itemId: value
                })
            });
            this.nextPage();
            // this.doFinish();
        },
        nextPage: function() {
            this.server.request('nextPage');
        },
        createTask: function() {
            this.task = new util.task({
                array: this.taskArray,
                timeout: 0,
                tabMap: {},
                autoRun: true,
                execute: this.executeTask.bind(this),
                finish: function() {
                    me.doFinish();
                }
            });

            this.executeNextIndex = 0;
            setTimeout(this.executeNext.bind(this), 30 * 1000);
        },
        doFinish: function() {

        },
        executeNext: function() {
            this.task.next();
            if (this.executeNextIndex < 5) {
                setTimeout(this.executeNext.bind(this), 60 * 1000);
            }else{
                this.executeNext=function(){};
            }
            this.executeNextIndex++;
        },
        executeTask: function(task) {
            var me = this;

            (function(t) {
                chrome.tabs.create({
                    url: 'https://upload.taobao.com/auction/publish/edit.htm?item_num_id=' + t.itemId + '&auto=false'
                }, function(tab) {
                    me.task.tabMap[t.itemId] = tab;
                });
            })(task);

        },
        removeTab: function(itemId) {
            var tab = this.task.tabMap[itemId];
            if (tab) {
                chrome.tabs.remove(tab.id);
            }
        },
        next: function(itemId) {
            setTimeout(this.removeTab.bind(this, itemId), 30 * 1000);
            this.task.next();
        }
    });

    tb.sync.init();

})(window);