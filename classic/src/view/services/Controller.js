/**
 * Classe que define a lista de "Services"
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
Ext.define('MBilling.view.services.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.services',
    init: function() {
        var me = this;
        me.control({
            'servicestypecombo': {
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
            form = me.formPanel.getForm(),
            fieldCalllimit = form.findField('calllimit'),
            fieldDiskSpace = form.findField('disk_space'),
            fieldSipaccountlimit = form.findField('sipaccountlimit'),
            fieldType = form.findField('type').getValue();
        fieldCalllimit.setVisible(fieldType == 'calllimit')
        fieldDiskSpace.setVisible(fieldType == 'disk_space')
        fieldSipaccountlimit.setVisible(fieldType == 'sipAccountLimit');
    },
    onEdit: function() {
        var me = this,
            form = me.formPanel.getForm(),
            record = me.list.getSelectionModel().getSelection()[0];
        if (App.user.isClient) return;
        me.lookupReference('generalTab').show();
        form.findField('calllimit').setVisible(record.data.type == 'calllimit');
        form.findField('disk_space').setVisible(record.data.type == 'disk_space');
        form.findField('sipaccountlimit').setVisible(record.data.type == 'sipAccountLimit');
        me.callParent(arguments);
    },
    onNew: function() {
        var me = this,
            form = me.formPanel.getForm();
        form.findField('calllimit').setVisible(false);
        form.findField('disk_space').setVisible(false);
        form.findField('sipaccountlimit').setVisible(false);
        form.findField('return_credit').setVisible(true);
        me.callParent(arguments);
    }
});