/**
 * Ext.scroll.Scroller allows any element to have scrollable content, both on desktop and
 * touch-screen devices, and defines a set of useful methods for manipulating the scroll
 * position and controlling the scrolling behavior.
 */
Ext.define('Ext.scroll.Scroller', {
    extend: 'Ext.Evented',
    alias: 'scroller.scroller',

    mixins: [ 'Ext.mixin.Factoryable' ],

    requires: ['Ext.util.CSS', 'Ext.util.translatable.ScrollPosition'],

    factoryConfig: {
        defaultType: 'scroller'
    },

    isScroller: true,

    /**
     * @event refresh
     * Fires whenever the Scroller is refreshed.
     * @param {Ext.scroll.Scroller} this
     */

    /**
     * @event scrollstart
     * Fires whenever the scrolling is started.
     * @param {Ext.scroll.Scroller} this
     * @param {Number} x The current x position.
     * @param {Number} y The current y position.
     */

    /**
     * @event scrollend
     * Fires whenever the scrolling is ended.
     * @param {Ext.scroll.Scroller} this
     * @param {Number} x The current x position.
     * @param {Number} y The current y position.
     */

    /**
     * @event scroll
     * Fires whenever the Scroller is scrolled.
     * @param {Ext.scroll.Scroller} this
     * @param {Number} x The new x position.
     * @param {Number} y The new y position.
     */

    config: {
        /**
         * @cfg {'auto'/'vertical'/'horizontal'/'both'} [direction='auto']
         * @deprecated 5.1.0 use {@link #x} and {@link #y} instead
         */
        direction: undefined, // undefined because we need the updater to always run

        /**
         * @cfg {String/HTMLElement/Ext.dom.Element}
         * The element to make scrollable.
         */
        element: undefined,

        /**
         * @cfg {Boolean} [scrollbars=true]
         * `false` to hide scrollbars on browsers where it is possible via CSS,
         * Currently Webkit, Chrome, and IE10+
         * @private
         */
         scrollbars: null,

        /**
         * @cfg {String} A CSS selector that identifies items inside this scroller that
         * should be snapped into position when user scrolling ends.  By default the items
         * top/left will be aligned with the top/left of the container.  This alignment
         * can be changed using {@link #snapOffset}
         *
         * This api is highly experimental as it is based on bleeding-edge CSS implementations
         * that may change in the near future.  Do not rely on it in your applications.
         *
         * @private
         */
        snapSelector: null,

        /**
         * @cfg {Object} An object with x and y properties for offsetting the currently
         * snapped item from the top/left of the container.
         *
         * This api is highly experimental as it is based on bleeding-edge CSS implementations
         * that may change in the near future.  Do not rely on it in your applications.
         *
         * @private
         */
        snapOffset: null,

        /**
         * @cfg {Object} an object with x and y properties that specifies the size of the
         * snap points on the x and y axes.  For IE10+/Edge only, since those browsers do
         * not support the newer CSS properties for snapping to element boundaries.
         *
         * This config is experimental and may be removed in a future version of the framework.
         *
         * @private
         */
        msSnapInterval: null,

        /**
         * @cfg {Boolean/String}
         * - `true` or `'auto'` to enable horizontal auto-scrolling. In auto-scrolling mode
         * scrolling is only enabled when the {@link #element} has overflowing content.
         * - `false` to disable horizontal scrolling
         * - `'scroll'` to always enable horizontal scrolling regardless of content size.
         */
        x: true,

        /**
         * @cfg {Boolean/String}
         * - `true` or `'auto'` to enable vertical auto-scrolling. In auto-scrolling mode
         * scrolling is only enabled when the {@link #element} has overflowing content.
         * - `false` to disable vertical scrolling
         * - `'scroll'` to always enable vertical scrolling regardless of content size.
         */
        y: true,

        /**
         * @cfg {Ext.dom.Element} scrollElement
         * The element to read the scrollTop/scrollLeft from. This is used to
         * work around cross browser issues where WebKit/Blink require reading/writing
         * scrollTop/scrollLeft on the document.body, even if the documentElement is
         * the thing overflowing. In future this can be removed once document.scrollingElement
         * becomes a standard across all supported browsers.
         *
         * Note that scroll(Width/Height) and other dimensions can be read from the
         * documentElement without issue.
         * @private
         */
        scrollElement: null,

        /**
         * @cfg {Object}
         * The size of the scrollable content expressed as an object with x and y properties
         * @private
         * @readonly
         */
        size: null,

        spacerXY: null
    },

    snappableCls: Ext.baseCSSPrefix + 'scroller-snappable',
    elementCls: Ext.baseCSSPrefix + 'scroller',
    spacerCls: Ext.baseCSSPrefix + 'scroller-spacer',
    noScrollbarsCls: Ext.baseCSSPrefix + 'no-scrollbars',

    statics: {
        /**
         * Creates and returns an appropriate Scroller instance for the current device.
         * @param {Object} config Configuration options for the Scroller
         * @return {Ext.scroll.Scroller}
         */
        create: function(config, type) {
            return Ext.Factory.scroller(config, type);
        },

        /**
         * Get the scrolling element for the document based on feature detection.
         * See: https://dev.opera.com/articles/fixing-the-scrolltop-bug/
         * 
         * @return {HTMLElement}
         *
         * @private
         */
        getScrollingElement: function() {
            var doc = document,
                standard = this.$standardScrollElement,
                el = doc.scrollingElement,
                iframe, frameDoc;

            // Normalize the scrollElement we need to read/write from
            // First attempt to detect the newer standard for viewport
            // scrolling
            if (el) {
                return el;
            }

            // The newer standard doesn't exist, let the scroller
            // decide via feature detection.
            if (standard === undefined) {
                iframe = document.createElement('iframe');

                iframe.style.height = '1px';
                document.body.appendChild(iframe);
                frameDoc = iframe.contentWindow.document;
                frameDoc.write('<!DOCTYPE html><div style="height:9999em">x</div>');
                frameDoc.close();
                standard = frameDoc.documentElement.scrollHeight > frameDoc.body.scrollHeight;
                iframe.parentNode.removeChild(iframe);

                this.$standardScrollElement = standard;
            }
            return standard ? doc.documentElement : doc.body;
        }
    },

    constructor: function(config) {
        var me = this;

        me.position = { x: 0, y: 0 };

        me.callParent([config]);

        me.onDomScrollEnd = Ext.Function.createBuffered(me.onDomScrollEnd, 100, me);
    },
    
    destroy: function() {
        var me = this;

        // Clear any overflow styles
        me.setX(Ext.emptyString);
        me.setY(Ext.emptyString);

        // Remove element listeners
        me.setElement(null);
        me.setScrollElement(null);
        me.onDomScrollEnd = me._partners = me.component = null;
        
        if (me._translatable) {
            me._translatable.destroy();
            me._translatable = null;
        }

        me.removeSnapStylesheet();

        me.callParent();
    },

    /**
     * Adds a "partner" scroller.  Partner scrollers reflect each other's scroll position
     * at all times - if either scroller is scrolled, the scroll position of its partner
     * will be be automatically synchronized.
     *
     * A scroller may have multiple partners.
     *
     * @param {Ext.scroll.Scroller} partner
     * @param {String} [axis='both'] The axis to synchronize (`'x'`, '`y`', or '`both`')
     */
    addPartner: function(partner, axis) {
        var me = this,
            partners = me._partners || (me._partners = {}),
            otherPartners = partner._partners || (partner._partners = {});

        partners[partner.getId()] = {
            scroller: partner,
            axis: axis
        };

        otherPartners[me.getId()] = {
            scroller: me,
            axis: axis
        };
    },

    applyElement: function(element, oldElement) {
        var me = this,
            el, eventSource, scrollEl;

        // When element is set to null in destroy, we must remove listeners.
        if (oldElement) {
            me.scrollListener.destroy();
        }

        if (element) {
            if (element.isElement) {
                el = element;
            } else {
                el = Ext.get(element);

                //<debug>
                if (!el && (typeof element === 'string')) {
                    Ext.raise("Cannot create Ext.scroll.Scroller instance. " +
                        "Element with id '" + element + "' not found.");
                }
                //</debug>
            }

            if (el.dom === document.documentElement || el.dom === document.body) {
                // When the documentElement or body is scrolled, its scroll events are
                // fired via the window object
                eventSource = Ext.getWin();
                scrollEl = Ext.scroll.Scroller.getScrollingElement();
            } else {
                scrollEl = eventSource = el;
            }
            me.setScrollElement(Ext.get(scrollEl));
            me.scrollListener = eventSource.on({
                scroll: me.onDomScroll,
                scope: me,
                destroyable: true
            });

            return el;
        }
    },

    applySize: function (size, oldSize) {
        var x, y;

        if (size === null || typeof size === 'number') {
            x = y = size;
        } else if (size) {
            x = size.x;
            y = size.y;
        }

        if (x === null) {
            x = 0;
        } else if (x === undefined) {
            x = (oldSize ? oldSize.x : 0);
        }

        if (y === null) {
            y = 0;
        } else if (y === undefined) {
            y = (oldSize ? oldSize.y : 0);
        }

        return { x: x, y: y };
    },

    /**
     * Gets the `clientWidth` and `clientHeight` of the {@link #element} for this scroller.
     * @return {Object} An object with `x` and `y` properties.
     */
    getClientSize: function() {
        var dom = this.getElement().dom;
        return {
            x: dom.clientWidth,
            y: dom.clientHeight
        };
    },

    /**
     * Returns the amount of space consumed by scrollbars in the DOM
     * @return {Object} size An object containing the scrollbar sizes.
     * @return {Number} size.width The width of the vertical scrollbar.
     * @return {Number} size.height The height of the horizontal scrollbar.
     */
    getScrollbarSize: function() {
        var me = this,
            width = 0,
            height = 0,
            element = me.getElement(),
            dom, x, y, hasXScroll, hasYScroll, scrollbarSize;

        if (element && !element.destroyed) {
            x = me.getX();
            y = me.getY();
            dom = element.dom;

            if (x || y) {
                scrollbarSize = Ext.getScrollbarSize();
            }

            if (x === 'scroll') {
                hasXScroll = true;
            } else if (x) {
                hasXScroll = dom.scrollWidth > dom.clientWidth;
            }

            if (y === 'scroll') {
                hasYScroll = true;
            } else if (y) {
                hasYScroll = dom.scrollHeight > dom.clientHeight;
            }

            if (hasXScroll) {
                height = scrollbarSize.height;
            }

            if (hasYScroll) {
                width = scrollbarSize.width;
            }
        }

        return {
            width: width,
            height: height
        };
    },

    /**
     * @method getPosition
     * Returns the current scroll position
     * @return {Object} An object with `x` and `y` properties.
     */
    getPosition: function() {
        var me = this;
        if (me.positionDirty) {
            me.updateDomScrollPosition();
        }
        return me.position;
    },

    /**
     * @method getSize
     * Returns the size of the scrollable content
     * @return {Object} size
     * @return {Number} size.x The width of the scrollable content
     * @return {Number} size.y The height of the scrollable content
     */
    getSize: function() {
        var element = this.getElement(),
            size, dom;

        if (element && !element.destroyed) {
            dom = element.dom;
            size = {
                x: dom.scrollWidth,
                y: dom.scrollHeight
            };
        } else {
            size = {
                x: 0,
                y: 0
            };
        }

        return size;
    },

    /**
     * @method getMaxPosition
     * Returns the maximum scroll position for this scroller
     * @return {Object} position
     * @return {Number} position.x The maximum scroll position on the x axis
     * @return {Number} position.y The maximum scroll position on the y axis
     */
    getMaxPosition: function() {
        var element = this.getElement(),
            x = 0,
            y = 0,
            dom;

        if (element && !element.destroyed) {
            dom = element.dom;
            x = dom.scrollWidth - dom.clientWidth;
            y = dom.scrollHeight - dom.clientHeight;
        }


        return {
            x: x,
            y: y
        };
    },

    /**
     * @method getMaxUserPosition
     * Returns the maximum scroll position for this scroller for scrolling that is initiated
     * by the user via mouse or touch.  This differs from getMaxPosition in that getMaxPosition
     * returns the true maximum scroll position regardless of which axes are enabled for
     * user scrolling.
     * @return {Object} position
     * @return {Number} position.x The maximum scroll position on the x axis
     * @return {Number} position.y The maximum scroll position on the y axis
     */
    getMaxUserPosition: function() {
        var me = this,
            element = me.getElement(),
            x = 0,
            y = 0,
            dom;

        if (element && !element.destroyed) {
            dom = element.dom;
            if (me.getX()) {
                x = dom.scrollWidth - dom.clientWidth;
            }
            if (me.getY()) {
                y = dom.scrollHeight - dom.clientHeight;
            }
        }

        return {
            x: x,
            y: y
        };
    },

    /**
     * Refreshes the scroller size and maxPosition.
     * @param {Boolean} immediate `true` to refresh immediately. By default refreshes
     * are deferred until the next {@link Ext.GlobalEvents#event-idle idle} event to
     * ensure any pending writes have been flushed to the dom and any reflows have
     * taken place.
     * @return {Ext.scroll.Scroller} this
     * @chainable
     */
    refresh: function() {
        // Element size has changed.
        // Our position property may need refreshing from the DOM
        this.positionDirty = true;

        this.fireEvent('refresh', this);
        return this;
    },

    /**
     * Removes a partnership that was created via {@link #addPartner}
     * @param {Ext.scroll.Scroller} partner
     * @private
     */
    removePartner: function(partner) {
        var partners = this._partners,
            otherPartners = partner._partners;

        if (partners) {
            delete partners[partner.getId()];
        }

        if (otherPartners) {
            delete(otherPartners[this.getId()]);
        }
    },

    /**
     * Scrolls by the passed delta values, optionally animating.
     *
     * All of the following are equivalent:
     *
     *      scroller.scrollBy(10, 10, true);
     *      scroller.scrollBy([10, 10], true);
     *      scroller.scrollBy({ x: 10, y: 10 }, true);
     *
     * A null value for either `x` or `y` will result in no scrolling on the given axis,
     * for example:
     *
     *     scroller.scrollBy(null, 10);
     *
     * will scroll by 10 on the y axis and leave the x axis at its current scroll position
     *
     * @param {Number/Number[]/Object} deltaX Either the x delta, an Array specifying x
     * and y deltas or an object with "x" and "y" properties.
     * @param {Number/Boolean/Object} deltaY Either the y delta, or an animate flag or
     * config object.
     * @param {Boolean/Object} animate Animate flag/config object if the delta values were
     * passed separately.
     */
    scrollBy: function(deltaX, deltaY, animate) {
        var position = this.getPosition();

        if (deltaX) {
            if (deltaX.length) { // array
                animate = deltaY;
                deltaY = deltaX[1];
                deltaX = deltaX[0];
            } else if (typeof deltaX !== 'number') { // object
                animate = deltaY;
                deltaY = deltaX.y;
                deltaX = deltaX.x;
            }
        }

        deltaX = (typeof deltaX === 'number') ? deltaX + position.x : null;
        deltaY = (typeof deltaY === 'number') ? deltaY + position.y : null;

        return this.doScrollTo(deltaX, deltaY, animate);
    },

    /**
     * Scrolls a descendant element of the scroller into view.
     * @param {String/HTMLElement/Ext.dom.Element} el the descendant to scroll into view
     * @param {Boolean} [hscroll=true] False to disable horizontal scroll.
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element
     * animation config object
     * @param {Boolean/String} [highlight=false] true to
     * {@link Ext.dom.Element#highlight} the element when it is in view. Can also be a
     * hex color to use for highlighting (defaults to yellow = '#ffff9c')
     * @private
     */
    scrollIntoView: function(el, hscroll, animate, highlight) {
        var me = this,
            position = me.getPosition(),
            newPosition, newX, newY,
            myEl = me.getElement();

        // Might get called before Component#onBoxReady which is when the Scroller is set up with elements.
        if (el) {
            newPosition = Ext.fly(el).getScrollIntoViewXY(myEl, position.x, position.y);
            newX = (hscroll === false) ? position.x : newPosition.x;
            newY = newPosition.y;

            // Only attempt to scroll if it's needed.
            if (newY !== position.y || newX !== position.x) {
                if (highlight) {
                    me.on({
                        scrollend: 'doHighlight',
                        scope: me,
                        single: true,
                        args: [el, highlight]
                    });
                }

                me.doScrollTo(newX, newY, animate);
            }
            // No scrolling needed, but still honour highlight request
            else if (highlight) {
                me.doHighlight(el, highlight);
            }
        }
    },

    /**
     * Determines if the passed element is within the visible x and y scroll viewport.
     * @param {String/HTMLElement/Ext.dom.Element} el The dom node, Ext.dom.Element, or 
     * id (string) of the dom element that is to be verified to be in view
     * @return {Object} Which ranges the element is in.
     * @return {Boolean} return.x `true` if the passed element is within the x visible range.
     * @return {Boolean} return.y `true` if the passed element is within the y visible range.
     */
    isInView: function(el) {
        return this.doIsInView(el);
    },

    /**
     * Scrolls to the given position.
     *
     * All of the following are equivalent:
     *
     *      scroller.scrollTo(10, 10, true);
     *      scroller.scrollTo([10, 10], true);
     *      scroller.scrollTo({ x: 10, y: 10 }, true);
     *
     * A null value for either `x` or `y` will result in no scrolling on the given axis,
     * for example:
     *
     *     scroller.scrollTo(null, 10);
     *
     * will scroll to 10 on the y axis and leave the x axis at its current scroll position
     *
     * A negative value for either `x` or `y` represents an offset from the maximum scroll
     * position on the given axis:
     *
     *     // scrolls to 10px from the maximum x scroll position and 20px from maximum y
     *     scroller.scrollTo(-10, -20);
     *
     * A value of Infinity on either axis will scroll to the maximum scroll position on
     * that axis:
     *
     *     // scrolls to the maximum position on both axes
     *     scroller.scrollTo(Infinity, Infinity);
     *
     * @param {Number} x The scroll position on the x axis.
     * @param {Number} y The scroll position on the y axis.
     * @param {Boolean/Object} [animation] Whether or not to animate the scrolling to the new position.
     *
     * @return {Ext.scroll.Scroller} this
     * @chainable
     */
    scrollTo: function(x, y, animation) {
        var maxPosition;

        if (x) {
            if (x.length) { // array
                animation = y;
                y = x[1];
                x = x[0];
            } else if (typeof x !== 'number') { // object
                animation = y;
                y = x.y;
                x = x.x;
            }
        }

        if (x < 0 || y < 0) {
            maxPosition = this.getMaxPosition();

            if (x < 0) {
                x += maxPosition.x;
            }
            if (y < 0) {
                y += maxPosition.y;
            }
        }

        this.doScrollTo(x, y, animation);
    },

    updateDirection: function(direction) {
        var me = this,
            x, y;

        if (!direction) {
            // if no direction was configured we set its value based on the values of
            // x and y.  This ensures getDirection() always returns something useful
            // for backward compatibility.
            x = me.getX();
            y = me.getY();
            if (x && y) {
                direction = (y === 'scroll' && x === 'scroll') ? 'both' : 'auto';
            } else if (y) {
                direction = 'vertical';
            } else if (x) {
                direction = 'horizontal';
            }
            // set the _direction property directly to avoid the updater being called
            // and triggering setX/setY calls
            me._direction = direction;
        } else {
            if (direction === 'auto') {
                x = true;
                y = true;
            } else if (direction === 'vertical') {
                x = false;
                y = true;
            } else if (direction === 'horizontal') {
                x = true;
                y = false;
            } else if (direction === 'both') {
                x = 'scroll';
                y = 'scroll';
            }

            me.setX(x);
            me.setY(y);
        }
    },

    updateScrollbars: function(scrollbars, oldScrollbars) {
        this.syncScrollbarCls();
    },

    updateSize: function(size) {
        var me = this,
            element = me.getElement(),
            x = size.x,
            y = size.y,
            spacer;

        if (element) {
            me.positionDirty = true;
            spacer = me.getSpacer();

            // Typically a dom scroller simply assumes the scroll size dictated by its content.
            // In some cases, however, it is necessary to be able to manipulate this scroll size
            // (infinite lists for example).  This method positions a 1x1 px spacer element
            // within the scroller element to set a specific scroll size.
            if (!x && !y) {
                spacer.hide();
            } else {
                // Subtract spacer size from coordinates (spacer is always 1x1 px in size)
                if (x > 0) {
                    x -= 1;
                }
                if (y > 0) {
                    y -= 1;
                }

                me.setSpacerXY({
                    x: x,
                    y: y
                });
                spacer.show();
            }
        }
    },

    updateMsSnapInterval: function() {
        this.initMsSnapInterval();
    },

    updateSnapSelector: function() {
        this.initSnap();
    },

    updateSnapOffset: function() {
        this.initSnap();
    },

    updateElement: function(element) {
        var me = this;

        me.initXStyle();
        me.initYStyle();
        element.addCls(me.elementCls);
        me.initSnap();
        me.initMsSnapInterval();
        me.syncScrollbarCls();
    },

    updateX: function(x) {
        this.initXStyle();
    },

    updateY: function(y) {
        this.initYStyle();
    },

    deprecated: {
        '5': {
            methods: {
                /**
                 * Returns this scroller.
                 *
                 * In Sencha Touch 2, access to a Component's Scroller was provided via
                 * a Ext.scroll.View class that was returned from the Component's getScrollable()
                 * method:
                 *
                 *     component.getScrollable().getScroller();
                 *
                 * in 5.0 all the functionality of Ext.scroll.View has been rolled into
                 * Ext.scroll.Scroller, and Ext.scroll.View has been removed.  Component's
                 * getScrollable() method now returns a Ext.scroll.Scroller.  This method is
                 * provided for compatibility.
                 * @deprecated 5.0
                 */
                getScroller: function() {
                    return this;
                }
            }
        },
        '5.1.0': {
            methods: {
                /**
                 * Scrolls to 0 on both axes
                 * @param {Boolean/Object} animate
                 * @private
                 * @return {Ext.scroll.Scroller} this
                 * @chainable
                 * @deprecated 5.1.0 Use scrollTo instead
                 */
                scrollToTop: function(animate) {
                    return this.scrollTo(0, 0, animate);
                },

                /**
                 * Scrolls to the maximum position on both axes
                 * @param {Boolean/Object} animate
                 * @private
                 * @return {Ext.scroll.Scroller} this
                 * @chainable
                 * @deprecated 5.1.0 Use scrollTo instead
                 */
                scrollToEnd: function(animate) {
                    return this.scrollTo(Infinity, Infinity, animate);
                }
            }
        }
    },

    privates: {
        getSpacer: function() {
            var me = this,
                spacer = me._spacer,
                element;

            // In some cases (e.g. infinite lists) we need to be able to tell the scroller
            // to have a specific size, regardless of its contents.  This creates a spacer
            // element which can then be absolutely positioned to affect the element's
            // scroll size. Must be first element, so it is not translated due to being after
            // the element contrainer el.
            if (!spacer) {
                element = me.getElement();
                spacer = me._spacer = element.createChild({
                    cls: me.spacerCls,
                    role: 'presentation'
                }, element.dom.firstChild);

                spacer.setVisibilityMode(2); // 'display' visibilityMode
                spacer.hide();

                // make sure the element is positioned if it is not already.  This ensures
                // that the spacer's position will affect the element's scroll size
                element.position();
            }

            return spacer;
        },

        applySpacerXY: function(pos, oldPos) {
            // Opt out if we have the same value
            if (oldPos && pos.x === oldPos.x && pos.y === oldPos.y) {
                pos = undefined;
            }
            return pos;
        },

        updateSpacerXY: function(pos) {
            var me = this,
                spacer = me.getSpacer(),
                sStyle = spacer.dom.style,
                scrollHeight = pos.y,
                shortfall;

            sStyle.marginTop = '';
            me.translateSpacer(pos.x, me.constrainScrollRange(scrollHeight));

            // Force a synchronous layout to update the scrollHeight.
            // This flip-flops between 0px and 1px
            sStyle.lineHeight = Number(!parseInt(sStyle.lineHeight, 10)) + 'px';

            // See if we can get any more scrollHeight from a margin-top
            shortfall = scrollHeight - me.getElement().dom.scrollHeight;
            if (shortfall > 0) {
                sStyle.marginTop = Math.min(shortfall, me.maxSpacerMargin || 0) + 'px';
            }
        },

        // rtl hook - rtl version sets right style
        translateSpacer: function(x, y) {
            this.getSpacer().translate(x, y);
        },

        doIsInView: function(el, skipCheck) {
            var me = this,
                c = me.component,
                result = {
                    x: false,
                    y: false
                },
                elRegion,
                myEl = me.getElement(),
                myElRegion;

            if (el && (skipCheck || (myEl.contains(el) || (c && c.owns(el))))) {
                myElRegion = myEl.getRegion();
                elRegion = Ext.fly(el).getRegion();

                result.x = elRegion.right > myElRegion.left && elRegion.left < myElRegion.right;
                result.y = elRegion.bottom > myElRegion.top && elRegion.top < myElRegion.bottom;
            }
            return result;
        },

        constrainScrollRange: function(scrollRange) {
            // Only do the expensive search for the browser limit if they
            // want more than a million pixels.
            if (scrollRange < 1000000) {
                return scrollRange;
            }

            if (!this.maxSpacerTranslate) {
                //
                // Find max scroll height which transform: translateY(npx) will support.
                // IE11 appears to have 21,474,834
                // Chrome and Safari have 16,777,216, but additional margin-top of 16777215px allows a scrollHeight of 33,554,431
                // Firefox has 17,895,698
                // IE9-10 1,534,000
                //
                var maxScrollHeight = Math.pow(2, 32),
                    tooHigh = maxScrollHeight,
                    tooLow = 500,
                    scrollTest = Ext.getBody().createChild({
                        style: {
                            position: 'absolute',
                            left: '-10000px',
                            top: '0',
                            width: '500px',
                            height: '500px'
                        },
                        cn: {
                            cls: this.spacerCls
                        }
                    }, null, true),
                    stretcher = Ext.get(scrollTest.firstChild),
                    sStyle = stretcher.dom.style;

                stretcher.translate(0, maxScrollHeight - 1);
                sStyle.lineHeight = Number(!parseInt(sStyle.lineHeight, 10)) + 'px';

                // See what the max translateY is which still stretches the scrollHeight
                while (tooHigh !== tooLow + 1) {
                    stretcher.translate(0, (maxScrollHeight = tooLow + Math.floor((tooHigh - tooLow) / 2)));

                    // Force a synchronous layout to update the scrollHeight.
                    // This flip-flops between 0px and 1px
                    sStyle.lineHeight = Number(!parseInt(sStyle.lineHeight, 10)) + 'px';

                    if (scrollTest.scrollHeight < maxScrollHeight) {
                        tooHigh = maxScrollHeight;
                    } else {
                        tooLow = maxScrollHeight;
                    }
                }
                stretcher.translate(0, Ext.scroll.Scroller.prototype.maxSpacerTranslate = tooLow);

                // Go through the same steps seeing how far we can push it with margin-top
                tooHigh = tooLow * 2;
                while (tooHigh !== tooLow + 1) {
                    stretcher.dom.style.marginTop = ((maxScrollHeight = tooLow + Math.floor((tooHigh - tooLow) / 2))) + 'px';

                    // Force a synchronous layout to update the scrollHeight.
                    // This flip-flops between 0px and 1px
                    sStyle.lineHeight = Number(!parseInt(sStyle.lineHeight, 10)) + 'px';

                    if (scrollTest.scrollHeight < maxScrollHeight) {
                        tooHigh = maxScrollHeight;
                    } else {
                        tooLow = maxScrollHeight;
                    }
                }
                Ext.fly(scrollTest).destroy();

                Ext.scroll.Scroller.prototype.maxSpacerMargin = tooLow - Ext.scroll.Scroller.prototype.maxSpacerTranslate;
            }

            // The maximum a translateY transform can be pushed to stretch the scrollHeight before
            // it collapses back to offsetHeight
            return Math.min(scrollRange, this.maxSpacerTranslate);
        },

        // hook for rtl mode to convert an x coordinate to RTL space.
        convertX: function(x) {
            return x;
        },

        // highlights an element after it has been scrolled into view
        doHighlight: function(el, highlight) {
            if (highlight !== true) { // handle hex color
                Ext.fly(el).highlight(highlight);
            } else {
                Ext.fly(el).highlight();
            }
        },

        doScrollTo: function(x, y, animate) {
            // There is an IE8 override of this method; when making changes here
            // don't forget to update the override as well
            var me = this,
                element = me.getScrollElement(),
                maxPosition, dom, xInf, yInf,
                i;

            if (element && !element.destroyed) {
                dom = element.dom;

                xInf = (x === Infinity);
                yInf = (y === Infinity);

                if (xInf || yInf) {
                    maxPosition = me.getMaxPosition();
                    if (xInf) {
                        x = maxPosition.x;
                    }
                    if (yInf) {
                        y = maxPosition.y;
                    }
                }

                x = me.convertX(x);

                if (animate) {
                    if (!this._translatable) {
                        this._translatable = new Ext.util.translatable.ScrollPosition({element: element});
                    }

                    this._translatable.translate(x, y, animate);
                } else {
                    if (y != null) {
                        dom.scrollTop = y;
                    }
                    if (x != null) {
                        dom.scrollLeft = x;
                        // IE8 does not update immediately without this hack.
                        //<feature legacyBrowser>
                        if (Ext.isIE8) {
                            i = dom.scrollLeft;
                            dom.scrollLeft = x;
                        }
                        //</feature legacyBrowser>
                    }
                }

                // Our position object will need refreshing before returning.
                me.positionDirty = true;
            }
        },

        fireScrollStart: function(x, y) {
            var me = this,
                component = me.component;

            me.invokePartners('onPartnerScrollStart', x, y);

            if (me.hasListeners.scrollstart) {
                me.fireEvent('scrollstart', me, x, y);
            }

            if (component && component.onScrollStart) {
                component.onScrollStart(x, y);
            }

            Ext.GlobalEvents.fireEvent('scrollstart', me, x, y);
        },

        fireScroll: function(x, y) {
            var me = this,
                component = me.component;

            me.invokePartners('onPartnerScroll', x, y);

            if (me.hasListeners.scroll) {
                me.fireEvent('scroll', me, x, y);
            }

            if (component && component.onScrollMove) {
                component.onScrollMove(x, y);
            }

            Ext.GlobalEvents.fireEvent('scroll', me, x, y);
        },

        fireScrollEnd: function(x, y) {
            var me = this,
                component = me.component;

            me.invokePartners('onPartnerScrollEnd', x, y);

            if (me.hasListeners.scrollend) {
                me.fireEvent('scrollend', me, x, y);
            }

            if (component && component.onScrollEnd) {
                component.onScrollEnd(x, y);
            }

            Ext.GlobalEvents.fireEvent('scrollend', me, x, y);
        },

        // rtl hook
        getElementScroll: function(element) {
            return element.getScroll();
        },

        initSnap: function() {
            var me = this,
                snapOffset = me.getSnapOffset(),
                snapSelector = me.getSnapSelector(),
                element = me.getElement(),
                offsetX, offsetY, snapCoordinate;

            if (element && snapSelector) {
                element.addCls(me.snappableCls);

                me.removeSnapStylesheet();

                if (snapOffset) {
                    offsetX = snapOffset.x || 0;
                    offsetY = snapOffset.y || 0;

                    if (offsetX) {
                        offsetX = -offsetX + 'px';
                    }

                    if (offsetY) {
                        offsetY = -offsetY + 'px';
                    }
                }

                snapCoordinate = offsetX + ' ' + offsetY + ';';

                me.snapStylesheet = Ext.util.CSS.createStyleSheet(
                    '#' + element.id + ' ' + snapSelector +
                    '{-webkit-scroll-snap-coordinate:' + snapCoordinate +
                    'scroll-snap-coordinate:' + snapCoordinate + '}'
                );
            }
        },

        initMsSnapInterval: function() {
            var element = this.getElement(),
                interval, x, y, style;

            if (element) {
                interval = this.getMsSnapInterval();

                if (interval) {
                    x = interval.x;
                    y = interval.y;
                    style = element.dom.style;

                    if (x) {
                        style['-ms-scroll-snap-points-x'] = 'snapInterval(0px, ' + x + 'px)';
                    }

                    if (y) {
                        style['-ms-scroll-snap-points-y'] = 'snapInterval(0px, ' + y + 'px)';
                    }
                }
            }
        },

        initXStyle: function() {
            var element = this.getElement(),
                x = this.getX();

            // Check that element exists and is not destroyed
            if (element && element.dom) {
                if (!x) {
                    x = 'hidden';
                } else if (x === true) {
                    x = 'auto';
                }

                element.setStyle('overflow-x', x);
            }
        },

        initYStyle: function() {
            var element = this.getElement(),
                y = this.getY();

            // Check that element exists and is not destroyed
            if (element && element.dom) {
                if (!y) {
                    y = 'hidden';
                } else if (y === true) {
                    y = 'auto';
                }

                element.setStyle('overflow-y', y);
            }
        },

        invokePartners: function(method, x, y) {
            var me = this,
                partners = me._partners,
                partner,
                id,
                isEnd = method ==='onPartnerScrollEnd';

            // Do not invoke partners if we ar ealready reflecting a partner's scroll
            if (!me.suspendSync & !me.isReflecting) {
                for (id in partners) {
                    partner = partners[id].scroller;
                    partner.isReflecting = true;
                    partner[method](me, x, y);

                    // End a partner's reflecting status only when we are ending our scroll.
                    if (isEnd) {
                        partner.isReflecting = false;
                    }
                }
            }
        },

        clearReflecting: function() {
            this.isReflecting = false;
        },

        suspendPartnerSync: function() {
            this.suspendSync = (this.suspendSync || 0) + 1;
        },

        resumePartnerSync: function(syncNow) {
            var me = this,
                position;

            if (me.suspendSync) {
                me.suspendSync--;
            }
            if (!me.suspendSync && syncNow) {
                position = me.getPosition();
                me.invokePartners('onPartnerScroll', position.x, position.y);
                me.invokePartners('onPartnerScrollEnd', position.x, position.y);
            }
        },

        updateDomScrollPosition: function() {
            var me = this,
                element = me.getScrollElement(),
                elScroll,
                position = me.position;

            if (element && !element.destroyed) {
                elScroll = me.getElementScroll(element);
                position.x = elScroll.left;
                position.y = elScroll.top;
            }

            me.positionDirty = false;
            return position;
        },

        /**
         * @private
         * May be called when a Component is rendererd AFTER some scrolling partner has begun its lifecycle to sync
         * this scroller with partners which may be scrolled anywhere by now.
         */
        syncWithPartners: function() {
            var me = this,
                partners = me._partners,
                id,
                partner,
                position;

            me.isReflecting = true;
            for (id in partners) {
                partner = partners[id].scroller;
                position = partner.getPosition();
                me.onPartnerScroll(partner, position.x, position.y);
            }
            me.isReflecting = false;
        },

        syncScrollbarCls: function() {
            var element = this.getElement();

            if (element) {
                element.toggleCls(this.noScrollbarsCls, this.getScrollbars() === false);
            }
        },

        onDomScroll: function() {
            var me = this,
                position, x, y;

            position = me.updateDomScrollPosition();
            if (me.restoring) {
                return;
            }

            x = position.x;
            y = position.y;

            if (!me.isScrolling) {
                me.isScrolling = Ext.isScrolling = true;
                me.fireScrollStart(x, y);
            }

            me.fireScroll(x, y);

            // call the buffered onScrollEnd.  this invocation will be canceled if another
            // scroll occurs before the buffer time.
            me.onDomScrollEnd();
        },

        onDomScrollEnd: function() {
            var me = this,
                position, x, y;
            
            // Could be destroyed by this time
            if (me.destroying || me.destroyed) {
                return;
            }
                
            position = me.getPosition();
            x = position.x;
            y = position.y;

            me.isScrolling = Ext.isScrolling = false;

            me.trackingScrollLeft = x;
            me.trackingScrollTop = y;

            me.fireScrollEnd(x, y);
        },

        onPartnerScroll: function(partner, x, y) {
            var axis = partner._partners[this.getId()].axis;

            if (axis) {
                if (axis === 'x') {
                    y = null;
                } else if (axis === 'y') {
                    x = null;
                }
            }

            this.doScrollTo(x, y, false, true);
        },

        onPartnerScrollStart: Ext.privateFn,
        onPartnerScrollEnd: Ext.privateFn,

        removeSnapStylesheet: function() {
            var stylesheet = this.snapStylesheet;

            if (stylesheet) {
                Ext.util.CSS.removeStyleSheet(stylesheet);
                this.snapStylesheet = null;
            }
        },

        restoreState: function () {
            var me = this,
                el = me.getScrollElement();

            if (el) {

                // Only restore state if has been previously captured! For example,
                // floaters probably have not been hidden before initially shown.
                if (me.trackingScrollTop !== undefined) {
                    // If we're restoring the scroll position, we don't want to publish
                    // scroll events since the scroll position should not have changed
                    // at all as far as the user is concerned, so just do it silently
                    // while ensuring we maintain the correct internal state. 50ms is
                    // enough to capture the async scroll events, anything after that
                    // we re-enable.
                    me.restoring = true;
                    Ext.defer(function() {
                        me.restoring = false;
                    }, 50);
                    me.doScrollTo(me.trackingScrollLeft, me.trackingScrollTop, false);

                    // Do not discard the state.
                    // It may need to be restored again.
                }
            }
        }
    }
}, function(Scroller) {
    /**
     * @private
     * @return {Ext.scroll.Scroller}
     */
    Ext.getViewportScroller = function() {
        // This method creates the global viewport scroller.  This scroller instance must
        // always exist regardless of whether or not there is a Viewport component in use
        // so that global scroll events will still fire.  Menus and some other floating
        // things use these scroll events to hide themselves.
        return Scroller.viewport || (Scroller.viewport = new Scroller());
    };

    /**
     * @private
     * @param {Ext.scroll.Scroller} scroller
     */
    Ext.setViewportScroller = function(scroller) {
        if (Scroller.viewport !== scroller) {
            Ext.destroy(Scroller.viewport);
            Scroller.viewport = scroller.isScroller ? scroller : new Scroller(scroller);
        }
    };

    Ext.onReady(function() {
        Ext.defer(function() {
            // The viewport scroller must always exist, but it is deferred so that the
            // viewport component has a chance to call Ext.setViewportScroller() with
            // its own scroller first.
            var scroller = Ext.getViewportScroller();

            if (!scroller.getElement()) {
                // if the viewport component has already claimed the viewport scroller
                // it will have already set its overflow element as the scroller element,
                // otherwise, the element is always the body.
                scroller.setElement(Ext.getBody());
            }
        }, 100);
    });
});
