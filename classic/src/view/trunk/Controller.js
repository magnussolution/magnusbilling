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
Ext.define('MBilling.view.trunk.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.trunk',
    onEdit: function () {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0],
            registerField = me.formPanel.getForm().findField('register');
        if (record.get('register') == 1) {
            if (record.get('register') && record.get('providertech') == 'pjsip') {
                color = record.get('registered') == 1 ? 'green' : 'red';
                registerField.setFieldLabel(t('Register trunk') + ' <span style="color:' + color + ';  font-size:30px;" > &bull; </span>');
            } else {
                registerField.setFieldLabel(t('Register trunk'));
            }
            me.formPanel.getForm().findField('register_string')['show']();
        } else {
            registerField.setFieldLabel(t('Register trunk'))
            me.formPanel.getForm().findField('register_string')['hide']();
        }
        me.callParent(arguments);
        valueAllow = me.formPanel.idRecord ? record.get('allow').split(',') : ['g729', 'gsm', 'alaw', 'ulaw'];
        fieldAllow = me.formPanel.down('checkboxgroup');
        fieldAllow.setValue({
            allow: valueAllow
        });
    },
    init: function () {
        var me = this;
        me.control({
            'noyescombo[name=register]': {
                select: me.onSelectType
            }
        });
        me.callParent(arguments);
    },
    onSelectType: function (combo, records) {
        this.showFieldsRelated(records.getData().showFields);
    },
    showFieldsRelated: function (showFields) {
        var me = this,
            fieldRegisterString = me.formPanel.getForm().findField('register_string'),
            fieldUser = me.formPanel.getForm().findField('user'),
            fieldSecret = me.formPanel.getForm().findField('secret'),
            fieldHost = me.formPanel.getForm().findField('host'),
            fields = me.formPanel.getForm().getFields();
        fields.each(function (field) {
            if (field.name == 'register') {
                fieldRegisterString.setVisible(field.value == 1)
                fieldRegisterString.setValue(fieldUser.value + ':' + fieldSecret.value + '@' + fieldHost.value + '/' + fieldUser.value)
            }
        });
    }

});