/**
 * Classe que define a lista de "Sip"
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
Ext.define('MBilling.view.sip.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.siplist',
    store: 'Sip',
    fieldSearch: 'name',
    initComponent: function () {
        var me = this;
        me.extraButtons = [{
            text: t('Bulk SIP'),
            handler: 'onBulk',
            width: App.user.language == 'en' ? 80 : 110,
            disabled: false,
            hidden: App.user.isClient || !me.allowCreate || window.isTablet
        }];

        if (App.user.isAdmin) {
            me.buttonImportCsv = true;
        }

        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Status'),
            dataIndex: 'lineStatus',
            width: 3,
            menuDisabled: true,
            renderer: Helper.Util.formatStatusImage,
            hidden: window.isTablet
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 4
        }, {
            header: t('SIP user'),
            dataIndex: 'name',
            flex: 4
        }, {
            header: t('Host'),
            dataIndex: 'host',
            flex: 4,
            hidden: window.isTablet
        }, {
            header: t('Codec'),
            dataIndex: 'allow',
            flex: 5,
            hidden: window.isTablet
        }, {
            header: t('Group'),
            dataIndex: 'sip_group',
            hidden: true,
            flex: 3
        }, { //HIDDEN COLUNNS
            header: t('Context'),
            dataIndex: 'context',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Record call'),
            dataIndex: 'record_call',
            renderer: Helper.Util.formattyyesno,
            filter: {
                type: 'list',
                options: [
                    [0, t('No')],
                    [1, t('Yes')]
                ]
            },
            flex: 2,
            hidden: true,
            hideable: !App.user.isClient
        }, {
            header: t('CallerID'),
            dataIndex: 'callerid',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('NAT'),
            dataIndex: 'nat',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Directmedia'),
            dataIndex: 'directmedia',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Qualify'),
            dataIndex: 'qualify',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Dtmfmode'),
            dataIndex: 'dtmfmode',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Insecure'),
            dataIndex: 'insecure',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Type'),
            dataIndex: 'type',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Allowtransfer'),
            dataIndex: 'allowtransfer',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Call limit'),
            dataIndex: 'calllimit',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Description'),
            dataIndex: 'description',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 4
        }, {
            xtype: 'templatecolumn',
            tpl: '{idTrunkGroupname}',
            header: t('Trunk groups'),
            dataIndex: 'id_trunk_group',
            comboFilter: 'trunkgroupcombo',
            flex: 3,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Alias'),
            dataIndex: 'alias',
            hidden: true,
            hideable: App.user.isAdmin,
            flex: 2
        }, {
            header: t('CNL zone'),
            dataIndex: 'cnl',
            hidden: true,
            hideable: App.user.isAdmin && App.user.language == 'pt_BR',
            flex: 2
        }, {
            header: t('AMD'),
            dataIndex: 'amd',
            hidden: true,
            hideable: window.dma && window.dialC,
            flex: 2,
            renderer: function (value) {
                return value == 1 ? t('Enable') : t('Disable');
            },
            filter: {
                type: 'list',
                options: [
                    ['0', t('Disable')],
                    ['1', t('Before answer')],
                    ['2', t('After answer')],
                    ['3', t('Both')]
                ]
            }
        }];
        me.callParent(arguments);
    }
});