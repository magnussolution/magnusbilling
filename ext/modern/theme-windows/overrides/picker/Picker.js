Ext.define('Ext.theme.windows.picker.Picker', {
    override: 'Ext.picker.Picker',

    config: {
        height: '100%',
        toolbarPosition: 'bottom',
        toolbar: {
            xtype: 'toolbar',
            layout: {
                type: 'hbox',
                pack: 'center'
            }
        },
        doneButton: {
            iconCls: 'check2',
            ui: 'round',
            text: ''
        },
        cancelButton: {
            iconCls: 'delete',
            ui: 'round',
            text: ''
        }
    }
});