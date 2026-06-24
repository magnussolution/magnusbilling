Ext.define('Overrides.ux.desktop.TaskBar', {
    override: 'Ext.ux.desktop.TaskBar',
    initComponent: function() {
        var me = this;
        if (!window.isMac) {
            return me.callParent(arguments);
        }

        me.quickStart = new Ext.toolbar.Toolbar(me.getQuickStart());
        me.windowBar = new Ext.toolbar.Toolbar(me.getWindowBarConfig());

        me.items = ['->', {
            xtype: 'toolbar',
            cls: 'mb-mac-dock',
            items: [me.quickStart, {
                xtype: 'splitter',
                html: '&#160;',
                height: 36,
                width: 1,
                cls: 'mb-mac-dock-separator'
            }, {
                xtype: 'button',
                cls: 'ux-start-button mb-mac-launcher',
                iconCls: 'mb-mac-applications-folder-icon',
                tooltip: t('Applications'),
                ariaLabel: t('Applications'),
                handler: function(button, event) {
                    me.app.showMacApplicationsFromClick(button, event);
                },
                listeners: {
                    afterrender: function(button) {
                        button.getEl().on({
                            mouseover: function(event) {
                                me.app.showMacApplicationsFromHover(button, event);
                            },
                            mouseleave: me.app.scheduleMacApplicationsHide,
                            scope: me.app
                        });
                    }
                }
            }, {
                xtype: 'button',
                cls: 'ux-start-button mb-mac-settings-launcher',
                iconCls: 'mb-mac-settings-icon',
                tooltip: t('Settings'),
                ariaLabel: t('Settings'),
                handler: function(button, event) {
                    me.app.showMacSettingsFromClick(button, event);
                },
                listeners: {
                    afterrender: function(button) {
                        button.getEl().on({
                            mouseover: function(event) {
                                me.app.showMacSettingsFromHover(button, event);
                            },
                            mouseleave: me.app.scheduleMacApplicationsHide,
                            scope: me.app
                        });
                    }
                }
            }, me.windowBar]
        }, '->'];

        Ext.toolbar.Toolbar.prototype.initComponent.call(me);
    },
    getQuickStart: function() {
        var me = this,
            ret = {
                minWidth: 20,
                width: window.isMac ? undefined : (window.isThemeClassic ? 150 : 160),
                cls: window.isMac ? 'mb-mac-quickstart' : '',
                items: [],
                enableOverflow: true
            };
        Ext.each(this.quickStart, function(item, index) {
            ret.items.push({
                tooltip: {
                    text: item.name,
                    align: 'bl-tl'
                },
                overflowText: item.name,
                iconCls: item.iconCls,
                module: item.module,
                cls: window.isMac ? 'mb-mac-dock-button mb-mac-dock-tone-' + (index % 6) : '',
                handler: me.onQuickStartClick,
                scope: me
            });
        });
        return ret;
    },
    getWindowBarConfig: function() {
        if (!window.isMac) {
            return this.callParent(arguments);
        }
        return {
            cls: 'ux-desktop-windowbar mb-mac-windowbar',
            items: [],
            enableOverflow: true,
            layout: {
                overflowHandler: 'Scroller'
            }
        };
    },
    addTaskButton: function(win) {
        if (window.isMac) {
            var toneIndex = this.windowBar.items.getCount() % 6,
                iconCls = win.iconCls || win.config.iconCls;
            if (!iconCls || iconCls.indexOf('x-fa') === -1) {
                iconCls = this.app.getMacDockIcon(win.title, win.module);
            }
            var dockButton = this.windowBar.add({
                glyph: win.config.glyph,
                iconCls: iconCls || 'x-fa fa-th-large',
                cls: 'mb-mac-dock-button mb-mac-window-button mb-mac-window-tone-' + toneIndex,
                enableToggle: true,
                toggleGroup: 'all',
                width: 44,
                height: 44,
                margin: '0 4 0 4',
                tooltip: win.title,
                ariaLabel: win.title,
                listeners: {
                    click: this.onWindowBtnClick,
                    scope: this
                },
                win: win
            });
            dockButton.toggle(true);
            return dockButton;
        }
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
