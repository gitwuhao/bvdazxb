(function() {
    var html = [],
        array = [{
            title: '我的淘宝店',
            href: 'meiergz.taobao.com'
        }, {
            title: '韩都淘宝店',
            href: 'handuyishe.tmall.com'
        }, {
            title: '韩都官网',
            href: 'www.handu.com'
        }];
    html.push('<ul>');
    for (var i = 0, len = array.length; i < len; i++) {
        var item = array[i];
        html.push('<li><a href="http://', item.href, '">', item.title, '</a></li>');
    }
    html.push('</ul>');
    document.body.innerHTML = html.join('');


})();
