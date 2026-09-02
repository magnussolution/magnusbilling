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
Ext.define('MBilling.view.trunk.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.trunk',
    onEdit: function () {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0],
            registerField = me.formPanel.getForm().findField('register');
        if (record.get('register') == 1) {
            if (record.get('register') && record.get('providertech') == 'pjsip') {
                color = record.get('registered') == 1 ? 'green' : 'red';
                registerField.setFieldLabel(t('Register trunk') + ' <span style="color:' + color + ';  font-size:30px;" > &bull; </span>');
            } else {
                registerField.setFieldLabel(t('Register trunk'));
            }
            me.formPanel.getForm().findField('register_string')['show']();
        } else {
            registerField.setFieldLabel(t('Register trunk'))
            me.formPanel.getForm().findField('register_string')['hide']();
        }
        me.callParent(arguments);
        valueAllow = me.formPanel.idRecord ? record.get('allow').split(',') : ['g729', 'gsm', 'alaw', 'ulaw'];
        fieldAllow = me.formPanel.down('checkboxgroup');
        fieldAllow.setValue({
            allow: valueAllow
        });
    },
    init: function () {
        var me = this;
        me.control({
            'trunkform': {
                edit: me.onRegistrationChange
            },
            'textfield[name=host], textfield[name=user], textfield[name=secret], textfield[name=register_string]': {
                change: me.onRegistrationChange
            },
            'noyescombo[name=register]': {
                change: me.onRegistrationChange,
                select: me.onSelectType
            }
        });
        me.callParent(arguments);
    },
    onSelectType: function () {
        this.showFieldsRelated();
        this.validateRegistration();
    },
    onRegistrationChange: function () {
        this.registrationValidationVersion = (this.registrationValidationVersion || 0) + 1;
        if (this.registrationValidationPending && this.formPanel) {
            this.registrationValidationPending = false;
            this.formPanel.setLoading(false);
        }
        this.syncRegistrationFields();
    },
    onSave: function () {
        if (!this.registrationValidationPending) {
            this.callParent(arguments);
        }
    },
    validateRegistration: function () {
        var me = this,
            panel = me.formPanel,
            form = panel.getForm(),
            fieldRegister = form.findField('register'),
            version,
            params = {id: panel.idRecord || 0};
        // Bulk saves validate each record using its stored values on the server.
        if (fieldRegister.getValue() != 1 || panel.isUpdateLot) {
            return;
        }
        Ext.each(['user', 'secret', 'host', 'register_string'], function (name) {
            params[name] = form.findField(name).getValue();
        });
        version = me.registrationValidationVersion = (me.registrationValidationVersion || 0) + 1;
        me.registrationValidationPending = true;
        panel.setLoading(true);
        Ext.Ajax.request({
            url: 'index.php/trunk/validateRegister',
            method: 'POST',
            params: params,
            callback: function (options, success, response) {
                if (panel.destroyed || version !== me.registrationValidationVersion) {
                    return;
                }
                var result = success && Ext.decode(response.responseText, true);
                me.registrationValidationPending = false;
                panel.setLoading(false);
                if (result && result.success) {
                    Ext.each(['user', 'secret', 'host', 'register', 'register_string'], function (name) {
                        form.findField(name).clearInvalid();
                    });
                    return;
                }
                fieldRegister.setValue(0);
                form.findField('register_string').setValue('');
                form.markInvalid(result && result.errors || {
                    register: t('Unable to validate registration. Try again.')
                });
                Ext.ux.Alert.alert(me.titleWarning, t('Check the registration fields before enabling Register.'), 'warning');
            }
        });
    },
    syncRegistrationFields: function () {
        var me = this,
            form = me.formPanel && me.formPanel.getForm(),
            fieldHost = form && form.findField('host'),
            fieldRegister = form && form.findField('register'),
            fieldRegisterString = form && form.findField('register_string'),
            isDynamic;
        if (!fieldHost || !fieldRegister || !fieldRegisterString) {
            return false;
        }
        isDynamic = Ext.String.trim(String(fieldHost.getValue() || '')).toLowerCase() === 'dynamic';
        // Read-only fields still submit their value, so changing the host also saves register=0.
        fieldRegister.setReadOnly(isDynamic);
        if (isDynamic) {
            fieldRegister.setValue(0);
            fieldRegisterString.setValue('');
            fieldRegister.setFieldLabel(t('Register trunk'));
        }
        fieldRegisterString.setVisible(!isDynamic && fieldRegister.getValue() == 1);
        return isDynamic;
    },
    showFieldsRelated: function () {
        var me = this,
            fieldRegisterString = me.formPanel.getForm().findField('register_string'),
            fieldRegister = me.formPanel.getForm().findField('register'),
            fieldUser = me.formPanel.getForm().findField('user'),
            fieldSecret = me.formPanel.getForm().findField('secret'),
            fieldHost = me.formPanel.getForm().findField('host');
        if (me.syncRegistrationFields()) {
            return;
        }
        fieldRegisterString.setValue(fieldRegister.getValue() == 1
            ? fieldUser.getValue() + ':' + fieldSecret.getValue() + '@' + fieldHost.getValue() + '/' + fieldUser.getValue()
            : '');
    }

});
