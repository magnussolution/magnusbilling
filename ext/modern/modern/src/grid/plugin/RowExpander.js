/**
 * @class Ext.grid.plugin.RowExpander
 * Description
 */
Ext.define('Ext.grid.plugin.RowExpander', {
    extend: 'Ext.Component',

    requires: [
        'Ext.grid.cell.Expander'
    ],

    alias: 'plugin.rowexpander',

    config: {
        grid: null,
        column: {
            xtype: 'gridcolumn',
            text: '',
            width: 50,
            resizable: false,
            hideable: false,
            sortable: false,
            editable: false,
            ignore: true,
            ignoreExport: true,
            cell: {
                xtype: 'expandercell'
            }
        }
    },

    expanderSelector: '.' + Ext.baseCSSPrefix + 'expandercell .' + Ext.baseCSSPrefix + 'icon-el',
    expandedCls: Ext.baseCSSPrefix + 'expanded',

    init: function (grid) {
        this.setGrid(grid);
    },

    applyColumn: function(column, oldColumn) {
        return Ext.factory(column, null, oldColumn);
    },

    updateGrid: function (grid, oldGrid) {
        var me = this;

        if (grid) {
            grid.hasRowExpander = true;
            grid.addCls(Ext.baseCSSPrefix + 'has-rowexpander');
            grid.insertColumn(0, me.getColumn());
            grid.refreshScroller();

            grid.element.on({
                tap: 'onGridTap',
                delegate: me.expanderSelector,
                scope: me
            });
        }
    },

    onGridTap: function(event) {
        var el = event.getTarget(),
            cell = Ext.Component.fromElement(el),
            row = cell.getParent();

        cell.toggleCls(this.expandedCls);

        row.toggleCollapsed();
    }
});