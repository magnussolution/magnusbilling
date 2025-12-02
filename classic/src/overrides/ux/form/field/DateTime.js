Ext.define('Overrides.ux.form.field.DateTime', {
    override: 'Ext.ux.form.field.DateTime',
    format: t('m/d/Y'),
    submitFormat: 'Y-m-d H:i:s'
});