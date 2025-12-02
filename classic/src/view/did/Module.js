/**
 * Classe que define o panel de "Did"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 24/09/2012
 */
Ext.define('MBilling.view.did.Module', {
    extend: 'Ext.ux.panel.Module',
    alias: 'widget.didmodule',
    controller: 'did',
    initComponent: function() {
        var me = this;
        me.flexForm = App.user.isClient ? 1 : 3;
        me.callParent(arguments);
    }
});