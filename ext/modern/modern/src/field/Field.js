/**
 * Field is the base class for all form fields. It provides a lot of shared functionality to all
 * field subclasses (for example labels, simple validation, {@link #clearIcon clearing} and tab index management), but
 * is rarely used directly. Instead, it is much more common to use one of the field subclasses:
 *
 *     xtype            Class
 *     ---------------------------------------
 *     textfield        {@link Ext.field.Text}
 *     numberfield      {@link Ext.field.Number}
 *     textareafield    {@link Ext.field.TextArea}
 *     hiddenfield      {@link Ext.field.Hidden}
 *     radiofield       {@link Ext.field.Radio}
 *     filefield        {@link Ext.field.File}
 *     checkboxfield    {@link Ext.field.Checkbox}
 *     selectfield      {@link Ext.field.Select}
 *     togglefield      {@link Ext.field.Toggle}
 *     fieldset         {@link Ext.form.FieldSet}
 *
 * Fields are normally used within the context of a form and/or fieldset. See the {@link Ext.form.Panel FormPanel}
 * and {@link Ext.form.FieldSet FieldSet} docs for examples on how to put those together, or the list of links above
 * for usage of individual field types. If you wish to create your own Field subclasses you can extend this class,
 * though it is sometimes more useful to extend {@link Ext.field.Text} as this provides additional text entry
 * functionality.
 */
Ext.define('Ext.field.Field', {
    extend: 'Ext.Decorator',
    alternateClassName: 'Ext.form.Field',
    xtype: 'field',
    requires: [
        'Ext.field.Input'
    ],

    /**
     * Set to `true` on all Ext.field.Field subclasses. This is used by {@link Ext.form.Panel#getValues} to determine which
     * components inside a form are fields.
     * @property isField
     * @type Boolean
     */
    isField: true,

    /**
     * @private
     */
    isFormField: true,

    config: {
        /**
         * The label of this field
         * @cfg {String} label
         * @accessor
         */
        label: null,

        /**
         * @cfg {'top'/'left'/'bottom'/'right'} labelAlign The position to render the label
         * relative to the field input.
         * @accessor
         */
        labelAlign: 'left',

        /**
         * @cfg {'top'/'right'/'bottom'/'left'}
         *
         * Text alignment of this field's label
         */
        labelTextAlign: 'left',

        /**
         * @cfg {'start'/'center'/'end'/'stretch'}
         *
         * The horizontal alignment of this field's {@link #component} within the body
         * of the field
         */
        bodyAlign: 'start',

        /**
         * @cfg {Number/String} labelWidth The width to make this field's label.
         * @accessor
         */
        labelWidth: '30%',

        /**
         * @cfg {Boolean} labelWrap `true` to allow the label to wrap. If set to `false`, the label will be truncated with
         * an ellipsis.
         * @accessor
         */
        labelWrap: false,

        /**
         * @cfg {Boolean} clearIcon `true` to use a clear icon in this field.
         * @accessor
         */
        clearIcon: null,

        /**
         * @cfg {Boolean} required `true` to make this field required.
         *
         * __Note:__ this only causes a visual indication.
         *
         * Doesn't prevent user from submitting the form.
         * @accessor
         */
        required: false,

        /**
         * The label Element associated with this Field.
         *
         * __Note:__ Only available if a {@link #label} is specified.
         * @type Ext.Element
         * @property labelEl
         * @deprecated 2.0
         */

        /**
         * @cfg {String} [inputType='text'] The type attribute for input fields -- e.g. radio, text, password, file.
         * The types 'file' and 'password' must be used to render those field types currently -- there are
         * no separate Ext components for those.
         * @deprecated 2.0 Please use `input.type` instead.
         * @accessor
         */
        inputType: null,

        /**
         * @cfg {String} name The field's HTML name attribute.
         *
         * __Note:__ this property must be set if this field is to be automatically included with.
         * {@link Ext.form.Panel#method-submit form submit()}.
         * @accessor
         */
        name: null,

        /**
         * @cfg {Mixed} value A value to initialize this field with.
         * @accessor
         */
        value: null,

        /**
         * @cfg {Number} tabIndex The `tabIndex` for this field. Note this only applies to fields that are rendered,
         * not those which are built via `applyTo`.
         * @accessor
         */
        tabIndex: null

        /**
         * @cfg {Object} component
         * The inner component for this field.
         */

        /**
         * @cfg {Boolean} fullscreen
         * @hide
         */
    },

    cachedConfig: {
        /**
         * @cfg {String} labelCls Optional CSS class to add to the Label element.
         * @accessor
         */
        labelCls: null,

        /**
         * @cfg {String} inputCls CSS class to add to the input element of this fields {@link #component}
         */
        inputCls: null
    },

    classCls: Ext.baseCSSPrefix + 'field',
    requiredCls: Ext.baseCSSPrefix + 'required',
    noLabelWrapCls: Ext.baseCSSPrefix + 'no-label-wrap',

    /**
     * @cfg {Boolean} isFocused
     * `true` if this field is currently focused.
     * @private
     */

    getElementConfig: function() {
        return {
            reference: 'element',
            children: [
                {
                    reference: 'labelElement',
                    cls: Ext.baseCSSPrefix + 'label-el',
                    children: [{
                        reference: 'labelTextElement',
                        cls: Ext.baseCSSPrefix + 'label-text-el',
                        tag: 'span'
                    }]
                },
                {
                    reference: 'bodyElement',
                    cls: Ext.baseCSSPrefix + 'body-el'
                }
            ]
        };
    },

    initElement: function() {
        this.callParent();
        this.innerElement = this.bodyElement;
    },

    updateBodyAlign: function(bodyAlign, oldBodyAlign) {
        var element = this.element;

        if (oldBodyAlign) {
            element.removeCls(Ext.baseCSSPrefix + 'body-align-' + oldBodyAlign);
        }

        if (bodyAlign) {
            element.addCls(Ext.baseCSSPrefix + 'body-align-' + bodyAlign);
        }
    },

    /**
     * @private
     */
    updateLabel: function(newLabel, oldLabel) {
        var renderElement = this.renderElement;

        if (newLabel) {
            this.labelTextElement.setHtml(newLabel);
            renderElement.addCls(Ext.baseCSSPrefix + 'labeled');
        } else {
            renderElement.removeCls(Ext.baseCSSPrefix + 'labeled');
        }
    },

    /**
     * @private
     */
    updateLabelAlign: function(newLabelAlign, oldLabelAlign) {
        var element = this.element;

        if (oldLabelAlign) {
            element.removeCls(Ext.baseCSSPrefix + 'label-align-' + oldLabelAlign);
        }

        if (newLabelAlign) {
            element.addCls(Ext.baseCSSPrefix + 'label-align-' + newLabelAlign);

            if (newLabelAlign === "top" || newLabelAlign === "bottom" || newLabelAlign === 'placeholder') {
                this.labelElement.setWidth('100%');
            } else {
                this.updateLabelWidth(this.getLabelWidth());
            }
        }
    },

    updateLabelTextAlign: function(labelTextAlign, oldLabelTextAlign) {
        var element = this.element;

        if (oldLabelTextAlign) {
            element.removeCls(Ext.baseCSSPrefix + 'label-text-align-' + oldLabelTextAlign);
        }

        if (labelTextAlign) {
            element.addCls(Ext.baseCSSPrefix + 'label-text-align-' + labelTextAlign);
        }
    },

    /**
     * @private
     */
    updateLabelCls: function(newLabelCls, oldLabelCls) {
        var labelElement = this.labelElement;

        if (newLabelCls) {
            labelElement.addCls(newLabelCls);
        }

        if (oldLabelCls) {
            labelElement.removeCls(oldLabelCls);
        }
    },

    /**
     * @private
     */
    updateLabelWidth: function(newLabelWidth) {
        var labelAlign = this.getLabelAlign(),
            labelElement = this.labelElement;

        if (newLabelWidth) {
            if (labelAlign == "top" || labelAlign == "bottom") {
                labelElement.setWidth('100%');
            } else {
                labelElement.setWidth(newLabelWidth);
            }
        }
    },

    /**
     * @private
     */
    updateLabelWrap: function(newLabelWrap, oldLabelWrap) {
        this.element.toggleCls(this.noLabelWrapCls, !newLabelWrap);
    },

    /**
     * Updates the {@link #required} configuration.
     * @private
     */
    updateRequired: function(newRequired) {
        this.renderElement.toggleCls(this.requiredCls, newRequired);
    },

    /**
     * @private
     */
    initialize: function() {
        var me = this;
        me.callParent();

        me.doInitValue();
    },

    /**
     * @private
     */
    doInitValue: function() {
        /**
         * @property {Mixed} originalValue
         * The original value of the field as configured in the {@link #value} configuration.
         * setting is `true`.
         */
        this.originalValue = this.getInitialConfig().value;
    },

    /**
     * Resets the current field value back to the original value on this field when it was created.
     *
     *     // This will create a field with an original value
     *     var field = Ext.Viewport.add({
     *         xtype: 'textfield',
     *         value: 'first value'
     *     });
     *
     *     // Update the value
     *     field.setValue('new value');
     *
     *     // Now you can reset it back to the `first value`
     *     field.reset();
     *
     * @return {Ext.field.Field} this
     */
    reset: function() {
        this.setValue(this.originalValue);

        return this;
    },

    /**
     * Resets the field's {@link #originalValue} property so it matches the current {@link #getValue value}. This is
     * called by {@link Ext.form.Panel}.{@link Ext.form.Panel#setValues setValues} if the form's
     * {@link Ext.form.Panel#trackResetOnLoad trackResetOnLoad} property is set to true.
     */
    resetOriginalValue: function() {
        this.originalValue = this.getValue();
    },

    /**
     * Returns `true` if the value of this Field has been changed from its {@link #originalValue}.
     * Will return `false` if the field is disabled or has not been rendered yet.
     *
     * @return {Boolean} `true` if this field has been changed from its original value (and
     * is not disabled), `false` otherwise.
     */
    isDirty: function() {
        return false;
    }
});
