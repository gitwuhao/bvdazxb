(function(global, undefined) {

    classjs({
        className: 'tb.checkitem',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            this.client = new connect.client({
                id: 'data',
                onConnect: function() {
                    me.doClientInitDone();
                }
            });
        },
        doClientInitDone: function() {
            var me = this;
            var args = window.location.href.match(/id=(\d{10,13})/i) || [];
            var myItemId = args[1];
            var key = config.getKey(document.title);
            if (!myItemId) {
                return;
            }
            this.itemKey = key;
            this.client.send('getItemDetailByMyItemId', {
                id: myItemId,
                key: key
            }, function(response) {
                me.doInitData(response.id, response.hdId, response.data);
            });
        },
        doInitData: function(itemId, hdId, data) {
            this.itemId = itemId;
            this.hdId = hdId;
            this.mainData = data;
            this.includeCSS();
            this.initDetailBox();
            this.initDetailInfo();
        },
        includeCSS: function() {
            var css = config.getURL('css/tb/main.css');
            $(document.body).append('<link rel="stylesheet" href="' + css + '"/>');
        },
        initDetailBox: function() {
            var fsboxId = 'fs_d_b' + Date.now();
            var html = ['<div id="', fsboxId, '" class="fs-detail-info" style="bottom: initial;">',
                '<div class="fs-detail-bg">',
                '<div class="title" style="line-height: 30px;">',
                '</div>',
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
                '</div>',
                '</div>'
            ];
            $(document.body).append(html.join(''));

            var fsBox = $('#' + fsboxId);
            this.$title = fsBox.find('.title:first');
            this.$skuTable = fsBox.find('.sku-info:first');
            this.$skuTbody = this.$skuTable.children('tbody:first');

        },
        getLinkHTML: function(title) {
            var itemId = this.itemId;
            var url;
            if (itemId) {
                url = 'https://detail.tmall.com/item.htm?id=' + this.itemId;
            } else {
                url = 'https://handuyishe.tmall.com/?q=' + this.itemKey + '&type=p&search=y&newHeader_b=s_from&searcy_type=item&from=.shop.pc_2_searchbutton';
            }

            this.$title.html(['<a href="', url, '" target="_detail">',title,'【天猫】</a>',
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '<a href="http://www.handu.com/goods-', this.hdId, '.html" target="_hd_detail">&nbsp;&nbsp;官网查看不到就点搜索&nbsp;&nbsp;</a>',
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '<a href="http://cn.bing.com/search?q=site%3Awww.handu.com+', this.itemKey, '" target="_hd_detail">&nbsp;&nbsp;搜&nbsp;&nbsp;&nbsp;&nbsp;索&nbsp;&nbsp;</a>'
            ].join(''));

        },
        REG_MATCH_SIZE: /\s?([^X]S|[^X]M|[^X]L)\s?/i,
        initDetailInfo: function() {
            var data = this.mainData;
            var detail = data.detail;
            var mdskip = data.mdskip || {};
            var model = mdskip.defaultModel;
            var item = detail.itemDO;
            var shop = data.shop;
            if (!model) {
                this.$skuTable.html('获取不到商品信息...');
                this.getLinkHTML('商品可能已下架');
                return;
            }

            var itemData = {
                    title: item.title,
                    itemId: item.itemId,
                    price: item.reservePrice,
                    list: []
                },
                me = this,
                skuMap = {},
                maxStock = -1,
                colorMap = {},
                sizeMap = {},
                array = itemData.list,
                valItemInfo = detail.valItemInfo,
                skuQuantity = model.inventoryDO.skuQuantity;

            this.itemData = itemData;

            util.each(valItemInfo.skuList, function(i, sku) {
                skuMap[sku.skuId] = sku;
                var quantity = skuQuantity[sku.skuId].quantity;
                sku.quantity = quantity;
                var stock = 0;
                if (quantity > 10) {
                    stock = 10;
                }
                if (maxStock < stock) {
                    maxStock = stock;
                }
                sku.stock = stock;
                sku.price = itemData.price;
                array.push(sku);
            });



            util.it(model.itemPriceResultDO.priceInfo, function(key, priceInfo) {
                var sku = skuMap[key];
                var promotionList = priceInfo.promotionList || priceInfo.suggestivePromotionList
                util.each(promotionList, function(i, promotion) {
                    if (parseFloat(sku.price) > parseFloat(promotion.price)) {
                        sku.price = promotion.price;
                        sku.priceType = promotion.type;
                        sku.names = "  " + sku.names + " ";
                        // sku.colorId = pvs.match(/20509:(\d+)/);
                        // sku.sizeId = pvs.match(/20509:(\d+)/);
                        itemData.price = sku.price;
                    }
                });
            });

            var html = [];
            util.each(array, function(i, sku) {
                var sizeClass;
                var array = sku.names.match(me.REG_MATCH_SIZE);
                if (array && array[1]) {
                    sizeClass = array[1].toLowerCase() + '-size';
                } else {
                    sizeClass = 'other-size';
                }
                html.push('<tr class="', sizeClass, '">');
                html.push('<td align="center">', sku.names, '</td>');
                html.push('<td align="center">', sku.price, '[', sku.priceType, ']', '</td>');
                var quantityClass;
                if (sku.quantity == 0) {
                    quantityClass = "zero-quantity";
                } else if (sku.quantity < 10) {
                    quantityClass = "low-quantity";
                } else {
                    quantityClass = "ample-quantity";
                }
                html.push('<td align="center" class="', quantityClass, '">', sku.quantity, '</td>');
                html.push('</tr>');
            });
            this.$skuTbody.html(html.join(''));

            var activeItem = this.activeItem;
            this.getLinkHTML('商品正在热卖');
        }
    });


    tb.checkitem.init();


})(window);