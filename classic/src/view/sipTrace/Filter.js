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
Ext.define('MBilling.view.sipTrace.Filter', {
    extend: 'Ext.window.Window',
    alias: 'widget.siptracefilter',
    autoShow: true,
    modal: true,
    layout: 'fit',
    iconCls: 'icon-import-csv',
    title: t('SipTrace filter'),
    width: 400,
    height: window.isThemeTriton ? 220 : 180,
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
                value: 60,
                min: 5,
                max: 300,
                name: 'timeout',
                fieldLabel: t('Filter timeout')
            }, {
                xtype: 'numberfield',
                name: 'port',
                fieldLabel: t('Port'),
                allowBlank: false,
                value: 5060
            }, {
                xtype: 'textfield',
                name: 'filter',
                fieldLabel: t('Filter'),
                allowBlank: false,
                emptyText: 'IP, sip account or number ....'
            }]
        }];
        me.title = me.title + (me.titleModule ? ' - ' + me.titleModule : '');
        me.bbar = [{
            width: 150,
            iconCls: 'icon-play',
            text: t('Start capture'),
            scope: me,
            handler: me.onStart
        }];
        me.callParent(arguments);
    },
    onStart: function(btn) {
        var me = this,
            store = me.list.store;
        if (!me.down('form').isValid()) {
            return;
        }
        //btn.disable();
        me.list.setLoading(true);
        Ext.Ajax.setTimeout(1000000);
        me.down('form').submit({
            url: 'index.php/sipTrace/start',
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
                    Ext.ux.Alert.alert(t('Error'), obj.errors, 'error', true, 30);
                } else {
                    Ext.ux.Alert.alert(t('Error'), Ext.decode(action.response.responseText).msg, 'error', true, 30);
                }
                btn.enable();
                me.list.setLoading(false);
                store.load();
                me.close();
            }
        });
    }
});