/**
 * Classe que define a lista de "Prefix"
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
 * 01/08/2012
 */
Ext.define('MBilling.view.prefix.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.prefixlist',
    store: 'Prefix',
    requires: ['MBilling.view.prefix.ImportCsv'],
    fieldSearch: 'prefix',
    buttonImportCsv: true,
    initComponent: function() {
        var me = this;
        if (App.user.isClient) {
            me.buttonImportCsv = false;
        }
        me.buttonUpdateLot = false;
        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Prefix'),
            dataIndex: 'prefix',
            filter: {
                type: 'string'
            }
        }, {
            header: t('Destination'),
            dataIndex: 'destination'
        }];
        me.callParent(arguments);
    }
});