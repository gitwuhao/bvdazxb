(function(global, undefined) {

    util.merger(tb.plugin, {
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
            for (var i = 0; i < 100; i++) {
                if (urls[i] && handle(i, urls[i]) === false) {
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
                var $picUrl = $('input[name=picUrl' + (parseInt(key) + 1) + ']');
                $picUrl.next().remove();
                $picUrl.closest('li').addClass('has-img');
                $picUrl.val(value);
                $picUrl.after('<img src="' + value + '_100x100.jpg"/>');
            });
        },
        initSKUPics: function() {
            var urls = this.mainData.skuPicsUrls;

            var colorProperty = this.colorProperty;
            var colorKey = colorProperty.key;
            var colorMap = colorProperty.map;
            var colorArray = colorProperty.array;
            var colorData = colorProperty.data;

            util.it(urls, function(key, url) {
                var args = key.match(/(\d+)/g);
                if (args && args[1]) {
                    var item = colorData[args[1]];
                    var $mapImg = $('#J_MapImg_' + colorKey + '-' + item.propId);
                    $mapImg.find('.J_ImgInput:first').val(url);
                    var $preview = $mapImg.find('.preview:first');
                    $preview.html('<img src="' + url + '_24x24.jpg">');
                    $preview.show();
                }
            });
        },
        initLabelImage: function() {
            var $item_qualification_check = $('#J_module-property [name=item_qualification_check]:first');
            if ($item_qualification_check[0]) {
                var attachImgUrls = this.mainData.attachImgUrls;
                if (attachImgUrls && attachImgUrls[0] && attachImgUrls[1]) {
                    //吊牌
                    $('#nav_material_field_item_label_image').val(attachImgUrls[0]);
                    //耐久标
                    $('#nav_material_field_item_hangtag_image').val(attachImgUrls[1]);

                    $item_qualification_check.attr('checked', true);
                    $item_qualification_check.val('true');
                }
            }
        }
    });




})(window);