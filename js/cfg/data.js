(function(global, undefined) {

    classjs({
        className: 'cfg.data',
        extendEvent: true,
        singleton: true,
        getKey: function(title) {
            var array = (title || '').match(/\w{2}\d{4}/);
            return (array || [])[0];
        },
        getItemId: function(url) {
            var array = (url || '').match(/\d{11,12}/);
            return (array || [])[0];
        },
        getShopList: function(index, page, sort) {
            var me = this;
            var shop = this.shops[index],
                url = config.protocol + '//' + shop.name + '.m.tmall.com/shop/shop_auction_search.do',
                data = {
                    index: index,
                    spm: 'a320p.7692171.0.0',
                    suid: shop.suid,
                    sort: sort || 'hotsell',
                    p: page || 1,
                    page_size: 12,
                    from: 'h5',
                    shop_id: shop.id,
                    ajson: 1,
                    source: 'tmallsearch'
                };

            $.ajax({
                url: url,
                dataType: 'jsonp',
                data: data,
                success: function(json) {
                    me.doItemListJson(json, data);
                },
                error: function(msg) {

                }
            });
        },
        doItemListJson: function(json, data) {
            var me = this;
            var shop = this.shops[data.index];
            if (json.items) {
                util.each(json.items, function(i, item) {
                    shop.items[item.item_id] = me.getKey(item.title);
                });

                if (json.items.length == json.page_size) {
                    setTimeout(function() {
                        me.getShopList(data.index, data.p + 1, data.sort);
                    }, 3000);
                } else {
                    localStorage[shop.id] = JSON.stringify(shop);
                }
            }
        },
        getAttrUL: function(itemId, handle) {
            var me = this;
            $.ajax({
                url: config.urls.pcDetail + itemId,
                dataType: 'text',
                success: function(html) {
                    me.doAttrULHTML(itemId, html, handle);
                },
                error: function(msg) {

                }
            });
        },
        getProperty: function(itemId, handle) {
            var me = this;
            $.ajax({
                url: config.urls.propertyUrl + itemId,
                dataType: 'text',
                success: function(data) {
                    handle(itemId, JSON.parse(data));
                },
                error: function(msg) {

                }
            });
        },
        doAttrULHTML: function(itemId, html, handle) {
            var fsHTML = new util.html(html);
            var ul = fsHTML.getById('J_AttrUL');
            var html = util.html.decodeHTML(ul.outerHTML);
            if (handle) {
                handle(html);
            }
            return html;
        },
        getDetailHTML: function(itemId, handle) {
            var me = this;
            $.ajax({
                url: config.urls.detail + itemId,
                dataType: 'text',
                success: function(html) {
                    handle(html);
                },
                error: function(msg) {

                }
            });
        },
        getDetail: function(itemId, handle) {
            var me = this;
            this.getDetailHTML(itemId, function(html) {
                me.doDetailHTML(html, handle);
            });
        },
        doDetailHTML: function(html, handle) {
            var fsHTML = new util.html(html);
            // var array = this.getMainImageArray(fsHTML);
            var mainData = this.getDetailData(fsHTML) || {};
            if (handle) {
                handle(mainData);
            }
            return mainData;
        },
        getDetailData: function(fsHTML) {
            var array = fsHTML.getTagContext('script');
            if (array.length < 1) {
                return null;
            }
            return {
                detail: fsHTML.getDataByKey('_DATA_Detail', array),
                mdskip: fsHTML.getDataByKey('_DATA_Mdskip', array)
            };
        },
        getDetailMainImage: function(itemId, handle) {
            var me = this;
            this.getDetailHTML(itemId, function(html) {
                me.doDetailMainImageArray(html, handle);
            });
        },
        getURL: function(url) {
            return url.replace(/^(\/\/)/, 'http://');
        },
        doDetailMainImageArray: function(html, handle) {
            var fsHTML = new util.html(html);
            var array = [];
            var me = this;
            util.each(fsHTML.doc.getElementsByClassName('itbox'), function(i, div) {
                var img = div.getElementsByTagName(fsHTML.getTagName('img'));
                var url = $(img[0]).attr('data-src').replace(/\.(jpg|png|gif)_.+/i, '.$1');
                array.push(me.getURL(url));
            });
            if (handle) {
                handle(array);
            }
            return array;
        }
    });




})(window);
