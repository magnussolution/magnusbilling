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
Ext.define('MBilling.view.callFailed.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.callfailedlist',
    store: 'CallFailed',
    initComponent: function() {
        var me = this;
        me.fieldSearch = App.user.isAdmin ? 'calledstation' : '';
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.grupableColumns = false;
        me.allowPrint = false;
        me.extraButtons = [{
            text: t('Call details'),
            glyph: icons.info,
            handler: 'onCallDetails',
            disabled: false,
            width: App.user.language == 'en' ? 130 : 170,
            hidden: !App.user.isAdmin
        }];
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'starttime',
            flex: 3
        }, {
            header: t('Sip user'),
            dataIndex: 'src',
            flex: 3
        }, {
            header: t('CallerID'),
            dataIndex: 'callerid',
            flex: 3,
            hidden: true,
            hideable: true
        }, {
            header: t('Number'),
            dataIndex: 'calledstation',
            flex: 3
        }, {
            header: t('Destination'),
            dataIndex: 'idPrefixdestination',
            flex: 4
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
            flex: 4,
            hidden: App.user.isClient || App.user.isAgent,
            hideable: !App.user.isClient && !App.user.isAgent
        }, {
            header: t('Status'),
            dataIndex: 'terminatecauseid',
            renderer: Helper.Util.formatDialStatus,
            flex: 2,
            filter: {
                type: 'list',
                options: [
                    [1, t('Answer')],
                    [2, t('Busy')],
                    [3, t('No answer')],
                    [4, t('Cancel')],
                    [5, t('Congestion')],
                    [6, t('Chanunavail')],
                    [7, t('Dontcall')],
                    [8, t('Torture')],
                    [9, t('Invalidargs')],
                    [10, t('Machine')]
                ]
            }
        }, {
            header: t('SIP code'),
            dataIndex: 'hangupcause',
            flex: 3
        }, {
            header: t('Uniqueid'),
            dataIndex: 'uniqueid',
            flex: 3,
            hidden: true,
            hideable: true
        }, {
            xtype: 'templatecolumn',
            tpl: '{idServername}',
            header: t('Server'),
            dataIndex: 'id_server',
            comboFilter: 'serverscombo',
            flex: 3,
            hidden: !App.user.isAdmin
        }]
        me.callParent(arguments);
    }
});