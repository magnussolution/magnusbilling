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
    macApplications: [],
    macApplicationMenus: [],
    macSettingsMenuIndex: null,
    macApplicationsMode: null,
    macApplicationsZIndex: 2147483000,
    iconDefault: 'file3',
    fieldsShortcut: ['id', 'name', 'glyph', 'color', 'module', 'iconCls', 'tone', 'menuIndex'],
    init: function() {
        var me = this,
            desktopCfg,
            viewportItems;
        me.buildModules();
        me.wallpaperDefault = Ext.String.format(me.pathWallpapers, me.wallpaperDefault);
        me.themeDefault = Ext.String.format(me.pathThemes, me.themeDefault);
        if (me.useQuickTips) {
            Ext.QuickTips.init();
        }
        desktopCfg = me.getDesktopConfig();
        App.desktop = me.desktop = Ext.widget('desktop', desktopCfg);
        if (window.isMac) {
            Ext.getBody().addCls('mb-macos');
            me.desktop.region = 'center';
            viewportItems = [me.getMacMenuBar(), me.desktop];
        } else {
            viewportItems = [me.desktop];
        }
        me.viewport = Ext.create('Ext.container.Viewport', {
            layout: window.isMac ? 'border' : 'fit',
            controller: me.controller,
            items: viewportItems
        });
        if (window.isMac) {
            Ext.getWin().on('resize', me.positionMacApplications, me);
            Ext.getDoc().on('mousedown', me.onMacApplicationsDocumentPointer, me);
            Ext.getDoc().on('mousemove', me.onMacApplicationsDocumentMove, me);
        }
        Ext.getWin().on('beforeunload', me.onUnload, me);
        me.isReady = true;
        me.fireEvent('ready', me);
    },
    getMacMenuBar: function() {
        var me = this;
        return {
            xtype: 'toolbar',
            region: 'north',
            height: 30,
            cls: 'mb-mac-menubar',
            items: [{
                xtype: 'button',
                cls: 'mb-mac-apple-menu',
                iconCls: 'x-fa fa-apple',
                ariaLabel: 'Apple',
                arrowVisible: false,
                menuAlign: 'tl-bl',
                menu: [{
                    text: t('Settings theme'),
                    glyph: icons.cog,
                    handler: 'openSettings',
                    hidden: !App.user.isAdmin
                }, {
                    text: t('Change password'),
                    iconCls: 'icon-change-password',
                    handler: 'openChangePassword',
                    hidden: !App.user.isAdmin
                }, '-', {
                    text: me.textLogout,
                    glyph: icons.exit,
                    handler: 'logout'
                }]
            }, '->', {
                xtype: 'credit',
                width: 120
            }, {
                xtype: 'locale'
            }, '-', {
                xtype: 'trayclock'
            }]
        };
    },
    showMacApplications: function() {
        var me = this,
            view = me.desktop && me.desktop.shortcutsView,
            directory;
        this.cancelMacApplicationsHide();
        if (view) {
            view.show();
            if (view.el) {
                // Ext JS allocates a new z-index range as more floating windows are
                // opened. Keep the macOS directories outside those ranges so Apps
                // and Settings are always displayed above every desktop window.
                view.el.setStyle('z-index', String(me.macApplicationsZIndex));
            }
            view.removeCls('mb-mac-applications-dismissed');
            view.addCls('mb-mac-applications-visible');
            me.positionMacApplications();
            if (!view.macApplicationHoverBound) {
                directory = view.el && view.el.down('.mb-mac-app-directory');
                if (directory) {
                    directory.on({
                        mouseover: me.cancelMacApplicationsHide,
                        mouseleave: me.scheduleMacApplicationsHide,
                        scope: me
                    });
                    view.macApplicationHoverBound = true;
                }
            }
        }
    },
    positionMacApplications: function() {
        var view = this.desktop && this.desktop.shortcutsView,
            launcher = this.macApplicationsAnchorEl || Ext.getBody().down('.mb-mac-launcher'),
            directory,
            viewBox,
            launcherBox,
            directoryWidth,
            launcherCenter,
            left,
            pointerLeft;

        if (!view || !view.rendered || !view.isVisible() || !launcher) {
            return;
        }
        directory = view.el.down('.mb-mac-app-directory');
        if (!directory) {
            return;
        }
        viewBox = view.el.getBox();
        launcherBox = launcher.getBox();
        directoryWidth = directory.getWidth();
        launcherCenter = launcherBox.x + (launcherBox.width / 2) - viewBox.x;
        left = Ext.Number.constrain(
            launcherCenter - (directoryWidth / 2),
            12,
            Math.max(viewBox.width - directoryWidth - 12, 12)
        );
        pointerLeft = Ext.Number.constrain(launcherCenter - left, 28, directoryWidth - 28);
        directory.setStyle('left', left + 'px');
        directory.dom.style.setProperty('--mb-mac-pointer-left', pointerLeft + 'px');
    },
    hideMacApplications: function(force) {
        var view = this.desktop && this.desktop.shortcutsView;
        this.macApplicationsKeepOpenUntilMove = false;
        this.macApplicationsAnchorEl = null;
        this.macApplicationsMode = null;
        if (view) {
            view.removeCls('mb-mac-applications-visible');
            view.addCls('mb-mac-applications-dismissed');
            if (this.desktop.resetMacApplicationDirectory) {
                this.desktop.resetMacApplicationDirectory();
            }
        }
    },
    scheduleMacApplicationsHide: function() {
        var me = this;
        if (me.macApplicationsKeepOpenUntilMove) {
            return;
        }
        if (!me.macApplicationsHideTask) {
            me.macApplicationsHideTask = Ext.create('Ext.util.DelayedTask', function() {
                me.hideMacApplications(false);
            });
        }
        me.macApplicationsHideTask.delay(450);
    },
    cancelMacApplicationsHide: function() {
        if (this.macApplicationsHideTask) {
            this.macApplicationsHideTask.cancel();
        }
    },
    showMacApplicationsRoot: function(button, event, keepOpenUntilMove) {
        this.macApplicationsMode = 'applications';
        this.macApplicationsKeepOpenUntilMove = keepOpenUntilMove === true;
        this.macApplicationsClickX = keepOpenUntilMove && event ? event.getX() : null;
        this.macApplicationsClickY = keepOpenUntilMove && event ? event.getY() : null;
        this.macApplicationsAnchorEl = button.getEl();
        if (this.desktop && this.desktop.resetMacApplicationDirectory) {
            this.desktop.resetMacApplicationDirectory();
        }
        this.showMacApplications();
    },
    showMacApplicationsFromClick: function(button, event) {
        this.showMacApplicationsRoot(button, event, true);
    },
    showMacApplicationsFromHover: function(button, event) {
        this.showMacApplicationsRoot(button, event, false);
    },
    showMacSettingsFromClick: function(button, event) {
        this.showMacSettings(button, event, true);
    },
    showMacSettingsFromHover: function(button, event) {
        this.showMacSettings(button, event, false);
    },
    showMacSettings: function(button, event, keepOpenUntilMove) {
        var view = this.desktop && this.desktop.shortcutsView,
            record;
        if (this.macApplicationsMode !== 'settings' && this.desktop && this.desktop.resetMacApplicationDirectory) {
            this.desktop.resetMacApplicationDirectory();
        }
        this.macApplicationsMode = 'settings';
        this.macApplicationsKeepOpenUntilMove = keepOpenUntilMove === true;
        this.macApplicationsClickX = keepOpenUntilMove && event ? event.getX() : null;
        this.macApplicationsClickY = keepOpenUntilMove && event ? event.getY() : null;
        this.macApplicationsAnchorEl = button.getEl();
        this.showMacApplications();
        if (view && Ext.isNumber(this.macSettingsMenuIndex)) {
            record = view.getStore().getAt(this.macSettingsMenuIndex);
            if (record) {
                this.desktop.openMacApplication(record);
                this.macApplicationsKeepOpenUntilMove = keepOpenUntilMove === true;
            }
        }
    },
    isMacApplicationsTarget: function(target, x, y) {
        var targetDom = target && (target.dom || target),
            launcher = Ext.getBody().down('.mb-mac-launcher'),
            settingsLauncher = Ext.getBody().down('.mb-mac-settings-launcher'),
            directory = Ext.getBody().down('.mb-mac-app-directory'),
            isWithinPoint = function(element) {
                var box;
                if (!element || !Ext.isNumber(x) || !Ext.isNumber(y)) {
                    return false;
                }
                box = element.getBox();
                return x >= box.x && x <= box.right && y >= box.y && y <= box.bottom;
            };
        return !!(targetDom && (
            (launcher && launcher.dom.contains(targetDom)) ||
            (settingsLauncher && settingsLauncher.dom.contains(targetDom)) ||
            (directory && directory.dom.contains(targetDom)) ||
            isWithinPoint(launcher) || isWithinPoint(settingsLauncher) || isWithinPoint(directory)
        ));
    },
    onMacApplicationsDocumentPointer: function(event) {
        var target = Ext.get(event.getTarget());
        if (!target) {
            return;
        }
        if (this.isMacApplicationsTarget(target, event.getX(), event.getY())) {
            return;
        }
        this.hideMacApplications(true);
    },
    onMacApplicationsDocumentMove: function(event) {
        var view = this.desktop && this.desktop.shortcutsView,
            target,
            deltaX,
            deltaY;
        if (!view || !view.hasCls('mb-mac-applications-visible')) {
            return;
        }
        target = Ext.get(event.getTarget());
        if (this.isMacApplicationsTarget(target, event.getX(), event.getY())) {
            this.cancelMacApplicationsHide();
        } else {
            if (this.macApplicationsKeepOpenUntilMove && this.macApplicationsClickX !== null) {
                deltaX = event.getX() - this.macApplicationsClickX;
                deltaY = event.getY() - this.macApplicationsClickY;
                if ((deltaX * deltaX) + (deltaY * deltaY) < 144) {
                    return;
                }
            }
            this.macApplicationsKeepOpenUntilMove = false;
            this.scheduleMacApplicationsHide();
        }
    },
    buildModules: function() {
        var me = this;
        me.iconsDesktop = [];
        me.quickStart = [];
        me.modulesMenu = [];
        me.macApplications = [];
        me.macApplicationMenus = [];
        me.macSettingsMenuIndex = null;
        me.createMenu();
    },
    createMenu: function() {
        var me = this,
            objModule,
            text,
            iconCls,
            desktopIconCls,
            action,
            hasAction,
            id,
            menuConfig;
        Ext.each(App.user.menu, function(item, index) {
            text = (item.text.indexOf('t(') !== -1) ? eval(item.text) : item.text;
            iconCls = item.iconCls || me.iconDefault;
            desktopIconCls = window.isMac ? me.getMacDockIcon(text, item.module) : iconCls;
            action = item.action;
            hasAction = Ext.isDefined(action);
            if (item.leaf) {
                id = item.module + 'window';
                objModule = Ext.clone(Ext.create('Ext.ux.desktop.Module', {
                    app: me,
                    id: id,
                    module: {
                        title: text,
                        iconCls: desktopIconCls,
                        xtype: item.module + 'module',
                        module: item.module,
                        titleModule: text,
                        allowCreate: hasAction ? action.search('c') !== -1 : false,
                        allowUpdate: hasAction ? action.search('u') !== -1 : false,
                        allowDelete: hasAction ? action.search('d') !== -1 : false
                    }
                }));
                me.modules.push(objModule);
                menuConfig = {
                    text: text,
                    iconCls: desktopIconCls,
                    handler: Ext.bind(me.createWindow, me, [objModule])
                };
                me.modulesMenu.push(menuConfig);
                if (item.createShortCut == 1) {
                    me.iconsDesktop.push({
                        name: text,
                        glyph: icons[iconCls],
                        iconCls: desktopIconCls,
                        module: id,
                        color: item.color
                    });
                }
                if (item.createQuickStart == 1) {
                    me.quickStart.push({
                        name: text,
                        iconCls: desktopIconCls,
                        module: id
                    });
                }
            } else {
                menuConfig = {
                    text: text,
                    iconCls: iconCls,
                    menu: me.createSubMenu(item.rows)
                };
                me.modulesMenu.push(menuConfig);
            }
            me.addMacApplication(menuConfig, index);
        }, me);
    },
    addMacApplication: function(item, index) {
        var me = this,
            visual = me.getMacApplicationVisual(item.text, index);
        if (visual.iconCls === 'fa-cogs') {
            me.macSettingsMenuIndex = index;
        }
        me.macApplications.push({
            id: 'mb-mac-application-' + index,
            name: item.text,
            iconCls: visual.iconCls,
            tone: visual.tone,
            menuIndex: index
        });
        me.macApplicationMenus.push(item.menu ? Ext.clone(item.menu) : [Ext.clone(item)]);
    },
    getMacApplicationVisual: function(text, index) {
        var value = String(text || '').toLowerCase(),
            iconCls = 'fa-folder-open',
            tone = 'blue';

        if (/client|cliente|customer|user|usu.rio/.test(value)) {
            iconCls = 'fa-users';
            tone = 'blue';
        } else if (/billing|cobran|factur|pagam/.test(value)) {
            iconCls = 'fa-credit-card';
            tone = 'green';
        } else if (/did|number|n.mero/.test(value)) {
            iconCls = 'fa-phone';
            tone = 'cyan';
        } else if (/rate|tarif|pre.o/.test(value)) {
            iconCls = 'fa-tags';
            tone = 'orange';
        } else if (/report|relat|bericht|rapport/.test(value)) {
            iconCls = 'fa-bar-chart';
            tone = 'purple';
        } else if (/route|rota|routage/.test(value)) {
            iconCls = 'fa-random';
            tone = 'indigo';
        } else if (/setting|config|ajuste/.test(value)) {
            iconCls = 'fa-cogs';
            tone = 'gray';
        } else if (/voice|broadcast|campaign|campa/.test(value)) {
            iconCls = 'fa-bullhorn';
            tone = 'red';
        } else if (/callshop|call shop/.test(value)) {
            iconCls = 'fa-headphones';
            tone = 'pink';
        } else if (/service|servi.o/.test(value)) {
            iconCls = 'fa-cubes';
            tone = 'teal';
        } else {
            tone = ['blue', 'green', 'cyan', 'orange', 'purple'][index % 5];
        }
        return {
            iconCls: iconCls,
            tone: tone
        };
    },
    getMacMenuItemVisual: function(text, module, hasChildren, index) {
        var value = (String(module || '') + ' ' + String(text || '')).toLowerCase(),
            visual = {
                iconCls: hasChildren ? 'x-fa fa-folder-open' : 'x-fa fa-th-large',
                tone: ['blue', 'green', 'cyan', 'orange', 'purple', 'indigo', 'gray', 'red', 'pink', 'teal'][index % 10]
            };

        if (/restricted number|blocked number|blacklist/.test(value)) {
            visual.iconCls = 'x-fa fa-ban';
            visual.tone = 'red';
        } else if (/fail2ban|firewall|security|blocked|restrict|ban/.test(value)) {
            visual.iconCls = 'x-fa fa-shield';
            visual.tone = 'indigo';
        } else if (/backup|restore|database/.test(value)) {
            visual.iconCls = 'x-fa fa-database';
            visual.tone = 'cyan';
        } else if (/alarm|alert|notification/.test(value)) {
            visual.iconCls = 'x-fa fa-bell';
            visual.tone = 'orange';
        } else if (/smtp|mail server/.test(value)) {
            visual.iconCls = 'x-fa fa-paper-plane';
            visual.tone = 'indigo';
        } else if (/email|e-mail|template mail/.test(value)) {
            visual.iconCls = 'x-fa fa-envelope';
            visual.tone = 'orange';
        } else if (/api|webhook|developer|integration/.test(value)) {
            visual.iconCls = 'x-fa fa-code';
            visual.tone = 'gray';
        } else if (/dashboard|overview|painel/.test(value)) {
            visual.iconCls = 'x-fa fa-tachometer';
            visual.tone = 'red';
        } else if (/report|summary|relat|statistic|chart/.test(value)) {
            visual.iconCls = 'x-fa fa-bar-chart';
            visual.tone = 'purple';
        } else if (/history|log|audit/.test(value)) {
            visual.iconCls = 'x-fa fa-history';
            visual.tone = 'purple';
        } else if (/group.*admin|admin.*group/.test(value)) {
            visual.iconCls = 'x-fa fa-user-secret';
            visual.tone = 'blue';
        } else if (/group|team|grupo/.test(value)) {
            visual.iconCls = 'x-fa fa-users';
            visual.tone = 'green';
        } else if (/caller.?id|identity/.test(value)) {
            visual.iconCls = 'x-fa fa-user';
            visual.tone = 'orange';
        } else if (/callback|call back/.test(value)) {
            visual.iconCls = 'x-fa fa-reply';
            visual.tone = 'teal';
        } else if (/call online|callonline|calls online/.test(value)) {
            visual.iconCls = 'x-fa fa-phone';
            visual.tone = 'green';
        } else if (/sip|iax|phone|number|did/.test(value)) {
            visual.iconCls = 'x-fa fa-phone-square';
            visual.tone = 'cyan';
        } else if (/user|client|customer|usuario|cliente/.test(value)) {
            visual.iconCls = 'x-fa fa-user';
            visual.tone = 'blue';
        } else if (/buy credit|send credit|refill|payment|money/.test(value)) {
            visual.iconCls = 'x-fa fa-money';
            visual.tone = 'green';
        } else if (/billing|invoice|cobran|factur/.test(value)) {
            visual.iconCls = 'x-fa fa-credit-card';
            visual.tone = 'green';
        } else if (/rate|tariff|tarif|price/.test(value)) {
            visual.iconCls = 'x-fa fa-tags';
            visual.tone = 'orange';
        } else if (/route|trunk|provider|gateway/.test(value)) {
            visual.iconCls = 'x-fa fa-exchange';
            visual.tone = 'indigo';
        } else if (/cdr|call detail|call record/.test(value)) {
            visual.iconCls = 'x-fa fa-list-alt';
            visual.tone = 'purple';
        } else if (/configuration|setting|config|ajuste/.test(value)) {
            visual.iconCls = 'x-fa fa-sliders';
            visual.tone = 'gray';
        } else if (/campaign|broadcast|voice/.test(value)) {
            visual.iconCls = 'x-fa fa-bullhorn';
            visual.tone = 'red';
        } else if (/callshop|call shop/.test(value)) {
            visual.iconCls = 'x-fa fa-headphones';
            visual.tone = 'pink';
        } else if (/service|product/.test(value)) {
            visual.iconCls = 'x-fa fa-cubes';
            visual.tone = 'teal';
        } else if (/minute|time|clock/.test(value)) {
            visual.iconCls = 'x-fa fa-clock-o';
            visual.tone = 'teal';
        } else if (/ata|device|hardware/.test(value)) {
            visual.iconCls = 'x-fa fa-hdd-o';
            visual.tone = 'gray';
        } else if (/menu/.test(value)) {
            visual.iconCls = 'x-fa fa-th-large';
            visual.tone = 'blue';
        } else if (/extra|plugin|addon/.test(value)) {
            visual.iconCls = 'x-fa fa-puzzle-piece';
            visual.tone = visual.tone === 'gray' ? 'purple' : visual.tone;
        }
        return visual;
    },
    getMacDockIcon: function(text, module) {
        var value = (String(module || '') + ' ' + String(text || '')).toLowerCase();
        if (/summary|report|relat/.test(value)) {
            return 'x-fa fa-bar-chart';
        }
        if (/callonline|call online|calls online/.test(value)) {
            return 'x-fa fa-phone';
        }
        if (/sip|iax|user/.test(value)) {
            return 'x-fa fa-phone-square';
        }
        if (/refill|credit|recarga/.test(value)) {
            return 'x-fa fa-money';
        }
        if (/rate|tariff|tarif/.test(value)) {
            return 'x-fa fa-tags';
        }
        if (/trunk|route|rota/.test(value)) {
            return 'x-fa fa-exchange';
        }
        if (/cdr|call|chamada/.test(value)) {
            return 'x-fa fa-list-alt';
        }
        if (/setting|config/.test(value)) {
            return 'x-fa fa-cog';
        }
        return 'x-fa fa-th-large';
    },
    createSubMenu: function(subMenu) {
        var me = this,
            objModule,
            text,
            iconCls,
            desktopIconCls,
            action,
            hasAction,
            id;
        Ext.each(subMenu, function(item) {
            text = (item.text.indexOf('t(') !== -1) ? eval(item.text) : item.text;
            iconCls = item.iconCls || me.iconDefault;
            desktopIconCls = window.isMac ? me.getMacDockIcon(text, item.module) : iconCls;
            action = item.action;
            hasAction = Ext.isDefined(action);
            if (item.leaf) {
                id = item.module + 'window';
                objModule = Ext.clone(Ext.create('Ext.ux.desktop.Module', {
                    app: me,
                    id: id,
                    module: {
                        title: text,
                        iconCls: desktopIconCls,
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
                        iconCls: desktopIconCls,
                        module: id,
                        color: item.color
                    });
                }
                if (item.createQuickStart == 1) {
                    me.quickStart.push({
                        name: text,
                        iconCls: desktopIconCls,
                        module: id
                    });
                }
                item.text = text;
                item.iconCls = desktopIconCls;
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
            ret = me.callParent(),
            shortcutData = window.isMac ? me.macApplications : me.iconsDesktop,
            shortcutStore = Ext.create('Ext.data.Store', {
                fields: me.fieldsShortcut,
                data: shortcutData
            });
        return Ext.apply(ret, {
            cls: window.isMac ? 'mb-mac-desktop' : '',
            macApplicationMenus: me.macApplicationMenus,
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
            shortcuts: shortcutStore,
            macDesktopShortcuts: Ext.clone(me.iconsDesktop),
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
