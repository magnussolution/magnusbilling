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
Ext.define('MBilling.view.backup.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.backup',
    formHidden: true,
    onDownload: function(btn) {
        var me = this,
            records,
            record = me.list.getSelectionModel().getSelection()[0],
            idRecord = [];
        values = 'file=' + record.data.name;
        url = 'index.php/backup/download/?' + values;
        window.open(url);
    },
    onDelete: function(btn) {
        var me = this,
            records,
            record = me.list.getSelectionModel().getSelection()[0],
            idRecord = []
        destroyType = btn.menu.down('menucheckitem[checked=true]').value;
        var msgConfirmation = (destroyType === 'all') ? me.msgDeleteAll : me.msgConfirmation;
        if (!me.list.allowDelete) {
            return;
        }
        if (destroyType === 'all') {
            Ext.ux.Alert.alert(me.titleError, 'You cannot delete all backups', 'notification');
            return;
        };
        if (record) {
            Ext.Msg.confirm(me.titleConfirmation, msgConfirmation, function(btn) {
                if (btn === 'yes') {
                    Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
                        idRecord.push(record.get('name'));
                    });
                    Ext.Ajax.request({
                        url: 'index.php/backup/destroy',
                        params: {
                            ids: Ext.encode(idRecord)
                        },
                        scope: me,
                        success: function(response) {
                            response = Ext.decode(response.responseText);
                            if (response[me.nameSuccessRequest]) {
                                var msg = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                Ext.ux.Alert.alert(me.titleSuccess, msg, 'success');
                            } else {
                                var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                Ext.ux.Alert.alert(me.titleError, errors, 'notification');
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
    onNew: function() {
        var me = this;
        Ext.Msg.confirm(me.titleConfirmation, t('Do you really want to create a new backup now? It may take a long time and make your server slow. MagnusBilling makes backups every day automatically at 03:00.'), function(btn) {
            if (btn === 'yes') {
                Ext.Msg.confirm(me.titleConfirmation, t('This will overwrite any backup made today! Are you sure?'), function(btn) {
                    if (btn === 'yes') {
                        Ext.Ajax.request({
                            url: 'index.php/backup/save',
                            params: {
                                ids: 0
                            },
                            scope: me,
                            success: function(response) {
                                response = Ext.decode(response.responseText);
                                if (response[me.nameSuccessRequest]) {
                                    var msg = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                    Ext.ux.Alert.alert(me.titleSuccess, msg, 'success');
                                } else {
                                    var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                                    Ext.ux.Alert.alert(me.titleError, errors, 'notification');
                                }
                            }
                        });
                        me.store.load();
                    }
                }, me);
            }
        }, me);
    }
});