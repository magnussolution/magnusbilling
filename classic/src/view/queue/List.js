/**
 * Classe que define a lista de "Queue"
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
Ext.define('MBilling.view.queue.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.queuelist',
    store: 'Queue',
    fieldSearch: 'name',
    initComponent: function() {
        var me = this;
        me.buttonCsv = false;
        me.allowPrint = false;
        me.buttonUpdateLot = false;
        me.extraButtons = [{
            text: t('Reset queue stats'),
            iconCls: 'call',
            handler: 'onResetQueueStats',
            disabled: false,
            hidden: !App.user.isAdmin || !me.allowDelete
        }, {
            text: t('Delete musiconhold'),
            iconCls: 'call',
            handler: 'onDeleteMusic',
            disabled: false,
            hidden: !App.user.isAdmin || !me.allowDelete
        }];
        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Name'),
            dataIndex: 'name',
            flex: 4
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 4,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }, {
            header: t('Strategy'),
            dataIndex: 'strategy',
            flex: 4
        }, {
            header: t('Talk time'),
            dataIndex: 'var_talktime',
            flex: 3
        }, {
            header: t('Total calls'),
            dataIndex: 'var_totalCalls',
            flex: 3
        }, {
            header: t('Answered'),
            dataIndex: 'var_answeredCalls',
            flex: 3
        }]
        me.callParent(arguments);
    }
});