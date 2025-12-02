/**
 * Classe que define a lista de "Provider"
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
 * 25/06/2012
 */
Ext.define('MBilling.view.providerCNL.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.providercnllist',
    store: 'ProviderCNL',
    buttonImportCsv: true,
    buttonUpdateLot: false,
    initComponent: function() {
        var me = this;
        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            xtype: 'templatecolumn',
            tpl: '{idProviderprovider_name}',
            header: t('Provider'),
            dataIndex: 'id_provider',
            comboFilter: 'providercombo',
            flex: 2
        }, {
            header: t('CNL'),
            dataIndex: 'cnl',
            flex: 2
        }, {
            header: t('Zone'),
            dataIndex: 'zone',
            flex: 2
        }];
        me.callParent(arguments);
    }
});