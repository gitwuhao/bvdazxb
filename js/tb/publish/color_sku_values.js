(function(global, undefined) {

    var color_key = '1627207';
    var REG_COLOR = new RegExp(color_key + ':(\\d+)');

    util.merger(tb.publish, {
        REG_COLOR: REG_COLOR,
        initColorProperty: function() {
            var map = {};
            var data = {};
            var skuItem = this.colorSKUItem;
            util.each(skuItem.values, function(i, item) {
                var text = $.trim(item.text);
                item.text = text.replace('预计', '').replace('【', '[').replace('】', ']');
                map[text] = item;
                data[item.id] = item;
            });

            this.colorProperty = {
                key: skuItem.id,
                map: map,
                array: skuItem.values,
                data: data
            }

            return this.colorProperty;
        },
        initColorValues: function(taskArray) {
            // debugger;

            this.initColorProperty();

            var colorProperty = this.colorProperty;
            var colorKey = colorProperty.key;
            var colorMap = colorProperty.map;
            var colorArray = colorProperty.array;
            var colorData = colorProperty.data;
            var noFindArray = [];

            $('#sku-color-tab-contents .color-list').show();

            util.each(colorArray, function(i, item) {
                item.propId = item.id;
                var $checkbox = $('#prop_' + color_key + '-' + item.id);
                if ($checkbox[0]) {
                    taskArray.push(function() {
                        E.dispatch($checkbox[0], "click");
                    });
                } else {
                    noFindArray.push(item);
                }
            });

            util.each(noFindArray, function(i, item) {
                var index = '-' + (i + 1);
                item.propId = index;
                var propKey = color_key + '-' + index;
                var $checkbox = $('#prop_' + propKey);
                if ($checkbox[0]) {
                    taskArray.push(function() {
                        var $text = $('#J_note_' + propKey);
                        E.dispatch($checkbox[0], "click");
                        // E.dispatch($t[0], "focus");
                        $text.val(item.text);
                        E.dispatch($text[0], "blur");
                    });
                }
            });
        }
    });



    tb.publish.on('detail_box_ready', function(event) {
        this.$btnBox.append('<button class="color-value fs-btn">颜色属性</button>');

        this.$btnBox.children('.color-value:first').on('click', function(event) {
            run();
        });
    });



    function run() {
        var taskArray = [];
        tb.publish.initColorValues(taskArray);
        new util.task({
            array: taskArray,
            timeout: 1000,
            handle: function(task) {
                task();
            }
        });
    };

})(window);