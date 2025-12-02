/**
 * Classe que define o form de "Trunk"
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
Ext.define('MBilling.view.trunk.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.trunkform',
    autoHeight: 300,
    bodyPadding: 0,
    fieldsHideUpdateLot: ['trunkcode'],
    initComponent: function() {
        var me = this;
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
                    enableKeyEvents: true,
                    labelWidth: 142
                }
            },
            items: [{
                title: t('General'),
                items: [{
                    xtype: 'providerlookup',
                    ownerForm: me,
                    name: 'id_provider',
                    fieldLabel: t('Provider')
                }, {
                    name: 'trunkcode',
                    fieldLabel: t('Name')
                }, {
                    name: 'user',
                    fieldLabel: t('Username'),
                    allowBlank: true
                }, {
                    name: 'secret',
                    fieldLabel: t('Password'),
                    allowBlank: true
                }, {
                    name: 'host',
                    fieldLabel: t('Host')
                }, {
                    name: 'trunkprefix',
                    fieldLabel: t('Add prefix'),
                    allowBlank: true
                }, {
                    name: 'removeprefix',
                    fieldLabel: t('Remove prefix'),
                    allowBlank: true
                }, {
                    xtype: 'checkboxgroup',
                    name: 'allow',
                    fieldLabel: t('Codec'),
                    columns: 3,
                    items: [{
                        boxLabel: 'g729',
                        name: 'allow',
                        inputValue: 'g729',
                        checked: true
                    }, {
                        boxLabel: 'g723',
                        name: 'allow',
                        inputValue: 'g723'
                    }, {
                        boxLabel: 'gsm',
                        name: 'allow',
                        inputValue: 'gsm',
                        checked: true
                    }, {
                        boxLabel: 'g726',
                        name: 'allow',
                        inputValue: 'g726'
                    }, {
                        boxLabel: 'opus',
                        name: 'allow',
                        inputValue: 'opus',
                        checked: true
                    }, {
                        boxLabel: 'alaw',
                        name: 'allow',
                        inputValue: 'alaw',
                        checked: true
                    }, {
                        boxLabel: 'ulaw',
                        name: 'allow',
                        inputValue: 'ulaw',
                        checked: true
                    }, {
                        boxLabel: 'g722',
                        name: 'allow',
                        inputValue: 'g722'
                    }, {
                        boxLabel: 'ilbc',
                        name: 'allow',
                        inputValue: 'ilbc'
                    }, {
                        boxLabel: 'speex',
                        name: 'allow',
                        inputValue: 'speex'
                    }, {
                        boxLabel: 'h261',
                        name: 'allow',
                        inputValue: 'h261'
                    }, {
                        boxLabel: 'h263',
                        name: 'allow',
                        inputValue: 'h263'
                    }],
                    allowBlank: true
                }, {
                    xtype: 'sipcombo',
                    name: 'providertech',
                    fieldLabel: t('Provider tech')
                }, {
                    xtype: 'booleancombo',
                    name: 'status',
                    fieldLabel: t('Status')
                }, {
                    xtype: 'noyescombo',
                    name: 'allow_error',
                    fieldLabel: t('Go to backup if 404'),
                    hidden: !window.dialC
                }, {
                    xtype: 'noyescombo',
                    name: 'register',
                    fieldLabel: t('Register trunk')
                }, {
                    name: 'register_string',
                    fieldLabel: t('Register string'),
                    allowBlank: true,
                    hidden: true
                }, {
                    xtype: 'noyescombo',
                    name: 'cnl',
                    fieldLabel: t('Enable CNL'),
                    hidden: App.user.language != 'pt_BR'
                }]
            }, {
                title: t('Supplementary info'),
                defaults: {
                    labelAlign: 'right',
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true,
                    labelWidth: 142
                },
                items: [{
                    name: 'fromuser',
                    fieldLabel: t('Fromuser'),
                    allowBlank: true
                }, {
                    name: 'fromdomain',
                    fieldLabel: t('Fromdomain'),
                    allowBlank: true
                }, {
                    name: 'cid_add',
                    fieldLabel: t('CID') + ' ' + t('Add prefix'),
                    allowBlank: true,
                    value: ''
                }, {
                    name: 'cid_remove',
                    fieldLabel: t('CID') + ' ' + t('Remove prefix'),
                    allowBlank: true,
                    value: ''
                }, {
                    name: 'block_cid',
                    fieldLabel: t('Block CID REGEX'),
                    hidden: !window.dialC || !App.user.isAdmin,
                    allowBlank: true
                }, {
                    name: 'context',
                    fieldLabel: t('Context'),
                    allowBlank: true,
                    value: 'billing'
                }, {
                    name: 'dtmfmode',
                    fieldLabel: t('Dtmfmode'),
                    allowBlank: true,
                    value: 'RFC2833'
                }, {
                    name: 'insecure',
                    fieldLabel: t('Insecure'),
                    allowBlank: true,
                    value: 'port,invite'
                }, {
                    xtype: 'numberfield',
                    name: 'maxuse',
                    fieldLabel: t('Max use'),
                    allowBlank: true,
                    value: -1,
                    minValue: -1
                }, {
                    name: 'nat',
                    fieldLabel: t('NAT'),
                    value: 'force_rport,comedia',
                    allowBlank: true
                }, {
                    name: 'directmedia',
                    fieldLabel: t('Directmedia'),
                    allowBlank: true,
                    value: 'no'
                }, {
                    name: 'qualify',
                    fieldLabel: t('Qualify'),
                    allowBlank: true,
                    value: 'yes'
                }, {
                    name: 'type',
                    fieldLabel: t('Type'),
                    allowBlank: true,
                    value: 'peer'
                }, {
                    name: 'disallow',
                    fieldLabel: t('Disallow'),
                    hidden: true,
                    allowBlank: true,
                    value: 'all'
                }, {
                    name: 'sendrpid',
                    fieldLabel: t('Sendrpid'),
                    allowBlank: true,
                    value: 'no'
                }, {
                    name: 'addparameter',
                    fieldLabel: t('Addparameter'),
                    allowBlank: true,
                    emptyText: t('Dial parameter')
                }, {
                    xtype: 'numberfield',
                    name: 'port',
                    fieldLabel: t('Port'),
                    value: '5060',
                    readOnly: !App.user.isAdmin,
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    xtype: 'textarea',
                    name: 'link_sms',
                    fieldLabel: t('Link SMS'),
                    allowBlank: true,
                    emptyText: t('Replace %number% and %text% on the provider URL- Ex: http://website.com/sms.php?username=USER&pass=PASS&number=%number%&msg=%text%'),
                    height: 60,
                    anchor: '100%',
                    hidden: true
                }, {
                    name: 'sms_res',
                    fieldLabel: t('SMS match result'),
                    allowBlank: true,
                    hidden: true
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
            }]
        }];
        me.callParent(arguments);
    }
});