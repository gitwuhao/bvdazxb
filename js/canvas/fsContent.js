//noinspection JSUnusedGlobalSymbols
var scriptLoaded = true;
var stubbornNodes = [];
var modifiedNodes2 = [];
var commPortName;

!chrome.extension.sendMessage || chrome.extension.sendMessage({
    message: "getPortName"
}, function(response) {
    commPortName = response.portName;
    logToConsole("Obtained port name: " + commPortName);
});

function enableSomeElements(enable) {
    if (typeof enable === "undefined")
        enable = true;

    var elem;
    if (window.location.href.match(/https?:\/\/mail\.google\.com/i)) {
        //noinspection JSUnresolvedVariable
        var itr = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT, null, false);

        var currentNode;
        while (currentNode = itr.nextNode())
            if (currentNode.nodeName == "TD" && currentNode.getAttribute("class") && currentNode.getAttribute("class").match(/Bu y3/i)) {
                //alert(currentNode.nodeName);
                currentNode.style.setProperty("display", enable ? "" : "none", "important");
            }

        if (elem = document.getElementById(':ro'))
            elem.style.setProperty("display", enable ? "" : "none", "important");
        if (elem = document.getElementById(':5'))
            elem.style.setProperty("display", enable ? "" : "none", "important");
    } else if (window.location.href.match(/https?:\/\/www\.(facebook|fb)\.com/i) && (elem = document.getElementById("rightCol"))) {
        elem.style.setProperty("display", enable ? "" : "none", "important");
    }
}

function hideStubbornElements() {
    function elementExists(elem) {
        for (var i = 0; i < stubbornNodes.length; ++i)
            if (stubbornNodes[i].elem === elem) return true;

        return false;
    }

    //noinspection JSUnresolvedVariable
    var itr = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT, null, false),
        current;
    while (current = itr.nextNode()) {
        var style = document.defaultView.getComputedStyle(current, "");
        if (style && style.getPropertyValue("position") == "fixed" && !elementExists(current) && style.getPropertyValue("display") != "none") {
            logToConsole("Found stubborn element " + current.id);
            stubbornNodes.push({
                elem: current,
                opacity: style.getPropertyValue("opacity")
            });
        }
    }

    for (var i = 0; i < stubbornNodes.length; ++i)
    //stubbornNodes[i].elem.style.setProperty("display", "none");
        stubbornNodes[i].elem.style.setProperty("opacity", "0");
}

function showStubbornElements() {
    for (var i = 0; i < stubbornNodes.length; ++i)
        stubbornNodes[i].elem.style.setProperty("opacity", stubbornNodes[i].opacity);
}


function getAltExtents() {
    var doc = window.document;
    var root = doc.documentElement;
    var canvas_width = root.clientWidth ? root.clientWidth : window.innerWidth;
    var canvas_height = -1;

    if (canvas_height < 0)
        canvas_height = window.innerHeight - getSBHeight(window);

    if (doc.body) {
        var altWidth = doc.compatMode == "CSS1Compat" ? doc.documentElement.scrollWidth : doc.body.scrollWidth;

        var altHeight = doc.documentElement.scrollHeight;

        var frameWidth = doc.compatMode == "CSS1Compat" ? doc.documentElement.clientWidth : doc.body.clientWidth;
        var frameHeight = doc.compatMode == "CSS1Compat" ? doc.documentElement.clientHeight : doc.body.clientHeight;

        if (altWidth < frameWidth) {
            altWidth = frameWidth;
        }

        if (altHeight < frameHeight) {
            altHeight = frameHeight;
        }

        if (canvas_width < altWidth) {
            canvas_width = altWidth;
        }

        if (canvas_height < altHeight) {
            canvas_height = altHeight;
        }
    }

    return {
        Width: canvas_width,
        Height: canvas_height
    };
}

function findScrolledElement(docWidth, docHeight) {

    function isScrollableStyle(style) {
        return style && (style.getPropertyValue("overflow") == "scroll" || style.getPropertyValue("overflow") == "auto" ||
                style.getPropertyValue("overflow-y") == "scroll" || style.getPropertyValue("overflow-y") == "auto" ||
                style.getPropertyValue("overflow-x") == "scroll" || style.getPropertyValue("overflow-x") == "auto") &&
            style.getPropertyValue("display") != "none" && style.getPropertyValue("visibility") != "hidden";
    }

    var curDoc = document,
        divTags = curDoc.getElementsByTagName("div"),
        bestElem,
        loc = location.href;

    for (var i = 0; i < divTags.length; i++) {
        var elem = divTags[i];

        if (elem.scrollWidth > 0 && elem.scrollHeight > 0 && (elem.scrollWidth > elem.clientWidth || elem.scrollHeight > elem.clientHeight) &&
            ((loc.match(/https?:\/\/www\.(facebook|fb)\.com/i) && elem.scrollHeight > docHeight * 0.5) ||
                ((elem.scrollWidth > docWidth && elem.scrollHeight > docHeight * 0.5) || (elem.scrollHeight > docHeight && elem.scrollWidth > docWidth * 0.5) || (elem.clientWidth > docWidth * 0.7 && elem.clientHeight > docHeight * 0.7)))) {
            var style = curDoc.defaultView.getComputedStyle(elem, "");
            if (isScrollableStyle(style) && (!bestElem || bestElem.scrollWidth * bestElem.scrollHeight < elem.scrollWidth * elem.scrollHeight)) {
                var ext = getElementExtents(elem);
                // Элемент должен полностью помещаться в окне
                if (ext.absoluteX + ext.w <= window.innerWidth && ext.absoluteY + ext.h <= window.innerHeight)
                    bestElem = elem;
            }
        }

    }

    if (bestElem)
        logToConsole("Found scrolled element: " + bestElem.id);

    return bestElem;
}

function getElementExtents(element) {
    var rects = element.getClientRects(),
        extents = {
            absoluteX: 0,
            absoluteY: 0,
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
    if (rects.length > 0) {
        extents.absoluteX = element.clientLeft + rects[0].left;
        extents.absoluteY = element.clientTop + rects[0].top;
        extents.w = rects[0].width;
        extents.h = rects[0].height;
    }

    return extents;
}

function disableFloatingInView(parent) {
    function rectsIntersects(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }

    function isChildOf(parent, element) {
        var p = element.parentNode;

        while (p) {
            if (p == parent) return true;
            else p = p.parentNode;
        }

        return false;
    }

    var curDoc = document,
        ext = getElementExtents(parent);
    modifiedNodes2 = [];

    //noinspection JSUnresolvedVariable
    var itr = curDoc.createNodeIterator(curDoc.documentElement, NodeFilter.SHOW_ELEMENT, null, false),
        current;
    while ((current = itr.nextNode()) != null) {
        var style = curDoc.defaultView.getComputedStyle(current, "");

        if (style && (style.getPropertyValue("position") == "absolute" || style.getPropertyValue("position") == "relative")) {
            var elemExt = getElementExtents(current);
            if (current != parent && rectsIntersects(ext.absoluteX, ext.absoluteY, ext.w, ext.h, elemExt.absoluteX, elemExt.absoluteY, elemExt.w, elemExt.h) &&
                !isChildOf(parent, current) && !isChildOf(current, parent)) {
                logToConsole("Hiding " + current.innerHTML);
                modifiedNodes2.push({
                    object: current,
                    display: current.style.display
                });
                current.style.setProperty("display", "none", "important");
            }
        }
    }
}

function enableFloatingInView() {
    for (var i = 0; i < this.modifiedNodes2.length; i++) {
        modifiedNodes2[i].object.style.display = modifiedNodes2[i].display;
    }
}

function hasYScrollbar() {
    // The Modern solution
    if (typeof window.innerWidth === 'number')
        return window.innerWidth > document.documentElement.clientWidth;

    // rootElem for quirksmode
    var rootElem = document.documentElement || document.body;

    // Check overflow style property on body for fauxscrollbars
    var overflowStyle;

    if (typeof rootElem.currentStyle !== 'undefined')
        overflowStyle = rootElem.currentStyle.overflow;

    overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow;

    // Also need to check the Y axis overflow
    var overflowYStyle;

    if (typeof rootElem.currentStyle !== 'undefined')
        overflowYStyle = rootElem.currentStyle.overflowY;

    overflowYStyle = overflowYStyle || window.getComputedStyle(rootElem, '').overflowY;

    var contentOverflows = rootElem.scrollHeight > rootElem.clientHeight;
    var overflowShown = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowYStyle);
    var alwaysShowScroll = overflowStyle === 'scroll' || overflowYStyle === 'scroll';

    return (contentOverflows && overflowShown) || (alwaysShowScroll);
}

function hasXScrollbar() {
    // The Modern solution
    if (typeof window.innerHeight === 'number')
        return window.innerHeight > document.documentElement.clientHeight;

    // rootElem for quirksmode
    var rootElem = document.documentElement || document.body;

    // Check overflow style property on body for fauxscrollbars
    var overflowStyle;

    if (typeof rootElem.currentStyle !== 'undefined')
        overflowStyle = rootElem.currentStyle.overflow;

    overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow;

    // Also need to check the X axis overflow
    var overflowXStyle;

    if (typeof rootElem.currentStyle !== 'undefined')
        overflowXStyle = rootElem.currentStyle.overflowX;

    overflowXStyle = overflowXStyle || window.getComputedStyle(rootElem, '').overflowX;

    var contentOverflows = rootElem.scrollWidth > rootElem.clientWidth;
    var overflowShown = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowXStyle);
    var alwaysShowScroll = overflowStyle === 'scroll' || overflowXStyle === 'scroll';

    return (contentOverflows && overflowShown) || (alwaysShowScroll);
}

//noinspection JSUnresolvedVariable
chrome.extension.onConnect.addListener(function(port) {
    if (chrome.extension.sendMessage && port.name != commPortName) {
        logToConsole("Comm port name is wrong: " + port.name + " <> " + commPortName);
        return;
    }

    const timeout = 200;

    var firstTime = true;
    var rows = 1,
        cols = 1;
    var mode = 0;
    var horzMoving = false,
        vertMoving = true;
    var clientWidth = 0,
        clientHeight = 0;
    var scrollStart = {
        left: 0,
        top: 0
    };
    var scrollEnd = {
        left: 0,
        top: 0
    };
    var cropRect = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    };

    var divElement, doc, body, savedScrollTop, savedScrollLeft, docWidth, docHeight;

    stubbornNodes = [];
    modifiedNodes2 = [];

    port.onMessage.addListener(function(msg) {
        switch (msg.topic) {
            case "init":
                mode = msg.mode;
                doc = window.document;
                divElement = undefined;

                if (mode == cModeEntire) {
                    divElement = findScrolledElement(doc.body.scrollWidth, doc.body.scrollHeight);

                    if (divElement) {
                        divElement.scrollIntoView();
                        disableFloatingInView(divElement);
                    }
                }

                body = divElement || doc.body;
                savedScrollTop = body.scrollTop;
                savedScrollLeft = body.scrollLeft;
                docWidth = body.scrollWidth;
                docHeight = body.scrollHeight;

                if (!divElement) {
                    docWidth = Math.max(doc.documentElement.scrollWidth, body.scrollWidth);
                    docHeight = Math.max(doc.documentElement.scrollHeight, body.scrollHeight);

                    if (docWidth <= 0 || docHeight <= 0) {
                        var e = getAltExtents();
                        docWidth = e.Width;
                        docHeight = e.Height;
                    }

                    if (docWidth <= 0) docWidth = 1024;
                    if (docHeight <= 0) docHeight = 768;
                }

                if (mode === cModeEntire) {
                    body.scrollTop = 0;
                    body.scrollLeft = 0;
                }

                if (mode !== cModeVisible && mode !== cModeBrowser)
                    enableSomeElements(false);
                //  disableFixedPositions();

                if (divElement) {
                    clientWidth = divElement.clientWidth;
                    clientHeight = divElement.clientHeight;
                } else {
                    clientWidth = doc.compatMode == "CSS1Compat" ? doc.documentElement.clientWidth : body.clientWidth;
                    clientHeight = doc.compatMode == "CSS1Compat" ? doc.documentElement.clientHeight : body.clientHeight;
                }

                if (msg.clientWidth) {
                    clientWidth = msg.clientWidth;
                }
                if (msg.clientHeight) {
                    clientHeight = msg.clientHeight;
                }

                body.scrollTop = 0;


                if (window.innerHeight <= clientHeight)
                    docWidth = clientWidth;

                /*if (!divElement && mode === cModeEntire && !hasXScrollbar() && !hasYScrollbar()) {
                    docHeight = clientHeight;
                    docWidth = clientWidth;
                    mode = cModeVisible;
                }*/

                var fPreload = window.location.href.match(/https?:\/\/www\.(facebook|fb)\.com/i);

                if (fPreload) {
                    setTimeout(function() {
                        body.scrollTop = 100000;
                        setTimeout(function() {
                            body.scrollTop = 0;
                            setTimeout(function() {
                                port.postMessage({
                                    topic: "initDone",
                                    clientWidth: clientWidth,
                                    clientHeight: clientHeight,
                                    url: document.location.toString(),
                                    title: document.title
                                });
                            }, timeout);
                        }, timeout);
                    }, timeout);
                } else {
                    setTimeout(function() {
                        port.postMessage({
                            topic: "initDone",
                            clientWidth: clientWidth,
                            clientHeight: clientHeight,
                            url: document.location.toString(),
                            title: document.title
                        });
                    }, timeout);
                }
                break;

            case "selectAuto":

                break;

            case "selectArea":
                hideStubbornElements();

                FireShotSelection.makeSelection(function(data) {
                    if (data.left == data.right || data.top == data.bottom)
                        port.postMessage({
                            topic: "areaSelectionCanceled"
                        });
                    else {
                        body.scrollLeft = data.left;
                        body.scrollTop = data.top;

                        scrollStart.left = body.scrollLeft;
                        scrollStart.top = body.scrollTop;

                        cropRect.left = data.left;
                        cropRect.top = data.top;
                        cropRect.right = data.right;
                        cropRect.bottom = data.bottom;

                        port.postMessage({
                            topic: "areaSelected"
                        });
                    }


                });
                break;
            case "selectPCArea":
            case "selectMobileArea":
                hideStubbornElements();

                body.scrollLeft = 0;
                body.scrollTop = 0;

                scrollStart.left = body.scrollLeft;
                scrollStart.top = body.scrollTop;

                cropRect.left = 0;
                cropRect.top = 0;
                cropRect.right = clientHeight;
                cropRect.bottom = body.clientHeight;

                port.postMessage({
                    topic: "areaSelected"
                });
                break;
            case "scrollNext":

                if (firstTime) {
                    firstTime = false;
                    setTimeout(function() {
                        port.postMessage({
                            topic: "scrollDone",
                            x: body.scrollLeft,
                            y: body.scrollTop
                        });
                    }, timeout);

                    return;
                }
                //else

                var savedPos;


                if (vertMoving && mode != cModeVisible && mode != cModeBrowser) {
                    savedPos = body.scrollTop;
                    body.scrollTop += Math.max(0, clientHeight - 1);
                    vertMoving = savedPos != body.scrollTop && body.scrollTop < docHeight;

                    if (mode == cModeSelected) {
                        vertMoving &= body.scrollTop < cropRect.bottom;
                        if (!vertMoving)
                            scrollEnd.top = savedPos;
                    }

                    if (vertMoving) {
                        rows++;
                        body.scrollLeft = (mode == cModeEntire ? 0 : scrollStart.left);

                        logToConsole("scrollTop:" + body.scrollTop);
                        horzMoving = true;

                        setTimeout(function() {
                            hideStubbornElements();
                            setTimeout(function() {
                                port.postMessage({
                                    topic: "scrollDone",
                                    x: body.scrollLeft,
                                    y: body.scrollTop
                                });
                            }, timeout);
                        }, timeout);

                        return;
                    }
                }




                //noinspection JSUnresolvedVariable
                msg = {
                    topic: "scrollFinished",
                    div: 0,
                    left: 0,
                    top: 0,
                    width: (mode == cModeEntire ? docWidth : clientWidth),
                    height: (mode == cModeEntire ? docHeight : clientHeight),
                    zoom: window.devicePixelRatio * 100,
                    rows: rows,
                    cols: cols,
                    cw: clientWidth,
                    ch: clientHeight,
                    hScrollbar: window.innerHeight > clientHeight,
                    vScrollBar: window.innerWidth > clientWidth
                };

                if (divElement) {
                    var rects = divElement.getClientRects();
                    msg.div = 1;
                    if (rects.length > 0) {
                        msg.left = divElement.clientLeft + rects[0].left;
                        msg.top = divElement.clientTop + rects[0].top;
                    }

                    enableFloatingInView();
                }

                if (mode == cModeSelected) {
                    msg.width = scrollEnd.left - scrollStart.left + clientWidth;
                    msg.height = scrollEnd.top - scrollStart.top + clientHeight;

                    msg.crop = true;
                    msg.cropLeft = cropRect.left - scrollStart.left;
                    msg.cropTop = cropRect.top - scrollStart.top;
                    msg.cropRight = msg.cropLeft + (cropRect.right - cropRect.left);
                    msg.cropBottom = msg.cropTop + (cropRect.bottom - cropRect.top);
                }

                logToConsole(JSON.stringify(msg));

                body.scrollLeft = savedScrollLeft;
                body.scrollTop = savedScrollTop;

                if (mode != cModeVisible && mode != cModeBrowser)
                    enableSomeElements(true);
                //  enableFixedPositions();

                showStubbornElements();

                setTimeout(function() {
                    port.postMessage(msg);
                }, timeout);

                break;

        }

        logToConsole("CS:" + msg.topic);

    });
});

document.addEventListener('keydown', function(event) {
    var curShortcut = getShortcut(event);

    if (curShortcut != "")
        chrome.extension.sendMessage({
            message: "checkHotkey",
            data: curShortcut
        });
});

chrome.extension.sendMessage({
    message: "checkFSAvailabilityEvt"
}, function(data) {
    document.addEventListener("checkFSAvailabilityEvt", function(evt) {
        for (var key in data)
            if (data.hasOwnProperty(key))
                evt.target.setAttribute(key, data[key]);

    }, false);
});

document.addEventListener("capturePageEvt", function(evt) {

    chrome.extension.sendMessage({
        message: "capturePageEvt",
        Entire: evt.target.getAttribute("Entire"),
        Action: evt.target.getAttribute("Action"),
        Key: evt.target.getAttribute("Key"),
        Data: evt.target.getAttribute("Data")
    }, function(data) {});
}, false);


document.addEventListener("switchToNativeEvt", function() {

    chrome.extension.sendMessage({
        message: "switchToNativeEvt"
    }, function(data) {});
}, false);
