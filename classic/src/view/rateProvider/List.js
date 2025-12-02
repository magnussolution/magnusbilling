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
Ext.define('MBilling.view.rateProvider.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.rateproviderlist',
    store: 'RateProvider',
    fieldSearch: 'idPrefix.prefix',
    initComponent: function() {
        var me = this;
        me.buttonImportCsv = !App.user.isClient;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Provider'),
            dataIndex: 'idProviderprovider_name',
            filter: {
                type: 'string',
                field: 'idProvider.provider_name'
            },
            flex: 3
        }, {
            header: t('Prefix'),
            dataIndex: 'idPrefixprefix',
            filter: {
                type: 'string',
                field: 'idPrefix.prefix'
            },
            flex: 3
        }, {
            dataIndex: 'idPrefixdestination',
            header: t('Destination'),
            filter: {
                type: 'string',
                field: 'idPrefix.destination'
            },
            flex: 4
        }, {
            header: t('Buy price'),
            dataIndex: 'buyrate',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 2,
            hidden: App.user.hidden_prices == 1
        }, {
            header: t('Buy price initblock'),
            dataIndex: 'buyrateinitblock',
            flex: 2
        }, {
            header: t('Buy price increment'),
            dataIndex: 'buyrateincrement',
            flex: 2
        }]
        me.callParent(arguments);
    }
});