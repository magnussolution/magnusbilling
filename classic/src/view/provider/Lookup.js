/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2014
 */
Ext.define('MBilling.view.provider.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.providerlookup',
    name: 'id_provider',
    fieldLabel: t('Provider'),
    displayField: 'idProviderprovider_name',
    displayFieldList: 'provider_name',
    gridConfig: {
        xtype: 'providerlist',
        fieldSearch: 'username',
        columns: [{
            header: t('Name'),
            dataIndex: 'provider_name'
        }, {
            header: t('Description'),
            dataIndex: 'description'
        }]
    }
});