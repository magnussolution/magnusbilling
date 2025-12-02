/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2014
 */
Ext.define('MBilling.view.plan.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.planlookup',
    name: 'id_plan',
    fieldLabel: t('Plan'),
    displayField: 'idPlanname',
    displayFieldList: 'name',
    gridConfig: {
        xtype: 'planlist',
        fieldSearch: 'name',
        columns: [{
            header: t('Name'),
            dataIndex: 'name',
            flex: 2
        }]
    }
});