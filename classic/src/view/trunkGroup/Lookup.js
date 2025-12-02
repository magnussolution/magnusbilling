/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2017
 */
Ext.define('MBilling.view.trunkGroup.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.trunkgrouplookup',
    name: 'id_trunk_group',
    fieldLabel: t('Trunk groups'),
    displayField: 'idTrunkGroupname',
    displayFieldList: 'name',
    gridConfig: {
        xtype: 'trunkgrouplist',
        fieldSearch: 'name',
        columns: [{
            header: t('Name'),
            dataIndex: 'name'
        }]
    }
});