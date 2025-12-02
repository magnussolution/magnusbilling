/**
 * @class Ext.chart.interactions.ItemHighlight
 * @extends Ext.chart.interactions.Abstract
 *
 * The 'itemhighlight' interaction allows the user to highlight series items in the chart.
 */
Ext.define('Ext.chart.interactions.ItemHighlight', {

    extend: 'Ext.chart.interactions.Abstract',

    type: 'itemhighlight',
    alias: 'interaction.itemhighlight',

    isItemHighlight: true,

    config: {

        gestures: {
            tap: 'onTapGesture',
            mousemove: 'onMouseMoveGesture',
            mousedown: 'onMouseDownGesture',
            mouseup: 'onMouseUpGesture',
            mouseleave: 'onMouseUpGesture'
        },

        /**
         * @cfg {Boolean} [sticky=false]
         * Disables mouse tracking.
         * Series items will only be highlighted/unhighlighted on mouse click.
         * This config has no effect on touch devices.
         */
        sticky: false
    },

    stickyHighlightItem: null,

    onMouseMoveGesture: function (e) {
        var me = this,
            tipItem = me.tipItem,
            isMousePointer = e.pointerType === 'mouse',
            item, tooltip, chart;

        if (me.getSticky()) {
            return true;
        }

        if (isMousePointer && me.stickyHighlightItem) {
            me.stickyHighlightItem = null;
            me.highlight(null);
        }

        if (me.isDragging) {
            if (tipItem && isMousePointer) {
                tipItem.series.hideTooltip(tipItem);
                me.tipItem = null;
            }
        } else if (!me.stickyHighlightItem) {
            item = me.getItemForEvent(e);
            chart = me.getChart();
            if (item !== chart.getHighlightItem()) {
                me.highlight(item);
                me.sync();
            }

            if (isMousePointer) {
                if ( tipItem && (!item || tipItem.field !== item.field || tipItem.record !== item.record) ) {
                    tipItem.series.hideTooltip(tipItem);
                    me.tipItem = tipItem = null;
                }
                if (item && (tooltip = item.series.getTooltip())) {
                    if (tooltip.trackMouse || !tipItem) {
                        item.series.showTooltip(item, e);
                    }
                    me.tipItem = item;
                }
            }
            return false;
        }
    },

    highlight: function (item) {
        // This is its own function to make it easier for subclasses
        // to enhance the behavior. An alternative would be to listen
        // for the chart's 'itemhighlight' event.
        this.getChart().setHighlightItem(item);
    },

    showTooltip: function (e, item) {
        item.series.showTooltip(item, e);
        this.tipItem = item;
    },

    onMouseDownGesture: function () {
        this.isDragging = true;
    },

    onMouseUpGesture: function () {
        this.isDragging = false;
    },

    onTapGesture: function (e) {
        var me = this;

        // A click/tap on an item makes its highlight sticky.
        // It requires another click/tap to unhighlight.
        if (e.pointerType === 'mouse' && !me.getSticky()) {
            return;
        }

        var item = me.getItemForEvent(e);

        if (me.stickyHighlightItem && item && (me.stickyHighlightItem.index === item.index)) {
            item = null;
        }
        me.stickyHighlightItem = item;
        me.highlight(item);
    }
});
