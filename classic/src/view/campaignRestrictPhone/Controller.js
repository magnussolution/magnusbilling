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
Ext.define('MBilling.view.campaignRestrictPhone.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.campaignrestrictphone',
    onEdit: function() {
        var me = this;
        me.callParent(arguments);
    },
    deleteDuplicados: function(btn) {
        var me = this,
            store = me.list.getStore(),
            filter = me.list.filters.getFilterData().length ? Ext.encode(me.getList().filters.getFilterData()) : store.proxy.extraParams.filter;
        btn.disable();
        me.list.setLoading(true);
        Ext.Msg.confirm('Confirm', 'Confirme que quer deletar os numeros duplicados?', function(btnYes) {
            if (btnYes === 'yes') {
                Ext.Ajax.request({
                    url: 'index.php/campaignRestrictPhone/deleteDuplicados/',
                    params: {
                        filter: filter
                    },
                    scope: me,
                    success: function(response) {
                        response = Ext.decode(response.responseText);
                        if (response[me.nameSuccessRequest]) {
                            Ext.ux.Alert.alert(me.titleSuccess, response[me.nameMsgRequest], 'success');
                        } else {
                            var errors = Helper.Util.convertErrorsJsonToString(response[me.nameMsgRequest]);
                            Ext.ux.Alert.alert(me.titleError, errors, 'error');
                        }
                        me.list.setLoading(false);
                        btn.enable();
                    }
                });
            }
        });
    }
});