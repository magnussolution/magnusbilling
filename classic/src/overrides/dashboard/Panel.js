Ext.define('Overrides.dashboard.Panel', {
    override: 'Ext.dashboard.Panel',
    glyph: icons.file3,
    height: 300,
    defaults: {
        allowCreate: false,
        allowUpdate: false,
        allowDelete: false,
        allowPrint: false,
        buttonCsv: false,
        buttonImportCsv: false,
        buttonCleanFilter: false,
        fieldSearch: ''
    },
    initComponent: function() {
        var me = this;
        me.tools = me.tools || [{
            type: 'maximize',
            scope: me,
            handler: function(e, el, owner) {
                var me = this,
                    winMaximize = me.getWindowMaximize(),
                    item = me.items.first().cloneConfig();
                Ext.suspendLayouts();
                itemAdd = winMaximize.add(item);
                winMaximize.setTitle(me.title);
                me.glyph && winMaximize.setGlyph(me.glyph);
                me.iconCls && winMaximize.setIconCls(me.iconCls);
                Ext.resumeLayouts(true);
                winMaximize.show();
            }
        }];
        me.callParent(arguments);
    },
    getWindowMaximize: function() {
        var me = this;
        me.windowMaximize = me.windowMaximize || Ext.widget('window', {
            closeAction: 'hide',
            layout: 'fit',
            baseCls: 'x-panel',
            maximized: true,
            closable: false,
            border: false,
            tools: [{
                type: 'restore',
                scope: me,
                handler: function() {
                    me.windowMaximize.close();
                }
            }],
            listeners: {
                scope: me,
                hide: function() {
                    Ext.suspendLayouts();
                    me.windowMaximize.removeAll(false);
                    Ext.resumeLayouts(true);
                }
            }
        });
        return me.windowMaximize;
    }
});