/**
 * Classe que define o form de "iax"
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
 * 25/06/2016
 */
Ext.define('MBilling.view.iax.Form', {
    extend: 'Ext.ux.form.Panel',
    uses: ['Ext.ux.form.field.DateTime'],
    alias: 'widget.iaxform',
    bodyPadding: 0,
    fieldsHideUpdateLot: ['id_user', 'defaultuser', 'secret'],
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
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true,
                    labelAlign: 'right'
                }
            },
            items: [{
                title: t('General'),
                items: [{
                    xtype: 'userlookup',
                    name: 'id_user',
                    fieldLabel: t('Username'),
                    ownerForm: me,
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    name: 'username',
                    fieldLabel: t('IAX user'),
                    minLength: 4,
                    readOnly: App.user.isClient
                }, {
                    name: 'secret',
                    fieldLabel: t('IAX password'),
                    allowBlank: true,
                    minLength: 6,
                    readOnly: App.user.isClient
                }, {
                    name: 'callerid',
                    fieldLabel: t('CallerID'),
                    allowBlank: true
                }, {
                    name: 'disallow',
                    fieldLabel: t('Disallow'),
                    value: 'all',
                    hidden: !App.user.isAdmin,
                    allowBlank: App.user.isClient
                }, {
                    xtype: 'checkboxgroup',
                    columns: 3,
                    name: 'allow',
                    fieldLabel: t('Codec'),
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
                    hidden: !App.user.isAdmin,
                    allowBlank: App.user.isClient
                }, {
                    name: 'host',
                    fieldLabel: t('Host'),
                    value: 'dynamic',
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }]
            }, {
                title: t('NAT details'),
                hidden: !App.user.isAdmin,
                items: [{
                    name: 'nat',
                    fieldLabel: t('NAT'),
                    value: 'force_rport,comedia',
                    allowBlank: !App.user.isAdmin
                }]
            }, {
                title: t('Supplementary info'),
                hidden: !App.user.isAdmin,
                items: [{
                    name: 'context',
                    fieldLabel: t('Context'),
                    value: 'billing',
                    hidden: !App.user.isAdmin,
                    allowBlank: true
                }, {
                    xtype: 'yesnostringcombo',
                    name: 'qualify',
                    fieldLabel: t('Qualify'),
                    value: 'no',
                    allowBlank: !App.user.isAdmin
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
                    name: 'type',
                    fieldLabel: t('Type'),
                    value: 'friend',
                    allowBlank: !App.user.isAdmin
                }, {
                    xtype: 'numberfield',
                    name: 'calllimit',
                    fieldLabel: t('Call limit'),
                    value: '0',
                    allowBlank: !App.user.isAdmin
                }]
            }]
        }];
        me.callParent(arguments);
    }
});