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
Ext.define('MBilling.view.campaignSend.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.campaignsend',
    init: function() {
        var me = this;
        me.control({
            'campaignsendcombo': {
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
            getForm = me.lookupReference('campaignSendPanel');
        fields = getForm.getForm().getFields();
        fields.each(function(field) {
            field.setVisible(showFields.indexOf(field.name) !== -1);
        });
    },
    onSendCampaign: function(btn) {
        if (App.user.isAdmin) {
            Ext.ux.Alert.alert('Notification', t('This option is exclusive to users'), 'notification');
            return;
        }
        var me = this,
            form = me.lookupReference('campaignSendPanel').getForm(),
            filedSmsText = form.findField('sms_text').getValue(),
            filedType = form.findField('type').getValue(),
            filedNumber = form.findField('numbers').getValue(),
            filedTCSV = form.findField('csv_path').getValue(),
            filedAudio = form.findField('audio_path').getValue();
        if (filedType == 'SMS1') {
            Ext.ux.Alert.alert('Error', t('Please select campaign type'), 'notification');
            return;
        }
        if (filedType == 'SMS' && filedSmsText == '') {
            form.findField('sms_text').allowBlank = false;
            form.findField('sms_text').validate();
            Ext.ux.Alert.alert('Error', t('Please enter with SMS text'), 'notification');
        }
        if (filedType == 'CALL' && filedAudio == '') {
            form.findField('audio_path').allowBlank = false;
            form.findField('audio_path').validate();
            Ext.ux.Alert.alert('Error', t('Please select a valid audio'), 'notification');
        };
        if (filedNumber == '' && filedTCSV == '') {
            form.findField('numbers').allowBlank = false;
            form.findField('numbers').validate();
            form.findField('csv_path').allowBlank = false;
            form.findField('csv_path').validate();
            Ext.ux.Alert.alert('Error', t('Please enter with numbers or import CSV file'), 'notification');
        };
        if (form.isValid()) {
            form.submit({
                url: 'index.php/campaign/quick',
                method: 'POST',
                scope: me,
                success: function(fp, o) {
                    Ext.ux.Alert.alert(t('success'), t('Success'), 'success');
                    form.findField('type').setValue('');
                    form.findField('sms_text').setValue('');
                    form.findField('numbers').setValue('');
                    form.findField('csv_path').setValue('');
                    form.findField('startingtime').setValue('00:00');
                    form.findField('startingdate').setValue(new Date());
                    form.findField('sms_text').getPlugin('markallowblank').setAllowBlank(true);
                    form.findField('sms_text')['hide']();
                    form.findField('numbers').getPlugin('markallowblank').setAllowBlank(true);
                    form.findField('numbers')['hide']();
                    form.findField('csv_path').getPlugin('markallowblank').setAllowBlank(true);
                    form.findField('csv_path')['hide']();
                    form.findField('startingdate').getPlugin('markallowblank').setAllowBlank(true);
                    form.findField('startingdate')['hide']();
                    form.findField('startingtime').getPlugin('markallowblank').setAllowBlank(true);
                    form.findField('startingtime')['hide']();
                },
                failure: function(form, action) {
                    if (Ext.isObject(action.response.responseText)) {
                        var obj = Ext.decode(action.response.responseText);
                        Ext.ux.Alert.alert(t('Error'), obj.errors, 'error');
                    } else {
                        Ext.ux.Alert.alert(t('Error'), action.response.responseText, 'error', true, 10);
                    }
                }
            });
        }
    }
});