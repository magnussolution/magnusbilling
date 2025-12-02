/**
 * Allows you to use Google Analytics within your Cordova application.
 *
 * For setup information, please read the [plugin documentation](https://github.com/phonegap/phonegap-facebook-plugin).
 * 
 * @mixins Ext.device.analytics.Abstract
 */
Ext.define('Ext.device.Analytics', {
    alternateClassName:'Ext.ux.device.Analytics',
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.analytics.*'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;
        if (browserEnv.WebView && browserEnv.Cordova) {
            return Ext.create('Ext.device.analytics.Cordova');
        } else {
            return Ext.create('Ext.device.analytics.Abstract');
        }
    }
});
