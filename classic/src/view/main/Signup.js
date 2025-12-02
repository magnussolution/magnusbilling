/**
 * Class to view Signup
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 08/07/2014
 */
Ext.define('MBilling.view.main.Signup', {
    extend: 'Ext.window.Window',
    alias: 'widget.signup',
    requires: ['MBilling.model.Signup', 'MBilling.store.Signup'],
    xtype: 'signup',
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
        me.title = t('Create an account');
        me.items = [{
            xtype: 'form',
            hidden: window.enable_signup == 0,
            reference: 'signupForm',
            defaultFocus: 'textfield:focusable:not([hidden]):not([disabled]):not([value])',
            cls: 'auth-dialog-register',
            defaultButton: 'loginButton',
            autoComplete: true,
            bodyPadding: '20 20',
            header: false,
            width: 600,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                margin: '5 0',
                height: 35,
                cls: 'auth-textbox',
                hideLabel: true,
                allowBlank: false
            },
            items: [, {
                xtype: 'textfield',
                name: 'id_user',
                hidden: true,
                value: me.id_user,
                allowBlank: false
            }, {
                xtype: 'plansignupcombo',
                name: 'id_plan',
                emptyText: t('Select a plan'),
                hideLabel: true
            }, {
                xtype: 'textfield',
                emptyText: t('Username'),
                name: 'username',
                hidden: window.auto_generate_user_signup == 1,
                allowBlank: true
            }, {
                xtype: 'textfield',
                emptyText: t('Email'),
                name: 'email',
                allowBlank: true
            }, {
                layout: 'hbox',
                margin: '3 0 0 0',
                height: 45,
                hidden: !window.signup_auto_pass == 0,
                defaults: {
                    xtype: 'textfield',
                    height: 35,
                    cls: 'auth-textbox',
                    hideLabel: true,
                    allowBlank: false,
                    margin: '5 0 0 0',
                    flex: 1,
                    inputType: 'password'
                },
                items: [{
                    emptyText: t('Password'),
                    name: 'password',
                    values: window.signup_auto_pass == 0 ? '' : window.signup_auto_pass,
                    allowBlank: true
                }, {
                    margin: '5 0 0 10',
                    emptyText: t('Confirm') + ' ' + t('Password'),
                    name: 'password2',
                    values: window.signup_auto_pass == 0 ? '' : window.signup_auto_pass,
                    allowBlank: true
                }]
            }, {
                layout: 'hbox',
                margin: '3 0 0 0',
                height: 45,
                defaults: {
                    xtype: 'textfield',
                    height: 35,
                    cls: 'auth-textbox',
                    hideLabel: true,
                    allowBlank: false,
                    margin: '5 0 0 0',
                    flex: 1
                },
                items: [{
                    emptyText: t('Last name'),
                    name: 'lastname',
                    allowBlank: true
                }, {
                    margin: '5 0 0 10',
                    emptyText: t('First name'),
                    name: 'firstname',
                    allowBlank: true
                }]
            }, {
                layout: 'hbox',
                margin: '3 0 0 0',
                height: 45,
                defaults: {
                    xtype: 'textfield',
                    height: 35,
                    cls: 'auth-textbox',
                    hideLabel: true,
                    allowBlank: false,
                    margin: '5 0 0 0',
                    flex: 2
                },
                items: [{
                    xtype: 'countrycombo',
                    name: 'country',
                    fieldLabel: t('Country'),
                    value: window.lang == 'pt_BR' ? '55' : '1',
                    allowBlank: true
                }, {
                    xtype: window.lang == 'pt_BR' ? 'statecombo' : 'textfield',
                    emptyText: t('State'),
                    name: 'state',
                    allowBlank: true
                }]
            }, , {
                xtype: 'textfield',
                emptyText: t('City'),
                name: 'city',
                allowBlank: true
            }, {
                xtype: 'textfield',
                emptyText: t('Address'),
                name: 'address',
                allowBlank: true
            }, {
                layout: 'hbox',
                margin: '3 0 0 0',
                height: 45,
                defaults: {
                    xtype: 'textfield',
                    height: 35,
                    cls: 'auth-textbox',
                    hideLabel: true,
                    allowBlank: false,
                    margin: '5 0 0 0'
                },
                items: [{
                    emptyText: t('Neighborhood'),
                    name: 'neighborhood',
                    flex: 2,
                    allowBlank: true
                }, {
                    margin: '5 0 0 10',
                    emptyText: t('Zip code'),
                    name: 'zipcode',
                    flex: 2,
                    allowBlank: true
                }]
            }, {
                layout: 'hbox',
                margin: '3 0 0 0',
                height: 45,
                defaults: {
                    xtype: 'textfield',
                    height: 35,
                    cls: 'auth-textbox',
                    hideLabel: true,
                    allowBlank: false,
                    margin: '5 0 0 0',
                    flex: 1
                },
                items: [{
                    emptyText: t('Phone'),
                    name: 'phone',
                    allowBlank: true
                }, {
                    margin: '5 0 0 10',
                    emptyText: t('Mobile'),
                    name: 'mobile',
                    allowBlank: true
                }]
            }, {
                xtype: 'textfield',
                emptyText: t('DOC'),
                name: 'doc',
                allowBlank: true
            }, {
                layout: 'hbox',
                margin: '3 0 0 0',
                height: 45,
                hidden: window.lang != 'pt_BR',
                defaults: {
                    xtype: 'textfield',
                    height: 35,
                    cls: 'auth-textbox',
                    hideLabel: true,
                    allowBlank: false,
                    margin: '5 0 0 0',
                    flex: 1
                },
                items: [{
                    emptyText: t('Company name'),
                    name: 'company_name',
                    allowBlank: true
                }, {
                    margin: '5 0 0 10',
                    emptyText: t('State number'),
                    name: 'state_number',
                    allowBlank: true
                }]
            }, {
                layout: 'hbox',
                margin: '3 0 0 0',
                height: 45,
                defaults: {
                    xtype: 'textfield',
                    height: 35,
                    cls: 'auth-textbox',
                    hideLabel: true,
                    allowBlank: false,
                    margin: '5 0 0 0'
                },
                items: [{
                    xtype: 'checkbox',
                    flex: 2,
                    inputValue: 1,
                    uncheckedValue: 0,
                    checked: false,
                    boxLabel: t('I accept the terms'),
                    cls: 'form-panel-font-color rememberMeCheckbox',
                    height: 32,
                    name: 'accept_terms',
                    allowBlank: false
                }, {
                    xtype: 'box',
                    flex: 5,
                    margin: '8 0 0 0',
                    html: '<a href=http://google.com target=_blank >' + t('Read terms') + '</a>'
                }]
            }, {
                layout: 'hbox',
                height: 40,
                items: [{
                    xtype: 'button',
                    flex: 1,
                    margin: '0 0 0 5',
                    scale: 'large',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-angle-left',
                    text: t('Login'),
                    listeners: {
                        render: function(c) {
                            c.getEl().on({
                                click: function() {
                                    window.location = window.location.pathname;
                                }
                            });
                        }
                    }
                }, {
                    xtype: 'button',
                    flex: 3,
                    margin: '0 0 0 5',
                    reference: 'signupButton',
                    scale: 'large',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-user-plus',
                    text: t('Signup'),
                    handler: 'onCreateAccount'
                }]
            }, {
                xtype: 'textfield',
                name: 'extjs',
                hidden: true,
                allowBlank: true
            }]
        }]
        me.callParent(arguments);
    }
});