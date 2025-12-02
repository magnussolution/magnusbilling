/**
 * Classe que define a lista de "servicesUse"
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
 * 24/09/2017
 */
Ext.define('MBilling.view.servicesUse.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.servicesuselist',
    store: 'ServicesUse',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.buttonPrint = false;
        me.buttonCsv = false;
        me.buttonNewHeight = App.user.isAdmin ? 25 : 50,
            me.textNew = App.user.isAdmin ? t('Add new service') : '<b><font color=green>' + t('Buy new service') + '</font></b>';
        me.buttonNewWidth = 175;
        me.extraButtons = [{
            text: '<font color=red>' + t('Cancel service') + '</font>',
            handler: 'onCancelService',
            disabled: true,
            iconCls: 'buycredit',
            width: 170,
            hidden: !me.allowDelete,
            reference: 'cancelService'
        }, {
            text: '<font color=blue>' + t('Pay pendings services') + '</font>',
            handler: 'onPayServiceLink',
            disabled: true,
            iconCls: 'buycredit',
            width: 190,
            reference: 'payService'
        }];
        me.allowDelete = false;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Services'),
            dataIndex: 'idServicesname',
            flex: 5
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
            header: t('Month payed'),
            dataIndex: 'month_payed',
            flex: 2
        }, {
            header: t('Price'),
            dataIndex: 'idServicesprice',
            renderer: Helper.Util.formatMoneyDecimal2,
            flex: 2
        }, {
            header: t('Active'),
            dataIndex: 'status',
            renderer: Helper.Util.formatBooleanActive,
            filter: {
                type: 'list',
                options: [
                    [1, t('Active')],
                    [2, t('Pending')],
                    [0, t('Inactivated')]
                ]
            },
            flex: 2
        }, {
            header: t('Reservation date'),
            renderer: Helper.Util.formatDateTime,
            dataIndex: 'reservationdate',
            flex: 5
        }, {
            header: t('Release date'),
            renderer: Helper.Util.formatDateTime,
            dataIndex: 'releasedate',
            flex: 5
        }, {
            header: t('Next due date'),
            renderer: Helper.Util.formatDateTime,
            dataIndex: 'next_due_date',
            flex: 5
        }]
        me.callParent(arguments);
    }
});