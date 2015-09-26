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

            this.client.send('getProperty', {
                id: id
            }, function(data) {
                me.initProperty(data);
            });

            this.client.send('getAttrUL', {
                id: id
            }, function(data) {
                me.$attrUL.html(data.html);
            });

            this.client.send('getDetail', {
                id: id
            }, function(data) {
                me.doDetailData(data);
            });

        },
        doDetailData: function(data) {
            this.mainData = data;
            this.initDescInfoData();
            if (!this.isEdit) {
                this.initValues();

                // this.initH5DescImage();

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
                '<button class="main-image fs-btn">主图</button>',
                '<button class="desc-image fs-btn">描述</button>',
                '<button class="publish fs-btn">发布</button>',
                '</div>'
            ];
            $(document.body).append(html.join(''));

            var fsBox = $('#' + fsboxId);
            this.$title = fsBox.children('.title:first');
            this.$attrUL = fsBox.children('.attr-ul:first');
            this.$skuTable = fsBox.children('.sku-info:first');
            this.$skuTbody = this.$skuTable.children('tbody:first');
            var $mainImage = fsBox.children('.main-image:first');
            var $descImage = fsBox.children('.desc-image:first');
            var $publish = fsBox.children('.publish:first');
            var me = this;
            $mainImage.on('click', function(event) {
                me.initMainImage();
            });
            $descImage.on('click', function(event) {
                me.initPCDescImage();
            });
            $publish.on('click', function(event) {
                me.onSubmit();
            });
        },
        initDescInfoData: function() {
            var data = this.mainData;
            var detail = data.detail;
            var mdskip = data.mdskip;
            var item = detail.itemDO;
            var shop = data.shop;

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
                var sizeClass;
                var array = sku.names.match(/\s?(S|M|[^X]L)\s?/i);
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
            $('[name=item_qualification_check]').attr('checked', false);

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
                        $checkbox.attr('checked', true);
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
        initH5DescImage: function() {
            var urls = this.mainData.h5DescUrls;

            util.it(urls, function(key, value) {


            });
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

    window.addEventListener('load', function() {
        tb.publish.init();
    });

})(window);