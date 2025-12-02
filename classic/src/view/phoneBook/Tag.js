/**
 * Class to define tag of "phoneBook"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.phoneBook.Tag', {
    extend: 'Ext.form.field.Tag',
    alias: 'widget.phonebooktag',
    name: 'id_phonebook',
    fieldLabel: t('Phonebook'),
    displayField: 'name',
    valueField: 'id',
    filterPickList: true,
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