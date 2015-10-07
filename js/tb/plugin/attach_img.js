(function(global, undefined) {


    util.merger(tb.plugin, {
        initAttachImage: function() {

        }
    });



    tb.plugin.on('detail_box_ready', function(event) {
        this.$btnBox.append('<button class="attach-field fs-btn">吊牌</button>');

        this.$btnBox.children('.attach-field:first').on('click', function(event) {
            run();
        });
    });



    function run() {

    };

})(window);