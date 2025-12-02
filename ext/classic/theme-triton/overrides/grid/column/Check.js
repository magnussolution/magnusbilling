Ext.define('Ext.theme.triton.grid.column.Check', {
    override: 'Ext.grid.column.Check',
    
    compatibility: Ext.isIE8,

    setRecordCheck: function(record, checked, cell) {
        this.callParent([record, checked, cell]);
        cell.syncRepaint();
    }
});