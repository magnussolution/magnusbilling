/**
 * A simple class to display a button.
 *
 * There are various different styles of Button you can create by using the {@link #icon},
 * {@link #iconCls}, {@link #iconAlign}, {@link #ui}, and {@link #text}
 * configurations.
 *
 * ## Simple Button
 *
 * Here is a Button in it's simplest form:
 *
 *     @example miniphone
 *     var button = Ext.create('Ext.Button', {
 *         text: 'Button'
 *     });
 *     Ext.Viewport.add({ xtype: 'container', padding: 10, items: [button] });
 *
 * ## Icons
 *
 * You can also create a Button with just an icon using the {@link #iconCls} configuration:
 *
 *     @example miniphone
 *     var button = Ext.create('Ext.Button', {
 *         iconCls: 'refresh'
 *     });
 *     Ext.Viewport.add({ xtype: 'container', padding: 10, items: [button] });
 *
 * Sencha provides the "Font" and "PNG" icons packs from http://wwww.pictos.cc. 
 * Use icons with the {@link Global_CSS#icon icon} mixin in your Sass.
 *
 * ## Badges
 *
 * Buttons can also have a badge on them, by using the {@link #badgeText} configuration:
 *
 *     @example
 *     Ext.create('Ext.Container', {
 *         fullscreen: true,
 *         padding: 10,
 *         items: {
 *             xtype: 'button',
 *             text: 'My Button',
 *             badgeText: '2'
 *         }
 *     });
 *
 * ## UI
 *
 * Buttons also come with a range of different default UIs. Here are the included UIs
 * available (if {@link #$include-button-uis $include-button-uis} is set to `true`):
 *
 * - **normal** - a basic gray button
 * - **back** - a back button
 * - **forward** - a forward button
 * - **round** - a round button
 * - **action** - shaded using the {@link Global_CSS#$active-color $active-color} (dark blue by default)
 * - **decline** - shaded using the {@link Global_CSS#$alert-color $alert-color} (red by default)
 * - **confirm** - shaded using the {@link Global_CSS#$confirm-color $confirm-color} (green by default)
 *
 * You can also append `-round` to each of the last three UI's to give it a round shape:
 *
 * - **action-round**
 * - **decline-round**
 * - **confirm-round**
 *
 * And setting them is very simple:
 *
 *     var uiButton = Ext.create('Ext.Button', {
 *         text: 'My Button',
 *         ui: 'action'
 *     });
 *
 * And how they look:
 *
 *     @example miniphone preview
 *     Ext.create('Ext.Container', {
 *         fullscreen: true,
 *         padding: 4,
 *         defaults: {
 *             xtype: 'button',
 *             margin: 5
 *         },
 *         layout: {
 *             type: 'vbox',
 *             align: 'center'
 *         },
 *         items: [
 *             { ui: 'normal', text: 'normal' },
 *             { ui: 'round', text: 'round' },
 *             { ui: 'action', text: 'action' },
 *             { ui: 'decline', text: 'decline' },
 *             { ui: 'confirm', text: 'confirm' }
 *         ]
 *     });
 *
 * Note that the default {@link #ui} is **normal**.
 *
 * You can also use the {@link #sencha-button-ui sencha-button-ui} CSS Mixin to create your own UIs.
 *
 * ## Example
 *
 * This example shows a bunch of icons on the screen in two toolbars. When you click on the center
 * button, it switches the {@link #iconCls} on every button on the page.
 *
 *     @example preview
 *     Ext.createWidget('container', {
 *         fullscreen: true,
 *         layout: {
 *             type: 'vbox',
 *             pack:'center',
 *             align: 'center'
 *         },
 *         items: [
 *             {
 *                 xtype: 'button',
 *                 text: 'Change iconCls',
 *                 handler: function() {
 *                     // classes for all the icons to loop through.
 *                     var availableIconCls = [
 *                         'action', 'add', 'arrow_down', 'arrow_left',
 *                         'arrow_right', 'arrow_up', 'compose', 'delete',
 *                         'organize', 'refresh', 'reply', 'search',
 *                         'settings', 'star', 'trash', 'maps', 'locate',
 *                         'home'
 *                     ];
 *                     // get the text of this button,
 *                     // so we know which button we don't want to change
 *                     var text = this.getText();
 *
 *                     // use ComponentQuery to find all buttons on the page
 *                     // and loop through all of them
 *                     Ext.Array.forEach(Ext.ComponentQuery.query('button'), function(button) {
 *                         // if the button is the change iconCls button, continue
 *                         if (button.getText() === text) {
 *                             return;
 *                         }
 *
 *                         // get the index of the new available iconCls
 *                         var index = availableIconCls.indexOf(button.getIconCls()) + 1;
 *
 *                         // update the iconCls of the button with the next iconCls, if one exists.
 *                         // if not, use the first one
 *                         button.setIconCls(availableIconCls[(index === availableIconCls.length) ? 0 : index]);
 *                     });
 *                 }
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 docked: 'top',
 *                 items: [
 *                     { xtype: 'spacer' },
 *                     { iconCls: 'action' },
 *                     { iconCls: 'add' },
 *                     { iconCls: 'arrow_down' },
 *                     { iconCls: 'arrow_left' },
 *                     { iconCls: 'arrow_up' },
 *                     { iconCls: 'compose' },
 *                     { iconCls: 'delete' },
 *                     { iconCls: 'organize' },
 *                     { iconCls: 'refresh' },
 *                     { xtype: 'spacer' }
 *                 ]
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 docked: 'bottom',
 *                 ui: 'light',
 *                 items: [
 *                     { xtype: 'spacer' },
 *                     { iconCls: 'reply' },
 *                     { iconCls: 'search' },
 *                     { iconCls: 'settings' },
 *                     { iconCls: 'star' },
 *                     { iconCls: 'trash' },
 *                     { iconCls: 'maps' },
 *                     { iconCls: 'locate' },
 *                     { iconCls: 'home' },
 *                     { xtype: 'spacer' }
 *                 ]
 *             }
 *         ]
 *     });
 *
 */
Ext.define('Ext.Button', {
    extend: 'Ext.Component',

    xtype: 'button',

    isButton: true,

    /**
     * @event tap
     * @preventable
     * Fires whenever a button is tapped.
     * @param {Ext.Button} this The item added to the Container.
     * @param {Ext.EventObject} e The event object.
     */

    /**
     * @event release
     * @preventable
     * Fires whenever the button is released.
     * @param {Ext.Button} this The item added to the Container.
     * @param {Ext.EventObject} e The event object.
     */

    cachedConfig: {
        /**
         * @cfg {String} pressingCls
         * The CSS class to add to the Button when it is {@link #pressed}.
         * @accessor
         */
        pressedCls: Ext.baseCSSPrefix + 'button-pressed',

        /**
         * @cfg {String} pressingCls
         * The CSS class to add to the Button when it is being pressed by the user.
         * @accessor
         */
        pressingCls: Ext.baseCSSPrefix + 'button-pressing',

        /**
         * @cfg {String} badgeCls
         * The CSS class to add to the Button's badge, if it has one.  Badges appear as small numbers, letters, or icons that sit on top of your button.  For instance, a small red number indicating how many updates are available.
         * @accessor
         */
        badgeCls: Ext.baseCSSPrefix + 'badge',

        /**
         * @cfg {String} hasBadgeCls
         * The CSS class to add to the Button if it has a badge (note that this goes on the
         * Button element itself, not on the badge element).
         * @private
         * @accessor
         */
        hasBadgeCls: Ext.baseCSSPrefix + 'hasbadge',

        /**
         * @cfg {String} hasLabelCls
         * The CSS class to add to the Button if it has text inside its label
         * @private
         * @accessor
         */
        hasLabelCls: Ext.baseCSSPrefix + 'haslabel',

        /**
         * @cfg {String} labelCls
         * The CSS class to add to the field's label element.
         * @accessor
         */
        labelCls: Ext.baseCSSPrefix + 'button-label',

        /**
         * @cfg {String} iconCls
         * One or more space separated CSS classes to be applied to the icon element.  
         * The CSS rule(s) applied should specify a background image to be used as the 
         * icon.
         *
         * An example of specifying a custom icon class would be something like:
         *
         *     // specify the property in the config for the class:
         *     iconCls: 'my-home-icon'
         *
         *     // css rule specifying the background image to be used as the icon image:
         *     .my-home-icon {
         *         background-image: url(../images/my-home-icon.gif) !important;
         *     }
         * 
         * In addition to specifying your own classes, you can use the font icons 
         * provided in the SDK using the following syntax:
         * 
         *     // using Font Awesome
         *     iconCls: 'x-fa fa-home'
         * 
         *     // using Pictos
         *     iconCls: 'pictos pictos-home'
         * 
         * Depending on the theme you're using, you may need include the font icon 
         * packages in your application in order to use the icons included in the 
         * SDK.  For more information see:
         * 
         *  - [Font Awesome icons](http://fortawesome.github.io/Font-Awesome/cheatsheet/)
         *  - [Pictos icons](http://docs.sencha.com/extjs/6.0/core_concepts/font_ext.html)
         *  - [Theming Guide](http://docs.sencha.com/extjs/6.0/core_concepts/theming.html)
         * @accessor
         */
        iconCls: null,

        /**
         * @cfg {"left"/"right"/"center"} [textAlign="center"]
         * @since 6.0.1
         */
        textAlign: null
    },

    config: {
        /**
         * @cfg {Boolean} allowDepress
         * `true` to allow user interaction to set {@link #pressed} to `false` when
         * the button is in the {@link #pressed} state. Only valid when {@link #pressed}
         * is configured.
         *
         * @since 6.0.2
         */
        allowDepress: true,

        /**
         * @cfg {String} badgeText
         * Optional badge text.  Badges appear as small numbers, letters, or icons that sit on top of your button.  For instance, a small red number indicating how many updates are available.
         * @accessor
         */
        badgeText: null,

        /**
         * @cfg {String} text
         * The Button text.
         * @accessor
         */
        text: null,

        /**
         * @cfg {String} icon
         * Url to the icon image to use if you want an icon to appear on your button.
         * @accessor
         */
        icon: false,

        /**
         * @cfg {String} iconAlign
         * The position within the Button to render the icon Options are: `top`, `right`, `bottom`, `left` and `center` (when you have
         * no {@link #text} set).
         * @accessor
         */
        iconAlign: 'left',

        /**
         * @cfg {Number/Boolean} pressedDelay
         * The amount of delay between the `tapstart` and the moment we add the `pressingCls` (in milliseconds).
         * Settings this to `true` defaults to 100ms.
         */
        pressedDelay: 0,

        /**
         * @cfg {Function} handler
         * The handler function to run when the Button is tapped on.
         * @accessor
         */
        handler: null,

        /**
         * @cfg {Object} scope
         * The scope to fire the configured {@link #handler} in.
         * @accessor
         */
        scope: null,

        /**
         * @cfg {String} autoEvent
         * Optional event name that will be fired instead of `tap` when the Button is tapped on.
         * @accessor
         */
        autoEvent: null,

        /**
         * @cfg {String} ui
         * The ui style to render this button with. The valid default options are:
         *
         * - `null` - a basic gray button (default).
         * - `'back'` - a back button.
         * - `'forward'` - a forward button.
         * - `'round'` - a round button.
         * - `'plain'`
         * - `'action'` - shaded using the {@link Global_CSS#$active-color $active-color} (dark blue by default).
         * - `'decline'` - shaded using the {@link Global_CSS#$alert-color $alert-color} (red by default).
         * - `'confirm'` - shaded using the {@link Global_CSS#$confirm-color $confirm-color} (green by default).
         *
         * You can also append `-round` to each of the last three UI's to give it a round shape:
         *
         * - **action-round**
         * - **decline-round**
         * - **confirm-round**
         *
         * @accessor
         */
        ui: null,

        /**
         * @cfg {String} html The HTML to put in this button.
         *
         * If you want to just add text, please use the {@link #text} configuration.
         */

        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'button',

        /**
         * @cfg {Boolean} enableToggle
         * Allows this button to have the pressed state toggled via user
         * interaction.
         *
         * @since 6.0.2
         */
        enableToggle: false,

        /**
         * @cfg {String/Number} value
         * The value of this button.  Only applicable when used as an item of a {@link Ext.SegmentedButton Segmented Button}.
         */
        value: null
    },

    eventedConfig: {
        /**
         * @cfg {Boolean} pressed
         * Sets the pressed state of the button.
         *
         * @since 6.0.2
         */
        pressed: false
    },

    defaultBindProperty: 'text',

    template: [
        {
            tag: 'span',
            reference: 'badgeElement',
            hidden: true
        },
        {
            tag: 'span',
            classList: [
                Ext.baseCSSPrefix + 'button-icon',
                Ext.baseCSSPrefix + 'font-icon'
            ],
            reference: 'iconElement'
        },
        {
            tag: 'span',
            reference: 'textElement',
            hidden: true
        }
    ],

    initialize: function() {
        this.callParent();

        this.element.on({
            scope      : this,
            tap        : 'onTap',
            touchstart : 'onPress',
            touchend   : 'onRelease'
        });
    },

    /**
     * `true` if this button is currently in a pressed state. See {@link #pressed}.
     * @return {Boolean} The pressed state.
     *
     * @since 6.0.2
     */
    isPressed: function() {
        return Boolean(this.getPressed());
    },

    /**
     * Toggles the {@link #pressed} state.
     *
     * @since 6.0.2
     */
    toggle: function() {
        this.setPressed(!this.isPressed());
    },

    /**
     * @private
     */
    updateBadgeText: function(badgeText) {
        var element = this.element,
            badgeElement = this.badgeElement;

        if (badgeText) {
            badgeElement.show();
            badgeElement.setText(badgeText);
        }
        else {
            badgeElement.hide();
        }

        element[(badgeText) ? 'addCls' : 'removeCls'](this.getHasBadgeCls());
    },

    /**
     * @private
     */
    updateText: function(text) {
        var textElement = this.textElement;
        
        if (textElement) {
            if (text) {
                textElement.show();
                textElement.setHtml(text);
            } else {
                textElement.hide();
            }

            this.toggleCls(this.getHasLabelCls(), !!text);
            this.refreshIconAlign();
        }
    },

    /**
     * @private
     */
    updateHtml: function(html) {
        var textElement = this.textElement;

        if (html) {
            textElement.show();
            textElement.setHtml(html);
        }
        else {
            textElement.hide();
        }
    },

    /**
     * @private
     */
    updateBadgeCls: function(badgeCls, oldBadgeCls) {
        this.badgeElement.replaceCls(oldBadgeCls, badgeCls);
    },

    /**
     * @private
     */
    updateHasBadgeCls: function(hasBadgeCls, oldHasBadgeCls) {
        var element = this.element;

        if (element.hasCls(oldHasBadgeCls)) {
            element.replaceCls(oldHasBadgeCls, hasBadgeCls);
        }
    },

    /**
     * @private
     */
    updateLabelCls: function(labelCls, oldLabelCls) {
        this.textElement.replaceCls(oldLabelCls, labelCls);
    },

    applyPressed: function(pressed) {
        return Boolean(pressed);
    },

    updatePressed: function(pressed) {
        this.element.toggleCls(this.getPressedCls(), pressed);
    },

    /**
     * @private
     */
    updatePressingCls: function(pressingCls, oldPressingCls) {
        var element = this.element;

        if (element.hasCls(oldPressingCls)) {
            element.replaceCls(oldPressingCls, pressingCls);
        }
    },

    updatePressedCls: function(pressedCls, oldPressedCls) {
        var element = this.element;

        if (element.hasCls(oldPressedCls)) {
            element.replaceCls(oldPressedCls, pressedCls);
        }
    },

    /**
     * @private
     */
    updateIcon: function(icon) {
        var me = this,
            element = me.iconElement;

        if (icon) {
            me.showIconElement();
            element.setStyle('background-image', 'url(' + icon + ')');
            me.refreshIconAlign();
        } else {
            element.setStyle('background-image', '');
            if (!me.getIconCls()) {
                me.hideIconElement();
            }
        }
    },

    /**
     * @private
     */
    updateIconCls: function(iconCls, oldIconCls) {
        var me = this,
            element = me.iconElement;

        if (iconCls) {
            me.showIconElement();
            element.replaceCls(oldIconCls, iconCls);
            me.refreshIconAlign();
        } else {
            element.removeCls(oldIconCls);
            if (!me.getIcon()) {
                me.hideIconElement();
            }
        }
    },

    /**
     * @private
     */
    updateIconAlign: function(alignment, oldAlignment) {
        var element = this.element,
            baseCls = Ext.baseCSSPrefix + 'iconalign-';

        if (!this.getText()) {
            alignment = 'center';
        }

        element.removeCls(baseCls + 'center');
        element.removeCls(baseCls + oldAlignment);
        if (this.getIcon() || this.getIconCls()) {
            element.addCls(baseCls + alignment);
        }
    },

    _textAlignCls: {
        left: Ext.baseCSSPrefix + 'text-align-left',
        right: Ext.baseCSSPrefix + 'text-align-right',
        center: ''
    },

    updateTextAlign: function (textAlign, oldValue) {
        var textAlignClasses = this._textAlignCls,
            add = textAlignClasses[textAlign || 'center'],
            remove = textAlignClasses[oldValue || 'center'];

        this.replaceCls(remove, add);
    },

    refreshIconAlign: function() {
        this.updateIconAlign(this.getIconAlign());
    },

    applyAutoEvent: function(autoEvent) {
        var me = this;

        if (typeof autoEvent == 'string') {
            autoEvent = {
                name : autoEvent,
                scope: me.scope || me
            };
        }

        return autoEvent;
    },

    /**
     * @private
     */
    updateAutoEvent: function(autoEvent) {
        var name  = autoEvent.name,
            scope = autoEvent.scope;

        this.setHandler(function() {
            scope.fireEvent(name, scope, this);
        });

        this.setScope(scope);
    },

    applyPressedDelay: function(delay) {
        if (Ext.isNumber(delay)) {
            return delay;
        }
        return (delay) ? 100 : 0;
    },

    /**
     * @private
     */
    onPress: function() {
        var me = this,
            element = me.element,
            pressedDelay = me.getPressedDelay(),
            pressingCls = me.getPressingCls();

        if (!me.getDisabled()) {
            if (pressedDelay > 0) {
                me.pressedTimeout = Ext.defer(function() {
                    delete me.pressedTimeout;
                    if (element) {
                        element.addCls(pressingCls);
                    }
                }, pressedDelay);
            } else {
                element.addCls(pressingCls);
            }
        }
    },

    /**
     * @private
     */
    onRelease: function(e) {
        this.fireAction('release', [this, e], 'doRelease');
    },

    /**
     * @private
     */
    doRelease: function(me, e) {
        if (!me.getDisabled()) {
            if (me.hasOwnProperty('pressedTimeout')) {
                clearTimeout(me.pressedTimeout);
                delete me.pressedTimeout;
            } else {
                me.element.removeCls(me.getPressingCls());
            }
        }
    },

    /**
     * @private
     */
    onTap: function(e) {
        if (this.getDisabled()) {
            return false;
        }

        this.fireAction('tap', [this, e], 'doTap');
    },

    /**
     * @private
     */
    doTap: function(me, e) {
        var handler = me.getHandler();

        //this is done so if you hide the button in the handler, the tap event will not fire on the new element
        //where the button was.
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (me.getEnableToggle() && (me.getAllowDepress() || !me.isPressed())) {
            me.toggle();
        }

        if (handler) {
            Ext.callback(handler, me.getScope(), [me, e], 0, me);
        }
    },

    doDestroy: function() {
        if (this.hasOwnProperty('pressedTimeout')) {
            clearTimeout(this.pressedTimeout);
        }
        this.callParent();
    },

    privates: {
        /**
         * Used by `icon` and `iconCls` configurations to hide the icon element.
         * @private
         */
        hideIconElement: function() {
            var el = this.iconElement;
            el.removeCls(Ext.baseCSSPrefix + 'shown');
            el.addCls(Ext.baseCSSPrefix + 'hidden');
            this.element.addCls(Ext.baseCSSPrefix + 'button-no-icon');
        },

        /**
         * Used by `icon` and `iconCls` configurations to show the icon element.
         * @private
         */
        showIconElement: function() {
            var el = this.iconElement;
            el.addCls(Ext.baseCSSPrefix + 'shown');
            el.removeCls(Ext.baseCSSPrefix + 'hidden');
            this.element.removeCls(Ext.baseCSSPrefix + 'button-no-icon');
        }
    }
});
