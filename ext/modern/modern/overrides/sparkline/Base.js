/**
 * @class Ext.sparkline.Base
 */
Ext.define('Ext.override.sparkline.Base', {
    override: 'Ext.sparkline.Base',

    statics: {
        constructTip: function() {
            return new Ext.tip['ToolTip']({
                id: 'sparklines-tooltip',
                trackMouse: true,
                showDelay: 0,
                dismissDelay: 0,
                hideDelay: 400
            });
        }
    },

    onMouseMove: function (e) {
        this.currentEvent = e;
        this.tooltip.currentTarget.attach(this.element);
        this.callParent([e]);
    },

    privates: {
        hideTip: function() {
            var tip = this.tooltip;
            // Will detach the currentTarget
            tip.hide();
        },

        showTip: function() {
            this.tooltip.forceTargetOver(this.currentEvent, this.element);
        }
    }
});