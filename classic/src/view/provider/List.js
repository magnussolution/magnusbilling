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
Ext.define('MBilling.view.provider.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.providerlist',
    store: 'Provider',
    initComponent: function() {
        var me = this;
        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Name'),
            dataIndex: 'provider_name'
        }, {
            header: t('Description'),
            dataIndex: 'description',
            hidden: window.isTablet
        }, {
            header: t('Credit'),
            dataIndex: 'credit',
            renderer: Helper.Util.formatMoneyDecimal,
            hidden: window.isTablet
        }, {
            header: t('Creation date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'creationdate',
            hidden: window.isTablet
        }];
        me.callParent(arguments);
    }
});