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
                    me.initProperty();
                });
            } else {
                // this.initDetailInfo();
                this.isPublish = true;
            }
        },
        initProperty:function(){
            
            this.initDetailInfo();
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

            // var brand = metaData.brand[activeItem.type];
            // $('#simulate-prop_20000').val(brand.key);
            // $('#prop_20000').html(['<option value="', brand.value, '">', brand.key, '</option>'].join(''));

            $('#simulate-prop_13328588').val('');


            $('#TitleID').val(item.title);
            $('#buynow').val(item.price);
            $('#quantityId').val(10);
            $('#outerIdId').val(item.itemId);

            this.initSelectValues();
        },
        initSelectValues: function() {
            var property = {
                "success": true,
                "model": {
                    "list": [{
                        "k": "主要参数",
                        "v": [{
                            "k": "廓形",
                            "v": "A型"
                        }, {
                            "k": "材质成分",
                            "v": "聚酯纤维100%"
                        }, {
                            "k": "销售渠道类型",
                            "v": "纯电商(只在线上销售)"
                        }, {
                            "k": "货号",
                            "v": "MY4676"
                        }, {
                            "k": "风格",
                            "v": "通勤"
                        }, {
                            "k": "通勤",
                            "v": "韩版"
                        }, {
                            "k": "组合形式",
                            "v": "单件"
                        }, {
                            "k": "裙长",
                            "v": "短裙"
                        }, {
                            "k": "款式",
                            "v": "其他/other"
                        }, {
                            "k": "袖长",
                            "v": "长袖"
                        }, {
                            "k": "领型",
                            "v": "立领"
                        }, {
                            "k": "袖型",
                            "v": "常规"
                        }, {
                            "k": "腰型",
                            "v": "宽松腰"
                        }, {
                            "k": "衣门襟",
                            "v": "套头"
                        }, {
                            "k": "裙型",
                            "v": "A字裙"
                        }, {
                            "k": "图案",
                            "v": "纯色"
                        }, {
                            "k": "流行元素/工艺",
                            "v": "褶皱镂空纽扣拼接抽褶"
                        }, {
                            "k": "品牌",
                            "v": "HSTYLE/韩都衣舍"
                        }, {
                            "k": "面料",
                            "v": "其他"
                        }, {
                            "k": "成分含量",
                            "v": "95%以上"
                        }, {
                            "k": "材质",
                            "v": "涤纶"
                        }, {
                            "k": "适用年龄",
                            "v": "25-29周岁"
                        }, {
                            "k": "年份季节",
                            "v": "2015年秋季"
                        }, {
                            "k": "颜色分类",
                            "v": "灰色炭黑色"
                        }, {
                            "k": "尺码",
                            "v": "SML"
                        }]
                    }]
                }
            };

            var label_map = {};

            $('.label-title').each(function(i, label) {
                var key = label.innerText.replace('：', '');
                label_map[key] = $(label).closest('li');
            });
            util.each(property.model.list, function(i, item) {
                util.each(item.v, function(n, pro) {
                    var $li = label_map[pro.k];
                    if ($li) {
                        util.each($li.find('option'), function(m, option) {
                            if (selectedOption(option, pro.v)) {
                                delete label_map[pro.k];
                                return false;
                            }
                        });
                    }
                });
            });

            function selectedOption(option, text) {
                var select = option.parentElement;
                var value = option.value;
                if (option.innerText == text) {
                    $('#simulate-' + select.id).val(text);
                    $(select).html(['<option value="', value, '">', text, '</option>'].join(''));
                    E.dispatch(select, "change");
                    return true;
                }
            };
        },
        initCheckBox: function() {

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
