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
 * 19/09/2017
 */
Ext.define('MBilling.view.services.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.serviceslist',
    store: 'Services',
    initComponent: function() {
        var me = this;
        me.buttonCsv = false;
        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Type'),
            dataIndex: 'type',
            flex: 3,
            renderer: Helper.Util.formatTranslate,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }, {
            header: t('Name'),
            dataIndex: 'name',
            flex: 4
        }, {
            header: t('Price'),
            dataIndex: 'price',
            renderer: Helper.Util.formatMoneyDecimal2,
            flex: 2
        }, {
            hidden: App.user.isClient,
            dataIndex: 'description',
            header: t('Description'),
            flex: 4
        }]
        me.callParent(arguments);
    }
});