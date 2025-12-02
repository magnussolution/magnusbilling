/**
 * @class Ext.Progress
 */
Ext.define('Ext.overrides.Progress', {
    override: 'Ext.Progress',

    initialize: function() {
        this.callParent();

        this.on('painted', 'onPainted');
        this.on('resize', 'onResize');
    },

    onPainted: function() {
      this.syncWidth();
    },

    onResize: function (component, info) {
        this.syncWidth(info.contentWidth);
    },

    syncWidth: function (width) {
        var me = this;

        if (width == null) {
            width = me.element.getWidth();
        }

        me.backgroundEl.setWidth(width);
        me.textEl.setWidth(width);
    }
});