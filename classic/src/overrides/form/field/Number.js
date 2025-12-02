Ext.define('Overrides.form.field.Number', {
    override: 'Ext.form.field.Number',
    allowDecimals: false,
    minValue: 0,
    maxLength: 11
});