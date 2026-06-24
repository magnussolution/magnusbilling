/**
 * Class to view Login
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 08/07/2014
 */
Ext.define('MBilling.view.main.Login', {
    extend: 'Ext.window.Window',
    requires: ['MBilling.view.main.ForgetPassword', 'MBilling.view.main.Signup'],
    xtype: 'login',
    controller: 'login',
    cls: window.isMac ? 'auth-locked-window mb-mac-login-window' : (window.isDesktop === true ? 'auth-locked-window mb-windows-login-window' : 'auth-locked-window'),
    closable: false,
    resizable: false,
    autoShow: true,
    titleAlign: 'center',
    maximized: true,
    modal: true,
    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },
    initComponent: function () {
        var me = this,
            isMac = window.isMac === true,
            isWindows = window.isDesktop === true && window.isMac !== true,
            customName = me.getCustomWindowValue(window.cn),
            customLogo = me.getCustomLogoPath(window.cl),
            loginItems = [];


        if (window.nameCustom) {
            var productName = window.nameCustom;
        } else {
            var productName = window.agentTitle || 'MagnusBilling';
        }
        if ((isMac || isWindows) && customName) {
            productName = customName;
        }
        if (window.productCustom) {
            var windowsProductName = window.productCustom;
        } else {
            var windowsProductName = window.agentTitle || t('MagnusBilling System');
        }
        if ((isMac || isWindows) && customName) {
            windowsProductName = customName;
        }

        if (window.logoCustom) {
            var loginLogo = window.logoCustom;
        } else {
            var loginLogo = window.agentTitle ? 'resources/images/logo_custom_' + window.agentId + '.png' : 'resources/images/loading.gif';
        }
        if ((isMac || isWindows) && customLogo) {
            loginLogo = customLogo;
        }

        me.cls = isMac ? 'auth-locked-window mb-mac-login-window' : (isWindows ? 'auth-locked-window mb-windows-login-window' : 'auth-locked-window');
        me.title = window.loginheader ? window.loginheader : t("Log in");
        if (isMac || isWindows) {
            me.header = false;
        }
        if (isMac) {
            loginItems.push({
                xtype: 'component',
                cls: 'mb-mac-login-brand',
                html: '<div class="mb-mac-login-app-icon">' + (customLogo ?
                    '<img class="mb-mac-login-logo" src="' + Ext.String.htmlEncode(customLogo) + '" alt="" />' :
                    '<span class="x-fa fa-cloud"></span>') + '</div>' +
                    '<div class="mb-mac-login-product">' + Ext.String.htmlEncode(productName) + '</div>'
            });
        } else if (isWindows) {
            loginItems.push({
                xtype: 'component',
                cls: 'mb-windows-login-brand',
                html: '<img class="mb-windows-login-logo" src="' + Ext.String.htmlEncode(loginLogo) + '" alt="" width="32" height="32" ' +
                    'style="display:block;width:32px!important;height:32px!important;max-width:32px!important;max-height:32px!important;object-fit:contain;" />' +
                    '<div class="mb-windows-login-product">' + Ext.String.htmlEncode(windowsProductName) + '</div>'
            });
        }
        loginItems.push({
            xtype: 'label',
            cls: isMac ? 'mb-mac-login-heading' : (isWindows ? 'mb-windows-login-heading' : ''),
            text: t('Sign into your account')
        }, {
            xtype: 'textfield',
            cls: isMac ? 'auth-textbox mb-mac-login-field mb-mac-login-user' : (isWindows ? 'auth-textbox mb-windows-login-field' : 'auth-textbox'),
            name: 'userid',
            reference: 'user',
            height: isMac ? 52 : (isWindows ? 50 : 55),
            hideLabel: true,
            allowBlank: false,
            emptyText: t('Username or email')
        }, {
            xtype: 'textfield',
            cls: isMac ? 'auth-textbox mb-mac-login-field mb-mac-login-password' : (isWindows ? 'auth-textbox mb-windows-login-field' : 'auth-textbox'),
            height: isMac ? 52 : (isWindows ? 50 : 55),
            hideLabel: true,
            reference: 'password',
            emptyText: t('Password'),
            inputType: 'password',
            name: 'password',
            allowBlank: false
        }, {
            xtype: 'button',
            reference: 'loginButton',
            cls: isMac ? 'mb-mac-login-submit' : (isWindows ? 'mb-windows-login-submit' : ''),
            scale: 'large',
            iconAlign: 'right',
            iconCls: 'x-fa fa-angle-right',
            text: t('Login'),
            formBind: true,
            handler: 'onLogin'
        }, {
            xtype: 'box',
            cls: isMac ? 'mb-mac-login-separator' : (isWindows ? 'mb-windows-login-separator' : ''),
            html: '<div class="outer-div"><div class="seperator">' + t('OR') + '</div></div > ',
            hidden: !window.show_signup_button,
            margin: '10 0'
        }, {
            xtype: 'button',
            cls: isMac ? 'mb-mac-login-create' : (isWindows ? 'mb-windows-login-create' : ''),
            scale: 'large',
            iconAlign: 'right',
            iconCls: 'x-fa fa-user-plus',
            text: t('Create an account'),
            handler: 'onSignup',
            hidden: !window.show_signup_button
        }, {
            cls: isMac ? 'mb-mac-login-links' : (isWindows ? 'mb-windows-login-links' : ''),
            layout: 'hbox',
            items: [{
                xtype: 'locale',
                flex: 1,
                margin: '5 0 0 0'
            }, {
                flex: 4,
                cls: isMac ? 'mb-mac-login-forgot' : (isWindows ? 'mb-windows-login-forgot' : ''),
                margin: isMac ? '5 0 0 24' : (isWindows ? '5 0 0 22' : '5 0 0 80'),
                html: '<div style="text-align: right;">' + t('Forgot your password?') + '</div>',
                listeners: {
                    render: function (c) {
                        c.getEl().on({
                            click: function () {
                                Ext.widget('forgetPassword');
                            }
                        });
                    }
                }
            }]
        }, {
            xtype: 'box',
            id: 'myCaptcha',
            name: 'captcha',
            reference: 'captcha',
            listeners: {
                'afterrender': function () {
                    if (typeof grecaptcha != "undefined") {
                        grecaptcha.ready(function () {
                            grecaptcha.execute(window.reCaptchaKey, {
                                action: 'homepage'
                            }).then(function (token) {
                                window.captcha = token;
                            });
                        });
                    }
                }
            }
        });
        me.items = [{
            defaultFocus: 'textfield:focusable:not([hidden]):not([disabled]):not([value])',
            cls: isMac ? 'auth-dialog mb-mac-login-card' : (isWindows ? 'auth-dialog mb-windows-login-card' : 'auth-dialog'),
            defaultButton: 'loginButton',
            autoComplete: true,
            bodyPadding: isMac ? '34 38 28' : (isWindows ? '38 42 32' : '20 20'),
            header: false,
            width: isMac ? Math.min(440, Ext.Element.getViewportWidth() - 32) : (isWindows ? Math.min(448, Ext.Element.getViewportWidth() - 32) : 415),
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                margin: isMac ? '6 0' : (isWindows ? '7 0' : '5 0')
            },
            items: loginItems
        }];
        me.callParent(arguments);
    },

    getCustomWindowValue: function (value) {
        value = Ext.String.trim(String(value || ''));
        return value && value !== 'undefined' && value !== 'null' ? value : '';
    },

    getCustomLogoPath: function (value) {
        value = this.getCustomWindowValue(value);
        if (!value) {
            return '';
        }
        if (/^(?:[a-z]+:)?\/\//i.test(value) || value.charAt(0) === '/' || value.indexOf('/') !== -1) {
            return value;
        }
        return 'resources/images/' + value;
    }
});
