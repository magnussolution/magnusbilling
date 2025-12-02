/**
 * The checkbox field is an enhanced version of the native browser checkbox and is great for enabling your user to
 * choose one or more items from a set (for example choosing toppings for a pizza order). It works like any other
 * {@link Ext.field.Field field} and is usually found in the context of a form:
 *
 * ## Example
 *
 *     @example miniphone preview
 *     var form = Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'checkboxfield',
 *                 name : 'tomato',
 *                 label: 'Tomato',
 *                 value: 'tomato',
 *                 checked: true
 *             },
 *             {
 *                 xtype: 'checkboxfield',
 *                 name : 'salami',
 *                 label: 'Salami'
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 docked: 'bottom',
 *                 items: [
 *                     { xtype: 'spacer' },
 *                     {
 *                         text: 'getValues',
 *                         handler: function() {
 *                             var form = Ext.ComponentQuery.query('formpanel')[0],
 *                                 values = form.getValues();
 *
 *                             Ext.Msg.alert(null,
 *                                 "Tomato: " + ((values.tomato) ? "yes" : "no") +
 *                                 "<br />Salami: " + ((values.salami) ? "yes" : "no")
 *                             );
 *                         }
 *                     },
 *                     { xtype: 'spacer' }
 *                 ]
 *             }
 *         ]
 *     });
 *
 *
 * The form above contains two check boxes - one for Tomato, one for Salami. We configured the Tomato checkbox to be
 * checked immediately on load, and the Salami checkbox to be unchecked. We also specified an optional text
 * {@link #value} that will be sent when we submit the form. We can get this value using the Form's
 * {@link Ext.form.Panel#getValues getValues} function, or have it sent as part of the data that is sent when the
 * form is submitted:
 *
 *     form.getValues(); //contains a key called 'tomato' if the Tomato field is still checked
 *     form.submit(); //will send 'tomato' in the form submission data
 *
 */
Ext.define('Ext.field.Checkbox', {
    extend: 'Ext.field.Field',
    alternateClassName: 'Ext.form.Checkbox',

    xtype: 'checkboxfield',
    qsaLeftRe: /[\[]/g,
    qsaRightRe: /[\]]/g,

    isCheckbox: true,

    defaultBindProperty: 'checked',

    twoWayBindable: {
        checked: 1
    },

    publishes: {
        checked: 1
    },

    /**
     * @event change
     * Fires when the field value changes.
     * @param {Ext.field.Checkbox} this This field.
     * @param {Boolean} newValue The new value.
     * @param {Boolean} oldValue The original value.
     */

    /**
     * @event check
     * Fires when the checkbox is checked.
     * @param {Ext.field.Checkbox} this This checkbox.
     */

    /**
     * @event uncheck
     * Fires when the checkbox is unchecked.
     * @param {Ext.field.Checkbox} this This checkbox.
     */

    config: {
        /**
         * @cfg {String} value The string value to submit if the item is in a checked state.
         * @accessor
         */
        value: '',

        /**
         * @cfg {Boolean} checked `true` if the checkbox should render initially checked.
         * @accessor
         */
        checked: false,

        /**
         * @cfg {Number} tabIndex
         * @hide
         */
        tabIndex: -1,

        /**
         * @cfg
         * @inheritdoc
         */
        component: {
            xtype: 'checkboxinput'
        }

        /**
         * @cfg {Boolean} labelMaskTap
         * @private
         */
    },

    classCls: Ext.baseCSSPrefix + 'checkboxfield',
    checkedCls: Ext.baseCSSPrefix + 'checked',

    /**
     * @private
     */
    initialize: function() {
        var me = this,
            component = me.getComponent();

        me.callParent();

        component.on({
            scope: me,
            order: 'before',
            masktap: 'onMaskTap'
        });

        component.doMaskTap = Ext.emptyFn;

        me.labelElement.on({
            scope: me,
            tap: 'onMaskTap'
        });

        // Important to publish the value here, since we
        // may be relying on checked. This differs from other
        // fields because the initial value may not come from
        // the viewModel if it defaults to false.
        me.publishState('checked', me.getChecked());
    },

    /**
     * @private
     */
    doInitValue: function() {
        var me = this,
            initialConfig = me.getInitialConfig();

        // you can have a value or checked config, but checked get priority
        if (initialConfig.hasOwnProperty('value')) {
            me.originalState = initialConfig.value;
        }

        if (initialConfig.hasOwnProperty('checked')) {
            me.originalState = initialConfig.checked;
        }

        me.callParent(arguments);
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
     * Returns the submit value for the checkbox which can be used when submitting forms.
     * @return {Boolean/String} value The value of {@link #value} or `true`, if {@link #checked}.
     */
    getSubmitValue: function() {
        return (this.getChecked()) ? Ext.isEmpty(this._value) ? true : this._value : null;
    },

    updateChecked: function(checked, oldChecked) {
        var me = this,
            eventName;

        me.getComponent().setChecked(checked);

        me.toggleCls(me.checkedCls, checked);

        // only call onChange (which fires events) if the component has been initialized
        if (me.initialized) {
            eventName = checked ? 'check' : 'uncheck';
            me.fireEvent(eventName, me);
            me.fireEvent('change', me, checked, oldChecked);
        }
    },

    /**
     * @private
     */
    onMaskTap: function(component, e) {
        var me = this,
            dom = me.getComponent().inputElement.dom;

        if (me.getDisabled()) {
            return false;
        }

        //we must manually update the input dom with the new checked value
        dom.checked = !dom.checked;

        me.setChecked(dom.checked);

        //return false so the mask does not disappear
        return false;
    },

    /**
     * Returns the checked state of the checkbox.
     * @return {Boolean} `true` if checked, `false` otherwise.
     */
    isChecked: function() {
        return this.getChecked();
    },

    /**
     * Set the checked state of the checkbox to `true`.
     * @return {Ext.field.Checkbox} This checkbox.
     */
    check: function() {
        return this.setChecked(true);
    },

    /**
     * Set the checked state of the checkbox to `false`.
     * @return {Ext.field.Checkbox} This checkbox.
     */
    uncheck: function() {
        return this.setChecked(false);
    },

    getSameGroupFields: function() {
        var me = this,
            component = me.up('formpanel') || me.up('fieldset'),
            name = me.getName(),
            replaceLeft = me.qsaLeftRe,
            replaceRight = me.qsaRightRe;

        if (!component) {
            // <debug>
            Ext.Logger.warn('Ext.field.Radio components must always be descendants of an Ext.form.Panel or Ext.form.FieldSet.');
            // </debug>
            component = Ext.Viewport;
        }

        // This is to handle ComponentQuery's lack of handling [name=foo[bar]] properly
        name = name.replace(replaceLeft, '\\[');
        name = name.replace(replaceRight, '\\]');
        return component.query('checkboxfield[name=' + name + ']');
    },

    /**
     * Returns an array of values from the checkboxes in the group that are checked.
     * @return {Array}
     */
    getGroupValues: function() {
        var values = [];

        this.getSameGroupFields().forEach(function(field) {
            if (field.getChecked()) {
                values.push(field.getValue());
            }
        });

        return values;
    },

    /**
     * Set the status of all matched checkboxes in the same group to checked.
     * @param {Array} values An array of values.
     * @return {Ext.field.Checkbox} This checkbox.
     */
    setGroupValues: function(values) {
        this.getSameGroupFields().forEach(function(field) {
            field.setChecked((values.indexOf(field.getValue()) !== -1));
        });

        return this;
    },

    /**
     * Resets the status of all matched checkboxes in the same group to checked.
     * @return {Ext.field.Checkbox} This checkbox.
     */
    resetGroupValues: function() {
        this.getSameGroupFields().forEach(function(field) {
            field.setChecked(field.originalState);
        });

        return this;
    },

    reset: function() {
        this.setChecked(this.originalState);
        return this;
    }
});
