/**
 * Class to define form to "User"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.user.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.userform',
    autoHeight: 300,
    bodyPadding: 0,
    fieldsHideUpdateLot: ['username', 'password', 'id_group_agent', 'id_offer', 'callingcard_pin', 'contract_value'],
    initComponent: function() {
        var me = this;
        haveServiceMenu = false;
        Ext.each(App.user.menu, function(item) {
            if (item.text == "t('Services')") haveServiceMenu = true;
        });
        me.extraButtons = [{
            text: t('Resend') + ' Email',
            iconCls: 'x-fa fa-envelope',
            handler: 'onResendActivation',
            width: 130
        }];
        me.items = [{
            xtype: 'tabpanel',
            defaults: {
                border: false,
                defaultType: 'textfield',
                layout: 'anchor',
                bodyPadding: 5,
                defaults: {
                    labelAlign: 'right',
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true
                }
            },
            items: [{
                title: t('General'),
                itemId: 'mainData',
                reference: 'mainData',
                items: [{
                    name: 'username',
                    fieldLabel: t('Username'),
                    maxLength: 20,
                    minLength: 4,
                    readOnly: App.user.isClient
                }, {
                    name: 'password',
                    fieldLabel: t('Password'),
                    minLength: 6,
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    xtype: 'groupusercombo',
                    name: 'id_group',
                    fieldLabel: t('Group'),
                    allowBlank: !App.user.isAdmin,
                    hidden: !App.user.isAdmin
                }, {
                    xtype: 'groupuseragentcombo',
                    name: 'id_group_agent',
                    fieldLabel: t('Group for agent users'),
                    emptyText: t('SELECT GROUP FOR AGENT USERS'),
                    hidden: true,
                    allowBlank: true
                }, {
                    xtype: 'planlookup',
                    ownerForm: me,
                    name: 'id_plan',
                    fieldLabel: t('Plan'),
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    xtype: 'languagecombo',
                    name: 'language',
                    fieldLabel: t('Language'),
                    value: App.user.language == 'pt_BR' ? 'br' : App.user.language
                }, {
                    name: 'prefix_local',
                    fieldLabel: t('Prefix rules'),
                    value: window.default_prefix_rule.length < 3 && App.user.language == 'pt_BR' ? '0/55/11,0/55/12,*/5511/8,*/5511/9' : window.default_prefix_rule,
                    allowBlank: true,
                    emptyText: 'match / replace / length',
                    hidden: App.user.isClient
                }, {
                    xtype: 'combo',
                    name: 'active',
                    fieldLabel: t('Active'),
                    fieldLabel: t('Status'),
                    forceSelection: true,
                    editable: false,
                    value: 1,
                    store: [
                        [1, t('Active')],
                        [0, t('Inactivated')],
                        [2, t('Pending')],
                        [3, t('Blocked In')],
                        [4, t('Blocked In Out')]
                    ],
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    xtype: 'countrycombo',
                    name: 'country',
                    fieldLabel: t('Country'),
                    value: App.user.language == 'pt_BR' ? '55' : '1',
                    allowBlank: true
                }, {
                    xtype: 'offercombo',
                    name: 'id_offer',
                    fieldLabel: t('Activate offer'),
                    allowBlank: true
                }, {
                    xtype: 'numberfield',
                    name: 'cpslimit',
                    fieldLabel: t('CPS Limit'),
                    value: -1,
                    minValue: -1,
                    maxValue: 50,
                    hidden: !window.dialC || !App.user.isAdmin,
                    allowBlank: true
                }, {
                    xtype: 'textareafield',
                    name: 'description',
                    fieldLabel: t('Description'),
                    hidden: !App.user.isAdmin,
                    allowBlank: true
                }]
            }, {
                defaults: {
                    labelAlign: 'right',
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true,
                    labelWidth: 145
                },
                title: t('Personal data'),
                itemId: 'personalData',
                reference: 'personalData',
                items: [{
                    name: 'company_website',
                    fieldLabel: t('Company website'),
                    allowBlank: true
                }, {
                    name: 'company_name',
                    fieldLabel: t('Company name'),
                    allowBlank: true
                }, {
                    name: 'commercial_name',
                    fieldLabel: t('Commercial name'),
                    allowBlank: true,
                    hidden: App.user.base_country = !'BRL'
                }, {
                    name: 'state_number',
                    fieldLabel: t('State number'),
                    allowBlank: true,
                    hidden: App.user.base_country = !'BRL'
                }, {
                    name: 'lastname',
                    fieldLabel: t('Last name'),
                    allowBlank: true,
                    maxLength: 40,
                    minLength: 4
                }, {
                    name: 'firstname',
                    fieldLabel: t('First name'),
                    allowBlank: true,
                    maxLength: 40,
                    minLength: 4
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        flex: 1
                    },
                    items: [{
                        name: 'city',
                        fieldLabel: t('City'),
                        allowBlank: true,
                        labelWidth: 145,
                        maxLength: 40,
                        minLength: 4,
                        flex: 2
                    }, {
                        name: 'state',
                        fieldLabel: t('State'),
                        allowBlank: true,
                        maxLength: 20,
                        minLength: 2
                    }]
                }, {
                    name: 'address',
                    fieldLabel: t('Address'),
                    allowBlank: true
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        flex: 1
                    },
                    items: [{
                        name: 'neighborhood',
                        fieldLabel: t('Neighborhood'),
                        allowBlank: true,
                        labelWidth: 145,
                        flex: 2
                    }, {
                        name: 'zipcode',
                        fieldLabel: t('Zip code'),
                        allowBlank: true,
                        flex: 2
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        flex: 1
                    },
                    items: [{
                        name: 'phone',
                        fieldLabel: t('Phone'),
                        allowBlank: true,
                        labelWidth: 145,
                        maxLength: 13,
                        minLength: 8
                    }, {
                        name: 'mobile',
                        fieldLabel: t('Mobile'),
                        allowBlank: true,
                        maxLength: 20,
                        minLength: 8
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        flex: 1
                    },
                    items: [{
                        name: 'email',
                        fieldLabel: t('Email'),
                        allowBlank: true,
                        labelWidth: 145
                    }, {
                        name: 'email2',
                        fieldLabel: t('Email') + ' 2',
                        allowBlank: true
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        flex: 1
                    },
                    items: [{
                        name: 'doc',
                        fieldLabel: t('DOC'),
                        allowBlank: true,
                        labelWidth: 145
                    }, {
                        name: 'vat',
                        fieldLabel: t('VAT'),
                        hidden: App.user.isClient,
                        allowBlank: true
                    }]
                }, {
                    xtype: 'moneyfield',
                    name: 'contract_value',
                    fieldLabel: t('Contract value'),
                    mask: App.user.currency + ' #9.999.990,00',
                    value: 0,
                    readOnly: App.user.isClient,
                    allowBlank: true
                }, {
                    name: 'dist',
                    fieldLabel: t('DIST'),
                    hidden: App.user.isClient,
                    allowBlank: true
                }]
            }, {
                title: t('Supplementary info'),
                itemId: 'suplementaryInfo',
                defaults: {
                    labelAlign: 'right',
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true,
                    labelWidth: 145
                },
                items: [{
                    xtype: 'typepaymentcombo',
                    name: 'typepaid',
                    fieldLabel: t('Type paid'),
                    allowBlank: true,
                    readOnly: App.user.isClient
                }, {
                    xtype: 'noyescombo',
                    name: 'credit_notification_daily',
                    fieldLabel: t('Credit notification daily')
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        labelWidth: 145,
                        flex: 1
                    },
                    items: [{
                        name: 'creditlimit',
                        fieldLabel: t('Credit limit'),
                        value: 0,
                        allowBlank: true,
                        readOnly: App.user.isClient,
                        flex: 2
                    }, {
                        xtype: 'numberfield',
                        name: 'credit_notification',
                        fieldLabel: t('Credit notification'),
                        labelWidth: 170,
                        value: '-1',
                        minValue: -1,
                        allowBlank: true,
                        flex: 3
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        labelWidth: 145,
                        flex: 1
                    },
                    items: [{
                        xtype: 'yesnocombo',
                        name: 'email_services',
                        fieldLabel: t('Services email notification'),
                        flex: 2
                    }, {
                        xtype: 'yesnocombo',
                        name: 'email_did',
                        fieldLabel: t('DID email notification'),
                        labelWidth: 170,
                        flex: 3
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        labelWidth: 145,
                        flex: 1
                    },
                    items: [{
                        xtype: 'noyescombo',
                        name: 'enableexpire',
                        fieldLabel: t('Enable expire'),
                        allowBlank: true,
                        hidden: !App.user.isAdmin,
                        flex: 2
                    }, {
                        xtype: 'datefield',
                        name: 'expirationdate',
                        fieldLabel: t('Expiration date'),
                        format: 'Y-m-d H:i:s',
                        allowBlank: true,
                        hidden: !App.user.isAdmin,
                        labelWidth: 170,
                        flex: 3
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    labelWidth: 145,
                    defaults: {
                        labelAlign: 'right',
                        hidden: !haveServiceMenu,
                        readOnly: App.user.isClient,
                        allowBlank: true,
                        flex: 1
                    },
                    items: [{
                        xtype: 'numberfield',
                        name: 'calllimit',
                        fieldLabel: t('Call limit'),
                        labelWidth: 145,
                        value: '-1',
                        minValue: -1,
                        flex: 2
                    }, {
                        xtype: 'textfield',
                        name: 'inbound_call_limit',
                        fieldLabel: t('Inbound Call Limit'),
                        minLength: 0,
                        hidden: !window.didChannelLimit || !App.user.isAdmin,
                        flex: 3
                    }]
                }, {
                    xtype: 'combobox',
                    store: [
                        ['gsm', 'gsm'],
                        ['wav', 'wav'],
                        ['wav49', 'wav49']
                    ],
                    name: 'mix_monitor_format',
                    fieldLabel: t('Record call format'),
                    forceSelection: true,
                    editable: false,
                    allowBlank: true,
                    value: 'gsm',
                    hidden: !App.user.isAdmin
                }, {
                    xtype: 'noyescombo',
                    name: 'callshop',
                    fieldLabel: t('Callshop'),
                    allowBlank: true,
                    hidden: App.user.isClient
                }, {
                    xtype: 'numberfield',
                    name: 'disk_space',
                    fieldLabel: t('Disk space'),
                    value: -1,
                    hidden: !haveServiceMenu,
                    minValue: -1,
                    readOnly: !App.user.isAdmin
                }, {
                    xtype: 'numberfield',
                    name: 'sipaccountlimit',
                    fieldLabel: t('SIP account limit'),
                    value: '-1',
                    minValue: -1,
                    allowBlank: !App.user.isAdmin,
                    readOnly: !App.user.isAdmin,
                    hidden: !haveServiceMenu
                }, {
                    xtype: 'numberfield',
                    name: 'callingcard_pin',
                    fieldLabel: t('CallingCard PIN'),
                    minValue: 100000,
                    maxLength: 6,
                    minLength: 6
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    hidden: App.user.isClient,
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        labelWidth: 145,
                        flex: 1
                    },
                    items: [{
                        xtype: 'restrictioncombo',
                        name: 'restriction',
                        fieldLabel: t('Restriction'),
                        allowBlank: true,
                        flex: 2
                    }, {
                        xtype: 'combobox',
                        name: 'restriction_use',
                        fieldLabel: t('Use'),
                        forceSelection: true,
                        editable: false,
                        hidden: true,
                        value: '1',
                        store: [
                            [1, t('Dial Number')],
                            [2, t('CallerID')],
                            [3, t('Bouth')]
                        ],
                        labelWidth: 80,
                        flex: 2
                    }]
                }]
            }]
        }];
        me.callParent(arguments);
    }
});