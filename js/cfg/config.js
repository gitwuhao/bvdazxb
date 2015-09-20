(function(global, undefined) {
    var nodeURL = 'http://127.0.0.1:8901',
        urls = {
            'node': nodeURL,
            // /shop/itemid/dir/filename
            'upload': nodeURL + '/upload/',
            'data': nodeURL + '/data/',
            'pcDetail': 'https://detail.tmall.com/item.htm?id=',
            'detail': 'https://detail.m.tmall.com/item.htm?id=',
            'pcdesc': 'http://hws.m.taobao.com/cache/wdesc/5.0?id=',
            'h5desc': 'http://hws.m.taobao.com/cache/mdesc/5.0?id='
        };

    var config = global.config || {};
    global.config = config;

    config.nodeURL = nodeURL;
    config.urls = urls;

    config.KEY = {
        hd: 'handu',
        amh: 'amh'
    };

    config.PCSize = {
        clientWidth: 790,
        clientHeight: 0
    };

    config.MobileSize = {
        clientWidth: 320,
        clientHeight: 0
    };




})(this);
