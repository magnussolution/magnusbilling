/**
 * Classe que define a window import csv de "Rate"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author  Adilson Leffa Magnus.
 * @copyright   Todos os direitos reservados.
 * ###################################
 * =======================================
 * MagnusSolution.com <info@magnussolution.com>
 * 08/11/2012
 */
Ext.define('MBilling.view.user.Bulk', {
    extend: 'Ext.window.Window',
    alias: 'widget.userbulk',
    autoShow: true,
    modal: true,
    layout: 'fit',
    iconCls: 'icon-import-csv',
    title: t('Bulk user'),
    width: 400,
    height: window.isThemeNeptune || window.isThemeCrisp ? 295 : window.isThemeTriton ? 390 : 270,
    labelWidthFields: 120,
    htmlTipInfo: '',
    fieldsImport: [],
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'form',
            bodyPadding: 5,
            defaults: {
                anchor: '0',
                enableKeyEvents: true,
                labelWidth: me.labelWidthFields,
                msgTarget: 'side',
                plugins: 'markallowblank',
                allowBlank: false
            },
            items: [{
                xtype: 'numberfield',
                value: 10,
                name: 'totalToCreate',
                fieldLabel: t('How many users?')
            }, {
                xtype: 'moneyfield',
                mask: App.user.currency + ' #9.999.990,00',
                name: 'credit',
                value: 0,
                fieldLabel: t('Add refill'),
                readOnly: App.user.isClient
            }, {
                xtype: 'groupusercombo',
                allowBlank: !App.user.isAdmin,
                hidden: !App.user.isAdmin
            }, {
                xtype: 'languagecombo',
                name: 'language',
                value: App.user.language == 'pt_BR' ? 'br' : App.user.language,
                fieldLabel: t('Language')
            }, {
                xtype: 'plancombo',
                hidden: App.user.isClient,
                allowBlank: App.user.isClient
            }, {
                xtype: 'textfield',
                name: 'prefix_local',
                fieldLabel: t('Prefix rules'),
                value: App.user.base_country == 'BRL' ? '0/55,*/5511/8,*/5511/9' : App.user.base_country == 'ARG' ? '0/54,*/5411/8,15/54911/10,16/54911/10' : '',
                allowBlank: true,
                emptyText: 'match / replace / length',
                hidden: App.user.isClient
            }, {
                xtype: 'statususercombo',
                name: 'active',
                fieldLabel: t('Active'),
                hidden: App.user.isClient,
                allowBlank: App.user.isClient
            }]
        }];
        me.title = me.title + (me.titleModule ? ' - ' + me.titleModule : '');
        me.bbar = [{
            width: 150,
            iconCls: 'icon-import-csv',
            text: t('Bulk user'),
            scope: me,
            handler: me.onBulk
        }];
        me.callParent(arguments);
    },
    onBulk: function(btn) {
        var me = this,
            store = me.list.store;
        if (!me.down('form').isValid()) {
            return;
        }
        //btn.disable();
        me.list.setLoading(true);
        Ext.Ajax.setTimeout(1000000);
        me.down('form').submit({
            url: 'index.php/user/bulk',
            scope: me,
            success: function(form, action) {
                var obj = Ext.decode(action.response.responseText);
                console.log(obj);
                if (obj.success) {
                    Ext.ux.Alert.alert(t('Success'), obj.msg, 'success');
                } else {
                    Ext.ux.Alert.alert(t('Error'), obj.errors, 'error');
                }
                btn.enable();
                me.list.setLoading(false);
                store.load();
                me.close();
            },
            failure: function(form, action) {
                console.log(action.response.responseText);
                if (action.response && Ext.isObject(action.response.responseText)) {
                    var obj = Ext.decode(action.response.responseText);
                    Ext.ux.Alert.alert(t('Error1'), obj.errors, 'error');
                } else {
                    Ext.ux.Alert.alert(t('Error2'), Ext.decode(action.response.responseText).msg, 'error', true, 10);
                }
                btn.enable();
            }
        });
    }
});