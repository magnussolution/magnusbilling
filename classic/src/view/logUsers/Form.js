/**
 * Classe que define o form de "Call"
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
 * 19/09/2012
 */
Ext.define('MBilling.view.logUsers.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.logusersform',
    fieldsHideEdit: ['cid'],
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'usercombo',
            name: 'id_user',
            fieldLabel: t('Username'),
            allowBlank: true,
            readOnly: true
        }, {
            xtype: 'combobox',
            name: 'id_log_actions',
            fieldLabel: t('Action'),
            forceSelection: true,
            editable: false,
            value: '1',
            store: [
                [1, 'Login'],
                [2, 'Edit'],
                [3, 'Delete'],
                [4, 'New'],
                [5, 'Import'],
                [6, 'UpdateAll'],
                [7, 'Export'],
                [8, 'Logout']
            ],
            readOnly: true
        }, {
            name: 'ip',
            fieldLabel: t('IP'),
            readOnly: true
        }, {
            xtype: 'textareafield',
            name: 'description',
            fieldLabel: t('Description'),
            height: 400,
            anchor: '100%',
            allowBlank: true,
            readOnly: true
        }];
        me.callParent(arguments);
    }
});