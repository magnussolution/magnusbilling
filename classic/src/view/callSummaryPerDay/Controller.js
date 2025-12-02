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
Ext.define('MBilling.view.callSummaryPerDay.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.callsummaryperday',
    onEdit: function() {
        me = this;
        me.sumData = me.store.getData().items[0].getData();
        if (!me.sumData) {
            return;
        }
        me.formPanel.getForm().getFields().each(function(field) {
            field.setValue(me.sumData[field.name]);
        });
        me.formPanel.expand();
    }
});