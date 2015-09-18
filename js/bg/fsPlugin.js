var fsPlugin = {
    defaultImageFormat: "jpg",
    port: undefined,
    inited: false,
    captures: undefined,
    clientWidth: 100,
    init: function() {
        this.inited = true;
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
        var clientHeight = this.clientHeight,
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
        }, fs.page.captureTabPNG.bind(fs.page));
    },
    clipCaptureData: function(data, callback) {
        var index = this.captures.length;
        var img = new Image();
        img.src = data.dataurl;
        var me = this;
        img.onload = function(index, img) {
            return function() {
                var canvas = document.createElement('canvas');
                canvas.width = me.clientWidth;
                canvas.height = data.clientHeight;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, data.x, data.y, me.clientWidth, data.clientHeight, 0, 0, me.clientWidth, data.clientHeight);
                callback(index, canvas.toDataURL(me.defaultImageFormat === "png" ? "image/png" : "image/jpeg"), me.defaultImageFormat);
            };
        }(index, img);
    },
    loadImages: function(data, callback) {
        var cntr;
        var imagesPending = this.captures.length;

        for (cntr = 0; cntr < this.captures.length; ++cntr) {
            var img = new Image,
                captures = this.captures;

            img.onload = function(id, img) {
                return function() {
                    captures[id].dataurl = "";
                    captures[id].img = img;

                    fsPlugin.clipCapture(data, captures[id]);
                    if (--imagesPending == 0)
                        fsPlugin.captureDone(data);
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
        fs.page.captureDone(fsPlugin.captures);
    }
}

function getJSPlugin() {
    if (!fsPlugin.inited)
        fsPlugin.init();

    return fsPlugin;
}
