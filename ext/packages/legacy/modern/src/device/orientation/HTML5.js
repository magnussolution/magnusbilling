/**
 * Provides the HTML5 implementation for the orientation API.
 * @private
 */
Ext.define('Ext.device.orientation.HTML5', {
    extend: 'Ext.device.orientation.Abstract',

    constructor: function() {
        this.callParent(arguments);

        this.onDeviceOrientation = Ext.Function.bind(this.onDeviceOrientation, this);
        window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
    }
});
