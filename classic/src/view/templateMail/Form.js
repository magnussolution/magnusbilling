/**
 * Class to define form to "Cliente"
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 15/04/2013
 */
Ext.define('MBilling.view.templateMail.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.templatemailform',
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
                    labelAlign: 'right',
                    enableKeyEvents: true
                }
            },
            items: [{
                title: t('General'),
                reference: 'generalTab',
                items: [{
                    name: 'fromname',
                    fieldLabel: t('From name')
                }, {
                    name: 'fromemail',
                    fieldLabel: t('From email')
                }, {
                    name: 'subject',
                    fieldLabel: t('Subject')
                }, {
                    xtype: 'booleancombo',
                    name: 'status',
                    fieldLabel: t('Status'),
                    hidden: App.user.isClient
                }]
            }, {
                title: t('Email body'),
                items: [{
                    xtype: 'htmleditor',
                    name: 'messagehtml',
                    fieldLabel: t('Description'),
                    hideLabel: true,
                    height: 1000,
                    anchor: '100%'
                }]
            }, {
                title: t('Variables'),
                defaults: {
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    labelAlign: 'right',
                    enableKeyEvents: true,
                    labelWidth: 200
                },
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: t('Username'),
                    value: '<span style="color:green;">$login$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('Password'),
                    value: '<span style="color:green;">$password$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('Email'),
                    value: '<span style="color:green;">$email$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('First name'),
                    value: '<span style="color:green;">$firstname$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('Last name'),
                    value: '<span style="color:green;">$lastname$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('Credit'),
                    value: '<span style="color:green;">$credit$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('Date'),
                    value: '<span style="color:green;">$time$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('Description'),
                    value: '<span style="color:green;">$description$</span>',
                    allowBlank: true
                }, {
                    xtype: 'displayfield',
                    fieldLabel: t('URL to cancel email credit notification'),
                    value: '<span style="color:green;">$cancel_credit_notification_email$</span>',
                    allowBlank: true
                }]
            }]
        }];
        me.callParent(arguments);
    }
});