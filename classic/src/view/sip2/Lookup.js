/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2014
 */
Ext.define('MBilling.view.sip2.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.sip2lookup',
    name: 'id_sip',
    fieldLabel: t('SIP'),
    displayField: 'id_sip_name',
    displayFieldList: 'name',
    gridConfig: {
        xtype: 'sip2list',
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