/**
 * The slider is a way to allow the user to select a value from a given numerical range. You might use it for choosing
 */
Ext.define('Ext.field.SingleSlider', {
    extend  : 'Ext.field.Slider',
    xtype   : 'singlesliderfield',

    /**
     * @event dragchange
     * Fires when the value changes.
     * @param {Ext.field.Slider} me
     * @param {Number} newValue The new value.
     * @param {Number} oldValue The old value.
     */

    /**
     * @event dragchange
     * Fires when the value changes via drag.
     * @param {Ext.field.Slider} me
     * @param {Ext.slider.Slider} sl Slider Component.
     * @param {Number} newValue The new value.
     * @param {Number} oldValue The old value.
     */

    /**
    * @event dragstart
    * Fires when the slider thumb starts a drag operation.
    * @param {Ext.field.Slider} this
    * @param {Ext.slider.Slider} sl Slider Component.
    * @param {Ext.slider.Thumb} thumb The thumb being dragged.
    * @param {Array} value The start value.
    * @param {Ext.event.Event} e
    */

    /**
    * @event drag
    * Fires when the slider thumb starts a drag operation.
    * @param {Ext.field.Slider} this
    * @param {Ext.slider.Slider} sl Slider Component.
    * @param {Ext.slider.Thumb} thumb The thumb being dragged.
    * @param {Ext.event.Event} e
    */

    /**
    * @event dragend
    * Fires when the slider thumb ends a drag operation.
    * @param {Ext.field.Slider} this
    * @param {Ext.slider.Slider} sl Slider Component.
    * @param {Ext.slider.Thumb} thumb The thumb being dragged.
    * @param {Array} value The end value.
    * @param {Ext.event.Event} e
    */
   
    /**
     * @inheritdoc Ext.slider.Slider#value
     * @cfg {Number} value
     * @accessor
     */
   
    defaultBindProperty: 'value',

    publishes: {
        value: 1
    },

    initialize: function() {
        this.callParent();
        this.publishState('value', this.getValue());
    },  

    applyValue: function(value, oldValue) {
        value = this.callParent([value, oldValue]);
        if (value && Ext.isArray(value)) {
            value = value[0];
        }
        return value;
    },

    getValue: function() {
        var value = this.callParent();
        if (value && Ext.isArray(value)) {
            value = value[0];
        }
        return value;
    },

    onSliderChange: function(slider, thumb, newValue, oldValue) {
        this.setValue(newValue);
        this.fireEvent('dragchange', this, slider, newValue, oldValue);
    },

    onSliderDragStart: function(slider, thumb, startValue, e) {
        this.fireEvent('dragstart', this, slider, startValue, e);
    },

    onSliderDrag: function(slider, thumb, value, e) {
        var me = this;
        if (me.getLiveUpdate()) {
            me.setValue(value);
        }
        me.fireEvent('drag', me, slider, value, e);
    },

    onSliderDragEnd: function(slider, thumb, startValue, e) {
        this.fireEvent('dragend', this, slider, startValue, e);
    }
});
