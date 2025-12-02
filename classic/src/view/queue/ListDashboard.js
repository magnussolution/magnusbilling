Ext.define('MBilling.view.queue.ListDashboard', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.queuedashboardlist',
    store: 'QueueDashBoard',
    refreshTime: 5,
    selType: 'rowmodel',
    initComponent: function() {
        var me = this;
        me.refreshTime = (localStorage && localStorage.getItem('queuerefresh')) || me.refreshTime;
        me.extraButtons = [{
            text: t('Spy call'),
            iconCls: 'call',
            handler: function(field) {
                module = me.getView();
                console.log(module.panel.items.items[0].getSelectionModel().getSelection());
                Ext.widget('callonlinespycall', {
                    title: module.titleModule,
                    list: module.panel.items.items[0]
                });
            },
            width: 130,
            disabled: false,
            hidden: !window.multSpy
        }, {
            xtype: 'numberfield',
            field: 'jmlhBrg',
            fieldLabel: t('Refresh rate'),
            editable: false,
            minValue: 5,
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
                        localStorage.setItem('queuerefresh', field.value);
                    };
                }
            }
        }];
        me.columns = [{
            header: t('Channel'),
            hidden: true,
            dataIndex: 'channel',
            flex: 3
        }, {
            header: t('Queue'),
            dataIndex: 'queue_name',
            flex: 3
        }, {
            header: t('Agent'),
            dataIndex: 'agentName',
            flex: 3
        }, {
            header: t('Status'),
            dataIndex: 'status',
            renderer: Helper.Util.formatQueueState,
            flex: 4
        }, {
            header: t('CallerID'),
            dataIndex: 'callerId',
            flex: 4
        }, {
            header: t('Duration'),
            dataIndex: 'duration',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3
        }, {
            header: t('Wait time'),
            dataIndex: 'holdtime',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3
        }];
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
        if (Ext.isObject(me.module)) {
            me.module.on('activate', me.onActivateModule, me);
            me.module.on('deactivate', me.onDeactivateModule, me);
            me.module.on('close', me.onCloseModule, me);
        };
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