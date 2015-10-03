(function(global, undefined) {

    util.merger(tb.publish, {
        initSKUProperty: function() {
            var me = this;
            this.client.send('getProperty', {
                id: me.activeItem.id
            }, function(data) {
                me.doInitSKUProperty(data);
            });
        },
        doInitSKUProperty: function(data) {
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
        selectedOption: function(option, text) {
            var select = option.parentElement;
            var value = option.value;
            if (option.innerText.indexOf(text) > -1) {
                text = option.innerText;
                var $text = $('#simulate-' + select.id);
                $(select).html(['<option value="', value, '">', text, '</option>'].join(''));
                E.dispatch(select, "change");
                E.dispatch(select, "click");

                E.dispatch($text[0], "focus");
                $text.val(text);
                E.dispatch($text[0], "blur");
                return true;
            }
        },
        resetOtherOption: function() {
            var me = this;
            util.it(this.otherOptionMap, function(key, select) {
                var isReset = true;
                $('.kui-option[data-value^=' + key + ']').each(function(i, item) {
                    if (item.innerText.indexOf(me.otherOptionText) > -1) {
                        isReset = false;
                        return false;
                    }
                });
                if (isReset) {
                    select.innerHTML = '';
                    E.dispatch(select, "change");
                    E.dispatch(select, "click");

                    var $text = $('#simulate-' + select.id);
                    E.dispatch($text[0], "focus");
                    $text.val('');
                    E.dispatch($text[0], "blur");
                }
            })
        },
        otherOptionText: '其他',
        initSelectValues: function() {
            var propMap = this.propMap;

            var me = this;
            // var array = [];
            this.otherOptionMap = {};

            $('.J_spu-property select').each(function(i, select) {
                var $li = $(select).closest('.J_spu-property');
                var $trigger = $li.find('.kui-dropdown-trigger:first');
                if ($trigger[0]) {

                    E.dispatch($trigger[0], "click");

                    // array.push(function() {
                    var $label = $li.find('.label-title:first');
                    var key = $.trim($label.text().replace('：', ''));
                    var value = propMap[key];
                    if (!value) {
                        value = me.otherOptionText;
                        $li.addClass('no-find-property');
                        var mv = select.id.match(/(\d+)/);
                        if (mv && mv[1]) {
                            me.otherOptionMap[mv[1]] = select;
                        }
                    }
                    util.each($li.find('option'), function(m, option) {
                        if (me.selectedOption(option, value)) {
                            delete propMap[key];
                            return false;
                        }
                    });
                }
                // });
            });



            // new util.task({
            //     array: array,
            //     timeout: 500,
            //     handle: function(task) {
            //         task();
            //     }
            // });
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