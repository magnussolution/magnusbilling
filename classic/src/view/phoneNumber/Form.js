/**
 * Classe que define o form de "PhoneNumber"
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
 * 28/10/2012
 */
Ext.define('MBilling.view.phoneNumber.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.phonenumberform',
    fieldsHideUpdateLot: ['number'],
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'phonebookcombo',
            name: 'id_phonebook',
            fieldLabel: t('Phonebook')
        }, {
            name: 'number',
            fieldLabel: t('Number')
        }, {
            name: 'name',
            fieldLabel: t('Name'),
            allowBlank: true
        }, {
            name: 'doc',
            fieldLabel: t('DOC'),
            allowBlank: true
        }, {
            name: 'city',
            fieldLabel: t('City'),
            allowBlank: true
        }, {
            name: 'email',
            fieldLabel: t('Email'),
            allowBlank: true
        }, {
            xtype: 'statuscombo',
            name: 'status',
            fieldLabel: t('Status'),
            allowBlank: true
        }, {
            xtype: 'textareafield',
            name: 'info',
            fieldLabel: t('Description'),
            allowBlank: true,
            hidden: !App.user.isAdmin
        }];
        me.callParent(arguments);
    }
});