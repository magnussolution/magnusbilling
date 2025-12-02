Ext.define('Overrides.ux.desktop.Module', {
    override: 'Ext.ux.desktop.Module',
    cfgWindow: {},
    width: '90%',
    height: '80%',
    hiddenForm: false,
    createWindow: function(src) {
        var me = this,
            desktop = me.app.getDesktop(),
            cfgWindow = Ext.clone(me.cfgWindow),
            items;
        if (!me.win) {
            me.win = desktop.createWindow(Ext.applyIf(cfgWindow, {
                id: me.id,
                title: (me.module && me.module.title) || me.title,
                width: me.width,
                height: me.height,
                minWidth: Ext.Element.getViewportWidth() / 1.3,
                minHeight: Ext.Element.getViewportHeight() / 1.3,
                glyph: (me.module && me.module.glyph) || me.glyph,
                animCollapse: false,
                constrainHeader: true,
                layout: 'fit',
                border: true,
                items: me.module || me.items,
                hidden: me.hiddenForm,
                listeners: {
                    scope: me,
                    beforeclose: me.onBeforeClose,
                    show: me.loadStore
                }
            }));
        }
        me.win.show();
        return me.win;
    },
    loadStore: function(win) {
        var me = this,
            grid = me.app.desktop.getActiveWindow() && me.app.desktop.getActiveWindow().down('grid'),
            store = grid ? grid.store : null;
        store && !store.getCount() && store.load({
            scope: me,
            callback: function() {
                grid.view.refresh();
            }
        });
        !Ext.Boot.platformTags.desktop && win.maximize();
    },
    onBeforeClose: function() {
        var me = this,
            grid = me.app.desktop.getActiveWindow() && me.app.desktop.getActiveWindow().down('grid'),
            store = grid ? grid.store : null;
        me.win = undefined;
        if (store) {
            store.removeAll(true);
        }
    }
});