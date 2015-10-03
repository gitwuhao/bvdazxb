(function(global, undefined) {

    util.merger(tb.publish, {
        initSkuFieldValues: function(taskArray) {
            // debugger;
            var me = this;
            var data = this.itemData;
            var sizeProperty = this.sizeProperty;
            var sizeKey = sizeProperty.key;
            var sizeMap = sizeProperty.map;
            var sizeData = sizeProperty.data;


            var colorProperty = this.colorProperty;
            var colorKey = colorProperty.key;
            var colorMap = colorProperty.map;
            var colorData = colorProperty.data;



            util.each(data.list, function(i, item) {
                var pvs = item.pvs,
                    mArray,
                    color_value,
                    size_value;
                //"-1:-1;20509:28314;1627207:28320"
                mArray = pvs.match(me.REG_SIZE) || [];
                if (mArray[1]) {
                    var sizeItem = sizeData[mArray[1]] || {};
                    size_value = sizeItem.propId;
                }
                mArray = pvs.match(me.REG_COLOR) || [];
                if (mArray[1]) {
                    var colorItem = colorData[mArray[1]] || {};
                    color_value = colorItem.propId;
                }
                if (size_value && color_value) {
                    var fieldKey = color_key + '-' + color_value + '_' + size_key + '-' + size_value;
                    taskArray.push((function(i, fKey) {
                        return function() {
                            var $text = $('#J_SkuField_price_' + fKey);
                            if ($text[0]) {
                                $text.val(i.price);
                                E.dispatch($text[0], "blur");
                            }
                        };
                    })(item, fieldKey));


                    taskArray.push((function(i, fKey) {
                        return function() {
                            var $text = $('#J_SkuField_quantity_' + fKey);
                            if ($text[0]) {
                                $text.val(i.stock);
                                E.dispatch($text[0], "blur");
                            }
                        };
                    })(item, fieldKey));
                }

            });
        },
        initSKUValues: function() {
            var me = this,
                taskArray = [],
                // skuMap = {},
                skuArray = this.mainData.detail.valItemInfo.skuName;

            util.each(skuArray, function(i, item) {
                var text = item.text;
                if (text.indexOf('尺寸') > -1 || text.indexOf('尺码') > -1) {
                    size_key = item.id;
                    REG_SIZE = new RegExp(size_key + ':(\\d+)');
                    me.sizeSKUItem = item;
                } else if (text.indexOf('颜色') > -1) {
                    color_key = item.id;
                    REG_COLOR = new RegExp(color_key + ':(\\d+)');
                    me.colorSKUItem = item;
                }
                // skuMap[item.id] = item;
            });
            // this.skuMap = skuMap;

            this.initColorValues(taskArray);

            this.initSizeValues(taskArray);

            this.initSkuFieldValues(taskArray);

            taskArray.push(this.checkQualification.bind(this));


            new util.task({
                array: taskArray,
                timeout: 1000,
                handle: function(task) {
                    task();
                }
            });
        }
    });



    tb.publish.on('detail_box_ready', function(event) {
        this.$btnBox.append('<button class="sku-field fs-btn">sku属性</button>');

        this.$btnBox.children('.sku-field:first').on('click', function(event) {
            run();
        });
    });



    function run() {
        var taskArray = [];
        tb.publish.initSkuFieldValues(taskArray);
        new util.task({
            array: taskArray,
            timeout: 1000,
            handle: function(task) {
                task();
            }
        });
    };

})(window);