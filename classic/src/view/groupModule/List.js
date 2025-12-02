/**
 * Class to define list of "GroupModule"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.groupModule.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.groupmodulelist',
    store: 'GroupModule',
    initComponent: function() {
        var me = this;
        me.columns = [{
            xtype: 'templatecolumn',
            tpl: '{idGroupname}',
            text: t('Group'),
            dataIndex: 'id_group',
            comboFilter: 'groupusercombo'
        }, {
            xtype: 'templatecolumn',
            tpl: '{idModuletext}',
            text: t('Module'),
            dataIndex: 'id_module',
            comboFilter: 'modulecombo'
        }];
        me.callParent(arguments);
    }
});