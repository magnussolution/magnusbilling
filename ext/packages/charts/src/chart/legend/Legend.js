/**
 * This class provides a dataview-based chart legend.
 */
Ext.define('Ext.chart.legend.Legend', {
    extend: 'Ext.chart.legend.LegendBase',
    alternateClassName: 'Ext.chart.Legend',
    xtype: 'legend',
    alias: 'legend.dom',
    type: 'dom',
    isLegend: true,
    isDomLegend: true,

    config: {
        baseCls: Ext.baseCSSPrefix + 'legend',

        /**
         * @cfg {Array}
         * The rect of the legend relative to its container.
         */
        rect: null,

        /**
         * @cfg {Boolean} toggleable
         * `true` to allow series items to have their visibility
         * toggled by interaction with the legend items.
         */
        toggleable: true
    },

    horizontalCls: Ext.baseCSSPrefix + 'legend-horizontal',
    verticalCls: Ext.baseCSSPrefix + 'legend-vertical',

    toggleItem: function (index) {
        if (!this.getToggleable()) {
            return;
        }
        var store = this.getStore(),
            disabledCount = 0, disabled,
            canToggle = true,
            i, count, record;

        if (store) {
            count = store.getCount();
            for (i = 0; i < count; i++) {
                record = store.getAt(i);
                if (record.get('disabled')) {
                    disabledCount++;
                }
            }
            canToggle = count - disabledCount > 1;

            record = store.getAt(index);
            if (record) {
                disabled = record.get('disabled');
                if (disabled || canToggle) {
                    // This will trigger AbstractChart.onUpdateLegendStore.
                    record.set('disabled', !disabled);
                }
            }
        }
    }

});
