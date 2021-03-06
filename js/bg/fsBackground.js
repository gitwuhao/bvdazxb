var tabId, tabURL, tabTitle, imgData = [];
var extVersion = "0.0";
var updateURL = "";
var capAction, capMode, capCallbackCompleted;
var executeScriptTO;
var capId = 0,
    processedId = 0;
var guiItemsLocked = false;
var resumeMenuEnabled = false;
var shortcutProcessing = false;
var ignoreShortcuts = false;
var commPortName = "FireShot Comm Port #" + Math.ceil(Math.random() * 45309714203);
var capResult, capResultDataURL, capResultFileNameLite, multiPDFMode;




function displayAnnouncements() {
    var show = getOption(cFirstTimeRun, "true") == "true";

    if (show) {
        localStorage[cFirstTimeRun] = false;
        localStorage[cCurrentVersion] = extVersion;

        //if (!isDebug) 
        //showBadge(getInstalledPageURL());
        openURL(getInstalledPageURL());
    } else {
        var prevVer = getOption(cCurrentVersion, "0.0");

        if (extVersion != prevVer) {
            if (!isNativeSupported()) {
                showBadge("http://getfireshot.com/updated-lite.php?app=" + (isOpera() ? "op" : "ch") + "&ver=" + extVersion);
            }
            //extensionUpdated(true);
            //localStorage[cCurrentVersion] = extVersion;
        }
    }
}

function getInstalledPageURL() {
    var addonString = "&app=" + (isOpera() ? "op" : "ch");

    if (isNativeSupported()) return "http://getfireshot.com/installed.php?ver=" + extVersion + addonString + "&native=1";
    else return "http://getfireshot.com/installed-lite.php?ver=" + extVersion + addonString;
}

function nativeHostUpdated(newVersion) {
    logToConsole("Native module has updated to the " + newVersion + " version.");

    gaTrack('UA-1025658-9', 'fireshot.com', "NativeHostUpdated");

    if (newVersion == extVersion) {
        showBadge("http://getfireshot.com/updated.php?app=" + (isOpera() ? "op" : "ch") + "&ver=" + newVersion);
    }
}

function switchToProIfRequired() {
    /*var pro = getOption(cPluginProModePref, "false") == "true";
    if (!pro && updateURL == "http://screenshot-program.com/fireshot/chrome.xml")
        doUpgrade();*/
}

function pluginEvent(obj) {
    var topic = obj.topic,
        data = obj.data;

    if (topic == "status") {
        if (obj.code == statusHostReady)
            pluginCommand("setAddonVersion", {
                version: extVersion,
                browser: isOpera() ? "Opera" : "Chromium"
            });
        else {
            gaTrack('UA-1025658-9', 'fireshot.com', "NativeError-" + obj.data);
            alert("FireShot failed to update. The updater reported the following error: \r\n-----------------------------------------------\r\n" + obj.data + "\r\n-----------------------------------------------\r\n\r\nFireShot will have to work in Lite mode.");
            logToConsole("Error from native module: " + obj.data);
        }
    } else if (topic == "openURL") {
        openURL(data);
    } else if (topic == "enableResumeMenu") {
        logToConsole("enableResumeMenu " + data);
        resumeMenuEnabled = data == "enable";

        setTimeout(function() {
            updateContextMenu();
        }, 10);
    } else if (topic == "setupMode") {
        localStorage[cPluginProModePref] = data != "false";

        updateContextMenu();
    } else if (topic == "setRegistered") {
        localStorage[cRegisteredPref] = data != "false";
        updateContextMenu();
    } else if (topic == "getInfo") {
        var request = new XMLHttpRequest();
        request.open("GET", data, true);
        request.onreadystatechange = function() {
            if (this.readyState == XMLHttpRequest.DONE) {
                pluginCommand("processInfo", {
                    data: this.responseText
                });
            }
        };
        request.send();
    } else if (topic == "saveCrashData") {
        gaTrack('UA-1025658-9', 'fireshot.com', "AV-" + encodeURIComponent(data));
    }
}


function initPictuerInstance(tab) {
    var port = chrome.tabs.connect(tab.id);
    fs.pictuer = {
        tab: tab,
        port: port,
        sendMessage: function(msg) {
            port.postMessage(msg);
        }
    };
    port.onMessage.addListener(function(request, sender) {
        var topic = request.topic;
        if (topic == 'createDirSuccess') {
            fs.page.doCreateDirSuccess(request);
        } else if (topic == 'uploadSuccess') {
            fs.page.doUploadSuccess(request);
        }

    });
}
try {
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            var tab = sender.tab;
            switch (request.message) {
                case "initPictuerDone":
                    initPictuerInstance(tab);
                    fs.pictuer.sendMessage({
                        topic: 'hello'
                    });
                    fs.page.init();
                    break;
                case "getPortName":
                    sendResponse({
                        portName: commPortName
                    });
                    break;
                case "loadScript":
                    if (executeScriptTO !== undefined) {
                        clearTimeout(executeScriptTO);
                        executeScriptTO = undefined;
                    }

                    chrome.tabs.executeScript(tabId, {
                            file: "js/bg/fsUtils.js",
                            runAt: "document_start"
                        },
                        function() {
                            chrome.tabs.executeScript(tabId, {
                                    file: "scripts/fsSelection.js",
                                    runAt: "document_start"
                                },
                                function() {
                                    chrome.tabs.executeScript(tabId, {
                                            file: "scripts/fsContent.js",
                                            runAt: "document_start"
                                        },
                                        function() {
                                            doCapturing(capAction, capMode, capCallbackCompleted);
                                        }
                                    );
                                }
                            );
                        }
                    );
                    break;

                case "execScript":
                    if (executeScriptTO !== undefined) {
                        clearTimeout(executeScriptTO);
                        executeScriptTO = undefined;
                    }

                    doCapturing(capAction, capMode, capCallbackCompleted);
                    break;

                case "checkHotkey":
                    function checkKey(prefName, defaultShortcut, callback) {
                        var prefShortcut = getOption(prefName, defaultShortcut);
                        if (prefShortcut == request.data && !shortcutProcessing && !ignoreShortcuts) {
                            ignoreShortcuts = true;
                            callback();
                            setTimeout(function() {
                                ignoreShortcuts = false;
                            }, 1000);
                            return true;
                        }
                        return false;
                    }

                    function getShortcutAction(prefName, defaultValue) {
                        if (!isNativeSupported()) return cActionEdit;
                        switch (parseInt(getOption(prefName, defaultValue))) {
                            case 1:
                                return cActionSave;
                            case 2:
                                return cActionSavePDF;
                            case 3:
                                return cActionSendOneNote;
                            case 4:
                                return cActionUpload;
                            case 5:
                                return cActionPrint;
                            case 6:
                                return cActionClipboard;
                            case 7:
                                return cActionEMail;
                            case 8:
                                return cActionPaint;
                            default:
                                return cActionEdit;
                        }
                    }


                    checkKey(cShortcutPref, cDefaultShortcut, function() {
                            captureLastUsedMode();
                        }) ||
                        checkKey(cShortcutPrefVisible, cDefaultShortcutVisible, function() {
                            executeGrabber(getShortcutAction(cShortcutPrefVisibleAction, cDefaultShortcutVisibleAction), cModeVisible);
                        }) ||
                        checkKey(cShortcutPrefEntire, cDefaultShortcutEntire, function() {
                            executeGrabber(getShortcutAction(cShortcutPrefEntireAction, cDefaultShortcutEntireAction), cModeEntire);
                        }) ||
                        checkKey(cShortcutPrefSelection, cDefaultShortcutSelection, function() {
                            executeGrabber(getShortcutAction(cShortcutPrefSelectionAction, cDefaultShortcutSelectionAction), cModeSelected);
                        }) ||
                        (isNativeSupported() && checkKey(cShortcutPrefBrowser, cDefaultShortcutBrowser, function() {
                            executeGrabber(getShortcutAction(cShortcutPrefBrowserAction, cDefaultShortcutBrowserAction), cModeBrowser);
                        }));

                    break;

                case "checkFSAvailabilityEvt":
                    {
                        sendResponse({
                            FSAvailable: true,
                            FSUpgraded: localStorage[cPluginProModePref] === "true"
                        });
                        break;
                    }

                case "capturePageEvt":
                    {
                        var action = parseInt(request.Action);
                        if (action == cActionUpgrade)
                            doUpgrade();
                        else
                            executeGrabber(action, request.Entire == "true" ? cModeEntire : cModeVisible);
                        break;
                    }

                case "switchToNativeEvt":
                    {
                        installNative();
                        break;
                    }

            }
        });
} catch (e) {}

/*
chrome.extension.onRequest.addListener(
    function(request, sender)
    {
        
    }
)*/

//noinspection JSUnusedGlobalSymbols
function checkBadgeAction() {
    if (localStorage[cQueuedBadgeURLPref] && localStorage[cQueuedBadgeURLPref] != "undefined") {
        openURL(localStorage[cQueuedBadgeURLPref]);
        showBadge(undefined);
        localStorage[cFirstTimeRun] = false;
        localStorage[cCurrentVersion] = extVersion;
        return true;
    }
    return false;
}

function capturePage(Action, Mode, CallbackCompleted) {
    capAction = Action;
    capMode = Mode;
    capCallbackCompleted = CallbackCompleted;

    if (executeScriptTO !== undefined) {
        clearTimeout(executeScriptTO);
        executeScriptTO = undefined;
    }

    capId++;


    var tab = fsPlugin.client.activeTab;
    tabId = tab.id;

    chrome.tabs.executeScript(tab.id, {
        code: "{}",
        runAt: "document_start"
    }, function() {
        var noExecScript = chrome.runtime.lastError !== undefined;

        // Окно захватываем напрямую в случае, если инжект скриптов невозможен, либо нам уже известны заголовок и url страницы
        if (Mode == cModeBrowser && (noExecScript || (tab.url !== undefined && tab.title !== undefined)))
            setTimeout(
                function() {
                    logToConsole("Calling captureBrowser directly...");
                    pluginCommand("captureBrowser", {
                        action: Action + ":-",
                        url: tab.url,
                        title: tab.title
                    });
                    if (capCallbackCompleted)
                        capCallbackCompleted();
                },
                100
            );

        else {
            executeScriptTO = setTimeout(
                function() {
                    doCapturing(capAction, capMode, capCallbackCompleted);
                },
                1000
            );

            chrome.tabs.executeScript(tabId, {
                file: "js/canvas/fsScriptChecker.js",
                runAt: "document_start"
            }, function() {
                if (chrome.runtime.lastError) {
                    clearTimeout(executeScriptTO);
                    executeScriptTO = undefined;
                    doCapturing(capAction, capMode, capCallbackCompleted);
                }
            });
        }
    });
}

function getActionLocaleId(action) {
    switch (action) {
        case cActionSave:
            return "action_save";
        case cActionSavePDF:
            return "action_save_pdf";
        case cActionClipboard:
            return "action_copy";
        case cActionEMail:
            return "action_email";
        case cActionPaint:
            return "action_external";
        case cActionSendOneNote:
            return "action_onenote";
        case cActionUpload:
            return "action_upload";
        case cActionPrint:
            return "action_print";
        case cActionMultiPDF:
            return "action_save_pdf_single";
        default:
            return "action_edit";
    }
}

function getLADescription() {
    var action1, action2 = getActionLocaleId(getLastAction());
    var fLite = !isNativeSupported();
    switch (getLastMode()) {
        case cModeVisible:
            action1 = fLite ? "action_capture_visible_lite" : "action_capture_visible";
            break;
        case cModeSelected:
            action1 = fLite ? "action_capture_selection_lite" : "action_capture_selection";
            break;
        case cModeBrowser:
            action1 = "action_capture_browser";
            break;
        case cModeTabs:
            action1 = "action_capture_tabs";
            break;
        default:
            action1 = fLite ? "action_capture_entire_lite" : "action_capture_entire";
    }

    if (fLite)
        return chrome.i18n.getMessage(action1);
    else
        return chrome.i18n.getMessage(action1) + " " + chrome.i18n.getMessage(action2);
}

function doCapturing(Action, Mode, CallbackCompleted) {

    //debugger;
    if (capId <= processedId++) {
        capId = processedId;
        //if (CallbackCompleted)
        //    throw "Unexpected error while capturing using callback";

        return;
    }

    var activeTab = fsPlugin.client.activeTab;
    tabId = activeTab.id;

    try {
        var port = chrome.tabs.connect(tabId, {
                name: commPortName
            }),
            connecting = true;
        //debugger;

        var initMsg = {
            topic: "init",
            mode: Mode
        };

        if (Mode == cModePC) {
            util.merger(initMsg, config.PCSize, {
                mode: cModeSelected,
            });
            // Mode=cModeEntire;
        } else if (Mode == cModeMobile) {
            util.merger(initMsg, config.MobileSize, {
                mode: cModeSelected,
            });

        }

        port.postMessage(initMsg);
        port.onMessage.addListener(function(msg) {
            //debugger;

            logToConsole(JSON.stringify(msg));

            switch (msg.topic) {
                case "initDone":

                    tabURL = msg.url;
                    tabTitle = msg.title;
                    connecting = false;

                    switch (Mode) {
                        case cModePC:
                            pluginCommand("captureInit", msg);
                            port.postMessage({
                                topic: "selectPCArea"
                            });
                            break;
                        case cModeMobile:
                            pluginCommand("captureInit", msg);
                            port.postMessage({
                                topic: "selectMobileArea"
                            });
                            break;
                    }
                    break;
                case "areaSelected":
                    port.postMessage({
                        topic: "scrollNext"
                    });
                    break;
                    // case "areaSelectionCanceled":
                    //     port.onMessage.removeListener(arguments.callee);
                    //     break;

                case "scrollDone":
                    chrome.tabs.captureVisibleTab(activeTab.windowId, {
                            format: "png"
                        },
                        function(data) {
                            pluginCommand("captureTabPNG", {
                                dataurl: data,
                                datasize: data.length,
                                x: msg.x,
                                y: msg.y
                            });
                            port.postMessage({
                                topic: "scrollNext"
                            });
                        });
                    break;

                case "scrollFinished":
                    logToConsole("FINISHED (" + msg.rows + " x " + msg.cols + ")");

                    msg.url = tabURL;
                    msg.title = tabTitle;

                    msg.key = "-";
                    msg.action = Action;
                    msg.browserVersion = 40; //parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

                    pluginCommand("captureDone", msg);

                    port.onMessage.removeListener(arguments.callee);
                    if (CallbackCompleted) CallbackCompleted(true);
                    break;
            }


        });
        //noinspection JSUnresolvedVariable
        port.onDisconnect.addListener(function() {
            if (connecting) {
                if (CallbackCompleted)
                    CallbackCompleted(false);
            }
        });
    } catch (e) {
        if (CallbackCompleted)
            CallbackCompleted(false);
    }

}

//noinspection JSUnusedLocalSymbols
function genericOnClick(info, tab) {
    //debugger;
    switch (info.menuItemId) {
        case mnuTest:
            doTest();
            break;
        case mnuVisibleEdit:
            executeGrabber(cActionEdit, cModeVisible);
            break;
        case mnuVisibleSave:
            executeGrabber(cActionSave, cModeVisible);
            break;
        case mnuVisibleSavePDF:
            executeGrabber(cActionSavePDF, cModeVisible);
            break;
        case mnuVisibleSendOneNote:
            executeGrabber(cActionSendOneNote, cModeVisible);
            break;
        case mnuVisibleUpload:
            executeGrabber(cActionUpload, cModeVisible);
            break;
        case mnuVisiblePrint:
            executeGrabber(cActionPrint, cModeVisible);
            break;
        case mnuVisibleCopy:
            executeGrabber(cActionClipboard, cModeVisible);
            break;
        case mnuVisibleEMail:
            executeGrabber(cActionEMail, cModeVisible);
            break;
        case mnuVisibleExtEditor:
            executeGrabber(cActionPaint, cModeVisible);
            break;

        case mnuEntireEdit:
            executeGrabber(cActionEdit, cModeEntire);
            break;
        case mnuEntireSave:
            executeGrabber(cActionSave, cModeEntire);
            break;
        case mnuEntireSavePDF:
            executeGrabber(cActionSavePDF, cModeEntire);
            break;
        case mnuEntireSendOneNote:
            executeGrabber(cActionSendOneNote, cModeEntire);
            break;
        case mnuEntireUpload:
            executeGrabber(cActionUpload, cModeEntire);
            break;
        case mnuEntirePrint:
            executeGrabber(cActionPrint, cModeEntire);
            break;
        case mnuEntireCopy:
            executeGrabber(cActionClipboard, cModeEntire);
            break;
        case mnuEntireEMail:
            executeGrabber(cActionEMail, cModeEntire);
            break;
        case mnuEntireExtEditor:
            executeGrabber(cActionPaint, cModeEntire);
            break;

        case mnuSelectedEdit:
            executeGrabber(cActionEdit, cModeSelected);
            break;
        case mnuSelectedSave:
            executeGrabber(cActionSave, cModeSelected);
            break;
        case mnuSelectedSavePDF:
            executeGrabber(cActionSavePDF, cModeSelected);
            break;
        case mnuSelectedSendOneNote:
            executeGrabber(cActionSendOneNote, cModeSelected);
            break;
        case mnuSelectedUpload:
            executeGrabber(cActionUpload, cModeSelected);
            break;
        case mnuSelectedPrint:
            executeGrabber(cActionPrint, cModeSelected);
            break;
        case mnuSelectedCopy:
            executeGrabber(cActionClipboard, cModeSelected);
            break;
        case mnuSelectedEMail:
            executeGrabber(cActionEMail, cModeSelected);
            break;
        case mnuSelectedExtEditor:
            executeGrabber(cActionPaint, cModeSelected);
            break;

        case mnuBrowserEdit:
            executeGrabber(cActionEdit, cModeBrowser);
            break;
        case mnuBrowserSave:
            executeGrabber(cActionSave, cModeBrowser);
            break;
        case mnuBrowserSavePDF:
            executeGrabber(cActionSavePDF, cModeBrowser);
            break;
        case mnuBrowserSendOneNote:
            executeGrabber(cActionSendOneNote, cModeBrowser);
            break;
        case mnuBrowserUpload:
            executeGrabber(cActionUpload, cModeBrowser);
            break;
        case mnuBrowserPrint:
            executeGrabber(cActionPrint, cModeBrowser);
            break;
        case mnuBrowserCopy:
            executeGrabber(cActionClipboard, cModeBrowser);
            break;
        case mnuBrowserEMail:
            executeGrabber(cActionEMail, cModeBrowser);
            break;
        case mnuBrowserExtEditor:
            executeGrabber(cActionPaint, cModeBrowser);
            break;

        case mnuAllTabsEdit:
            executeGrabber(cActionEdit, cModeTabs);
            break;
        case mnuAllTabsSinglePDF:
            executeGrabber(cActionMultiPDF, cModeTabs);
            break;
        case mnuAllTabsSave:
            executeGrabber(cActionSave, cModeTabs);
            break;
        case mnuAllTabsSendOneNote:
            executeGrabber(cActionSendOneNote, cModeTabs);
            break;
        case mnuAllTabsUpload:
            executeGrabber(cActionUpload, cModeTabs);
            break;
        case mnuAllTabsPrint:
            executeGrabber(cActionPrint, cModeTabs);
            break;
        case mnuAllTabsEMail:
            executeGrabber(cActionEMail, cModeTabs);
            break;
        case mnuAllTabsExtEditor:
            executeGrabber(cActionPaint, cModeTabs);
            break;

        case mnuLastAction:
            captureLastUsedMode();
            break;
        case mnuPreferences:
            openExtensionPreferences();
            break;
        case mnuViewDemo:
            openDemoPage();
            break;
        case mnuSupport:
            openSupportPage();
            break;
        case mnuAPI:
            openAPIPage();
            break;

        case mnuUnlockProFeatures:
        case mnuUpgrade:
            doUpgrade();
            break;

        case mnuUniblue:
            openUnibluePromo();
            break;
        case mnuRegister:
            doRegister();
            break;
        case mnuEnterLicense:
            enterLicense();
            break;
        case mnuOpenFile:
            openFile();
            break;
        case mnuOpenClipboard:
            openClipboard();
            break;
        case mnuResume:
            resumeEditing();
            break;
        case mnuFireShotNative:
            installNative();
            break;
        case mnuLicensingInfo:
            showLicenseInfo();
            break;
        case mnuAbout:
            showAbout();
            break;
    }
}



var fEntered = false;
var mnuLastAction, mnuVisibleEdit, mnuVisibleSave, mnuVisibleSavePDF, mnuVisibleSendOneNote, mnuVisibleUpload, mnuVisiblePrint, mnuVisibleCopy, mnuVisibleEMail, mnuVisibleExtEditor,
    mnuEntireEdit, mnuEntireSave, mnuEntireSavePDF, mnuEntireSendOneNote, mnuEntireUpload, mnuEntirePrint, mnuEntireCopy, mnuEntireEMail, mnuEntireExtEditor,
    mnuSelectedEdit, mnuSelectedSave, mnuSelectedSavePDF, mnuSelectedSendOneNote, mnuSelectedUpload, mnuSelectedPrint, mnuSelectedCopy, mnuSelectedEMail, mnuSelectedExtEditor,
    mnuBrowserEdit, mnuBrowserSave, mnuBrowserSavePDF, mnuBrowserSendOneNote, mnuBrowserUpload, mnuBrowserPrint, mnuBrowserCopy, mnuBrowserEMail, mnuBrowserExtEditor,
    mnuResume, mnuOpenFile, mnuOpenClipboard, mnuPreferences, mnuRegister, mnuEnterLicense, mnuUpgrade, mnuViewDemo, mnuSupport, mnuAPI, mnuUniblue, mnuLicensingInfo, mnuAbout, mnuFireShotNative, mnuTest,
    mnuAllTabsEdit, mnuAllTabsSinglePDF, mnuUnlockProFeatures, mnuAllTabsSave, mnuAllTabsSendOneNote, mnuAllTabsUpload, mnuAllTabsPrint, mnuAllTabsEMail, mnuAllTabsExtEditor;



function restoreBadge() {
    if (localStorage[cQueuedBadgeURLPref] && localStorage[cQueuedBadgeURLPref] != "undefined")
        showBadge(localStorage[cQueuedBadgeURLPref]);
}

//noinspection JSUnusedGlobalSymbols
function executeGrabber(action, mode) {

    capturePage(action, mode);
}


function captureTabs(action) {

    function AsyncCycle(method, stop) {
        return {
            next: function(param) {
                if (!stop(param))
                    method(this);
            }
        }
    }

    function AnimatedIcon() {
        return {
            running: false,

            start: function() {
                var cntr = 0,
                    images = ['images/progress_1_.png', 'images/progress_2_.png', 'images/progress_3_.png', 'images/progress_4_.png'],
                    parent = this,
                    cycle = function() {
                        if (parent.running) {
                            chrome.browserAction.setIcon({
                                path: images[++cntr % 4]
                            });
                            setTimeout(function() {
                                cycle()
                            }, 500);
                        } else parent.defaultIcon();
                    };

                this.running = true;
                cycle();
            },

            stop: function() {
                this.running = false;
                this.defaultIcon();
            },

            defaultIcon: function() {
                chrome.browserAction.setIcon({
                    path: 'images/sss_19.png'
                });
            }


        }
    }

    function iterateTabsAndCapture(action) {

        return new Promise(function(resolve) {
            var tabsCaptured = 0;
            chrome.windows.getLastFocused(function(window) {
                if (window)
                    chrome.tabs.query({
                        windowId: window.id
                    }, function(tabs) {
                        var currentTab = 0,
                            cycle = new AsyncCycle(function(iterator) {
                                    try {
                                        chrome.tabs.highlight({
                                            windowId: window.id,
                                            tabs: currentTab++
                                        }, function() {
                                            capturePage(action, cModeEntire, function(result) {
                                                if (result) ++tabsCaptured;
                                                iterator.next();
                                            });

                                            /*waitForLoading(wnd, currentTab - 1, 300, function (tab) {
                                             if (!tab)
                                             alert('tab closed');
                                             iterator.next();
                                             });*/
                                        });
                                    } catch (e) {
                                        logError(e.message);
                                        resolve(tabsCaptured);
                                    }
                                },

                                function() {
                                    if (currentTab >= tabs.length) {
                                        resolve(tabsCaptured);
                                        return true;
                                    } else return false;
                                });

                        cycle.next();
                    });
                else resolve(tabsCaptured);
            });

        });

    }


    var progressIcon = new AnimatedIcon();
    progressIcon.start();

    var tAction = action === cActionMultiPDF ? action : cActionSilentAdd;

    if (action === cActionMultiPDF) {
        pluginCommand("startMultiPagePDF");
        multiPDFMode = true;
    }

    iterateTabsAndCapture(tAction)
        .then(function(tabsCaptured) {
            progressIcon.stop();

            if (action === cActionMultiPDF) {
                pluginCommand("endMultiPagePDF");
                multiPDFMode = undefined;
            } else
                pluginCommand("doGroupAction", {
                    action: action.toString(),
                    count: tabsCaptured.toString()
                });
        });

}


function doTest() {}


document.addEventListener('DOMContentLoaded', function() {
    restoreBadge();
});
