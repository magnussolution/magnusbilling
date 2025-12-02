/**
 * A mixin that contains functionality common to {@link Ext.form.Panel} and
 * {@link Ext.form.FieldSet}
 *
 * @private
 */
Ext.define('Ext.form.FieldContainer', {
    extend: 'Ext.Mixin',
    mixinConfig: {
        id: 'fieldContainer'
    },

    config: {
        /**
         * @cfg {Boolean} [fieldSeparators=false]
         * Set to `true` to show separators between the fields in this form.  Typically
         * used together with {@link #inputBorders} to create iOS-like forms
         *
         * Defaults to `true` in the iOS theme
         */
        fieldSeparators: null,

        /**
         * @cfg {Boolean} [inputBorders=true]
         *
         * `false` to suppress borders on the input elements of fields in this form.
         * Typically used together with {@link #fieldSeparators} to create iOS-like forms.
         *
         * Defaults to `false` in the iOS theme
         */
        inputBorders: null
    },

    fieldSeparatorsCls: Ext.baseCSSPrefix + 'form-field-separators',
    noInputBordersCls: Ext.baseCSSPrefix + 'form-no-input-borders',

    updateFieldSeparators: function(fieldSeparators, oldFieldSeparators) {
        var innerElement = this.innerElement,
            cls = this.fieldSeparatorsCls;

        if (fieldSeparators) {
            innerElement.addCls(cls);
        } else if (oldFieldSeparators) {
            innerElement.removeCls(cls);
        }
    },

    updateInputBorders: function(inputBorders, oldInputBorders) {
        var innerElement = this.innerElement,
            cls = this.noInputBordersCls;

        if (inputBorders === false) {
            innerElement.addCls(cls);
        } else if (oldInputBorders === false) {
            innerElement.removeCls(cls);
        }
    }

});