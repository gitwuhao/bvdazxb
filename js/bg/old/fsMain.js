var fsMain = {
    'shops': config.shops,
    getKey: function(title) {
        var array = (title || '').match(/\w{2}\d{4}/);
        return (array || [])[0];
    },
    getItemId: function(url) {
        var array = (url || '').match(/\d{11,12}/);
        return (array || [])[0];
    },
    getShopData: function(handle) {
        var me = this,
            array = this.shops;
        new util.asyncTask({
            array: array,
            timeout: 300,
            getAjaxcfg: function(shop) {
                return {
                    type: 'POST',
                    async: false,
                    url: config.urls.data + 'shop_' + shop.id + '.json',
                    dataType: 'text'
                };
            },
            handle: function(shop, data) {
                shop.items = JSON.parse(data).items;
            },
            finish: function() {
                if (handle) {
                    handle(me.shops);
                }
            }
        });
    },
    saveShopData: function(shop) {
        $.ajax({
            type: 'POST',
            url: config.urls.upload,
            data: {
                filename: 'shop_' + shop.id + '.json',
                dir: '',
                data: JSON.stringify(shop)
            },
            success: function(data) {},
            error: function() {}
        });
    },
    initShopData: function() {
        var array = this.shops;
        util.each(this.shops, function(i, shop) {
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.data + 'shop_' + shop.id + '.json',
                dataType: 'text',
                success: function(data) {
                    localStorage[shop.id] = data;
                },
                error: function() {}
            });
        });
        this.initDetail();
    },
    initDetail: function() {
        var me = this;
        var array = [];
        util.each(this.shops, function(i, shop) {
            var data = localStorage[shop.id];
            shop = JSON.parse(data);
            if (!shop) {
                return;
            }
            util.it(shop.items, function(key, value) {
                array.push({
                    id: key,
                    key: value,
                    shopId: shop.id
                });
                return false;
            });
        });
        array.index = 0;
        this.loadDetail(array);
    },
    loadDetail: function(array) {
        var me = this,
            item = array[array.index++];
        if (!item) {
            return;
        }
        this.getDetailJSON(item, function() {
            setTimeout(function() {
                me.loadDetail(array);
            }, 3000);
        });
    },
    getDetailHTML: function(item, handle) {
        var me = this;
        $.ajax({
            cache: false,
            url: config.urls.detail + item.id,
            dataType: 'text',
            success: function(html) {
                me.doDetailHTML(item, html);
                handle();
            },
            error: function(msg) {

            }
        });
    },
    doDetailHTML: function(item, html) {
        var fsHTML = new util.html(html);
        var list = [];
        var array = this.getMainImageArray(fsHTML);
        var mainData = this.getData(fsHTML) || {};
        var detail = mainData.detail;
        var mdskip = mainData.mdskip;
        var key = item.key;
        var shopId = item.shopId;
        var id = item.id;

        list.push({
            id: key,
            shop: shopId,
            filename: id + '_detail.json',
            dir: '',
            data: JSON.stringify(detail)
        });


        list.push({
            id: key,
            shop: shopId,
            filename: id + '_mdskip.json',
            dir: '',
            data: JSON.stringify(mdskip)
        });

        list.push({
            id: key,
            shop: shopId,
            filename: id + '_images.json',
            dir: '',
            data: JSON.stringify(array)
        });

        util.each(list, function(i, data) {
            $.ajax({
                type: 'POST',
                async: false,
                url: config.urls.upload,
                data: data,
                success: function() {},
                error: function() {}
            });
        });
    },
    getData: function(fsHTML) {
        var array = fsHTML.getTagContext('script');
        if (array.length < 1) {
            return null;
        }
        return {
            detail: fsHTML.getDataByKey('_DATA_Detail', array),
            mdskip: fsHTML.getDataByKey('_DATA_Mdskip', array)
        };
    },
    getMainImageArray: function(fsHTML) {
        var array = [];
        util.each(fsHTML.doc.getElementsByClassName('itbox'), function(i, div) {
            var img = div.getElementsByTagName(fsHTML.getTagName('img'));
            array.push($(img[0]).attr('data-src').replace(/\.(jpg|png|gif)_.+/i, '.$1'));
        });
        return array;
    },
    getAttrUL: function(itemId, handle) {
        var me = this;
        $.ajax({
            cache: false,
            url: config.urls.pcDetail + itemId,
            dataType: 'text',
            success: function(html) {
                me.doPCDetailHTML(itemId, html, handle);
            },
            error: function(msg) {

            }
        });
    },
    doPCDetailHTML: function(itemId, html, handle) {
        var fsHTML = new util.html(html);
        var ul = fsHTML.getById('J_AttrUL');
        var html = util.html.decodeHTML(ul.outerHTML);
        if (handle) {
            handle(html);
        }
        return html;
    }
};

// fsMain.getShopData();?



var data = {
    'upload': 'http://127.0.0.1:8901',
    'detail': 'https://detail.m.tmall.com/item.htm?id=',
    'pcdesc': 'http://hws.m.taobao.com/cache/wdesc/5.0?id=',
    'h5desc': 'http://hws.m.taobao.com/cache/mdesc/5.0?id=',
    'search': {
        'callback': '_DLP_2384_01945_ajson_1_source_tmallsearch',
        'spm': 'a320p.7692171.0.0',
        'suid': '263817957',
        //排序default、hotsell、oldstarts、_bid（高）、bid（低）
        'sort': 'oldstarts',
        //页码
        'p': '1',
        //页数
        'page_size': '12',
        'from': 'h5',
        'shop_id': '58501945',
        'ajson': '1',
        'source': 'tmallsearch',
    },
    'domain': {
        'handuyishe': '263817957',
        'amh': '70986937'
    },
    'items': [
        '18959526273', '520726911961', '520830061103'
    ],
    'shopsearch': ['https://amh.m.tmall.com/shop/shop_auction_search.do?callback=_DLP_2384_86937_ajson_1_source_tmallsearch&spm=a222m.7628550.1998338747.1&sort=default&p=1&page_size=12&from=h5&shop_id=70986937&ajson=1&source=tmallsearch', 'https://handuyishe.m.tmall.com/shop/shop_auction_search.do?callback=_DLP_2384_01945_ajson_1_source_tmallsearch&spm=a320p.7692171.0.0&suid=263817957&sort=default&p=1&page_size=12&from=h5&shop_id=58501945&ajson=1&source=tmallsearch'],
    'seach': 'https://handuyishe.m.tmall.com/shop/shop_auction_search.do?callback=_DLP_2384_01945_ajson_1_source_tmallsearch&sort=default&p=2&page_size=12&from=h5&shop_id=58501945&ajson=1&source=tmallsearch'
};