/**
 * Class to define combo of "module"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.module.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.modulecombo',
    name: 'id_module',
    fieldLabel: t('Module'),
    displayField: 'text',
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.Module', {
            proxy: {
                type: 'uxproxy',
                module: 'module',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});