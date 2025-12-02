/**
 * Class to define combo of "groupUser"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.groupUser.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.groupusercombo',
    name: 'id_group',
    fieldLabel: t('Group'),
    displayField: 'name',
    valueField: 'id',
    forceSelection: true,
    editable: false,
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
Ext.define('MBilling.view.groupUser.AgentUSerCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.groupuseragentcombo',
    name: 'id_group_agent',
    fieldLabel: t('Group user'),
    displayField: 'name',
    forceSelection: true,
    editable: false,
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