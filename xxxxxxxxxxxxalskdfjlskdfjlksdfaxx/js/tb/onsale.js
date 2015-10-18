(function(global, undefined) {

    classjs({
        className: 'tb.onsale',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            this.includeCSS();
            this.initButton();
            if (this.isAutoSync()) {
                // var $a = $('#sold-amount-label:first');
                // if (!$a.is('.order-by-asce')) {
                // E.dispatch($a[0], "click");
                // } else {
                this.initClient();
                // }
            }
        },
        initClient: function() {
            var me = this;
            this.client = new connect.client({
                id: 'tb.sync',
                onConnect: function() {
                    me.doClientInitDone();
                },
                onMessage: function(request, sender) {
                    classjs.log();
                    this.callPrototype();
                    if (this.is(request, 'uploadTaskItemIdData')) {
                        me.uploadTaskItemIdData(request);
                    } else if (this.is(request, 'nextPage')) {
                        me.nextPage();
                    }
                }
            });
        },
        doClientInitDone: function() {

            this.client.send('ready');

        },
        includeCSS: function() {
            var css = config.getURL('css/tb/auction-list.css');
            $(document.body).append('<link rel="stylesheet" href="' + css + '"/>');
        },
        initButton: function() {
            var fsboxId = 'fs_d_b' + Date.now();
            var html = ['<div id="', fsboxId, '" class="fs-detail-info">',
                '<button class="autoSync fs-btn">启动自动同步</button>',
                '</div>'
            ];
            $(document.body).append(html.join(''));

            var fsBox = $('#' + fsboxId);
            var me = this;
            var $autoSyncButton = fsBox.children('.autoSync:first');
            $autoSyncButton.on('click', function(event) {
                me.doAutoSync();
            });
            this.$autoSyncButton = $autoSyncButton;
            if (this.isAutoSync()) {
                this.$autoSyncButton.html('停止自动同步');
            } else {
                this.$autoSyncButton.html('启动自动同步');
            }

        },
        LS_KEY: 'tb.onsale.isAutoSync',
        isAutoSync: function() {
            return localStorage[this.LS_KEY] == 'true';
        },
        doAutoSync: function() {
            if (this.isAutoSync()) {
                localStorage[this.LS_KEY] = 'false';
                this.$autoSyncButton.html('启动自动同步');
            } else {
                localStorage[this.LS_KEY] = 'true';
                this.$autoSyncButton.html('停止自动同步');
            }
            location.reload();
        },
        nextPage: function() {
            var $nextPage = $('#J_DataTable').find('.next-page:first a');
            if ($nextPage[0]) {
                setTimeout(function() {
                    E.dispatch($nextPage[0], "click");
                }, 1 * 1000);
            } else {
                this.client.send('dofinish');
            }
        },
        uploadTaskItemIdData: function() {
            var $table = $('#J_DataTable');
            var map = {};
            $('.goods-sid', $table).each(function(i, tr) {
                var $goodsTR = $(tr);
                var $withTR = $goodsTR.next();
                var $auctionIdNumber = $goodsTR.find('.auctionIdNumber:first');
                var label = $auctionIdNumber.text();
                var auctionId = label.match(/(\d+)/)[1];
                $auctionIdNumber.html('<a href="http://detail.tmall.com/item.htm?id=' + auctionId + '" target="_blank">' + label + '</a>');
                var $checkbox = $goodsTR.find(':checkbox[name="selectedIds"]:first');
                var itemId = $checkbox.val();
                map[auctionId] = itemId;
            });

            this.client.send('doUploadTaskItemIdData', {
                data: map
            });
        }
    });

    function get(eid) {
        return document.getElementById(eid);
    };

    window.addEventListener('load', function() {
        var src = config.getURL('js/lib/s.js');
        $(document.body).append('<script src="' + src + '" charset="utf-8"></script>');
        tb.onsale.init();
    });



})(window);