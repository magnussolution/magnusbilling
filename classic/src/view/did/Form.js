/**
 * Classe que define o form de "Did"
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
 * 24/09/2012
 */
Ext.define('MBilling.view.did.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.didform',
    fieldsHideUpdateLot: ['did'],
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
                    labelWidth: 180
                }
            },
            items: [{
                title: t('General'),
                reference: 'generalTab',
                items: [{
                    name: 'did',
                    fieldLabel: t('DID'),
                    readOnly: App.user.isClient || App.user.isAgent
                }, {
                    name: 'country',
                    fieldLabel: t('Country'),
                    value: '',
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'record_call',
                    fieldLabel: t('Record call'),
                    allowBlank: true,
                    hidden: window.global_record_calls == true
                }, {
                    xtype: 'booleancombo',
                    name: 'activated',
                    fieldLabel: t('Status'),
                    hidden: App.user.isClient || App.user.isAgent,
                    allowBlank: true
                }, {
                    name: 'callerid',
                    fieldLabel: t('Callerid name'),
                    allowBlank: true
                }, {
                    xtype: 'moneyfield',
                    name: 'connection_charge',
                    fieldLabel: t('Setup price'),
                    mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                    value: '0',
                    hidden: App.user.isClient || App.user.isAgent
                }, {
                    xtype: 'moneyfield',
                    name: 'fixrate',
                    fieldLabel: t('Monthly price'),
                    mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                    value: '0',
                    hidden: App.user.isClient || App.user.isAgent
                }, {
                    xtype: 'moneyfield',
                    name: 'connection_sell',
                    fieldLabel: t('Connection charge'),
                    mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                    value: '0',
                    hidden: !App.user.isAdmin
                }, {
                    xtype: 'fieldset',
                    title: t('DID increment Buy'),
                    style: 'margin-top:5px; overflow: visible;',
                    collapsible: false,
                    collapsed: false,
                    hidden: !App.user.isAdmin,
                    defaults: {
                        labelWidth: 170,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'numberfield',
                        name: 'minimal_time_buy',
                        fieldLabel: t('Minimum time to charge'),
                        value: '1',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'numberfield',
                        name: 'buyrateinitblock',
                        fieldLabel: t('Buy price initblock'),
                        value: '1',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'numberfield',
                        name: 'buyrateincrement',
                        fieldLabel: t('Buy price increment'),
                        value: '1',
                        hidden: !App.user.isAdmin
                    }]
                }, {
                    xtype: 'fieldset',
                    title: t('DID increment Sell'),
                    style: 'margin-top:5px; overflow: visible;',
                    collapsible: false,
                    collapsed: false,
                    hidden: !App.user.isAdmin,
                    defaults: {
                        labelWidth: 170,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'numberfield',
                        name: 'minimal_time_charge',
                        fieldLabel: t('Minimum time to charge'),
                        value: '1',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'numberfield',
                        name: 'initblock',
                        fieldLabel: t('Initial block'),
                        value: '1',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'numberfield',
                        name: 'increment',
                        fieldLabel: t('Billing block'),
                        value: '1',
                        hidden: !App.user.isAdmin
                    }]
                }, {
                    xtype: 'combobox',
                    name: 'charge_of',
                    fieldLabel: t('Charge who'),
                    value: 1,
                    forceSelection: true,
                    editable: false,
                    store: [
                        [1, t('DID owner')],
                        [0, t('CallerID, only allowing calls from registered callerIDs')]
                    ],
                    hidden: App.user.isClient || App.user.isAgent
                }, {
                    xtype: 'numberfield',
                    name: 'calllimit',
                    fieldLabel: t('Channel limit'),
                    value: '-1',
                    minValue: '-1',
                    hidden: !window.didChannelLimit || !App.user.isAdmin
                }, {
                    xtype: 'serverscombo',
                    name: 'id_server',
                    fieldLabel: t('Server'),
                    allowBlank: true
                }, {
                    xtype: 'textareafield',
                    allowBlank: true,
                    name: 'description',
                    fieldLabel: t('Description'),
                    hidden: !App.user.isAdmin
                }]
            }, {
                title: t('Billing'),
                reference: 'billingTab',
                hidden: App.user.isClient,
                items: [{
                    xtype: 'fieldset',
                    style: 'margin-top:5px; overflow: visible;',
                    title: t('DID billing per minute rate') + ' 1',
                    collapsible: false,
                    collapsed: false,
                    defaults: {
                        labelWidth: 250,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'expression_1',
                        fieldLabel: t('Regular expression'),
                        value: '.*',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        name: 'buy_rate_1',
                        fieldLabel: t('Buy price per min'),
                        value: '0',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        name: 'selling_rate_1',
                        fieldLabel: t('Sell price per min'),
                        value: '0',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        name: 'agent_client_rate_1',
                        fieldLabel: App.user.isAgent ? t('Sell price per min') : t('Agent\'s client price per min'),
                        value: '0',
                        hidden: App.user.isClient
                    }, {
                        xtype: 'noyescombo',
                        name: 'block_expression_1',
                        fieldLabel: t('Block calls from this expression'),
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'noyescombo',
                        name: 'send_to_callback_1',
                        fieldLabel: t('Send the call to callback'),
                        hidden: !App.user.isAdmin
                    }]
                }, {
                    xtype: 'fieldset',
                    style: 'margin-top:25px; overflow: visible;',
                    title: t('DID billing per minute rate') + ' 2',
                    collapsible: false,
                    collapsed: false,
                    hidden: App.user.isClient,
                    defaults: {
                        labelWidth: 250,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'expression_2',
                        fieldLabel: t('Regular expression'),
                        value: '.*',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        name: 'buy_rate_2',
                        fieldLabel: t('Buy price per min'),
                        value: '0',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        name: 'selling_rate_2',
                        fieldLabel: t('Sell price per min'),
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        value: '0',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        name: 'agent_client_rate_2',
                        fieldLabel: App.user.isAgent ? t('Sell price per min') : t('Agent\'s client price per min'),
                        value: '0',
                        hidden: App.user.isClient
                    }, {
                        xtype: 'noyescombo',
                        name: 'block_expression_2',
                        fieldLabel: t('Block calls from this expression'),
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'noyescombo',
                        name: 'send_to_callback_2',
                        fieldLabel: t('Send the call to callback'),
                        hidden: !App.user.isAdmin
                    }]
                }, {
                    xtype: 'fieldset',
                    style: 'margin-top:25px; overflow: visible;',
                    title: t('DID billing per minute rate') + ' 3',
                    collapsible: false,
                    collapsed: false,
                    hidden: App.user.isClient,
                    defaults: {
                        labelWidth: 250,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'expression_3',
                        fieldLabel: t('Regular expression'),
                        value: '.*',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        name: 'buy_rate_3',
                        fieldLabel: t('Buy price per min'),
                        value: '0',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        name: 'selling_rate_3',
                        fieldLabel: t('Sell price per min'),
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        value: '0',
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'moneyfield',
                        mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                        name: 'agent_client_rate_3',
                        fieldLabel: App.user.isAgent ? t('Sell price per min') : t('Agent\'s client price per min'),
                        value: '0',
                        hidden: App.user.isClient
                    }, {
                        xtype: 'noyescombo',
                        name: 'block_expression_3',
                        fieldLabel: t('Block calls from this expression'),
                        hidden: !App.user.isAdmin
                    }, {
                        xtype: 'noyescombo',
                        name: 'send_to_callback_3',
                        fieldLabel: t('Send the call to callback'),
                        hidden: !App.user.isAdmin
                    }]
                }]
            }, {
                title: t('CallBack pro'),
                hidden: !window.cbr || !App.user.isAdmin,
                items: [{
                    xtype: 'booleancombo',
                    name: 'cbr',
                    fieldLabel: t('CallBack pro'),
                    value: 0,
                    //window.cbr=1; no index.html
                    hidden: !window.cbr,
                    allowBlank: true
                }, {
                    xtype: 'noyescombo',
                    name: 'cbr_ua',
                    fieldLabel: t('Use audio'),
                    value: 0,
                    hidden: true,
                    allowBlank: true
                }, {
                    xtype: 'numberfield',
                    name: 'cbr_total_try',
                    fieldLabel: t('Maximum trying'),
                    value: 3,
                    hidden: true,
                    allowBlank: true,
                    minValue: 0
                }, {
                    xtype: 'numberfield',
                    name: 'cbr_time_try',
                    fieldLabel: t('Interval between trying'),
                    value: 30,
                    hidden: true,
                    allowBlank: true,
                    minValue: 10
                }, {
                    xtype: 'noyescombo',
                    name: 'cbr_em',
                    fieldLabel: t('Early media'),
                    hidden: true,
                    allowBlank: true
                }, {
                    name: 'TimeOfDay_monFri',
                    fieldLabel: t('Mon-Fri'),
                    value: '09:00-12:00|14:00-18:00',
                    minLength: 11,
                    hidden: true
                }, {
                    name: 'TimeOfDay_sat',
                    fieldLabel: t('Sat'),
                    value: '09:00-12:00',
                    allowBlank: true,
                    hidden: true
                }, {
                    name: 'TimeOfDay_sun',
                    fieldLabel: t('Sun'),
                    value: '00:00',
                    allowBlank: true,
                    hidden: true
                }, {
                    xtype: 'uploadfield',
                    name: 'workaudio',
                    fieldLabel: t('Work audio'),
                    emptyText: 'Select an gsm File',
                    allowBlank: true,
                    extAllowed: ['wav', 'gsm'],
                    hidden: true
                }, {
                    xtype: 'uploadfield',
                    name: 'noworkaudio',
                    fieldLabel: t('Out work audio'),
                    emptyText: 'Select an gsm File',
                    allowBlank: true,
                    extAllowed: ['wav', 'gsm'],
                    hidden: true
                }]
            }]
        }];
        me.callParent(arguments);
    }
});