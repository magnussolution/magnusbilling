Ext.define('Overrides.ux.desktop.App', {
    override: 'Ext.ux.desktop.App',
    requires: ['Ext.container.Viewport', 'Ext.ux.desktop.Module'],
    controller: 'main',
    textSettings: t('Settings'),
    textHelp: t('Help'),
    textLogout: t('Exit'),
    startButtonText: t('Start'),
    textAbout: t('About'),
    textChangePassword: t('Change password'),
    pathWallpapers: '{0}',
    pathThemes: 'resources/images/themes/screens/{0}',
    wallpaperDefault: 'Azul.jpg',
    themeDefault: 'Azul.jpg',
    localeDefault: 'pt_BR',
    wallpaperStretch: true,
    modules: [],
    iconsDesktop: [],
    quickStart: [],
    modulesMenu: [],
    iconDefault: 'file3',
    fieldsShortcut: ['name', 'glyph', 'color', 'module'],
    init: function() {
        var me = this,
            desktopCfg;
        me.buildModules();
        me.wallpaperDefault = Ext.String.format(me.pathWallpapers, me.wallpaperDefault);
        me.themeDefault = Ext.String.format(me.pathThemes, me.themeDefault);
        if (me.useQuickTips) {
            Ext.QuickTips.init();
        }
        desktopCfg = me.getDesktopConfig();
        App.desktop = me.desktop = Ext.widget('desktop', desktopCfg);
        me.viewport = Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            controller: me.controller,
            items: [me.desktop]
        });
        Ext.getWin().on('beforeunload', me.onUnload, me);
        me.isReady = true;
        me.fireEvent('ready', me);
    },
    buildModules: function() {
        var me = this;
        me.iconsDesktop = [];
        me.quickStart = [];
        me.modulesMenu = [];
        me.createMenu();
    },
    createMenu: function() {
        var me = this,
            objModule,
            text,
            iconCls,
            action,
            hasAction,
            id;
        Ext.each(App.user.menu, function(item) {
            text = (item.text.indexOf('t(') !== -1) ? eval(item.text) : item.text;
            iconCls = item.iconCls || me.iconDefault;
            action = item.action;
            hasAction = Ext.isDefined(action);
            if (item.leaf) {
                id = item.module + 'window';
                objModule = Ext.clone(Ext.create('Ext.ux.desktop.Module', {
                    app: me,
                    id: id,
                    module: {
                        title: text,
                        iconCls: iconCls,
                        xtype: item.module + 'module',
                        module: item.module,
                        titleModule: text,
                        allowCreate: hasAction ? action.search('c') !== -1 : false,
                        allowUpdate: hasAction ? action.search('u') !== -1 : false,
                        allowDelete: hasAction ? action.search('d') !== -1 : false
                    }
                }));
                me.modules.push(objModule);
                me.modulesMenu.push({
                    text: text,
                    iconCls: iconCls,
                    handler: Ext.bind(me.createWindow, me, [objModule])
                });
                if (item.createShortCut) {
                    me.iconsDesktop.push({
                        name: text,
                        glyph: icons[iconCls],
                        iconCls: iconCls,
                        module: id,
                        color: item.color
                    });
                }
                if (item.createQuickStart) {
                    me.quickStart.push({
                        name: text,
                        iconCls: iconCls,
                        module: id
                    });
                }
            } else {
                me.modulesMenu.push({
                    text: text,
                    iconCls: iconCls,
                    menu: me.createSubMenu(item.rows)
                });
            }
        }, me);
    },
    createSubMenu: function(subMenu) {
        var me = this,
            objModule,
            text,
            iconCls,
            action,
            hasAction,
            id;
        Ext.each(subMenu, function(item) {
            text = (item.text.indexOf('t(') !== -1) ? eval(item.text) : item.text;
            iconCls = item.iconCls || me.iconDefault;
            action = item.action;
            hasAction = Ext.isDefined(action);
            if (item.leaf) {
                id = item.module + 'window';
                objModule = Ext.clone(Ext.create('Ext.ux.desktop.Module', {
                    app: me,
                    id: id,
                    module: {
                        title: text,
                        iconCls: iconCls,
                        xtype: item.module + 'module',
                        module: item.module,
                        titleModule: text,
                        allowCreate: hasAction ? action.search('c') !== -1 : false,
                        allowUpdate: hasAction ? action.search('u') !== -1 : false,
                        allowDelete: hasAction ? action.search('d') !== -1 : false
                    }
                }));
                me.modules.push(objModule);
                if (item.createShortCut == 1) {
                    me.iconsDesktop.push({
                        name: text,
                        glyph: icons[iconCls],
                        iconCls: iconCls + ' fa-2x',
                        module: id,
                        color: item.color
                    });
                }
                if (item.createQuickStart == 1) {
                    me.quickStart.push({
                        name: text,
                        iconCls: iconCls,
                        module: id
                    });
                }
                item.text = text;
                item.iconCls = iconCls;
                item.handler = Ext.bind(me.createWindow, me, [objModule]);
            } else {
                item.text = text;
                item.iconCls = iconCls;
                item.menu = me.createSubMenu(item.rows);
            }
        }, me);
        return subMenu;
    },
    getModules: function() {
        return this.modules;
    },
    getDesktopConfig: function() {
        var me = this,
            ret = me.callParent();
        return Ext.apply(ret, {
            contextMenuItems: [{
                handler: 'openChangePassword',
                iconCls: 'icon-change-password',
                text: t('Change password'),
                hidden: !App.user.isAdmin
            }, {
                text: t('Import Login Background'),
                glyph: icons.cog,
                handler: 'importLoginBackground',
                hidden: !App.user.isAdmin
            }, {
                text: t('Import wallpaper'),
                glyph: icons.cog,
                handler: 'importWallpaper',
                hidden: !App.user.isAdmin
            }, {
                text: t('Settings theme'),
                iconCls: 'icon-wallpaper',
                handler: 'openSettings',
                hidden: !App.user.isAdmin
            }],
            shortcuts: Ext.create('Ext.data.Store', {
                fields: me.fieldsShortcut,
                data: me.iconsDesktop
            }),
            locale: me.localeDefault,
            theme: me.themeDefault,
            wallpaper: (window.wallpapers) || me.wallpaperDefault,
            wallpaperStretch: me.wallpaperStretch
        });
    },
    getStartConfig: function() {
        var me = this;
        return {
            app: me,
            menu: me.modulesMenu,
            title: me.user,
            glyph: icons.user,
            iconCls: undefined,
            height: 300,
            toolConfig: {
                width: window.isThemeClassic ? 110 : 125,
                defaults: {
                    textAlign: 'left'
                },
                items: [{
                    text: t('Import wallpaper'),
                    glyph: icons.cog,
                    handler: 'importLogo',
                    hidden: App.user.isCdmin
                }, {
                    text: t('Settings theme'),
                    iconCls: 'icon-wallpaper',
                    handler: 'openSettings',
                    hidden: !App.user.isAdmin
                }, '-', {
                    text: me.textLogout,
                    glyph: icons.exit,
                    handler: 'logout'
                }]
            }
        };
    },
    getTaskbarConfig: function() {
        var me = this,
            ret = me.callParent();
        return Ext.apply(ret, {
            startBtnText: me.startButtonText,
            quickStart: me.quickStart,
            getTrayConfig: me.getTrayConfig,
            trayItems: [{
                xtype: 'credit'
            }, {
                xtype: 'locale'
            }, '-', {
                xtype: 'trayclock',
                flex: 1
            }]
        });
    },
    getTrayConfig: function() {
        var ret = {
            width: App.user.isAdmin ? 120 : window.isThemeClassic ? 220 : 230,
            items: this.trayItems
        };
        delete this.trayItems;
        return ret;
    }
});