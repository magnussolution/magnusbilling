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
Ext.define('MBilling.view.callBack.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.callback',
    onReative: function(btn) {
        var me = this,
            store = me.store,
            filter = me.list.filters.getFilterData().length ? Ext.encode(me.list.filters.getFilterData()) : store.proxy.extraParams.filter;
        Ext.Ajax.request({
            url: 'index.php/callBack/reprocesar/',
            params: {
                filter: filter
            },
            scope: me,
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response[me.nameSuccessRequest]) {
                    Ext.ux.Alert.alert(me.titleSuccess, response[me.nameMsgRequest], 'success', true, false, 15000);
                    store.load();
                } else {
                    var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                    Ext.ux.Alert.alert(me.titleError, errors, 'error');
                }
            }
        });
    }
});