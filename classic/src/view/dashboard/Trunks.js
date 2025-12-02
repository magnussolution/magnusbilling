Ext.define('MBilling.view.dashboard.Trunks', {
    extend: 'Ext.Panel',
    xtype: 'trunks',
    requires: ['MBilling.view.dashboard.TrunkChart', 'Ext.chart.series.Pie', 'Ext.chart.series.sprite.PieSlice', 'Ext.chart.interactions.Rotate'],
    cls: 'service-type shadow',
    height: 320,
    bodyPadding: 15,
    title: t('Trunks'),
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    initComponent: function() {
        var me = this;
        me.items = [{
            width: 140,
            items: [{
                xtype: 'trunkchart',
                fieldValue: 'nbcall'
            }, {
                xtype: 'trunkchart',
                fieldValue: 'lucro'
            }]
        }, {
            reference: 'trunkDashboardFields',
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'component'
            }, {
                xtype: 'progressbar',
                cls: 'bottom-indent service-finance',
                height: 4,
                minHeight: 4,
                value: 0
            }, {
                xtype: 'component'
            }, {
                xtype: 'progressbar',
                cls: 'bottom-indent service-research',
                height: 4,
                minHeight: 4,
                value: 0
            }, {
                xtype: 'component'
            }, {
                xtype: 'progressbar',
                cls: 'bottom-indent service-marketing',
                height: 4,
                value: 0
            }, {
                xtype: 'component',
                html: ''
            }]
        }]
        me.callParent(arguments);
    }
});