/**
 * Classe que define a lista de "CallShop"
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
Ext.define('MBilling.view.callShop.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.callshoplist',
    store: 'CallShop',
    viewConfig: {
        loadMask: false,
        emptyText: '<center class="grid-empty">' + t('No record found') + '</center>',
        getRowClass: function(record) {
            if (App.user.l == 'callshop') {
                if (record.get('status') == 1) return 'callshoFree';
                else if (record.get('status') == 0) return 'callshoBlock';
                else if (record.get('status') == 2) return 'callshoInUse';
                else if (record.get('status') == 3) return 'callshoInCall';
            };
        }
    },
    refreshTime: 4,
    initComponent: function() {
        var me = this;
        me.buttonCsv = false;
        me.buttonUpdateLot = false;
        me.allowCreate = true;
        me.allowUpdate = true;
        me.allowDelete = true;
        me.allowCreate = false;
        me.allowUpdate = false;
        me.allowDelete = false;
        me.allowPrint = false;
        me.buttonDeleteWidth = 140;
        me.refreshTime = (localStorage && localStorage.getItem('callshopfresh')) || me.refreshTime;
        me.extraButtons = [{
            xtype: 'numberfield',
            field: 'jmlhBrg',
            fieldLabel: t('Refresh rate'),
            editable: false,
            minValue: 3,
            labelWidth: 90,
            width: 150,
            selectOnFocus: true,
            allowDecimals: true,
            decimalPrecision: 2,
            value: me.refreshTime,
            listeners: {
                change: function(field) {
                    if (field.value > 0) {
                        me.refreshTime = field.value;
                        localStorage.setItem('callshopfresh', field.value);
                    };
                }
            }
        }];
        me.columns = [{
            header: t('Booth'),
            dataIndex: 'callerid',
            flex: 4
        }, {
            header: t('Status'),
            dataIndex: 'status',
            renderer: Helper.Util.formatBooleanFree,
            flex: 3,
            filter: {
                type: 'list',
                options: [
                    [1, t('Free')],
                    [2, t('In use')],
                    [0, t('Blocked')],
                    [3, t('Calling')]
                ]
            }
        }, {
            header: t('Number'),
            dataIndex: 'callshopnumber',
            flex: 4
        }, {
            header: t('Destination'),
            dataIndex: 'callshopdestination',
            flex: 6
        }, {
            header: t('Duration'),
            dataIndex: 'callshoptime',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3
        }]
        me.sessionLoad = Ext.create('Ext.util.DelayedTask', function() {
            me.store.load();
        }, me);
        me.callParent(arguments);
        me.store.on('load', me.onLoadStore, me);
    },
    onLoadStore: function() {
        var me = this;
        me.onDeactivateModule();
        me.onActivateModule();
    },
    onRender: function() {
        var me = this;
        me.module.on('activate', me.onActivateModule, me);
        me.module.on('deactivate', me.onDeactivateModule, me);
        me.module.on('close', me.onCloseModule, me);
        me.callParent(arguments);
    },
    onActivateModule: function() {
        this.sessionLoad && this.sessionLoad.delay(this.refreshTime * 1000);
    },
    onDeactivateModule: function() {
        this.sessionLoad && this.sessionLoad.cancel();
    },
    onCloseModule: function() {
        this.onDeactivateModule();
        this.sessionLoad = null;
    }
});