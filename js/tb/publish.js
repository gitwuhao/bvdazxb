(function(global, undefined) {

    classjs({
        className: 'tb.plugin',
        extendEvent: true,
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
        isStopRun: false,
        goSell: function() {
            var me = this;
            setTimeout(function() {
                if (!me.isStopRun) {
                    // window.location.href = "https://upload.taobao.com/auction/sell.jhtml";
                }
            }, 3 * 1000);
        },
        doPublishError: function() {
            this.client.send('publishError');
            this.goSell();
        },
        doClientInitDone: function() {
            var me = this;
            var itemId = $('#outerIdId').val();
            if (itemId) {
                this.isEdit = true;
            }

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
            if (!this.isEdit) {
                this.initPropertyValues();

                this.initH5DescImage();

                this.initPCDescImage();

                this.initMainImage();
            }
        },
        initValuesFinish: function() {
            var me = this;
            setTimeout(function() {
                E.dispatch($('#event_submit_do_publish')[0], "click");
            }, 5000);

            setTimeout(function() {
                me.doPublishError();
            }, 50 * 1000);
        },
        qualificationIndex: 0,
        checkQualification: function() {
            var $item_qualification_check = $('#J_module-property [name=item_qualification_check]:first');
            $item_qualification_check.attr('checked', false);
            $item_qualification_check.val('false');
            if ($item_qualification_check.val() != 'false' && this.qualificationIndex < 5) {
                this.qualificationIndex++;
                setTimeout(this.checkQualification.bind(this), 500);
            } else {
                // if ($item_qualification_check[0]) {
                    // this.initLabelImage();
                // }
                this.resetOtherOption();
                this.initValuesFinish();
            }
        },
        onSubmit: function() {
            this.client.send('publish', {
                id: this.activeItem.id
            });
        }
    });



})(window);