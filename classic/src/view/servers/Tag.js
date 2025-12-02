/**
 * Class to define tag of "phoneBook"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.servers.Tag', {
    extend: 'Ext.form.field.Tag',
    alias: 'widget.serverstag',
    name: 'id_server',
    fieldLabel: t('Servers'),
    displayField: 'name',
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.Servers', {
            proxy: {
                type: 'uxproxy',
                module: 'servers',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});