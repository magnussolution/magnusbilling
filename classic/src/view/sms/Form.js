/**
 * Classe que define o form de "Did"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author  Adilson Leffa Magnus.
 * @copyright Todos os direitos reservados.
 * ###################################
 * =======================================
 * MagnusSolution.com <info@magnussolution.com>
 * 24/09/2012
 */
Ext.define('MBilling.view.sms.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.smsform',
    fieldsHide: ['id_user'],
    fieldsHideCreate: ['result'],
    fieldSearch: 'telephone',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            hidden: App.user.isClient,
            allowBlank: App.user.isClient
        }, {
            name: 'telephone',
            fieldLabel: t('Number'),
            emptyText: 'DDI DDD Nº',
            maxLength: 16
        }, {
            xtype: 'textareafield',
            name: 'sms',
            fieldLabel: t('SMS'),
            maxLength: 160
        }, {
            name: 'sms_from',
            fieldLabel: t('From'),
            allowBlank: true
        }, {
            xtype: 'textareafield',
            name: 'result',
            fieldLabel: t('Provider result'),
            allowBlank: true
        }];
        me.callParent(arguments);
    }
});