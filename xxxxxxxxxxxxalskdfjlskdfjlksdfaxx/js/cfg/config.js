(function(global, undefined) {
    var protocol = 'https:';
    if (window.location.protocol.match(/chrome\-extension:/i)) {

    } else if (window.location && window.location.protocol) {
        protocol = window.location.protocol;
    }
    var nodeURL = 'http://127.0.0.1:8901',
        urls = {
            'data': 'data/',
            'propertyUrl': protocol + "//mdetail.tmall.com/mobile/itemPackage.do?itemId=",
            'pcDetail': protocol + '//detail.tmall.com/item.htm?id=',
            'detail': protocol + '//detail.m.tmall.com/item.htm?id=',
            'pcdesc': protocol + '//hws.m.taobao.com/cache/wdesc/5.0?id=',
            'h5desc': protocol + '//hws.m.taobao.com/cache/mdesc/5.0?id='
        };

    var config = global.config || {};
    global.config = config;

    config.nodeURL = nodeURL;
    config.urls = urls;

    config.KEY = {
        hd: 'handu',
        amh: 'amh'
    };

    util.merger(config, {
        protocol: protocol,
        PCSize: {
            clientWidth: 790,
            clientHeight: 0
        },
        MobileSize: {
            clientWidth: 750,
            clientHeight: 0
        },
        shops: [{
            'id': '58501945',
            'suid': '263817957',
            'name': config.KEY.hd,
            items: []
        }, {
            'id': '70986937',
            'suid': '849727411',
            'name': config.KEY.amh,
            items: []
        }],
        getURL: function(fileName) {
            return chrome.extension.getURL(fileName);
        },
        getKey: function(title) {
            var array = (title || '').match(/\w{2}\d{3,5}/);
            return (array || [])[0];
        },
        getItemId: function(url) {
            var array = (url || '').match(/id=(\d{10,13})/i);
            return (array || [])[0];
        }
    });


})(this);
