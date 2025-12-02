/**
 * Classe que define o panel de "Call"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.backup.Module', {
    extend: 'Ext.ux.panel.Module',
    alias: 'widget.backupmodule',
    controller: 'backup',
    initComponent: function() {
        var me = this;
        //me.mbpkg();
        me.callParent(arguments);
    }
});