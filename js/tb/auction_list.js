(function(global, undefined) {

    classjs({
        className: 'tb.auctionList',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;

            this.includeCSS();
            this.initButton();
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
        }
    });

    window.addEventListener('load', function() {
        var src = config.getURL('js/lib/s.js');
        $(document.body).append('<script src="' + src + '" charset="utf-8"></script>');
        tb.auctionList.init();
    });



})(window);
