Ext.define('MBilling.view.queueMember.ListDashboard', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.queuememberdashboardlist',
    store: 'QueueMemberDashBoard',
    refreshTime: 5,
    selType: 'rowmodel',
    initComponent: function() {
        var me = this;
        me.refreshTime = (localStorage && localStorage.getItem('queueagentrefresh')) || me.refreshTime;
        me.extraButtons = [{
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
                        localStorage.setItem('queueagentrefresh', field.value);
                    };
                }
            }
        }];
        me.columns = [{
            header: t('Agent'),
            dataIndex: 'agentName',
            flex: 3
        }, {
            header: t('Queue'),
            dataIndex: 'idQueuename',
            flex: 5
        }, {
            header: t('Status'),
            dataIndex: 'agentStatus',
            renderer: Helper.Util.formatQueueAgentState,
            flex: 4
        }, {
            header: t('Number'),
            dataIndex: 'number',
            flex: 4
        }, {
            header: t('Calls'),
            dataIndex: 'totalCalls',
            flex: 2
        }, {
            header: t('Last call'),
            dataIndex: 'last_call',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3
        }];
        me.sessionLoad = Ext.create('Ext.util.DelayedTask', function() {
            me.store.load();
        }, me);
        me.callParent(arguments);
        if (window.isDesktop) {
            me.store.load();
        }
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