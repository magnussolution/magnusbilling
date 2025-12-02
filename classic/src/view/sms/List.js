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
Ext.define('MBilling.view.sms.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.smslist',
    store: 'Sms',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.allowUpdate = false;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
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
            header: t('Status'),
            dataIndex: 'status',
            renderer: Helper.Util.formatBooleanSms,
            comboRelated: 'statuscombo',
            flex: 2,
            filter: {
                type: 'list',
                options: [
                    [0, t('Error')],
                    [1, t('Sent')],
                    [2, t('Received')]
                ]
            }
        }, {
            header: t('Destination'),
            dataIndex: 'telephone',
            flex: 2
        }, {
            header: t('Date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'date',
            flex: 5
        }, {
            header: t('Description'),
            dataIndex: 'sms',
            hidden: true,
            hideable: true,
            flex: 6
        }, {
            header: t('From'),
            dataIndex: 'sms_from',
            flex: 2
        }, {
            header: t('Provider result'),
            dataIndex: 'result',
            hidden: true,
            hideable: App.user.isAdmin,
            flex: 2
        }]
        me.callParent(arguments);
    }
});