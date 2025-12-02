Ext.define('Ext.theme.windows.MessageBox', {
    override: 'Ext.MessageBox',

    config: {
        ui: 'light',
        showAnimation: {
            type: 'fadeIn'
        },
        hideAnimation: {
            type: 'fadeOut'
        }
    }
})