(function(global, undefined) {
    /*
    *{
        array:[],
        timeout:300,
        autoRun : true,
        handle:function(callback){
        
        }
    }
    */
    classjs({
        className: 'util.task',
        extendEvent: true,
        index: 0,
        timeout: 0,
        autoRun: true,
        ready: function() {
            if (this.autoRun) {
                this.next();
            }
        },
        next: function() {
            var task = this.get();
            if (task) {
                this.execute(task);
            }
        },
        get: function() {
            var task = this.array[this.index++];
            if (!task) {
                this.finish();
            }
            return task;
        },
        execute: function(task) {
            var me = this;
            this.handle(task);
            this.complete(task);
        },
        complete: function(task) {
            setTimeout(this.next.bind(this), this.timeout);
        },
        finish: function() {

        }
    });



    classjs({
        className: 'ui.asyncTask',
        extend: 'util.task',
        index: 0,
        autoRun: true,
        next: function() {
            var task = this.get();
            if (task) {
                this.execute(task);
            }
        },
        get: function() {
            var task = this.array[this.index++];
            if (!task) {
                this.finish();
            }
            return task;
        },
        getAjaxcfg: function(task) {
            return task;
        },
        execute: function(task) {
            var me = this,
                config = this.getAjaxcfg(task);
            $.ajax(util.merger({
                success: function(data) {
                    me.handle(task, data);
                    me.complete(task);
                },
                error: function() {}
            }, config));
        },
        complete: function(task) {
            setTimeout(this.next.bind(this), this.timeout);
        },
        finish: function() {

        }
    });

})(window);
