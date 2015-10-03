(function(global, undefined) {

    var size_key = '20509';
    var size_type = '27013';
    var size_type_text = '中国码';
    var REG_SIZE = new RegExp(size_key + ':(\\d+)');
    var REG_MATCH_SIZE = /\s?([^X]S|[^X]M|[^X]L)\s?/i;

    util.merger(tb.publish, {
        REG_SIZE: REG_SIZE,
        REG_MATCH_SIZE: REG_MATCH_SIZE,
        initSizeProperty: function() {
            var me = this;
            var map = {};
            var data = {};
            var array = [];
            var skuItem = this.sizeSKUItem;
            util.each(skuItem.values, function(i, item) {
                var v = (" " + item.text + " ").match(me.REG_MATCH_SIZE);
                if (v && v[1]) {
                    var sKey = $.trim(v[1]).toLowerCase();
                    item.sKey = sKey;
                    map[sKey] = item;
                    array.push(item);
                    data[item.id] = item;
                }
            });

            this.sizeProperty = {
                key: skuItem.id,
                map: map,
                array: array,
                data: data
            };

            return this.sizeProperty;
        },
        initSizeSKUValues: function(taskArray, $sizeProp) {


            // debugger;
            var sizeProperty = this.sizeProperty;
            var sizeKey = sizeProperty.key;
            var sizeMap = sizeProperty.map;
            var sizeArray = sizeProperty.array;
            var sizeData = sizeProperty.data;


            var $sizePannel = $sizeProp.closest('.size-pannel');
            var sizePannel_id = $sizePannel.attr('id');
            if (sizePannel_id) {
                var $sizeCheckbox = $('#J_SellProperties [value=' + sizePannel_id.replace('J_SizePannel_', '') + ']');
                var radio = $sizeCheckbox[0];

                taskArray.push((function(r) {
                    return function() {
                        r.checked = true;
                        E.dispatch(r, "click");
                        r.checked = true;
                    };
                })(radio));
            }


            util.each(sizeArray, function(i, item) {
                var sizeId = item.id;
                item.propId = sizeId;
                var $checkbox = $('#prop_' + sizeKey + '-' + sizeId);
                if ($checkbox[0]) {
                    var f = (function($c) {
                        return function() {
                            $c[0].checked = true;
                            E.dispatch($c[0], "click");
                            $c[0].checked = true;
                        };
                    })($checkbox);
                    taskArray.push(f);
                }
            });

        },
        initSizeDIYValues: function(taskArray, $sizeDIY) {
            // debugger;
            var sizeProperty = this.sizeProperty;
            var sizeKey = sizeProperty.key;
            var sizeMap = sizeProperty.map;
            var sizeArray = sizeProperty.array;
            var sizeData = sizeProperty.data;

            util.each(sizeArray, function(i, item) {
                var index = '-' + (i + 1);
                item.propId = index;
                taskArray.push((function(sKey, i, item) {
                    return function() {
                        // debugger;
                        setTimeout(function() {
                            var $checkbox = $sizeDIY.find('[value="' + sKey + ':' + i + '"]:first');
                            var $text = $checkbox.nextAll(':text');
                            E.dispatch($checkbox[0], "click");
                            $text.val(item.text);
                            E.dispatch($text[0], "blur");
                        }, 1000);
                    };
                })(sizeKey, index, item));
            });

        },
        initSizeValues: function(taskArray) {
            // $('.size-content:first .size-pannel').show();

            this.initSizeProperty();

            var sizeProperty = this.sizeProperty;
            var sizeKey = sizeProperty.key;
            var sizeMap = sizeProperty.map;
            var sizeArray = sizeProperty.array;
            var sizeData = sizeProperty.data;

            var $sellProperties = $('#J_SellProperties');
            var $sizeDIY = $sellProperties.find('.size-diy:first');
            var $sizeValue = $sellProperties.find('input[value="165/84"]:first');
            var $sizeProp = $('#prop_' + sizeKey + '-' + sizeArray[0].id);
            if ($sizeProp[0]) {
                this.initSizeSKUValues(taskArray, $sizeProp);
            } else if ($sizeDIY[0]) {
                this.initSizeDIYValues(taskArray, $sizeDIY);
            } else if ($sizeValue[0]) {
                this.convertSizeList(taskArray, $sellProperties);
            } else {
                console.error('no find diy size...');
                return;
            }

        },
        convertSizeGroupType: function(taskArray, $sizeGroupType) {
            var sizeProperty = this.sizeProperty;
            var sizeKey = sizeProperty.key;
            var sizeMap = sizeProperty.map;
            var sizeArray = sizeProperty.array;

            // var $sellPropert = $('#J_SellProperties');
            util.each($sizeGroupType, function(i, radio) {
                if (radio.value.indexOf(sizeKey) > -1 || radio.parentElement.innerText.indexOf(size_type_text) > -1) {
                    $('#J_SizePannel_' + radio.value).children().each(function(i, item) {
                        var vs = (" " + item.innerText + " ").match(/\s?([^X]S|[^X]M|[^X]L)\s?/i);
                        if (vs && vs[1]) {
                            var val = $(item).children(":checkbox:first").val();
                            var skey = $.trim(vs[1]).toLowerCase();
                            var args = val.split(":");
                            sizeId = args[0];
                            sizeMap[skey] = args[1];
                        }
                    });
                    taskArray.push((function(r) {
                        return function() {
                            r.checked = true;
                            E.dispatch(r, "click");
                            r.checked = true;
                        };
                    })(radio));
                    return false;
                }
            });
            return {
                key: sizeId,
                values: sizeMap
            };
        },
        convertSizeList: function(taskArray, $sellProperties) {
            // debugger;
            var sizeProperty = this.sizeProperty;
            var sizeKey = sizeProperty.key;
            var sizeMap = sizeProperty.map;
            var sizeArray = sizeProperty.array;
            var sizeData = sizeProperty.data;
            var metaSizeMap = {
                "s": "165/84",
                "m": "170/88",
                "l": "175/92"
            };
            util.it(metaSizeMap, function(key, value) {
                var $text = $sellProperties.find('input[value="' + value + '"]:first');
                var $checkbox = $text.prevAll(':checkbox');
                $checkbox.attr('checked', true);
                var val = $checkbox.val();
                var args = val.split(":");
                if (args[1]) {
                    var sizeItem = sizeMap[key];
                    if (sizeItem) {
                        sizeItem.propId = args[1];
                        $text.val(sizeItem.text);
                    }
                }
            });

        }
    });


    tb.publish.on('detail_box_ready', function(event) {
        this.$btnBox.append('<button class="size-value fs-btn">尺寸属性</button>');

        this.$btnBox.children('.size-value:first').on('click', function(event) {
            run();
        });
    });



    function run() {
        var taskArray = [];
        tb.publish.initSizeValues(taskArray);
        new util.task({
            array: taskArray,
            timeout: 1000,
            handle: function(task) {
                task();
            }
        });
    };

})(window);