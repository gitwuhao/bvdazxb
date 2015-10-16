(function(global, undefined) {

    classjs({
        className: 'tb.onsale',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            this.initClient();
        },
        initClient: function() {
            var location = window.location,
                href = location.href;
            if (href.indexOf('#isRun') == -1) {
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
                    if (this.is(request, 'checkSoldOut')) {
                        me.checkSoldOut(request);
                    } else if (this.is(request, 'nextPage')) {
                        me.nextPage();
                    }
                }
            });
        },
        doClientInitDone: function() {
            this.client.send('ready');
        },
        checkSoldOut: function() {

        },
        nextPage: function() {
            E.dispatch($('#J_DataTable').find('.next-page:first a')[0], "click");
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
        },
        doDownShelf: function() {

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