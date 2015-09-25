(function(global, undefined) {
    var E = global.E || {};

    global.E = E;

    E.dispatch = function(element, eventName) {
        var options = extend(defaultOptions, arguments[2] || {});
        var oEvent, eventType = null;

        for (var name in eventMatchers) {
            if (eventMatchers[name].test(eventName)) {
                eventType = name;
                break;
            }
        }

        if (!eventType) {
            // throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
            dispatchOtherEvent(element, eventName);
            return element;
        }

        if (document.createEvent) {
            oEvent = document.createEvent(eventType);
            if (eventType == 'HTMLEvents') {
                oEvent.initEvent(eventName, options.bubbles, options.cancelable);
            } else {
                oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                    options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
            }
            element.dispatchEvent(oEvent);
        } else {
            options.clientX = options.pointerX;
            options.clientY = options.pointerY;
            var evt = document.createEventObject();
            oEvent = extend(evt, options);
            element.fireEvent('on' + eventName, oEvent);
        }
        return element;
    };

    function dispatchOtherEvent(element, eventName) {
        var oEvent = new Event(eventName);
        element.dispatchEvent(oEvent);
    };

    function extend(destination, source) {
        for (var property in source)
            destination[property] = source[property];
        return destination;
    };

    var eventMatchers = {
        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
    };
    var defaultOptions = {
        pointerX: 0,
        pointerY: 0,
        button: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
    };

    E.defaultOptions = defaultOptions;

    function test() {
        E.dispatch(document.getElementById("btn"), "click");
        E.dispatch(document.getElementById("btn"), "click", {
            pointerX: 123,
            pointerY: 321
        });
    };

})(window);
