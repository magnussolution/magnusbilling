/**
 * The legend base class adapater for modern toolkit.
 */
Ext.define('Ext.chart.legend.LegendBase', {
    extend: 'Ext.dataview.DataView',
    config: {
        itemTpl: [
            '<span class=\"', Ext.baseCSSPrefix, 'legend-item-marker {[ values.disabled ? Ext.baseCSSPrefix + \'legend-item-inactive\' : \'\' ]}\" style=\"background:{mark};\"></span>{name}'
        ],
        inline: true,

        horizontalHeight: 64,
        verticalWidth: 150,

        scrollable: false // for IE11 vertical align
    },

    constructor: function (config) {
        this.callParent([config]);

        var scroller = this.getScrollable(),
            onDrag = scroller.onDrag;

        scroller.onDrag = function (e) {
            e.stopPropagation();
            onDrag.call(this, e);
        };
    },

    updateDocked: function (docked, oldDocked) {
        var me = this;

        me.callParent([docked, oldDocked]);

        switch (docked) {
            case 'top':
            case 'bottom':
                me.addCls(me.horizontalCls);
                me.removeCls(me.verticalCls);
                me.setWidth(null);
                me.setHeight(me.getHorizontalHeight());
                break;
            case 'left':
            case 'right':
                me.addCls(me.verticalCls);
                me.removeCls(me.horizontalCls);
                me.setWidth(me.getVerticalWidth());
                me.setHeight(null);
                break;
        }
    },

    onItemTap: function (container, target, index, e) {
        this.callParent(arguments);
        this.toggleItem(index);
    }
});
