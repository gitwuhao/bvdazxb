(function(global, undefined) {

    // 韩都衣舍韩版2015秋装新款女装破洞宽松背带裤牛仔裤LZ4102烎
    // https://detail.tmall.com/item.htm?spm=686.1000924.0.0.ZCOva6&id=43855851787
    // https://detail.tmall.com/item.htm?spm=686.1000924.0.0.SgQ5tq&id=520491439885
    var color_key = '1627207';
    var size_key = '20509';
    var size_type = '27013';
    var size_type_text = '中国码';
    var REG_COLOR = new RegExp(color_key + ':(\\d+)');
    var REG_SIZE = new RegExp(size_key + ':(\\d+)');
    var REG_MATCH_SIZE = /\s?([^X]S|[^X]M|[^X]L)\s?/i;



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
        goSell: function() {
            setTimeout(function() {
                window.location.href = "https://upload.taobao.com/auction/sell.jhtml";
            }, 3 * 1000);
        },
        doClientInitDone: function() {
            var me = this;
            var isPublishItemSuccess = window.location.href.indexOf('publishItemSuccess.htm') > -1;
            if (isPublishItemSuccess) {
                this.client.send('publish');
                this.goSell();
                return;
            }

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
                if (!data) {
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
                '<button class="h5-desc fs-btn">H5描述 </button>',
                '<button class="desc-image fs-btn">描述</button>',
                '<button class="reset-value fs-btn">重置属性</button>',
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
            var $h5Desc = fsBox.children('.h5-desc:first');
            var $resetValue = fsBox.children('.reset-value:first');
            var $publish = fsBox.children('.publish:first');
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
            var skuMap = {},
                colorMap = {},
                sizeMap = {},
                array = itemData.list,
                valItemInfo = detail.valItemInfo,
                skuQuantity = mdskip.defaultModel.inventoryDO.skuQuantity;

            util.each(valItemInfo.skuList, function(i, sku) {
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
            }, 1000);

            setTimeout(function() {
                me.client.send('publishError');
                me.goSell();
            }, 50 * 1000);
        },
        initProperty: function() {
            var me = this;
            this.client.send('getProperty', {
                id: me.activeItem.id
            }, function(data) {
                me.doInitProperty(data);
            });
        },
        doInitProperty: function(data) {
            this.property = data;
            var propMap = {};
            var html = [];
            util.rec(data.model.list, function(i, pro) {
                var key = pro.k,
                    value = pro.v;
                if (util.isString(value)) {
                    propMap[key] = value;
                    html.push('<li>', key, ' ： ', value, '</li>');
                    if (key == '上市年份季节') {
                        var array = value.split('年');
                        if (array) {
                            if (array[0]) {
                                propMap['上市时间'] = array[0] + '年';
                            }
                            if (array[1]) {
                                propMap['适用季节'] = array[1];
                            }
                        }
                        propMap['年份季节'] = value;
                    }
                } else if (util.isArray(value)) {
                    return value;
                }
            });
            this.propMap = propMap;

            this.$attrUL.html(html.join(''));

            this.$propertyForm = $('#J_module-property');
            this.initSelectValues();
            this.initCheckBoxValues();
        },
        initSKUValues: function() {

            var skuArray = this.mainData.detail.valItemInfo.skuName;



            $('#sku-color-tab-contents .color-list').show();

            // $('.size-content:first .size-pannel').show();



            var skuMap = {};

            util.each(skuArray, function(i, item) {
                var text = item.text;
                if (text.indexOf('尺寸') > -1 || text.indexOf('尺码') > -1) {
                    size_key = item.id;
                    REG_SIZE = new RegExp(size_key + ':(\\d+)');
                } else if (text.indexOf('颜色') > -1) {
                    color_key = item.id;
                    REG_COLOR = new RegExp(color_key + ':(\\d+)');
                }
                skuMap[item.id] = item;
            });

            var array = [];


            var skuSizeValues = skuMap[size_key].values,
                sizeArray = [],
                oldSizeMap = {},
                dataSizeMap = {};

            util.each(skuSizeValues, function(i, item) {
                var v = (" " + item.text + " ").match(REG_MATCH_SIZE);
                if (v && v[1]) {
                    var skey = $.trim(v[1]);
                    sizeArray.push(item);
                    dataSizeMap[skey] = item.id;
                }
            });


            var J_SizePannel_id = $('#prop_' + size_key + '-' + sizeArray[0].id).closest('.size-pannel').attr('id');
            if (J_SizePannel_id) {
                var $sizeCheckbox = $('#J_SellProperties [value=' + J_SizePannel_id.replace('J_SizePannel_', '') + ']');
                var radio = $sizeCheckbox[0];

                array.push((function(r) {
                    return function() {
                        r.checked = true;
                        E.dispatch(r, "click");
                        r.checked = true;
                    };
                })(radio));
            } else {
                util.each($('.size-type [name=sizeGroupType]'), function(i, radio) {
                    if (radio.value.indexOf(size_type) > -1 || radio.parentElement.innerText.indexOf(size_type_text) > -1) {
                        $('#J_SizePannel_' + radio.value).children().each(function(i, item) {
                            var vs = (" " + item.innerText + " ").match(/\s?([^X]S|[^X]M|[^X]L)\s?/i);
                            if (vs && vs[1]) {
                                var val = $(item).children(":checkbox:first").val();
                                var skey = $.trim(vs[1]);
                                oldSizeMap[dataSizeMap[skey]] = val.split(":")[1];
                            }
                        });

                        array.push((function(r) {
                            return function() {
                                r.checked = true;
                                E.dispatch(r, "click");
                                r.checked = true;
                            };
                        })(radio));
                        return false;
                    }
                });
            }



            util.each(sizeArray, function(i, item) {
                var sizeId = item.id;
                if (oldSizeMap[sizeId]) {
                    sizeId = oldSizeMap[sizeId];
                }
                var $checkbox = $('#prop_' + size_key + '-' + sizeId);
                if ($checkbox[0]) {
                    var f = (function($c) {
                        return function() {
                            $c[0].checked = true;
                            E.dispatch($c[0], "click");
                            $c[0].checked = true;
                        };
                    })($checkbox);
                    array.push(f);
                }
            });



            var colorItem = skuMap[color_key],
                noFindColorMap = {};
            if (colorItem) {
                var noFindArray = [];
                util.each(colorItem.values, function(i, item) {
                    var $checkbox = $('#prop_' + color_key + '-' + item.id);
                    if ($checkbox[0]) {
                        var f = (function($c) {
                            return function() {
                                E.dispatch($c[0], "click");
                            };
                        })($checkbox);
                        array.push(f);
                    } else {
                        noFindArray.push(item);
                    }
                });


                util.each(noFindArray, function(i, item) {
                    var index = '-' + (i + 1);
                    noFindColorMap[item.id] = index;
                    var propKey = color_key + '-' + index;
                    var $checkbox = $('#prop_' + propKey);
                    var $text = $('#J_note_' + propKey);
                    if ($checkbox[0]) {
                        var f = (function($c, $t, it) {
                            return function() {
                                E.dispatch($c[0], "click");
                                // E.dispatch($t[0], "focus");
                                $t.val(it.text);
                                E.dispatch($t[0], "blur");
                            };
                        })($checkbox, $text, item);
                        array.push(f);
                    }
                });
            }


            var data = this.itemData;

            util.each(data.list, function(i, item) {
                var pvs = item.pvs,
                    mArray,
                    color_value,
                    size_value;
                //"-1:-1;20509:28314;1627207:28320"
                mArray = pvs.match(REG_SIZE) || [];
                if (mArray[1]) {
                    size_value = mArray[1];
                    if (oldSizeMap[size_value]) {
                        size_value = oldSizeMap[size_value];
                    }
                }
                mArray = pvs.match(REG_COLOR) || [];
                if (mArray[1]) {
                    color_value = mArray[1];
                    if (noFindColorMap[color_value]) {
                        color_value = noFindColorMap[color_value];
                    }
                }

                var fieldKey = color_key + '-' + color_value + '_' + size_key + '-' + size_value;

                array.push((function(i, fKey) {
                    return function() {
                        var $text = $('#J_SkuField_price_' + fKey);
                        if ($text[0]) {
                            $text.val(i.price);
                            E.dispatch($text[0], "blur");
                        }
                    };
                })(item, fieldKey));


                array.push((function(i, fKey) {
                    return function() {
                        var $text = $('#J_SkuField_quantity_' + fKey);
                        if ($text[0]) {
                            var quantity = i.quantity;
                            if (quantity > 10) {
                                quantity = 10;
                            } else {
                                quantity = 0;
                            }
                            $text.val(quantity);
                            E.dispatch($text[0], "blur");
                        }
                    };
                })(item, fieldKey));

            });

            array.push(this.checkQualification.bind(this));


            new util.task({
                array: array,
                timeout: 500,
                handle: function(task) {
                    task();
                }
            });
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
                this.initValuesFinish();
            }
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
            var removeList = [];
            var me = this;
            $('.J_spu-property .ul-checkbox ').each(function(i, ul) {
                util.each(ul.children, function(n, li) {
                    var $li = $(li);
                    var $label = $li.find('label:first');
                    var key = $.trim($label.text());
                    util.it(propMap, function(_key, _value) {
                        if (_value.indexOf(key) > -1) {
                            var $checkbox = $li.find(':checkbox:first');
                            $checkbox.attr('checked', true);
                            removeList.push(_key);
                            return false;
                        }
                    });
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
