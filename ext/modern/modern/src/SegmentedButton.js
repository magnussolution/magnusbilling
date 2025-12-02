/**
 * SegmentedButton is a container for a group of {@link Ext.Button}s. Generally a SegmentedButton would be
 * a child of a {@link Ext.Toolbar} and would be used to switch between different views.
 *
 * ## Example usage:
 *
 *     @example
 *     var segmentedButton = Ext.create('Ext.SegmentedButton', {
 *         allowMultiple: true,
 *         items: [
 *             {
 *                 text: 'Option 1'
 *             },
 *             {
 *                 text: 'Option 2',
 *                 pressed: true
 *             },
 *             {
 *                 text: 'Option 3'
 *             }
 *         ],
 *         listeners: {
 *             toggle: function(container, button, pressed){
 *                 alert("User toggled the '" + button.getText() + "' button: " + (pressed ? 'on' : 'off'));
 *             }
 *         }
 *     });
 *     Ext.Viewport.add({ xtype: 'container', padding: 10, items: [segmentedButton] });
 */
Ext.define('Ext.SegmentedButton', {
    extend: 'Ext.Container',
    xtype : 'segmentedbutton',

    alternateClassName: 'Ext.button.Segmented',

    requires: [
        'Ext.Button',
        'Ext.layout.FlexBox'
    ],

    isSegmentedButton: true,

    classCls: Ext.baseCSSPrefix + 'segmentedbutton',

    config: {
        /**
         * @cfg {Boolean} allowMultiple
         * Allow multiple pressed buttons.
         * @accessor
         */
        allowMultiple: false,

        /**
         * @cfg {Boolean} allowDepress
         * Allow toggling the pressed state of each button.
         * Defaults to `true` when {@link #allowMultiple} is `true`.
         * @accessor
         */
        allowDepress: false,

        /**
         * @cfg {Boolean} allowToggle Allow child buttons to be pressed when tapped on. Set to `false` to allow tapping but not toggling of the buttons.
         * @accessor
         */
        allowToggle: true,

        /**
         * @cfg {Boolean} forceSelection
         * If {@link #allowMultiple} is `true`, this config may be set to `true` to indicate that at least
         * one button in the set must remain pressed at all times.
         *
         * If no {@link #value} is configured, and no child buttons are configured `pressed`, the first child
         * button is set `pressed: true`
         *
         * @since 6.0.2
         */
        forceSelection: false,

        /**
         * @cfg {Array} pressedButtons
         * The pressed buttons for this segmented button.
         *
         * You can remove all pressed buttons by calling {@link #setPressedButtons} with an empty array.
         * @accessor
         */
        pressedButtons: null,

        /**
         * @cfg
         * @inheritdoc
         */
        defaultType: 'button',

        /**
         * @cfg {String}
         * Default {@link Ext.Component#ui ui} to use for buttons in this segmented button.
         * Buttons can override this default by specifying their own UI
         */
        defaultUI: 'segmented',

        /**
         * @cfg {String/Number/String[]/Number[]}
         * @accessor
         * The value of this button.  When {@link #allowMultiple} is `false`, value is a
         * String or Number.  When {@link #allowMultiple is `true`, value is an array
         * of values.  A value corresponds to a child button's {@link Ext.Button#value
         * value}, or its index if no child button values match the given value.
         *
         * Using the `value` config of the child buttons with single toggle:
         *
         *     @example
         *     var button = Ext.create('Ext.SegmentedButton', {
         *         renderTo: Ext.getBody(),
         *         value: 'optTwo', // begin with "Option Two" selected
         *         items: [{
         *             text: 'Option One',
         *             value: 'optOne'
         *         }, {
         *             text: 'Option Two',
         *             value: 'optTwo'
         *         }, {
         *             text: 'Option Three',
         *             value:  'optThree'
         *         }]
         *     });
         *
         *     console.log(button.getValue()); // 'optTwo'
         *
         *     // Sets the value to optOne, and sets the pressed state of the "Option One" button
         *     button.setValue('optOne');
         *
         *     console.log(button.getValue()); // 'optOne'
         *
         * Using multiple toggle, and index-based values:
         *
         *     @example
         *     var button = Ext.create('Ext.SegmentedButton', {
         *         renderTo: Ext.getBody(),
         *         allowMultiple: true
         *         value: [1, 2], // begin with "Option Two" and "Option Three" selected
         *         items: [{
         *             text: 'Option One'
         *         }, {
         *             text: 'Option Two'
         *         }, {
         *             text: 'Option Three'
         *         }]
         *     });
         *
         *     // Sets value to [0, 2], and sets pressed state of "Option One" and "Option Three"
         *     button.setValue([0, 2]);
         *
         *     console.log(button.getValue()); // [0, 2]
         *
         *     // Remove all pressed buttons, and set value to null
         *     button.setValue(null);
         *
         * Note that value based setting and index based setting cannot be mixed.
         */
        value: undefined,

        /**
         * @cfg {Boolean} vertical
         * `true` to display the buttons vertically
         */
        vertical: false
    },

    /**
     * @cfg
     * @inheritdoc
     */
    layout: {
        type : 'box',
        vertical: false,
        align: 'stretch'
    },

    defaultBindProperty: 'value',

    twoWayBindable: 'value',

    /**
     * @event toggle
     * Fires when any child button's pressed state has changed.
     * @param {Ext.SegmentedButton} this
     * @param {Ext.Button} button The toggled button.
     * @param {Boolean} isPressed Boolean to indicate if the button was pressed or not.
     */
    
    /**
     * @event change
     * Fires when the value changes.
     * @param {Ext.SegmentedButton} this
     * @param {Object/Object[]} value The new value. Will be an array with {@link #allowMultiple}, 
     * a single value if not.
     * @param {Object/Object[]} oldValue The old value. Will be an array with {@link #allowMultiple},
     * a single value if not.
     */
    
    constructor: function(config) {
        this.valueMap = {};
        this.callParent([config]);
    },

    initialize: function() {
        var me = this;

        me.callParent();

        me.onAfter({
            delegate: '> button',
            scope   : me,
            hide: 'onButtonHiddenChange',
            show: 'onButtonHiddenChange'
        });
    },

    applyPressedButtons: function(pressedButtons) {
        var buttons = pressedButtons,
            len, i, button;

        pressedButtons = [];

        if (buttons) {
            buttons = Ext.Array.from(buttons);
            for (i = 0; i < len; ++i) {
                button = this.getComponent(buttons[i]);
                if (button) {
                    pressedButtons.push(button);
                }
            }
        }
        return pressedButtons;
    },

    updatePressedButtons: function(pressedButtons) {
        this.setValue(pressedButtons);
    },

    getPressedButtons: function() {
        var items = this.getItems().items,
            len = items.length,
            ret = [],
            i, button;

        for (i = 0; i < len; ++i) {
            button = items[i];
            if (button.getPressed()) {
                ret.push(button);
            }
        }

        return ret;
    },

    applyValue: function(value, oldValue) {
        var me = this,
            firstPass = oldValue === undefined,
            allowMultiple = me.getAllowMultiple(),
            items = me.getItems(),
            len = items.getCount(),
            values = [],
            forceSelection = me.getForceSelection(),
            pressingItem = me.pressingItem,
            hasPressed, button, buttonValue, changed, id, initialState, i;

        me.settingValue = true;

        values = Ext.Array.from(value);
        oldValue = Ext.Array.from(oldValue);

        // First time getting a value, so we need to include any items
        // with a pressed: true config
        if (firstPass) {
            initialState = {};
            for (i = items.getCount() - 1; i >= 0; --i) {
                button = items.getAt(i);
                if (forceSelection && !values.length && i === 0 && !hasPressed) {
                    button.setPressed(true);
                }

                if (button.getPressed()) {
                    hasPressed = true;
                    buttonValue = button.getValue();
                    // If the value is null, we need to include the value as the index
                    if (buttonValue === null) {
                        buttonValue = items.indexOf(button);
                    }
                    if (!Ext.Array.contains(values, buttonValue)) {
                        values.unshift(buttonValue);
                    }
                }
            }
        } else {
            initialState = me.getAllPressed(items);
        }

        len = values.length;

        //<debug>
        if (len > 1 && !me.getAllowMultiple()) {
            Ext.raise('Cannot set multiple values when allowMultiple is false');
        }
        //</debug>

        // press all buttons corresponding to the values
        for (i = 0; i < len; i++) {
            value = values[i];
            button = me.lookupButtonByValue(value);

            if (button) {
                buttonValue = button.getValue();

                if (buttonValue !== null && buttonValue !== value) {
                    // button has a value, but it was matched by index.
                    // transform the index into the button value
                    values[i] = buttonValue;
                }

                if (initialState[button.id]) {
                    delete initialState[button.id];
                } else {
                    button.setPressed(true);
                    if (!firstPass) {
                        (changed || (changed = [])).push(button);
                    }
                }
            }
            //<debug>
            else {
                // no matched button. fail.
                Ext.raise("Invalid value '" + value + "' for segmented button: '" + me.id + "'");
            }
            //</debug>
        }

        // If we have anything left in the initialState, that means they were
        // pressed when we started, but not now, toggle them off.
        for (id in initialState) {
            button = initialState[id];
            button.setPressed(false);
            if (!firstPass) {
                (changed || (changed = [])).push(button);
            }
        }

        if (allowMultiple) {
            value = values = me.sortValues(values);
        } else {
            value = values.length ? values[0] : null;
            oldValue = oldValue.length ? oldValue[0] : null;
        }

        me.settingValue = false;

        if (!firstPass && changed) {
            if (me.hasListeners.toggle) {
                me.sortToggleItems(changed);
                for (i = 0, len = changed.length; i < len; ++i) {
                    button = changed[i];
                    me.fireEvent('toggle', me, button, button.getPressed());
                }
            }

            if (me.hasListeners.change) {
                changed = allowMultiple ? !Ext.Array.equals(value, oldValue) : value !== oldValue;
                if (changed) {
                    me.fireEvent('change', me, value, oldValue);
                }
            }
        }

        return value;
    },

    updateAllowMultiple: function(allowMultiple) {
        if (!this.initialized && !this.getInitialConfig().hasOwnProperty('allowDepress') && allowMultiple) {
            this.setAllowDepress(true);
        }
    },

    updateVertical: function(vertical) {
        var me = this,
            vCls = Ext.baseCSSPrefix + 'vertical',
            hCls = Ext.baseCSSPrefix + 'horizontal';

        me.replaceCls(vertical ? hCls : vCls, vertical ? vCls : hCls);
        me.getLayout().setVertical(vertical);
    },

    onItemAdd: function(item, index) {
        var me = this,
            defaultUI = me.getDefaultUI(),
            value = item.getValue();


        // Force allowDepress to be configured if needed
        me.getAllowMultiple();
        if (defaultUI && (item.getUi() == null)) {
            item.setUi(defaultUI);
        }
        if (value !== null) {
            me.valueMap[value] = item;
            me.useValueMap = true;
        }

        item.$segmentedListeners = item.on({
            scope: me,
            beforepressedchange: 'onBeforePressedChange',
            pressedchange: 'onPressedChange',
            order: 'before',
            destroyable: true
        });

        me.callParent([item, index]);
        me.updateFirstAndLastCls(me.getItems());
        item.$enableToggle = item.getEnableToggle();
        item.$allowDepress = item.getAllowDepress();
        item.setEnableToggle(me.getAllowToggle());
        item.setAllowDepress(me.getAllowDepress());
    },

    onItemRemove: function(item, index, destroying) {
        var me = this,
            value = item.getValue(),
            useValueMap = me.useValueMap,
            listeners = item.$segmentedListeners,
            current, newValue, i;

        me.callParent([item, index, destroying]);
        if (!me.destroying) {
            if (listeners) {
                listeners.destroy();
            }
            me.updateFirstAndLastCls(this.getItems());
            if (useValueMap) {
                value = button.getValue();
                delete me.valueMap[value];
            } else {
                value = index;
            }

            // If the item is currently pressed, we need to remove
            // it from the value collection
            if (item.getPressed()) {
                current = me.getValue();
                if (me.getAllowMultiple()) {
                    index = current.indexOf(value);
                    newValue = current.slice();
                    // If we're index mapping, get any value after the
                    // removing, since the index will shift down by 1. Note
                    // that the value is always kept in order of index.
                    if (!useValueMap) {
                        for (i = newValue.length - 1; i > index; --i) {
                            --newValue[i];
                        }
                    }
                    newValue.splice(index, 1);
                } else {
                    newValue = null;
                }

                me.setValue(newValue);
            }
            item.setEnableToggle(item.$enableToggle);
            item.setAllowDepress(item.$allowDepress);
        }
        item.$segmentedListeners = null;
    },

    /**
     * Returns `true` if a specified {@link Ext.Button} is pressed.
     * @param {Ext.Button} button The button to check if pressed.
     * @return {Boolean} pressed
     */
    isPressed: function(button) {
        return button.getPressed();
    },

    /**
     * @private
     */
    updateDisabled: function(disabled, oldDisabled) {
        var me = this;

        me.items.each(function(item) {
            item.setDisabled(disabled);
        }, me);

        me.callParent([disabled, oldDisabled]);
    },

    updateDefaultUI: function(defaultUI) {
        var items = this.items && this.items.items,
            len = items.length,
            i, item;

        for (i = 0; i < len; i++) {
            item = items[i];
            if (item.getUi() == null) {
                item.setUi(defaultUI);
            }
        }

    },

    doDestroy: function() {
        this.destroying = true;
        this.valueMap = null;
        this.callParent();        
    },

    privates: {
        getAllPressed: function(items) {
            items = items.items;

            var len = items.length,
                map = {},
                pressingItem = this.pressingItem,
                i, button, pressed;

            for (i = 0; i < len; ++i) {
                button = items[i];
                // If we're currently pressing the item, the state will already
                // be set, but for the purpose of setting the value we want to 
                // treat it as though it's in the old state
                if (button === pressingItem) {
                    pressed = !button.getPressed();
                } else {
                    pressed = button.getPressed();
                }

                if (pressed) {
                    map[button.id] = button;
                }
            }

            return map;
        },

        /**
         * Looks up a child button by its value
         * @private
         * @param {String/Number} value The button's value or index
         * @return {Ext.button.Button}
         */
        lookupButtonByValue: function(value) {
            var button;

            if (this.useValueMap) {
                button = this.valueMap[value];
            } else {
                button = this.getItems().getAt(value);
            }

            return button;
        },

        onBeforePressedChange: function(button, pressed) {
            // If we allow multiple selections, and we are forcing a selection, and we are unpressing
            // and we only have one value, then veto this. we are not allowing the selection length
            // to fall to zero.
            var ret;

            if (this.getForceSelection() && !pressed) {
                if (this.getAllowMultiple()) {
                    ret = this.getValue().length === 1;
                } else {
                    ret = false;
                }
            }
            return ret;
        },

        onPressedChange: function(button, pressed) {
            if (this.settingValue) {
                return;
            }

            var me = this,
                Array = Ext.Array,
                allowMultiple = me.getAllowMultiple(),
                buttonValue = me.useValueMap ? button.getValue() : me.items.indexOf(button),
                value = me.getValue(),
                valueIndex;

            if (allowMultiple) {
                valueIndex = Array.indexOf(value, buttonValue);
            }

            if (pressed) {
                if (allowMultiple) {
                    if (valueIndex === -1) {
                        // We must not mutate our value property here
                        value = Array.slice(value);
                        value.push(buttonValue);
                    }
                } else {
                    value = buttonValue;
                }
            } else {
                if (allowMultiple) {
                    if (valueIndex > -1) {
                        // We must not mutate our value property here
                        value = Array.slice(value);
                        value.splice(valueIndex, 1);
                    }
                } else if (value === buttonValue) {
                    value = null;
                }
            }

            me.pressingItem = button;
            me.setValue(value);
            me.pressingItem = null;
        },

        /**
         * @private
         */
        onButtonHiddenChange: function() {
            this.updateFirstAndLastCls(this.getItems());
        },

        sortToggleItems: function(buttons) {
            var items = this.getItems();
            Ext.Array.sort(buttons, function(a, b) {
                var p1 = a.getPressed() ? 1 : 0,
                    p2 = b.getPressed() ? 1 : 0,
                    ret = p1 - p2;

                if (ret === 0) {
                    ret = items.indexOf(a) - items.indexOf(b);
                }
                return ret;
            });
        },

        sortValues: function(values) {
            var fn = Ext.Array.numericSortFn,
                map = this.valueMap,
                items = this.getItems();

            values = Ext.Array.clone(values);

            if (this.useValueMap) {
                fn = function(a, b) {
                    a = items.indexOf(map[a]);
                    b = items.indexOf(map[b]);

                    return a - b;
                };
            }

            Ext.Array.sort(values, fn);
            return values;
        },

        /**
         * @private
         */
        updateFirstAndLastCls: function(items) {
            var ln = items.length,
                basePrefix = Ext.baseCSSPrefix,
                firstCls = basePrefix + 'first',
                lastCls = basePrefix + 'last',
                item, i;

            //remove all existing classes
            for (i = 0; i < ln; i++) {
                item = items.items[i];
                item.removeCls(firstCls);
                item.removeCls(lastCls);
            }

            //add a first cls to the first non-hidden button
            for (i = 0; i < ln; i++) {
                item = items.items[i];
                if (!item.isHidden()) {
                    item.addCls(firstCls);
                    break;
                }
            }

            //add a last cls to the last non-hidden button
            for (i = ln - 1; i >= 0; i--) {
                item = items.items[i];
                if (!item.isHidden()) {
                    item.addCls(lastCls);
                    break;
                }
            }
        }
    }
});
