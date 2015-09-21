var fsPlugin = {
    defaultImageFormat: "jpg",
    port: undefined,
    inited: false,
    captures: undefined,
    clientWidth: 100,
    client: {},
    init: function() {
        this.inited = true;
    },
    register: function(client) {
        this.client = client;
    },
    launchFunction: function(cmd, obj) {
        if (cmd == "captureInit") this.captureInit(obj);
        else if (cmd == "captureTabPNG") this.captureTabPNG(obj);
        else if (cmd == "captureDone") this.loadImages(obj, this.captureDone);
    },
    captureInit: function(data) {
        this.captures = [];
        this.imagesLoaded = 0;
        this.clientWidth = data.clientWidth;
        this.clientHeight = data.clientHeight;
    },
    captureTabPNG: function(data) {
        var me = this,
            clientHeight = this.clientHeight,
            y = 0,
            lastData = this.captures[this.captures.length - 1];
        if (lastData) {
            clientHeight = (data.y - lastData.y);
            y = this.clientHeight - clientHeight;
            data.clipY = y;
        }
        this.captures.push(data);
        lastData = data;

        this.clipCaptureData({
            x: 0,
            y: y,
            clientHeight: clientHeight,
            dataurl: data.dataurl
        }, function(index, data, format) {
            if (me.client) {
                me.client.emit('captureImage', {
                    index: index,
                    data: data,
                    format: format
                });
            }
        });
    },
    clipCaptureData: function(data, callback) {
        var index = this.captures.length;
        var img = new Image();
        var me = this;
        var format = me.defaultImageFormat;
        img.src = data.dataurl;
        img.onload = function(index, img) {
            return function() {
                var canvas = document.createElement('canvas');
                canvas.width = me.clientWidth;
                canvas.height = data.clientHeight;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, data.x, data.y, me.clientWidth, data.clientHeight, 0, 0, me.clientWidth, data.clientHeight);
                callback(index, canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg"), format);
            };
        }(index, img);
    },
    loadImages: function(data, callback) {
        var cntr;
        var imagesPending = this.captures.length;
        var me = this;
        for (cntr = 0; cntr < this.captures.length; ++cntr) {
            var img = new Image,
                captures = this.captures;

            img.onload = function(id, img) {
                return function() {
                    captures[id].dataurl = "";
                    captures[id].img = img;

                    me.clipCapture(data, captures[id]);
                    if (--imagesPending == 0)
                        me.captureDone(data);
                }
            }(cntr, img);

            img.src = captures[cntr].dataurl;
        }
    },
    clipCapture: function(data, capture) {
        var canvas = document.createElement('canvas');
        canvas.width = data.cw;
        canvas.height = data.ch;
        var img = capture.img;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        capture.data = canvas.toDataURL(fsPlugin.defaultImageFormat === "png" ? "image/png" : "image/jpeg");

        logToConsole(capture.data);

    },
    captureDone: function(data) {
        if (this.client) {
            this.client.emit('captureDone', {
                list: this.captures
            });
        }
    }
}

function getJSPlugin() {
    if (!fsPlugin.inited)
        fsPlugin.init();

    return fsPlugin;
}
