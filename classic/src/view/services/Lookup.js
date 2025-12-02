/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2014
 */
Ext.define('MBilling.view.services.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.serviceslookup',
    name: 'id_services',
    fieldLabel: t('Service'),
    displayField: 'idServicesname',
    displayFieldList: 'name',
    gridConfig: {
        xtype: 'serviceslist',
        fieldSearch: 'name',
        columns: [{
            header: t('Name'),
            dataIndex: 'name',
            flex: 2
        }, {
            header: t('Price'),
            dataIndex: 'price',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 2
        }]
    }
});