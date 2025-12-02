/**
 * Classe que define a lista de "UserHistory"
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
 * 22/06/2022
 */
Ext.define('MBilling.view.userHistory.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.userhistorylist',
    store: 'UserHistory',
    fieldSearch: 'idUser.username',
    initComponent: function() {
        var me = this;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 3,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }, {
            header: t('Description'),
            dataIndex: 'description',
            flex: 5,
            hidden: window.isTablet
        }, {
            header: t('Date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'date',
            flex: 4,
            hidden: window.isTablet
        }];
        me.callParent(arguments);
    }
});