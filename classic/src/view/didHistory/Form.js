/**
 * Classe que define o form de "Call"
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
 * 19/09/2012
 */
Ext.define('MBilling.view.didHistory.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.didhistoryform',
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'did',
            fieldLabel: t('DID'),
            readOnly: true
        }, {
            name: 'username',
            fieldLabel: t('Username'),
            readOnly: true
        }, {
            xtype: 'numberfield',
            name: 'month_payed',
            fieldLabel: t('Month payed'),
            readOnly: true
        }, {
            xtype: 'datefield',
            name: 'reservationdate',
            fieldLabel: t('Reservation date'),
            format: 'Y-m-d H:i:s',
            readOnly: true
        }, {
            xtype: 'textareafield',
            allowBlank: true,
            name: 'description',
            fieldLabel: t('Description'),
            hidden: !App.user.isAdmin
        }];
        me.callParent(arguments);
    }
});