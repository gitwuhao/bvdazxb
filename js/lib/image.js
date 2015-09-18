(function(global, undefined) {

    classjs({
        className: 'util.image',
        statics: {
            MIME_TYPE: {
                'png': 'image/png',
                'jpg': 'image/jpeg'
            },
            load: function(src, handle) {
                var img = new Image();
                img.onload = function() {
                    handle(this);
                };
                img.src = src;
            },
            getFormat: function(src) {
                var m = (src || '').match(/(image\/|\.)(png|jpg)/);
                if (m && m[2]) {
                    return m[2].toLowerCase();
                }
            },
            toCanvas: function(src, handle) {
                this.load(src, function(img) {
                    var canvas = document.createElement('canvas');
                    canvas.width = img.naturalHeight;
                    canvas.height = img.naturalWidth;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    handle(canvas, img);
                });
            },
            download: function(src, callback, format) {
                var me = this;
                format = format ? format : this.getFormat(src);
                this.toCanvas(src, function(canvas, img) {
                    callback(canvas.toDataURL(me.MIME_TYPE[format || 'png']));
                });
            },
            getSize: function(src, callback, format) {
                var me = this;
                format = format ? format : this.getFormat(src);
                this.toCanvas(src, function(canvas, img) {
                    var data = canvas.toDataURL(me.MIME_TYPE[format || 'png']);
                    var array = util.base642Blob(data);
                    callback(array.size);
                });
            }
        }
    });


})(window);
