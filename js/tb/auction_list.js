(function(global, undefined) {

    classjs({
        className: 'tb.auctionList',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            this.initClient();
            this.includeCSS();
            this.initButton();
            setTimeout(this.initDataTable.bind(this), 1000);
        },
        initClient: function() {
            var location = window.location,
                href = location.href;
            if (href.indexOf('#isHanDu') > -1) {
                this.doHanDuQuery();
                return;
            } else if (href.indexOf('#isAMH') > -1) {
                this.doAMHQuery();
                return;
            }
            var me = this;
            this.client = new connect.client({
                id: 'idmapping',
                onConnect: function() {
                    me.doClientInitDone();
                },
                onMessage: function(request, sender) {
                    classjs.log();
                    this.callPrototype();
                    if (this.is(request, 'uploadItemIdData')) {
                        me.uploadItemIdData(request);
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
                '<button class="handu fs-btn">韩都</button>',
                '<button class="amh fs-btn">amh</button>',
                '<button class="up-shelf fs-btn">上架</button>',
                '<button class="init-table fs-btn">过滤</button>',
                '</div>'
            ];
            $(document.body).append(html.join(''));

            var fsBox = $('#' + fsboxId);
            var me = this;
            fsBox.children('.handu:first').on('click', function(event) {
                me.doHanDuQuery();
            });
            fsBox.children('.amh:first').on('click', function(event) {
                me.doAMHQuery();
            });
            fsBox.children('.up-shelf:first').on('click', function(event) {
                me.doUpShelf();
            });
            fsBox.children('.init-table:first').on('click', function(event) {
                me.initDataTable();
            });
        },
        doHanDuQuery: function() {
            this.doQuery('韩都衣舍');
        },
        doAMHQuery: function() {
            this.doQuery('amh');
        },
        doQuery: function(keyword) {
            var array = [];

            array.push(function() {
                $('#search-keyword').val(keyword);
            });

            array.push(function() {
                E.dispatch($('#queryButton')[0], "click");
            });

            new util.task({
                array: array,
                timeout: 1000,
                handle: function(task) {
                    task();
                }
            });
        },
        nextPage: function() {
            E.dispatch($('#J_DataTable').find('.next-page:first a')[0], "click");
        },
        uploadItemIdData: function() {
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

            this.client.send('doUploadItemIdData', {
                data: map
            });
        },
        initDataTable: function() {
            var $table = $('#J_DataTable');
            $('.goods-sid', $table).each(function(i, tr) {
                var $goodsTR = $(tr);
                var $withTR = $goodsTR.next();
                var $auctionIdNumber = $goodsTR.find('.auctionIdNumber:first');
                var label = $auctionIdNumber.text();
                var auctionId = label.match(/(\d+)/)[1];
                $auctionIdNumber.html('<a href="http://detail.tmall.com/item.htm?id=' + auctionId + '" target="_blank">' + label + '</a>');
                var $checkbox = $goodsTR.find(':checkbox[name="selectedIds"]:first');

                var $goods_num = $(get('goods_num:' + $checkbox.val()));
                var num = $goods_num.val();
                if (num == '1') {
                    // $checkbox.remove();
                    $goods_num.val('-');
                } else {
                    $checkbox.attr('checked', true);
                }
            });
        },
        doUpShelf: function() {
            this.initDataTable();
            var $table = $('#J_DataTable');

            $('.kbutton', $table).each(function(i, button) {
                var text = button.innerText.replace(/\s/g, '');
                if (text == '上架') {
                    // console.info(button);
                    E.dispatch(button, "click");
                    return false;
                }
            });

        }
    });

    function get(eid) {
        return document.getElementById(eid);
    };

    window.addEventListener('load', function() {
        var src = config.getURL('js/lib/s.js');
        $(document.body).append('<script src="' + src + '" charset="utf-8"></script>');
        tb.auctionList.init();
    });



})(window);