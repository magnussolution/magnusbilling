/**
 * This is a specialized field which shows a {@link Ext.picker.Date} when tapped. If it has a predefined value,
 * or a value is selected in the {@link Ext.picker.Date}, it will be displayed like a normal {@link Ext.field.Text}
 * (but not selectable/changable).
 *
 *     Ext.create('Ext.field.DatePicker', {
 *         label: 'Birthday',
 *         value: new Date()
 *     });
 *
 * {@link Ext.field.DatePicker} fields are very simple to implement, and have no required configurations.
 *
 * ## Examples
 *
 * It can be very useful to set a default {@link #value} configuration on {@link Ext.field.DatePicker} fields. In
 * this example, we set the {@link #value} to be the current date. You can also use the {@link #setValue} method to
 * update the value at any time.
 *
 *     @example miniphone preview
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 items: [
 *                     {
 *                         xtype: 'datepickerfield',
 *                         label: 'Birthday',
 *                         name: 'birthday',
 *                         value: new Date()
 *                     }
 *                 ]
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 docked: 'bottom',
 *                 items: [
 *                     { xtype: 'spacer' },
 *                     {
 *                         text: 'setValue',
 *                         handler: function() {
 *                             var datePickerField = Ext.ComponentQuery.query('datepickerfield')[0];
 *
 *                             var randomNumber = function(from, to) {
 *                                 return Math.floor(Math.random() * (to - from + 1) + from);
 *                             };
 *
 *                             datePickerField.setValue({
 *                                 month: randomNumber(0, 11),
 *                                 day  : randomNumber(0, 28),
 *                                 year : randomNumber(1980, 2011)
 *                             });
 *                         }
 *                     },
 *                     { xtype: 'spacer' }
 *                 ]
 *             }
 *         ]
 *     });
 *
 * When you need to retrieve the date from the {@link Ext.field.DatePicker}, you can either use the {@link #getValue} or
 * {@link #getFormattedValue} methods:
 *
 *     @example preview
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 items: [
 *                     {
 *                         xtype: 'datepickerfield',
 *                         label: 'Birthday',
 *                         name: 'birthday',
 *                         value: new Date()
 *                     }
 *                 ]
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 docked: 'bottom',
 *                 items: [
 *                     {
 *                         text: 'getValue',
 *                         handler: function() {
 *                             var datePickerField = Ext.ComponentQuery.query('datepickerfield')[0];
 *                             Ext.Msg.alert(null, datePickerField.getValue());
 *                         }
 *                     },
 *                     { xtype: 'spacer' },
 *                     {
 *                         text: 'getFormattedValue',
 *                         handler: function() {
 *                             var datePickerField = Ext.ComponentQuery.query('datepickerfield')[0];
 *                             Ext.Msg.alert(null, datePickerField.getFormattedValue());
 *                         }
 *                     }
 *                 ]
 *             }
 *         ]
 *     });
 *
 *
 */
Ext.define('Ext.field.DatePicker', {
    extend: 'Ext.field.Picker',
    alternateClassName: 'Ext.form.DatePicker',
    xtype: 'datepickerfield',

    requires: [
        'Ext.field.trigger.Date',
        'Ext.picker.Date'
    ],

    /**
     * @event change
     * Fires when a date is selected
     * @param {Ext.field.DatePicker} this
     * @param {Date} newDate The new date
     * @param {Date} oldDate The old date
     */

    config: {
        /**
         * @cfg {Object/Ext.picker.Date} picker
         * An object that is used when creating the internal {@link Ext.picker.Date} component or a direct instance of {@link Ext.picker.Date}.
         * @accessor
         */
        picker: true,

        /**
         * @cfg {Object/Date} value
         * Default value for the field and the internal {@link Ext.picker.Date} component. Accepts an object of 'year',
         * 'month' and 'day' values, all of which should be numbers, or a {@link Date}.
         *
         * Example: {year: 1989, day: 1, month: 5} = 1st May 1989 or new Date()
         * @accessor
         */

        /**
         * @cfg {Boolean} destroyPickerOnHide
         * Whether or not to destroy the picker widget on hide. This save memory if it's not used frequently,
         * but increase delay time on the next show due to re-instantiation.
         * @accessor
         */
        destroyPickerOnHide: false,

        /**
         * @cfg {String} [dateFormat=Ext.util.Format.defaultDateFormat] The format to be used when displaying the date in this field.
         * Accepts any valid date format. You can view formats over in the {@link Ext.Date} documentation.
         */
        dateFormat: '',

        triggers: {
            expand: {
                type: 'date'
            }
        }
    },

    classCls: Ext.baseCSSPrefix + 'datepickerfield',

    applyValue: function(value, oldValue) {
        if (!Ext.isDate(value)) {
            if (value) {
                value = Ext.Date.parse(value, this.getDateFormat());
            } else {
                value = null;
            }
        }

        // The same date value may not be the same reference, so compare them by time.
        // If we have dates for both, then compare the time. If they're the same we
        // don't need to do anything.
        if (value && oldValue && value.getTime() === oldValue.getTime()) {
            value = undefined;
        }

        return value;
    },

    updateValue: function(value, oldValue) {
        var me     = this,
            picker = me._picker;

        if (picker && picker.isPicker) {
            picker.setValue(value);
        }

        // Ext.Date.format expects a Date
        if (value !== null) {
            me.getComponent().setValue(Ext.Date.format(value, me.getDateFormat()));
        } else {
            me.getComponent().setValue('');
        }

        me.fireEvent('change', me, value, oldValue);
    },

    applyDateFormat: function(dateFormat) {
        return dateFormat || Ext.util.Format.defaultDateFormat;
    },

    /**
     * Updates the date format in the field.
     * @private
     */
    updateDateFormat: function(newDateFormat) {
        var value = this.getValue();
        if (Ext.isDate(value)) {
            this.getComponent().setValue(Ext.Date.format(value, newDateFormat));
        }
    },

    /**
     * Returns the {@link Date} value of this field.
     * If you wanted a formatted date use the {@link #getFormattedValue} method.
     * @return {Date} The date selected
     *
     * @method getValue
     */

    /**
     * Returns the value of the field formatted using the specified format. If it is not specified, it will default to
     * {@link #dateFormat} and then {@link Ext.util.Format#defaultDateFormat}.
     * @param {String} format The format to be returned.
     * @return {String} The formatted date.
     */
    getFormattedValue: function(format) {
        var value = this.getValue();
        return Ext.isDate(value) ? Ext.Date.format(value, format || this.getDateFormat()) : '';
    },

    applyPicker: function(picker, pickerInstance) {
        if (pickerInstance && pickerInstance.isPicker) {
            picker = pickerInstance.setConfig(picker);
        }

        return picker;
    },

    getPicker: function() {
        var picker = this._picker,
            value = this.getValue();

        if (picker && !picker.isPicker) {
            picker = Ext.factory(picker, Ext.picker.Date);
            if (value !== null) {
                picker.setValue(value);
            }
        }

        picker.on({
            scope: this,
            change: 'onPickerChange',
            hide  : 'onPickerHide'
        });

        this._picker = picker;

        return picker;
    },

    /**
     * Called when the picker changes its value.
     * @param {Ext.picker.Date} picker The date picker.
     * @param {Object} value The new value from the date picker.
     * @private
     */
    onPickerChange: function(picker, value) {
        var me = this,
            oldValue = me.getValue();

        me.setValue(value);
        me.fireEvent('select', me, value);
    },

    /**
     * Destroys the picker when it is hidden, if
     * {@link Ext.field.DatePicker#destroyPickerOnHide destroyPickerOnHide} is set to `true`.
     * @private
     */
    onPickerHide: function() {
        var me     = this,
            picker = me.getPicker();

        if (me.getDestroyPickerOnHide() && picker) {
            picker.destroy();
            me._picker = me.getInitialConfig().picker || true;
        }
    },

    reset: function() {
        this.setValue(this.originalValue);
    },

    onFocus: function(e) {
        var component = this.getComponent();
        this.fireEvent('focus', this, e);

        if (Ext.os.is.Android4) {
            component.inputElement.dom.focus();
        }
        component.inputElement.dom.blur();

        if (this.getReadOnly()) {
            return false;
        }

        this.isFocused = true;

        this.getPicker().show();
    },

    doDestroy: function() {
        var picker = this._picker;

        if (picker && picker.isPicker) {
            picker.destroy();
        }

        this.callParent();
    }
});
