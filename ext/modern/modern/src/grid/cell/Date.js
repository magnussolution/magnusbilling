/**
 * This class displays a date value in a {@link Ext.grid.Grid grid} cell. This cell type
 * is typically used by specifying {@link Ext.grid.column.Date} column type.
 *
 * {@link Ext.grid.Row Rows} create cells based on the {@link Ext.grid.column.Column#cell}
 * config. Application code would rarely create cells directly.
 */
Ext.define('Ext.grid.cell.Date', {
    extend: 'Ext.grid.cell.Text',
    xtype: 'datecell',

    requires: ['Ext.Date'],

    config: {
        /**
         * @cfg {String} format
         * A format string as used by {@link Ext.Date#format} to format values for this
         * column.
         */
        format: ''
    },

    updateColumn: function (column, oldColumn) {
        var format;

        this.callParent([column, oldColumn]);

        if (column) {
            format = column.getFormat();

            if (format !== null) {
                this.setFormat(format);
            }
        }
    },

    applyFormat: function (format) {
        return format || Ext.Date.defaultFormat;
    },

    updateFormat: function (format) {
        if (!this.isConfiguring) {
            this.writeValue();
        }
    },

    writeValue: function () {
        var value = this.getValue();
        this.setRawValue(value ? Ext.Date.format(value, this.getFormat()) : null);
    }
});
