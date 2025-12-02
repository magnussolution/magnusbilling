/**
 * Class to define combo of "groupUser"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.user.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.usercombo',
    name: 'id_user',
    fieldLabel: t('Username'),
    displayField: 'username',
    forceSelection: true,
    editable: false,
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.User', {
            proxy: {
                type: 'uxproxy',
                module: 'user',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});