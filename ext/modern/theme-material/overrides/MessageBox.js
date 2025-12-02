Ext.define('Ext.theme.material.MessageBox', {
    override: 'Ext.MessageBox',

    config: {
        buttonToolbar: {
            layout: {
                pack: 'end'
            }
        }
    }
});
