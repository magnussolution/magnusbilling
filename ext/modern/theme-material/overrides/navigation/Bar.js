Ext.define('Ext.theme.material.navigation.Bar', {
    override: 'Ext.navigation.Bar',

    config: {
        defaultBackButtonText: '',
        useTitleForBackButtonText: false,
        backButton: {
            align: 'left',
            ui: 'back',
            hidden: true,
            iconCls: 'md-icon-arrow-back'
        }
    }
});
