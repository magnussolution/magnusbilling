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
Ext.define('MBilling.view.phoneNumber.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.phonenumber',
    reprocessar: function(btn) {
        var me = this,
            store = me.list.getStore(),
            filter = me.list.filters.getFilterData().length ? Ext.encode(me.list.filters.getFilterData()) : store.proxy.extraParams.filter;
        btn.disable();
        me.list.setLoading(true);
        if (!filter) {
            Ext.ux.Alert.alert('Alert', 'Realize um filtro para reprocessar', 'notification');
            btn.enable();
            me.list.setLoading(false);
            return;
        };
        Ext.Msg.confirm('Confirm', 'Confirme que quer reprocessar os numeros pendentes?', function(btnYes) {
            if (btnYes === 'yes') {
                Ext.Ajax.request({
                    url: 'index.php/phoneNumber/reprocesar/',
                    params: {
                        filter: filter
                    },
                    scope: me,
                    success: function(response) {
                        response = Ext.decode(response.responseText);
                        if (response[me.nameSuccessRequest]) {
                            Ext.ux.Alert.alert(me.titleSuccess, response[me.nameMsgRequest], 'success');
                            store.load();
                            btn.enable();
                            me.list.setLoading(false);
                        } else {
                            var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                            Ext.ux.Alert.alert(me.titleError, errors, 'error');
                            btn.enable();
                            me.list.setLoading(false);
                        }
                    }
                });
            }
        });
    }
});