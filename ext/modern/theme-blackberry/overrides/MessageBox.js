Ext.define('Ext.theme.blackberry.Messagebox', {
    override: 'Ext.MessageBox',

    config: {
        ui: 'plain',
        buttonToolbar: {
            defaults: {
                flex: 1,
                ui: 'action'
            }
        }
    }
});