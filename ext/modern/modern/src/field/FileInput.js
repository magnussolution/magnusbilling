/**
 * @private
 */
Ext.define('Ext.field.FileInput', {
    extend: 'Ext.field.Input',
    xtype: 'fileinput',

    /**
     * @event change
     * Fires just before the field blurs if the field value has changed
     * @param {Ext.field.Text} this This field
     * @param {Mixed} newValue The new value
     * @param {Mixed} oldValue The original value
     */

    config: {
        type: "file",
        accept: null,
        capture: null,
        name: null,
        multiple: false
    },

    /**
     * @property {Object} Lookup of capture devices to accept types
     * @private
     */
    captureLookup: {
        video: "camcorder",
        image: "camera",
        audio: "microphone"
    },

    /**
     * @private
     */
    initialize: function() {
        var me = this;

        me.callParent();

        me.inputElement.on({
            scope: me,
            change: 'onInputChange'
        });
    },

    doBlur: function() {
        this.showMask();
        this.setIsFocused(false);
    },

    /**
     * Returns the field data value.
     * @return {String} value The field value.
     */
    getValue: function() {
        var inputElement = this.inputElement;

        if (inputElement) {
            this._value = inputElement.dom.value;
        }

        return this._value;
    },

    /**
     * Sets the internal value. Security restrictions prevent setting file values on the input element
     * @cfg newValue {string} New Value
     * @return {String}
     */
    setValue: function(newValue) {
        var oldValue = this._value;
        this._value = newValue;

        if (String(this._value) != String(oldValue) && this.initialized) {
            this.onChange(this, this._value, oldValue);
        }

        return this;
    },

    /**
     * Returns the field files.
     * @return {FileList} List of the files selected.
     */
    getFiles: function() {
        var inputElement = this.inputElement;

        if (inputElement) {
            this.$files = inputElement.dom.files;
        }

        return this.$files;
    },

    /**
     * @private
     */
    onInputChange: function(e) {
        this.setValue(e.target.value);
    },

    /**
     * Called when the value changes on this input item
     * @cfg {Object} me
     * @cfg {String} value new Value
     * @cfg {String} startValue Original Value
     */
    onChange: function(me, value, startValue) {
        this.fireEvent('change', me, value, startValue);
    },

    /**
     * Called when the name being changed
     * @cfg value   new value
     * @return {*}
     */
    applyName: function(value) {
        if(this.getMultiple() && value.substr(-2, 2) !== "[]") {
            value += "[]";
        }else if((!this.getMultiple()) && value.substr(-2, 2) === "[]") {
            value = value.substr(0, value.length-2)
        }

        return value;
    },

    /**
     * Applies the multiple attribute to the input
     * @cfg value {boolean}
     * @return {boolean}
     */
    applyMultiple: function(value) {
        this.updateFieldAttribute('multiple', value ? '' : null);
        return value;
    },

    /**
     * Called when the multiple property is updated. The name will automatically be toggled to an array if needed.
     */
    updateMultiple: function() {
        var name = this.getName();
        if(!Ext.isEmpty(name)) {
            this.setName(name);
        }
    },

    /**
     * Updates the accept attribute with the {@link #accept} configuration.
     */
    applyAccept: function(value) {
        switch (value) {
            case "video":
            case "audio":
            case "image":
                value = value + "/*";
                break;
        }

        this.updateFieldAttribute('accept', value);
    },

    /**
     * Updated the capture attribute with the {@ink capture} configuration
     */
    applyCapture: function(value) {
        this.updateFieldAttribute('capture', value);
        return value;
    }
});
