/**
 * Classe que define a lista de "Trunk"
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
Ext.define('MBilling.view.trunk.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.trunklist',
    store: 'Trunk',
    fieldSearch: 'trunkcode',
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
            dataIndex: 'trunkcode',
            flex: 3
        }, {
            header: t('Add prefix'),
            dataIndex: 'trunkprefix',
            flex: 2,
            hidden: window.isTablet
        }, {
            header: t('Remove prefix'),
            dataIndex: 'removeprefix',
            flex: 2,
            hidden: window.isTablet
        }, {
            header: t('Host'),
            dataIndex: 'host',
            flex: 2,
            hidden: window.isTablet
        }, {
            xtype: 'templatecolumn',
            tpl: '{idProviderprovider_name}',
            header: t('Provider'),
            dataIndex: 'id_provider',
            comboFilter: 'providercombo',
            flex: 2,
            hidden: window.isTablet
        }, {
            header: t('Time used'),
            renderer: Helper.Util.formatsecondsToTime,
            dataIndex: 'secondusedreal',
            flex: 3,
            hidden: window.isTablet
        }, {
            header: t('Status'),
            dataIndex: 'status',
            renderer: Helper.Util.formatBooleanActive,
            comboFilter: 'booleancombo',
            flex: 1,
            filter: {
                type: 'list',
                options: [
                    [1, t('Active')],
                    [0, t('Inactive')]
                ]
            }
        }, {
            header: t('Creation date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'creationdate',
            flex: 3,
            hidden: window.isTablet
        }];
        me.callParent(arguments);
    }
});