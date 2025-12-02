Ext.define('Overrides.ux.desktop.TaskBar', {
    override: 'Ext.ux.desktop.TaskBar',
    getQuickStart: function() {
        var me = this,
            ret = {
                minWidth: 20,
                width: window.isThemeClassic ? 150 : 160,
                items: [],
                enableOverflow: true
            };
        Ext.each(this.quickStart, function(item) {
            ret.items.push({
                tooltip: {
                    text: item.name,
                    align: 'bl-tl'
                },
                overflowText: item.name,
                iconCls: item.iconCls,
                module: item.module,
                handler: me.onQuickStartClick,
                scope: me
            });
        });
        return ret;
    },
    addTaskButton: function(win) {
        var config = {
            textAlign: 'left',
            glyph: win.config.glyph,
            enableToggle: true,
            toggleGroup: 'all',
            width: 140,
            margins: '0 2 0 3',
            text: Ext.util.Format.ellipsis(win.title, 20),
            listeners: {
                click: this.onWindowBtnClick,
                scope: this
            },
            win: win
        };
        var cmp = this.windowBar.add(config);
        cmp.toggle(true);
        return cmp;
    }
});