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
Ext.define('MBilling.view.callOnLine.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.callonline',
    onEdit: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0],
            id = record.get('uniqueid');
        me.callParent(arguments);
        Ext.Ajax.request({
            url: 'index.php/callOnLine/getChannelDetails',
            params: {
                id: record.get('uniqueid'),
                channel: record.get('canal'),
                server: record.get('server')
            },
            scope: me,
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response[me.nameSuccessRequest]) {
                    me.formPanel.getForm().findField('description').setValue(response.description);
                    me.formPanel.getForm().findField('reinvite').setValue(response.reinvite);
                    me.formPanel.getForm().findField('from_ip').setValue(response.from_ip);
                    me.formPanel.getForm().findField('ndiscado').setValue(response.ndiscado);
                    me.formPanel.getForm().findField('callerid').setValue(response.callerid);
                }
            }
        });
    },
    onRenderModule: function() {
        var me = this;
        me.callParent(arguments);
        if (App.user.isAdmin) {
            me.store.on({
                scope: me,
                load: function(store) {
                    me.onSetTotal();
                }
            });
        }
    },
    onSetTotal: function(win) {
        var me = this;
        if (!me.store.getData().items[0]) {
            me.lookupReference('tbTextTotal') && me.lookupReference('tbTextTotal').setText();
            return;
        }
        me.sumData = me.store.getData().items[0].getData();
        if (!me.sumData) {
            me.lookupReference('tbTextTotal') && me.lookupReference('tbTextTotal').setText();
            return;
        }
        me.lookupReference('tbTextTotal') && me.lookupReference('tbTextTotal').setText('<b>' + me.sumData.serverSum + '</b>');
    },
    onDelete: function(btn) {
        var me = this,
            arrRecords = [],
            objRecord;
        Ext.Msg.confirm(t('Confirmation'), 'Confirm hangup call?', function(btn) {
            if (btn === 'yes') {
                records = me.list.getSelectionModel().getSelection();
                records = Ext.isArray(records) ? records : [records];
                Ext.each(records, function(record) {
                    objRecord = {};
                    Ext.each(me.idProperty, function(pk) {
                        objRecord['channel'] = record.get('canal');
                    });
                    arrRecords.push(Ext.clone(objRecord));
                });
                Ext.Ajax.request({
                    url: me.store.getProxy().api.destroy,
                    params: {
                        rows: Ext.encode(arrRecords)
                    },
                    success: function(response) {
                        response = Ext.decode(response.responseText);
                        if (response.success) {
                            Ext.ux.Alert.alert(me.titleSuccess, t(response.msg), 'success');
                            me.list.fireEvent('afterdestroy', me.formPanel);
                            me.store.load();
                        } else {
                            Ext.ux.Alert.alert(me.titleError, t(response.msg), 'error');
                        }
                    }
                });
            }
        }, me);
    }
});