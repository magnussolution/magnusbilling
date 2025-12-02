/**
 * Classe que define a lista de "Configuration"
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
Ext.define('MBilling.view.configuration.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.configurationlist',
    store: 'Configuration',
    fieldSearch: 'config_title',
    comparisonfilter: 'ct',
    initComponent: function() {
        var me = this;
        me.allowPrint = false;
        me.buttonCsv = false;
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
            header: t('Name'),
            dataIndex: 'config_title'
        }, {
            header: t('Value'),
            dataIndex: 'config_value'
        }];
        me.callParent(arguments);
    }
});