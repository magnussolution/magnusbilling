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
Ext.define('MBilling.view.ivr.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.ivr',
    isSubmitForm: true,
    init: function () {
        var me = this;
        me.control({
            'typedestinationcombo': {
                select: me.onSelectMethod
            }
        });
        me.callParent(arguments);
    },
    onSelectMethod: function (combo, records) {
        this.showFieldsRelated(records.getData().showFields);
    },
    showFieldsRelated: function (showFields) {
        var me = this,
            form = me.formPanel.getForm(),
            fields = me.formPanel.getForm().getFields(),
            activeField = Ext.get(Ext.Element.getActiveElement()).component,
            number = activeField.name.substr(-2); //get the last two caracter from active field 
        me.onSetVisibleFiel(activeField, form, number, activeField.value);
    },
    onSetVisibleFiel: function (activeField, form, number, fieldShow) {
        if (activeField.value == 'undefined') activeField.setValue('undefined');
        if (activeField.name.match("^type_10")) {
            form.findField('id_queue_10').setVisible(fieldShow.match("^queue"));
            form.findField('id_pjsip_10').setVisible(fieldShow.match("^pjsip"));
            form.findField('id_ivr_10').setVisible(fieldShow.match("^ivr"));
            form.findField('extension_10').setVisible(fieldShow.match("^group|^number|^custom"));
        } else if (activeField.name.match("^type_[0-9]")) {
            form.findField('id_queue' + number).setVisible(fieldShow.match("^queue"));
            form.findField('id_pjsip' + number).setVisible(fieldShow.match("^pjsip"));
            form.findField('id_ivr' + number).setVisible(fieldShow.match("^ivr"));
            form.findField('extension' + number).setVisible(fieldShow.match("^group|^number|^custom"));
        } else if (activeField.name.match("^type_out_10")) {
            form.findField('id_queue_out_10').setVisible(fieldShow.match("^queue"));
            form.findField('id_ivr_out_10').setVisible(fieldShow.match("^ivr"));
            form.findField('id_pjsip_out_10').setVisible(fieldShow.match("^pjsip"));
            form.findField('extension_out_10').setVisible(fieldShow.match("^group|^number|^custom"));
        } else {
            form.findField('id_queue_out' + number).setVisible(fieldShow.match("^queue"));
            form.findField('id_pjsip_out' + number).setVisible(fieldShow.match("^pjsip"));
            form.findField('id_ivr_out' + number).setVisible(fieldShow.match("^ivr"));
            form.findField('extension_out' + number).setVisible(fieldShow.match("^group|^number|^custom"));
        }
    },
    onEdit: function () {
        var me = this,
            form = me.formPanel.getForm(),
            record = me.list.getSelectionModel().getSelection()[0];
        for (var i = 0; i <= 10; i++) {
            fieldValue = record.getData()['type_' + i];
            fieldValueOut = record.getData()['type_out_' + i];
            if (fieldValue == 'ivr') {
                form.findField('id_ivr_' + i).setVisible(true);
                form.findField('id_pjsip_' + i).setVisible(false);
                form.findField('id_queue_' + i).setVisible(false);
                form.findField('extension_' + i).setVisible(false);
            } else if (fieldValue == 'pjsip') {
                form.findField('id_pjsip_' + i).setVisible(true);
                form.findField('id_ivr_' + i).setVisible(false);
                form.findField('id_queue_' + i).setVisible(false);
                form.findField('extension_' + i).setVisible(false);
            } else if (fieldValue == 'queue') {
                form.findField('id_queue_' + i).setVisible(true);
                form.findField('id_pjsip_' + i).setVisible(false);
                form.findField('id_ivr_' + i).setVisible(false);
                form.findField('extension_' + i).setVisible(false);
            } else if (fieldValue.match("custom|number|group")) {
                form.findField('extension_' + i).setVisible(true);
                form.findField('id_ivr_' + i).setVisible(false);
                form.findField('id_pjsip_' + i).setVisible(false);
                form.findField('id_queue_' + i).setVisible(false);
            } else {
                form.findField('id_queue_' + i).setVisible(false);
                form.findField('id_pjsip_' + i).setVisible(false);
                form.findField('id_ivr_' + i).setVisible(false);
                form.findField('extension_' + i).setVisible(false);
            }
            if (fieldValueOut == 'ivr') {
                form.findField('id_ivr_out_' + i).setVisible(true);
                form.findField('id_pjsip_out_' + i).setVisible(false);
                form.findField('id_queue_out_' + i).setVisible(false);
                form.findField('extension_out_' + i).setVisible(false);
            } else if (fieldValueOut == 'pjsip') {
                form.findField('id_pjsip_out_' + i).setVisible(true);
                form.findField('id_ivr_out_' + i).setVisible(false);
                form.findField('id_queue_out_' + i).setVisible(false);
                form.findField('extension_out_' + i).setVisible(false);
            } else if (fieldValueOut == 'queue') {
                form.findField('id_queue_out_' + i).setVisible(true);
                form.findField('id_pjsip_out_' + i).setVisible(false);
                form.findField('id_ivr_out_' + i).setVisible(false);
                form.findField('extension_out_' + i).setVisible(false);
            } else if (fieldValueOut.match("custom|number|group")) {
                form.findField('extension_out_' + i).setVisible(true);
                form.findField('id_ivr_out_' + i).setVisible(false);
                form.findField('id_pjsip_out_' + i).setVisible(false);
                form.findField('id_queue_out_' + i).setVisible(false);
            } else {
                form.findField('id_queue_out_' + i).setVisible(false);
                form.findField('id_pjsip_out_' + i).setVisible(false);
                form.findField('id_ivr_out_' + i).setVisible(false);
                form.findField('extension_out_' + i).setVisible(false);
            }
        }
        me.callParent(arguments);
    },
    onNew: function () {
        var me = this,
            form = me.formPanel.getForm(),
            record = me.list.getSelectionModel().getSelection()[0];
        for (var i = 0; i <= 10; i++) {
            form.findField('id_ivr_' + i).setVisible(false);
            form.findField('id_pjsip_' + i).setVisible(false);
            form.findField('id_queue_' + i).setVisible(false);
            form.findField('id_ivr_out_' + i).setVisible(false);
            form.findField('id_pjsip_out_' + i).setVisible(false);
            form.findField('id_queue_out_' + i).setVisible(false);
        }
        me.callParent(arguments);
    },
    onDeleteAudio: function (btn) {
        var me = this,
            selected = me.list.getSelectionModel().getSelection()[0];
        if (me.list.getSelectionModel().getSelection().length == 1) {
            Ext.Ajax.request({
                url: 'index.php/ivr/deleteAudio',
                params: {
                    id_ivr: selected.get('id')
                },
                scope: me,
                success: function (response) {
                    response = Ext.decode(response.responseText);
                    if (response[me.nameSuccessRequest]) {
                        Ext.ux.Alert.alert(me.titleSuccess, response[me.nameMsgRequest], 'success');
                    } else {
                        Ext.ux.Alert.alert(me.titleError, response[me.nameMsgRequest], 'error');
                    }
                }
            });
        } else {
            Ext.ux.Alert.alert(me.titleError, t('Please select only a record'), 'notification');
        };
    }
});