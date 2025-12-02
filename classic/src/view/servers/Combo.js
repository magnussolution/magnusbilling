/**
 * Class to define combo of "groupUser"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.servers.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.serverscombo',
    name: 'id_server',
    fieldLabel: t('Server'),
    displayField: 'name',
    forceSelection: true,
    editable: false,
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