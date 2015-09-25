    window.addEventListener('test', function(event) {

    });


    function test() {
        var event = new Event('test', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        // Dispatch the event.
        window.dispatchEvent(event);
    };
    window.addEventListener('load', function(event) {
        var select = document.getElementById("select");
        if (select) {
            select.addEventListener('change', function(e) {
                console.info('plugin onchange', e);
            });
        }

        setTimeout(function() {
            var event = new Event('change');
            // Dispatch the event.
            select.dispatchEvent(event);
        }, 100);

        select.change();
    });
