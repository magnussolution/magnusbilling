/**
 * A grid column used by the {@link Ext.grid.plugin.MultiSelection MultiSelection} plugin.
 *
 * This class should not be directly instantiated.  Instances are created automatically
 * when using a {@link Ext.grid.plugin.MultiSelection MultiSelection} plugin.
 */
Ext.define('Ext.grid.column.Selection', {
    extend: 'Ext.grid.column.Check',
    xtype: 'selectioncolumn',

    classCls: Ext.baseCSSPrefix + 'selectioncolumn',

    /**
     * @cfg {String} stopSelection
     * @hide
     */

    onAdded: function(parent, instanced) {
        this.callParent([parent, instanced]);

        this.grid.on({
            select: 'onSelect',
            deselect: 'onDeselect',
            scope: this
        });
    },

    onSelect: function(grid, record) {
        var row = grid.getItem(record);

        if (row) {
            row.getCellByColumn(this).addCls(this.checkedCls);
        }
        this.updateHeaderState();
    },

    onDeselect: function(grid, record) {
        var row = grid.getItem(record);

        if (row) {
            row.getCellByColumn(this).removeCls(this.checkedCls);
        }
        this.updateHeaderState();
    },

    doToggleAll: function(checked) {
        var grid = this.grid;

        if (checked) {
            grid.selectAll();
        } else {
            grid.deselectAll();
        }
    },

    areAllChecked: function() {
        var grid = this.grid;

        return grid.getStore().getCount() === grid.getSelectionCount();
    },

    isRecordChecked: function(record) {
        return this.grid.isSelected(record);
    },

    doSetRecordChecked: function (record, checked) {
        var grid = this.grid;

        if (checked) {
            grid.select(record, true);
        } else {
            grid.deselect(record);
        }
    }
});
