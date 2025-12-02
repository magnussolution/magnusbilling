/**
 * A simple class used to mask any {@link Ext.Container}.
 *
 * This should rarely be used directly, instead look at the {@link Ext.Container#masked} configuration.
 *
 * ## Example
 *
 *     @example miniphone
 *     Ext.Viewport.add({
 *         masked: {
 *            xtype: 'loadmask'
 *         }
 *     });
 *
 * You can customize the loading {@link #message} and whether or not you want to show the {@link #indicator}:
 *
 *     @example miniphone
 *     Ext.Viewport.add({
 *         masked: {
 *            xtype: 'loadmask',
 *            message: 'A message..',
 *            indicator: false
 *         }
 *     });
 *
 */
Ext.define('Ext.LoadMask', {
    extend: 'Ext.Mask',
    xtype: 'loadmask',

    config: {
        /**
         * @cfg {String} message
         * The text to display in a centered loading message box.
         * @accessor
         */
        message: 'Loading...',

        /**
         * @cfg {String} cls
         * The CSS Class for this component
         * @accessor
         */
        cls: Ext.baseCSSPrefix + 'loading-mask',

        /**
         * @cfg {String} messageCls
         * The CSS class to apply to the loading message element.
         * @accessor
         */
        messageCls: Ext.baseCSSPrefix + 'mask-message',

        /**
         * @cfg {Boolean} indicator
         * True to show the loading indicator on this {@link Ext.LoadMask}.
         * @accessor
         */
        indicator: true
    },

    getTemplate: function() {
        var prefix = Ext.baseCSSPrefix;

        return [
            {
                //it needs an inner so it can be centered within the mask, and have a background
                reference: 'innerElement',
                cls: prefix + 'mask-inner',
                children: [
                    //the elements required for the CSS loading {@link #indicator}
                    {
                        reference: 'indicatorElement',
                        cls: prefix + 'loading-spinner-outer',
                        children: [
                            {
                                cls: prefix + 'loading-spinner',
                                children: [
                                    { tag: 'span', cls: prefix + 'loading-top' },
                                    { tag: 'span', cls: prefix + 'loading-right' },
                                    { tag: 'span', cls: prefix + 'loading-bottom' },
                                    { tag: 'span', cls: prefix + 'loading-left' }
                                ]
                            }
                        ]
                    },
                    //the element used to display the {@link #message}
                    {
                        reference: 'messageElement'
                    }
                ]
            }
        ];
    },

    /**
     * Updates the message element with the new value of the {@link #message} configuration
     * @private
     */
    updateMessage: function(newMessage) {
        var cls = Ext.baseCSSPrefix + 'has-message';

        if (newMessage) {
            this.addCls(cls);
        } else {
            this.removeCls(cls);
        }

        this.messageElement.setHtml(newMessage);
    },

    /**
     * Replaces the cls of the message element with the value of the {@link #messageCls} configuration.
     * @private
     */
    updateMessageCls: function(newMessageCls, oldMessageCls) {
        this.messageElement.replaceCls(oldMessageCls, newMessageCls);
    },

    /**
     * Shows or hides the loading indicator when the {@link #indicator} configuration is changed.
     * @private
     */
    updateIndicator: function(newIndicator) {
        this[newIndicator ? 'removeCls' : 'addCls'](Ext.baseCSSPrefix + 'indicator-hidden');
    }
});
