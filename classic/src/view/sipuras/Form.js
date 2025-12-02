/**
 * Classe que define o form de "Admin"
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
 * 01/08/2012
 */
Ext.define('MBilling.view.sipuras.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.sipurasform',
    bodyPadding: 0,
    fieldsHideUpdateLot: ['id_user', 'nserie', 'macadr'],
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
                    ownerForm: me,
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    name: 'nserie',
                    fieldLabel: t('Serial')
                }, {
                    name: 'macadr',
                    fieldLabel: t('MAC')
                }, {
                    name: 'senha_user',
                    fieldLabel: t('User password'),
                    allowBlank: true
                }, {
                    name: 'senha_admin',
                    fieldLabel: t('Admin password'),
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'antireset',
                    fieldLabel: t('Antireset')
                }, {
                    xtype: 'yesnocombo',
                    name: 'Enable_Web_Server',
                    fieldLabel: t('Enable_Web_Server')
                }, {
                    name: 'Dial_Tone',
                    fieldLabel: t('Dial Tone'),
                    value: '420@-16;10(*/0/1)'
                }]
            }, {
                title: t('Line 1'),
                items: [{
                    name: 'Proxy_1',
                    fieldLabel: t('Proxy') + ' 1',
                    allowBlank: true
                }, {
                    name: 'User_ID_1',
                    fieldLabel: t('Username'),
                    allowBlank: true
                }, {
                    name: 'Password_1',
                    fieldLabel: t('Password'),
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'Use_Pref_Codec_Only_1',
                    fieldLabel: t('Use_Pref_Codec')
                }, {
                    name: 'Preferred_Codec_1',
                    fieldLabel: t('Codec'),
                    allowBlank: true,
                    value: 'G729a'
                }, {
                    name: 'Register_Expires_1',
                    fieldLabel: t('Register expires'),
                    allowBlank: true,
                    value: '360'
                }, {
                    name: 'Dial_Plan_1',
                    fieldLabel: t('Dial plan'),
                    allowBlank: true,
                    value: '(*xx|[3469]11|0|00|[2-9]xxxxxx|1xxx[2-9]xxxxxxS0|xxxxxxxxxxxx.)'
                }, {
                    xtype: 'noyescombo',
                    name: 'NAT_Mapping_Enable_1_',
                    fieldLabel: t('NAT Mapping'),
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'NAT_Keep_Alive_Enable_1_',
                    fieldLabel: t('NAT keep alive'),
                    allowBlank: true
                }]
            }, {
                title: t('Line 2'),
                items: [{
                    name: 'Proxy_2',
                    fieldLabel: t('Proxy') + ' 2',
                    allowBlank: true
                }, {
                    name: 'User_ID_2',
                    fieldLabel: t('Username'),
                    allowBlank: true
                }, {
                    name: 'Password_2',
                    fieldLabel: t('Password'),
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'Use_Pref_Codec_Only_2',
                    fieldLabel: t('Use_Pref_Codec')
                }, {
                    name: 'Preferred_Codec_2',
                    fieldLabel: t('Codec'),
                    allowBlank: true,
                    value: 'G729a'
                }, {
                    name: 'Register_Expires_2',
                    fieldLabel: t('Register expires'),
                    allowBlank: true,
                    value: '360'
                }, {
                    name: 'Dial_Plan_2',
                    fieldLabel: t('Dial plan'),
                    allowBlank: true,
                    value: '(*xx|[3469]11|0|00|[2-9]xxxxxx|1xxx[2-9]xxxxxxS0|xxxxxxxxxxxx.)'
                }, {
                    xtype: 'noyescombo',
                    name: 'NAT_Mapping_Enable_2_',
                    fieldLabel: t('NAT Mapping'),
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'NAT_Keep_Alive_Enable_2_',
                    fieldLabel: t('NAT keep alive'),
                    allowBlank: true
                }]
            }, {
                title: 'Stun',
                items: [{
                    xtype: 'noyescombo',
                    name: 'STUN_Enable',
                    fieldLabel: t('Enable STUN'),
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'STUN_Test_Enable',
                    fieldLabel: t('STUN Test'),
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'Substitute_VIA_Addr',
                    fieldLabel: t('Substitute VIA Addr'),
                    allowBlank: true
                }, {
                    name: 'STUN_Server',
                    fieldLabel: t('STUN Server'),
                    allowBlank: true
                }]
            }]
        }];
        me.callParent(arguments);
    }
});