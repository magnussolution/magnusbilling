/**
 * Classe que define o form de "DidUse"
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
 * 24/09/2012
 */
Ext.define('MBilling.view.didUse.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.diduseform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'didcombo',
            name: 'id_did',
            fieldLabel: t('DID'),
            readOnly: true
        }, {
            xtype: 'numberfield',
            name: 'month_payed',
            fieldLabel: t('Month payed'),
            hidden: !App.user.isAdmin
        }, {
            xtype: 'datefield',
            name: 'reservationdate',
            fieldLabel: t('Reservation date'),
            format: 'Y-m-d H:i:s',
            hidden: !App.user.isAdmin
        }];
        me.callParent(arguments);
    }
});