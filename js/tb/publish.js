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

        },
        initProperty: function(data) {
            this.property = data;
            var propMap = {};

            util.each(data.model.list, function(i, item) {
                util.each(item.v, function(n, pro) {
                    propMap[pro.k] = pro.v;
                });
            });
            this.propMap = propMap;
            this.$propertyForm = $('#J_module-property');
            this.initSelectValues();
            this.initCheckBoxValues();
        },
        selectedOption: function(option, text) {
            var select = option.parentElement;
            var value = option.value;
            if (option.innerText == text) {
                $('#simulate-' + select.id).val(text);
                $(select).html(['<option value="', value, '">', text, '</option>'].join(''));
                E.dispatch(select, "change");
                E.dispatch(select, "click");
                return true;
            }
        },
        initSelectValues: function() {
            var propMap = this.propMap;
            var me = this;
            $('.J_spu-property select').each(function(i, select) {
                var $li = $(select).closest('.J_spu-property');
                var $label = $li.find('.label-title:first');
                var key = $.trim($label.text().replace('：', ''));
                var value = propMap[key];
                if (value) {
                    util.each($li.find('option'), function(m, option) {
                        if (me.selectedOption(option, value)) {
                            delete propMap[key];
                            return false;
                        }
                    });
                } else {
                    $li.addClass('no-find-property');
                }
            });
        },
        initCheckBoxValues: function() {
            var propMap = this.propMap;
            var valueMap = {};
            util.it(propMap, function(key, value) {
                valueMap[value] = key;
            });
            var me = this;
            $('.J_spu-property .ul-checkbox ').each(function(i, ul) {
                util.each(ul.children, function(n, li) {
                    var $li = $(li);
                    var $label = $li.find('label:first');
                    var key = $.trim($label.text());
                    var value = valueMap[key];
                    if (value) {
                        var $checkbox = $li.find(':checkbox:first');
                        //$checkbox.attr('checked', 'checked');
                        $checkbox[0].checked = true;
                        // E.dispatch($checkbox[0], "click");
                        // $checkbox[0].checked = true;
                        delete propMap[value];
                        return false;
                    }
                });
            });
        },
        onSubmit: function() {
            this.client.send('publish', {
                id: this.activeItem.id
            });
        },
        loadFSBox: function() {
            var me = this;
            var itemId = this.activeItem.id;

            this.client.send('getProperty', {
                itemId: itemId
            }, function(data) {
                me.initProperty(data);
            });

            this.client.send('getAttrUL', {
                itemId: itemId
            }, function(data) {
                me.$attrUL.html(data.html);
            });

            this.client.send('getDetail', {
                itemId: itemId
            }, function(data) {
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
                        itemData.price = sku.price;
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