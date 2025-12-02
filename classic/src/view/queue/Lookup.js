/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2014
 */
Ext.define('MBilling.view.queue.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.queuelookup',
    name: 'id_queue',
    fieldLabel: t('Queue'),
    displayField: 'idQueuename',
    displayFieldList: 'name',
    gridConfig: {
        xtype: 'queuelist',
        fieldSearch: 'name',
        columns: [{
            header: t('Name'),
            dataIndex: 'name',
            flex: 2
        }]
    }
});