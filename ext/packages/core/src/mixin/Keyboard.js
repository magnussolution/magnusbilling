/**
 * A mixin for components that need to interact with the keyboard. The primary config
 * for this class is the `{@link #keyMap keyMap}` config. This config is an object
 * with key names as its properties and with values that describe how the key event
 * should be handled.
 *
 * Key names may key name as documented in `Ext.event.Event`, numbers (which are treated
 * as `keyCode` values), single characters (for those that are not defined in
 * `Ext.event.Event`) or `charCode` values prefixed by '#' (e.g., "#65" for `charCode=65`).
 *
 * Entries that use a `keyCode` will be processed in a `keydown` event listener, while
 * those that use a `charCode` will be processed in `keypress`. This can be overridden
 * if the `keyMap` entry specifies an `event` property.
 *
 * Key names may be preceded by key modifiers. The modifier keys can be specified
 * by prepending the modifier name to the key name separated by `+` or `-` (e.g.,
 * "Ctrl+A" or "Ctrl-A"). Only one of these delimiters can be used in a given
 * entry.
 *
 * Valid modifier names are:
 *
 *  - Alt
 *  - Shift
 *  - Control (or "Ctrl" for short)
 *  - Command (or "Cmd" or "Meta")
 *  - CommandOrControl (or "CmdOrCtrl") for Cmd on Mac, Ctrl otherwise.
 *
 * For example:
 *
 *      Ext.define('MyChartPanel', {
 *          extend: 'Ext.panel.Panel',
 *          controller: 'mycontroller',
 *
 *          // Map keys to methods (typically in a ViewController):
 *          keyMap: {
 *              ENTER: 'onEnterKey',
 *
 *              "ALT+PRINT_SCREEN": 'doScreenshot',
 *
 *              // Cmd on Mac OS X, Ctrl on Windows/Linux.
 *              "CmdOrCtrl+C": 'doCopy',
 *
 *              // This one is handled by a class method.
 *              ESC: {
 *                  handler: 'destroy',
 *                  scope: 'this',
 *                  event: 'keypress'  // default would be keydown
 *              }
 *          }
 *      });
 *
 * The method names are interpreted in the same way that event listener names are
 * interpreted.
 *
 * @since 6.2.0
 */
Ext.define('Ext.mixin.Keyboard', function (Keyboard) { return {
    extend: 'Ext.Mixin',
    
    mixinConfig: {
        id: 'keyboard'
    },

    config: {
        /**
         * @cfg {Object} keyMap
         * An object containing handlers for keyboard events. The property names of this
         * object are the key name and any modifiers. The values of the properties are the
         * descriptors of how to handle each event.
         *
         * The handler descriptor can be simply the handler function (either the
         * literal function or the method name), or it can be an object with these
         * properties:
         *
         *  - `handler`: The function or its name to call to handle the event.
         *  - `scope`: The this pointer context (can be "this" or "controller").
         *  - `event`: An optional override of the key event to which to listen.
         *
         * **Important:** Calls to `setKeyMap` do not replace the entire `keyMap` but
         * instead update the provided mappings. That is, unless `null` is passed as the
         * value of the `keyMap` which will clear the `keyMap` of all entries.
         *
         * @cfg {String} [keyMap.scope] The default scope to apply to key handlers
         * which do not specify a scope. This is processed the same way as the scope of
         * {@link #cfg-listeners}. It defaults to the `"controller"`, but using `'this'`
         * means that an instance method will be used.
         */
        keyMap: {
            $value: null,
            cached: true,

            merge: function (value, baseValue, cls, mixin) {
                // Allow nulling out parent class config
                if (value === null) {
                    return value;
                }

                // We promote all values into objects but these objects do not get
                // merged with base class values. Further, the keys get toUpperCased
                // to normalize this aspect ('esc' vs 'ESC' vs 'Esc').
                var ret = baseValue ? Ext.Object.chain(baseValue) : {},
                    key, ucKey, v, vs;
                
                for (key in value) {
                    if (key !== 'scope') {
                        ucKey = key.toUpperCase();

                        if (!mixin || ret[ucKey] === undefined) {
                            // Promote to an object so we can always store the scope.
                            v = value[key];
                            if (v) {
                                if (typeof v === 'string' || typeof v === 'function') {
                                    v = {
                                        handler: v
                                    };
                                } else {
                                    v = Ext.apply({
                                        handler: v.fn // overwritten by v.handler
                                    }, v);
                                }

                                vs = v.scope || value.scope || 'self';

                                v.scope = (vs === 'controller') ? 'self.controller' : vs;
                            }

                            ret[ucKey] = v;
                        }
                    }
                }

                return ret;
            }
        },

        /**
         * @cfg {Boolean} keyMapEnabled
         * Enables or disables processing keys in the `keyMap`. This value starts as
         * `null` and if it is `null` when `initKeyMap` is called, it will automatically
         * be set to `true`. Since `initKeyMap` is called by `Ext.Component` at the
         * proper time, this is not something application code normally handles.
         */
        keyMapEnabled: null
    },

    /**
     * @cfg {Boolean} keyMapTarget
     * The name of the member that should be used to listen for keydown/keypress events.
     * This is intended to be controlled at the class level not per instance.
     * @protected
     */
    keyMapTarget: 'el',

    applyKeyMap: function (keyMap, existingKeyMap) {
        var me = this,
            defaultScope, entry, key, mapping;

        if (keyMap) {
            if (existingKeyMap && me.isConfiguring) {
                // As a cached config, we can be created with an existing value, but
                // we do not want to modify that shared instance, so make a copy.
                existingKeyMap = Ext.apply({}, existingKeyMap);
            }

            defaultScope = keyMap.scope || 'controller';

            for (key in keyMap) {
                if (key === 'scope') {
                    continue;
                }

                if (!(mapping = keyMap[key])) {
                    //<debug>
                    if (mapping === undefined) {
                        Ext.raise('keyMap entry "' + key + '" is undefined');
                    }
                    //</debug>

                    // if we have no mapping (eg, "ESC: null") and no mappings to
                    // overwrite, we can skip over it.
                    if (!existingKeyMap) {
                        continue;
                    }
                } else {
                    if (typeof mapping === 'string' || typeof mapping === 'function') {
                        // Direct calls to setKeyMap() can get here because instance and
                        // class configs go through merge
                        mapping = {
                            handler: mapping,
                            scope: defaultScope
                        };
                    } else if (mapping) {
                        mapping = Ext.apply({
                            handler: mapping.fn, // mapping.handler will override
                            scope: defaultScope  // mapping.scope will override
                            // all other properties of mapping are kept
                        }, mapping);
                    }

                    existingKeyMap = existingKeyMap || {}; // we'll need a keyMap
                }

                if (Keyboard.parseEntry(key, entry = mapping || {})) {
                    // So we end up with an object like this:
                    //
                    //  "ALT+PRINT_SCREEN": {
                    //      handler: 'doSummat',
                    //      scope: 'controller',
                    //      altKey: true
                    //  }
                    //
                    existingKeyMap[entry.name] = mapping;
                }
                //<debug>
                else {
                    Ext.raise('Invalid keyMap key specification "' + key + '"');
                }
                //</debug>
            }
        } else {
            existingKeyMap = null; // nulling out the whole keyMap
        }

        if (me._keyMapReady) {
            me.setKeyMapListener(existingKeyMap && me.getKeyMapEnabled());
        }

        return existingKeyMap || null;
    },

    /**
     * This method should be called when the instance is ready to start listening for
     * keyboard events. This is called automatically for `Ext.Component` and derived
     * classes. In Classic Toolkit, this is done after the component is rendered.
     * @protected
     */
    initKeyMap: function () {
        var me = this,
            enabled = me.getKeyMapEnabled();

        me._keyMapReady = true;

        if (enabled === null) {
            me.setKeyMapEnabled(true);
        } else {
            me.setKeyMapListener(enabled && me.getKeyMap());
        }
    },

    updateKeyMapEnabled: function (enabled) {
        this.setKeyMapListener(enabled && this._keyMapReady && this.getKeyMap());
    },

    privates: {
        //<debug>
        _keyMapListenCount: 0,
        //</debug>
        _keyMapReady: false,

        callKeyMapEntry: function (entry, e) {
            return entry && Ext.callback(entry.handler, entry.scope, [e, this], 0, this);
        },

        findKeyMapEntry: function (e) {
            var me = this,
                keyMap = me.getKeyMap(),
                key, entry;

            if (keyMap) {
                for (key in keyMap) {
                    // If the key code and the modifier flags match, call the handler
                    // Cast the mapping's flag because they will be undefined if not
                    // true. Case metaKey because it's undefined on some platforms.
                    if (Keyboard.matchEntry(key, entry = keyMap[key], e)) {
                        return entry;
                    }
                }
            }

            return null;
        },

        onKeyMapEvent: function (e) {
            var me = this,
                entry = me.getKeyMapEnabled() ? me.findKeyMapEntry(e) : null;

            return me.callKeyMapEntry(entry, e);
        },

        setKeyMapListener: function (enabled) {
            var me = this,
                listener = me._keyMapListener,
                eventSource;

            //<debug>
            ++me._keyMapListenCount;
            //</debug>

            if (listener) {
                // We always destroy the old listener since the eventSource could be
                // different now...
                listener.destroy();
                listener = null;
            }

            if (enabled) {
                eventSource = me[me.keyMapTarget];
                if (typeof eventSource === 'function') {
                    eventSource = eventSource.call(me); // eg, 'getFocusEl'
                }

                listener = eventSource.on({
                    destroyable: true,
                    scope: me,
                    keydown: 'onKeyMapEvent',
                    keypress: 'onKeyMapEvent'
                });
            }

            me._keyMapListener = listener || null;
        },
        
        statics: {
            _charCodeRe: /^#([\d]+)$/,
            _hyphenRe: /^[a-z]+\-/i,  // eg "Ctrl-" (instead of "Ctrl+")
    
            _keyMapEvents: {
                charCode: 'keypress',
                keyCode: 'keydown'
            },

            matchEntry: function (key, entry, e) {
                var ev = e.browserEvent,
                    code;
    
                if (e.type !== entry.event) {
                    return false;
                }
    
                if (!(code = entry.charCode)) {
                    if (entry.keyCode !== e.keyCode || !entry.shiftKey !== !ev.shiftKey) {
                        // when using keyCode, SHIFT must match too
                        return false;
                    }
                }
                else if (e.getCharCode() !== code) {
                    return false;
                }
    
                // NOTE: All modifier key properties are !-ed to ensure boolean-ness since
                // they can be undefined...
                return !entry.ctrlKey === !ev.ctrlKey &&
                       !entry.altKey  === !ev.altKey &&
                       !entry.metaKey === !ev.metaKey;
            },
    
            parseEntry: function (key, entry) {
                key = key.toUpperCase();
    
                var me = this,
                    Event = Ext.event.Event,
                    keyFlags = Event.keyFlags,
                    delim = me._hyphenRe.test(key) ? '-' : '+',
                    keySpec = (key === delim) ? [delim] : key.split(delim),
                    n = keySpec.length - 1,
                    k = keySpec[n],
                    name = k,
                    type = 'keyCode',
                    code, i, match;
    
                // Set the ctrlKey, altKey, metaKey, shiftKey flags
                for (i = 0; i < n; i++) {
                    //<debug>
                    if (!keyFlags[keySpec[i]]) {
                        return false;
                    }
                    //</debug>
    
                    entry[keyFlags[keySpec[i]]] = true;
                }
    
                // Produce the canonical name of the key:
                if (n) { // if (we have modifiers)
                    name = entry.ctrlKey ? 'CTRL+' : '';
                    name += entry.altKey ? 'ALT+' : '';
                    name += entry.metaKey ? 'META+' : '';
                    name += entry.shiftKey ? 'SHIFT+' : '';
                    name += k;
                }
                entry.name = name;
    
                // Set the keyCode from the 'PRINT_SCREEN' key name.
                if (isNaN(code = Event[k])) {
                    // Support charCode from a single letter or '#65' format.
                    if (!(match = me._charCodeRe.exec(k))) {
                        if (k.length === 1) {
                            code = k.charCodeAt(0);
                        }
                    } else {
                        code = +match[1]; // #42
                    }
    
                    if (code) {
                        type = 'charCode';
                    } else {
                        // Last chance! Is it just a number (a keyCode) like "27: 'onEscape'"?
                        code = +k;
                    }
                }
    
                entry.event = entry.event || me._keyMapEvents[type];
                return !isNaN(code) && (entry[type] = code);
            }
        } // statics
    } // privates
}});
