/**
 * Classe que define a lista de "Callerid"
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
Ext.define('MBilling.view.didHistory.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.didhistorylist',
    store: 'DidHistory',
    fieldSearch: 'did',
    initComponent: function() {
        var me = this;
        me.buttonCsv = false;
        me.allowPrint = false;
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.allowDelete = false;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('DID'),
            dataIndex: 'did',
            flex: 5
        }, {
            header: t('Username'),
            dataIndex: 'username',
            flex: 4,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }, {
            header: t('Month payed'),
            dataIndex: 'month_payed',
            flex: 2
        }, {
            header: t('Reservation date'),
            renderer: Helper.Util.formatDateTime,
            dataIndex: 'reservationdate',
            flex: 5
        }, {
            header: t('Release date'),
            renderer: Helper.Util.formatDateTime,
            dataIndex: 'releasedate',
            flex: 5
        }]
        me.callParent(arguments);
    }
});