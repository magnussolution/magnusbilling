/**
 * Classe que define a lista de "Callerid"
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
Ext.define('MBilling.view.logUsers.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.loguserslist',
    store: 'LogUsers',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.allowDelete = false;
        me.allowCreate = false;
        me.allowUpdate = false;
        me.columns = [{
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 4,
            hidden: App.user.isOperator,
            hideable: !App.user.isOperator
        }, {
            header: t('Action'),
            dataIndex: 'idLogActionsname',
            renderer: Helper.Util.translate,
            filter: {
                type: 'string',
                field: 'idLogActions.name'
            },
            flex: 3
        }, {
            header: t('Description'),
            dataIndex: 'description',
            flex: 7
        }, {
            header: t('IP'),
            dataIndex: 'ip',
            flex: 4
        }, {
            header: t('Date'),
            renderer: Helper.Util.formatDateTime,
            dataIndex: 'date',
            flex: 4
        }]
        me.callParent(arguments);
    }
});