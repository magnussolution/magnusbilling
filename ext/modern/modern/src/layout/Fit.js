/**
 *
 */
Ext.define('Ext.layout.Fit', {
    extend: 'Ext.layout.Default',

    isFit: true,

    alias: 'layout.fit',

    cls: Ext.baseCSSPrefix + 'layout-fit',

    itemCls: Ext.baseCSSPrefix + 'layout-fit-item',

    setContainer: function(container) {
        this.callParent(arguments);

        this.onContainerSizeFlagsChange();
        this.monitorSizeFlagsChange();
    },

    onContainerSizeFlagsChange: function() {
        var container = this.container,
            sizeFlags = container.getSizeFlags(),
            stretched = Boolean(sizeFlags & container.LAYOUT_STRETCHED),
            innerItems = container.innerItems,
            i, ln, item;

        this.callParent();

        for (i = 0,ln = innerItems.length; i < ln; i++) {
            item = innerItems[i];
            item.setLayoutSizeFlags(sizeFlags);
        }

        container.innerElement.toggleCls('x-stretched', stretched);
    },

    onItemInnerStateChange: function(item, isInner) {
        this.callParent(arguments);
        item.setLayoutSizeFlags(isInner ? this.container.getSizeFlags() : 0);
    }
});
