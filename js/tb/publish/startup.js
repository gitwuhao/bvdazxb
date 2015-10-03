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
        className: 'tb.plugin',
        singleton: true,
        init: function() {
            setTimeout(function() {
                tb.publish.init();
            }, 10 * 1000);
        }
    });



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
            // this.client.send('publishError');
            // this.goSell();
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
                me.initDetailInfo();
            });
        },
        initDetailInfo: function() {
            this.includeCSS();
            this.initDescInfo();
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
            this.initDescInfoData();
            if (!this.isEdit) {
                this.initValues();

                this.initH5DescImage();

                this.initPCDescImage();

                this.initMainImage();
            }
        },
        includeCSS: function() {
            var css = config.getURL('css/tb/main.css');
            $(document.body).append('<link rel="stylesheet" href="' + css + '"/>');
        },
        initDescInfo: function() {
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
                '<div>',
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
        initDescInfoData: function() {
            var data = this.mainData;
            var detail = data.detail;
            var mdskip = data.mdskip;
            var item = detail.itemDO;
            var shop = data.shop;
            if (!mdskip.defaultModel) {
                this.doPublishError();
                console.error('找不到商品...');
                return;
            }


            var itemData = {
                title: item.title,
                itemId: item.itemId,
                price: item.reservePrice,
                list: []
            };

            this.itemData = itemData;
            var skuMap = {},
                maxStock = -1,
                colorMap = {},
                sizeMap = {},
                array = itemData.list,
                valItemInfo = detail.valItemInfo,
                skuQuantity = mdskip.defaultModel.inventoryDO.skuQuantity;

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

            util.it(mdskip.defaultModel.itemPriceResultDO.priceInfo, function(key, priceInfo) {
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
                var array = sku.names.match(REG_MATCH_SIZE);
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
        },
        initValues: function() {
            var item = this.itemData;
            var activeItem = this.activeItem;

            $('#prop_13021751').val(activeItem.key);

            var brand = metaData.brand[activeItem.type];
            var $p20000 = $('#simulate-prop_20000');
            $p20000.focus();
            $p20000.val(brand.key);

            var $select = $('#prop_20000');
            $select.html(['<option value="', brand.value, '">', brand.key, '</option>'].join(''));
            E.dispatch($select[0], "change");
            E.dispatch($select[0], "click");

            $('#simulate-prop_13328588').val('');


            $('#TitleID').val(item.title);
            $('#buynow').val(item.price);
            $('#quantityId').val(10);
            $('#outerIdId').val(item.itemId);

            $('#J_Internal').attr('checked', true);

            var $inStock = $('#inStock');
            $inStock.attr('checked', true);
            E.dispatch($inStock[0], "click");
            $inStock.attr('checked', true);

            this.initProperty();

            this.initSKUValues();

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
                this.resetOtherOption();
                // this.initValuesFinish();
            }
        },
        onSubmit: function() {
            this.client.send('publish', {
                id: this.activeItem.id
            });
        },
        initH5DescImage: function() {
            var urls = this.mainData.h5DescUrls;
            var list = [];
            var data = {
                data: list
            };
            util.it(urls, function(key, value) {
                list.push({
                    "type": "image",
                    "value": value,
                    "size": 122186
                });
            });

            E.dispatch(document.getElementById('J_MobileTab'), "click");
            setTimeout(function() {
                var $textarea = $('#J_MobileDetail');
                $textarea.val(JSON.stringify(data));
                $textarea.show();
            }, 300);
        },
        eachUrls: function(urls, handle) {
            if (!urls) {
                return;
            }
            for (var i = 1; i < 100; i++) {
                if (!urls[i] || handle(i, urls[i]) === false) {
                    return false;
                }
            }
        },
        initPCDescImage: function() {
            var urls = this.mainData.pcDescUrls;
            var html = ['<div style="width:790px;">'];
            this.eachUrls(urls, function(key, value) {
                html.push('<div><img src="', value, '"/></div>');
            });
            html.push('</div>');

            var $textarea = $('#J_ItemDescTextarea_newer');
            $textarea.show();
            $textarea.focus();
            $textarea.val(html.join(''));
            // setTimeout(function(){
            // $textarea.blur();
            // $textarea.hide();
            // },200);
        },
        initMainImage: function() {
            var urls = this.mainData.mainImageUrls;
            this.eachUrls(urls, function(key, value) {
                var $picUrl = $('input[name=picUrl' + key + ']');
                $picUrl.next().remove();
                $picUrl.closest('li').addClass('has-img');
                $picUrl.val(value);
                $picUrl.after('<img src="' + value + '_100x100.jpg"/>');
            });
        }
    });



})(window);