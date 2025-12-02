/**
 * An abstract class for fields that have a single trigger which opens a "picker" popup 
 * above the field. It provides a base implementation for toggling the picker's 
 * visibility when the trigger is tapped.
 *
 * You would not normally use this class directly, but instead use it as the parent 
 * class for a specific picker field implementation.
 */
Ext.define('Ext.field.Picker', {
    extend: 'Ext.field.Text',
    xtype: 'pickerfield',

    requires: [
        'Ext.field.trigger.Expand'
    ],

    config: {
        /**
         * @cfg {Object} component
         * @accessor
         * @hide
         */
        component: {
            readOnly: true,
            useMask: true
        },

        /**
         * @cfg {Boolean} clearIcon
         * @hide
         * @accessor
         */
        clearIcon: false,

        /**
         * @cfg {String/Boolean} usePicker
         * `true` if you want this component to always use a {@link Ext.picker.Picker}.
         * `false` if you want it to use a popup overlay {@link Ext.List}.
         * `auto` if you want to show a {@link Ext.picker.Picker} only on phones.
         */
        usePicker: 'auto',

        /**
         * @cfg {Object} defaultPhonePickerConfig
         * The default configuration for the picker component when you are on a phone.
         * @private
         */
        defaultPhonePickerConfig: null,

        /**
         * @cfg {Object} defaultTabletPickerConfig
         * The default configuration for the picker component when you are on a tablet.
         * @private
         */
        defaultTabletPickerConfig: null,

        /**
         * @cfg {String} pickerSlotAlign
         * The alignment of text in the picker created by this Select
         * @private
         */
        pickerSlotAlign: 'center',

        triggers: {
            expand: {
                type: 'expand'
            }
        }
    },

    classCls: Ext.baseCSSPrefix + 'pickerfield',

    /**
     * @private
     */
    initialize: function() {
        var me = this,
            component = me.getComponent();

        me.callParent();

        component.on({
            scope: me,
            masktap: 'onMaskTap'
        });

        component.doMaskTap = Ext.emptyFn;
    },

    /**
     * @private
     */
    updateDefaultPhonePickerConfig: function(newConfig) {
        var phonePicker = this.phonePicker;
        if (phonePicker) {
            phonePicker.setConfig(newConfig);
        }
    },

    /**
     * @private
     */
    updateDefaultTabletPickerConfig: function(newConfig) {
        var tabletPicker = this.tabletPicker;
        if (tabletPicker) {
            tabletPicker.setConfig(newConfig);
        }
    },

    /**
     * @private
     * Checks if the value is `auto`. If it is, it only uses the picker if the current device type
     * is a phone.
     */
    applyUsePicker: function(usePicker) {
        if (usePicker === 'auto') {
            usePicker = Ext.os.deviceType === 'Phone';
        }

        return Boolean(usePicker);
    },

    /**
     * @private
     */
    onMaskTap: function(e) {
        this.onExpandTap(e);
    },

    onExpandTap: function() {
        if (!this.getDisabled()) {
            this.onFocus();
        }

        return false;
    },

    onFocus: function(e) {
        if (this.getDisabled()) {
            return false;
        }

        var component = this.getComponent();
        this.fireEvent('focus', this, e);

        if (Ext.os.is.Android4) {
            component.inputElement.dom.focus();
        }
        component.inputElement.dom.blur();

        this.isFocused = true;

        this.showPicker();
    },

    doDestroy: function() {
        var me = this;

        me.tabletPicker = me.phonePicker = Ext.destroy(me.tabletPicker, me.phonePicker);
        
        me.callParent();
    }
});
