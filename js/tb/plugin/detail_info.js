(function(global, undefined) {

    util.merger(tb.plugin, {
        includeCSS: function() {
            var css = config.getURL('css/tb/main.css');
            $(document.body).append('<link rel="stylesheet" href="' + css + '"/>');
        },
        initDetailBox: function() {
            var fsboxId = 'fs_d_b' + Date.now();
            var html = ['<div id="', fsboxId, '" class="fs-detail-info">',
                '<div class="fs-btn-box">',
                '<button class="main-image fs-btn">主图</button>',
                '<button class="h5-desc fs-btn">H5描述 </button>',
                '<button class="desc-image fs-btn">描述</button>',
                '<button class="reset-value fs-btn">重置属性</button>',
                '<button class="publish fs-btn">发布</button>',
                '<button class="publishError fs-btn">报错</button>',
                '<button class="stoprun fs-btn">停止</button>',
                '</div>',
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
            this.$btnBox = fsBox.children('.fs-btn-box:first');
            this.$title = fsBox.children('.title:first');
            this.$attrUL = fsBox.children('.attr-ul:first');
            this.$skuTable = fsBox.children('.sku-info:first');
            this.$skuTbody = this.$skuTable.children('tbody:first');
            var $mainImage = this.$btnBox.children('.main-image:first');
            var $descImage = this.$btnBox.children('.desc-image:first');
            var $h5Desc = this.$btnBox.children('.h5-desc:first');
            var $resetValue = this.$btnBox.children('.reset-value:first');
            var $publish = this.$btnBox.children('.publish:first');
            var $publishError = this.$btnBox.children('.publishError:first');
            var $stopRun = this.$btnBox.children('.stoprun:first');
            var me = this;
            $mainImage.on('click', function(event) {
                me.initMainImage();
            });
            $h5Desc.on('click', function(event) {
                me.initH5DescImage();
            });
            $descImage.on('click', function(event) {
                me.initPCDescImage();
            });
            $resetValue.on('click', function(event) {
                me.initValues();
            });
            $publish.on('click', function(event) {
                me.onSubmit();
            });
            $publishError.on('click', function(event) {
                me.doPublishError();
            });
            $stopRun.on('click', function(event) {
                me.isStopRun = true;
            });

            this.emit('detail_box_ready');
        },
        initDetailInfo: function() {
            var data = this.mainData;
            var detail = data.detail;
            var mdskip = data.mdskip || {};
            var model = mdskip.defaultModel;
            var item = detail.itemDO;
            var shop = data.shop;
            if (!model) {
                this.doPublishError();
                console.error('找不到商品...');
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

            //没有库存了
            if (maxStock <= 0) {
                this.doPublishError();
                return;
            }

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
            this.$title.html(['<a href="https://detail.tmall.com/item.htm?id=', itemData.itemId, '" target="_detail">',
                itemData.title,
                '</a>',
                '<br/>',
                activeItem.id,
                '<br/>',
                //_handu_desc_h5_6.jpg
                activeItem.key + '_' + shop.name + '_desc_h5',
                '<br/>',
                activeItem.key
            ].join(''));
        }
    });




})(window);