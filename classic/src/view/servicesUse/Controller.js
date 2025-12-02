/**
 * Classe que define a lista de "servicesUse"
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
 * 01/10/2017
 */
Ext.define('MBilling.view.servicesUse.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.servicesuse',
    onSelectionChange: function(selModel, selections) {
        var me = this,
            btnDelete = me.lookupReference('cancelService'),
            btnPay = me.lookupReference('payService');
        btnDelete && btnDelete.setDisabled(!selections.length);
        btnPay && btnPay.setDisabled(!selections.length);
        me.callParent(arguments);
    },
    init: function() {
        var me = this;
        me.control({
            'serviceslookup': {
                select: me.setValorItem
            }
        });
        me.callParent(arguments);
    },
    onNew: function() {
        var me = this,
            form = me.formPanel.getForm();
        form.findField('method').setVisible(false);
        form.findField('price').setVisible(false);
        me.callParent(arguments);
    },
    onEdit: function() {
        var me = this;
        if (App.user.isClient) return;
        me.callParent(arguments);
    },
    setValorItem: function(comboProduto, record) {
        var me = this,
            form = me.formPanel.getForm(),
            fieldPrice = form.findField('price');
        if (me.formPanel.getForm().findField('id').getValue() === '') me.findService(record, fieldPrice);
    },
    findService: function(record, fieldPrice) {
        var me = this;
        if (record < 1) return;
        filterService = Ext.encode([{
            type: 'numeric',
            comparison: 'eq',
            value: record,
            field: 'id'
        }]);
        Ext.Ajax.request({
            url: 'index.php/services/read?filter=' + filterService,
            success: function(r) {
                r = Ext.decode(r.responseText);
                if (r.rows) {
                    fieldPrice.setValue(r.rows[0].price);
                    fieldPrice.setVisible(true);
                    /*
                    if (parseInt(r.rows[0].price) < parseInt(App.user.credit) ) {
                        me.formPanel.getForm().findField('method').setVisible(false);
                        me.formPanel.getForm().findField('method').setAllowBlank(true);   
                    }else{
                        me.formPanel.getForm().findField('method').setVisible(true);
                        me.formPanel.getForm().findField('method').setAllowBlank(false);
                    }
                    */
                }
            }
        });
    },
    /*onSave: function(){
        var me = this,
            form = me.formPanel.getForm()
            fieldAmount  = me.formPanel.getForm().findField('price').getValue(),
            fieldIdServices  = me.formPanel.getForm().findField('id_services').getValue(),
            fieldMethod  = me.formPanel.getForm().findField('method').getValue();
        
        

        if (App.user.isAdmin || fieldMethod === null)
            me.callParent(arguments);
        else{
            if(!form.isValid()) {
                Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
                return;
            }            

            Ext.Msg.confirm(me.titleConfirmation,'<font color=red>'+ t('ALERT: Do you really active this service?')+'</font>', function(btn) {
                if(btn === 'yes') {

                    if(fieldMethod === null)
                       me.callParent(arguments);
                    else{
                        me.formPanel.collapse(); 
                        me.formPanel.reset();
                        me.store.load();                         
                        url = 'index.php/servicesUse/buyService/?amount='+fieldAmount+'&id_method='+fieldMethod+'&id_service='+fieldIdServices;
                        window.open(url,"_blank");
                    }                    
                }
            })
        }
    },*/
    onCancelService: function(btn) {
        var me = this,
            selected = me.list.getSelectionModel().getSelection()[0];
        me.formPanel.collapse();
        me.list.setLoading(true);
        if (me.list.getSelectionModel().getSelection().length == 1) {
            if (selected.get('Status') == 0) {
                Ext.ux.Alert.alert(me.titleWarning, t('This service already is canceled'), 'notification');
                me.list.setLoading(false);
                return;
            } else if (selected.get('Status') == 2) {
                me.ondSendRequest(selected.get('id'));
            } else {
                Ext.Msg.confirm(me.titleConfirmation, '<font color=red>' + t('ALERT: Do you really want cancel this service to this user?') + '</font>', function(btn) {
                    if (btn === 'yes') {
                        Ext.Msg.confirm(me.titleConfirmation, '<font color=blue>' + t('ALERT: This action was to return the balance, referring to the days not used. Do you confirm?') + '</font>', function(btn) {
                            if (btn === 'yes') {
                                me.ondSendRequest(selected.get('id'));
                                Ext.ux.Alert.alert(t('Notification'), t('The system will reload in 3 seconds'), 'information', true);
                                setTimeout(function() {
                                    location.reload()
                                }, 3000);
                            }
                        })
                    }
                    me.list.setLoading(false);
                })
            }
        } else {
            Ext.ux.Alert.alert(me.titleError, t('Please select only a record'), 'notification');
            me.list.setLoading(false);
        }
    },
    onPayServiceLink: function(argument) {
        var me = this,
            selected = me.list.getSelectionModel().getSelection()[0],
            ids = [];
        me.formPanel.collapse();
        me.list.setLoading(true);
        if (selected) {
            Ext.each(me.list.getSelectionModel().getSelection(), function(rec) {
                ids.push(rec.get(me.idProperty));
            });
        }
        url = 'index.php/buyCredit/payServiceLink?id_service_use=' + Ext.encode(ids);
        window.open(url, "_blank");
        me.list.setLoading(false);
        me.store.load();
        Ext.Msg.confirm(me.titleConfirmation, '<font color=blue>' + t('The system will reload in 3 seconds') + '</font>', function(btn) {
            location.reload()
        });
    },
    ondSendRequest: function(id) {
        var me = this;
        Ext.Ajax.request({
            url: 'index.php/servicesUse/cancelService',
            params: {
                id: id
            },
            scope: me,
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response[me.nameSuccessRequest]) {
                    Ext.ux.Alert.alert(me.titleSuccess, response[me.nameMsgRequest], 'success');
                } else Ext.ux.Alert.alert(me.titleError, response[me.nameMsgRequest], 'error');
                me.formPanel.reset();
                me.list.setLoading(false);
                me.store.load();
            }
        });
    }
});