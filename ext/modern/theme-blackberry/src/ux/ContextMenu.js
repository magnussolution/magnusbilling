/**
 * User extension designed to be used on the BB10 platform.
 */
Ext.define('Ext.theme.blackberry.ContextMenu', {
    extend: 'Ext.Menu',

    config: {
        /**
         * @hide
         */
        ui: 'context',

        /**
         * @hide
         */
        layout: {
            type: 'vbox',
            pack: 'center'
        }
    }
});