/**
 * Classe que define a lista de "MethodPay"
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
 * 04/07/2012
 */
Ext.define('MBilling.view.methodPay.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.methodpaylist',
    store: 'MethodPay',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Payment methods'),
            dataIndex: 'payment_method',
            flex: 2
        }, {
            header: t('Country'),
            dataIndex: 'country',
            flex: 2
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 2
        }, {
            header: t('Active'),
            dataIndex: 'active',
            flex: 1,
            comboRelated: 'booleancombo',
            renderer: Helper.Util.formatBooleanActive,
            filter: {
                type: 'list',
                options: [
                    [1, t('Active')],
                    [0, t('Inactive')]
                ]
            }
        }];
        me.callParent(arguments);
    }
});