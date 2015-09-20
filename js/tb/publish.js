(function(global, undefined) {

    classjs({
        className: 'fs.publish',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            this.client = new connect.client({
                id: 'publish',
                onConnect: function() {
                    me.doClientInitDone();
                }
            });
        },
        doClientInitDone: function() {
            var me = this;
            this.itemId = $('#outerIdId').val();
            if (!this.itemId) {
                this.client.send('getOneItemId', {}, function(data) {
                    me.itemId = data.id;
                    me.initDetailInfo();
                });
            } else {
                this.initDetailInfo();
                this.isPublish = true;
            }
        },
        initDetailInfo: function() {
            this.includeCSS();
            this.initDetailBox();
            if (!this.isPublish) {
                this.initValues();
                this.initEvents();
            }
        },
        includeCSS: function() {
            var css = config.getURL('css/tb/main.css');
            $(document.body).append('<link rel="stylesheet" href="' + css + '"/>');
        },
        initDetailBox: function() {
            var fsboxId = 'fs_d_b' + Date.now();
            var html = ['<div id="', fsboxId, '" class="fs-detail-info">',
                '<div class="title">',
                '</div>',
                '<ul class="attr-ul">',
                '</ul>',
                '<table border="1" class="sku-info">',
                '<thead>',
                '<tr>',
                '<td align="center" width="150">规格</td>',
                '<td align="center" width="200">单价</td>',
                '<td align="center" width="100">库存</td>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '</tbody>',
                '</table>',
                '</div>'
            ];
            $(document.body).append(html.join(''));

            var fsBox = $('#' + fsboxId);
            this.$title = fsBox.children('.title:first');
            this.$attrUL = fsBox.children('.attr-ul:first');
            this.$skuTable = fsBox.children('.sku-info:first');
            this.$skuTbody = this.$skuTable.children('tbody:first');

            this.loadFSBox();
        },
        initValues: function() {
            var item = this.itemData;
            $('#TitleID').val(item.title);
            $('#buynow').val(item.price);
            $('#quantityId').val(10);
            $('#outerIdId').val(item.itemId);
        },
        initEvents: function() {
            var me = this;
            $('#J_MainForm').on('submit', function(event) {
                me.onSubmit();
            });
        },
        onSubmit: function() {

        },
        loadFSBox: function() {
            var me = this;
            util.data.getAttrUL(this.itemId, function(html) {
                me.$attrUL.html(html);
            });

            util.data.getDetail(this.itemId, function(data) {
                me.doDetailData(data);
            });

        },
        doDetailData: function(data) {
            var detail = data.detail;
            var mdskip = data.mdskip;
            var item = detail.itemDO;
            var itemData = {
                title: item.title,
                itemId: item.itemId,
                price: item.reservePrice,
                list: []
            };

            this.itemData = itemData;

            var skuMap = {};
            var array = itemData.list,
                skuQuantity = mdskip.defaultModel.inventoryDO.skuQuantity;

            util.each(detail.valItemInfo.skuList, function(i, sku) {
                skuMap[sku.skuId] = sku;
                sku.quantity = skuQuantity[sku.skuId].quantity;
                sku.price = itemData.price;
                array.push(sku);
            });

            util.it(mdskip.defaultModel.itemPriceResultDO.priceInfo, function(key, priceInfo) {
                var sku = skuMap[key];
                var promotionList = priceInfo.promotionList || priceInfo.suggestivePromotionList
                util.each(promotionList, function(i, promotion) {
                    if (parseFloat(sku.price) > parseFloat(promotion.price)) {
                        sku.price = promotion.price;
                        sku.priceType = promotion.type;
                    }
                });
            });

            var html = [];
            util.each(array, function(i, sku) {
                html.push('<tr>',
                    '<td align="center">', sku.names, '</td>',
                    '<td align="center">', sku.price, '[', sku.priceType, ']', '</td>',
                    '<td align="center">', sku.quantity, '</td>',
                    '</tr>');
            });
            this.$skuTbody.html(html.join(''));


            this.$title.html([itemData.itemId, '&nbsp;&nbsp;&nbsp;<a href="https://detail.tmall.com/item.htm?id=', itemData.itemId, '" target="_detail">',
                itemData.title,
                '</a>'
            ].join(''));

            this.initValues();
        }
    });

    window.addEventListener('load', function() {
        fs.publish.init();
    });

})(window);