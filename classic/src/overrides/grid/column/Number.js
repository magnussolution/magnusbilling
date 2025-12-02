Ext.define('Overrides.grid.column.Number', {
    override: 'Ext.grid.column.Number',
    decimalPrecision: 2,
    initComponent: function() {
        var me = this,
            i = 0,
            decimalPrecision = '',
            charFormat = t('.') === ',' ? '/i' : '';
        for (; i < me.decimalPrecision; i++) {
            decimalPrecision += '0';
        }
        me.format = me.formatNumber || '0' + t(',') + '000' + t('.') + decimalPrecision + charFormat;
        me.callParent(arguments);
    },
    defaultRenderer: function(value) {
        var format = Ext.util.Format;
        format.thousandSeparator = t(',');
        format.decimalSeparator = t('.');
        return format.number(value, this.format);
    }
});