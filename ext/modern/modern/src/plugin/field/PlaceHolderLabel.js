/**
 * A plugin to be used on form fields to show the field's label as the placeHolder text
 * when the field has no value. When the field has a value, the label will show above the field
 * with an animation.
 *
 *     @example
 *     Ext.Viewport.add({
 *         items : [
 *             {
 *                 xtype       : 'textfield',
 *                 placeHolder : 'Company',
 *                 name        : 'company',
 *                 value       : 'Sencha Inc.',
 *                 plugins     : [
 *                     {
 *                         type : 'placeholderlabel'
 *                     }
 *                 ]
 *             },
 *             {
 *                 xtype       : 'textareafield',
 *                 placeHolder : 'Description',
 *                 name        : 'description',
 *                 plugins     : [
 *                     {
 *                         type : 'placeholderlabel'
 *                     }
 *                 ]
 *             }
 *         ]
 *      });
 *
 * @deprecated 6.2.0 Placeholder as Label is now available as a config using the Neptune Theme
 */
Ext.define('Ext.plugin.field.PlaceHolderLabel', {
    extend : 'Ext.AbstractPlugin',
    alias  : 'plugin.placeholderlabel',

    config : {
        /**
         * @cfg {Ext.form.Field} field The field this plugin is bound too.
         * @private
         * @accessor
         */
        field : null,
        /**
         * @cfg {Boolean} [labelVisible=false] A boolean value whether the label is shown or hidden.
         * The label should only be shown if the form field has a value.
         * @accessor
         */
        labelVisible : false,
        /**
         * @cfg {String} [cls=x-placeholderlabel] The CSS class to be applied on the form field.
         * @accessor
         */
        cls : Ext.baseCSSPrefix + 'placeholderlabel',
        /**
         * @cfg {String} [showCls=x-show-label] The CSS class to be applied on the form field when the label
         * is to be shown.
         * @accessor
         */
        showCls : Ext.baseCSSPrefix + 'show-label'
    },

    constructor : function(config) {
        this.initConfig(config);

        this.callParent([config]);
    },

    init : function(field) {
        this.setField(field);

        //If the field has a value, show the label
        if (field.getValue()) {
            this.setLabelVisible(true);
        }
    },

    /**
     * Determines whether to show or hide the field's label based on if the field has a value or not.
     *
     * @private
     * @param {Ext.form.Field} field
     */
    maybeShowLabel : function(field) {
        this.setLabelVisible(!!field.getValue());
    },

    /**
     * Will add the keyup and clearicontap event listeners to the field to execute the {@link #maybeShowLabel}
     * method to show or hide the field's label.
     *
     * @private
     * @return {Object} The listener object
     */
    getFieldListeners : function() {
        return {
            scope : this,
            keyup : this.maybeShowLabel,
            clearicontap : this.maybeShowLabel
        }
    },
    updateField       : function(newField, oldField) {
        var listeners = this.getFieldListeners(),
            cls = this.getCls(),
            label, config;

        if (oldField) {
            //remove listeners
            oldField.un(listeners);

            //remove the cls from the field
            oldField.removeCls(cls);
        }

        if (newField) {
            label = newField.getLabel();
            config = {
                labelAlign : 'top'
            };

            //if there is no label on the field, use the placeHolder
            if (!label) {
                config.label = newField.getPlaceHolder();
            }

            //add listeners
            newField.on(listeners);

            //add the cls
            newField.addCls(cls);

            //sets the config to always have the labelAlign and label configs set on the field
            newField.setConfig(config);
        }
    },

    updateLabelVisible : function(show) {
        var field = this.getField();

        if (field) {
            field.toggleCls(this.getShowCls(), show);
        }
    }
});
