(function(global, undefined) {
    var nodeURL = 'http://127.0.0.1:8901',
        urls = {
            'node': nodeURL,
            'upload': nodeURL + '/upload/',
            'data': nodeURL + '/data/',
            'detail': 'https://detail.m.tmall.com/item.htm?id=',
            'pcdesc': 'http://hws.m.taobao.com/cache/wdesc/5.0?id=',
            'h5desc': 'http://hws.m.taobao.com/cache/mdesc/5.0?id='
        };

    global.config = global.config || {};

    global.config.nodeURL = nodeURL;
    global.config.urls = urls;

    global.config.KEY = {
        hd: 'handu',
        amh: 'amh'
    };

    global.config.PCSize = {
        clientWidth: 790,
        clientHeight: 0
    };

    global.config.MobileSize = {
        clientWidth: 320,
        clientHeight: 0
    };




})(this);
