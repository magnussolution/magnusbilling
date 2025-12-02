/**
 *
 */
Ext.define('Ext.layout.Float', {
    extend: 'Ext.layout.Default',

    alias: 'layout.float',

    config: {
        direction: 'left'
    },

    cls: Ext.baseCSSPrefix + 'layout-float',

    itemCls: Ext.baseCSSPrefix + 'layout-float-item',

    setContainer: function(container) {
        this.callParent(arguments);

        container.innerElement.addCls(this.layoutClass);
    },

    updateDirection: function(direction, oldDirection) {
        var prefix = 'direction-';

        this.container.innerElement.swapCls(prefix + direction, prefix + oldDirection);
    }
});
