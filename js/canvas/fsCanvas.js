(function(global, undefined) {
    var fs = global.fs || {};

    global.fs = fs;

    fs.canvas = {
        type: 'pc',
        init: function() {
            var me = this;
            window.addEventListener('load', function() {
                chrome.runtime.getBackgroundPage(function(page) {
                    me.startup(page);
                });
            });
        },
        getURL: function(url) {
            return url.replace(/^(\/\/)/, 'http://');
        },
        startup: function(page) {
            this.page = page;
            page.fsPlugin.client.getDescHTML(window, this.doDescHTML.bind(this));
        },
        doDescHTML: function(html) {
            this.loadHTML(html);
            $('table td a img').closest('table').remove();
            $('.desc_anchor').remove();
            this.initImageQueue();
        },
        loadHTML: function(html) {
            document.body.innerHTML = html.replace(/\s?\r\n\s?/g, '').replace(/\s+(<)/g, '$1');
        },
        initImageQueue: function() {
            new util.task({
                array: $('[data-src],[data-background]'),
                handle: this.taskExecute.bind(this),
                execute: function(task) {
                    var me = this;
                    this.handle(task, this.complete.bind(this));
                },
                finish: this.taskFinish.bind(this)
            });
        },
        taskExecute: function(elem, callback) {
            var $elem = $(elem);
            var key = 'data-src';
            var src = $elem.attr(key);
            if (!src) {
                key = 'data-background';
                src = $elem.attr(key);
            }

            key = key.replace('data-', '');
            src = this.getURL(src);

            var img = new Image();
            img.onerror = img.onload = function() {
                $elem.attr(key, src);
                callback(img);
            };
            img.src = src;
        },
        taskFinish: function() {
            console.info('task finish..');
            this.runCapture();
        },
        mode: cModePC,
        runCapture: function() {
            getExtension().executeGrabber(cActionEdit, this.mode);
        }
    };

})(window);
