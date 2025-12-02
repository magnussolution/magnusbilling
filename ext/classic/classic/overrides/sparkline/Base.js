/**
 * @class Ext.sparkline.Base
 */
Ext.define('Ext.override.sparkline.Base', {
    override: 'Ext.sparkline.Base',

    statics: {
        constructTip: function() {
            return new Ext.tip['ToolTip']({
                id: 'sparklines-tooltip',
                showDelay: 0,
                dismissDelay: 0,
                hideDelay: 400
            });
        }
    },

    onMouseMove: function (e) {
        this.tooltip.triggerEvent = e;
        this.callParent([e]);
    },

    onMouseLeave: function(e) {
        this.callParent([e]);
        this.tooltip.target = null;  
    },

    privates: {
        hideTip: function() {
            var tip = this.tooltip;
            tip.target = null;  
            tip.hide();
        },

        showTip: function() {
            var tip = this.tooltip;
            tip.target = this.el;
            tip.onTargetOver(tip.triggerEvent);
        }
    }
});