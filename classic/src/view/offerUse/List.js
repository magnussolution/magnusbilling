/**
 * Classe que define a lista de "OfferUse"
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
Ext.define('MBilling.view.offerUse.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.offeruselist',
    store: 'OfferUse',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.allowDelete = false;
        me.columns = [{
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 3
        }, {
            xtype: 'templatecolumn',
            tpl: '{idOfferlabel}',
            header: t('Offer'),
            dataIndex: 'id_offer',
            comboFilter: 'offercombo',
            flex: 3
        }, {
            header: t('Month payed'),
            dataIndex: 'month_payed',
            flex: 3
        }, {
            header: t('Reservation date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d'),
            dataIndex: 'reservationdate',
            flex: 3
        }, {
            header: t('Release date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d'),
            dataIndex: 'releasedate',
            flex: 3
        }];
        me.callParent(arguments);
    }
});