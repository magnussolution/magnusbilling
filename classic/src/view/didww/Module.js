/**
 * Classe que define o panel de "didww"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.didww.Module', {
    extend: 'Ext.form.Panel',
    alias: 'widget.didwwmodule',
    resizable: false,
    autoShow: true,
    header: false,
    items: [{
        xtype: "component",
        autoEl: {
            width: '100%',
            height: '100%',
            tag: "iframe",
            src: 'index.php/didww/add'
        }
    }]
});