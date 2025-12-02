/**
 * Classe que define o form de "Ivr"
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
 * 28/10/2012
 */
Ext.define('MBilling.view.ivr.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.ivrform',
    bodyPadding: 0,
    fileUpload: true,
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
                    labelWidth: 140,
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    labelAlign: 'right'
                }
            },
            items: [{
                title: t('General'),
                items: [{
                    name: 'name',
                    fieldLabel: t('Name')
                }, {
                    xtype: 'userlookup',
                    ownerForm: me,
                    name: 'id_user',
                    fieldLabel: t('Username'),
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    name: 'monFriStart',
                    fieldLabel: t('MonFri intervals'),
                    value: '09:00-12:00|14:00-20:00'
                }, {
                    name: 'satStart',
                    fieldLabel: t('Saturday intervals'),
                    value: '09:00-12:00'
                }, {
                    name: 'sunStart',
                    fieldLabel: t('Sunday intervals'),
                    value: '00:00'
                }, {
                    xtype: 'yesnocombo',
                    name: 'use_holidays',
                    fieldLabel: t('Use holidays')
                }, {
                    xtype: 'uploadfield',
                    name: 'workaudio',
                    fieldLabel: t('Work audio'),
                    emptyText: 'Select an wav or gsm File',
                    allowBlank: true,
                    extAllowed: ['wav', 'gsm']
                }, {
                    xtype: 'uploadfield',
                    name: 'noworkaudio',
                    fieldLabel: t('Out work audio'),
                    emptyText: 'Select an wav or gsm File',
                    allowBlank: true,
                    extAllowed: ['wav', 'gsm']
                }]
            }, {
                title: t('Available options'),
                itemId: 'option',
                defaults: {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    plugins: 'markallowblank',
                    allowBlank: true,
                    anchor: '100%',
                    labelWidth: 100,
                    defaults: {
                        hideLabel: true,
                        hidden: true,
                        flex: 5,
                        startX: 100,
                        allowBlank: true,
                        labelAlign: 'right',
                        ownerForm: me
                    }
                },
                items: [{
                    xtype: 'menuseparator',
                    width: '100%'
                }, {
                    xtype: 'displayfield',
                    labelStyle: 'font-weight:bold',
                    value: '<span style="color:green;">' + t('Sets the destination of the call when a specific digit is pressed.') + '</span>',
                    allowBlank: true
                }, {
                    xtype: 'menuseparator',
                    width: '100%'
                }, {
                    name: 'option_0',
                    fieldLabel: t('Option 0'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_0',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_0',
                        displayField: 'id_ivr_0_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_0',
                        displayField: 'id_queue_0_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_0',
                        displayField: 'id_sip_0_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_0'
                    }]
                }, {
                    name: 'option_1',
                    fieldLabel: t('Option 1'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        fieldLabel: t('Type'),
                        name: 'type_1',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_1',
                        displayField: 'id_ivr_1_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_1',
                        displayField: 'id_queue_1_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_1',
                        displayField: 'id_sip_1_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_1'
                    }]
                }, {
                    name: 'option_2',
                    fieldLabel: t('Option 2'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_2',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_2',
                        displayField: 'id_ivr_2_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_2',
                        displayField: 'id_queue_2_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_2',
                        displayField: 'id_sip_2_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_2'
                    }]
                }, {
                    name: 'option_3',
                    fieldLabel: t('Option 3'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_3',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_3',
                        displayField: 'id_ivr_3_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_3',
                        displayField: 'id_queue_3_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_3',
                        displayField: 'id_sip_3_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_3'
                    }]
                }, {
                    name: 'option_4',
                    fieldLabel: t('Option 4'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_4',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_4',
                        displayField: 'id_ivr_4_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_4',
                        displayField: 'id_queue_4_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_4',
                        displayField: 'id_sip_4_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_4'
                    }]
                }, {
                    name: 'option_5',
                    fieldLabel: t('Option 5'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_5',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_5',
                        displayField: 'id_ivr_5_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_5',
                        displayField: 'id_queue_5_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_5',
                        displayField: 'id_sip_5_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_5'
                    }]
                }, {
                    name: 'option_6',
                    fieldLabel: t('Option 6'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_6',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_6',
                        displayField: 'id_ivr_6_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_6',
                        displayField: 'id_queue_6_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_6',
                        displayField: 'id_sip_6_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_6'
                    }]
                }, {
                    name: 'option_7',
                    fieldLabel: t('Option 7'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_7',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_7',
                        displayField: 'id_ivr_7_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_7',
                        displayField: 'id_queue_7_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_7',
                        displayField: 'id_sip_7_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_7'
                    }]
                }, {
                    name: 'option_8',
                    fieldLabel: t('Option 8'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_8',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_8',
                        displayField: 'id_ivr_8_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_8',
                        displayField: 'id_queue_8_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_8',
                        displayField: 'id_sip_8_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_8'
                    }]
                }, {
                    name: 'option_9',
                    fieldLabel: t('Option 9'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_9',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_9',
                        displayField: 'id_ivr_9_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_9',
                        displayField: 'id_queue_9_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_9',
                        displayField: 'id_sip_9_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_9'
                    }]
                }, {
                    name: 'option_10',
                    fieldLabel: t('Default option'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_10',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_10',
                        displayField: 'id_ivr_10_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_10',
                        displayField: 'id_queue_10_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_10',
                        displayField: 'id_sip_10_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_10'
                    }]
                }, {
                    xtype: 'noyescombo',
                    name: 'direct_extension',
                    fieldLabel: t('Enable known SIP user'),
                    labelAlign: 'right'
                }]
            }, {
                title: t('Unavailable options'),
                itemId: 'optionOut',
                defaults: {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    plugins: 'markallowblank',
                    allowBlank: true,
                    anchor: '100%',
                    labelWidth: 100,
                    defaults: {
                        hideLabel: true,
                        hidden: true,
                        flex: 5,
                        startX: 100,
                        allowBlank: true,
                        ownerForm: me
                    }
                },
                items: [{
                    xtype: 'menuseparator',
                    width: '100%'
                }, {
                    xtype: 'displayfield',
                    labelStyle: 'font-weight:bold',
                    value: '<span style="color:red;">' + t('Sets the destination of the call when a specific digit is pressed.') + '</span>',
                    allowBlank: true
                }, {
                    xtype: 'menuseparator',
                    width: '100%'
                }, {
                    name: 'option_out_0',
                    fieldLabel: t('Option 0'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_0',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_0',
                        displayField: 'id_ivr_out_0_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_0',
                        displayField: 'id_queue_out_0_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_0',
                        displayField: 'id_sip_out_0_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_0'
                    }]
                }, {
                    name: 'option_out_1',
                    fieldLabel: t('Option 1'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_1',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_1',
                        displayField: 'id_ivr_out_1_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_1',
                        displayField: 'id_queue_out_1_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_1',
                        displayField: 'id_sip_out_1_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_1'
                    }]
                }, {
                    name: 'option_out_2',
                    fieldLabel: t('Option 2'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_2',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_2',
                        displayField: 'id_ivr_out_2_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_2',
                        displayField: 'id_queue_out_2_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_2',
                        displayField: 'id_sip_out_2_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_2'
                    }]
                }, {
                    name: 'option_out_3',
                    fieldLabel: t('Option 3'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_3',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_3',
                        displayField: 'id_ivr_out_3_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_3',
                        displayField: 'id_queue_out_3_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_3',
                        displayField: 'id_sip_out_3_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_3'
                    }]
                }, {
                    name: 'option_out_4',
                    fieldLabel: t('Option 4'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_4',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_4',
                        displayField: 'id_ivr_out_4_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_4',
                        displayField: 'id_queue_out_4_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_4',
                        displayField: 'id_sip_out_4_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_4'
                    }]
                }, {
                    name: 'option_out_5',
                    fieldLabel: t('Option 5'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_5',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_5',
                        displayField: 'id_ivr_out_5_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_5',
                        displayField: 'id_queue_out_5_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_5',
                        displayField: 'id_sip_out_5_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_5'
                    }]
                }, {
                    name: 'option_out_6',
                    fieldLabel: t('Option 6'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_6',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_6',
                        displayField: 'id_ivr_out_6_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_6',
                        displayField: 'id_queue_out_6_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_6',
                        displayField: 'id_sip_out_6_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_6'
                    }]
                }, {
                    name: 'option_out_7',
                    fieldLabel: t('Option 7'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_7',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_7',
                        displayField: 'id_ivr_out_7_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_7',
                        displayField: 'id_queue_out_7_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_7',
                        displayField: 'id_sip_out_7_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_7'
                    }]
                }, {
                    name: 'option_out_8',
                    fieldLabel: t('Option 8'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_8',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_8',
                        displayField: 'id_ivr_out_8_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_8',
                        displayField: 'id_queue_out_8_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_8',
                        displayField: 'id_sip_out_8_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_8'
                    }]
                }, {
                    name: 'option_out_9',
                    fieldLabel: t('Option 9'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_9',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_9',
                        displayField: 'id_ivr_out_9_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_9',
                        displayField: 'id_queue_out_9_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_9',
                        displayField: 'id_sip_out_9_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_9'
                    }]
                }, {
                    name: 'option_out_10',
                    fieldLabel: t('Default option'),
                    labelAlign: 'right',
                    items: [{
                        xtype: 'typedestinationcombo',
                        name: 'type_out_10',
                        hidden: false,
                        flex: 2
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr_out_10',
                        displayField: 'id_ivr_out_10_name'
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue_out_10',
                        displayField: 'id_queue_out_10_name'
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip_out_10',
                        displayField: 'id_sip_out_10_name'
                    }, {
                        xtype: 'textfield',
                        name: 'extension_out_10'
                    }]
                }]
            }]
        }];
        me.callParent(arguments);
    }
});