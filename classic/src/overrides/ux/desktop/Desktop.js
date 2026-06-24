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
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.on('boxready', me.organizeShortcuts, me);
        Ext.getWin().on('resize', me.organizeShortcuts, me);
        if (window.isMac) {
            Ext.getWin().on('resize', me.scheduleMacWindowConstraints, me);
        }
    },
    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.shortcuts.on('datachanged', me.organizeShortcuts, me);
        if (window.isMac) {
            me.shortcutsView.el.on('click', me.onMacDirectoryClick, me);
            me.on('resize', me.constrainMacWindows, me);
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
