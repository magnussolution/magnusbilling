/**
 * User extension designed to be used on the BB10 platform.
 */
Ext.define('Ext.theme.blackberry.ApplicationMenu', {
    extend: 'Ext.Menu',

    config: {
        /**
         * @hide
         */
        ui: 'application',

        /**
         * @hide
         */
        layout: {
            type: 'hbox',
            pack: 'center'
        },

        defaults: {
            flex: 0,
            iconAlign: 'top',
            ui: 'tab'
        }
    }
});