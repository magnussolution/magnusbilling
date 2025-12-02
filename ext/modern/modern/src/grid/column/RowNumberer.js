/**
 * A special type of Grid {@link Ext.grid.column.Column} that provides automatic
 * row numbering.
 *
 * Usage:
 *
 *     columns: [
 *         {xtype: 'rownumberer'},
 *         ...
 *     ]
 *
 */
 Ext.define('Ext.grid.column.RowNumberer', {
    extend: 'Ext.grid.column.Column',
    xtype: 'rownumberer',

    align: 'right',
    ignoreExport: true,

    sortable: false,

    cell: {
        xtype: 'rownumberercell'
    },

    onAdded: function(parent, instanced) {
        var me = this;

        me.callParent([parent, instanced]);
        me.checkWidth();
        me.storeListeners = me.grid.getStore().on({
            datachanged: me.checkWidth,
            scope: me,
            destroyable: true
        });
    },

    onRemoved: function(destroying) {
        this.storeListeners.destroy();
        this.callParent([destroying]);
    },

    checkWidth: function() {
        var size = String(this.grid.getStore().getCount());
        
        this.setWidth((size.length + 1) + 'em');
    },

    applyWidth: function(w) {
        return w;
    }
});
