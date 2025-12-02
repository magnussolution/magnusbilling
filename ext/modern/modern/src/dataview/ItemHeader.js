/**
 * A simple header component for grouped lists.  List headers are created automatically
 * by {@link Ext.dataview.List Lists} and should not be directly instantiated.
 */
Ext.define('Ext.dataview.ItemHeader', {
    extend: 'Ext.Component',
    xtype: 'itemheader',

    config: {
        /**
         * @private
         */
        pinned: null,

        /**
         * @private
         */
        list: null
    },

    html: '&nbsp;',

    classCls: Ext.baseCSSPrefix + 'itemheader',
    pinnedCls: Ext.baseCSSPrefix + 'pinned',
    manageWidth: true,

    updatePinned: function(pinned) {
        var me = this;

        me.element.toggleCls(me.pinnedCls, !!pinned);

        if (me.manageWidth && pinned) {
            me.getList().on({
                updateVisibleCount: 'refreshWidth',
                refresh: 'refreshWidth',
                resize: 'refreshWidth',
                scope: me
            });
            me.refreshWidth();
        }
    },

    privates: {
        refreshWidth: function() {
            this.setWidth(this.getList().scrollElement.dom.clientWidth);
        }
    }
});