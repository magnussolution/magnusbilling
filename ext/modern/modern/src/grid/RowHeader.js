/**
 * A simple header component for grouped grids.  Grid row headers are created automatically
 * by {@link Ext.grid.Grid Grids} and should not be directly instantiated.
 */
Ext.define('Ext.grid.RowHeader', {
    extend: 'Ext.dataview.ItemHeader',
    xtype: 'rowheader',
    classCls: Ext.baseCSSPrefix + 'rowheader',

    manageWidth: false
});