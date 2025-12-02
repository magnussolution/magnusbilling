Ext.define('Ext.ux.form.field.Float', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.floatfield',
    decimalSeparator: t('.'),
    submitLocaleSeparator: false,
    allowDecimals: true,
    minValue: 0
});