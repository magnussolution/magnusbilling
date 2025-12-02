Ext.define('MBilling.view.main.ChangePasswordController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.changepassword',
    requires: ['Ext.form.Panel', 'Ext.ux.form.field.Password'],
    onShowWinChangePass: function() {
        this.lookupReference('formChangePass').getForm().findField('current_password').focus(10);
    },
    savePassword: function() {
        var me = this,
            view = me.getView(),
            btnSave = me.lookupReference('saveChangePass'),
            formPanel = me.lookupReference('formChangePass'),
            fieldPassword = formPanel.getForm().findField('password');
        fieldCurrentPassword = formPanel.getForm().findField('current_password');
        values = Ext.apply(formPanel.getValues(), {
            current_password: Helper.Util.sha1(fieldCurrentPassword.getValue())
        });
        if (!formPanel.isValid()) {
            Ext.ux.Alert.alert(view.titleWarning, view.msgFormInvalid, 'warning');
            return;
        }
        if (fieldCurrentPassword.getValue() == fieldPassword.getValue()) {
            Ext.ux.Alert.alert(view.titleWarning, t("New password is hidden new password"), 'warning');
            return;
        }
        if (fieldPassword.getValue().indexOf('=') !== -1 || fieldPassword.getValue().indexOf('--') !== -1 || fieldPassword.getValue().indexOf('\'') !== -1 || fieldPassword.getValue().indexOf(' or ') !== -1 || fieldPassword.getValue().indexOf(' table ') !== -1) {
            Ext.ux.Alert.alert(view.titleWarning, "New password cantain invalid caracter", 'warning');
            return;
        }
        values.password = Helper.Util.sha1(fieldPassword.getValue());
        btnSave.disable();
        formPanel.setLoading();
        Ext.Ajax.request({
            url: 'index.php/authentication/changePassword',
            params: values,
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response.success) {
                    Ext.ux.Alert.alert(view.titleSuccess, response.msg, 'success');
                    formPanel.getForm().reset();
                    fieldCurrentPassword.focus();
                } else {
                    if (!Ext.isObject(response.errors)) {
                        Ext.ux.Alert.alert(view.titleError, response.msg, 'error');
                        fieldCurrentPassword.focus(true);
                    } else {
                        formPanel.getForm().markInvalid(response.errors);
                        fieldCurrentPassword.focus(true);
                        Ext.ux.Alert.alert(view.titleWarning, view.msgFormInvalid, 'warning');
                    }
                }
                formPanel.setLoading(false);
                btnSave.enable();
            }
        });
    },
    checkKeyEnterChangePass: function(field, evt) {
        if (evt.getKey() === evt.ENTER) {
            this.savePassword();
        }
    }
});