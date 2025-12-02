/**
 * Classe que define a lista de "CallShopCdr"
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
Ext.define('MBilling.view.callShopCdr.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.callshopcdrlist',
    store: 'CallShopCdr',
    initComponent: function() {
        var me = this;
        me.buttonCsv = false;
        me.buttonUpdateLot = false;
        me.allowUpdate = true;
        me.allowDelete = false;
        me.allowCreate = false;
        me.allowUpdate = false
        me.allowPrint = false;
        me.columns = [{
            header: t('Booth'),
            dataIndex: 'cabina',
            filter: {
                type: 'string'
            },
            flex: 2
        }, {
            header: t('Number'),
            dataIndex: 'calledstation',
            filter: {
                type: 'string'
            },
            flex: 3
        }, {
            dataIndex: 'destination',
            header: t('Destination'),
            flex: 3
        }, {
            header: t('Paid'),
            dataIndex: 'status',
            renderer: Helper.Util.formattyyesno,
            flex: 2,
            filter: {
                type: 'list',
                options: [
                    [0, t('No')],
                    [1, t('Yes')]
                ]
            }
        }, {
            header: t('Buy price'),
            dataIndex: 'buycost',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 2
        }, {
            header: t('Sell price'),
            dataIndex: 'price',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 2
        }, {
            header: t('Markup'),
            dataIndex: 'markup',
            renderer: Ext.util.Format.numberRenderer('0.00 %'),
            flex: 2
        }, {
            header: t('Duration'),
            dataIndex: 'sessiontime',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 2
        }, {
            header: t('Date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'date',
            flex: 4
        }]
        me.callParent(arguments);
    }
});