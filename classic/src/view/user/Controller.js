Ext.define('MBilling.view.user.Controller', {
    extend: 'Ext.ux.app.ViewController',
    requires: ['MBilling.view.userType.Combo'],
    alias: 'controller.user',
    groupIsAdmin: false,
    init: function() {
        var me = this;
        me.control({
            'groupusercombo': {
                select: me.onSelectType
            },
            'restrictioncombo[name=restriction]': {
                select: me.onSelectTypeRestriction
            }
        });
        me.callParent(arguments);
    },
    onSelectTypeRestriction: function(combo, records) {
        var me = this,
            fieldUse = me.formPanel.getForm().findField('restriction_use'),
            fieldRestriction = me.formPanel.getForm().findField('restriction');
        if (window.restrictionuser && fieldRestriction.getValue() == 1) {
            fieldUse.setVisible(true);
        } else {
            fieldUse.setVisible(false);
        }
    },
    onSelectType: function(combo, records) {
        this.showFieldsRelated(records.getData().showFields);
    },
    showFieldsRelated: function(showFields) {
        var me = this,
            fields = me.formPanel.getForm().getFields(),
            fieldGroupAgent = me.formPanel.getForm().findField('id_group_agent'),
            form = me.formPanel.getForm();
        me.onGetUserType(me.formPanel.getForm().findField('id_group').getValue(), function(result) {
            me.groupIsAdmin = result;
            me.formPanel.getForm().findField('id_plan').setVisible(!result);
            me.formPanel.getForm().findField('id_plan').setAllowBlank(result);
            me.formPanel.getForm().findField('id_offer').setVisible(!result);
            me.formPanel.getForm().findField('prefix_local').setVisible(!result);
        });
        fields.each(function(field) {
            if (field.name == 'id_group') {
                filterGroupp = Ext.encode([{
                        type: 'numeric',
                        comparison: 'eq',
                        value: 2,
                        field: 'id_user_type'
                    }]),
                    Ext.Ajax.request({
                        url: 'index.php/groupUser/index',
                        params: {
                            filter: filterGroupp
                        },
                        success: function(r) {
                            r = Ext.decode(r.responseText);
                            var res = r.rows;
                            for (i = 0; i < res.length; i++) {
                                if (field.value == res[i]) {
                                    //this.setAllowBlank(false);
                                    fieldGroupAgent['show']();
                                    break;
                                } else {
                                    //this.setAllowBlank(true);
                                    fieldGroupAgent['hide']();
                                }
                            }
                        }
                    });
            }
        });
    },
    onNew: function() {
        var me = this,
            fieldPasswordGen = me.formPanel.getForm().findField('password'),
            fieldCallingcard_pin = me.formPanel.getForm().findField('callingcard_pin'),
            fieldGroupAgent = me.formPanel.getForm().findField('id_group_agent'),
            fieldUsername = me.formPanel.getForm().findField('username');
        me.formPanel.getForm().findField('contract_value').setValue(0);
        me.callParent(arguments);
        fieldGroupAgent['hide']();
        fieldPasswordGen.setVisible(true);
        Ext.Ajax.request({
            url: 'index.php/user/getNewPassword',
            scope: me,
            success: function(response) {
                response = Ext.decode(response.responseText);
                fieldPasswordGen.setValue(response.newPassword);
            }
        });
        Ext.Ajax.request({
            url: 'index.php/user/getNewPinCallingcard',
            scope: me,
            success: function(response) {
                response = Ext.decode(response.responseText);
                fieldCallingcard_pin.setValue(response.newCallingcardPin);
            }
        });
        Ext.Ajax.request({
            url: 'index.php/user/getNewUsername',
            scope: me,
            success: function(response) {
                response = Ext.decode(response.responseText);
                console.log(response);
                fieldUsername.setValue(response.newUsername);
            }
        });
    },
    onEdit: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0];
        fieldUsername = record.get('username'),
            fieldGroupAgent = record.get('id_group_agent'),
            fieldPassword = record.get('password'),
            fieldPlan = record.get('id_plan'),
            fieldPrefixLocal = record.get('prefix_local'),
            fieldTypepaid = record.get('typepaid'),
            fieldCreditlimit = record.get('creditlimit'),
            fieldEnableexpire = record.get('enableexpire'),
            fieldExpirationDate = record.get('expirationdate'),
            fieldCreditNot = record.get('credit_notification'),
            fieldCallshop = record.get('callshop'),
            fieldLock_pin = record.get('lock_pin'),
            fieldRestriction = record.get('restriction'),
            fieldPasswordGen = record.get('password'),
            fieldCallingcard_pin = record.get('callingcard_pin'),
            fieldGroupAgent = me.formPanel.getForm().findField('id_group_agent'),
            fieldGroup = me.formPanel.getForm().findField('id_group');
        me.lookupReference('personalData').show();
        me.lookupReference('mainData').show();
        if (window.restrictionuser && record.get('restriction') == 1) {
            me.formPanel.getForm().findField('restriction_use')['show']();
        } else {
            me.formPanel.getForm().findField('restriction_use')['hide']();
        }
        if (App.user.isAdmin) {
            if (record.get('id_user') > 1) {
                me.formPanel.getForm().findField('id_plan')['hide']();
                fieldGroup.readOnly = true;
            } else {
                me.formPanel.getForm().findField('id_plan')['show']();
                fieldGroup.readOnly = false;
            }
        };
        me.callParent(arguments);
        me.onGetUserType(record.get('id_group'), function(result) {
            me.formPanel.getForm().findField('password').setVisible(!result);
            me.formPanel.getForm().findField('id_plan').setVisible(!result);
            me.formPanel.getForm().findField('id_plan').setAllowBlank(result);
            me.formPanel.getForm().findField('id_offer').setVisible(!result);
            me.formPanel.getForm().findField('prefix_local').setVisible(!result);
        });
        if (fieldGroup.value == 2) {
            fieldGroupAgent['show']();
        } else {
            fieldGroupAgent['hide']();
        }
    },
    onGetUserType: function(id_group, callback) {
        filterGroupp = Ext.encode([{
                type: 'numeric',
                comparison: 'eq',
                value: id_group,
                field: 'id'
            }]),
            Ext.Ajax.request({
                url: 'index.php/groupUser/getUserType',
                params: {
                    filter: filterGroupp
                },
                success: function(r) {
                    r = Ext.decode(r.responseText);
                    callback(r.rows);
                }
            });
    },
    onDelete: function(btn) {
        var me = this,
            records;
        notDelete = false;
        Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
            if (record.get('id') == 1) {
                Ext.ux.Alert.alert(me.titleError, t('You cannot delete the') + ' user id 1', 'error');
                notDelete = true;
            }
        });
        if (notDelete == false) me.callParent(arguments);
    },
    onResendActivation: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0];
        if (record.get('email').length < 5) {
            Ext.ux.Alert.alert(me.titleError, t('User not have a Email'), 'error');
            return;
        }
        Ext.Ajax.request({
            params: {
                id: record.get(me.idProperty)
            },
            timeout: 500000,
            url: 'index.php/user/resendActivationEmail',
            scope: me,
            success: function(response) {
                Ext.ux.Alert.alert(me.titleError, t('Success'), 'success');
            }
        });
    }
});