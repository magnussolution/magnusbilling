/**
 * Classe que define a lista de "Firewall"
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
Ext.define('MBilling.view.firewall.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.firewalllist',
    store: 'Firewall',
    initComponent: function () {
        var me = this;
        me.textDelete = 'Unban';
        me.buttonCsv = false;
        me.buttonUpdateLot = false;
        me.buttonCleanFilter = true;
        me.allowPrint = false;
        me.allowCreate = true;
        me.allowDelete = true;
        me.buttonNewWidth = 120;
        me.columns = [{
            header: t('IP'),
            dataIndex: 'ip',
            flex: 4
        }, {
            header: t('Type'),
            dataIndex: 'jail',
            flex: 4
        }, {
            header: t('Action'),
            dataIndex: 'action',
            renderer: Helper.Util.formatFail2banAction,
            filter: {
                type: 'list',
                options: [
                    [0, t('Temp ban')],
                    [1, t('Permanent ban')],
                    [3, t('Unban')],
                    [5, t('IgnoreIP')]
                ]
            },
            flex: 2
        }, {
            header: t('Server'),
            dataIndex: 'idServername',
            filter: {
                type: 'string',
                field: 'idServer.name'
            },
            flex: 3,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }]
        me.callParent(arguments);
    }
});