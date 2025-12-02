Ext.define('MBilling.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',
    requires: ['Ext.Img',
        // this is the classic MAINcontroller 
        'Ext.layout.container.Accordion', 'Ext.tab.Panel', 'Ext.dashboard.Dashboard', 'MBilling.view.main.LoginController', 'MBilling.view.main.ImportWallpaper'
    ],
    msgLogout: t('Do you really want to leave the system?'),
    textLogout: t('Exit'),
    titleWarning: t('Warning'),
    msgFieldsRequired: t('Fill in the fields correctly.'),
    routes: {
        ':node': 'onRouteChange'
    },
    onRouteChange: function(id) {
        id = (id || '').toLowerCase();
        window.hashTag = id;
    },
    init: function() {
        var me = this;
        me.runnerInfoSystem = Ext.create('Ext.util.TaskRunner');
        me.callParent(arguments);
        App.callLogout = me.callLogout;
    },
    loadMenuStandard: function(menu) {
        var me = this,
            modules = [],
            menuText,
            text,
            iconCls;
        menu.setLoading();
        Ext.each(App.user.menu, function(menuItem) {
            if (!Ext.isEmpty(menuItem.rows)) {
                Ext.each(menuItem.rows, function(item) {
                    text = (item.text.indexOf('t(') !== -1) ? eval(item.text) : item.text;
                    modules.push({
                        text: text,
                        iconCls: window.isTablet || window.isTablets ? '' : item.iconCls,
                        module: item.module,
                        leaf: item.leaf,
                        id: 'children-' + item.module,
                        children: me.formatSubModuleStandard(item.rows),
                        action: item.action
                    });
                }, me);
            }
            menuText = (menuItem.text.indexOf('t(') !== -1) ? eval(menuItem.text) : menuItem.text;
            iconCls = menuItem.iconCls || 'file3';
            if (window.isTablets) {
                menu.add({
                    rootVisible: true,
                    root: {
                        text: menuText,
                        children: modules
                    }
                });
            } else {
                menu.add({
                    title: menuText,
                    root: {
                        children: modules
                    },
                    iconCls: menuItem.iconCls
                });
            }
            modules = [];
        }, me);
        menu.setLoading(false);
    },
    formatSubModuleStandard: function(menu) {
        var me = this,
            text;
        Ext.each(menu, function(item) {
            text = (item.text.indexOf('t(') !== -1) ? eval(item.text) : item.text;
            item.text = text;
            item.children = me.formatSubModuleStandard(item.rows);
        }, me);
        return menu;
    },
    createTabStandard: function(view, record) {
        var me = this,
            tabOpen,
            module,
            action,
            hasAction,
            txt = record.get('text'),
            iconCls = record.get('iconCls') || 'file3',
            tabPanelCenter = me.lookupReference('tabPanelCenter');
        if (record.get('leaf')) {
            tabOpen = tabPanelCenter.items.findBy(function(tab) {
                return tab.title === txt;
            });
            if (!tabOpen) {
                module = record.get('module');
                action = record.get('action');
                hasAction = Ext.isDefined(action);
                tabPanelCenter.add({
                    xtype: module + 'module',
                    title: txt,
                    autoDestroy: true,
                    closable: true,
                    iconCls: iconCls,
                    module: module,
                    allowCreate: hasAction ? action.search('c') !== -1 : false,
                    allowUpdate: hasAction ? action.search('u') !== -1 : false,
                    allowDelete: hasAction ? action.search('d') !== -1 : false
                }).show();
            } else {
                tabPanelCenter.setActiveTab(tabOpen);
            }
        }
        if (window.isTablet) {
            tabPanelCenter.getTabBar().setVisible(false);
            me.lookupReference('tabPanelMenu').collapse();
        }
    },
    importLogo: function(menuItem) {
        var me = this;
        if (me.winLogo && me.winLogo.isVisible()) {
            return;
        }
        me.winLogo = Ext.widget('importlogo', {
            title: menuItem.text,
            glyph: menuItem.glyph
        });
    },
    saveLogo: function() {
        var me = this,
            view = me.getView(),
            btnSave = me.lookupReference('saveImportLogo'),
            formPanel = me.lookupReference('formImportLogo'),
            fieldImportLogo = formPanel.getForm().findField('logo'),
            values = Ext.apply(formPanel.getValues(), {
                formImportLogo: fieldImportLogo.getValue()
            });
        if (!formPanel.isValid()) {
            Ext.ux.Alert.alert(view.titleWarning, view.msgFormInvalid, 'warning');
            return;
        }
        btnSave.disable();
        formPanel.setLoading();
        formPanel.getForm().submit({
            url: 'index.php/authentication/importLogo',
            params: values,
            success: function(form, action) {
                var obj = Ext.decode(action.response.responseText);
                if (obj.success) {
                    Ext.ux.Alert.alert(me.titleSuccess, t(obj.msg), 'success');
                } else {
                    errors = Helper.Util.convertErrorsJsonToString(obj.msg);
                    if (!Ext.isObject(obj.errors)) {
                        Ext.ux.Alert.alert(me.titleError, errors, 'error');
                    } else {
                        Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
                    }
                }
                formPanel.setLoading(false);
                btnSave.enable();
            }
        });
    },
    importWallpaper: function(menuItem) {
        var me = this;
        if (me.winImportwallpaper && me.winImportwallpaper.isVisible()) {
            return;
        }
        me.winImportwallpaper = Ext.widget('importwallpaper', {
            title: menuItem.text,
            glyph: menuItem.glyph
        });
    },
    importLoginBackground: function(menuItem) {
        var me = this;
        if (me.winLoginBackground && me.winLoginBackground.isVisible()) {
            return;
        }
        me.winLoginBackground = Ext.widget('importloginbackground', {
            title: menuItem.text,
            glyph: menuItem.glyph
        });
    },
    saveImportLoginBackground: function() {
        var me = this,
            view = me.getView(),
            btnSave = me.lookupReference('saveImportLoginBackground'),
            formPanel = me.lookupReference('formImportLoginBackground');
        fieldImportLoginBackground = formPanel.getForm().findField('loginbackground');
        values = Ext.apply(formPanel.getValues(), {
            formImportLogo: fieldImportLoginBackground.getValue()
        });
        if (!formPanel.isValid()) {
            Ext.ux.Alert.alert(view.titleWarning, view.msgFormInvalid, 'warning');
            return;
        }
        if (fieldImportLoginBackground.getValue().toUpperCase().indexOf('JPG') == -1) {
            Ext.ux.Alert.alert(view.titleWarning, view.msgFormInvalid + "<br>" + t('Invalid format'), 'warning');
            return;
        } else {
            btnSave.disable();
            formPanel.setLoading();
            formPanel.getForm().submit({
                url: 'index.php/authentication/importLoginBackground',
                params: values,
                success: function(form, action) {
                    var obj = Ext.decode(action.response.responseText);
                    if (obj.success) {
                        Ext.ux.Alert.alert(me.titleSuccess, t(obj.msg), 'success');
                    } else {
                        errors = Helper.Util.convertErrorsJsonToString(obj.msg);
                        if (!Ext.isObject(obj.errors)) {
                            Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                        } else {
                            Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
                        }
                    }
                    formPanel.setLoading(false);
                    btnSave.enable();
                }
            });
        }
    },
    saveWallpaper: function() {
        var me = this,
            view = me.getView(),
            btnSave = me.lookupReference('saveImportWallpaper'),
            formPanel = me.lookupReference('formImportWallpaper'),
            fieldImportWallpaper = formPanel.getForm().findField('wallpaper'),
            values = Ext.apply(formPanel.getValues(), {
                formImportLogo: fieldImportWallpaper.getValue()
            });
        if (!formPanel.isValid()) {
            Ext.ux.Alert.alert(view.titleWarning, view.msgFormInvalid, 'warning');
            return;
        }
        if (fieldImportWallpaper.getValue().toUpperCase().indexOf('JPG') == -1) {
            Ext.ux.Alert.alert(view.titleWarning, view.msgFormInvalid + "<br>" + t('Invalid format'), 'warning');
            return;
        }
        btnSave.disable();
        formPanel.setLoading();
        formPanel.getForm().submit({
            url: 'index.php/authentication/importWallpapers',
            params: values,
            success: function(form, action) {
                var obj = Ext.decode(action.response.responseText);
                if (obj.success) {
                    Ext.ux.Alert.alert(me.titleSuccess, t(obj.msg), 'success');
                } else {
                    errors = Helper.Util.convertErrorsJsonToString(obj.msg);
                    if (!Ext.isObject(obj.errors)) {
                        Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                    } else {
                        Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
                    }
                }
                formPanel.setLoading(false);
                btnSave.enable();
            }
        });
    },
    onSetData: function(btn) {
        var me = this,
            loginWin = me.getView(),
            fieldEmail = me.lookupReference('email'),
            fieldCountryiso = me.lookupReference('countryiso'),
            fieldCurrency = me.lookupReference('currency');
        if (!fieldEmail.isValid() || !fieldCountryiso.isValid() || !fieldCurrency.isValid()) {
            Ext.ux.Alert.alert(me.titleWarning, t('Fill in the fields correctly.'), 'warning');
            return false;
        }
        loginWin.setLoading(me.msgAuthenticating);
        Ext.Ajax.request({
            url: 'index.php/configuration/setData',
            params: {
                email: fieldEmail.getValue(),
                countryiso: fieldCountryiso.getValue(),
                currency: fieldCurrency.getValue()
            },
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response.success) {
                    location.reload()
                } else {
                    Ext.ux.Alert.alert(me.titleErrorInAuthentication, response.msg, 'error');
                    fieldUser.focus(true);
                    loginWin.setLoading(false);
                }
            }
        });
    },
    openHelp: function(menuItem) {
        var me = this;
        if (me.winHelp && me.winHelp.isVisible()) {
            return;
        }
        me.winHelp = Ext.widget('window', {
            title: menuItem.text,
            glyph: menuItem.glyph,
            autoShow: true,
            width: 800,
            height: 450,
            layout: 'fit',
            border: false,
            items: {
                xtype: 'help'
            }
        });
    },
    openChangePassword: function(menuItem) {
        var me = this;
        if (me.winChangePassword && me.winChangePassword.isVisible()) {
            return;
        }
        me.winChangePassword = Ext.widget('changepassword', {
            title: menuItem.text,
            glyph: menuItem.glyph
        });
    },
    openAbout: function(menuItem) {
        var me = this;
        if (me.winAbout && me.winAbout.isVisible()) {
            return;
        }
        me.winAbout = Ext.widget('about', {
            title: menuItem.text,
            glyph: menuItem.glyph
        });
    },
    openSettings: function(menuItem) {
        var me = this;
        if (me.winSettings && me.winSettings.isVisible()) {
            return;
        }
        me.winSettings = Ext.widget('window', {
            title: menuItem.text,
            glyph: menuItem.glyph,
            autoShow: true,
            width: 900,
            height: 520,
            layout: 'fit',
            border: false,
            items: {
                xtype: 'settings'
            }
        });
    },
    logout: function() {
        var me = this;
        Ext.Msg.confirm(me.textLogout, me.msgLogout, function(opt) {
            if (opt === 'yes') {
                me.callLogout();
            }
        });
    },
    callLogout: function() {
        var me = this;
        window.isDesktop ? App.desktop.setLoading() : App.mainView.setLoading();
        Ext.Ajax.request({
            url: 'index.php/authentication/logoff',
            success: function() {
                App.user.logged = false;
                location.reload();
            }
        });
    },
    getManual: function(view, record) {
        if (!record.get('leaf')) {
            return;
        }
        var panelManual = this.lookupReference('manualPanel');
        panelManual.getLoader().url = record.get('url');
        panelManual.getLoader().load();
    },
    changeActivatedTab: function(tabPanel, newCard) {
        var me = this;
        //get the menu tab panel
        tabPanelMenu = me.lookupReference('tabPanelMenu');
        //loop per menus
        for (var i = 0, l = tabPanelMenu.items.items.length; i < l; i++) {
            //get sub menus
            submenu = tabPanelMenu.items.items[i].getRootNode();
            //loop per submenus
            for (var s = 0, t = submenu.childNodes.length; s < t; s++) {
                //if sub-menu module name is equal activated tab module name, expand that.
                if (submenu.childNodes[s].data.module == tabPanel.activeTab.module) {
                    tabPanelMenu.items.items[i].expand();
                    submenu.childNodes[s].addCls('x-grid-item-selected-activated');
                } else {
                    submenu.childNodes[s].removeCls('x-grid-item-selected-activated');
                }
            }
        }
    },
    // active_class: 'active',
    setRunnerInfoSystem: function() {
        var me = this;
        if (!window.isDesktop || !App.user.isAdmin || window.isTablets) {
            return;
        }
        this.lookupReference('statusBar').show();
        me.runnerInfoSystem.start({
            run: me.setInfoSystem,
            interval: 7000,
            scope: me
        });
    },
    setInfoSystem: function() {
        var me = this;
        Ext.Ajax.request({
            url: 'index.php/statusSystem/statusSystemDesktop',
            success: function(response) {
                response = Ext.decode(response.responseText);
                me.lookupReference('avgCpuCount').setText(response.rows.cpuCount);
                me.lookupReference('avgCpuModel').setText(response.rows.cpuModel);
                me.lookupReference('avgCpuMediaUso').setText(response.rows.cpuMediaUso);
                me.lookupReference('avgCpuPercent').setText(response.rows.cpuPercent);
                me.lookupReference('avgMemTotal').setText(response.rows.memTotal);
                me.lookupReference('avgMemUsed').setText(response.rows.memUsed);
                me.lookupReference('avgNetworkin').setText(response.rows.networkin);
                me.lookupReference('avgNetworkout').setText(response.rows.networkout);
                me.lookupReference('avgUptime').setText(response.rows.uptime);
            }
        });
    },
    saveForgetPass: function(btn) {
        var me = this,
            forgetWin = me.getView(),
            fieldEmail = me.lookupReference('email'),
            fieldCaptcha = me.lookupReference('captcha'),
            email = fieldEmail.getValue();
        if (!fieldEmail.isValid()) {
            Ext.ux.Alert.alert(me.titleWarning, me.msgFieldsRequired, 'warning');
            return false;
        }
        forgetWin.setLoading(me.msgAuthenticating);
        Ext.Ajax.request({
            url: 'index.php/authentication/forgetPassword',
            params: {
                email: email
            },
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response.success) {
                    forgetWin.setLoading(false);
                    forgetWin.close();
                    Ext.ux.Alert.alert(t('Success'), response.msg, 'information');
                } else {
                    Ext.ux.Alert.alert(t('Error'), response.msg, 'error');
                    forgetWin.setLoading(false);
                }
            }
        });
    }
});