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
Ext.define('MBilling.view.callOnLine.SpyCall', {
    extend: 'Ext.window.Window',
    alias: 'widget.callonlinespycall',
    modal: true,
    layout: 'fit',
    iconCls: 'call',
    title: t('Spy call'),
    width: 450,
    height: window.isThemeNeptune || window.isThemeCrisp ? 170 : window.isThemeTriton ? 290 : 170,
    labelWidthFields: 80,
    channel: 0,
    initComponent: function() {
        var me = this
        if (me.list.getSelectionModel().getSelection().length == 1) {
            selected = me.list.getSelectionModel().getSelection()[0];
            if (selected.get('canal')) {
                me.channel = selected.get('canal');
            } else {
                me.channel = selected.get('channel');
            }
            me.title = t('Spy call') + ' ' + selected.get('ndiscado') + ' ' + me.channel,
                me.autoShow = true;
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
                    xtype: 'siplookup',
                    name: 'id_sip',
                    displayField: t('Sip user')
                }, {
                    xtype: 'combobox',
                    name: 'type',
                    value: 'b',
                    forceSelection: true,
                    editable: false,
                    store: [
                        ['b', t('Only SPY')],
                        ['w', t('Whisper, can talk to the spied')],
                        ['W', t('Whisper, can talk to the spied but cannot listen the call')]
                    ],
                    fieldLabel: t('SPY type')
                }]
            }];
            me.title = me.title + (me.titleModule ? ' - ' + me.titleModule : '');
            me.bbar = [{
                width: 150,
                text: t('Send'),
                scope: me,
                handler: me.onSendSpy
            }];
        } else {
            Ext.ux.Alert.alert(me.titleError, t('Please select only a record'), 'notification');
        }
        me.callParent(arguments);
    },
    onSendSpy: function(btn) {
        var me = this,
            store = me.list.store;
        if (!me.down('form').isValid()) {
            Ext.ux.Alert.alert('Alert', t('Select SIP user'), 'notification');
            return;
        }
        //btn.disable();
        me.list.setLoading(true);
        Ext.Ajax.setTimeout(1000000);
        me.down('form').submit({
            url: 'index.php/callOnLine/spyCall',
            params: {
                id_sip: selected.get('id_sip'),
                type: selected.get('Type'),
                channel: me.channel
            },
            scope: me,
            success: function(form, action) {
                var obj = Ext.decode(action.response.responseText);
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