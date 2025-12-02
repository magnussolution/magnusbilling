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
Ext.define('MBilling.view.did.Bulk', {
    extend: 'Ext.window.Window',
    alias: 'widget.didbulk',
    autoShow: true,
    modal: true,
    layout: 'fit',
    iconCls: 'icon-import-csv',
    title: t('Bulk destination'),
    width: 400,
    height: window.isThemeNeptune || window.isThemeCrisp ? 295 : window.isThemeTriton ? 390 : 270,
    labelWidthFields: 120,
    htmlTipInfo: '',
    fieldsImport: [],
    fil: [],
    initComponent: function() {
        var me = this,
            filters = me.list.filters.getFilterData();
        if (!filters || filters == 0) {
            Ext.ux.Alert.alert('Alert', t('Use filters'), 'information');
            me.items = [{}]
        } else {
            me.fil = filters;
            me.items = [{
                xtype: 'form',
                reference: 'didbilkPanel',
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
                    xtype: 'userlookup',
                    name: 'id_user',
                    fieldLabel: t('Username'),
                    allowBlank: false
                }, {
                    xtype: 'fieldset',
                    style: 'margin-top:25px; overflow: visible;',
                    title: t('DID destination'),
                    collapsible: true,
                    collapsed: false,
                    defaults: {
                        labelWidth: 90,
                        anchor: '100%',
                        labelAlign: me.labelAlignFields
                    },
                    items: [{
                        xtype: 'didtypecombo',
                        name: 'voip_call',
                        fieldLabel: t('Type'),
                        listeners: {
                            select: function(combo, records, eOpts) {
                                me.onSelectMethod(combo, records)
                            },
                            scope: this
                        }
                    }, {
                        xtype: 'textfield',
                        name: 'destination',
                        fieldLabel: t('Destination'),
                        value: '',
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'ivrlookup',
                        name: 'id_ivr',
                        fieldLabel: t('IVR'),
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'queuelookup',
                        name: 'id_queue',
                        fieldLabel: t('Queue'),
                        allowBlank: true,
                        hidden: true
                    }, {
                        xtype: 'siplookup',
                        name: 'id_sip',
                        fieldLabel: t('Sip user'),
                        allowBlank: true
                    }, {
                        xtype: 'textarea',
                        name: 'context',
                        fieldLabel: t('Context'),
                        allowBlank: true,
                        emptyText: t('Asterisk dial plan. Example: exten => _X.=>1,Dial(SIP/3333@39.5.5.5,30); )'),
                        height: 300,
                        anchor: '100%',
                        hidden: true
                    }]
                }]
            }];
        }
        me.title = me.title + (me.titleModule ? ' - ' + me.titleModule : '');
        me.bbar = [{
            width: 150,
            iconCls: 'icon-import-csv',
            text: t('Bulk DID Destination'),
            scope: me,
            handler: me.onBulk
        }];
        me.callParent(arguments);
    },
    onSelectMethod: function(combo, records) {
        this.showFieldsRelated(records.getData().showFields);
    },
    showFieldsRelated: function(showFields) {
        var me = this,
            getForm = me.down('form');
        fields = getForm.getForm().getFields();
        fields.each(function(field) {
            if (field.name == 'id_user') {
                field.setVisible(true);
            } else {
                field.setVisible(showFields.indexOf(field.name) !== -1);
            }
        });
    },
    onBulk: function(btn) {
        var me = this,
            store = me.list.getStore();
        if (!me.down('form').isValid()) {
            return;
        }
        me.down('form').setLoading(true);
        Ext.Ajax.setTimeout(1000000);
        me.down('form').submit({
            url: 'index.php/diddestination/bulkdestinatintion',
            scope: me,
            params: {
                filters: Ext.encode(me.fil)
            },
            success: function(form, action) {
                var obj = Ext.decode(action.response.responseText);
                if (obj.success) {
                    Ext.ux.Alert.alert(t('Success'), obj.msg, 'success');
                } else {
                    Ext.ux.Alert.alert(t('Error'), obj.errors, 'error');
                }
                btn.enable();
                me.down('form').setLoading(false);
                store.load();
                me.close();
            },
            failure: function(form, action) {
                var obj = Ext.decode(action.response.responseText),
                    errors = Helper.Util.convertErrorsJsonToString(obj.errors);
                me.down('form').setLoading(false);
                if (!Ext.isObject(obj.errors)) {
                    Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                } else {
                    form.markInvalid(obj.errors);
                    Ext.ux.Alert.alert(me.titleWarning, t(errors), 'error');
                }
            }
        });
    }
});