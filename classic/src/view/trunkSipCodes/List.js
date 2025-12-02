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
Ext.define('MBilling.view.trunkSipCodes.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.trunksipcodeslist',
    store: 'TrunkSipCodes',
    fieldSearch: 'ip',
    initComponent: function() {
        var me = this;
        me.buttonCsv = false;
        me.allowPrint = false;
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.allowUpdate = false;
        me.textDelete = t('Reset');
        me.columns = me.columns || [{
            header: t('IP'),
            dataIndex: 'ip',
            flex: 3
        }, {
            header: t('SIP Code'),
            dataIndex: 'code',
            flex: 3
        }, {
            header: t('Total'),
            dataIndex: 'total',
            flex: 3
        }, {
            header: t('Percentage'),
            dataIndex: 'percentage',
            flex: 3
        }];
        me.callParent(arguments);
    }
});