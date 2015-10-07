(function(global, undefined) {

    var colorMetaDataMap = {
        "乳白色": "28321",
        "白色": "28320",
        "米白色": "4266701",
        "浅灰色": "28332",
        "深灰色": "3232478",
        "灰色": "28334",
        "银色": "28330",
        "黑色": "28341",
        "桔红色": "4950473",
        "玫红色": "3594022",
        "粉红色": "3232480",
        "红色": "28326",
        "藕色": "4464174",
        "西瓜红": "3743025",
        "酒红色": "28327",
        "卡其色": "28331",
        "姜黄色": "15409374",
        "明黄色": "20412615",
        "杏色": "30155",
        "柠檬黄": "132476",
        "桔色": "90554",
        "浅黄色": "60092",
        "荧光黄": "6134424",
        "金色": "28328",
        "香槟色": "130166",
        "黄色": "28324",
        "军绿色": "3232483",
        "墨绿色": "80557",
        "浅绿色": "30156",
        "绿色": "28335",
        "翠绿色": "8588036",
        "荧光绿": "6535235",
        "青色": "3455405",
        "天蓝色": "3232484",
        "孔雀蓝": "5138330",
        "宝蓝色": "3707775",
        "浅蓝色": "28337",
        "深蓝色": "28340",
        "湖蓝色": "5483105",
        "蓝色": "28338",
        "藏青色": "28866",
        "浅紫色": "4104877",
        "深紫色": "3232479",
        "紫红色": "5167321",
        "紫罗兰": "80882",
        "紫色": "28329",
        "咖啡色": "129819",
        "巧克力色": "3232481",
        "栗色": "6071353",
        "浅棕色": "30158",
        "深卡其布色": "3232482",
        "深棕色": "6588790",
        "褐色": "132069",
        "驼色": "3224419",
        "花色": "130164",
        "透明": "107121"
    };

    util.merger(tb.plugin, {
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

            this.REG_COLOR = new RegExp(skuItem.id + ':(\\d+)');

            this.colorProperty = {
                key: skuItem.id,
                map: map,
                array: skuItem.values,
                data: data
            };

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
                var propId = colorMetaDataMap[item.text];
                if (propId) {
                    item.propId = propId;
                } else {
                    item.propId = item.id;
                }
                var $checkbox = $('#prop_' + colorKey + '-' + item.propId);
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
                var propKey = colorKey + '-' + index;
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