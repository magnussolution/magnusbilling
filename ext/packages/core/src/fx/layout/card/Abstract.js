/**
 * @private
 */
Ext.define('Ext.fx.layout.card.Abstract', {
    extend: 'Ext.Evented',
    isAnimation: true,

    config: {
        direction: 'left',

        duration: null,

        reverse: null,

        layout: null
    },

    updateLayout: function(layout) {
        if (layout) {
            this.enable();
        }
    },

    enable: function() {
        var layout = this.getLayout();

        if (layout) {
            layout.on('beforeactiveitemchange', 'onActiveItemChange', this);
        }
    },

    disable: function() {
        var layout = this.getLayout();

        if (this.isAnimating) {
            this.stopAnimation();
        }

        if (layout) {
            layout.un('beforeactiveitemchange', 'onActiveItemChange', this);
        }
    },

    onActiveItemChange: Ext.emptyFn,

    destroy: function() {
        var me = this,
            layout = me.getLayout();

        if (me.isAnimating) {
            me.stopAnimation();
        }

        if (layout) {
            layout.un('beforeactiveitemchange', 'onActiveItemChange', this);
        }
        me.setLayout(null);

        if (me.observableId) {
            me.fireEvent('destroy', this);
        }
        me.callParent();
    }
});
