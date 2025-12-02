/**
 * Classe que define a lista de "CallOnlineChart"
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
Ext.define('MBilling.view.callOnlineChart.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.callonlinechartlist',
    store: 'CallOnlineChart',
    initComponent: function() {
        var me = this;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Total'),
            dataIndex: 'total',
            flex: 1
        }, {
            header: t('Date'),
            dataIndex: 'date',
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i'),
            flex: 1
        }]
        me.callParent(arguments);
    }
});