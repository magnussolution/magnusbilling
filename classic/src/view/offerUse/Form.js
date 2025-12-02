/**
 * Classe que define o form de "OfferUse"
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
 * 17/08/2012
 */
Ext.define('MBilling.view.offerUse.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.offeruseform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            readOnly: true
        }, {
            xtype: 'offercombo',
            name: 'id_offer',
            fieldLabel: t('Offer'),
            readOnly: true
        }, {
            name: 'month_payed',
            fieldLabel: t('Month payed')
        }, {
            xtype: 'datefield',
            name: 'reservationdate',
            fieldLabel: t('Reservation date'),
            format: 'Y-m-d H:i:s'
        }];
        me.callParent(arguments);
    }
});