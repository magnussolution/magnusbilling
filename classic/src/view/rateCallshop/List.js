/**
 * Classe que define a lista de "RateCallshop"
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
 * 30/07/2012
 */
Ext.define('MBilling.view.rateCallshop.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.ratecallshoplist',
    store: 'RateCallshop',
    buttonImportCsv: true,
    initComponent: function() {
        var me = this;
        me.buttonImportCsv = App.user.isClient,
            me.buttonCsv = App.user.isClient;
        me.allowPrint = App.user.isClient;
        me.buttonUpdateLot = App.user.isClient;
        me.allowCreate = App.user.isClient;
        me.allowUpdate = App.user.isClient;
        me.allowDelete = App.user.isClient;
        me.buttonUpdateLotCallShopRate = App.user.isClient;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Prefix'),
            dataIndex: 'dialprefix',
            filter: {
                type: 'string'
            },
            flex: 2
        }, {
            header: t('Destination'),
            dataIndex: 'destination',
            flex: 3
        }, {
            header: t('Sell price'),
            dataIndex: 'buyrate',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 2
        }, {
            header: t('Buy price initblock'),
            dataIndex: 'minimo',
            flex: 2
        }, {
            header: t('Buy price increment'),
            dataIndex: 'block',
            flex: 2
        }]
        me.callParent(arguments);
    }
});