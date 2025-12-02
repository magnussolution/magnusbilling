/**
 * Classe que define o form de "Campaign"
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
Ext.define('MBilling.view.campaign.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.campaignform',
    bodyPadding: 0,
    fileUpload: true,
    initComponent: function() {
        var me = this;
        if (App.user.isAdmin) {
            me.fieldsHideUpdateLot = ['id_user', 'name', 'audio', 'audio_2', 'id_phonebook'];
        }
        me.items = [{
            xtype: 'tabpanel',
            defaults: {
                border: false,
                defaultType: 'textfield',
                layout: 'anchor',
                bodyPadding: 5,
                defaults: {
                    labelWidth: 150,
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    labelAlign: 'right'
                }
            },
            items: [{
                title: t('General'),
                items: [{
                    xtype: App.user.isClient ? 'textfield' : 'userlookup',
                    name: 'id_user',
                    fieldLabel: t('Username'),
                    ownerForm: me,
                    allowBlank: App.user.isClient,
                    hidden: App.user.isClient
                }, {
                    xtype: 'plancombo',
                    name: 'id_plan',
                    fieldLabel: t('Plan'),
                    hidden: App.user.isClient,
                    allowBlank: App.user.isClient
                }, {
                    name: 'name',
                    fieldLabel: t('Name')
                }, {
                    name: 'callerid',
                    fieldLabel: t('CallerID'),
                    allowBlank: true
                }, {
                    xtype: 'booleancombo',
                    name: 'status',
                    fieldLabel: t('Status')
                }, {
                    xtype: 'datetimefield',
                    name: 'startingdate',
                    fieldLabel: t('Starting date'),
                    format: 'Y-m-d H:i:s',
                    value: new Date()
                }, {
                    xtype: 'datetimefield',
                    name: 'expirationdate',
                    fieldLabel: t('Expiration date'),
                    format: 'Y-m-d H:i:s',
                    value: '2030-01-01 00:00:00'
                }, {
                    xtype: 'campaigntypefullcombo',
                    name: 'type',
                    fieldLabel: t('Type')
                }, {
                    xtype: 'uploadfield',
                    name: 'audio',
                    fieldLabel: t('Audio'),
                    emptyText: 'Select an wav or gsm File',
                    allowBlank: true,
                    extAllowed: ['wav', 'gsm']
                }, {
                    xtype: 'uploadfield',
                    name: 'audio_2',
                    fieldLabel: t('Audio 2'),
                    emptyText: 'Select an wav or gsm File',
                    allowBlank: true,
                    extAllowed: ['wav', 'gsm']
                }, {
                    xtype: 'yesnocombo',
                    name: 'restrict_phone',
                    fieldLabel: t('Restrict phone'),
                    hidden: App.user.isClient,
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'auto_reprocess',
                    fieldLabel: t('Auto reprocess')
                }, {
                    xtype: 'fieldset',
                    style: 'margin-top:10px; overflow: visible;',
                    title: t('Select one or more phonebook'),
                    collapsible: true,
                    collapsed: false,
                    height: 80,
                    items: [{
                        xtype: 'phonebooktag',
                        name: 'id_phonebook',
                        fieldLabel: t(''),
                        labelWidth: 10,
                        anchor: '100%',
                        allowBlank: true
                    }]
                }]
            }, {
                title: t('Forward'),
                items: [{
                    xtype: 'fieldset',
                    style: 'margin-top:10px; overflow: visible;',
                    title: t('Forward to'),
                    collapsible: true,
                    collapsed: false,
                    height: window.isThemeTriton ? 280 : 200,
                    defaults: {
                        labelWidth: 190,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'combobox',
                        name: 'digit_authorize',
                        fieldLabel: t('Number to forward'),
                        forceSelection: true,
                        editable: false,
                        value: '-1',
                        store: [
                            ['-1', t('Disable')],
                            ['-2', t('Any digit')],
                            ['-3', t('Every')],
                            ['0', '0'],
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3'],
                            ['4', '4'],
                            ['5', '5'],
                            ['6', '6'],
                            ['7', '7'],
                            ['8', '8'],
                            ['9', '9']
                        ]
                    }, {
                        xtype: 'typecampaigndestinationcombo',
                        name: 'type_0',
                        fieldLabel: t('Forward type'),
                        allowBlank: true
                    }, {
                        xtype: 'ivrlookup',
                        ownerForm: me,
                        name: 'id_ivr_0',
                        fieldLabel: t('IVR'),
                        displayField: 'id_ivr_0_name',
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'queuelookup',
                        ownerForm: me,
                        name: 'id_queue_0',
                        fieldLabel: t('Queue'),
                        displayField: 'id_queue_0_name',
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'siplookup',
                        ownerForm: me,
                        name: 'id_sip_0',
                        fieldLabel: t('Sip user'),
                        displayField: 'id_sip_0_name',
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'textfield',
                        name: 'extension_0',
                        fieldLabel: t('Destination'),
                        hidden: true
                    }, {
                        xtype: 'noyescombo',
                        name: 'record_call',
                        fieldLabel: t('Record call'),
                        allowBlank: true
                    }]
                }]
            }, {
                title: t('Schedules'),
                items: [{
                    name: 'daily_start_time',
                    fieldLabel: t('Daily start time'),
                    value: '09:00'
                }, {
                    name: 'daily_stop_time',
                    fieldLabel: t('Daily stop time'),
                    value: '18:00'
                }, {
                    xtype: 'yesnocombo',
                    name: 'monday',
                    fieldLabel: t('Monday')
                }, {
                    xtype: 'yesnocombo',
                    name: 'tuesday',
                    fieldLabel: t('Tuesday')
                }, {
                    xtype: 'yesnocombo',
                    name: 'wednesday',
                    fieldLabel: t('Wednesday')
                }, {
                    xtype: 'yesnocombo',
                    name: 'thursday',
                    fieldLabel: t('Thursday')
                }, {
                    xtype: 'yesnocombo',
                    name: 'friday',
                    fieldLabel: t('Friday')
                }, {
                    xtype: 'noyescombo',
                    name: 'saturday',
                    fieldLabel: t('Saturday')
                }, {
                    xtype: 'noyescombo',
                    name: 'sunday',
                    fieldLabel: t('Sunday')
                }]
            }, {
                title: t('Limit'),
                defaults: {
                    anchor: '0',
                    enableKeyEvents: true,
                    labelWidth: 250,
                    msgTarget: 'side',
                    plugins: 'markallowblank',
                    allowBlank: false
                },
                items: [{
                    name: 'frequency',
                    fieldLabel: t('Call limit'),
                    minValue: 1,
                    value: App.user.isClient ? App.user.campaign_user_limit : 10
                }, {
                    name: 'max_frequency',
                    fieldLabel: t('Maximum call limit'),
                    hidden: !App.user.isAdmin,
                    minValue: 1,
                    value: App.user.isClient ? App.user.campaign_user_limit : 10
                }, {
                    name: 'nb_callmade',
                    fieldLabel: t('Audio duration'),
                    hidden: !App.user.isAdmin,
                    allowBlank: true,
                    value: 0
                }, {
                    xtype: 'booleancombo',
                    name: 'enable_max_call',
                    fieldLabel: t('Toggle max completed calls'),
                    hidden: !App.user.isAdmin,
                    allowBlank: true,
                    value: 0
                }, {
                    name: 'secondusedreal',
                    fieldLabel: t('Max completed calls'),
                    hidden: !App.user.isAdmin,
                    allowBlank: true,
                    value: 0
                }]
            }, {
                title: t('SMS'),
                items: [{
                    name: 'from',
                    fieldLabel: 'From',
                    allowBlank: true
                }, {
                    xtype: 'textareafield',
                    name: 'description',
                    fieldLabel: t('Description or SMS Text'),
                    allowBlank: true,
                    maxLength: 300,
                    listeners: {
                        'change': function(field) {
                            text = field.getFieldLabel().split('(');
                            field.setFieldLabel(text[0] + ' (<font color=blue>' + field.getValue().length + '</font>)');
                        }
                    }
                }]
            }, {
                title: 'TTS',
                items: [{
                    name: 'tts_audio',
                    fieldLabel: t('Audio 1 TTS'),
                    allowBlank: true,
                    maxLength: 200
                }, {
                    name: 'tts_audio2',
                    fieldLabel: t('Audio 2 TTS'),
                    allowBlank: true,
                    maxLength: 200
                }]
            }]
        }];
        me.callParent(arguments);
    }
});