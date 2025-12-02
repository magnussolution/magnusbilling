/**
 * Classe que define a lista de "Did"
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
 * 24/09/2012
 */
Ext.define('MBilling.view.did.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.didlist',
    store: 'Did',
    fieldSearch: 'did',
    buttonImportCsv: true,
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.extraButtons = [{
            text: t('Release DID'),
            iconCls: 'icon-delete',
            handler: 'onRelease',
            disabled: false
        }, {
            text: t('Bulk DID'),
            iconCls: '',
            handler: 'onBulk',
            hidden: !App.user.isAdmin || window.isTablet
        }];
        if (App.user.isClient) {
            me.buttonImportCsv = false;
        }
        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('DID'),
            dataIndex: 'did',
            flex: 4
        }, {
            header: t('Reserved'),
            dataIndex: 'reserved',
            renderer: Helper.Util.formattyyesno,
            flex: 2,
            filter: {
                type: 'list',
                options: [
                    [1, t('Yes')],
                    [0, t('No')]
                ]
            }
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            hidden: App.user.isClient,
            hideable: !App.user.isClient,
            flex: 3
        }, {
            header: t('Status'),
            dataIndex: 'activated',
            renderer: Helper.Util.formatBooleanActive,
            flex: 2,
            filter: {
                type: 'list',
                options: [
                    [1, t('Active')],
                    [0, t('Inactive')]
                ]
            },
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }, {
            header: t('Setup price'),
            dataIndex: 'connection_charge',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 3
        }, {
            header: t('Monthly price'),
            dataIndex: 'fixrate',
            renderer: Helper.Util.formatMoneyDecimal4,
            flex: 3
        }, {
            header: t('Time used'),
            renderer: Helper.Util.formatsecondsToTime,
            dataIndex: 'secondusedreal',
            flex: 3
        }, {
            header: t('Country'),
            dataIndex: 'country',
            flex: 2
        }, {
            header: t('Description'),
            dataIndex: 'description',
            hidden: true,
            hideable: App.user.isAdmin,
            flex: 5
        }, {
            xtype: 'templatecolumn',
            tpl: '{idServername}',
            header: t('Server'),
            dataIndex: 'id_server',
            comboFilter: 'serverscombo',
            flex: 3,
            hidden: true,
            hideable: App.user.isAdmin
        }]
        me.callParent(arguments);
    }
});