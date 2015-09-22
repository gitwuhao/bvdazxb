(function(global, undefined) {


    classjs({
        className: 'fs.image.h5desc',
        extendEvent: true,
        singleton: true
    });


    util.merger(fs.image.h5desc, fs.image.desc, {
        type: 'h5',
        data_type: 'images',
        dir_suffix: 'h5_desc'
    });

})(window);
