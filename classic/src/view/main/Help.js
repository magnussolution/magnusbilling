/**
 * Class to define help module
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 10/07/2014
 */
Ext.define('MBilling.view.main.Help', {
    extend: 'Ext.container.Container',
    alias: 'widget.help',
    controller: 'main',
    layout: 'border',
    items: [{
        xtype: 'treepanel',
        region: 'west',
        store: 'Help',
        rootVisible: false,
        border: true,
        width: 220,
        listeners: {
            itemclick: 'getManual'
        }
    }, {
        region: 'center',
        reference: 'manualPanel',
        autoScroll: true,
        bodyPadding: 5,
        loader: {
            url: 'resources/help/' + window.lang + '/home.html',
            autoLoad: true
        }
    }]
});