/**

 */
Ext.define('Ext.grid.column.Tree', {
    extend: 'Ext.grid.column.Column',

    xtype: 'treecolumn',

    config: {
        cell: {
            xtype: 'treecell'
        }
    }
});
