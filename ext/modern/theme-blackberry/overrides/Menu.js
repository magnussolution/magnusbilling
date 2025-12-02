Ext.define('Ext.theme.blackberry.Menu', {
    override: 'Ext.Menu',
    requires: ['Ext.theme.blackberry.ApplicationMenu', 'Ext.theme.blackberry.ContextMenu'],

    config: {
        ui: 'context',
        layout: {
            pack: 'center'
        }
    }
});