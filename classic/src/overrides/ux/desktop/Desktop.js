Ext.define('Overrides.ux.desktop.Desktop', {
    override: 'Ext.ux.desktop.Desktop',
    textTitle: t('Title'),
    textCascade: t('Cascade'),
    textRestore: t('Restore'),
    textMinimize: t('Minimize'),
    textMaximize: t('Maximize'),
    textClose: t('Close'),
    shortcutTpl: ['<tpl for=".">', '<div class="ux-desktop-shortcut" style="width:100px;" id="{module}-shortcut">', '<div class="ux-desktop-shortcut-icon {iconCls}" style="width:80px;" >', '<span style="font-family:icons; font-size: 48px; color: {color};"></span>', '<img src="', Ext.BLANK_IMAGE_URL, '" title="{name}">', '</div>', '<span class="ux-desktop-shortcut-text" >{name}</span>', '</div>', '</tpl>', '<div class="x-clear"></div>'],
    macShortcutTpl: [
        '<div class="mb-mac-app-directory">',
        '<div class="mb-mac-app-directory-heading">',
        '<span class="x-fa fa-th-large" aria-hidden="true"></span>',
        '<span class="mb-mac-directory-title">' + t('Applications') + '</span>',
        '</div>',
        '<div class="mb-mac-app-grid">',
        '<tpl for=".">',
        '<div class="mb-mac-application" id="{id}" role="button" tabindex="0" aria-label="{name}">',
        '<div class="mb-mac-app-icon mb-mac-app-icon-{tone}">',
        '<span class="mb-mac-app-symbol x-fa {iconCls}" aria-hidden="true"></span>',
        '</div>',
        '<span class="mb-mac-app-name">{name}</span>',
        '</div>',
        '</tpl>',
        '</div>',
        '</div>'
    ],
    macDirectoryItemsTpl: [
        '<tpl for=".">',
        '<button class="mb-mac-directory-item" type="button" data-menu-index="{menuIndex}" aria-label="{name}">',
        '<span class="mb-mac-app-icon mb-mac-app-icon-{tone}">',
        '<span class="mb-mac-app-symbol {iconCls}" aria-hidden="true"></span>',
        '<tpl if="isFolder"><span class="mb-mac-directory-folder-mark x-fa fa-chevron-right" aria-hidden="true"></span></tpl>',
        '</span>',
        '<span class="mb-mac-app-name">{name}</span>',
        '</button>',
        '</tpl>'
    ],
    macDesktopShortcutTpl: [
        '<tpl for=".">',
        '<div class="mb-mac-desktop-shortcut" role="button" tabindex="0" aria-label="{name}">',
        '<span class="mb-mac-app-icon mb-mac-app-icon-{tone}">',
        '<span class="mb-mac-app-symbol {iconCls}" aria-hidden="true"></span>',
        '</span>',
        '<span class="mb-mac-desktop-shortcut-name">{name}</span>',
        '</div>',
        '</tpl>'
    ],
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.on('boxready', me.organizeShortcuts, me);
        Ext.getWin().on('resize', me.organizeShortcuts, me);
        if (window.isMac) {
            Ext.getWin().on('resize', me.scheduleMacWindowConstraints, me);
            Ext.getWin().on('resize', me.syncMacDashboardWidgetPosition, me);
        }
    },
    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.shortcuts.on('datachanged', me.organizeShortcuts, me);
        if (window.isMac) {
            me.shortcutsView.el.on('click', me.onMacDirectoryClick, me);
            me.renderMacDesktopShortcuts();
            me.scheduleMacDashboardWidgetRender();
            me.on('boxready', me.scheduleMacDashboardWidgetRender, me, {
                single: true
            });
            me.on('afterlayout', me.scheduleMacDashboardWidgetRender, me, {
                single: true
            });
            me.on('resize', me.constrainMacWindows, me);
        }
    },
    scheduleMacDashboardWidgetRender: function () {
        var me = this;

        if (!me.isMacWorkspaceActive() || me.macDashboardWidget || me.macDashboardWidgetRetryCount > 20) {
            return;
        }
        me.macDashboardWidgetRetryCount = (me.macDashboardWidgetRetryCount || 0) + 1;
        Ext.defer(function () {
            if (me.destroyed || me.macDashboardWidget) {
                return;
            }
            me.renderMacDashboardWidgets();
            if (!me.macDashboardWidget) {
                me.scheduleMacDashboardWidgetRender();
            }
        }, me.macDashboardWidgetRetryCount === 1 ? 80 : 350, me);
    },
    isMacWorkspaceActive: function () {
        var body = Ext.getBody && Ext.getBody(),
            html = Ext.fly(document.documentElement);

        return window.isMac || (body && body.hasCls('mb-macos')) || (html && html.hasCls('mb-macos'));
    },
    hasMacDashboardAccess: function () {
        return !!(window.App && App.user && (App.user.isAdmin === true || App.user.isAdmin === 1 || App.user.isAdmin === '1'));
    },
    renderMacDashboardWidgets: function () {
        var me = this;

        if (!me.isMacWorkspaceActive() || !me.hasMacDashboardAccess() || !me.body || me.macDashboardWidget) {
            return;
        }

        Ext.require([
            'MBilling.store.StatusSystem',
            'MBilling.store.CallOnlineChart',
            'MBilling.store.TrunkChart'
        ], function () {
            if (!me.body || me.destroyed || me.macDashboardWidget) {
                return;
            }
            me.macDashboardWidgetRetryCount = 0;
            me.macDashboardData = {
                status: {},
                calls: [],
                trunks: []
            };
            me.macStatusStore = Ext.create('MBilling.store.StatusSystem');
            me.macCallsStore = Ext.create('MBilling.store.CallOnlineChart');
            me.macTrunksStore = Ext.create('MBilling.store.TrunkChart');
            me.macDashboardWidget = Ext.create('Ext.Component', {
                renderTo: me.body,
                cls: 'mb-mac-dashboard-widget',
                width: 376,
                height: 432,
                x: 28,
                y: 42,
                style: {
                    position: 'absolute',
                    zIndex: 3
                },
                html: me.buildMacDashboardHtml(),
                listeners: {
                    afterrender: function (widget) {
                        me.macDashboardWidget = widget;
                        widget.el.setStyle({
                            position: 'absolute',
                            zIndex: 3
                        });
                        widget.el.on('click', function (event, target) {
                            if (event.getTarget('.mb-mac-widget-open-dashboard', widget.el.dom)) {
                                event.stopEvent();
                                me.openMacDashboardModule();
                            }
                        });
                        me.syncMacDashboardWidgetPosition();
                        me.loadMacDashboardWidgets();
                        me.macDashboardTask = Ext.create('Ext.util.DelayedTask', function () {
                            me.loadMacDashboardWidgets();
                            me.macDashboardTask.delay(15000);
                        }, me);
                        me.macDashboardTask.delay(15000);
                    }
                }
            });
        });
    },
    openMacDashboardModule: function () {
        var me = this,
            modules,
            module,
            win;

        if (!me.hasMacDashboardAccess()) {
            return;
        }
        module = me.app.getModule('dashboardwindow') || me.app.getModule('dashboard');
        if (!module) {
            modules = me.app.getModules ? me.app.getModules() : [];
            module = Ext.Array.findBy(modules, function (item) {
                return item && item.module && item.module.module === 'dashboard';
            });
        }
        win = module && module.createWindow();
        if (win) {
            me.restoreWindow(win);
        }
    },
    loadMacDashboardWidgets: function () {
        var me = this;

        if (!me.hasMacDashboardAccess() || !me.macDashboardWidget || me.macDashboardWidget.destroyed) {
            return;
        }
        if (me.macStatusStore) {
            me.macStatusStore.load({
                scope: me,
                callback: function (records) {
                    me.macDashboardData.status = records && records[0] ? Ext.apply({}, records[0].data) : {};
                    me.updateMacDashboardWidgets();
                }
            });
        }
        if (me.macCallsStore) {
            me.macCallsStore.setRemoteFilter(true);
            me.macCallsStore.filter('hours', 1);
            me.macCallsStore.load({
                scope: me,
                callback: function (records) {
                    me.macDashboardData.calls = Ext.Array.map(records || [], function (record) {
                        return Ext.apply({}, record.data);
                    }).reverse();
                    me.updateMacDashboardWidgets();
                }
            });
        }
        if (me.macTrunksStore) {
            me.macTrunksStore.load({
                scope: me,
                callback: function (records) {
                    me.macDashboardData.trunks = Ext.Array.map(records || [], function (record) {
                        return Ext.apply({}, record.data);
                    });
                    me.updateMacDashboardWidgets();
                }
            });
        }
    },
    updateMacDashboardWidgets: function () {
        if (this.hasMacDashboardAccess() && this.macDashboardWidget && !this.macDashboardWidget.destroyed) {
            this.macDashboardWidget.update(this.buildMacDashboardHtml());
        }
    },
    getMacDashboardNumber: function (value, fallback) {
        if (Ext.isEmpty(value) || value === 'undefined') {
            return Ext.isDefined(fallback) ? fallback : '0';
        }
        return value;
    },
    getMacDashboardMetric: function (title, value, iconCls, tone) {
        return '<div class="mb-mac-widget-metric mb-mac-widget-' + tone + '">' +
            '<span class="mb-mac-widget-icon x-fa ' + iconCls + '"></span>' +
            '<span class="mb-mac-widget-value">' + Ext.String.htmlEncode(String(value)) + '</span>' +
            '<span class="mb-mac-widget-label">' + Ext.String.htmlEncode(title) + '</span>' +
            '</div>';
    },
    getMacDashboardCallChart: function (records) {
        var totalValues = [],
            answerValues = [],
            allValues,
            max,
            totalPoints = [],
            answerPoints = [],
            buildPoints;

        Ext.each(records || [], function (record) {
            var total = parseFloat(record.total),
                answer = parseFloat(record.answer);
            if (!isNaN(total)) {
                totalValues.push(total);
            }
            if (!isNaN(answer)) {
                answerValues.push(answer);
            }
        });
        totalValues = totalValues.slice(-28);
        answerValues = answerValues.slice(-28);
        if (!totalValues.length) {
            totalValues = [0, 0, 0, 0, 0, 0];
        }
        if (!answerValues.length) {
            answerValues = [0, 0, 0, 0, 0, 0];
        }
        allValues = totalValues.concat(answerValues);
        max = Math.max.apply(Math, allValues);
        if (!max) {
            max = 1;
        }
        buildPoints = function (values) {
            var points = [];
            Ext.each(values, function (value, index) {
                var x = values.length === 1 ? 120 : (index * (240 / (values.length - 1))),
                    y = 76 - ((value / max) * 58);
                points.push(x.toFixed(1) + ',' + y.toFixed(1));
            });
            return points;
        };
        totalPoints = buildPoints(totalValues);
        answerPoints = buildPoints(answerValues);
        return '<svg class="mb-mac-widget-sparkline" viewBox="0 0 240 86" preserveAspectRatio="none" aria-label="' + Ext.String.htmlEncode(t('Simultaneous calls')) + '">' +
            '<defs>' +
            '<linearGradient id="mbMacTotalLine" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#b7d45c" stop-opacity=".55"/><stop offset="1" stop-color="#6f8718" stop-opacity=".95"/></linearGradient>' +
            '<linearGradient id="mbMacAnswerLine" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#7cc8ff" stop-opacity=".55"/><stop offset="1" stop-color="#0a5eb8" stop-opacity=".95"/></linearGradient>' +
            '</defs>' +
            '<line x1="0" x2="240" y1="18" y2="18" class="mb-mac-widget-gridline"/>' +
            '<line x1="0" x2="240" y1="47" y2="47" class="mb-mac-widget-gridline"/>' +
            '<line x1="0" x2="240" y1="76" y2="76" class="mb-mac-widget-gridline"/>' +
            '<polyline points="' + totalPoints.join(' ') + '" fill="none" stroke="url(#mbMacTotalLine)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<polyline points="' + answerPoints.join(' ') + '" fill="none" stroke="url(#mbMacAnswerLine)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
    },
    buildMacDashboardHtml: function () {
        var data = this.macDashboardData || {},
            status = data.status || {},
            calls = data.calls || [],
            trunks = data.trunks || [],
            currentCalls = calls.length ? calls[calls.length - 1] : {},
            cpu = this.getMacDashboardNumber(status.cpuPercent),
            activeUsers = this.getMacDashboardNumber(status.totalActiveUsers),
            monthProfit = this.getMacDashboardNumber(status.monthprofit),
            callTotal = this.getMacDashboardNumber(currentCalls.total),
            callAnswer = this.getMacDashboardNumber(currentCalls.answer),
            currency = App.user.currency || '';

        return '<div class="mb-mac-widget-shell">' +
            '<div class="mb-mac-widget-top">' +
            '<div><div class="mb-mac-widget-kicker">' + Ext.String.htmlEncode(t('Dashboard')) + '</div>' +
            '<div class="mb-mac-widget-title"></div></div>' +
            '<div class="mb-mac-widget-live"><span></span>' + Ext.String.htmlEncode(t('Live')) + '</div>' +
            '</div>' +
            '<div class="mb-mac-widget-grid">' +
            this.getMacDashboardMetric('CPU', cpu + '%', 'fa-server', 'blue') +
            this.getMacDashboardMetric(t('Calls'), callTotal, 'fa-phone', 'orange') +
            this.getMacDashboardMetric(t('Active users'), activeUsers, 'fa-users', 'green') +
            this.getMacDashboardMetric(t('Month profit'), currency + ' ' + monthProfit, 'fa-line-chart', 'purple') +
            '</div>' +
            '<div class="mb-mac-widget-card mb-mac-widget-card-large">' +
            '<div class="mb-mac-widget-card-head"><span>' + Ext.String.htmlEncode(t('Simultaneous calls')) + '</span><strong>' + Ext.String.htmlEncode(String(callTotal)) + '</strong></div>' +
            this.getMacDashboardCallChart(calls) +
            '<div class="mb-mac-widget-card-foot"><span><i class="mb-mac-widget-dot mb-mac-widget-dot-total"></i>' + Ext.String.htmlEncode(t('Total')) + ': ' + Ext.String.htmlEncode(String(callTotal)) + '</span><span><i class="mb-mac-widget-dot mb-mac-widget-dot-answer"></i>' + Ext.String.htmlEncode(t('Answered')) + ': ' + Ext.String.htmlEncode(String(callAnswer)) + '</span></div>' +
            '</div>' +
            '<button class="mb-mac-widget-open-dashboard" type="button">' + t('See more') + '<span class="x-fa fa-chevron-right"></span></button>' +
            '</div>';
    },
    syncMacDashboardWidgetPosition: function () {
        var me = this,
            widget = me.macDashboardWidget,
            bodyWidth,
            bodyHeight,
            width,
            height;

        if (!me.isMacWorkspaceActive() || !widget || widget.destroyed || !me.body) {
            return;
        }
        if (!me.hasMacDashboardAccess()) {
            widget.hide();
            return;
        }
        bodyWidth = me.body.getWidth();
        bodyHeight = me.body.getHeight();
        if (bodyWidth < 980) {
            widget.hide();
            return;
        }
        widget.show();
        if (widget.el) {
            widget.el.setStyle({
                position: 'absolute',
                zIndex: 3
            });
        }
        width = Math.min(Math.max(bodyWidth * 0.25, 330), 370);
        height = 456;
        widget.setSize(width, height);
        widget.setPosition(28, 42);
    },
    renderMacDesktopShortcuts: function () {
        var me = this,
            shortcuts = me.macDesktopShortcuts || [],
            data = [];

        if (!window.isMac || !me.body) {
            return;
        }
        Ext.each(shortcuts, function (shortcut, index) {
            var visual = me.app.getMacMenuItemVisual(shortcut.name, shortcut.module, false, index);
            data.push(Ext.apply(Ext.apply({}, shortcut), {
                iconCls: shortcut.iconCls || visual.iconCls,
                name: Ext.String.htmlEncode(shortcut.name || ''),
                tone: visual.tone
            }));
        });
        me.macDesktopShortcutsView = Ext.create('Ext.view.View', {
            renderTo: me.body,
            cls: 'mb-mac-desktop-shortcuts',
            overItemCls: 'mb-mac-desktop-shortcut-over',
            selectedItemCls: 'mb-mac-desktop-shortcut-selected',
            trackOver: true,
            itemSelector: 'div.mb-mac-desktop-shortcut',
            store: Ext.create('Ext.data.Store', {
                fields: me.app.fieldsShortcut,
                data: data
            }),
            tpl: new Ext.XTemplate(me.macDesktopShortcutTpl),
            listeners: {
                itemclick: me.openMacDesktopShortcut,
                itemkeydown: function (view, record, item, index, event) {
                    if (event.getKey() === event.ENTER || event.getKey() === event.SPACE) {
                        event.stopEvent();
                        me.openMacDesktopShortcut(view, record);
                    }
                },
                scope: me
            }
        });
    },
    openMacDesktopShortcut: function (view, record) {
        var me = this,
            module = me.app.getModule(record.get('module')),
            win = module && module.createWindow();

        if (win) {
            me.restoreWindow(win);
        }
    },
    createWindow: function (config, cls) {
        var me = this,
            win = me.callParent(arguments);

        if (window.isMac && win) {
            win.on({
                show: function () {
                    Ext.defer(me.constrainMacWindow, 10, me, [win]);
                },
                maximize: function () {
                    Ext.defer(me.constrainMacWindow, 10, me, [win, true]);
                },
                restore: function () {
                    Ext.defer(me.constrainMacWindow, 10, me, [win]);
                }
            });
            win.on('boxready', function () {
                me.decorateMacWindowControls(win);
                Ext.defer(me.constrainMacWindow, 10, me, [win]);
            }, me, {
                single: true
            });
        }
        return win;
    },
    decorateMacWindowControls: function (win) {
        var header = win && win.getHeader ? win.getHeader() : null;

        if (!window.isMac || !header || !header.el) {
            return;
        }
        Ext.Array.each(header.el.query('.x-tool'), function (toolNode) {
            var tool = Ext.get(toolNode),
                image = tool.down('.x-tool-img');

            if (!image) {
                return;
            }
            if (image.hasCls('x-tool-close')) {
                tool.addCls('mb-mac-window-control mb-mac-window-close');
            } else if (image.hasCls('x-tool-minimize')) {
                tool.addCls('mb-mac-window-control mb-mac-window-minimize');
            } else if (image.hasCls('x-tool-maximize') || image.hasCls('x-tool-restore')) {
                tool.addCls('mb-mac-window-control mb-mac-window-zoom');
            }
        });
    },
    getMacWindowBounds: function (win) {
        var targetEl = win.floatParent ? win.floatParent.getTargetEl() : this.body,
            targetBox = targetEl.getBox(),
            taskbarBox = this.taskbar && this.taskbar.el ? this.taskbar.el.getBox() : null,
            inset = 8,
            dockGap = 12,
            bottom = taskbarBox ? taskbarBox.y - targetBox.y - dockGap : targetBox.height - inset;

        return {
            x: inset,
            y: inset,
            width: Math.max(targetBox.width - (inset * 2), 100),
            height: Math.max(bottom - inset, 100)
        };
    },
    constrainMacWindow: function (win, forceMaximized) {
        var bounds,
            position,
            width,
            height,
            x,
            y;

        if (!window.isMac || !win || win.destroyed || !win.rendered || !win.isVisible()) {
            return;
        }
        bounds = this.getMacWindowBounds(win);
        if (forceMaximized || win.maximized) {
            win.setSize(bounds.width, bounds.height);
            win.setPosition(bounds.x, bounds.y);
            return;
        }
        position = win.getPosition(true);
        width = Math.min(win.getWidth(), bounds.width);
        height = Math.min(win.getHeight(), bounds.height);
        x = Ext.Number.constrain(position[0], bounds.x, bounds.x + bounds.width - width);
        y = Ext.Number.constrain(position[1], bounds.y, bounds.y + bounds.height - height);
        win.setSize(width, height);
        win.setPosition(x, y);
    },
    constrainMacWindows: function () {
        var me = this;
        if (!window.isMac || !me.windows) {
            return;
        }
        me.windows.each(function (win) {
            me.constrainMacWindow(win, win.maximized);
        });
    },
    scheduleMacWindowConstraints: function () {
        Ext.defer(this.constrainMacWindows, 60, this);
    },
    createDesktopMenu: function () {
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
    createWindowMenu: function () {
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
    createDataView: function () {
        var me = this;
        if (window.isMac) {
            return {
                xtype: 'dataview',
                cls: 'mb-mac-app-directory-host',
                overItemCls: 'mb-mac-application-over',
                selectedItemCls: 'mb-mac-application-selected',
                trackOver: true,
                itemSelector: 'div.mb-mac-application',
                store: me.shortcuts,
                style: {
                    position: 'absolute'
                },
                x: 0,
                y: 0,
                tpl: new Ext.XTemplate(me.macShortcutTpl),
                listeners: {
                    itemkeydown: function (view, record, item, index, event) {
                        if (event.getKey() === event.ENTER || event.getKey() === event.SPACE) {
                            event.stopEvent();
                            me.openMacApplication(record, item);
                        }
                    }
                }
            };
        }
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
    onShortcutItemClick: function (dataView, record, item) {
        if (window.isMac) {
            return this.openMacApplication(record, item);
        }
        return this.callParent(arguments);
    },
    openMacApplication: function (record, item) {
        var me = this,
            index = record.get('menuIndex'),
            menuItems = me.macApplicationMenus && me.macApplicationMenus[index];

        if (!menuItems) {
            return;
        }
        me.app.cancelMacApplicationsHide();
        me.app.macApplicationsKeepOpenUntilMove = true;
        me.macDirectoryStack = [];
        me.renderMacApplicationDirectory(record.get('name'), menuItems);
    },
    getMacDirectoryItems: function (menu) {
        if (Ext.isArray(menu)) {
            return menu;
        }
        if (menu && menu.items) {
            return menu.items.items || menu.items;
        }
        return [];
    },
    renderMacApplicationDirectory: function (title, menuItems) {
        var me = this,
            directory = me.shortcutsView.el.down('.mb-mac-app-directory'),
            heading,
            grid,
            visualItems = [];

        if (!directory) {
            return;
        }
        heading = directory.down('.mb-mac-app-directory-heading');
        grid = directory.down('.mb-mac-app-grid');
        me.macCurrentDirectory = {
            title: title,
            items: menuItems
        };
        Ext.each(menuItems, function (menuItem, index) {
            var children,
                visual;
            if (!menuItem || Ext.isString(menuItem) || menuItem.hidden === true) {
                return;
            }
            children = me.getMacDirectoryItems(menuItem.menu);
            visual = me.app.getMacMenuItemVisual(menuItem.text, menuItem.module, children.length > 0, index);
            visualItems.push({
                menuIndex: index,
                name: Ext.String.htmlEncode(menuItem.text || ''),
                iconCls: visual.iconCls,
                tone: visual.tone,
                isFolder: children.length > 0
            });
        });
        heading.setHtml(
            '<button class="mb-mac-directory-back" type="button" aria-label="' + Ext.String.htmlEncode(t('Back')) + '">' +
            '<span class="x-fa fa-chevron-left" aria-hidden="true"></span>' +
            '</button>' +
            '<span class="mb-mac-directory-title">' + Ext.String.htmlEncode(title) + '</span>'
        );
        grid.setHtml(new Ext.XTemplate(me.macDirectoryItemsTpl).apply(visualItems));
        me.app.positionMacApplications();
    },
    onMacDirectoryClick: function (event) {
        var me = this,
            back = event.getTarget('.mb-mac-directory-back', me.shortcutsView.el.dom),
            target = event.getTarget('.mb-mac-directory-item', me.shortcutsView.el.dom),
            menuItem,
            children,
            previous;

        if (back) {
            event.stopEvent();
            me.app.cancelMacApplicationsHide();
            me.app.macApplicationsKeepOpenUntilMove = true;
            previous = me.macDirectoryStack && me.macDirectoryStack.pop();
            if (previous) {
                me.renderMacApplicationDirectory(previous.title, previous.items);
            } else {
                me.resetMacApplicationDirectory();
                me.app.positionMacApplications();
            }
            return;
        }
        if (!target || !me.macCurrentDirectory) {
            return;
        }
        event.stopEvent();
        me.app.cancelMacApplicationsHide();
        menuItem = me.macCurrentDirectory.items[parseInt(target.getAttribute('data-menu-index'), 10)];
        if (!menuItem) {
            return;
        }
        children = me.getMacDirectoryItems(menuItem.menu);
        if (children.length) {
            me.app.macApplicationsKeepOpenUntilMove = true;
            me.macDirectoryStack = me.macDirectoryStack || [];
            me.macDirectoryStack.push(me.macCurrentDirectory);
            me.renderMacApplicationDirectory(menuItem.text, children);
            return;
        }
        if (Ext.isFunction(menuItem.handler)) {
            menuItem.handler.call(menuItem.scope || me.app, menuItem);
        }
        me.app.hideMacApplications(true);
    },
    resetMacApplicationDirectory: function () {
        if (!this.macCurrentDirectory) {
            return;
        }
        this.macCurrentDirectory = null;
        this.macDirectoryStack = [];
        this.shortcutsView.refresh();
    },
    organizeShortcuts: function () {
        var me = this,
            dataView = me.shortcutsView,
            dataViewHeight = dataView.getHeight(),
            top = 10,
            left = window.isMac ? Math.max(dataView.getWidth() - 108, 0) : 0,
            height = 0,
            id,
            shortcut;
        if (window.isMac) {
            return;
        }
        dataView.getStore().each(function (rec) {
            id = rec.get('module');
            if (Ext.isDefined(id)) {
                id = id + '-shortcut';
                shortcut = Ext.get(id);
                shortcut.setTop(top);
                shortcut.setLeft(left);
                height = shortcut.getHeight();
                top = top + 84;
                if (top + height > dataViewHeight) {
                    left = left + (window.isMac ? -100 : 90);
                    top = 10;
                }
            }
        }, me);
    }
});
