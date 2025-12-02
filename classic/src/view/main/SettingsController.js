Ext.define('MBilling.view.main.SettingsController', {
    extend: 'Ext.app.ViewController',
    requires: ['Ext.form.field.Checkbox'],
    alias: 'controller.settings',
    setDefaultMenuPreference: function(treepanel) {
        treepanel.getSelectionModel().select(0, false, true);
    },
    callConfiguration: function(selModel, selected) {
        this.lookupReference('settingsPanel').getLayout().setActiveItem(this.lookupReference(selected[0].get('id')));
    },
    selectInitLayout: function(tree) {
        var node = tree.getRootNode().findChild('text', this.getView().textUserLayout, true);
        tree.getSelectionModel().select(node);
    },
    onSelectLayout: function(tree, record) {
        var me = this,
            type = record.get('type');
        me.getView().userLayout = type;
        me.lookupReference('imageLayout').setSrc(me.getView().pathScreens + (type === 'standard' ? 'blue-crisp' : 'blue-crisp-desktop') + '.png');
    },
    savePreferenceLayout: function() {
        var view;
        if (localStorage) {
            view = this.getView();
            localStorage.setItem('layout', view.userLayout);
            Ext.Msg.confirm(view.reloadSystemText, view.msgReloadSystem, function(opt) {
                if (opt === 'yes') {
                    if (view.menuColor == 'White' || view.menuColor == 'Black') {
                        Ext.Ajax.request({
                            params: {
                                value: view.menuColor,
                                field: 'color_menu'
                            },
                            url: 'index.php/configuration/theme'
                        });
                    };
                    Ext.Ajax.request({
                        params: {
                            value: view.userLayout == 'desktop' ? 1 : 0,
                            field: 'layout'
                        },
                        url: 'index.php/configuration/theme',
                        success: function() {
                            Ext.ux.Alert.alert(view.changeLayoutTitle, view.changeLayoutText, 'notification');
                            setTimeout(function() {
                                window.location.reload();
                            }, 3000);
                        }
                    });
                }
            });
        }
    },
    selectInitTheme: function(tree) {
        var node = tree.getRootNode().findChild('text', this.getView().textUserTheme, true);
        tree.getSelectionModel().select(node);
    },
    onSelectTheme: function(tree, record) {
        var me = this,
            css = record.get('css');
        me.getView().userTheme = css;
        me.lookupReference('imageTheme').setSrc(me.getView().pathScreens + css + '.png');
    },
    savePreferenceTheme: function() {
        var view;
        if (localStorage) {
            view = this.getView();
            localStorage.setItem('themeApp', view.userTheme);
            Ext.Msg.confirm(view.reloadSystemText, view.msgReloadSystemTheme, function(opt) {
                if (opt === 'yes') {
                    Ext.Ajax.request({
                        params: {
                            value: view.userTheme,
                            field: 'template'
                        },
                        url: 'index.php/configuration/theme',
                        success: function() {
                            Ext.ux.Alert.alert(view.changeThemeTitle, view.changeThemeText, 'notification');
                            setTimeout(function() {
                                window.location.reload();
                            }, 3000);
                        }
                    });
                }
            });
        }
    },
    applyWallpaper: function() {
        var view = this.getView();
        if (view.selectedWallpaper) {
            App.desktop.setWallpaper('resources/images/wallpapers/' + view.selectedWallpaper + '.jpg', view.stretchWallpaper);
            localStorage && localStorage.setItem('wallpaper', 'resources/images/wallpapers/' + view.selectedWallpaper + '.jpg');
            Ext.Ajax.request({
                params: {
                    value: view.selectedWallpaper,
                    field: 'wallpaper'
                },
                url: 'index.php/configuration/theme',
                success: function() {
                    Ext.ux.Alert.alert(view.changeThemeTitle, t('Success'), 'success');
                }
            });
        }
    },
    getTextOfWallpaper: function(path) {
        var text = path,
            slash = path.lastIndexOf('/'),
            dot;
        if (slash >= 0) {
            text = text.substring(slash + 1);
        }
        dot = text.lastIndexOf('.');
        text = Ext.String.capitalize(text.substring(0, dot));
        text = text.replace(/[-]/g, ' ');
        return text;
    },
    selectInitWallpaper: function() {
        var view = this.getView(),
            s = App.desktop.getWallpaper(),
            path;
        if (s) {
            path = '/Wallpaper/' + t(this.getTextOfWallpaper(s));
            this.lookupReference('treeWallpaper').selectPath(path, 'text');
        }
    },
    onSelectWallpaper: function(tree, record) {
        var view = this.getView(),
            img = record.get('img');
        if (img) {
            view.wallpaper = img;
            view.selectedWallpaper = view.pathWallpaper + img;
        } else {
            view.wallpaper = 'none.jpg';
            view.selectedWallpaper = Ext.BLANK_IMAGE_URL;
        }
        view.previewWallpaper.setWallpaper('resources/images/wallpapers/' + view.selectedWallpaper + '.jpg');
    },
    onChangeMenuColor: function(cmp) {
        this.getView().menuColor = cmp.getChecked()[0].inputValue;
    },
    onChangeStretchWallpaper: function(cmp) {
        this.getView().stretchWallpaper = cmp.checked;
    }
});