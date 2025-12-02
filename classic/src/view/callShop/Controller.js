/**
 * Classe que define a lista de "CallShopCdr"
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
 * 01/10/2013
 */
Ext.define('MBilling.view.callShop.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.callshop',
    sendActionNew: function(btn) {
        var me = this;
        btn.disable();
        id = btn.reference.split("_");
        getForm = me.lookupReference('cabina' + id[1]).getForm();
        Ext.Ajax.request({
            url: btn.urlAction + '?id=' + getForm.findField('id').getValue(),
            success: function(r) {
                r = Ext.decode(r.responseText);
                if (r.success) {
                    Ext.ux.Alert.alert(me.titleSuccess, r[me.nameMsgRequest], 'success');
                } else {
                    Ext.ux.Alert.alert(me.titleError, errors, 'error');
                }
            }
        });
        btn.enable();
        storeCallShop = Ext.create('MBilling.store.CallShop', {
            remoteSort: false
        });
        storeCallShop.load({
            callback: function(r) {
                me.onShowCabins(r, id[1], getForm);
            }
        });
    },
    onShowCabins: function(rows, id, getForm) {
        me = this;
        row = rows[id - 1];
        if (tab = me.lookupReference('tab' + id)) {
            name = row.data.callerid.length < 1 ? row.data.name : row.data.callerid;
            status = Helper.Util.formatBooleanFree(row.data.status);
            tab.setTitle(t('Booth') + ' ' + id + ' - ' + name + ' ' + status);
            tab.setVisible(true);
            getForm.loadRecord(row);
        }
    },
    reportCallshopClientNew: function(btn) {
        var me = this;
        id = btn.reference.split("_");
        getForm = me.lookupReference('cabina' + id[1]).getForm();
        columns = Ext.encode([{
            header: t('Number'),
            dataIndex: 'calledstation'
        }, {
            header: t('Time'),
            dataIndex: 'sessiontime'
        }, {
            header: t('Total'),
            dataIndex: 'price'
        }]);
        filter = Ext.encode([{
            type: 'string',
            comparison: 'eq',
            value: getForm.findField('name').getValue(),
            field: 'cabina'
        }, {
            type: 'list',
            value: [0],
            field: 'status'
        }]);
        values = 'columns=' + columns + '&filter=' + filter + '&sort=[]&group=&orientation=P';
        url = 'index.php/callShopCdr/report/?' + values;
        window.open(url);
    },
    sendAction: function(btn) {
        var me = this,
            selected = me.list.getSelectionModel().getSelection()[0],
            filterCabina = Ext.encode([{
                type: 'string',
                comparison: 'eq',
                value: selected.get('Name'),
                field: 'cabina'
            }, {
                type: 'list',
                value: [0],
                field: 'status'
            }]);
        me.formPanel.setLoading(true);
        Ext.Ajax.request({
            url: btn.urlAction,
            params: {
                filter: filterCabina
            },
            success: function(r) {
                r = Ext.decode(r.responseText);
                var errors = Helper.Util.convertErrorsJsonToString(r[me.nameMsgRequest]),
                    storeCabinas = me.list.getStore(),
                    selModelCabinas = me.list.getSelectionModel();
                if (r.success) {
                    me.onEdit();
                    storeCabinas.load({
                        callback: function() {
                            selModelCabinas.select(storeCabinas.findExact('id', selected.get('id')));
                            me.formPanel.setLoading(false);
                        }
                    });
                    Ext.ux.Alert.alert(me.titleSuccess, r[me.nameMsgRequest], 'success');
                } else {
                    Ext.ux.Alert.alert(me.titleError, errors, 'error');
                    me.formPanel.setLoading(false);
                    selModelCabinas.select(storeCabinas.findExact('id', selected.get('id')));
                }
            }
        });
    },
    onEdit: function() {
        if (!this.list.getSelectionModel().getSelection().length) {
            return;
        }
        var me = this,
            selected = me.list.getSelectionModel().getSelection()[0],
            filterCabina = [{
                type: 'string',
                comparison: 'eq',
                value: selected.get('Name'),
                field: 'cabina'
            }, {
                type: 'list',
                value: [0],
                field: 'status'
            }],
            storeCallshopcdr = me.formPanel.down('callshopcdrlist').getStore(),
            tbtextPriceSum = me.formPanel.down('#priceSum'),
            initFilter = storeCallshopcdr.proxy.extraParams.filter,
            btnCobrar = me.formPanel.down('#charge'),
            btnLiberar = me.formPanel.down('#release'),
            btnPrint = me.formPanel.down('#print');
        tbtextPriceSum.setText('<b> ' + t('Sum to pay') + ' 0.00');
        me.formPanel.expand();
        btnCobrar.enable();
        btnLiberar.enable();
        btnPrint.enable();
        storeCallshopcdr.proxy.extraParams.filter = filterCabina;
        storeCallshopcdr.load({
            callback: function(records) {
                if (records) records[0] && tbtextPriceSum.setText('<b> ' + t('Total to pay') + ' ' + App.user.currency + ' ' + records[0].get('priceSum') + '</b> ');
            }
        });
        console.log(selected.get('CallerID') + ', ' + selected.get('Name'));
        storeCallshopcdr.defaultFilter = initFilter;
        me.showHideFields();
        me.focusFirstField();
    },
    reportCallshopClient: function(btn) {
        var me = this,
            desktop = window.isDesktop && App.desktop,
            tabPanel = !window.isDesktop && me.list.module.ownerCt,
            store = me.formPanel.down('callshopcdrlist').getStore(),
            sorters = store.sorters.items,
            selected = me.list.getSelectionModel().getSelection()[0],
            filter = Ext.encode([{
                type: 'string',
                comparison: 'eq',
                value: selected.get('Name'),
                field: 'cabina'
            }, {
                type: 'list',
                value: [0],
                field: 'status'
            }]),
            group = me.store.getGroupField(),
            gridColumns = me.formPanel.down('callshopcdrlist').columns,
            orientation = 'desc',
            urlReport = me.formPanel.down('callshopcdrlist').getStore().getProxy().api.report,
            tabOpen,
            sort = [],
            columns = [];
        Ext.each(sorters, function(itemSort) {
            sort.push(itemSort.property + ' ' + (itemSort.direction || 'ASC'));
        });
        Ext.each(gridColumns, function(column) {
            if (column.hidden === false && column.isCheckerHd !== true) {
                if (column.dataIndex === group) {
                    columns.splice(0, 0, {
                        header: column.text,
                        dataIndex: column.dataIndex
                    });
                } else {
                    columns.push({
                        header: column.text,
                        dataIndex: column.dataIndex
                    });
                }
            }
        });
        values = 'columns=' + Ext.encode(columns) + '&filter=' + filter + '&sort=' + Ext.encode(sort) + '&group=' + group + '&orientation=' + orientation;
        url = 'index.php/callShopCdr/report/?' + values;
        window.open(url);
    }
});