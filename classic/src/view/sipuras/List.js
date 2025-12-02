/**
 * Classe que define a lista de "Sipuras"
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
 * 01/08/2012
 */
Ext.define('MBilling.view.sipuras.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.sipuraslist',
    store: 'Sipuras',
    initComponent: function() {
        var me = this;
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
            }
        }, {
            header: t('Serial'),
            dataIndex: 'nserie'
        }, {
            header: t('MAC'),
            dataIndex: 'macadr'
        }, {
            header: t('Username 1'),
            dataIndex: 'User_ID_1'
        }, {
            header: t('Username 2'),
            dataIndex: 'User_ID_2'
        }, {
            header: t('Last IP'),
            dataIndex: 'last_ip'
        }, {
            header: t('Description'),
            dataIndex: 'obs'
        }, {
            header: t('Last register'),
            dataIndex: 'fultmov',
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s')
        }];
        me.callParent(arguments);
    }
});