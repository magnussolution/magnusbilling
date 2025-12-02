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
Ext.define('MBilling.view.callSummaryDayTrunk.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.callsummarydaytrunklist',
    store: 'CallSummaryDayTrunk',
    initComponent: function() {
        var me = this;
        me.fieldSearch = App.user.isAdmin ? 'idTrunk.trunkcode' : '';
        me.buttonImportCsv = false
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.allowUpdate = false;
        me.allowDelete = false;
        me.columns = [{
            header: t('Day'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d'),
            dataIndex: 'day',
            filter: {
                type: 'date',
                field: 'day'
            },
            flex: 3
        }, {
            header: t('Trunk'),
            dataIndex: 'idTrunktrunkcode',
            filter: {
                type: 'string',
                field: 'idTrunk.trunkcode'
            },
            flex: 4,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
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
            dataIndex: 'buycost',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hidden: App.user.isClient || App.user.hidden_prices == 1,
            hideable: App.user.isAdmin && App.user.hidden_prices == 0
        }, {
            header: t('Sell price'),
            dataIndex: 'sessionbill',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 3,
            hidden: App.user.hidden_prices == 1,
            hideable: App.user.isAdmin && App.user.hidden_prices == 0
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
            hidden: App.user.isClient,
            hideable: App.user.isAdmin
        }];
        me.callParent(arguments);
    }
});