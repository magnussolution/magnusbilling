/**
 * This column type displays the record index of the record in the store..
 */
Ext.define('Ext.grid.cell.RowNumberer', {
    extend: 'Ext.grid.cell.Base',
    xtype: 'rownumberercell',

    classCls: Ext.baseCSSPrefix + 'rownumberercell',

    updateRecord: function (record) {
        var column = this.getColumn(),
            store,
            page,
            result;

        // Column will be null during destruction.
        if (column) {
            store = this.getColumn().grid.getStore();
            page = store.currentPage;
            result = store.indexOf(record);
            if (page > 1) {
                result += (page - 1) * store.pageSize;
            }
            this.innerElement.dom.textContent = result + 1;
        }
    }
});
