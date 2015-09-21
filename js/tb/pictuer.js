(function(global, undefined) {


    var DIR_MAPING = {};

    DIR_MAPING[config.KEY.hd] = '106141122482859956';
    DIR_MAPING[config.KEY.amh] = '106141122482910215';

    var dirMap = {
        "handu_h5": "106141123103879340",
        "amh_h5": "106141123103866088",
        "amh_pc": "106141122482910215",
        "handu_pc": "106141123258114760"
    };

    var pictuer = {
        init: function() {
            var me = this;
            document.body.style.display = 'none';
            document.title = 'http://localhost:8080/wuhao/MyWork/upload-image/';

            chrome.extension.sendMessage({
                message: "initPictuerDone"
            }, function(portId) {

            });

            chrome.extension.onConnect.addListener(function(port) {
                me.startup(port);
            });
        },
        startup: function(port) {
            this.port = port;
            var me = this;
            port.onMessage.addListener(function(msg, sender) {
                var topic = msg.topic;
                if (topic == 'hello') {
                    port.postMessage('hi');
                } else if (topic == 'createDir') {
                    me.addDir({
                        type: msg.type,
                        dir: msg.dir,
                        callback: function(data) {
                            data.topic = 'createDirSuccess';
                            port.postMessage(data);
                        }
                    });
                } else if (topic == 'upload') {
                    me.upload({
                        dirId: msg.dirId,
                        file: util.base642Blob(msg.file),
                        file_name: msg.file_name,
                        index: msg.index,
                        itemId: msg.itemId,
                        callback: function(data) {
                            data.topic = 'uploadSuccess';
                            /*
                             *   index : index,
                             *   url: module.fullUrl,
                             *   picId: module.pictureId
                             */
                            port.postMessage(data);
                        }
                    });
                }
            });
        },
        /*
         *{
         *   type: hd,
         *   dir : 'QA1454',
         *   callback: function(item){}
         *}
         */
        addDir: function(config) {
            var dir_id = DIR_MAPING[config.type || fs.KEY.hd];
            $.ajax({
                url: 'http://tadget.taobao.com/redaction/redaction/json.json',
                data: {
                    'cmd': 'json_add_dir',
                    'dir_id': dir_id,
                    'name': config.dir,
                    '_input_charset': 'utf-8'
                },
                dataType: 'text',
                success: this.doAddDirSuccess.bind(this, config),
                error: this.doError.bind(this, config)
            });
        },
        doAddDirSuccess: function(config, data) {
            data = JSON.parse(data);
            if (data.module && data.module.pictureCategoryId) {
                config.callback({
                    id: data.module.pictureCategoryId,
                    dir: config.dir
                });
            } else {
                console.error(data.errorMessage);
                config.callback({
                    id: ''
                });
            }
        },
        doComplete: function() {},
        doError: function() {},
        /*
         *{
         *  dirId : '12313211321',
         *  file : '',
         *  file_name:'',
         *  callback: function(item){}
         *}
         */
        upload: function(config) {
            var me = this,
                xhr;
            xhr = new XMLHttpRequest();

            // 文件上传成功或是失败
            xhr.onreadystatechange = function(e) {
                if (xhr.readyState == 4) {
                    me.doComplete(config);
                    if (xhr.status == 200) {
                        me.doUploadSuccess(config, xhr.responseText);
                    } else {
                        me.doError(config, xhr.responseText);
                    }
                }
            };
            // 开始上传
            xhr.open("POST", 'http://tadget.taobao.com/redaction/redaction/json.json?cmd=json_file_upload&_input_charset=UTF-8&_output_charset=UTF-8&source=tadget', true);

            var formData = new FormData();
            formData.append('pic_file', config.file, encodeURIComponent(config.file_name));
            formData.append('notify', 'null');
            formData.append('privateKey', 'null');
            formData.append('isPublic', 'false');
            formData.append('compressRate', '0.75');
            formData.append('compressMaxWidth', '0');
            formData.append('compress', 'false');
            formData.append('watermark', 'false');
            formData.append('d', '1');
            formData.append('dirId', config.dirId);
            formData.append('upload_m', 'NewFlash');
            formData.append('bizCode', 'tu');

            xhr.send(formData);
        },
        doUploadSuccess: function(config, data) {
            data = JSON.parse(data);
            if (data.errorMessage) {
                console.error(data.errorMessage);
            } else if (data.message) {
                console.error(data.message);
            } else if (config.callback) {
                var module = data.module;
                config.callback({
                    itemId: config.itemId,
                    index: config.index,
                    url: module.fullUrl,
                    picId: module.pictureId
                });
            }
        },
        delDir: function(config) {
            $.ajax({
                url: 'https://tadget.taobao.com/redaction/redaction/json.json',
                data: {
                    'cmd': 'json_batch_delete',
                    'dir_ids': config.dir_id
                },
                dataType: 'text',
                success: this.doDelDirSuccess.bind(this, config),
                error: this.doError.bind(this, config)
            });
        },
        doDelDirSuccess: function(config, data) {
            data = JSON.parse(data);
            if (data.module && data.module.dir_success_module) {
                config.callback({
                    id: config.dir_id,
                    dir: config.dir
                });
            } else {
                console.error(data.errorMessage);
                config.callback({
                    id: ''
                });
            }
        },
        testUpload: function(data) {
            this.upload({
                dirId: '106141122490019253',
                file: fs.base642Blob(data),
                file_name: 'adfxc',
                callback: function(item) {
                    console.info(item);
                }
            });
        },
        initDirData: function() {
            var me = this;
            this.client = new connect.client({
                id: 'data',
                onConnect: function() {
                    me.doClientInitDone();
                }
            });
        }
    };
    global.pictuer = pictuer;

    window.addEventListener('load', function() {
        if (window.top.location.href.match('#isDebug')) {
            pictuer.init();
        }
    });


})(window);
