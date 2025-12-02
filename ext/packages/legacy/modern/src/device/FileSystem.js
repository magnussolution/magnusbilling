/**
 * Provides an API to navigate file system hierarchies.
 *
 * @mixins Ext.device.filesystem.Sencha
 */
Ext.define('Ext.device.FileSystem', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.filesystem.Cordova',
        'Ext.device.filesystem.Chrome',
        'Ext.device.filesystem.Simulator'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;
        if (browserEnv.WebView) {
            if (browserEnv.Cordova) {
                return Ext.create('Ext.device.filesystem.Cordova');
            }
        } else if (browserEnv.Chrome) {
            return Ext.create('Ext.device.filesystem.Chrome');
        }

        return Ext.create('Ext.device.filesystem.Simulator');
    }
});
