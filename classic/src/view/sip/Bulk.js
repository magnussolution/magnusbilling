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
Ext.define('MBilling.view.sip.Bulk', {
    extend: 'Ext.window.Window',
    alias: 'widget.sipbulk',
    autoShow: true,
    modal: true,
    layout: 'fit',
    iconCls: 'icon-import-csv',
    title: t('Bulk SIP'),
    width: 400,
    height: window.isThemeNeptune || window.isThemeCrisp ? 210 : window.isThemeTriton ? 230 : 240,
    labelWidthFields: 180,
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
                name: 'totalToCreate',
                fieldLabel: t('How many SIP Users?'),
                value: 10
            }, {
                xtype: 'userlookup',
                name: 'id_user',
                fieldLabel: t('Username'),
                allowBlank: App.user.isClient
            }, {
                xtype: 'textfield',
                name: 'secret',
                fieldLabel: t('Password'),
                emptyText: t('Leave blank to auto generate'),
                allowBlank: true,
                value: ''
            }, {
                xtype: 'textfield',
                name: 'sip_group',
                fieldLabel: t('Group'),
                allowBlank: true
            }]
        }];
        me.title = me.title + (me.titleModule ? ' - ' + me.titleModule : '');
        me.bbar = [{
            width: 150,
            iconCls: 'icon-import-csv',
            text: t('Bulk SIP'),
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
            url: 'index.php/sip/bulk',
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
                var obj = Ext.decode(action.response.responseText);
                console.log(obj);
                Ext.ux.Alert.alert(t('Error'), obj.msg, 'error');
                btn.enable();
            }
        });
    }
});