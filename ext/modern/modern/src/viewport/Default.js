/**
 * @private
 * Base class for iOS and Android viewports.
 */
Ext.define('Ext.viewport.Default', new function() {
    var TOP = 1,
        RIGHT = 2,
        BOTTOM = 4,
        LEFT = 8,
        sideMap = {
            top: TOP,
            right: RIGHT,
            bottom: BOTTOM,
            left: LEFT
        },
        oppositeSide = {
            "1": BOTTOM,
            "2": LEFT,
            "4": TOP,
            "8": RIGHT
        },
        stripQuoteRe = /"/g;

    return {
        extend: 'Ext.Container',

        xtype: 'viewport',

        PORTRAIT: 'portrait',

        LANDSCAPE: 'landscape',

        requires: [
            'Ext.GlobalEvents',
            'Ext.LoadMask',
            'Ext.layout.Card',
            'Ext.util.InputBlocker'
        ],

        /**
         * @event ready
         * Fires when the Viewport is in the DOM and ready.
         * @param {Ext.Viewport} this
         */

        /**
         * @event maximize
         * Fires when the Viewport is maximized.
         * @param {Ext.Viewport} this
         */

        /**
         * @event orientationchange
         * Fires when the Viewport orientation has changed.
         * @param {Ext.Viewport} this
         * @param {String} newOrientation The new orientation.
         * @param {Number} width The width of the Viewport.
         * @param {Number} height The height of the Viewport.
         */

        config: {
            /**
             * @private
             */
            autoMaximize: false,

            /**
             * @private
             *
             * Auto blur the focused element when touching on a non-input. This is used to work around Android bugs
             * where the virtual keyboard is not hidden when tapping outside an input.
             */
            autoBlurInput: true,

            /**
             * @cfg {Boolean} preventZooming
             * `true` to attempt to stop zooming when you double tap on the screen on mobile devices,
             * typically HTC devices with HTC Sense UI.
             * @accessor
             */
            preventZooming: false,

            /**
             * @cfg
             * @private
             */
            autoRender: true,

            /**
             * @cfg {Object/String} layout Configuration for this Container's layout. Example:
             *
             *     Ext.create('Ext.Container', {
             *         layout: {
             *             type: 'hbox',
             *             align: 'middle'
             *         },
             *         items: [
             *             {
             *                 xtype: 'panel',
             *                 flex: 1,
             *                 style: 'background-color: red;'
             *             },
             *             {
             *                 xtype: 'panel',
             *                 flex: 2,
             *                 style: 'background-color: green'
             *             }
             *         ]
             *     });
             *
             * @accessor
             */
            layout: 'card',

            /**
             * @cfg
             * @private
             */
            width: '100%',

            /**
             * @cfg
             * @private
             */
            height: '100%',

            useBodyElement: true,

            /**
             * An object of all the menus on this viewport.
             * @private
             */
            menus: {},

            /**
             * @private
             */
            orientation: null
        },

        getElementConfig: function() {
            var cfg = this.callParent(arguments);

            // Used in legacy browser that do not support matchMedia. Hidden element is used for checking of orientation
            if (!Ext.feature.has.MatchMedia) {
                cfg.children.unshift({reference: 'orientationElement', className: 'x-orientation-inspector'});
            }
            return cfg;
        },

        /**
         * @property {Boolean} isReady
         * `true` if the DOM is ready.
         */
        isReady: false,

        isViewport: true,

        isMaximizing: false,

        id: 'ext-viewport',

        isInputRegex: /^(input|textarea|select|a)$/i,

        isInteractiveWebComponentRegEx: /^(audio|video)$/i,

        focusedElement: null,

        /**
         * @private
         */
        fullscreenItemCls: Ext.baseCSSPrefix + 'fullscreen',

        constructor: function(config) {
            var me = this,
                Component = Ext.Component;

            me.doPreventPanning = me.doPreventPanning.bind(me);
            me.doPreventZooming = me.doPreventZooming.bind(me);
            me.doBlurInput = me.doBlurInput.bind(me);

            me.maximizeOnEvents = [
              'ready',
              'orientationchange'
            ];

          // set default devicePixelRatio if it is not explicitly defined
            window.devicePixelRatio = window.devicePixelRatio || 1;

            me.callParent([config]);

            me.windowWidth = me.getWindowWidth();
            me.windowHeight = me.getWindowHeight();
            me.windowOuterHeight = me.getWindowOuterHeight();

            // The global scroller is our scroller.
            // We must provide a non-scrolling one if we are not configured to scroll,
            // otherwise the deferred ready listener in Scroller will create
            // one with scroll: true
            Ext.setViewportScroller(me.getScrollable() || {
                x: false,
                y: false,
                element: Ext.getBody()
            });

            // The body has to be overflow:hidden
            Ext.getBody().setStyle('overflow', 'hidden');

            me.stretchHeights = me.stretchHeights || {};

            if (Ext.feature.has.OrientationChange) {
                me.addWindowListener('orientationchange', me.onOrientationChange.bind(me));
            }

            // Viewport is initialized before event system, we need to wait until the application is ready before
            // we add the resize listener. Otherwise it will only fire if another resize listener is added later.
            Ext.onReady(function() {
                me.addWindowListener('resize', me.onResize.bind(me));
            });

            document.addEventListener('focus', me.onElementFocus.bind(me), true);
            document.addEventListener('blur', me.onElementBlur.bind(me), true);

            Ext.onDocumentReady(me.onDomReady, me);

            if (!Component.on) {
                Ext.util.Observable.observe(Component);
            }

            Component.on('fullscreen', 'onItemFullscreenChange', me);

            return me;
        },

        initialize: function() {
            var me = this;

            me.addMeta('apple-mobile-web-app-capable', 'yes');
            me.addMeta('apple-touch-fullscreen', 'yes');

            me.callParent();
        },

        initInheritedState: function (inheritedState, inheritedStateInner) {
            var me = this,
                root = Ext.rootInheritedState;

            if (inheritedState !== root) {
                // We need to go at this again but with the rootInheritedState object. Let
                // any derived class poke on the proper object!
                me.initInheritedState(me.inheritedState = root,
                    me.inheritedStateInner = Ext.Object.chain(root));
            } else {
                me.callParent([inheritedState, inheritedStateInner]);
            }
        },

        onAppLaunch: function() {
            var me = this;
            if (!me.isReady) {
                me.onDomReady();
            }
        },

        onDomReady: function() {
            var me = this;

            if (me.isReady) {
                return;
            }

            me.isReady = true;
            me.updateSize();
            me.onReady();
            me.fireEvent('ready', me);
            Ext.GlobalEvents.fireEvent('viewportready', me);
        },

        onReady: function() {
            if (this.getAutoRender()) {
                this.render();
            }
            if (Ext.browser.name === 'ChromeiOS') {
                this.setHeight('-webkit-calc(100% - ' + ((window.outerHeight - window.innerHeight) / 2) + 'px)');
            }
        },

        onElementFocus: function(e) {
            this.focusedElement = e.target;
        },

        onElementBlur: function() {
            this.focusedElement = null;
        },

        render: function() {
            if (!this.rendered) {
                var body = Ext.getBody(),
                    clsPrefix = Ext.baseCSSPrefix,
                    classList = [],
                    osEnv = Ext.os,
                    osName = osEnv.name.toLowerCase(),
                    browserName = Ext.browser.name.toLowerCase(),
                    osMajorVersion = osEnv.version.getMajor(),
                    theme;

                this.renderTo(body);

                classList.push(clsPrefix + osEnv.deviceType.toLowerCase());

                if (osEnv.is.iPad) {
                    classList.push(clsPrefix + 'ipad');
                }

                classList.push(clsPrefix + osName);
                classList.push(clsPrefix + browserName);

                if (Ext.browser.is.Safari && Ext.browser.version.isLessThan(9)) {
                    classList.push(clsPrefix + 'safari8m');
                }
                if (Ext.toolkit) {
                    classList.push(clsPrefix + Ext.toolkit);
                }

                if (osMajorVersion) {
                    classList.push(clsPrefix + osName + '-' + osMajorVersion);
                }

                if (osEnv.is.BlackBerry) {
                    classList.push(clsPrefix + 'bb');
                    if (Ext.browser.userAgent.match(/Kbd/gi)) {
                        classList.push(clsPrefix + 'bb-keyboard');
                    }
                }

                if (Ext.browser.is.WebKit) {
                    classList.push(clsPrefix + 'webkit');
                }

                if (Ext.browser.is.WebView) {
                    classList.push(clsPrefix + 'webview');
                }

                if (Ext.browser.is.Standalone) {
                    classList.push(clsPrefix + 'standalone');
                }

                if (Ext.browser.is.AndroidStock) {
                    classList.push(clsPrefix + 'android-stock');
                }

                if (Ext.browser.is.GoogleGlass) {
                    classList.push(clsPrefix + 'google-glass');
                }

                this.setOrientation(this.determineOrientation());
                classList.push(clsPrefix + this.getOrientation());

                if(Ext.os.is.iOS && Ext.browser.is.WebView && !Ext.browser.is.Standalone) {
                    classList.push(clsPrefix + 'ios-native');
                }

                body.addCls(classList);

                theme = Ext.theme;
                if (theme && theme.getDocCls) {
                    // hook for theme overrides to add css classes to the <html> element
                    Ext.fly(document.documentElement).addCls(theme.getDocCls());
                }
            }
        },

        updateAutoBlurInput: function(autoBlurInput) {
            var touchstart = Ext.feature.has.TouchEvents ? 'touchstart' : 'mousedown';
            this.toggleWindowListener(autoBlurInput, touchstart, this.doBlurInput, false);
        },

        applyAutoMaximize: function(autoMaximize) {
            return Ext.browser.is.WebView ? false : autoMaximize;
        },

        updateAutoMaximize: function(autoMaximize) {
            var me = this;

            if (autoMaximize) {
                me.on('ready', 'doAutoMaximizeOnReady', me, { single: true });
                me.on('orientationchange', 'doAutoMaximizeOnOrientationChange', me);
            } else {
                me.un('ready', 'doAutoMaximizeOnReady', me);
                me.un('orientationchange', 'doAutoMaximizeOnOrientationChange', me);
            }
        },

        updatePreventPanning: function(preventPanning) {
            this.toggleWindowListener(preventPanning, 'touchmove', this.doPreventPanning, false);
        },

        updatePreventZooming: function(preventZooming) {
            var touchstart = Ext.feature.has.TouchEvents ? 'touchstart' : 'mousedown';
            this.toggleWindowListener(preventZooming, touchstart, this.doPreventZooming, false);
        },

        doAutoMaximizeOnReady: function() {
            var me = this;

            me.isMaximizing = true;

            me.on('maximize', function() {
                me.isMaximizing = false;

                me.updateSize();

                me.fireEvent('ready', me);
            }, me, { single: true });

            me.maximize();
        },

        doAutoMaximizeOnOrientationChange: function() {
            var me = this;

            me.isMaximizing = true;

            me.on('maximize', function() {
                me.isMaximizing = false;

                me.updateSize();
            }, me, { single: true });

            me.maximize();
        },

        doBlurInput: function(e) {
            var target = e.target,
                focusedElement = this.focusedElement;
            //In IE9/10 browser window loses focus and becomes inactive if focused element is <body>. So we shouldn't call blur for <body>
            // In FF, the focusedElement can be the document which doesn't have a blur method
            if (focusedElement && focusedElement.blur && focusedElement.nodeName.toUpperCase() != 'BODY' && !this.isInputRegex.test(target.tagName)) {
                delete this.focusedElement;
                // Wrap in a flyweight since the blur can sometimes throw spurious errors
                Ext.fly(focusedElement).blur();
            }
        },

        doPreventPanning: function(e) {
            var target = e.target, 
                touch;

            // If we have an interaction on a WebComponent we need to check the actual shadow dom element selected
            // to determine if it is an input before preventing default behavior
            // Side effect to this is if the shadow input does not do anything with 'touchmove' the user could pan
            // the screen.
            if (this.isInteractiveWebComponentRegEx.test(target.tagName) && e.touches && e.touches.length > 0) {
                touch = e.touches[0];
                if (touch && touch.target && this.isInputRegex.test(touch.target.tagName)) {
                    return;
                }
            }

            if (target && target.nodeType === 1 && !this.isInputRegex.test(target.tagName)) {
                e.preventDefault();
            }
        },

        doPreventZooming: function(e) {
            // Don't prevent right mouse event
            if ('button' in e && e.button !== 0) {
                return;
            }

            var target = e.target, 
                inputRe = this.isInputRegex,
                touch;

            if (this.isInteractiveWebComponentRegEx.test(target.tagName) && e.touches && e.touches.length > 0) {
                touch = e.touches[0];
                if (touch && touch.target && inputRe.test(touch.target.tagName)) {
                    return;
                }
            }

            if (target && target.nodeType === 1 && !inputRe.test(target.tagName)) {
                e.preventDefault();
            }
        },

        addWindowListener: function(eventName, fn, capturing) {
            window.addEventListener(eventName, fn, Boolean(capturing));
        },

        removeWindowListener: function(eventName, fn, capturing) {
            window.removeEventListener(eventName, fn, Boolean(capturing));
        },

        supportsOrientation: function() {
            return Ext.feature.has.Orientation;
        },

        supportsMatchMedia: function() {
            return Ext.feature.has.MatchMedia;
        },

        onOrientationChange: function() {
            this.setOrientation(this.determineOrientation());
        },

        determineOrientation: function() {
            var me = this,
                nativeOrientation;

            // First attempt will be to use Native Orientation information
            if (me.supportsOrientation()) {
                nativeOrientation = me.getWindowOrientation();
                // 90 || -90 || 270 is landscape
                if (Math.abs(nativeOrientation) === 90 || nativeOrientation === 270) {
                    return me.LANDSCAPE;
                } else {
                    return me.PORTRAIT;
                }
                // Second attempt will be to use MatchMedia and a media query
            } else if (me.supportsMatchMedia()) {
                return window.matchMedia('(orientation : landscape)').matches ? me.LANDSCAPE : me.PORTRAIT;
                // Fall back on hidden element with media query attached to it (media query in Base Theme)
            } else if (me.orientationElement) {
                return me.orientationElement.getStyle('content').replace(stripQuoteRe, '');
            }

            return null;
        },

        updateOrientation: function(newValue, oldValue) {
            if (oldValue) {
                this.fireOrientationChangeEvent(newValue, oldValue);
            }
        },

        fireOrientationChangeEvent: function(newOrientation, oldOrientation) {
            var me = this,
                body = Ext.getBody(),
                clsPrefix = Ext.baseCSSPrefix;

            body.replaceCls(clsPrefix + oldOrientation, clsPrefix + newOrientation);

            me.updateSize();
            me.fireEvent('orientationchange', me, newOrientation, me.windowWidth, me.windowHeight);
        },

        onResize: function() {
            var me = this;

            me.updateSize();

            // On devices that do not support native orientation we use resize.
            // orientationchange events are only dispatched when there is an actual change in orientation value
            // so in cases on devices with orientation change events, the setter is called an extra time, but stopped after
            me.setOrientation(me.determineOrientation());
        },

        updateSize: function(width, height) {
            var me = this;

            me.windowWidth = width !== undefined ? width : me.getWindowWidth();
            me.windowHeight = height !== undefined ? height : me.getWindowHeight();

            return me;
        },

        waitUntil: function(condition, onSatisfied, onTimeout, delay, timeoutDuration) {
            if (!delay) {
                delay = 50;
            }

            if (!timeoutDuration) {
                timeoutDuration = 2000;
            }

            var scope = this,
                elapse = 0;

            Ext.defer(function repeat() {
                elapse += delay;

                if (condition.call(scope) === true) {
                    if (onSatisfied) {
                        onSatisfied.call(scope);
                    }
                }
                else {
                    if (elapse >= timeoutDuration) {
                        if (onTimeout) {
                            onTimeout.call(scope);
                        }
                    }
                    else {
                        Ext.defer(repeat, delay);
                    }
                }
            }, delay);
        },

        maximize: function() {
            this.fireMaximizeEvent();
        },

        fireMaximizeEvent: function() {
            this.updateSize();
            this.fireEvent('maximize', this);
        },

        updateHeight: function(height, oldHeight) {
            Ext.getBody().setHeight(height);
            this.callParent([height, oldHeight]);
        },

        updateWidth: function(width, oldWidth) {
            Ext.getBody().setWidth(width);
            this.callParent([width, oldWidth]);
        },

        scrollToTop: function() {
            window.scrollTo(0, -1);
        },

        /**
         * Retrieves the document width.
         * @return {Number} width in pixels.
         */
        getWindowWidth: function() {
            return window.innerWidth;
        },

        /**
         * Retrieves the document height.
         * @return {Number} height in pixels.
         */
        getWindowHeight: function() {
            return window.innerHeight;
        },

        getWindowOuterHeight: function() {
            return window.outerHeight;
        },

        getWindowOrientation: function() {
            return window.orientation;
        },

        getSize: function() {
            return {
                width: this.windowWidth,
                height: this.windowHeight
            };
        },

        onItemFullscreenChange: function(item) {
            item.addCls(this.fullscreenItemCls);
            this.add(item);
        },

        /**
         * Sets a menu for a given side of the Viewport.
         *
         * Adds functionality to show the menu by swiping from the side of the screen from the given side.
         *
         * If a menu is already set for a given side, it will be removed.
         *
         * Available sides are: `left`, `right`, `top`, and `bottom`.
         *
         * **Note:** The `cover` and `reveal` animation configs are mutually exclusive.
         * Include only one animation config or omit both to default to `cover`.
         *
         * @param {Ext.Menu/Object} menu The menu instance or config to assign to the viewport.
         * @param {Object} config The configuration for the menu.
         * @param {String} config.side The side to put the menu on.
         * @param {Boolean} config.cover True to cover the viewport content. Defaults to `true`.
         * @param {Boolean} config.reveal True to push the menu alongside the viewport
         * content. Defaults to `false`.
         *
         * @return {Ext.Menu} The menu.
         */
        setMenu: function(menu, config) {
            config = config || {};

            var me = this,
                side = config.side,
                sideValue = sideMap[side],
                menus;

            // Temporary workaround for body shifting issue
            if (Ext.os.is.iOS && !me.hasiOSOrientationFix) {
                me.hasiOSOrientationFix = true;
                me.on('orientationchange', function() {
                    window.scrollTo(0, 0);
                }, me);
            }

            //<debug>
            if (!menu) {
                Ext.Logger.error("You must specify a side to dock the menu.");
            }

            if (!side) {
                Ext.Logger.error("You must specify a side to dock the menu.");
            }

            if (!sideValue) {
                Ext.Logger.error("You must specify a valid side (left, right, top or botom) to dock the menu.");
            }
            //</debug>

            menus = me.getMenus();

            if (!menus) {
                menus = {};
            }

            if (!me.addedSwipeListener) {
                me.attachSwipeListeners();
                me.addedSwipeListener = true;
            }

            // If we have a menu cfg and no type was passed, we need to
            // setup the type. This template method exists to defer
            // for subclasses
            if (!menu.isComponent) {
                if (!menu.xclass && !menu.xtype) {
                    menu = me.getMenuCfg(menu, config);
                }
                menu = Ext.create(menu);
            }

            menus[side] = menu;
            menu.$reveal = Boolean(config.reveal);
            menu.$cover = config.cover !== false && !menu.$reveal;
            menu.setFloated(menu.$cover);
            menu.$side = side;
            menu.addCls(Ext.baseCSSPrefix + (menu.$cover ? 'menu-cover' : 'menu-reveal' ));

            me.fixMenuSize(menu, side);

            if (sideValue === LEFT) {
                menu.setLeft(0);
                menu.setRight(null);
                menu.setTop(0);
                menu.setBottom(0);
            } else if (sideValue === RIGHT) {
                menu.setLeft(null);
                menu.setRight(0);
                menu.setTop(0);
                menu.setBottom(0);
            } else if (sideValue === TOP) {
                menu.setLeft(0);
                menu.setRight(0);
                menu.setTop(0);
                menu.setBottom(null);
            } else if (sideValue === BOTTOM) {
                menu.setLeft(0);
                menu.setRight(0);
                menu.setTop(null);
                menu.setBottom(0);
            }

            me.setMenus(menus);

            return menu;
        },

        attachSwipeListeners: function() {
            var me = this;

            me.element.on({
                tap: me.onTap,
                swipestart: me.onSwipeStart,
                edgeswipestart: me.onEdgeSwipeStart,
                edgeswipe: me.onEdgeSwipe,
                edgeswipeend: me.onEdgeSwipeEnd,
                scope: me
            });
        },

        getMenuCfg: function(menu, config) {
            return Ext.apply({
                xtype: 'menu',
                floated: config.cover !== false && !config.$reveal
            }, menu);
        },

        /**
         * Removes a menu from a specified side.
         * @param {String} side The side to remove the menu from
         */
        removeMenu: function(side) {
            var menus = this.getMenus() || {},
                menu = menus[side];

            if (menu) {
                this.hideMenu(side);
            }
            delete menus[side];
            this.setMenus(menus);
        },

        /**
         * @private
         * Changes the sizing of the specified menu so that it displays correctly when shown.
         */
        fixMenuSize: function(menu, side) {
            var sideValue = sideMap[side];

            if (sideValue & (TOP | BOTTOM)) {
                menu.setWidth('100%');
            } else {
                menu.setHeight('100%');
            }
        },

        /**
         * Shows a menu specified by the menu's side.
         * @param {String} side The side which the menu is placed.
         */
        showMenu: function(side) {
            var me = this,
                sideValue = sideMap[side],
                menus = me.getMenus(),
                menu = menus[side],
                before, after,
                viewportBefore, viewportAfter, size;

            if (!menu || menu.isAnimating) {
                return;
            }

            me.hideOtherMenus(side);

            before = {
                translateX: 0,
                translateY: 0
            };

            after = {
                translateX: 0,
                translateY: 0
            };

            viewportBefore = {
                translateX: 0,
                translateY: 0
            };

            viewportAfter = {
                translateX: 0,
                translateY: 0
            };

            if (menu.$reveal) {
                Ext.getBody().insertFirst(menu.element);
            } else {
                Ext.Viewport.add(menu);
            }

            menu.show();
            menu.addCls('x-' + side);

            size = sideValue & (LEFT | RIGHT) ? menu.element.getWidth() : menu.element.getHeight();

            if (sideValue === LEFT) {
                before.translateX = -size;
                viewportAfter.translateX = size;
            } else if (sideValue === RIGHT) {
                before.translateX = size;
                viewportAfter.translateX = -size;
            } else if (sideValue === TOP) {
                before.translateY = -size;
                viewportAfter.translateY = size;
            } else if (sideValue === BOTTOM) {
                before.translateY = size;
                viewportAfter.translateY = -size;
            }

            if (menu.$reveal) {
                if (Ext.browser.getPreferredTranslationMethod() !== 'scrollposition') {
                    menu.translate(0, 0);
                }
            } else {
                menu.translate(before.translateX, before.translateY);
            }

            if (menu.$cover) {
                menu.getTranslatable().on('animationend', function() {
                    menu.isAnimating = false;
                }, me, {
                    single: true
                });

                menu.translate(after.translateX, after.translateY, {
                    preserveEndState: true,
                    duration: 200
                });

            } else {
                me.translate(viewportBefore.translateX, viewportBefore.translateY);


                me.getTranslatable().on('animationend', function() {
                    menu.isAnimating = false;
                }, me, {
                    single: true
                });

                me.translate(viewportAfter.translateX, viewportAfter.translateY, {
                    preserveEndState: true,
                    duration: 200
                });
            }

            // Make the menu as animating
            menu.isAnimating = true;
        },

        /**
         * Hides a menu specified by the menu's side.
         * @param {String} side The side which the menu is placed.
         */
        hideMenu: function(side, animate) {
            var me = this,
                sideValue = sideMap[side],
                menus = me.getMenus(),
                menu = menus[side],
                after, viewportAfter,
                size;

            animate = animate !== false;

            if (!menu || (menu.isHidden() || menu.isAnimating)) {
                return;
            }

            after = {
                translateX: 0,
                translateY: 0
            };

            viewportAfter = {
                translateX: 0,
                translateY: 0
            };

            size = sideValue & (LEFT | RIGHT) ? menu.element.getWidth() : menu.element.getHeight();

            if (sideValue === LEFT) {
                after.translateX = -size;
            } else if (sideValue === RIGHT) {
                after.translateX = size;
            } else if (sideValue === TOP) {
                after.translateY = -size;
            } else if (sideValue === BOTTOM) {
                after.translateY = size;
            }

            if (menu.$cover) {
                if (animate) {
                    menu.getTranslatable().on('animationend', function() {
                        menu.isAnimating = false;
                        menu.hide();
                    }, me, {
                        single: true
                    });

                    menu.translate(after.translateX, after.translateY, {
                        preserveEndState: true,
                        duration: 200
                    });
                } else {
                    menu.translate(after.translateX, after.translateY);
                    menu.hide();
                }
            } else {
                if (animate) {
                    me.getTranslatable().on('animationend', function() {
                        menu.isAnimating = false;
                        menu.hide();
                    }, me, {
                        single: true
                    });

                    me.translate(viewportAfter.translateX, viewportAfter.translateY, {
                        preserveEndState: true,
                        duration: 200
                    });
                } else {
                    me.translate(viewportAfter.translateX, viewportAfter.translateY);
                    menu.hide();
                }
            }
        },

        /**
         * Hides all visible menus.
         */
        hideAllMenus: function(animation) {
            var menus = this.getMenus(),
                side;

            for (side in menus) {
                this.hideMenu(side, animation);
            }
        },

        /**
         * Hides all menus except for the side specified
         * @param {String} side         Side(s) not to hide
         * @param {String} animation    Animation to hide with
         */
        hideOtherMenus: function(side, animation){
            var menus = this.getMenus(),
                menu;

            for (menu in menus) {
                if (side !== menu) {
                    this.hideMenu(menu, animation);
                }
            }
        },

        /**
         * Toggles the menu specified by side
         * @param {String} side The side which the menu is placed.
         */
        toggleMenu: function(side) {
            var menus = this.getMenus(), 
                menu;

            if (menus[side]) {
                menu = menus[side];
                if (menu.isHidden()) {
                    this.showMenu(side);
                } else {
                    this.hideMenu(side);
                }
            }
        },

        /**
         * @private
         */
        sideForDirection: function(direction) {
            return oppositeSide[sideMap[direction]];
        },

        /**
         * @private
         */
        sideForSwipeDirection: function(direction) {
            if (direction === 'up') {
                return  'top';
            } else if (direction === 'down') {
                return 'bottom';
            }
            return direction;
        },

        /**
         * @private
         */
        onTap: function(e) {
            // this.hideAllMenus();
        },

        /**
         * @private
         */
        onSwipeStart: function(e) {
            var side = this.sideForSwipeDirection(e.direction);
            this.hideMenu(side);
        },

        /**
         * @private
         */
        onEdgeSwipeStart: function(e) {
            var me = this,
                side = me.sideForDirection(e.direction),
                menus = me.getMenus(),
                menu = menus[side],
                menuSide, checkMenu, size,
                after, viewportAfter,
                transformStyleName, setTransform;

            if (!menu || !menu.isHidden()) {
                return;
            }

            for (menuSide in menus) {
                checkMenu = menus[menuSide];
                if (checkMenu.isHidden() !== false) {
                    return;
                }
            }

            me.$swiping = true;

            me.hideAllMenus(false);

            // show the menu first so we can calculate the size
            if (menu.$reveal) {
                Ext.getBody().insertFirst(menu.element);
            } else {
                Ext.Viewport.add(menu);
            }
            menu.show();

            size = side & (LEFT | RIGHT) ? menu.element.getWidth() : menu.element.getHeight();

            after = {
                translateX: 0,
                translateY: 0
            };

            viewportAfter = {
                translateX: 0,
                translateY: 0
            };

            if (side ===LEFT) {
                after.translateX = -size;
            } else if (side === RIGHT) {
                after.translateX = size;
            } else if (side === TOP) {
                after.translateY = -size;
            } else if (side === 'BOTTOM') {
                after.translateY = size;
            }

            transformStyleName = 'webkitTransform' in document.createElement('div').style ? 'webkitTransform' : 'transform';
            setTransform = menu.element.dom.style[transformStyleName];

            if (setTransform) {
                menu.element.dom.style[transformStyleName] = '';
            }

            if (menu.$reveal) {
                if (Ext.browser.getPreferredTranslationMethod() != 'scrollposition') {
                    menu.translate(0, 0);
                }
            } else {
                menu.translate(after.translateX, after.translateY);
            }

            if (!menu.$cover) {
                if (setTransform) {
                    me.innerElement.dom.style[transformStyleName] = '';
                }

                me.translate(viewportAfter.translateX, viewportAfter.translateY);
            }
        },

        /**
         * @private
         */
        onEdgeSwipe: function(e) {
            var me = this,
                side = me.sideForDirection(e.direction),
                menu = me.getMenus()[side],
                size, after, viewportAfter,
                movement, viewportMovement;

            if (!menu || !me.$swiping) {
                return;
            }

            size = side & (LEFT | RIGHT) ? menu.element.getWidth() : menu.element.getHeight();
            movement = Math.min(e.distance - size, 0);
            viewportMovement = Math.min(e.distance, size);

            after = {
                translateX: 0,
                translateY: 0
            };

            viewportAfter = {
                translateX: 0,
                translateY: 0
            };

            if (side === LEFT) {
                after.translateX = movement;
                viewportAfter.translateX = viewportMovement;
            } else if (side === RIGHT) {
                after.translateX = -movement;
                viewportAfter.translateX = -viewportMovement;
            } else if (side === TOP) {
                after.translateY = movement;
                viewportAfter.translateY = viewportMovement;
            } else if (side === BOTTOM) {
                after.translateY = -movement;
                viewportAfter.translateY = -viewportMovement;
            }

            if (menu.$cover) {
                menu.translate(after.translateX, after.translateY);
            } else {
                me.translate(viewportAfter.translateX, viewportAfter.translateY);
            }
        },

        /**
         * @private
         */
        onEdgeSwipeEnd: function(e) {
            var me = this,
                side = me.sideForDirection(e.direction),
                menu = me.getMenus()[side],
                shouldRevert = false,
                size, velocity, movement, viewportMovement,
                after, viewportAfter;

            if (!menu) {
                return;
            }

            size = side & (LEFT | RIGHT) ? menu.element.getWidth() : menu.element.getHeight();
            velocity = (e.flick) ? e.flick.velocity : 0;

            // check if continuing in the right direction
            if (side === RIGHT) {
                if (velocity.x > 0) {
                    shouldRevert = true;
                }
            } else if (side === LEFT) {
                if (velocity.x < 0) {
                    shouldRevert = true;
                }
            } else if (side === TOP) {
                if (velocity.y < 0) {
                    shouldRevert = true;
                }
            } else if (side === BOTTOM) {
                if (velocity.y > 0) {
                    shouldRevert = true;
                }
            }

            movement = shouldRevert ? size : 0;
            viewportMovement = shouldRevert ? 0 : -size;

            after = {
                translateX: 0,
                translateY: 0
            };

            viewportAfter = {
                translateX: 0,
                translateY: 0
            };

            if (side === LEFT) {
                after.translateX = -movement;
                viewportAfter.translateX = -viewportMovement;
            } else if (side === RIGHT) {
                after.translateX = movement;
                viewportAfter.translateX = viewportMovement;
            } else if (side === TOP) {
                after.translateY = -movement;
                viewportAfter.translateY = -viewportMovement;
            } else if (side === BOTTOM) {
                after.translateY = movement;
                viewportAfter.translateY = viewportMovement;
            }

            // Move the viewport if cover is not enabled
            if (menu.$cover) {
                menu.getTranslatable().on('animationend', function() {
                    if (shouldRevert) {
                        menu.hide();
                    }
                }, me, {
                    single: true
                });

                menu.translate(after.translateX, after.translateY, {
                    preserveEndState: true,
                    duration: 200
                });

            } else {
                me.getTranslatable().on('animationend', function() {
                    if (shouldRevert) {
                        menu.hide();
                    }
                }, me, {
                    single: true
                });

                me.translate(viewportAfter.translateX, viewportAfter.translateY, {
                    preserveEndState: true,
                    duration: 200
                });
            }

            me.$swiping = false;
        },

        doDestroy: function() {
            // If there are floated components, they might not be be being destroyed.
            // Move the floatRoot back into the document. It is "sticky".
            if (Ext.floatRoot) {
                document.body.appendChild(Ext.floatRoot.dom);
                delete this.floatWrap;
                Ext.floatRoot.getData().component = null;
            }
            this.callParent();
        },

        privates: {
            addMeta: function(name, content) {
                var meta = document.createElement('meta');

                meta.setAttribute('name', name);
                meta.setAttribute('content', content);
                Ext.getHead().append(meta);
            },

            doAddListener: function(eventName, fn, scope, options, order, caller, manager) {
                var me = this;
                if (eventName === 'ready' && me.isReady && !me.isMaximizing) {
                    fn.call(scope);
                    return me;
                }

                me.callParent([eventName, fn, scope, options, order, caller, manager]);
            },

            toggleWindowListener: function(on, eventName, fn, capturing) {
                if (on) {
                    this.addWindowListener(eventName, fn, capturing);
                } else {
                    this.removeWindowListener(eventName, fn, capturing);
                }
            }
        }
    };
});
