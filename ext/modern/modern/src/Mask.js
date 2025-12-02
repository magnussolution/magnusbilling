/**
 * A simple class used to mask any {@link Ext.Container}.
 *
 * This should rarely be used directly, instead look at the {@link Ext.Container#masked} configuration.
 *
 * ## Example
 *
 *     @example miniphone
 *     // Create our container
 *     var container = Ext.create('Ext.Container', {
 *         html: 'My container!'
 *     });
 *
 *     // Add the container to the Viewport
 *     Ext.Viewport.add(container);
 *
 *     // Mask the container
 *     container.setMasked(true);
 */
Ext.define('Ext.Mask', {
    extend: 'Ext.Component',
    xtype: 'mask',
    requires: ['Ext.util.InputBlocker'],

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'mask',

        /**
         * @cfg {Boolean} transparent True to make this mask transparent.
         */
        transparent: false,

        /**
         * @cfg
         * @hide
         */
        top: 0,

        /**
         * @cfg
         * @hide
         */
        left: 0,

        /**
         * @cfg
         * @hide
         */
        right: 0,

        /**
         * @cfg
         * @hide
         */
        bottom: 0
    },

    /**
     * @event tap
     * A tap event fired when a user taps on this mask
     * @param {Ext.Mask} this The mask instance
     * @param {Ext.EventObject} e The event object
     */
    initialize: function() {
        var me = this;

        me.callParent();
        me.element.on('tap', 'onTap', me);
        me.on('hide', 'onHide', me);
    },

    onHide: function(){
        Ext.util.InputBlocker.unblockInputs();

        // Oh how I loves the Android
        if (Ext.browser.is.AndroidStock4 && Ext.os.version.getMinor() === 0) {
            var firstChild = this.element.getFirstChild();
            if (firstChild) {
                firstChild.redraw();
            }
        }
    },

    onTap: function(e) {
        this.fireEvent('tap', this, e);
    },

    updateTransparent: function(transparent) {
        this.toggleCls(this.getBaseCls() + '-transparent', transparent);
    }
});
