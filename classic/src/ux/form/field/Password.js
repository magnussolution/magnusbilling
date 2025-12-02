/**
 * Class to define ux field "Password"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 21/08/2013
 */
Ext.define('Ext.ux.form.field.Password', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.passwordfield',
    requires: ['Ext.form.FieldSet'],
    mixins: {
        field: 'Ext.form.field.Field'
    },
    fieldLabel: t('Password'),
    confirmText: t('Confirmation'),
    passNotMatchText: t('Passwords not match'),
    changeText: t('Change'),
    layout: 'fit',
    name: 'password',
    maxLength: 100,
    width: 50,
    allowChange: true,
    changeVisualOnDisable: false,
    styleFields: {
        padding: '5px'
    },
    anchor: '0',
    eventsRelay: ['validitychange', 'errorchange', 'specialkey', 'blur', 'keydown', 'keyup', 'keypress', 'change'],
    initComponent: function() {
        var me = this;
        me.hideLabel = !me.allowChange;
        me.items = me.initFields();
        me.callParent(arguments);
    },
    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.up('form').on('edit', me.onEdit, me);
        me.relayEvents(me.down('#password'), me.eventsRelay);
        me.relayEvents(me.down('#confirm'), me.eventsRelay);
    },
    isEditing: function() {
        return this.up('form').idRecord > 0;
    },
    onEdit: function() {
        var me = this,
            fieldset = me.down('fieldset');
        me.reset();
        me.setAllowBlank(me.isEditing());
        fieldset[me.isEditing() ? 'collapse' : 'expand']();
        fieldset.legend.setVisible(me.isEditing());
    },
    initFields: function() {
        var me = this;
        return {
            xtype: me.allowChange ? 'fieldset' : 'container',
            style: me.styleFields,
            title: me.changeText,
            checkboxToggle: true,
            listeners: {
                scope: me,
                expand: me.onExpandField,
                collapse: me.onCollapseField
            },
            layout: 'anchor',
            defaults: {
                xtype: 'textfield',
                maxLength: me.maxLength,
                inputType: 'password',
                isFormField: false,
                enableKeyEvents: true,
                anchor: '0',
                msgTarget: 'side'
            },
            items: [{
                itemId: 'password',
                emptyText: me.fieldLabel
            }, {
                itemId: 'confirm',
                emptyText: me.confirmText
            }]
        };
    },
    onExpandField: function() {
        this.enable();
        this.setAllowBlank(false);
    },
    onCollapseField: function() {
        this.disable();
        this.setAllowBlank(true);
    },
    enable: function(silent) {
        var me = this;
        delete me.disableOnBoxReady;
        me.changeVisualOnDisable && me.removeCls(me.disabledCls);
        if (me.rendered) {
            me.onEnable();
        } else {
            me.enableOnBoxReady = true;
        }
        me.disabled = false;
        delete me.resetDisable;
        if (silent !== true) {
            me.fireEvent('enable', me);
        }
        return me;
    },
    disable: function(silent) {
        var me = this;
        delete me.enableOnBoxReady;
        me.changeVisualOnDisable && me.addCls(me.disabledCls);
        if (me.rendered) {
            me.onDisable();
        } else {
            me.disableOnBoxReady = true;
        }
        me.disabled = true;
        if (silent !== true) {
            delete me.resetDisable;
            me.fireEvent('disable', me);
        }
        return me;
    },
    getErrors: function() {
        var me = this,
            fieldPass = me.down('#password'),
            fieldConfirm = me.down('#confirm'),
            fieldset = me.down('fieldset'),
            errors = Ext.Array.merge(fieldPass.getErrors(), fieldConfirm.getErrors());
        if (me.allowBlank === false && !fieldPass.getValue()) {
            errors.push(fieldPass.blankText);
            fieldset && fieldset.expand();
            fieldPass.markInvalid(fieldPass.blankText);
            return errors;
        }
        if (fieldPass.getValue() !== fieldConfirm.getValue()) {
            errors.push(me.passNotMatchText);
            fieldset && fieldset.expand();
            fieldConfirm.markInvalid(me.passNotMatchText);
            return errors;
        }
        return errors;
    },
    reset: function() {
        this.down('#password').reset();
        this.down('#confirm').reset();
    },
    getValue: function() {
        var value = this.down('#password').getValue();
        return value;
    }
});