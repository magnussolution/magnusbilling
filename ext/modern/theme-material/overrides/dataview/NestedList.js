Ext.define('Ext.theme.material.dataview.NestedList', {
    override: 'Ext.dataview.NestedList',

    config: {
        backText: '',
        useTitleAsBackText: false,
        backButton: {
            iconCls: 'md-icon-arrow-back',
            hidden: true
        }
    }
});
