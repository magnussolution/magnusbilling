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
Ext.define('MBilling.view.did.Controller', {
    extend: 'Ext.ux.app.ViewController',
    requires: ['MBilling.view.did.Bulk'],
    alias: 'controller.did',
    isSubmitForm: true,
    init: function() {
        var me = this;
        me.control({
            'booleancombo[name=cbr]': {
                select: me.onSelectcbr
            },
            'noyescombo[name=cbr_ua]': {
                select: me.onSelectcbrAu
            }
        });
        me.callParent(arguments);
    },
    onSelectcbr: function(combo, records) {
        me = this,
            form = me.formPanel.getForm();
        form.findField('cbr_ua').setVisible(records.data.field1);
        form.findField('cbr_total_try').setVisible(records.data.field1);
        form.findField('cbr_time_try').setVisible(records.data.field1);
    },
    onSelectcbrAu: function(combo, records) {
        me = this,
            form = me.formPanel.getForm();
        form.findField('cbr_em').setVisible(records.data.field1);
        form.findField('TimeOfDay_monFri').setVisible(records.data.field1);
        form.findField('TimeOfDay_sat').setVisible(records.data.field1);
        form.findField('TimeOfDay_sun').setVisible(records.data.field1);
        form.findField('workaudio').setVisible(records.data.field1);
        form.findField('noworkaudio').setVisible(records.data.field1);
    },
    onNew: function(btn) {
        var me = this,
            form = me.formPanel.getForm();
        form.findField('cbr_ua').setVisible(false);
        form.findField('cbr_em').setVisible(false);
        form.findField('TimeOfDay_monFri').setVisible(false);
        form.findField('TimeOfDay_sat').setVisible(false);
        form.findField('TimeOfDay_sun').setVisible(false);
        form.findField('workaudio').setVisible(false);
        form.findField('noworkaudio').setVisible(false);
        form.findField('cbr_total_try').setVisible(false);
        form.findField('cbr_time_try').setVisible(false);
        me.callParent(arguments);
    },
    onEdit: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0];
        if (record.get('cbr') == 0) {
            me.formPanel.getForm().findField('cbr_ua').setVisible(false);
            me.formPanel.getForm().findField('cbr_em').setVisible(false);
            me.formPanel.getForm().findField('TimeOfDay_monFri').setVisible(false);
            me.formPanel.getForm().findField('TimeOfDay_sat').setVisible(false);
            me.formPanel.getForm().findField('TimeOfDay_sun').setVisible(false);
            me.formPanel.getForm().findField('workaudio').setVisible(false);
            me.formPanel.getForm().findField('noworkaudio').setVisible(false);
            me.formPanel.getForm().findField('cbr_total_try').setVisible(false);
            me.formPanel.getForm().findField('cbr_time_try').setVisible(false);
        } else {
            me.formPanel.getForm().findField('cbr_ua').setVisible(true);
            if (record.get('cbr_ua') == 1) {
                me.formPanel.getForm().findField('cbr_em').setVisible(true);
                me.formPanel.getForm().findField('TimeOfDay_monFri').setVisible(true);
                me.formPanel.getForm().findField('TimeOfDay_sat').setVisible(true);
                me.formPanel.getForm().findField('TimeOfDay_sun').setVisible(true);
                me.formPanel.getForm().findField('workaudio').setVisible(true);
                me.formPanel.getForm().findField('noworkaudio').setVisible(true);
                me.formPanel.getForm().findField('cbr_total_try').setVisible(true);
                me.formPanel.getForm().findField('cbr_time_try').setVisible(true);
            }
        }
        me.lookupReference('billingTab').show();
        me.lookupReference('generalTab').show();
        me.callParent(arguments);
    },
    onDelete: function(btn) {
        var me = this,
            records = me.list.getSelectionModel().getSelection(),
            allowDelete = true;
        Ext.each(records, function(selected) {
            if (selected.get('reserved') === 1) {
                Ext.ux.Alert.alert(me.titleError, t('Please, first release the DID') + ' ' + selected.get('did'), 'error');
                allowDelete = false;
                return;
            }
        });
        if (allowDelete == true) {
            me.callParent(arguments);
        };
    },
    onRelease: function(btn, pressed) {
        var me = this,
            records,
            record = me.list.getSelectionModel().getSelection()[0],
            idRecord = []
        if (record) {
            dids = "";
            Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
                dids = dids + ', ' + record.get('did');
            });
            msgConfirmation = t('Confirm release DIDs') + dids,
                Ext.Msg.confirm(me.titleConfirmation, msgConfirmation, function(btn) {
                    if (btn === 'yes') {
                        Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
                            idRecord.push(record.get('id'));
                        });
                        Ext.Ajax.request({
                            url: 'index.php/did/liberar',
                            params: {
                                ids: Ext.encode(idRecord)
                            },
                            scope: me,
                            success: function(response) {
                                response = Ext.decode(response.responseText);
                                if (response[me.nameSuccessRequest]) {
                                    var msg = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                    Ext.ux.Alert.alert(me.titleSuccess, t(msg), 'success');
                                } else {
                                    var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                    Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                                }
                            }
                        });
                        me.store.load();
                    }
                }, me);
        } else {
            Ext.ux.Alert.alert(me.titleError, t('Please select one or more records'), 'notification');
        }
    },
    onBuy: function(btn, pressed) {
        var me = this,
            records,
            record = me.list.getSelectionModel().getSelection()[0],
            idRecord = []
        if (record) {
            dids = "";
            Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
                dids = dids + ', ' + record.get('did');
            });
            msgConfirmation = t('Confirm buy DIDs') + dids,
                Ext.Msg.confirm(me.titleConfirmation, msgConfirmation, function(btn) {
                    if (btn === 'yes') {
                        Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
                            idRecord.push(record.get('id'));
                        });
                        Ext.Ajax.request({
                            url: 'index.php/did/buyBulk',
                            params: {
                                ids: Ext.encode(idRecord)
                            },
                            scope: me,
                            success: function(response) {
                                response = Ext.decode(response.responseText);
                                if (response[me.nameSuccessRequest]) {
                                    var msg = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                    Ext.ux.Alert.alert(me.titleSuccess, t(msg), 'success');
                                } else {
                                    var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                    Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                                }
                            }
                        });
                        me.store.load();
                    }
                }, me);
        } else {
            Ext.ux.Alert.alert(me.titleError, t('Please select one or more records'), 'notification');
        }
    },
    onBuyDid: function() {
        var me = this,
            getForm = me.lookupReference('buydidPanel'),
            fieldDid = getForm.getForm().findField('did').getValue(),
            valueDid = getForm.getForm().findField('did').rawValue,
            msgConfirmation = t('Do you confirm buy this DID?');
        if (fieldDid < 1) Ext.ux.Alert.alert(me.titleError, t('Please, select a DID'), 'warning');
        else {
            Ext.Msg.confirm(t('Confirmation'), msgConfirmation + ' <br>' + valueDid, function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'index.php/did/buyBulk',
                        params: {
                            ids: Ext.encode(fieldDid)
                        },
                        success: function(response) {
                            response = Ext.decode(response.responseText);
                            if (response['success']) {
                                Ext.ux.Alert.alert(me.titleSuccess, t(response['msg']), 'success', true, true, 5000);
                                getForm.getForm().findField('did').getStore().load();
                                getForm.getForm().findField('did').rawValue = '';
                                getForm.getForm().findField('did').setValue();
                            } else {
                                var errors = Helper.Util.convertErrorsJsonToString(response['msg']);
                                Ext.ux.Alert.alert(me.titleError, t(errors), 'error', true, true, 5000);
                            }
                        }
                    });
                    me.store.load();
                }
            }, me);
        }
    }
});