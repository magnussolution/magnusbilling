Ext.define('Overrides.ux.desktop.Desktop', {
    override: 'Ext.ux.desktop.Desktop',
    textTitle: t('Title'),
    textCascade: t('Cascade'),
    textRestore: t('Restore'),
    textMinimize: t('Minimize'),
    textMaximize: t('Maximize'),
    textClose: t('Close'),
    shortcutTpl: ['<tpl for=".">', '<div class="ux-desktop-shortcut" style="width:100px;" id="{module}-shortcut">', '<div class="ux-desktop-shortcut-icon {iconCls}" style="width:80px;" >', '<span style="font-family:icons; font-size: 48px; color: {color};"></span>', '<img src="', Ext.BLANK_IMAGE_URL, '" title="{name}">', '</div>', '<span class="ux-desktop-shortcut-text" >{name}</span>', '</div>', '</tpl>', '<div class="x-clear"></div>'],
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        me.on('boxready', me.organizeShortcuts, me);
        Ext.getWin().on('resize', me.organizeShortcuts, me);
    },
    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.shortcuts.on('datachanged', me.organizeShortcuts, me);
    },
    createDesktopMenu: function() {
        var me = this,
            ret = {
                items: me.contextMenuItems || []
            };
        if (ret.items.length) {
            ret.items.push('-');
        }
        ret.items.push({
            text: me.textTitle,
            handler: me.tileWindows,
            scope: me,
            minWindows: 1
        }, {
            text: me.textCascade,
            handler: me.cascadeWindows,
            scope: me,
            minWindows: 1
        });
        return ret;
    },
    createWindowMenu: function() {
        var me = this;
        return {
            defaultAlign: 'br-tr',
            items: [{
                text: me.textRestore,
                handler: me.onWindowMenuRestore,
                scope: me
            }, {
                text: me.textMinimize,
                handler: me.onWindowMenuMinimize,
                scope: me
            }, {
                text: me.textMaximize,
                handler: me.onWindowMenuMaximize,
                scope: me
            }, '-', {
                text: me.textClose,
                handler: me.onWindowMenuClose,
                scope: me
            }],
            listeners: {
                beforeshow: me.onWindowMenuBeforeShow,
                hide: me.onWindowMenuHide,
                scope: me
            }
        };
    },
    createDataView: function() {
        var me = this;
        return {
            xtype: 'dataview',
            overItemCls: 'x-view-over',
            trackOver: true,
            itemSelector: me.shortcutItemSelector,
            store: me.shortcuts,
            style: {
                position: 'absolute'
            },
            x: 0,
            y: 0,
            tpl: new Ext.XTemplate(me.shortcutTpl)
        };
    },
    organizeShortcuts: function() {
        var me = this,
            dataView = me.shortcutsView,
            dataViewHeight = dataView.getHeight(),
            top = 10,
            left = 0,
            height = 0,
            id,
            shortcut;
        dataView.getStore().each(function(rec) {
            id = rec.get('module');
            if (Ext.isDefined(id)) {
                id = id + '-shortcut';
                shortcut = Ext.get(id);
                shortcut.setTop(top);
                shortcut.setLeft(left);
                height = shortcut.getHeight();
                top = top + 84;
                if (top + height > dataViewHeight) {
                    left = left + 90;
                    top = 10;
                }
            }
        }, me);
    }
});