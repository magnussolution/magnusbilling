/**
 * @mixins Ext.device.browser.Abstract
 */
Ext.define('Ext.device.Browser', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.browser.Cordova',
        'Ext.device.browser.Simulator'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;

        if (browserEnv.WebView && browserEnv.Cordova) {
            return Ext.create('Ext.device.browser.Cordova');
        }

        return Ext.create('Ext.device.browser.Simulator');
    }
});
