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
Ext.define('MBilling.view.callSummaryPerUser.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.callsummaryperuserlist',
    store: 'CallSummaryPerUser',
    initComponent: function() {
        var me = this;
        me.fieldSearch = App.user.isAdmin ? 'idUser.username' : '';
        me.buttonImportCsv = false;
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.allowUpdate = false;
        me.allowDelete = false;
        me.columns = [{
            xtype: 'actioncolumn',
            width: 26,
            sortable: false,
            menuDisabled: true,
            header: t(''),
            dataIndex: 'id',
            items: [{
                iconCls: 'icon-export-csv',
                tooltip: t('Export CSV'),
                handler: 'onExportCsvUser'
            }],
            hidden: !App.user.isAdmin
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 3
        }, {
            header: t('Duration') + '/Min',
            dataIndex: 'sessiontime',
            flex: 2
        }, {
            header: t('ALOC all calls'),
            dataIndex: 'aloc_all_calls',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3
        }, {
            header: t('Answered'),
            dataIndex: 'nbcall',
            flex: 3
        }, {
            header: t('Failed'),
            dataIndex: 'nbcall_fail',
            flex: 3
        }, {
            header: t('Buy price'),
            dataIndex: App.user.isAdmin ? 'buycost' : 'sessionbill',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hidden: App.user.isClient || App.user.hidden_prices == 1,
            hideable: App.user.isAdmin && App.user.hidden_prices == 0
        }, {
            header: t('Sell price'),
            dataIndex: App.user.isAgent || App.user.isClientAgent ? 'agent_bill' : 'sessionbill',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hidden: App.user.hidden_prices == 1,
            hideable: App.user.hidden_prices == 0
        }, {
            header: t('Markup'),
            dataIndex: 'lucro',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hidden: App.user.isClient || App.user.hidden_prices == 1,
            hideable: App.user.isAdmin && App.user.hidden_prices == 0
        }, {
            header: t('ASR'),
            dataIndex: 'asr',
            renderer: Helper.Util.formatPorcente,
            flex: 3,
            hidden: !App.user.isAdmin,
            hideable: App.user.isAdmin
        }]
        me.callParent(arguments);
    }
});