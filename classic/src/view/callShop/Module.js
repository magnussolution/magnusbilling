Ext.define('MBilling.view.callShop.Module', {
    extend: 'Ext.form.Panel',
    alias: 'widget.callshopmodule',
    controller: 'callshop',
    resizable: false,
    autoShow: true,
    header: false,
    autoScroll: true,
    initComponent: function() {
        var me = this;
        me.layout = {
            type: 'table',
            columns: 3,
            tdAttrs: {
                style: 'padding: 3px; vertical-align: top;'
            }
        };
        me.defaults = {
            xtype: 'panel',
            height: 268,
            width: ((Ext.Element.getViewportWidth() - 200) / 3) - 10,
            closable: false,
            collapsible: true,
            frame: true
        };
        me.items = me.onMountPanels();
        storeCallShop = Ext.create('MBilling.store.CallShop', {
            remoteSort: false
        });
        if (!App.user.isClient) {
            me.callParent(arguments);
            return;
        } else {
            me.handler = setInterval(function() {
                storeCallShop.load({
                    callback: function(r) {
                        me.onShowCabins(r);
                    }
                });
            }, 5000);
            me.callParent(arguments);
            storeCallShop.load({
                callback: function(r) {
                    me.onShowCabins(r);
                }
            });
        }
    },
    onMountPanels: function() {
        me = this,
            items = [];
        if (!App.user.isClient) {
            return;
        }
        for (i = 1; i <= 12; i++) {
            items.push({
                xtype: 'tabpanel',
                reference: 'tab' + i,
                title: t('Booth') + i,
                collapsed: i > 3,
                items: [{
                    xtype: 'form',
                    reference: 'cabina' + i,
                    title: t('Booth'),
                    bodyPadding: 10,
                    defaults: {
                        xtype: 'displayfield',
                        labelWidth: 85
                    },
                    items: [{
                        name: 'id',
                        hidden: true
                    }, {
                        name: 'name',
                        hidden: true
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        items: [{
                            xtype: 'displayfield',
                            name: 'callshopnumber',
                            fieldLabel: t('Number'),
                            labelAlign: 'right',
                            labelWidth: 50,
                            renderer: function(value) {
                                return '<span style="font-weight:bold;">' + value + '</span>';
                            },
                            flex: 2
                        }, {
                            xtype: 'displayfield',
                            labelAlign: 'right',
                            labelWidth: 90,
                            readOnly: true,
                            fieldLabel: t('Total'),
                            name: 'total',
                            labelStyle: "font-size:18px!important;font-weight:bold;",
                            renderer: function(value) {
                                format = Ext.util.Format.numberRenderer('0.' + App.user.decimalPrecision);
                                return '<span style="font-size:18px!important;font-weight:bold;">' + App.user.currency + ' ' + format(value) + '</span>';
                            },
                            flex: 3
                        }]
                    }, {
                        fieldLabel: t('Destination'),
                        name: 'destination'
                    }, {
                        fieldLabel: t('Price minute'),
                        name: 'price_min',
                        renderer: Helper.Util.formatMoneyDecimal
                    }, {
                        fieldLabel: t('Duration'),
                        name: 'callshoptime',
                        renderer: Helper.Util.formatsecondsToTime
                    }, {
                        xtype: 'toolbar',
                        border: false,
                        hidden: me.hideBbar,
                        dock: 'bottom',
                        items: [{
                            bodyPadding: 10,
                            width: '33%',
                            text: t('Charge'),
                            itemId: 'charge',
                            iconCls: 'buycredit',
                            handler: 'sendActionNew',
                            reference: 'cobrar_' + i,
                            urlAction: 'index.php/callShop/cobrar'
                        }, {
                            width: '33%',
                            text: t('Release'),
                            itemId: 'release',
                            iconCls: 'release',
                            handler: 'sendActionNew',
                            reference: 'liberar_' + i,
                            urlAction: 'index.php/callShop/liberar',
                            hidden: window.releaseButton
                        }, {
                            width: '33%',
                            text: t('Print'),
                            itemId: 'print',
                            iconCls: 'icon-print',
                            handler: 'reportCallshopClientNew',
                            reference: 'report_' + i,
                            urlAction: 'index.php/callShop/report'
                        }]
                    }]
                }, {
                    reference: 'history_' + i,
                    tooltip: 'history_' + i,
                    iconCls: 'x-fa fa-refresh',
                    title: t('History'),
                    autoScroll: true,
                    items: [{
                        xtype: 'callshopcdrlist',
                        buttonCsv: false,
                        autoScroll: true,
                        filterableColumns: false,
                        buttonCleanFilter: false,
                        autoLoadStore: false,
                        border: false,
                        allowCreate: false,
                        allowUpdate: false,
                        allowDelete: false,
                        buttonUpdateLot: false,
                        pagination: false,
                        allowPrint: false,
                        columnsHide: ['cabina', 'destination', 'status', 'buycost', 'markup', 'date'],
                        store: Ext.create('MBilling.store.CallShopCdr', {
                            remoteFilter: true
                        })
                    }],
                    tabConfig: {
                        listeners: {
                            click: function(tab) {
                                id = tab.tooltip.split("_");
                                panel = me.lookupReference('history_' + id[1]);
                                storeCallshopcdr = panel.down('callshopcdrlist').getStore();
                                filterCabina = [{
                                    type: 'string',
                                    comparison: 'eq',
                                    value: me.lookupReference('cabina' + id[1]).getForm().findField('name').getValue(),
                                    field: 'cabina'
                                }, {
                                    type: 'list',
                                    value: [0],
                                    field: 'status'
                                }];
                                storeCallshopcdr.load({
                                    filter: filterCabina,
                                    params: {
                                        filters: Ext.encode(filterCabina)
                                    },
                                    limit: 70
                                });
                            }
                        }
                    }
                }]
            });
        }
        return items;
    },
    onShowCabins: function(rows) {
        me = this,
            i = 1;
        Ext.each(rows, function(row) {
            if (tab = me.lookupReference('tab' + i)) {
                name = row.data.callerid.length < 1 ? row.data.name : row.data.callerid;
                status = Helper.Util.formatBooleanFree(row.data.status);
                tab.setTitle(t('Booth') + ' ' + i + ' - ' + name + ' ' + status);
                tab.setVisible(true);
                me.lookupReference('cabina' + i).getForm().loadRecord(row);
            }
            i++;
        });
        for (i = rows.length + 1; i <= 12; i++) {
            tab = me.lookupReference('tab' + i).setVisible(false);
        }
    }
});