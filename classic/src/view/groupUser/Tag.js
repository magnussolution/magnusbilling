/**
 * Class to define tag of "groupUser"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.groupUser.Tag', {
    extend: 'Ext.form.field.Tag',
    alias: 'widget.groupusertag',
    name: 'id_group',
    fieldLabel: t('Group user'),
    displayField: 'name',
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.GroupUser', {
            proxy: {
                type: 'uxproxy',
                module: 'groupUser',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});