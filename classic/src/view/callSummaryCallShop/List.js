/**
 * Classe que define a lista de "CallSummary"
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
Ext.define('MBilling.view.callSummaryCallShop.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.callsummarycallshoplist',
    store: 'CallSummaryCallShop',
    initComponent: function() {
        var me = this;
        me.buttonImportCsv = false
        me.buttonCsv = false;
        me.allowPrint = false;
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.buttonCleanFilter = false;
        me.allowUpdate = false;
        me.allowDelete = false;
        me.extraButtons = [{
            text: t('Charts'),
            iconCls: 'icon-chart-column',
            handler: 'onChart',
            reference: 'chart',
            disabled: false,
            hidden: App.user.isClient
        }];
        me.collapsedExtraFilters = false;
        me.titleAddFilter = t('Filter');
        me.extraFilters = [{
            field: 't.cabina',
            label: t('Booth'),
            type: 'string'
        }, {
            field: 't.calledstation',
            label: t('Prefix'),
            type: 'string'
        }];
        me.columns = [{
            header: t('Day'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d'),
            dataIndex: 'day',
            filter: {
                type: 'date',
                field: 'date'
            },
            flex: 3
        }, {
            menuDisabled: true,
            header: t('Duration') + '/Min',
            dataIndex: 'sessiontime',
            flex: 2
        }, {
            menuDisabled: true,
            header: t('ALOC all calls'),
            dataIndex: 'aloc_all_calls',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3
        }, {
            menuDisabled: true,
            header: t('Calls'),
            dataIndex: 'nbcall',
            flex: 3
        }, {
            menuDisabled: true,
            header: t('Buy price'),
            dataIndex: 'buycost',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hideable: false,
            hidden: !App.user.isClient
        }, {
            menuDisabled: true,
            header: t('Sell price'),
            dataIndex: 'price',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hidden: !App.user.isClient
        }, {
            menuDisabled: true,
            header: t('Markup'),
            dataIndex: 'lucro',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hideable: false,
            hidden: !App.user.isClient
        }]
        me.callParent(arguments);
    }
});