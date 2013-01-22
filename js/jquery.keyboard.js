

// jQuery Plugin Boilerplate
// A boilerplate for jumpstarting jQuery plugins development
// version 1.0, Jun 24th, 2011
// by François Germain
(function ($) {
    function trace(node) {
        var e = {};
        for (i in node) {
            e[i] = node[i];
        }
        console.log(e);
    }
    // Start
    function getSelectionStart(node) {
        if ('selectionStart' in node) {
            return node.selectionStart;
        } else if ('getSelection' in document) {
            if (!node.ownerDocument.getSelection().rangeCount) {
                return node.innerText.length;
            } else {
                return node.ownerDocument.getSelection().getRangeAt(0).startOffset;
            }
        } else if ('selection' in document) {
            console.log('IE');
        }
    }
    function setSelectionStart(node, start) {
        if ('selectionStart' in node) {
            return node.selectionStart = start;
        } else if ('getSelection' in document) {
            var selection = node.ownerDocument.getSelection(),
                range = document.createRange(),
				end = getSelectionEnd(node);
            selection.removeAllRanges();
            range.setStart(node.firstChild, start);
            range.setEnd(node.firstChild, end);
            selection.addRange(range);
        } else if ('selection' in document) {
            console.log('IE');
        }
    }

    // End
    function getSelectionEnd(node) {
        if ('selectionStart' in node) {
            return node.selectionEnd;
        } else if ('getSelection' in document) {
            if (!node.ownerDocument.getSelection().rangeCount) {
                return node.innerText.length;
            } else {
                return node.ownerDocument.getSelection().getRangeAt(0).endOffset;
            }
        } else if ('selection' in document) {
            console.log('IE');
        }
    }
    function setSelectionEnd(node, end) {
        if ('selectionStart' in node) {
            return node.selectionEnd = end;
        } else if ('getSelection' in document) {
            var selection = node.ownerDocument.getSelection(),
				range = document.createRange(),
				start = getSelectionStart(node);
            selection.removeAllRanges();
            range.setStart(node.firstChild, start);
            range.setEnd(node.firstChild, end);
            selection.addRange(range);
        } else if ('selection' in document) {
            console.log('IE');
        }
    }

    // length
    function getSelectionLength(node) {
        return getSelectionEnd(node) - getSelectionStart(node);
    }
    function setSelectionLength(node, length) {
        setSelectionEnd(node, getSelectionStart(node) + length);
    }

    function set(node, start, n, end) {
        setSelectionStart(node, start);
        if (end) {
            setSelectionEnd(node, n);
        } else {
            setSelectionLength(node, n);
        }
    }

    function replace(node, replace) {
        var el = $(node),
			str;
        if (el.is('input,textarea')) {
            str = el.val();
            el.val(str.substring(0, getSelectionStart(node))
				+ replace
				+ str.substring(getSelectionEnd(node)));
        } else {
            str = el.text();
            console.log(getSelectionStart(node));
            el.text(str.substring(0, getSelectionStart(node))
				+ replace
				+ str.substring(getSelectionEnd(node)));
        }
    }

    $.fn.selection = function (length) {
        var node = this.jquery ? this.get(0) : this;
        return {
            start: function (start) {
                if (typeof start !== 'undefined') {
                    setSelectionStart(node, start);
                    return this;
                } else {
                    return getSelectionStart(node);
                }
            },
            end: function (end) {
                if (typeof end !== 'undefined') {
                    setSelectionEnd(node, end);
                    return this;
                } else {
                    return getSelectionEnd(node);
                }
            },
            length: function (length) {
                if (typeof length !== 'undefined') {
                    setSelectionLength(node, length);
                    return this;
                } else {
                    return getSelectionLength(node);
                }
            },
            set: function (start, n, end) {
                set(node, start, n, end);
                return this;
            },
            clear: function () {
                this.replace('');
            },
            replace: function (string) {
                var start = getSelectionStart(node);
                replace(node, string);
                set(node, start + string.length, 0);
                return this;
            },
            before: function (string) {
                var start = getSelectionStart(node);
                setSelectionLength(node, 0);
                replace(node, string);
                set(node, start + string.length, 0);
            },
            after: function (string) {
                var start = getSelectionEnd(node);
                set(node, start, 0);
                replace(node, string);
                set(node, start + string.length, 0);
            }
        };
    }
})(jQuery);

(function ($) {
    //	Static private vars
    var pluginName = 'keyboard',
		emptyKey = {
		    //	Static public vars
		    text: '',
		    alt: [],
		    name: ''
		};
    $[pluginName] = function (dom, options) {
        var
		plugin = this,
		event = $(document.createElement('div')),
		dom = dom,
		element = $(dom),
		defaults = {
		    elements: {
		        keyboard: '<div class="keyboard"></div>',
		        row: '<ul class="keyboard-row"></ul>',
		        key: '<li class="keyboard-key"></li>',
		        alt: '<ul class="keyboard-alt"></ul>',
		        altKey: '<li class="keyboard-alt-key"></li>'
		    },
		    altDelay: 500,
		    classPrefix: 'keyboard',
		    keyboard: [],
		    plugin: function (e) {
		        e[pluginName]('bind', 'print', function (e, o) {
		            console.log(o.text);
		        });
		    }
		},
		settings = {},
		//TODO: clean all this vars
		keyboard,
		timer = NaN,
		rows = [],
		cap = false,
		locked = false,
		keyPressed,
        clickHandler = options.clickHandler ? options.clickHandler : function (e, o) {
            console.log(o.text);
        },

		// Private methods
		init = function (rows) {
		    // Settings
		    settings = $.extend({}, defaults, options);
		    if (typeof settings.plugin !== 'object') {
		        settings.plugin = [settings.plugin];
		    }

		    // Keyboard
		    keyboard = $(settings.elements.keyboard).appendTo(element);
		    plugin.methods.keyboard(settings.keyboard);

		    // Events
		    $(document).bind('mouseup.' + pluginName, function () {
		        releaseKey();
		    });

		    // Plugins
		    for (i in settings.plugin) {
		        plugin.methods.plug(settings.plugin[i]);
		    }
		},
		releaseKey = function (key, alt) {
		    if (keyPressed) {
		        keyPressed.removeClass(settings.classPrefix + '-held');
		        keyPressed = null;
		        clearTimeout(timer);
		        timer = NaN;
		        if (typeof key !== 'undefined') {
		            if (typeof alt === 'undefined') {
		                alt = false;
		            }
		            var text = alt !== false
								? (cap ? key.cap.alt[alt] : key.alt[alt])
								: (cap ? key.cap.text : key.text);
		            if (key.action !== false && (!key.action || key.action(element) !== false)) {
		                trigger('print', { key: key, cap: cap, alt: alt, text: text });
		                if (!locked && cap) {
		                    plugin.methods.capToggle();
		                }
		            }
		            trigger('release', { key: key, cap: cap, alt: alt, text: text });
		            clickHandler(plugin, { key: key, cap: cap, alt: alt, text: text });
		        }
		    }
		},
		isValidRow = function (row) {
		    return typeof row === 'number' && row === Math.round(row);
		},
		newKeyboard = function (newKeyboard) {
		    keyboard.html('');
		    rows = [];
		    for (i in newKeyboard) {
		        plugin.methods.addRow(newKeyboard[i]);
		    }
		},
		newRow = function (row) {
		    var i = rows.length;
		    while (i <= row) {
		        rows.push([]);
		        keyboard.append(settings.elements.row);
		        i++;
		    }
		},
		newKey = function (row, key) {
		    if (typeof key !== 'object') {
		        key = { text: key };
		    }
		    key = $.extend({}, emptyKey, key);
		    if (typeof key.cap !== 'object') {
		        if (typeof key.cap !== 'undefined') {
		            key.cap = { text: key.cap };
		        } else {
		            key.cap = {};
		        }
		    }
		    if (typeof key.cap.alt === 'undefined') {
		        key.cap.alt = [];
		        for (var i in key.alt) {
		            key.cap.alt[i] = key.alt[i].toUpperCase();
		        }
		    }
		    if (typeof key.cap.text === 'undefined') {
		        key.cap.text = key.text.toUpperCase()
		    }
		    rows[row].push(key);
		    var keyEl = $(settings.elements.key).appendTo(keyboard.children(':eq(' + row + ')'));
		    keyEl.data(pluginName + '-key', key);
		    keyEl.text(cap ? key.cap.text : key.text);
		    if (key.name) {
		        keyEl.addClass(settings.classPrefix + '-key-' + key.name);
		    }
		    updateAlts(keyEl);
		    keyEl.bind('mouseup.' + pluginName, function () {
		        if (keyPressed) {
		            releaseKey(key);
		        }
		    });
		    keyEl.bind('mousedown.' + pluginName, function () {
		        keyPressed = keyEl;
		        timer = setTimeout(function () {
		            keyEl.addClass(settings.classPrefix + '-held');
		        }, settings.altDelay);
		    });
		},
		updateAlts = function (keyEl) {
		    var key = keyEl.data(pluginName + '-key');
		    if (key.alt) {
		        var altEl = $(settings.elements.alt).appendTo(keyEl);
		        for (var k in key.alt) {
		            var altKeyEl = $(settings.elements.altKey).appendTo(altEl);
		            altKeyEl.data(pluginName + '-key', key);
		            altKeyEl.data(pluginName + '-alt', k);
		            altKeyEl.text(cap ? key.cap.alt[k] : key.alt[k]);
		            altKeyEl.bind('mouseup.' + pluginName, function () {
		                releaseKey($(this).data(pluginName + '-key'), $(this).data(pluginName + '-alt'));
		            });
		        }
		    }
		},
		updateKeys = function () {
		    for (var i in rows) {
		        var rowEl = keyboard.children(':eq(' + i + ')');
		        for (j in rows[i]) {
		            var key = rows[i][j];
		            var keyEl = rowEl.children(':eq(' + j + ')');
		            if (cap) {
		                keyEl.text(key.cap.text);
		            } else {
		                keyEl.text(key.text);
		            }
		            updateAlts(keyEl);
		        }
		    }
		},
		trigger = function () {
		    arguments[0] = pluginName + '-' + arguments[0];
		    element.trigger.apply(element, arguments);
		    return dom;
		};

        // Public methods
        plugin.methods = {
            bind: function () {
                arguments[0] = pluginName + '-' + arguments[0];
                element.bind.apply(element, arguments);
                return dom;
            },
            addRow: function (keys) {
                row = rows.length;
                newRow(row);
                for (var i in keys) {
                    newKey(row, keys[i]);
                }
                return dom;
            },
            addKeys: function (row, keys) {
                if (isValidRow(row)) {
                    if (!rows[row]) {
                        newRow(row);
                    }
                    for (var i in keys) {
                        newKey(row, keys[i]);
                    }
                }
                return dom;
            },
            addKey: function (row, key) {
                if (isValidRow(row)) {
                    if (!rows[row]) {
                        newRow(row);
                    }
                    newKey(row, key);
                }
                return dom;
            },
            plug: function (newPlugin) {
                if (typeof newPlugin === 'string') {
                    newPlugin = $[pluginName].plugins[newPlugin];
                }
                if (typeof newPlugin === 'function') {
                    newPlugin(element);
                }
            },
            capToggle: function (lock) {
                cap = !cap;
                locked = Boolean(lock) && cap;
                if (cap && locked) {
                    element.addClass('keyboard-capsLocked');
                    element.removeClass('keyboard-caps');
                } else if (cap) {
                    element.addClass('keyboard-caps');
                    element.removeClass('keyboard-capsLocked');
                } else {
                    element.removeClass('keyboard-caps');
                    element.removeClass('keyboard-capsLocked');
                }
                updateKeys();
                return dom;
            },
            cap: function (lock) {
                cap = true;
                locked = Boolean(lock);
                if (cap && locked) {
                    element.addClass('keyboard-capsLocked');
                    element.removeClass('keyboard-caps');
                } else {
                    element.addClass('keyboard-caps');
                    element.removeClass('keyboard-capsLocked');
                }
                updateKeys();
                return dom;
            },
            unCap: function () {
                cap = false;
                locked = false;
                element.removeClass('keyboard-caps');
                element.removeClass('keyboard-capsLocked');
                updateKeys();
                return dom;
            },
            keyboard: function (def) {
                if (typeof def === 'string') {
                    def = $[pluginName].keyboards[def];
                }
                if (typeof def === 'object') {
                    newKeyboard(def);
                }
                return keyboard;
            }
        };

        element.data(pluginName, plugin);
        init();
        keyboard.hide();
    }
    $[pluginName].keyboards = {};
    $[pluginName].plugins = {};

    $.fn[pluginName] = function (options) {
        var args = arguments,
			chain = this;
        this.each(function () {
            var i = $(this);
            if (undefined == (plugin = i.data(pluginName))) {
                var plugin = new $[pluginName](this, options);
            }
            if (plugin.methods[options]) {
                if ((r = plugin.methods[options].apply(plugin, Array.prototype.slice.call(args, 1))) !== this) {
                    chain = r;
                    return false;
                }
            }
        });
        return chain;
    }

})(jQuery);

(function ($) {
    $.keyboard.keyboards.qwerty = [
		['@', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', { text: '⌫', name: 'backSpace', action: function (e) { return false; } }],
		[{ text: 'TAB', cap: { text: 'TAB' }, name: 'tab', action: false }, 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', { text: 'RET', name: 'return', action: false }],
		[{ text: 'CAPS', name: 'capsLock', action: function (e) { e.keyboard('capToggle', true); return false; } }, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', { text: ',', alt: [':', ';'] }],
		[{ text: 'LS', name: 'leftShift', action: function (e) { e.keyboard('capToggle'); return false; } }, 'z', 'x', 'c', 'v', 'b', 'n', 'm', { text: '.', alt: ['?', '!', ';'] }, '\'', { text: ':)', alt: [';)', 'X)', '8)', ':('] }, { text: 'RS', name: 'rightShift', action: function (e) { e.keyboard('capToggle'); return false; } }],
		[{ text: ' ', name: 'space' }, { text: '←', action: false, name: 'leftArrow' }, { text: '→', action: false, name: 'rightArrow' }]
    ];
})(jQuery);