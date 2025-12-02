Ext.define('MBilling.view.main.GoogleAuthenticatorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.googleauthenticator',
    titleWarning: t('Warning'),
    msgFieldsRequired: t('Fill in the fields correctly.'),
    msgAuthenticating: t('Authenticating...'),
    msgEnteringInSystem: t('Entering in system...'),
    msgWelcome: t('Welcome'),
    titleErrorInAuthentication: t('Authentication error'),
    control: {
        textfield: {
            keyup: 'onKeyUpField'
        }
    },
    onGoogleAuthenticator: function(btn) {
        var me = this,
            loginWin = me.getView(),
            fieldOneCode = me.lookupReference('oneCode'),
            oneCode = fieldOneCode.getValue();
        if (!fieldOneCode.isValid()) {
            Ext.ux.Alert.alert(me.titleWarning, me.msgFieldsRequired, 'warning');
            return false;
        }
        loginWin.setLoading(me.msgAuthenticating);
        Ext.Ajax.request({
            url: 'index.php/authentication/googleAuthenticator',
            params: {
                oneCode: oneCode
            },
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response.success) {
                    loginWin.setLoading(me.msgEnteringInSystem);
                    App.init();
                    loginWin.setLoading(false);
                    loginWin.close();
                    Ext.ux.Alert.alert(me.msgWelcome, response.msg, 'information');
                    App.user.logged = response.success;
                    App.user.loggedGoogle = true;
                } else {
                    Ext.ux.Alert.alert(me.titleErrorInAuthentication, 'Invalid code', 'error');
                    fieldOneCode.focus(true);
                    loginWin.setLoading(false);
                }
            }
        });
    },
    onShowLogin: function() {
        this.lookupReference('user').focus(false, 10);
    },
    onKeyUpField: function(field, evt) {
        if (evt.getKey() === evt.ENTER) {
            this.onGoogleAuthenticator();
        }
    },
    onLogout: function() {
        var me = this;
        Ext.Ajax.request({
            url: 'index.php/authentication/logoff',
            success: function() {
                App.user.logged = false;
                location.reload();
            }
        });
    }
});