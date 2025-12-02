/**
 * The text field is the basis for most of the input fields. It provides a baseline of shared
 * functionality such as input validation, standard events, state management and look and feel. Typically we create
 * text fields inside a form, like this:
 *
 *     @example
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 title: 'Enter your name',
 *                 items: [
 *                     {
 *                         xtype: 'textfield',
 *                         label: 'First Name',
 *                         name: 'firstName'
 *                     },
 *                     {
 *                         xtype: 'textfield',
 *                         label: 'Last Name',
 *                         name: 'lastName'
 *                     }
 *                 ]
 *             }
 *         ]
 *     });
 *
 * This creates two text fields inside a form. Text Fields can also be created outside of a Form, like this:
 *
 *     Ext.create('Ext.field.Text', {
 *         label: 'Your Name',
 *         value: 'Ed Spencer'
 *     });
 *
 * ## Configuring
 *
 * Text field offers several configuration options, including {@link #placeHolder}, {@link #maxLength},
 * {@link #autoComplete}, {@link #autoCapitalize} and {@link #autoCorrect}. For example, here is how we would configure
 * a text field to have a maximum length of 10 characters, with placeholder text that disappears when the field is
 * focused:
 *
 *     Ext.create('Ext.field.Text', {
 *         label: 'Username',
 *         maxLength: 10,
 *         placeHolder: 'Enter your username'
 *     });
 *
 * The autoComplete, autoCapitalize and autoCorrect configs simply set those attributes on the text field and allow the
 * native browser to provide those capabilities. For example, to enable auto complete and auto correct, simply
 * configure your text field like this:
 *
 *     Ext.create('Ext.field.Text', {
 *         label: 'Username',
 *         autoComplete: true,
 *         autoCorrect: true
 *     });
 *
 * These configurations will be picked up by the native browser, which will enable the options at the OS level.
 *
 * Text field inherits from {@link Ext.field.Field}, which is the base class for all fields and provides
 * a lot of shared functionality for all fields, including setting values, clearing and basic validation. See the
 * {@link Ext.field.Field} documentation to see how to leverage its capabilities.
 */
Ext.define('Ext.field.Text', {
    extend: 'Ext.field.Field',
    xtype: 'textfield',
    alternateClassName: 'Ext.form.Text',

    requires: [
        'Ext.field.trigger.Clear'
    ],

    /**
     * @event focus
     * Fires when this field receives input focus
     * @param {Ext.field.Text} this This field
     * @param {Ext.event.Event} e
     */

    /**
     * @event blur
     * Fires when this field loses input focus
     * @param {Ext.field.Text} this This field
     * @param {Ext.event.Event} e
     */

    /**
     * @event paste
     * Fires when this field is pasted.
     * @param {Ext.field.Text} this This field
     * @param {Ext.event.Event} e
     */

    /**
     * @event mousedown
     * Fires when this field receives a mousedown
     * @param {Ext.field.Text} this This field
     * @param {Ext.event.Event} e
     */

    /**
     * @event keyup
     * @preventable
     * Fires when a key is released on the input element
     * @param {Ext.field.Text} this This field
     * @param {Ext.event.Event} e
     */

    /**
     * @event clearicontap
     * @preventable
     * Fires when the clear icon is tapped
     * @param {Ext.field.Text} this This field
     * @param {Ext.field.Input} input The field's input component.
     * @param {Ext.event.Event} e
     */

    /**
     * @event change
     * Fires when the value has changed.
     * @param {Ext.field.Text} this This field
     * @param {String} newValue The new value
     * @param {String} oldValue The original value
     */

    /**
     * @event action
     * @preventable
     * Fires whenever the return key or go is pressed. FormPanel listeners
     * for this event, and submits itself whenever it fires. Also note
     * that this event bubbles up to parent containers.
     * @param {Ext.field.Text} this This field
     * @param {Mixed} e The key event object
     */

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        clearIcon: true,

        /**
         * @cfg {'top'/'left'/'bottom'/'right'/'placeholder'} labelAlign
         * When value is `'placeholder'`, the label text will be rendered as placeholder
         * text inside the empty input and will animated to "top" alignment when the input
         * is focused or contains text.
         * @inheritdoc
         * @accessor
         */

        /**
         * @cfg {String} placeHolder A string value displayed in the input (if supported) when the control is empty.
         * @accessor
         */
        placeHolder: null,

        /**
         * @cfg {Number} maxLength The maximum number of permitted input characters.
         * @accessor
         */
        maxLength: null,

        /**
         * True to set the field's DOM element autocomplete attribute to "on", false to set to "off".
         * @cfg {Boolean} autoComplete
         * @accessor
         */
        autoComplete: null,

        /**
         * True to set the field's DOM element autocapitalize attribute to "on", false to set to "off".
         * @cfg {Boolean} autoCapitalize
         * @accessor
         */
        autoCapitalize: null,

        /**
         * True to set the field DOM element autocorrect attribute to "on", false to set to "off".
         * @cfg {Boolean} autoCorrect
         * @accessor
         */
        autoCorrect: null,

        /**
         * True to set the field DOM element readonly attribute to true.
         * @cfg {Boolean} readOnly
         * @accessor
         */
        readOnly: null,

        /**
         * @cfg {Object} component The inner component for this field, which defaults to an input text.
         * @accessor
         */
        component: {
            xtype: 'textinput'
        },

        // @cmd-auto-dependency {aliasPrefix: "trigger.", isKeyedObject: true}
        /**
         * @cfg {Object} triggers
         * {@link Ext.field.trigger.Trigger Triggers} to use in this field.  The keys in
         * this object are unique identifiers for the triggers. The values in this object
         * are {@link Ext.field.trigger.Trigger Trigger} configuration objects.
         *
         *     Ext.create('Ext.field.Text', {
         *         label: 'My Custom Field',
         *         triggers: {
         *             foo: {
         *                 cls: 'my-foo-trigger',
         *                 handler: function() {
         *                     console.log('foo trigger clicked');
         *                 }
         *             },
         *             bar: {
         *                 cls: 'my-bar-trigger',
         *                 handler: function() {
         *                     console.log('bar trigger clicked');
         *                 }
         *             }
         *         }
         *     });
         *
         * The weight value may be a negative value in order to position custom triggers
         * ahead of default triggers like that of a DatePicker field.
         *
         *     Ext.create('Ext.form.DatePicker', {
         *         label: 'Pick a Date',
         *         triggers: {
         *             foo: {
         *                 cls: 'my-foo-trigger',
         *                 weight: -2, // negative to place before default triggers
         *                 handler: function() {
         *                     console.log('foo trigger clicked');
         *                 }
         *             },
         *             bar: {
         *                 cls: 'my-bar-trigger',
         *                 weight: -1,
         *                 handler: function() {
         *                     console.log('bar trigger clicked');
         *                 }
         *             }
         *         }
         *     });
         */
        triggers: {
            clear: {
                type: 'clear'
            }
        },

        bubbleEvents: ['action'],

        bodyAlign: 'stretch',

        /**
          * @cfg {'left'/'center'/'right'} [textAlign='left'].
          * The text alignment of this field.
          */
        textAlign: null
    },

    defaultBindProperty: 'value',
    twoWayBindable: {
        value: 1
    },
    
    publishes: {
        value: 1
    },

    classCls: Ext.baseCSSPrefix + 'textfield',
    focusedCls: Ext.baseCSSPrefix + 'focused',
    emptyCls: Ext.baseCSSPrefix + 'empty',

    /**
     * @private
     */
    initialize: function() {
        var me = this;

        me.callParent();

        me.getComponent().on({
            keyup: 'onKeyUp',
            input: 'onInput',
            focus: 'onFocus',
            blur: 'onBlur',
            paste: 'onPaste',
            mousedown: 'onMouseDown',
            scope: this
        });

        // set the originalValue of the textfield, if one exists
        me.originalValue = me.getValue() || "";
        me.getComponent().originalValue = me.originalValue;

        me.syncEmptyCls();
    },

    applyValue: function(value) {
        return Ext.isEmpty(value) ? '' : value;
    },

    /**
     * @private
     */
    updateValue: function(value, oldValue) {
        var me = this,
            component  = me.getComponent(),
            // allows value to be zero but not undefined or null (other falsey values)
            valueValid = value !== undefined && value !== null && value !== '';

        if (component) {
            component.setValue(value);
        }

        me.toggleClearTrigger(valueValid && me.isDirty());

        me.syncEmptyCls();

        if (me.initialized) {
            me.fireEvent('change', me, value, oldValue);
        }
    },

    updateLabel: function (newLabel, oldLabel) {
        this.callParent(arguments);

        if (this.getLabelAlign() === 'placeholder') {
            this.setPlaceHolder(newLabel);
        }
    },

    updateLabelAlign: function(labelAlign, oldLabelAlign) {

        this.callParent([labelAlign, oldLabelAlign]);
    },

    updateTextAlign: function(newAlign, oldAlign) {
        var element = this.element;
 
        if (oldAlign) {
            element.removeCls(Ext.baseCSSPrefix + 'text-align-' + oldAlign);
        }
 
        if (newAlign) {
            element.addCls(Ext.baseCSSPrefix + 'text-align-' + newAlign);
        }
    },

    /**
     * @private
     */
    updatePlaceHolder: function(newPlaceHolder) {
        var me = this,
            label = me.getLabel();

        //<debug>
        if ((me.getLabelAlign() === 'placeholder') && newPlaceHolder !== label) {
            Ext.log.warn('PlaceHolder should not be set when using "labelAlign: \'placeholder\'"');
        }
        //</debug>

        me.getComponent().setPlaceHolder(newPlaceHolder);
    },

    /**
     * @private
     */
    updateMaxLength: function(newMaxLength) {
        this.getComponent().setMaxLength(newMaxLength);
    },

    /**
     * @private
     */
    updateAutoComplete: function(newAutoComplete) {
        this.getComponent().setAutoComplete(newAutoComplete);
    },

    /**
     * @private
     */
    updateAutoCapitalize: function(newAutoCapitalize) {
        this.getComponent().setAutoCapitalize(newAutoCapitalize);
    },

    /**
     * @private
     */
    updateAutoCorrect: function(newAutoCorrect) {
        this.getComponent().setAutoCorrect(newAutoCorrect);
    },

    /**
     * @private
     */
    updateReadOnly: function(newReadOnly) {
        this.toggleClearTrigger(!newReadOnly);
        this.getComponent().setReadOnly(newReadOnly);
    },

    /**
     * @private
     */
    updateInputType: function(newInputType) {
        var component = this.getComponent();
        if (component) {
            component.setType(newInputType);
        }
    },

    /**
     * @private
     */
    updateName: function(newName) {
        var component = this.getComponent();
        if (component) {
            component.setName(newName);
        }
    },

    /**
     * @private
     */
    updateTabIndex: function(newTabIndex) {
        var component = this.getComponent();
        if (component) {
            component.setTabIndex(newTabIndex);
        }
    },

    /**
     * Updates the {@link #inputCls} configuration on this fields {@link #component}
     * @private
     */
    updateInputCls: function(newInputCls, oldInputCls) {
        var component = this.getComponent();
        if (component) {
            component.replaceCls(oldInputCls, newInputCls);
        }
    },

    updateDisabled: function(disabled, oldDisabled) {
        this.callParent([disabled, oldDisabled]);
        this.toggleClearTrigger(!disabled);
    },

    applyTriggers: function(triggers) {
        var me = this,
            instances = {},
            // String lookup is necessary to prevent cmd from requiring the Trigger class
            Trigger = Ext.field.trigger['Trigger'],
            clearable = me.getClearIcon(),
            name, trigger;

        for (name in triggers) {
            if (!clearable && (name === 'clear')) {
                continue;
            }

            trigger = triggers[name];

            if (trigger === true) {
                trigger = {
                    type: name
                };
            } else if (typeof trigger === 'string') {
                trigger = {
                    type: trigger
                };
            }

            trigger = Ext.apply({
                field: me
            }, trigger);

            trigger = trigger.xtype ? Ext.create(trigger) : Trigger.create(trigger);

            instances[name] = trigger;
        }

        return instances;
    },

    updateTriggers: function(triggers, oldTriggers) {
        var name;

        for (name in oldTriggers) {
            oldTriggers[name].destroy();
        }

        this.syncTriggers();
    },

    /**
     * @private
     */
    showClearTrigger: function() {
        var me = this,
            value = me.getValue(),
            // allows value to be zero but not undefined or null (other falsey values)
            valueValid = value !== undefined && value !== null && value !== "",
            triggers, clearTrigger;

        if (me.getClearIcon() && !me.getDisabled() && !me.getReadOnly() && valueValid) {
            triggers = me.getTriggers();
            clearTrigger = triggers && triggers.clear;

            if (clearTrigger) {
                clearTrigger.show();
            }
        }

        return me;
    },

    /**
     * @private
     */
    hideClearTrigger: function() {
        var triggers = this.getTriggers(),
            clearTrigger = triggers && triggers.clear;

        if (clearTrigger) {
            clearTrigger.hide();
        }
    },

    onKeyUp: function(e) {
        this.fireAction('keyup', [this, e], 'doKeyUp');
    },

    /**
     * Called when a key has been pressed in the `<input>`
     * @private
     */
    doKeyUp: function(me, e) {
        // getValue to ensure that we are in sync with the dom
        var value      = me.getValue(),
            // allows value to be zero but not undefined or null (other falsey values)
            valueValid = value !== undefined && value !== null && value !== '';

        me.toggleClearTrigger(valueValid);

        if (e.browserEvent.keyCode === 13) {
            me.fireAction('action', [me, e], 'doAction');
        }
    },

    doAction: function() {
        this.blur();
    },

    onClearIconTap: function(input, e) {
        this.fireAction('clearicontap', [this, input, e], 'doClearIconTap');

        //focus the field after cleartap happens, but only on android.
        //this is to stop the keyboard from hiding. TOUCH-2064
        if (Ext.os.is.Android) {
            this.getComponent().focus();
        }
    },

    /**
     * @private
     */
    doClearIconTap: function(me, e) {
        me.setValue('');
    },

    onInput: function(component, value) {
        this.setValue(value);
    },

    onFocus: function(e) {
        var me = this;

        me.addCls(me.focusedCls);
        me.isFocused = true;

        if (me.getLabelAlign() === 'placeholder' && !me.getValue()) {
            me.animatePlaceholderToLabel();
        }

        me.fireEvent('focus', me, e);
    },

    onBlur: function(e) {
        var me = this;

        me.removeCls(me.focusedCls);
        me.isFocused = false;

        if (me.getLabelAlign() === 'placeholder' && !me.getValue()) {
            me.animateLabelToPlaceholder();
        }

        me.fireEvent('blur', me, e);

        Ext.defer(function() {
            me.isFocused = false;
        }, 50);
    },

    onPaste: function(e) {
        this.fireEvent('paste', this, e);
    },

    onMouseDown: function(e) {
        this.fireEvent('mousedown', this, e);
    },

    /**
     * Attempts to set the field as the active input focus.
     * @return {Ext.field.Text} This field
     */
    focus: function() {
        this.getComponent().focus();
        return this;
    },

    /**
     * Attempts to forcefully blur input focus for the field.
     * @return {Ext.field.Text} This field
     */
    blur: function() {
        this.getComponent().blur();
        return this;
    },

    /**
     * Attempts to forcefully select all the contents of the input field.
     * @return {Ext.field.Text} this
     */
    select: function() {
        this.getComponent().select();
        return this;
    },

    resetOriginalValue: function() {
        var me = this,
            component;

        me.callParent();
        component = me.getComponent();
        if(component && component.hasOwnProperty("originalValue")) {
            me.getComponent().originalValue = me.originalValue;
        }
        me.reset();
    },

    reset: function() {
        var me = this;
        me.getComponent().reset();

        //we need to call this to sync the input with this field
        this.callParent();

        me.toggleClearTrigger(me.isDirty());
    },

    isDirty: function() {
        var component = this.getComponent();
        if (component) {
            return component.isDirty();
        }
        return false;
    },

    doDestroy: function() {
        this.setTriggers(null);
        this.triggerGroups = null;
        this.callParent();
    },

    privates: {
        animateLabelToPlaceholder: function() {
            var me = this,
                animInfo = me.getPlaceholderAnimInfo();

            me.labelElement.animate({
                from: {
                    left: 0,
                    top: 0,
                    opacity: 1
                },
                to: animInfo,
                preserveEndState: true,
                duration: 250,
                easing: 'ease-out',
                callback: function() {
                    me.setPlaceHolder(me.getLabel());
                }
            });

            me.lastPlaceholderAnimInfo = animInfo;
        },

        animatePlaceholderToLabel: function() {
            var me = this;

            me.labelElement.animate({
                from: me.lastPlaceholderAnimInfo || me.getPlaceholderAnimInfo(),
                to: {
                    left: 0,
                    top: 0,
                    opacity: 1
                },
                easing: 'ease-out',
                preserveEndState: true,
                duration: 250
            });

            me.setPlaceHolder(null);

            me.lastPlaceholderAnimInfo = null;
        },

        getPlaceholderAnimInfo: function() {
            var me = this,
                element = me.element,
                labelElement = me.labelElement,
                inputElement = me.getComponent().inputElement,
                labelOffsets = labelElement.getOffsetsTo(element),
                inputOffsets = inputElement.getOffsetsTo(element),
                labelPadding = labelElement.getPadding('l'),
                inputPadding = inputElement.getPadding('l'),
                translateX = inputOffsets[0] - labelOffsets[0] + (inputPadding - labelPadding),
                translateY = inputOffsets[1] - labelOffsets[1];

            return {
                left: translateX,
                top: translateY,
                opacity: 0
            };
        },

        syncEmptyCls: function() {
            this.toggleCls(this.emptyCls, !this.getValue());
        },

        /**
         * Synchronizes the DOM to match the triggers' configured weight, side, and grouping
         * @private
         */
        syncTriggers: function() {
            var me = this,
                triggers = me.getTriggers(),
                input = me.getComponent(),
                triggerGroups = me.triggerGroups || (me.triggerGroups = {}),
                beforeTriggers = [],
                afterTriggers = [],
                triggersByGroup = {},
                Trigger = Ext.field.trigger['Trigger'],
                name, trigger, groupName, triggerGroup, i, ln;

            for (name in triggers) {
                trigger = triggers[name];

                groupName = trigger.getGroup();

                if (groupName) {
                    (triggersByGroup[groupName] || (triggersByGroup[groupName] = [])).push(trigger);
                } else if (trigger.getSide() === 'left') {
                    beforeTriggers.push(trigger);
                } else {
                    afterTriggers.push(trigger);
                }
            }

            for (groupName in triggersByGroup) {
                triggerGroup = triggerGroups[groupName];

                if (!triggerGroup) {
                    triggerGroup = triggers[groupName]; // just in case the user configured a group trigger

                    if (!triggerGroup) {
                        triggerGroup = new Trigger();
                    }

                    triggerGroups[groupName] = triggerGroup;
                }

                triggerGroup.setTriggers(Trigger.sort(triggersByGroup[groupName]));

                if (triggerGroup.getSide() === 'left') {
                    beforeTriggers.push(triggerGroup);
                } else {
                    afterTriggers.push(triggerGroup);
                }
            }

            for (i = 0, ln = beforeTriggers.length; i < ln; i++) {
                input.beforeElement.appendChild(beforeTriggers[i].element);
            }

            for (i = 0, ln = afterTriggers.length; i < ln; i++) {
                input.afterElement.appendChild(afterTriggers[i].element);
            }

            for (groupName in triggerGroups) {
                if (!(groupName in triggersByGroup)) {
                    // group no longer has any triggers. it can be removed.
                    triggerGroup = triggerGroups[groupName];
                    triggerGroup.setTriggers(null);
                    triggerGroup.destroy();
                    delete triggerGroups[groupName];
                }
            }
        },

        toggleClearTrigger: function(state) {
            if (state) {
                this.showClearTrigger();
            } else {
                this.hideClearTrigger();
            }
        }
    }
});

