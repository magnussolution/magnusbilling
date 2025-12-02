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
Ext.define('MBilling.view.queue.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.queue',
    isSubmitForm: true,
    init: function() {
        var me = this;
        me.control({
            'combobox[name=ring_or_moh]': {
                select: me.onSelectringOrMOH
            }
        });
        me.callParent(arguments);
    },
    onSelectringOrMOH: function(combo, records) {
        me = this,
            form = me.formPanel.getForm();
        form.findField('musiconhold').setVisible(records.data.field1 == 'moh');
    },
    onNew: function() {
        var me = this;
        me.formPanel.getForm().findField('musiconhold').setVisible(true);
        me.callParent(arguments);
    },
    onEdit: function() {
        var me = this;
        me.callParent(arguments);
        ringOrMoh = me.formPanel.getForm().findField('ring_or_moh').getValue();
        me.formPanel.getForm().findField('musiconhold').setVisible(ringOrMoh == 'moh');
    },
    onResetQueueStats: function(btn) {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0],
            filter = Ext.encode(me.list.filters.getFilterData()),
            idRecord = [];
        if (record) {
            Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
                idRecord.push(record.get(me.idProperty));
            });
            Ext.Ajax.request({
                url: 'index.php/queue/resetQueueStats',
                params: {
                    ids: Ext.encode(idRecord),
                    filter: filter
                },
                scope: me,
                success: function(response) {
                    response = Ext.decode(response.responseText);
                    if (response[me.nameSuccessRequest]) {
                        Ext.ux.Alert.alert(me.titleSuccess, response.msg, 'success');
                    } else {
                        var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                        Ext.ux.Alert.alert(me.titleError, errors, 'notification');
                    }
                }
            });
        } else {
            Ext.ux.Alert.alert(me.titleError, t('Please select one or more queue'), 'notification');
        }
    },
    onDeleteMusic: function(btn) {
        var me = this,
            selected = me.list.getSelectionModel().getSelection()[0];
        if (me.list.getSelectionModel().getSelection().length == 1) {
            Ext.Ajax.request({
                url: 'index.php/queue/deleteMusicOnHold',
                params: {
                    id_queue: selected.get('id')
                },
                scope: me,
                success: function(response) {
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