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
Ext.define('MBilling.view.sipuras.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.sipuras',
    onSelectionChange: function(selModel, selections) {
        var me = this,
            button = me.lookupReference('buttonRotateProvisionToken');
        button && button.setDisabled(selections.length !== 1);
        me.callParent(arguments);
    },
    onRotateProvisionToken: function() {
        var me = this,
            selection = me.list.getSelectionModel().getSelection();

        if (selection.length !== 1) {
            Ext.ux.Alert.alert(me.titleError, t('Please select only a record'), 'notification');
            return;
        }

        Ext.Msg.confirm(
            t('Confirmation'),
            t('Rotate provisioning token? The current provisioning URL will stop working.'),
            function(answer) {
                if (answer !== 'yes') {
                    return;
                }

                Ext.Ajax.request({
                    url: 'index.php/sipuras/rotateProvisionToken',
                    method: 'POST',
                    params: {
                        id: selection[0].get('id')
                    },
                    scope: me,
                    success: function(response) {
                        var result = Ext.decode(response.responseText),
                            safeUrl = Ext.String.htmlEncode(result.profile_rule || '');

                        if (!result.success) {
                            Ext.ux.Alert.alert(me.titleError, result.msg, 'error');
                            return;
                        }

                        Ext.Msg.show({
                            title: t('Provisioning URL'),
                            message: Ext.String.htmlEncode(result.msg) +
                                '<br><br><textarea readonly style="width:100%;height:90px">' + safeUrl + '</textarea>',
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.INFO
                        });
                        me.store.load();
                    },
                    failure: function() {
                        Ext.ux.Alert.alert(me.titleError, t('Unable to rotate the provisioning token.'), 'error');
                    }
                });
            }
        );
    }
});
