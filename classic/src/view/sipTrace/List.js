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
Ext.define('MBilling.view.sipTrace.List', {
    extend: 'Ext.ux.grid.Panel',
    requires: ['MBilling.view.sipTrace.Filter'],
    alias: 'widget.siptracelist',
    store: 'SipTrace',
    initComponent: function () {
        var me = this;
        me.buttonImportCsv = false
        me.buttonCsv = false;
        me.allowPrint = false;
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.allowUpdate = false;
        me.collapsedExtraFilters = false;
        me.allowDelete = false;
        me.extraButtons = [{
            text: me.textDelete,
            glyph: me.glyphDelete,
            handler: 'onDeleteLog',
            width: 120
        }, {
            text: t('Start capture'),
            iconCls: 'icon-save-all',
            handler: 'onNewFilter',
            width: 120
        }, {
            text: t('Stop capture'),
            iconCls: 'icon-clean-filter',
            handler: 'onClearAll',
            width: 120
        }, {
            text: t('Export file'),
            iconCls: 'icon-save-all',
            handler: 'onExportPcap',
            width: 150
        }, {
            text: t('Details'),
            glyph: icons.info,
            handler: 'onDetails',
            width: 150
        }];
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            menuDisabled: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Method'),
            dataIndex: 'method',
            flex: 3
        }, {
            header: t('Call ID'),
            dataIndex: 'callid',
            flex: 7
        }, {
            header: t('SIP To'),
            dataIndex: 'sipto',
            flex: 5
        }, {
            header: t('Source'),
            dataIndex: 'fromip',
            renderer: function (value) {
                value = value == window.myIP ? '<b><font color="blue">' + value + '</font></b>' : value;
                return value
            },
            flex: 3
        }, {
            header: t('Destination'),
            dataIndex: 'toip',
            renderer: function (value) {
                value = value == window.myIP ? '<b><font color="blue">' + value + '</font></b>' : value;
                return value
            },
            flex: 4
        }, {
            header: t('Head'),
            dataIndex: 'head',
            flex: 3,
            menuDisabled: true,
            hidden: true,
            hideable: true
        }]
        me.callParent(arguments);
    }
});