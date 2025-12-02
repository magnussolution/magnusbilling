/**
 * Classe que define a lista de "CallShopCdr"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 01/10/2013
 */
Ext.define('MBilling.view.plan.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.plan',
    isSubmitForm: true,
    init: function() {
        var me = this;
        me.control({
            'noyescombo': {
                select: me.onSelectType
            }
        });
        me.callParent(arguments);
    },
    onSelectType: function(combo, records) {
        this.showFieldsRelated(records.getData().showFields);
    },
    showFieldsRelated: function(showFields) {
        var me = this,
            fields = me.formPanel.getForm().getFields(),
            fieldIniCredit = me.formPanel.getForm().findField('ini_credit'),
            form = me.formPanel.getForm();
        fields.each(function(field) {
            if (field.name == 'signup') field.value == 1 ? fieldIniCredit['show']() : fieldIniCredit['hide']();
        });
    },
    onEdit: function() {
        var me = this,
            fieldIniCredit = me.formPanel.getForm().findField('ini_credit'),
            fieldSignup = me.formPanel.getForm().findField('signup');
        me.callParent(arguments);
        fieldSignup.value == 1 ? fieldIniCredit['show']() : fieldIniCredit['hide']();
    },
    submitForm: function(values) {
        var me = this,
            store = me.store;
        Ext.apply(me.params, {
            id_services_array: me.formPanel.getForm().getFieldValues().id_services.join(',')
        });
        me.formPanel.add({
            xtype: 'hiddenfield',
            name: me.idProperty,
            value: me.formPanel.idRecord
        });
        me.formPanel.getForm().submit({
            url: me.store.getProxy().api.create,
            params: me.params,
            scope: me,
            success: function(form, action) {
                var obj = Ext.decode(action.response.responseText);
                if (obj.success) {
                    Ext.ux.Alert.alert(me.titleSuccess, obj.msg, 'success');
                    me.formPanel.fireEvent('Aftersave', me.formPanel, obj.rows[0]);
                } else {
                    errors = Helper.Util.convertErrorsJsonToString(obj.msg);
                    if (!Ext.isObject(obj.errors)) {
                        Ext.ux.Alert.alert(me.titleError, errors, 'error');
                    } else {
                        form.markInvalid(obj.errors);
                        Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
                    }
                }
                me.store.load();
                me.formPanel.setLoading(false);
                me.saveButton.enable();
            },
            failure: function(form, action) {
                var obj = Ext.decode(action.response.responseText),
                    errors = Helper.Util.convertErrorsJsonToString(obj.errors);
                if (!Ext.isObject(obj.errors)) {
                    Ext.ux.Alert.alert(me.titleError, errors, 'error');
                } else {
                    form.markInvalid(obj.errors);
                    Ext.ux.Alert.alert(me.titleWarning, errors, 'error');
                }
                me.formPanel.setLoading(false);
                me.saveButton.enable();
            }
        });
        //delete me.params['id_services_array'];
    }
});