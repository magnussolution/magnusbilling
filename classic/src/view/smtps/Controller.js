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
Ext.define('MBilling.view.smtps.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.smtps',
    onSendEmail: function(btn) {
        var me = this,
            selected = me.list.getSelectionModel().getSelection()[0];
        me.list.setLoading(true);
        if (me.list.getSelectionModel().getSelection().length == 1) {
            Ext.Ajax.request({
                url: 'index.php/smtps/testMail',
                params: {
                    id: selected.get('id')
                },
                scope: me,
                success: function(response) {
                    response = Ext.decode(response.responseText);
                    if (response[me.nameSuccessRequest]) {
                        Ext.ux.Alert.alert(me.titleSuccess, response[me.nameMsgRequest], 'success');
                    } else {
                        Ext.ux.Alert.alert(me.titleError, response[me.nameMsgRequest], 'error');
                    }
                    me.list.setLoading(false);
                }
            });
        } else {
            Ext.ux.Alert.alert(me.titleError, 'Please Select a Smtp', 'notification');
            me.list.setLoading(false);
        };
    }
});