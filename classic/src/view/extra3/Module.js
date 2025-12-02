/**
 * Classe que define o panel de "extra3"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.extra3.Module', {
    extend: 'Ext.form.Panel',
    alias: 'widget.extra3module',
    resizable: false,
    autoShow: true,
    header: false,
    items: [{
        xtype: "component",
        autoEl: {
            width: '100%',
            height: '100%',
            tag: "iframe",
            src: window.module3Extra
        }
    }]
});