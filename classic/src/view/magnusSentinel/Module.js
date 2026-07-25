/**
 * Módulo ExtJS nativo do Magnus Sentinel.
 */
Ext.define('MBilling.view.magnusSentinel.Module', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.magnussentinelmodule',
    controller: 'magnussentinel',
    requires: [
        'MBilling.store.MagnusSentinelIncident',
        'MBilling.view.magnusSentinel.Controller',
        'MBilling.view.magnusSentinel.Summary',
        'MBilling.view.magnusSentinel.List',
        'MBilling.view.magnusSentinel.Detail'
    ],
    border: false,
    layout: 'border',
    listeners: {
        afterrender: 'onRenderModule',
        beforedestroy: 'onDestroyModule'
    },
    initComponent: function () {
        var me = this;
        var mobile = window.isMobileLayout ||
            window.isTablet || window.isTablets;
        me.items = [{
            xtype: 'magnussentinelsummary'
        }, {
            xtype: 'magnussentinellist'
        }, {
            xtype: 'magnussentineldetail',
            region: mobile ? 'south' : 'east',
            width: mobile ? undefined : '43%',
            height: mobile ? '45%' : undefined,
            collapsed: true
        }];
        me.callParent(arguments);
    }
});
