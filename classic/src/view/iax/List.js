/**
 * Classe que define a lista de "iax"
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
Ext.define('MBilling.view.iax.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.iaxlist',
    store: 'Iax',
    fieldSearch: 'username',
    initComponent: function() {
        var me = this;
        me.columns = me.columns || [{
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
            flex: 3
        }, {
            header: t('IAX user'),
            dataIndex: 'name',
            flex: 3
        }, {
            header: t('IAX pass'),
            dataIndex: 'secret',
            flex: 2
        }, {
            header: t('Host'),
            dataIndex: 'host',
            flex: 3
        }, {
            header: t('IP'),
            dataIndex: 'ipaddr',
            flex: 5
        }, { //HIDDEN COLUNNS
            header: t('Context'),
            dataIndex: 'context',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('CallerID'),
            dataIndex: 'callerid',
            hidden: true,
            hideable: !App.user.isClient,
            flex: 1
        }, {
            header: t('Codec'),
            dataIndex: 'allow',
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
        }];
        me.callParent(arguments);
    }
});