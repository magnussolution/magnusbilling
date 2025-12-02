/**
 * This class provides extra contextual information for components/elements by
 * attaching to a {@link #target}. The tip will show based on mouseover (or touch, 
 * depending on the environment) and {@link #align} itself to the {@link #target}.
 *
 * Typically, tooltips will be created via {@link Ext.Component#tooltip components}, however
 * it is possible to create instances directly.
 *
 *     new Ext.tip.ToolTip({
 *         target: myComponent,
 *         html: 'Here is some help text about this!'
 *     });
 *
 * # Shared instance
 * New instances of tooltips do not need to be created for every item that requires
 * a tooltip. In most cases it is sufficient to use a single shared instance across 
 * the application, which provides a performance benefit. See {@link Ext.tip.Manager} 
 * for an explanation of how shared tips are used.
 *
 * # Delegation
 * 
 * It is common to want to show a tooltip for a repeated view and dynamically update
 * the content based on the current item within this view. This can be achieved using
 * the {@link #delegate} configuration. This means that the tip will only activate
 * when over an item inside the target that matches the {@link #delegate}. After this,
 * the {@link #currentTarget} can be interrogated to get contextual information about which
 * delegate item triggered the show.
 *
 *     var el = Ext.getBody().createChild({
 *         html: '<div data-num="1" class="item">Foo</div>' +
 *               '<div data-num="2" class="item">Bar</div>' +
 *               '<div data-num="3" class="item">Baz</div>' +
 *               '<div class="notip">No tip here</div>'
 *     });
 *
 *     new Ext.tip.ToolTip({
 *         target: el,
 *         delegate: '.item',
 *         listeners: {
 *             beforeshow: function(tip) {
 *                 var current = tip.currentTarget.dom;
 *                 tip.setHtml('Item #' + current.getAttribute('data-num'));
 *             }
 *         }
 *     });
 *
 * # Alignment
 *
 * The following configuration properties allow control over how the ToolTip is aligned relative to
 * the target element and/or mouse pointer:
 *
 * - {@link #anchor}
 * - {@link #anchorToTarget}
 * - {@link #trackMouse}
 * - {@link #mouseOffset}
 *
 * # Showing/Hiding
 *
 * The following configuration properties allow control over how and when the ToolTip is automatically
 * shown and hidden:
 *
 * - {@link #autoHide}
 * - {@link #showDelay}
 * - {@link #hideDelay}
 * - {@link #dismissDelay}
 * 
 * 
 * @since 6.2.0
 */
Ext.define('Ext.tip.ToolTip', {
    extend: 'Ext.Panel',
    xtype: 'tooltip',

    floated: true,
    
    ui: 'tooltip',

    hidden: true,

    shadow: true,

    border: true,

    anchor: false,

    closeAction: 'hide',

    config: {
        /**
         * @cfg {String} [align]
         * A string which specifies how this ToolTip is to align with regard to its
         * {@link #currentTarget} by means of identifying the point of the tooltip to
         * join to the point of the target.
         *
         * By default, the tooltip shows at {@link #mouseOffset} pixels from the
         * triggering pointer event. Using this config anchors the ToolTip to its target
         * instead.
         *
         * This may take the following forms:
         * 
         * - **Blank**: Defaults to aligning the element's top-left corner to the target's
         *   bottom-left corner ("tl-bl").
         * - **Two anchors**: If two values from the table below are passed separated by a dash,
         *   the first value is used as the element's anchor point, and the second value is
         *   used as the target's anchor point.
         * - **Two edge/offset descriptors:** An edge/offset descriptor is an edge initial
         *   (`t`/`r`/`b`/`l`) followed by a percentage along that side. This describes a
         *   point to align with a similar point in the target. So `'t0-b0'` would be
         *   the same as `'tl-bl'`, `'l0-r50'` would place the top left corner of this item
         *   halfway down the right edge of the target item. This allows more flexibility
         *   and also describes which two edges are considered adjacent when positioning a tip pointer. 
         *
         * In addition to the anchor points, the position parameter also supports the "?"
         * character. If "?" is passed at the end of the position string, the element will
         * attempt to align as specified, but the position will be adjusted to constrain to
         * the viewport if necessary. Note that the element being aligned might be swapped to
         * align to a different position than that specified in order to enforce the viewport
         * constraints. Following are all of the supported anchor positions:
         *
         *      Value  Description
         *      -----  -----------------------------
         *      tl     The top left corner
         *      t      The center of the top edge
         *      tr     The top right corner
         *      l      The center of the left edge
         *      c      The center
         *      r      The center of the right edge
         *      bl     The bottom left corner
         *      b      The center of the bottom edge
         *      br     The bottom right corner
         *
         * Example Usage:
         *
         *     // align the top left corner of the tooltip with the top right corner of its target
         *     // (constrained to viewport).
         *     align: 'tl-tr?'
         *
         *     // align the bottom right corner of the tooltip with the center left edge of its target.
         *     align: 'br-l?'
         *
         *     // align the top center of the tooltip with the bottom left corner of its target.
         *     align: 't-bl'
         *
         *     // align the 25% point on the bottom edge of this tooltip
         *     // with the 75% point on the top edge of its target.
         *     align: 'b25-c75'
         */
        align: 'l-r?',

        /**
         * @cfg {String} [alignDelegate]
         * A selector which identifies child elements of the  {@link #currentTarget} to
         * align to upon show.
         */
        alignDelegate: null,

        /**
         * @cfg {Boolean} [allowOver=false]
         * Set to `true` to allow mouse exiting the target, but moving into the ToolTip to
         * keep the ToolTip visible. This may be useful for interactive tips.
         *
         * While the mouse is over the tip, the {@link dismissDelay dismiss timer} is
         * inactive, so the tip will not {@link #autoHide}.
         *
         * On touch platforms, a touch on the tooltip is the equivalent, and this cancels
         * the dismiss timer so that a tap outside is then necessary to hide the tip.
         *
         * This is incompatible with the {@link #cfg-trackMouse} config.
         */
        allowOver: null,

        /**
         * @cfg {Boolean} [anchorToTarget]
         * By default, the {@link #align} config aligns to the {@link #target}.
         *
         * Configure this as `false` if an anchor is required, but positioning is still
         * relative to the pointer position on show.
         */
        anchorToTarget: true,

        /**
         * @cfg {Boolean} [autoHide]
         * True to automatically hide the tooltip after the mouse exits the target element
         * or after the `{@link #dismissDelay}` has expired if set.
         *
         * If `{@link #closable} = true` a close tool button will be rendered into the
         * tooltip header.
         */
        autoHide: true,

        /**
         * @cfg {String} [delegate]
         * A selector which identifies child elements of the target which trigger showing
         * this ToolTip. The {@link #currentTarget} property is set to the triggering
         * element.
         */
        delegate: null,

        /**
         * @cfg {Number} [dismissDelay]
         * Delay in milliseconds before the tooltip automatically hides.
         *
         * Set this value to `0` to disable automatic hiding.
         */
        dismissDelay: 5000,

        /**
         * @cfg {Number} [hideDelay]
         * Delay in milliseconds after the mouse exits the target element but before the
         * tooltip actually hides.
         *
         * Set to `0` for the tooltip to hide immediately.
         */
        hideDelay: 300,

        /**
         * @cfg {Number[]} [mouseOffset]
         * An XY offset from the triggering pointer event position where the tooltip
         * should be shown unless aligned to the target element.
         */
        mouseOffset: [15, 18],

        /**
         * @cfg {Number} [quickShowInterval]
         * If a show is triggered within this number of milliseconds of this ToolTip being
         * hidden, it shows immediately regardless of the delay. If rapidly moving from
         * target to target, this ensure that each separate target does not get its own
         * delay.
         */
        quickShowInterval: 250,

        /**
         * @cfg {Number} [showDelay]
         * Delay in milliseconds before the tooltip displays after the mouse enters the
         * target element.
         *
         * On touch platforms, if {@link #showOnTap} is `true`, a tap on the target shows
         * the tip, and this timer is ignored - the tip is shown immediately.
         */
        showDelay: 500,

        /**
         * @cfg {Boolean/String[]} [showOnTap=false]
         * `true` to show this tip on a tap event on the target. If specified as a string,
         * it should be the {@link Ext.event.Event#pointerType} of the event that should
         * trigger a show. Typically, this will be `touch`.
         *
         * This is useful for adding tips on elements which do not have tap listeners. It
         * would not be appropriate for a ToolTip on a {@link Ext.Button Button}.
         */
        showOnTap: null,

        /**
         * @cfg {Ext.Component/Ext.dom.Element} target
         * The target that should trigger showing this ToolTip.
         */
        target: null,

        /**
         * @cfg {Boolean} [trackMouse]
         * True to have the tooltip follow the mouse as it moves over the target element.
         *
         * Only effective on platforms with pointing devices, this does not address touch
         * events.
         */
        trackMouse: false
    },

    closeToolText: '',

    constructor: function (config) {
        /**
         * @property {Ext.dom.Fly} currentTarget
         * Only attached to a DOM element  when this ToolTip is active. The current target.
         * This is usually the {@link #cfg-target}, but if the {@link #cfg-delegate} option
         * is used, it may be a child element of the main target.
         * @readonly
         */
        this.currentTarget = new Ext.dom.Fly();

        this.callParent([config]);

        this.attachTargetListeners();
    },

    getRefOwner: function() {
        var target = this.getTarget();
        return (target && target.isComponent) ? target : this.callParent();
    },

    updateAllowOver: function(allowOver) {
        var me = this;

        me.overListeners = Ext.destroy(me.overListeners);

        // Use the mouseleave and mouseenter events because we do not need delegation
        if (allowOver) {
            me.overListeners = me.el.on({
                mouseenter: 'onTipOver',
                mouseleave: 'onTipOut',
                scope: me,
                destroyable: true
            });
        }
    },

    applyTarget: function(target) {
        if (target) {
            if (!target.isComponent) {
                target = Ext.get(target.el || target);
            }
        }
        return target;
    },

    updateTarget: function(target, oldTarget) {
        var me = this;

        if (!me.isConfiguring) {
            me.targetListeners = Ext.destroy(me.targetListeners);
            me.attachTargetListeners();
        }
    },

    updateTrackMouse: function(trackMouse) {
        // If tracking mouse, allow mouse to enter the tooltip without triggering dismiss
        if (!this.getAnchor()) {
            this.setAllowOver(trackMouse);
        }
    },

    updateDisabled: function(disabled, oldDisabled) {
        var me = this,
            val;

        me.callParent([disabled, oldDisabled]);
        if (disabled) {
            me.clearTimers();
            me.hide();
            val = null;
        }
        // If we pass null, it won't attempt to attach listeners
        me.attachTargetListeners(val);
    },
    
    updateShowOnTap: function(showOnTap) {
        if (!this.isConfiguring) {
            this.attachTargetListeners();
        }
    },

    showBy: function(target, alignment, passedOptions) {
        var me = this,
            alignDelegate = me.getAlignDelegate();

        // If we are trackMouse: true, we will be asked to show by a pointer event
        if (target.isEvent) {
            me.alignToEvent(target);
        } else {
            if (target.isElement) {
                me.updateCurrentTarget(target.dom);
            } else if (target.nodeType) {
                me.updateCurrentTarget(target);
            }
            me.callParent([alignDelegate ? target.child(alignDelegate, true) : target, alignment || me.getAlign(), passedOptions]);
        }
    },
    
    onViewportResize: function() {
        var me = this;

        if (me.isVisible() && !me.lastShowWasPointer) {
            me.showByTarget(me.currentTarget);
        }
    },

    show: function() {
        var me = this,
            dismissDelay = me.getDismissDelay();

        // A programmatic show should align to the target
        if (!me.currentTarget.dom && (me.pointerEvent || me.getTarget())) {
            return me.showByTarget(me.getElFromTarget());
        }
        me.callParent();
        me.clearTimer('show');
        if (dismissDelay && me.getAutoHide()) {
            me.dismissTimer = Ext.defer(me.hide, dismissDelay, me);
        }
        me.toFront();
        Ext.getDoc().on('mousedown', me.onDocMouseDown, me);
    },

    hide: function() {
        var me = this;

        me.clearTimer('dismiss');
        me.callParent();
        me.lastHidden = new Date();
        me.updateCurrentTarget(null);
        Ext.getDoc().un('mousedown', me.onDocMouseDown, me);
    },

    doDestroy: function() {
        var me = this;

        me.clearTimers();
        me.setTarget(null);
        me.overListeners = null;
        me.callParent();
    },

    privates: {
        onDocMouseDown: function(e) {
            var me = this,
                delegate = me.getDelegate();

            if (e.within(me.el.dom)) {
                // A real touch event inside the tip is the equivalent of
                // mousing over the tip to keep it visible, so cancel the
                // dismiss timer.
                if (e.pointerType !== 'mouse' && me.getAllowOver()) {
                    me.clearTimer('dismiss');
                }
            }
            // Only respond to the mousedown if it's not on this tip, and it's not on a target.
            // If it's on a target, onTargetTap will handle it.
            else if (!me.getClosable()) {
                if (e.within(me.getElFromTarget()) && (!delegate || e.getTarget(delegate))) {
                    me.delayHide();
                } else {
                    me.disable();
                    me.enableTimer = Ext.defer(me.enable, 100, me);
                }
            }
        },

        forceTargetOver: function(e, newTarget) {
            this.pointerEvent = e;
            this.updateCurrentTarget(newTarget);
            this.handleTargetOver();
        },

        getConstrainRegion: function() {
            return this.callParent().adjust(5, -5, -5, 5);
        },

        onTargetOver: function(e) {
            var me = this,
                myTarget = me.getElFromTarget(),
                delegate = me.getDelegate(),
                currentTarget = me.currentTarget,
                myListeners = me.hasListeners,
                newTarget;

            if (me.getDisabled()) {
                return;
            }

            if (delegate) {
                // Moving inside a delegate
                if (currentTarget.contains(e.target)) {
                    return;
                }
                newTarget = e.getTarget(delegate);
                // Move inside a delegate with no currentTarget
                if (newTarget && Ext.fly(newTarget).contains(e.relatedTarget)) {
                    return;
                }
            }
            // Moved from outside the target
            else if (!myTarget.contains(e.relatedTarget)) {
                newTarget = myTarget.dom;
            }
            // Moving inside the target
            else {
                return;
            }

            // If pointer entered the target or a delegate child, then show.
            if (newTarget) {
                // If users need to see show events on target change, we must hide.
                if ((myListeners.beforeshow || myListeners.show) && me.isVisible()) {
                    me.hide();
                }

                me.forceTargetOver(e, newTarget);
            }
            // If over a non-delegate child, behave as in target out
            else if (currentTarget.dom) {
                me.handleTargetOut();
            }
        },

        handleTargetOver: function() {
            // Separated from onTargetOver so that subclasses can handle target over in any way.
            this.delayShow(this.currentTarget);
        },

        onTargetTap: function(e) {
            // On hybrid mouse/touch systems, we want to show the tip on touch, but
            // we don't want to show it if this is coming from a click event, because
            // the mouse is already hovered.
            if (e.pointerType !== 'mouse') {
                this.onTargetOver(e);
            }
        },

        onTargetOut: function(e) {
            // We have exited the current target
            if (this.currentTarget.dom && !this.currentTarget.contains(e.relatedTarget)) {
                this.handleTargetOut();
            }
        },

        handleTargetOut: function() {
            // Separated from onTargetOut so that subclasses can handle target out in any way.
            var me = this;

            if (me.showTimer) {
                me.clearTimer('show');
            }
            if (me.isVisible() && me.getAutoHide()) {
                me.delayHide();
            }
        },

        onTipOver: function() {
            this.clearTimer('hide');
            this.clearTimer('dismiss');
        },

        onTipOut: function() {
            this.handleTargetOut();
        },

        onMouseMove: function(e) {
            var me = this,
                dismissDelay = me.getDismissDelay();

            // Always update pointerEvent, so that if there's a delayed show
            // scheduled, it gets the latest pointer to align to.
            me.pointerEvent = e;
            if (me.isVisible() && me.currentTarget.contains(e.target)) {
                // If they move the mouse, restart the dismiss delay
                if (dismissDelay && me.getAutoHide() !== false) {
                    me.clearTimer('dismiss');
                    me.dismissTimer = Ext.defer(me.hide, dismissDelay, me);
                }

                if (me.getTrackMouse()) {
                    me.alignToEvent(e);
                }
             }
        },

        delayShow: function(target) {
            var me = this;

            me.clearTimer('hide');
            if (me.getHidden() && !me.showTimer) {
                // Allow rapid movement from delegate to delegate to show immediately
                if (me.getDelegate() && Ext.Date.getElapsed(me.lastHidden) < me.getQuickShowInterval()) {
                    me.showByTarget(target);
                } else {
                    // If a tap event triggered, do not wait. Show immediately.
                    me.showTimer = Ext.defer(me.showByTarget, me.pointerEvent.pointerType !== 'mouse' ? 0 : me.getShowDelay(), me, [target]);
                }
            }
            else if (!me.getHidden() && me.getAutoHide() !== false) {
                me.showByTarget(target);
            }
        },

        showByTarget: function(target) {
            var me = this,
                isTarget = me.getAnchorToTarget() && !me.getTrackMouse();

            me.lastShowWasPointer = !isTarget;
            // Show by the correct thing.
            // If trackMouse, or we are not anchored to the target, then it's the current pointer event.
            // Otherwise it's either the current target, or the alignDelegate within that.
            me.showBy(isTarget ? target : me.pointerEvent, me.getAlign(), {overlap: me.getTrackMouse() && !me.getAnchor()});
        },

        delayHide: function() {
            var me = this;

            if (!me.isHidden() && !me.hideTimer) {
                me.clearTimer('dismiss');
                me.hideTimer = Ext.defer(me.hide, me.getHideDelay(), me);
            }
        },

        alignToEvent: function(event) {
            var me = this,
                options = {
                    // Allow the "exclusion area", the zone of mouseOffset
                    // created as a Region around the mouse to overlap
                    // the tip position.
                    overlap: me.getTrackMouse() && !me.getAnchor()
                },
                mouseOffset = me.getMouseOffset(),
                target = event.getPoint().adjust(-mouseOffset[1], mouseOffset[0], mouseOffset[1], -mouseOffset[0]),
                anchor = me.getAnchor(),
                align;

            // The anchor must point to the mouse
            if (me.getAnchor()) {
                align = me.getAlign();
            }

            if (!align) {
                if (mouseOffset[0] > 0) {
                    if (mouseOffset[1] > 0) {
                        align = 'tl-br?';
                    } else {
                        align = 'bl-tr?';
                    }
                } else {
                    if (mouseOffset[1] > 0) {
                        align = 'tr-bl?';
                    } else {
                        align = 'br-tl?';
                    }
                }
            }

            if (me.isVisible()) {
                me.alignTo(target, align, options);
            } else {
                me.showBy(target, align, options);
            }
        },

        _timerNames: {},

        clearTimer: function (name) {
            var me = this,
                names = me._timerNames,
                propName = names[name] || (names[name] = name + 'Timer'),
                timer = me[propName];

            if (timer) {
                clearTimeout(timer);
                me[propName] = null;

                // We were going to show against the target, but now not.
                if (name === 'show' && me.isHidden()) {
                    me.updateCurrentTarget(null);
                }
            }
        },

        /**
         * @private
         */
        clearTimers: function() {
            var me = this;
            me.clearTimer('show');
            me.clearTimer('dismiss');
            me.clearTimer('hide');
            me.clearTimer('enable');
        },

        clipTo: function(clippingEl, sides) {
        // Override because we also need to clip the anchor
            var clippingRegion;

            // Allow a Region to be passed
            if (clippingEl.isRegion) {
                clippingRegion = clippingEl;
            } else {
                clippingRegion = (clippingEl.isComponent ? clippingEl.el : Ext.fly(clippingEl)).getConstrainRegion();
            }

            // this method is borrowed by the Widget override
            // @noOptimize.callParent
            this.callParent([clippingRegion, sides]);

            // Clip the anchor to the same bounds
            this.tipElement.clipTo(clippingRegion, sides);
        },

        updateCurrentTarget: function (dom) {
            var me = this,
                currentTarget = me.currentTarget,
                was = currentTarget.dom;

            currentTarget.attach(dom);

            if (!me.isConfiguring) {
                me.fireEvent('hovertarget', me, currentTarget, was);
            }
        },

        getElFromTarget: function() {
            var target = this.getTarget();
            if (target) {
                if (target.isComponent) {
                    target = target.element;
                }
            }
            return target;
        },

        attachTargetListeners: function(target) {
            var me = this,
                listeners;

            if (target !== null) {
                target = me.getElFromTarget();
            }

            me.targetListeners = Ext.destroy(me.targetListeners);

            if (target) {
                listeners = {
                    mouseover: 'onTargetOver',
                    mouseout: 'onTargetOut',
                    mousemove: 'onMouseMove',
                    scope: me,
                    destroyable: true
                };

                if (me.getShowOnTap()) {
                    listeners.tap = 'onTargetTap';
                }
                me.targetListeners = target.on(listeners);
            }
        }
    }
});
