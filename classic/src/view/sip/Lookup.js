/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2014
 */
Ext.define('MBilling.view.sip.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.siplookup',
    name: 'id_sip',
    fieldLabel: t('SIP'),
    displayField: 'idSipname',
    displayFieldList: 'name',
    gridConfig: {
        xtype: 'siplist',
        fieldSearch: 'name',
        columns: [{
            header: t('Username'),
            dataIndex: 'idUserusername',
            flex: 2
        }, {
            header: t('Name'),
            dataIndex: 'name',
            flex: 2
        }]
    }
});