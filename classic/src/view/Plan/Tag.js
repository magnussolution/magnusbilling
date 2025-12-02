/**
 * Class to define tag of "phoneBook"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.plan.Tag', {
    extend: 'Ext.form.field.Tag',
    alias: 'widget.plantag',
    name: 'id_plan',
    fieldLabel: t('Plan'),
    displayField: 'name',
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.Plan', {
            proxy: {
                type: 'uxproxy',
                module: 'plan',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});