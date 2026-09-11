/**
 * Classe que define a lista de "Call"
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
Ext.define('MBilling.view.call.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.calllist',
    store: 'Call',
    standardSubmit: true,
    initComponent: function () {
        var me = this;
        me.allowPrint = false;
        me.buttonUpdateLot = false;
        me.fieldSearch = App.user.isAdmin ? 'idUser.username' : '';
        me.grupableColumns = false;
        me.paginationButton = ['-', {
            xtype: 'button',
            width: '120',
            text: t('Show total'),
            handler: 'onShowTotal',
            hidden: !App.user.isAdmin,
            cls: 'x-btn-text-icon details'
        }, {
                xtype: 'tbtext',
                reference: 'tbTextTotal'
            }];
        me.extraButtons = [{
            text: t('Download REC'),
            iconCls: 'call',
            handler: 'onRecordCall',
            disabled: false,
            width: 130
        }];
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            xtype: 'actioncolumn',
            width: 26,
            sortable: false,
            menuDisabled: true,
            header: t(''),
            dataIndex: 'id',
            items: [{
                iconCls: 'icon-play',
                tooltip: t('Download REC'),
                handler: 'onDownloadClick'
            }],
            hidden: App.user.show_playicon_cdr == 0,
            hideable: true
        }, {
            header: t('Date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'starttime',
            flex: 4,
            hidden: window.isTablet
        }, {
            header: t('Sip user'),
            dataIndex: 'src',
            flex: 2,
            hidden: window.isTablet
        }, {
            header: t('CallerID'),
            dataIndex: 'callerid',
            flex: 2,
            hidden: window.isTablet
        }, {
            header: t('Number'),
            dataIndex: 'calledstation',
            filter: {
                type: 'string',
                warnContains: true
            },
            flex: 3
        }, {
            header: t('Destination'),
            dataIndex: 'idPrefixdestination',
            filter: {
                type: 'string',
                field: 'idPrefix.destination'
            },
            flex: 4,
            hidden: window.isTablet
        }, {
            header: t('Duration'),
            dataIndex: 'sessiontime',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 2
        }, {
            header: t('Real duration'),
            dataIndex: 'real_sessiontime',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 2,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }, {
            xtype: 'templatecolumn',
            tpl: '{idTrunktrunkcode}',
            header: t('Trunk'),
            dataIndex: 'id_trunk',
            comboFilter: 'trunkcombo',
            header: t('Trunk'),
            flex: 3,
            hidden: App.user.isClient || App.user.isAgent || window.isTablet,
            hideable: !App.user.isClient && !App.user.isAgent
        }, {
            header: t('Type'),
            dataIndex: 'sipiax',
            renderer: Helper.Util.formatCallType,
            flex: 2,
            filter: {
                type: 'list',
                options: [
                    [0, t('Standard')],
                    [1, t('PJSIP')],
                    [2, t('DID')],
                    [3, t('DID voip')],
                    [4, t('CallBack')],
                    [5, t('Voice Broadcasting')],
                    [6, 'SMS'],
                    [7, t('Transfer')],
                    [8, t('Queue')],
                    [9, t('IVR')]
                ]
            },
            hidden: window.isTablet
        }, { //oculta para cliente e revendedores
            header: t('Buy price'),
            dataIndex: 'buycost',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 3,
            hidden: App.user.isClient || App.user.isAgent || App.user.hidden_prices == 1,
            hideable: !App.user.isClient && !App.user.isAgent && App.user.hidden_prices == 0
        }, {
            header: t('Sell price'),
            dataIndex: 'sessionbill',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 3,
            hidden: App.user.isAgent || App.user.isClientAgent || App.user.hidden_prices == 1,
            hideable: !App.user.isAgent && !App.user.isClientAgent && App.user.hidden_prices == 0
        }, { //mostra o preço de compra de revendedor
            header: t('Buy price'),
            dataIndex: 'sessionbill',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 3,
            hidden: !App.user.isAgent,
            hideable: App.user.isAgent
        }, { //mostra o preço de venda de revendedor
            header: t('Sell price'),
            dataIndex: 'agent_bill',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 3,
            hidden: !App.user.isAgent,
            hideable: App.user.isAgent
        }, { //mostra o preço de venda para clientes de revendedor
            header: t('Sell price'),
            dataIndex: 'agent_bill',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 3,
            hidden: !App.user.isClientAgent,
            hideable: App.user.isClientAgent
        }, {
            header: t('Uniqueid'),
            dataIndex: 'uniqueid',
            flex: 3,
            hidden: true,
            hideable: true
        }, {
            xtype: 'templatecolumn',
            tpl: '{idPlanname}',
            header: t('Plan'),
            dataIndex: 'id_plan',
            comboFilter: 'plancombo',
            flex: 3,
            hidden: true
        }, {
            xtype: 'templatecolumn',
            tpl: '{idCampaignname}',
            header: t('Campaign'),
            dataIndex: 'id_campaign',
            comboFilter: 'campaigncombo',
            flex: 3,
            hidden: true,
            hideable: !App.user.isClient
        }, {
            xtype: 'templatecolumn',
            tpl: '{idServername}',
            header: t('Server'),
            dataIndex: 'id_server',
            comboFilter: 'serverscombo',
            flex: 3,
            hidden: !App.user.isAdmin || window.isTablet,
            hideable: App.user.isAdmin
        }]
        me.callParent(arguments);
    }
});