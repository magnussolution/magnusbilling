Ext.define('Overrides.grid.column.Template', {
    override: 'Ext.grid.column.Template',
    defaultRenderer: function(value, meta, record) {
        if (Ext.isEmpty(value)) {
            return '';
        }
        return this.callParent(arguments);
    }
});