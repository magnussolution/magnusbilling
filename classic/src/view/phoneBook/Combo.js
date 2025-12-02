/**
 * Classe que define a combo de "PhoneBookCombo"
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
Ext.define('MBilling.view.phoneBook.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.phonebookcombo',
    name: 'id_phonebook',
    fieldLabel: t('Phonebook'),
    displayField: 'name',
    forceSelection: true,
    editable: true,
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.PhoneBook', {
            proxy: {
                type: 'uxproxy',
                module: 'phoneBook',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});