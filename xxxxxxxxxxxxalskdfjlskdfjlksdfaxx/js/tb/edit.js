(function(global, undefined) {

    //http://upload.taobao.com/auction/publish/edit.htm?itemNumId=522761265384&auto=false

    classjs({
        className: 'tb.plugin',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            setTimeout(function() {
                me.ready();
            }, 5 * 1000);
        },
        isError: function() {
            return location.hash.indexOf('isError') > -1;
        },
        ready: function() {
            var me = this;
            this.itemId = config.getItemId(location.href);
            if (this.isError()) {
                this.doInStock();
                this.initValuesFinish();
                return;
            }

            this.client = new connect.client({
                id: 'data',
                onConnect: function() {
                    me.doClientInitDone();
                }
            });
        },
        // isStopRun: false,
        goError: function() {
            // var me = this;
            // setTimeout(function() {
            //     if (!me.isStopRun) {
            //         window.location.href = "https://upload.taobao.com/auction/sell.jhtml";
            //     }
            // }, 3 * 1000);


            setTimeout(function() {
                location.hash = 'isError';
                location.reload();
            }, 50 * 1000);
        },
        doPublishError: function() {
            // this.client.send('publishError');
            // this.goSell();
            // this.goError();

            location.hash = 'isError';
            location.reload();
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
            this.mainData = this.activeItem.mainData;
            this.mainData.shop = {};
            this.uncheckField();
            this.includeCSS();
            this.initDetailBox();
            this.loadDetailData();
        },
        uncheckField: function() {
            var me = this;
            $('input[data-type=quantity]').each(function(i, input) {
                var id = $(input).attr('data-id');
                var args = id.split('_');
                me.uncheckSizeField(args[0]);
                me.uncheckColorField(args[1]);
            });
        },
        uncheckSizeField: function(id) {
            var $checkbox = $('#prop_' + id);
            if (!$checkbox[0]) {
                $checkbox = $('[value="' + id.replace('-', ':') + '"]');
            }
            $checkbox[0].checked = true;
            E.dispatch($checkbox[0], "click");
        },
        uncheckColorField: function(id) {
            var $checkbox = $('#prop_' + id);
            if (!$checkbox[0]) {
                $checkbox = $('[value="' + id.replace('-', ':') + '"]');
            }
            $checkbox[0].checked = true;
            E.dispatch($checkbox[0], "click");
        },
        loadDetailData: function() {
            var id = this.activeItem.id;
            var data = this.activeItem.mainData;
            if (data.isError) {
                this.goError();
            } else {
                this.doDetailData(data);
            }

        },
        doDetailData: function(data) {
            this.mainData = data;
            this.initDetailInfo();

            var taskArray = [];

            this.initSKUValues();

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

        },
        checkQualification: function() {
            var quantity = 0;
            $('input[data-type=quantity]').each(function(i, input) {
                var value = input.value;
                if (quantity < parseInt(value)) {
                    quantity = parseInt(value);
                }
            });

            if (quantity < 10) {
                this.doInStock();
            } else {
                this.doOnSale();
            }
            this.initValuesFinish();
        },
        doOnSale: function() {
            var $now = $('#_now0');
            $now[0].checked = false;
            E.dispatch($now[0], "click");
            $now.attr('checked', true);
        },
        doInStock: function() {
            var $inStock = $('#inStock');
            $inStock[0].checked = false;
            E.dispatch($inStock[0], "click");
            $inStock.attr('checked', true);
        },
        initValuesFinish: function() {
            var me = this;

            var price = 0;

            $('input[data-type=price]').each(function(i, input) {
                var value = input.value;
                if (price < parseFloat(value)) {
                    price = parseFloat(value);
                }
            });

            $('input[data-type=price]').each(function(i, input) {
                input.value = price;
            });

            $('input.J_ImgInput').each(function(i, input) {
                input.value = '';
            });

            $('#buynow').val(price);

            if (!this.mainData || this.mainData.isSoldOut == true) {
                this.doInStock();
            }

            setTimeout(function() {
                if (me.client) {
                    me.client.send('finish', {
                        itemId: me.itemId
                    });
                }
                E.dispatch($('#event_submit_do_edit')[0], "click");
            }, 5000);

            this.goError();
        }
    });






})(window);