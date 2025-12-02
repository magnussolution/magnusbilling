/**
 *
 */
Ext.define('Ext.util.SizeMonitor', {
    requires: [
        'Ext.util.sizemonitor.Scroll',
        'Ext.util.sizemonitor.OverflowChange'
    ],

    constructor: function(config) {
        var namespace = Ext.util.sizemonitor;

        if (Ext.browser.is.Firefox) {
            return new namespace.OverflowChange(config);
        } else {
            return new namespace.Scroll(config);
        }
    }
});
