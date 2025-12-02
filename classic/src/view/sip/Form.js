/**
 * Classe que define o form de "Sip"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 25/06/2012
 */
Ext.define('MBilling.view.sip.Form', {
    extend: 'Ext.ux.form.Panel',
    uses: ['Ext.ux.form.field.DateTime'],
    alias: 'widget.sipform',
    bodyPadding: 0,
    fieldsHideUpdateLot: ['id_user', 'defaultuser', 'secret'],
    initComponent: function () {
        var me = this;
        haveServiceMenu = false;
        Ext.each(App.user.menu, function (item) {
            if (item.text == "t('Services')") haveServiceMenu = true;
        });
        me.items = [{
            xtype: 'tabpanel',
            defaults: {
                border: false,
                defaultType: 'textfield',
                layout: 'anchor',
                bodyPadding: 5,
                defaults: {
                    labelWidth: 170,
                    labelAlign: 'right',
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true
                }
            },
            items: [{
                title: t('General'),
                items: [{
                    xtype: 'userlookup',
                    ownerForm: me,
                    name: 'id_user',
                    fieldLabel: t('Username'),
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    name: 'defaultuser',
                    fieldLabel: t('SIP user'),
                    minLength: window.sip_user_min ? window.sip_user_min : 4,
                    allowBlank: true,
                    readOnly: App.user.isClient
                }, {
                    name: 'secret',
                    fieldLabel: t('SIP password'),
                    allowBlank: true,
                    minLength: 6
                }, {
                    name: 'callerid',
                    fieldLabel: t('CallerID'),
                    allowBlank: true
                }, {
                    name: 'alias',
                    fieldLabel: t('Alias'),
                    allowBlank: true,
                    minLength: 3
                }, {
                    name: 'disallow',
                    fieldLabel: t('Disallow'),
                    value: 'all',
                    hidden: !App.user.isAdmin,
                    allowBlank: App.user.isClient
                }, {
                    xtype: 'checkboxgroup',
                    name: 'allow',
                    fieldLabel: t('Codec'),
                    columns: 3,
                    items: [{
                        boxLabel: 'g729',
                        name: 'allow',
                        inputValue: 'g729',
                        checked: window.default_codes.match(/g729/)
                    }, {
                        boxLabel: 'g723',
                        name: 'allow',
                        inputValue: 'g723',
                        checked: window.default_codes.match(/g723/)
                    }, {
                        boxLabel: 'gsm',
                        name: 'allow',
                        inputValue: 'gsm',
                        checked: window.default_codes.match(/gsm/)
                    }, {
                        boxLabel: 'g726',
                        name: 'allow',
                        inputValue: 'g726',
                        checked: window.default_codes.match(/g726/)
                    }, {
                        boxLabel: 'opus',
                        name: 'allow',
                        inputValue: 'opus',
                        checked: window.default_codes.match(/opus/)
                    }, {
                        boxLabel: 'alaw',
                        name: 'allow',
                        inputValue: 'alaw',
                        checked: window.default_codes.match(/alaw/)
                    }, {
                        boxLabel: 'ulaw',
                        name: 'allow',
                        inputValue: 'ulaw',
                        checked: window.default_codes.match(/ulaw/)
                    }, {
                        boxLabel: 'g722',
                        name: 'allow',
                        inputValue: 'g722',
                        checked: window.default_codes.match(/g722/)
                    }, {
                        boxLabel: 'ilbc',
                        name: 'allow',
                        inputValue: 'ilbc',
                        checked: window.default_codes.match(/ilbc/)
                    }, {
                        boxLabel: 'speex',
                        name: 'allow',
                        inputValue: 'speex',
                        checked: window.default_codes.match(/speex/)
                    }, {
                        boxLabel: 'h263p',
                        name: 'allow',
                        inputValue: 'h263p',
                        checked: window.default_codes.match(/h263p/)
                    }, {
                        boxLabel: 'h263',
                        name: 'allow',
                        inputValue: 'h263',
                        checked: window.default_codes.match(/h263/)
                    }, {
                        boxLabel: 'h264',
                        name: 'allow',
                        inputValue: 'h264',
                        checked: window.default_codes.match(/h264/)
                    }, {
                        boxLabel: 'vp8',
                        name: 'allow',
                        inputValue: 'vp8',
                        checked: window.default_codes.match(/vp8/)
                    }],
                    hidden: !App.user.isAdmin,
                    allowBlank: App.user.isClient
                }, {
                    name: 'host',
                    fieldLabel: t('Host'),
                    value: 'dynamic',
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    name: 'sip_group',
                    fieldLabel: t('Group'),
                    allowBlank: true
                }, {
                    xtype: 'yesnostringcombo',
                    name: 'videosupport',
                    fieldLabel: t('Videosupport'),
                    value: 'no',
                    allowBlank: !App.user.isAdmin
                }, {
                    name: 'block_call_reg',
                    fieldLabel: t('Block call regex'),
                    allowBlank: true,
                    hidden: App.user.isClient
                }, {
                    xtype: 'noyescombo',
                    name: 'record_call',
                    fieldLabel: t('Record call'),
                    allowBlank: true,
                    hidden: !App.user.isAdmin || window.global_record_calls == true
                }, {
                    xtype: 'numberfield',
                    name: 'techprefix',
                    fieldLabel: t('Tech prefix'),
                    hidden: !App.user.isAdmin,
                    allowBlank: true,
                    maxLength: 6
                }, {
                    name: 'cnl',
                    fieldLabel: t('CNL zone'),
                    allowBlank: true,
                    hidden: !App.user.isAdmin || (App.user.language != 'pt_BR' && !window.cnl)
                }, {
                    xtype: 'textareafield',
                    allowBlank: true,
                    name: 'description',
                    fieldLabel: t('Description'),
                    hidden: !App.user.isAdmin
                }]
            }, {
                title: t('NAT'),
                hidden: !App.user.isAdmin,
                items: [{
                    name: 'nat',
                    fieldLabel: t('NAT'),
                    value: 'force_rport,comedia',
                    allowBlank: !App.user.isAdmin
                }, {
                    name: 'directmedia',
                    fieldLabel: t('Directmedia'),
                    value: 'no',
                    allowBlank: !App.user.isAdmin
                }, {
                    xtype: 'yesnostringcombo',
                    name: 'qualify',
                    fieldLabel: t('Qualify'),
                    value: 'no',
                    allowBlank: !App.user.isAdmin
                }]
            }, {
                title: t('Additional'),
                hidden: !App.user.isAdmin,
                defaults: {
                    labelAlign: 'right',
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true,
                    labelWidth: 170
                },
                items: [, {
                    xtype: 'trunkgrouplookup',
                    ownerForm: me,
                    name: 'id_trunk_group',
                    fieldLabel: t('Trunk groups'),
                    hidden: !App.user.isAdmin,
                    allowBlank: true
                }, {
                        name: 'context',
                        fieldLabel: t('Context'),
                        value: 'billing',
                        hidden: !App.user.isAdmin,
                        allowBlank: true
                    }, {
                        name: 'dtmfmode',
                        fieldLabel: t('Dtmfmode'),
                        value: 'RFC2833',
                        allowBlank: !App.user.isAdmin
                    }, {
                        name: 'insecure',
                        fieldLabel: t('Insecure'),
                        value: 'no',
                        allowBlank: true
                    }, {
                        name: 'deny',
                        fieldLabel: t('Deny'),
                        allowBlank: true,
                        hidden: !App.user.isAdmin
                    }, {
                        name: 'permit',
                        fieldLabel: t('Permit'),
                        allowBlank: true,
                        hidden: !App.user.isAdmin
                    }, {
                        name: 'type',
                        fieldLabel: t('Type'),
                        value: 'friend',
                        allowBlank: !App.user.isAdmin
                    }, {
                        xtype: 'noyesstringcombo',
                        name: 'allowtransfer',
                        fieldLabel: t('Allowtransfer'),
                        value: 'no',
                        allowBlank: !App.user.isAdmin
                    }, {
                        xtype: 'noyescombo',
                        name: 'ringfalse',
                        fieldLabel: t('Fake Ring'),
                        value: '0',
                        allowBlank: !App.user.isAdmin
                    }, {
                        xtype: 'numberfield',
                        name: 'calllimit',
                        fieldLabel: t('Call limit'),
                        value: '0',
                        allowBlank: !App.user.isAdmin
                    }, {
                        name: 'mohsuggest',
                        fieldLabel: t('MOH'),
                        allowBlank: true,
                        hidden: !App.user.isAdmin
                    }, {
                        name: 'url_events',
                        fieldLabel: t('URL events notify'),
                        hidden: !App.user.isAdmin || !window.events === true,
                        allowBlank: true
                    }, {
                        name: 'addparameter',
                        fieldLabel: t('Addparameter'),
                        allowBlank: true,
                        hidden: !App.user.isAdmin,
                        emptyText: t('Parameterdial')
                    }, {
                        xtype: 'combobox',
                        name: 'amd',
                        fieldLabel: t('AMD'),
                        store: [
                            ['0', t('Disable')],
                            ['1', t('Before answer')]
                        ],
                        forceSelection: true,
                        editable: false,
                        value: '0',
                        allowBlank: true,
                        hidden: !window.dialC
                    }]
            }, {
                title: t('Forward'),
                itemId: 'option',
                name: 'forwardtype',
                bodyPadding: 10,
                items: [{
                    xtype: 'fieldset',
                    style: 'margin-top:10px; overflow: visible;',
                    title: t('Forward to'),
                    collapsible: true,
                    collapsed: false,
                    height: window.isThemeTriton ? 180 : 110,
                    defaults: {
                        labelWidth: 190,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'typesipforwardcombo',
                        name: 'type_forward',
                        fieldLabel: t('Forward type'),
                        allowBlank: true
                    }, {
                        xtype: 'ivrlookup',
                        ownerForm: me,
                        name: 'id_ivr',
                        fieldLabel: t('IVR'),
                        displayField: 'id_ivr_name',
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'queuelookup',
                        ownerForm: me,
                        name: 'id_queue',
                        fieldLabel: t('Queue'),
                        displayField: 'id_queue_name',
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'sip2lookup',
                        ownerForm: me,
                        name: 'id_sip',
                        fieldLabel: t('Sip user'),
                        displayField: 'id_sip_name',
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'textfield',
                        name: 'extension',
                        fieldLabel: t('Destination'),
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'numberfield',
                        name: 'dial_timeout',
                        fieldLabel: t('Dial timeout'),
                        value: '60'
                    }]
                }]
            }, {
                title: t('VoiceMail'),
                itemId: 'voicemail',
                bodyPadding: 10,
                defaults: {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    plugins: 'markallowblank',
                    allowBlank: true,
                    anchor: '100%',
                    labelWidth: 170,
                    defaults: {
                        allowBlank: true,
                        ownerForm: me
                    }
                },
                items: [{
                    xtype: 'noyescombo',
                    name: 'voicemail',
                    fieldLabel: t('Enable voicemail'),
                    value: '0'
                }, {
                    xtype: 'textfield',
                    name: 'voicemail_email',
                    fieldLabel: t('Email')
                }, {
                    xtype: 'numberfield',
                    name: 'voicemail_password',
                    fieldLabel: t('Password'),
                    value: ''
                }]
            }, {
                title: t('Asterisk extra config'),
                items: [{
                    xtype: 'textarea',
                    labelAlign: 'right',
                    plugins: 'markallowblank',
                    labelWidth: 90,
                    name: 'sip_config',
                    fieldLabel: t('Parameters'),
                    allowBlank: true,
                    height: 400,
                    anchor: '100%',
                    hidden: !App.user.isAdmin
                }]
            }, {
                title: t('SipShowPeer'),
                itemId: 'sipshowpeer',
                bodyPadding: 10,
                hidden: !App.user.isAdmin,
                defaults: {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    plugins: 'markallowblank',
                    allowBlank: true,
                    anchor: '100%',
                    labelWidth: 150,
                    defaults: {
                        allowBlank: true,
                        ownerForm: me
                    }
                },
                items: [{
                    xtype: 'textarea',
                    name: 'sipshowpeer',
                    fieldLabel: t('Peer'),
                    hideLabel: true,
                    labelWidth: 50,
                    readOnly: true,
                    allowBlank: true,
                    height: 700,
                    anchor: '100%',
                    hidden: !App.user.isAdmin
                }]
            }]
        }];
        me.callParent(arguments);
    }
});