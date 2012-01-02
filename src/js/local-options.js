(function() {
    var globalOptions = {};
    var localOptions = {
        enabled: undefined,
        appendScramble: undefined
    };

    function saveStorage(name, value) {
        localStorage['flower-password-' + name] = JSON.stringify(value);
    }

    function loadStorage(name) {
        var value = localStorage['flower-password-' + name];
        if ($.isNotUndefined(value)) value = JSON.parse(value);
        return value;
    }

    function setLocalOption(name, value) {
        localOptions[name] = value;
        saveStorage(name, value);
    }

    function setGlobalOption(name, value) {
        globalOptions[name] = value;
        chrome.extension.sendRequest({action: 'setOption', name: name, value: value});
    }

    function readLocalOptions() {
        for (var name in localOptions) {
            var value = loadStorage(name);
            if ($.isUndefined(value)) {
                if ($.isNotUndefined(localOptions[name])) {
                    saveStorage(name, localOptions[name]);
                }
            } else {
                localOptions[name] = value;
            }
        }
    }

    function getGlobalOptions() {
        chrome.extension.sendRequest({action: 'getOptions'}, function(response) {
            globalOptions = response;
            sendEnabled();
            triggerOnSetEnabled();
        });
    }

    function sendEnabled() {
        chrome.extension.sendRequest({action: 'setPageEnabled', value: options.isEnabled()});
    }

    function triggerOnSetEnabled() {
        if (options.onSetEnabled) options.onSetEnabled();
    }

    window.options = {
        init: function() {
            readLocalOptions();
            getGlobalOptions();
        },

        isFillKeyWithDomain: function() {
            return globalOptions.fillKeyWithDomain;
        },
        setFillKeyWithDomain: function(value) {
            setGlobalOption('fillKeyWithDomain', value);
        },

        isDefaultAppendScramble: function() {
            return globalOptions.defaultAppendScramble;
        },
        isAppendScramble: function() {
            if ($.isUndefined(localOptions.appendScramble)) {
                return options.isDefaultAppendScramble();
            } else {
                return localOptions.appendScramble;
            }
        },
        setAppendScramble: function(value) {
            setLocalOption('appendScramble', value);
        },

        getScramble: function() {
            return globalOptions.scramble;
        },
        setScramble: function(value) {
            setGlobalOption('scramble', value);
        },

        isShowHint: function() {
            return globalOptions.showHint;
        },
        setShowHint: function(value) {
            setGlobalOption('showHint', value);
        },
        toggleShowHint: function() {
            options.setShowHint(!options.isShowHint());
        },

        onSetEnabled: null,
        isDefaultEnabled: function() {
            return globalOptions.defaultEnabled;
        },
        isEnabled: function() {
            if ($.isUndefined(localOptions.enabled)) {
                return options.isDefaultEnabled();
            } else {
                return localOptions.enabled;
            }
        },
        setEnabled: function (value) {
            setLocalOption('enabled', value);
            triggerOnSetEnabled();
        },
        toggleEnabled: function() {
            options.setEnabled(!options.isEnabled());
            sendEnabled();
        }
    };

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        if (request.action == 'toggleEnabled') {
            options.toggleEnabled();
        } else if (request.action == 'requestEnabled') {
            sendEnabled();
        } else if (request.action == 'onOptionsChanged') {
            getGlobalOptions();
        }
    });
})();