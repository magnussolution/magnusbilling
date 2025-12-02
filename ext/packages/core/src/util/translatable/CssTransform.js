/**
 * @private
 *
 * CSS Transform implementation
 */
Ext.define('Ext.util.translatable.CssTransform', {
    extend: 'Ext.util.translatable.Dom',

    isCssTransform: true,

    doTranslate: function(x, y) {
        var me = this,
            element = me.getElement();

        if (!me.destroyed && !element.destroyed) {
            element.translate(x, y);
        }

        me.callParent([x, y]);
    },

    destroy: function() {
        var element = this.getElement();

        if (element && !element.destroyed) {
            element.dom.style.webkitTransform = null;
        }

        this.callParent();
    }
});
