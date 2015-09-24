(function(global, undefined) {


    var metaData = {
        brand: {
            'handu': {
                key: 'HSTYLE/韩都衣舍',
                value: '20000:8598007'
            },
            'amh': {
                key: 'AMH',
                value: '20000:4533216'
            }

        }
    };

    classjs({
        className: 'tb.publish',
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
            var itemId = $('#outerIdId').val();
            if (!itemId) {
                this.client.send('getItem', {}, function(item) {
                    me.activeItem = item;
                    me.initDetailInfo();
                });
            } else {
                // this.initDetailInfo();
                this.isPublish = true;
            }
        },
        initDetailInfo: function() {
            this.includeCSS();
            this.initDetailBox();
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
                '<button class="publish">发布</button>',
                '</div>'
            ];
            $(document.body).append(html.join(''));

            var fsBox = $('#' + fsboxId);
            this.$title = fsBox.children('.title:first');
            this.$attrUL = fsBox.children('.attr-ul:first');
            this.$skuTable = fsBox.children('.sku-info:first');
            this.$skuTbody = this.$skuTable.children('tbody:first');
            var $publish = fsBox.children('.publish:first');
            var me = this;
            $publish.on('click', function(event) {
                me.onSubmit();
            });
            this.loadFSBox();
        },
        initValues: function() {
            var item = this.itemData;
            var activeItem = this.activeItem;

            $('#prop_13021751').val(activeItem.key);

            var brand = metaData.brand[activeItem.type];
            $('#simulate-prop_20000').val(brand.key);
            $('#prop_20000').html(['<option value="', brand.value, '">', brand.key, '</option>'].join(''));

            $('#simulate-prop_13328588').val('');


            $('#TitleID').val(item.title);
            $('#buynow').val(item.price);
            $('#quantityId').val(10);
            $('#outerIdId').val(item.itemId);


        },
        onSubmit: function() {
            this.client.send('publish', {
                id: this.activeItem.id
            });
        },
        loadFSBox: function() {
            var me = this;
            var itemId = this.activeItem.id;
            cfg.data.getAttrUL(itemId, function(html) {
                me.$attrUL.html(html);
            });

            cfg.data.getDetail(itemId, function(data) {
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

            var activeItem = this.activeItem;
            this.$title.html(['<a href="https://detail.tmall.com/item.htm?id=', itemData.itemId, '" target="_detail">',
                itemData.title,
                '</a>',
                '<br/>',
                activeItem.id,
                '<br/>',
                activeItem.key,
            ].join(''));

            this.initValues();
        }
    });

    window.addEventListener('load', function() {
        tb.publish.init();
    });

})(window);
