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
 * 01/10/2019
 */
Ext.define('MBilling.view.api.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.api',
    onEdit: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0];
        me.callParent(arguments);
        valueAllow = me.formPanel.idRecord ? record.get('action').split(',') : ['r'];
        fieldAllow = me.formPanel.down('checkboxgroup');
        fieldAllow.setValue({
            action: valueAllow
        });
    }
});