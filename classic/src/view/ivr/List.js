/**
 * Classe que define a lista de "Diddestination"
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
Ext.define('MBilling.view.ivr.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.ivrlist',
    store: 'Ivr',
    fieldSearch: 'name',
    initComponent: function() {
        var me = this;
        me.allowPrint = false;
        me.buttonCsv = false;
        me.extraButtons = [{
            text: t('Delete audios'),
            handler: 'onDeleteAudio',
            which: 100,
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
        }]
        me.callParent(arguments);
    }
});