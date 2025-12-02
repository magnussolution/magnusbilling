/**
 * Classe que define a lista de "CallShopCdr"
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
 * 01/10/2013
 */
Ext.define('MBilling.view.methodPay.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.methodpay',
    init: function() {
        var me = this;
        me.control({
            'methodpaycombo': {
                select: me.onSelectMethod
            }
        });
        me.callParent(arguments);
    },
    onSelectMethod: function(combo, records) {
        showFields = records.getData().showFields.split(',');
        this.showFieldsRelated(showFields);
    },
    showFieldsRelated: function(showFields) {
        var me = this,
            fields = me.formPanel.getForm().getFields();
        fields.each(function(field) {
            field.setVisible(showFields.indexOf(field.name) !== -1);
        });
    },
    onEdit: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0];
        method = record ? record.get('payment_method') : 'Moip';
        showFields = me.formPanel.down('methodpaycombo').store.findRecord('payment_method', method).getData().showFields;
        showFields = showFields.split(',');
        me.showFieldsRelated(showFields);
        me.callParent(arguments);
    },
    onNew: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0];
        method = 'Moip';
        showFields = me.formPanel.down('methodpaycombo').store.findRecord('payment_method', method).getData().showFields;
        showFields = showFields.split(',');
        me.showFieldsRelated(showFields);
        me.callParent(arguments);
    }
});