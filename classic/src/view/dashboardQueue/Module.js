/**
 * Classe que define o panel de "dashboardQueue"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.dashboardQueue.Module', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dashboardqueuemodule',
    autoShow: true,
    header: false,
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'dashboard',
            width: !window.isDesktop ? width : 'NULL',
            header: false,
            listeners: {
                activate: 'setRunnerInfoSystem'
            },
            glyph: icons.home,
            title: t('Home'),
            stateful: false,
            items: [{
                columnWidth: 1 / 2,
                items: [{
                    title: t('Queue monitor'),
                    items: {
                        xtype: 'queuedashboardlist'
                    },
                    height: window.heightView
                }]
            }, {
                columnWidth: 1 / 2,
                items: [{
                    title: t('Agent monitor'),
                    iconCls: 'icon-chart-column',
                    glyph: undefined,
                    items: {
                        xtype: 'queuememberdashboardlist'
                    },
                    height: window.heightView
                }]
            }]
        }];
        me.callParent(arguments);
    }
});