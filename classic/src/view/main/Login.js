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
    cls: 'auth-locked-window',
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
    initComponent: function() {
        var me = this;
        me.title = window.loginheader ? window.loginheader : t("Log in");
        me.items = [{
            defaultFocus: 'textfield:focusable:not([hidden]):not([disabled]):not([value])',
            cls: 'auth-dialog',
            defaultButton: 'loginButton',
            autoComplete: true,
            bodyPadding: '20 20',
            header: false,
            width: 415,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                margin: '5 0'
            },
            items: [{
                xtype: 'label',
                text: t('Sign into your account')
            }, {
                xtype: 'textfield',
                cls: 'auth-textbox',
                name: 'userid',
                reference: 'user',
                height: 55,
                hideLabel: true,
                allowBlank: false,
                emptyText: t('Username or email')
            }, {
                xtype: 'textfield',
                cls: 'auth-textbox',
                height: 55,
                hideLabel: true,
                reference: 'password',
                emptyText: t('Password'),
                inputType: 'password',
                name: 'password',
                allowBlank: false
            }, {
                xtype: 'button',
                reference: 'loginButton',
                scale: 'large',
                iconAlign: 'right',
                iconCls: 'x-fa fa-angle-right',
                text: t('Login'),
                formBind: true,
                handler: 'onLogin'
            }, {
                xtype: 'box',
                html: '<div class="outer-div"><div class="seperator">' + t('OR') + '</div></div > ',
                hidden: !window.show_signup_button,
                margin: '10 0'
            }, {
                xtype: 'button',
                scale: 'large',
                iconAlign: 'right',
                iconCls: 'x-fa fa-user-plus',
                text: t('Create an account'),
                handler: 'onSignup',
                hidden: !window.show_signup_button
            }, {
                layout: 'hbox',
                items: [{
                    xtype: 'locale',
                    flex: 1,
                    margin: '5 0 0 0'
                }, {
                    flex: 4,
                    margin: '5 0 0 80',
                    html: '<div style="text-align: right;">' + t('Forgot your password?') + '</div>',
                    listeners: {
                        render: function(c) {
                            c.getEl().on({
                                click: function() {
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
                    'afterrender': function() {
                        if (typeof grecaptcha != "undefined") {
                            grecaptcha.ready(function() {
                                grecaptcha.execute(window.reCaptchaKey, {
                                    action: 'homepage'
                                }).then(function(token) {
                                    window.captcha = token;
                                });
                            });
                        }
                    }
                }
            }]
        }]
        me.callParent(arguments);
    }
});