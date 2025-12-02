Ext.define('Overrides.grid.RowEditor', {
    override: 'Ext.grid.RowEditor',
    saveBtnText: t('Update'),
    cancelBtnText: t('Cancel'),
    errorsText: t('Errors'),
    dirtyText: t('You need to commit or cancel your changes')
});