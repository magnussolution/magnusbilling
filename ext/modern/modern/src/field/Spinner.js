/**
 * Wraps an HTML5 number field. Example usage:
 *
 *     @example miniphone
 *     var spinner = Ext.create('Ext.field.Spinner', {
 *         label: 'Spinner Field',
 *         minValue: 0,
 *         maxValue: 100,
 *         stepValue: 2,
 *         cycle: true
 *     });
 *     Ext.Viewport.add({ xtype: 'container', items: [spinner] });
 *
 */
Ext.define('Ext.field.Spinner', {
    extend: 'Ext.field.Number',
    xtype: 'spinnerfield',
    alternateClassName: 'Ext.form.Spinner',

    requires: [
        'Ext.field.trigger.SpinDown',
        'Ext.field.trigger.SpinUp'
    ],

    /**
     * @event spin
     * Fires when the value is changed via either spinner buttons.
     * @param {Ext.field.Spinner} this
     * @param {Number} value
     * @param {String} direction 'up' or 'down'.
     */

    /**
     * @event spindown
     * Fires when the value is changed via the spinner down button.
     * @param {Ext.field.Spinner} this
     * @param {Number} value
     */

    /**
     * @event spinup
     * Fires when the value is changed via the spinner up button.
     * @param {Ext.field.Spinner} this
     * @param {Number} value
     */

    /**
     * @event updatedata
     * @hide
     */

    /**
     * @event action
     * @hide
     */

    config: {
        /**
         * @cfg {Number} [minValue=-infinity] The minimum allowed value.
         * @accessor
         */
        minValue: Number.NEGATIVE_INFINITY,

        /**
         * @cfg {Number} [maxValue=infinity] The maximum allowed value.
         * @accessor
         */
        maxValue: Number.MAX_VALUE,

        /**
         * @cfg {Number} stepValue Value that is added or subtracted from the current value when a spinner is used.
         * @accessor
         */
        stepValue: 0.1,

        /**
         * @cfg {Boolean} accelerateOnTapHold True if autorepeating should start slowly and accelerate.
         * @accessor
         */
        accelerateOnTapHold: true,

        /**
         * @cfg {Boolean} cycle When set to `true`, it will loop the values of a minimum or maximum is reached.
         * If the maximum value is reached, the value will be set to the minimum.
         * @accessor
         */
        cycle: false,

        /**
         * @cfg {Boolean} clearIcon
         * @hide
         * @accessor
         */
        clearIcon: false,

        /**
         * @cfg {Number} defaultValue The default value for this field when no value has been set.
         * It is also used when the value is set to `NaN`.
         */
        defaultValue: 0,

        /**
         * @cfg {Number} tabIndex
         * @hide
         */
        tabIndex: -1,

        /**
         * @cfg {Boolean} groupButtons
         * `true` if you want to group the buttons to the right of the fields. `false` if you want the buttons
         * to be at either side of the field.
         * @deprecated 6.2.0 This concern should be handled by the theme.
         */
        groupButtons: true,

        /**
         * @cfg component
         * @inheritdoc
         */
        component: {
            readOnly: true
        },

        triggers: {
            spindown: {
                type: 'spindown',
                group: 'spin',
                repeat: true
            },
            spinup: {
                type: 'spinup',
                group: 'spin',
                repeat: true
            }
        },

        /**
         * @cfg {Number}
         */
        value: undefined
    },

    classCls: Ext.baseCSSPrefix + 'spinnerfield',
    groupedButtonsCls: Ext.baseCSSPrefix + 'grouped-buttons',

    /**
     * Updates the {@link #component} configuration
     */

    updateGroupButtons: function(groupButtons) {
        var downTrigger = this.getTriggers().spindown;

        downTrigger.setGroup(groupButtons ? 'spin' : null);
        downTrigger.setSide(groupButtons ? null : 'left');
    },

    applyTriggers: function(triggers, oldTriggers) {
        var accelerate = this.getAccelerateOnTapHold(),
            upTrigger, downTrigger, upRepeat, downRepeat;

        if (triggers && accelerate) {
            upTrigger = triggers.spinup;
            downTrigger = triggers.spindown;
            upRepeat = upTrigger.repeat;

            if (upRepeat) {
                upTrigger.repeat = Ext.apply({
                    accelerate: accelerate
                }, upRepeat);
            }

            downRepeat = downTrigger.repeat;

            if (downRepeat) {
                downTrigger.repeat = Ext.apply({
                    accelerate: accelerate
                }, downRepeat);
            }
        }

        return this.callParent([triggers, oldTriggers]);
    },

    applyValue: function(value) {
        value = parseFloat(value);
        if (isNaN(value) || value === null) {
            value = this.getDefaultValue();
        }

        //round the value to 1 decimal
        value = Math.round(value * 10) / 10;

        return this.callParent([value]);
    },

    /**
     * @private
     */
    onSpinDown: function() {
        if (!this.getDisabled() && !this.getReadOnly()) {
            this.spin(true);
        }
    },

    /**
     * @private
     */
    onSpinUp: function() {
        if (!this.getDisabled() && !this.getReadOnly()) {
            this.spin(false);
        }
    },

    /**
     * @private
     */
    spin: function(down) {
        var me = this,
            originalValue = me.getValue(),
            stepValue = me.getStepValue(),
            direction = down ? 'down' : 'up',
            minValue = me.getMinValue(),
            maxValue = me.getMaxValue(),
            value;

        if (down) {
            value = originalValue - stepValue;
        }
        else {
            value = originalValue + stepValue;
        }

        //if cycle is true, then we need to check fi the value hasn't changed and we cycle the value
        if (me.getCycle()) {
            if (originalValue == minValue && value < minValue) {
                value = maxValue;
            }

            if (originalValue == maxValue && value > maxValue) {
                value = minValue;
            }
        }

        me.setValue(value);
        value = me.getValue();

        me.fireEvent('spin', me, value, direction);
        me.fireEvent('spin' + direction, me, value);
    },

    reset: function() {
        this.setValue(this.getDefaultValue());
    }
});
