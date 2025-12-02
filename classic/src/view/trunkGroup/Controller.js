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
Ext.define('MBilling.view.trunkGroup.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.trunkgroup',
    init: function() {
        var me = this;
        me.control({
            'combobox[name=type]': {
                select: me.onSelectType
            }
        });
        me.callParent(arguments);
    },
    onSelectType: function(combo, records) {
        this.showFieldsRelated(records.getData().showFields);
    },
    showFieldsRelated: function(showFields) {
        var me = this,
            fieldType = me.formPanel.getForm().findField('type'),
            fieldWeight = me.formPanel.getForm().findField('weight');
        me.formPanel.getForm().findField('weight').setVisible(fieldType.getValue() == 4);
    },
    onEdit: function() {
        var me = this;
        me.formPanel.reset();
        me.callParent(arguments);
        fieldType = me.formPanel.getForm().findField('type')
        console.log(fieldType.getValue());
        me.formPanel.getForm().findField('weight').setVisible(fieldType.getValue() == 4);
    },
    onNew: function() {
        var me = this,
            fieldType = me.formPanel.getForm().findField('type');
        me.formPanel.getForm().findField('weight').setVisible(false);
        me.callParent(arguments);
    }
});