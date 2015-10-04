(function(global, undefined) {

    classjs({
        className: 'tb.auctionList',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;

            this.includeCSS();
            this.initButton();
            setTimeout(this.initDataTable.bind(this), 1000);
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
                '</div>'
            ];
            $(document.body).append(html.join(''));

            var fsBox = $('#' + fsboxId);
            var me = this;
            fsBox.children('.handu:first').on('click', function(event) {
                me.doQuery('韩都衣舍');
            });
            fsBox.children('.amh:first').on('click', function(event) {
                me.doQuery('amh');
            });
            fsBox.children('.up-shelf:first').on('click', function(event) {
                me.doUpShelf();
            });


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

                var goods_num = $(get('goods_num:' + $checkbox.val())).val();
                if (goods_num == '1') {
                    $checkbox.remove();
                } else {
                    $checkbox.attr('checked', true);
                }
            });

        },
        doUpShelf: function() {
            var $table = $('#J_DataTable');

            $('.kbutton', $table).each(function(i, button) {
                var text = button.innerText.replace(/\s/g, '');
                if (text == '上架') {
                    console.info(button);
                    // E.dispatch(button, "click");
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