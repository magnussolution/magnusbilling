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
Ext.define('MBilling.view.smtps.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.smtpslist',
    store: 'Smtps',
    initComponent: function() {
        var me = this;
        me.extraButtons = [{
            text: t('Test SMTP'),
            iconCls: 'templatemail',
            handler: 'onSendEmail',
            disabled: false
        }];
        me.buttonUpdateLot = false;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Host'),
            dataIndex: 'host',
            flex: 4
        }, {
            header: t('Username'),
            dataIndex: 'username',
            flex: 2
        }, {
            header: t('Port'),
            dataIndex: 'port',
            flex: 3
        }, {
            header: t('Encryption'),
            dataIndex: 'encryption',
            flex: 3
        }]
        me.callParent(arguments);
    }
});