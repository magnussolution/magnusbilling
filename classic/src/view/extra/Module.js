/**
 * Classe que define o panel de "extra"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.extra.Module', {
    extend: 'Ext.form.Panel',
    alias: 'widget.extramodule',
    resizable: false,
    autoShow: true,
    header: false,
    items: [{
        xtype: "component",
        autoEl: {
            width: '100%',
            height: '100%',
            tag: "iframe",
            src: window.moduleExtra
        }
    }]
});