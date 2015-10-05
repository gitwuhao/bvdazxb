(function(global, undefined) {


    var DIR_MAPING = {
        "handu_h5": "106141123103879340",
        "amh_h5": "106141123103866088",
        "amh_pc": "106141122482910215",
        "handu_pc": "106141123258114760"
    };


    classjs({
        className: 'tb.image',
        extendEvent: true,
        singleton: true,
        init: function() {
            var me = this;
            document.body.style.display = 'none';
            document.title = 'http://localhost:8080/wuhao/MyWork/upload-image/';

            this.client = new connect.client({
                id: 'image',
                onConnect: function() {
                    me.doClientInitDone();
                },
                onMessage: function(request, sender) {
                    classjs.log();
                    this.callPrototype();
                    if (this.is(request, 'createDir')) {
                        me.doCreateDir(request);
                    } else if (this.is(request, 'uploadImage')) {
                        me.doUploadImage(request);
                    }
                }
            });
        },
        doClientInitDone: function() {
            this.client.send('imageInitDone');
        },
        doCreateDir: function(request) {
            var parent_dir_id = DIR_MAPING[request.parent_dir_name];
            $.ajax({
                url: 'http://tadget.taobao.com/redaction/redaction/json.json',
                data: {
                    'cmd': 'json_add_dir',
                    'dir_id': parent_dir_id,
                    'name': request.dir_name,
                    '_input_charset': 'utf-8'
                },
                dataType: 'text',
                success: this.doCreateDirSuccess.bind(this, request),
                error: this.doCreateDirError.bind(this, request)
            });
        },
        doCreateDirSuccess: function(request, data) {
            data = JSON.parse(data);
            if (data.module && data.module.pictureCategoryId) {
                this.client.send('createDirSuccess', {
                    id: data.module.pictureCategoryId,
                    itemId: request.itemId
                });
            } else {
                console.error(data.errorMessage);
                this.doCreateDirError();
            }
        },
        doCreateDirError: function() {
            this.client.send('createDirError');
        },
        doUploadImage: function(request) {
            var me = this,
                xhr;
            xhr = new XMLHttpRequest();

            // 文件上传成功或是失败
            xhr.onreadystatechange = function(e) {
                if (xhr.readyState == 4) {
                    me.doComplete(request);
                    if (xhr.status == 200) {
                        me.doUploadSuccess(request, xhr.responseText);
                    } else {
                        me.doUploadError(request, xhr.responseText);
                    }
                }
            };
            // 开始上传
            xhr.open("POST", 'http://tadget.taobao.com/redaction/redaction/json.json?cmd=json_file_upload&_input_charset=UTF-8&_output_charset=UTF-8&source=tadget', true);

            var formData = new FormData();
            formData.append('pic_file', util.base642Blob(request.data), encodeURIComponent(request.file_name));
            formData.append('notify', 'null');
            formData.append('privateKey', 'null');
            formData.append('isPublic', 'false');
            formData.append('compressRate', request.rate || '0.75');
            formData.append('compressMaxWidth', '0');
            formData.append('compress', 'false');
            formData.append('watermark', 'false');
            formData.append('d', '1');
            formData.append('dirId', request.dirId);
            formData.append('upload_m', 'NewFlash');
            formData.append('bizCode', 'tu');

            xhr.send(formData);
        },
        doComplete: function() {
            classjs.log();

        },
        doUploadSuccess: function(request, data) {
            classjs.log();
            data = JSON.parse(data);
            var module = data.module;
            if (module && module.fullUrl) {
                this.client.send('uploadSuccess', {
                    request: request,
                    itemId: request.itemId,
                    index: request.index,
                    url: module.fullUrl,
                    picId: module.pictureId
                });
            } else {
                this.doUploadError();
            }
        },
        doUploadError: function() {
            classjs.log();
            this.client.send('uploadError');
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

            } else {
                console.error(data.errorMessage);
            }
        }
    });

    window.addEventListener('load', function() {
        if (window.top.location.href.match('#isImage')) {
            tb.image.init();
        }
    });

})(window);