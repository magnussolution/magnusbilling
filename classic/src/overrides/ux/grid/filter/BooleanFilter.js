Ext.define('Overrides.ux.grid.filter.BooleanFilter', {
    override: 'Ext.ux.grid.filter.BooleanFilter',
    defaultValue: true,
    yesText: t('Yes'),
    noText: t('No'),
    sendIntValue: true,
    getValue: function() {
        var me = this;
        if (me.sendIntValue) {
            return me.options[0].checked ? 1 : 0;
        }
        return me.options[0].checked;
    }
});