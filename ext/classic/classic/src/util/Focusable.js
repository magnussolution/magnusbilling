/**
 * A mixin for individually focusable things (Components, Widgets, etc)
 */
Ext.define('Ext.util.Focusable', {
    mixinId: 'focusable',

    /**
     * @property {Boolean} hasFocus
     * `true` if this component has focus.
     * @private
     */
    hasFocus: false,
    
    /**
     * @property {Boolean} focusable
     * @readonly
     *
     * `true` for interactive Components, `false` for static Components.
     * For Containers, this property reflects interactiveness of the
     * Container itself, not its children. See {@link #isFocusable}.
     *
     * **Note:** Plain components are static, so not focusable.
     */
    focusable: false,
    
    /**
     * @property {Ext.dom.Element} focusEl The component's focusEl.
     * Available after rendering.
     * @private
     */
    
    /**
     * @cfg {Number} [tabIndex] DOM tabIndex attribute for this Focusable's
     * focusEl.
     */
    
    /**
     * @cfg {String} [focusCls='x-focus'] CSS class that will be added to focused
     * Component, and removed when Component blurs.
     */
    focusCls: 'focus',
    
    /**
     * @event focus
     * Fires when this Component receives focus.
     * @param {Ext.Component} this
     * @param {Ext.event.Event} event The focus event.
     */

    /**
     * @event blur
     * Fires when this Component loses focus.
     * @param {Ext.Component} this
     * @param {Ext.event.Event} event The blur event.
     */
    
    /**
     * @event focusenter
     * Fires when focus enters this Component's hierarchy.
     * @param {Ext.Component} this
     * @param {Ext.event.Event} event The focusenter event.
     */
    
    /**
     * @event focusleave
     * Fires when focus leaves this Component's hierarchy.
     * @param {Ext.Component} this
     * @param {Ext.event.Event} event The focusleave event.
     */
    
    /**
     * @method initFocusable
     * Template method to do any Focusable related initialization that
     * does not involve event listeners creation.
     * @protected
     */
    initFocusable: Ext.emptyFn,
    
    /**
     * Template method to do any event listener initialization for a Focusable.
     * This generally happens after the focusEl is available.
     * @protected
     */
    initFocusableEvents: function() {
        // If *not* naturally focusable, then we look for the tabIndex property
        // to be defined which indicates that the element should be made focusable.
        this.initFocusableElement();
    },
    
    /**
     * Returns the focus styling holder element associated with this Focusable.
     * By default it is the same element as {@link #getFocusEl getFocusEl}.
     *
     * @return {Ext.Element} The focus styling element.
     * @protected
     */
    getFocusClsEl: function() {
        return this.getFocusEl();
    },

    /**
     * Returns the focus holder element associated with this Focusable. At the
     * level of the Focusable base, this function returns `this.el` (or for Widgets,
     * `this.element`).
     *
     * Subclasses with embedded focusable elements (such as Window, Field and Button)
     * should override this for use by {@link Ext.util.Focusable#method-focus focus}
     * method.
     *
     * @return {Ext.Element}
     * @protected
     */
    getFocusEl: function() {
        return this.element || this.el;
    },

    destroyFocusable: function() {
        var me = this;
        
        Ext.destroy(me.focusListeners);
        
        me.focusListeners = me.focusEnterEvent = me.focusTask = null;
        me.focusEl = me.ariaEl = null;
    },

    enableFocusable: Ext.emptyFn,

    disableFocusable: function() {
        var me = this,
            focusTarget,
            focusCls = me.focusCls,
            focusClsEl;

        // If this is disabled while focused, by default, focus would return to document.body.
        // This must be avoided, both for the convenience of keyboard users, and also
        // for when focus is tracked within a tree, such as below an expanded ComboBox.
        if (me.hasFocus) {
            focusTarget = me.findFocusTarget();
            if (focusTarget) {
                focusTarget.focus();
            }
        }
        focusClsEl = me.getFocusClsEl();
        
        if (focusCls && focusClsEl) {
            focusClsEl.removeCls(me.removeClsWithUI(focusCls, true));
        }
    },
    
    /**
     * Determine if this Focusable can receive focus at this time.
     *
     * Note that Containers can be non-focusable themselves while delegating
     * focus treatment to a child Component; see
     * {@link Ext.container.Container #defaultFocus} for more information.
     *
     * @param {Boolean} [deep=false] Optionally determine if the container itself
     * is focusable, or if container's focus is delegated to a child component
     * and that child is focusable.
     *
     * @return {Boolean} True if component is focusable, false if not.
     */
    isFocusable: function(deep) {
        var me = this,
            focusEl;
        
        if (!me.focusable && (!me.isContainer || !deep)) {
            return false;
        }
        
        focusEl = me.getFocusEl();
        
        if (focusEl && me.canFocus()) {

            // getFocusEl might return a Component if a Container wishes to
            // delegate focus to a descendant. Both Component and Element
            // implement isFocusable, so always ask that.
            return focusEl.isFocusable(deep);
        }
        
        return false;
    },

    canFocus: function(skipVisibility, includeFocusTarget) {
        var me = this,
            canFocus;
        
        // Containers may have focusable children while being non-focusable
        // themselves; this is why we only account for me.focusable for
        // ordinary Components here and below.
        canFocus = (me.isContainer || me.focusable) && me.rendered &&
                   !me.destroying && !me.destroyed && !me.disabled &&
                   (skipVisibility || me.isVisible(true));
        
        return canFocus || (includeFocusTarget && !!me.findFocusTarget());
    },
    
    /**
     * Try to focus this component.
     *
     * If this component is disabled, a close relation will be targeted for focus instead
     * to keep focus localized for keyboard users.
     * @param {Mixed} [selectText] If applicable, `true` to also select all the text in this component, or an array consisting of start and end (defaults to start) position of selection.
     * @param {Boolean/Number} [delay] Delay the focus this number of milliseconds (true for 10 milliseconds).
     * @param {Function} [callback] Only needed if the `delay` parameter is used. A function to call upon focus.
     * @param {Function} [scope] Only needed if the `delay` parameter is used. The scope (`this` reference) in which to execute the callback.
     * @return {Ext.Component} The focused Component. Usually `this` Component. Some Containers may
     * delegate focus to a descendant Component ({@link Ext.window.Window Window}s can do this through their
     * {@link Ext.window.Window#defaultFocus defaultFocus} config option. If this component is disabled, a closely
     * related component will be focused and that will be returned.
     */
    focus: function(selectText, delay, callback, scope) {
        var me = this,
            focusTarget, focusElDom, containerScrollTop;

        if ((!me.focusable && !me.isContainer) || me.destroyed || me.destroying) {
            return;
        }

        // If delay is wanted, queue a call to this function.
        if (delay) {
            me.getFocusTask().delay(Ext.isNumber(delay) ? delay : 10, me.focus, me, [selectText, false, callback, scope]);
            return me;
        }

        // An immediate focus call must cancel any outstanding delayed focus calls.
        me.cancelFocus();
        
        // Assignment in conditional here to avoid calling getFocusEl()
        // if me.canFocus() returns false
        if (me.canFocus()) {
            if (focusTarget = me.getFocusEl()) {

                // getFocusEl might return a Component if a Container wishes to delegate focus to a
                // descendant via its defaultFocus configuration.
                if (focusTarget.isComponent) {
                    return focusTarget.focus(selectText, delay, callback, scope);
                }

                focusElDom = focusTarget.dom;

                // If it was an Element with a dom property
                if (focusElDom) {
                    if (me.floating) {
                        containerScrollTop = me.container.dom.scrollTop;
                    }

                    // Focus the element.
                    // The Ext.event.publisher.Focus publisher listens for global focus changes and
                    // The ComponentManager responds by invoking the onFocusEnter and onFocusLeave methods
                    // of the components involved.
                    focusTarget.focus();

                    if (selectText) {
                        if (Ext.isArray(selectText)) {
                            if (me.selectText) {
                                me.selectText.apply(me, selectText);
                            }
                        } else if (focusElDom.select) {
                            // This method both focuses and selects the element.
                            focusElDom.select();
                        } else if (me.selectText) {
                            me.selectText();
                        }
                    }

                    // Call the callback when focus is done
                    Ext.callback(callback, scope);
                }

                // Focusing a floating Component brings it to the front of its stack.
                // this is performed by its zIndexManager. Pass preventFocus true to avoid recursion.
                if (me.floating) {
                    if (containerScrollTop !== undefined) {
                        me.container.dom.scrollTop = containerScrollTop;
                    }
                }
            }
        }
        else {
            // If we are asked to focus while not able to focus though disablement/invisibility etc,
            // focus may revert to document.body if the current focus is being hidden or destroyed.
            // This must be avoided, both for the convenience of keyboard users, and also
            // for when focus is tracked within a tree, such as below an expanded ComboBox.
            focusTarget = me.findFocusTarget();
            
            if (focusTarget) {
                return focusTarget.focus(selectText, delay, callback, scope);
            }
        }

        return me;
    },

    /**
     * Cancel any deferred focus on this component
     * @protected
     */
    cancelFocus: function() {
        var task = this.getFocusTask();

        if (task) {
            task.cancel();
        }
    },
    
    /**
     * @method
     * Template method to do any pre-blur processing.
     * @protected
     * @param {Ext.event.Event} e The event object
     */
    beforeBlur: Ext.emptyFn,

    /**
     * @private
     */
    onBlur: function(e) {
        var me = this,
            container = me.focusableContainer,
            focusCls = me.focusCls,
            focusClsEl;
        
        if (!me.focusable || me.destroying) {
            return;
        }

        me.hasFocus = false;

        me.beforeBlur(e);
        
        if (container) {
            container.beforeFocusableChildBlur(me, e);
        }
        
        focusClsEl = me.getFocusClsEl();
        
        if (focusCls && focusClsEl) {
            focusClsEl.removeCls(me.removeClsWithUI(focusCls, true));
        }
        
        me.fireEvent('blur', me, e);
        me.postBlur(e);
        
        if (container) {
            container.afterFocusableChildBlur(me, e);
        }
    },

    /**
     * @method
     * Template method to do any post-blur processing.
     * @protected
     * @param {Ext.event.Event} e The event object
     */
    postBlur: Ext.emptyFn,

    /**
     * @method
     * Template method to do any pre-focus processing.
     * @protected
     * @param {Ext.event.Event} e The event object
     */
    beforeFocus: Ext.emptyFn,

    /**
     * @private
     */
    onFocus: function(e) {
        var me = this,
            container = me.focusableContainer,
            focusCls = me.focusCls,
            focusClsEl;
        
        if (!me.focusable) {
            return;
        }

        if (me.canFocus()) {
            me.beforeFocus(e);
            
            if (container) {
                container.beforeFocusableChildFocus(me, e);
            }
            
            focusClsEl = me.getFocusClsEl();
            
            if (focusCls && focusClsEl) {
                focusClsEl.addCls(me.addClsWithUI(focusCls, true));
            }
            
            if (!me.hasFocus) {
                me.hasFocus = true;
                me.fireEvent('focus', me, e);
            }
            
            me.postFocus(e);
            
            if (container) {
                container.afterFocusableChildFocus(me, e);
            }
        }
    },
    
    /**
     * @method
     * Template method to do any post-focus processing.
     * @protected
     * @param {Ext.event.Event} e The event object
     */
    postFocus: Ext.emptyFn,
    
    /**
     * Return the actual tabIndex for this Focusable.
     *
     * @return {Number} tabIndex attribute value
     */
    getTabIndex: function() {
        var me = this,
            el, index;
        
        if (!me.focusable) {
            return;
        }
        
        el = me.rendered && me.getFocusEl();
        
        if (el) {
            // getFocusEl may return a child Component
            if (el.isComponent) {
                index = el.getTabIndex();
            }
            
            // We can't query el.dom.tabIndex because IE8 will return 0
            // when tabIndex attribute is not present.
            else if (el.isElement) {
                index = el.getAttribute('tabIndex');
            }
            
            // A component can be configured with el: '#id' to look up
            // its main element from the DOM rather than render it; in
            // such case getTabIndex() may happen to be called before
            // said lookup has happened; indeterminate result follows.
            else {
                return;
            }
            
            me.tabIndex = index;
        }
        else {
            index = me.tabIndex;
        }
        
        return index - 0; // getAttribute returns a string
    },
    
    /**
     * Set the tabIndex property for this Focusable. If the focusEl
     * is available, set tabIndex attribute on it, too.
     *
     * @param {Number} newTabIndex new tabIndex to set
     */
    setTabIndex: function(newTabIndex, /* private */ focusEl) {
        var me = this,
            el;
        
        if (!me.focusable) {
            return;
        }
        
        me.tabIndex = newTabIndex;
        
        if (!me.rendered) {
            return;
        }
        
        el = focusEl || me.getFocusEl();
        
        if (el) {
            // getFocusEl may return a child Component
            if (el.isComponent) {
                el.setTabIndex(newTabIndex);
            }
            
            // Or if a component is configured with el: '#id', it may
            // still be a string by the time setTabIndex is called from
            // FocusableContainer.
            else if (el.isElement) {
                el.set({ tabIndex: newTabIndex });
            }
        }
    },
    
    /**
     * @template
     * @protected
     * Called when focus enters this Component's hierarchy
     * @param {Object} e
     * @param {Ext.event.Event} e.event The underlying DOM event.
     * @param {HTMLElement} e.target The element gaining focus.
     * @param {HTMLElement} e.relatedTarget The element losing focus.
     * @param {Ext.Component} e.toComponent The Component gaining focus.
     * @param {Ext.Component} e.fromComponent The Component losing focus.
     */
    onFocusEnter: function(e) {
        var me = this;
        
        if (me.destroying || me.destroyed) {
            return;
        }

        // Focusing must being a floating component to the front.
        // Only bring to front if this component is not the manager's
        // topmost component (may be a result of focusOnToFront).
        if (me.floating && me !== me.zIndexManager.getActive()) {
            me.toFront(true);
        }

        // Save all information about how we received focus so that
        // we can do appropriate things when asked to revertFocus
        me.focusEnterEvent = e;
        me.containsFocus = true;
        me.fireEvent('focusenter', me, e);
    },

    /**
     * @template
     * @protected
     * Called when focus exits from this Component's hierarchy
     * @param {Ext.event.Event} e
     * @param {Ext.event.Event} e.event The underlying DOM event.
     * @param {HTMLElement} e.target The element gaining focus.
     * @param {HTMLElement} e.relatedTarget The element losing focus.
     * @param {Ext.Component} e.toComponent The Component gaining focus.
     * @param {Ext.Component} e.fromComponent The Component losing focus.
     */
    onFocusLeave: function(e) {
        var me = this;

        if (me.destroying || me.destroyed) {
            return;
        }

        me.focusEnterEvent = null;
        me.containsFocus = false;
        me.fireEvent('focusleave', me, e);
    },

    privates: {
        
        /**
         * Returns focus to the Component or element found in the cached
         * focusEnterEvent.
         *
         * Usually called by onHide.
         *
         * @private
         */
        revertFocus: function() {
            var me = this,
                focusEvent = me.focusEnterEvent,
                focusTarget;
                        
            // Before hiding, restore focus to what was focused when we were shown
            // unless we're explicitly told not to (think Panel collapse/expand).
            if (me.preventRefocus || !me.el.contains(Ext.Element.getActiveElement()) || !focusEvent) {
                return;
            }
            
            // Preferred focus target is the actual element from which focus entered this component.
            // It will be up to its encapsulating component to handle this in an appropriate way.
            // For example, a grid, upon having focus pushed to a certain cell will set its
            // navigation position to that cell and highlight it as focused.
            // Likewise an input field must handle its field acquiring focus.
            focusTarget = focusEvent && focusEvent.relatedTarget;

            // If the element is in the document and focusable, then we're good. The owning component will handle it.
            if (Ext.getDoc().contains(focusTarget) && Ext.fly(focusTarget).isFocusable()) {
                focusTarget.focus();
            }

            // If the element has gone, or is hidden, we will have to rely on the intelligent focus diversion
            // of components to send focus back to somewhere that is least surprising for the user.
            else if (focusEvent.fromComponent && focusEvent.fromComponent.focus) {
                focusEvent.fromComponent.focus();
            }
        },

        /**
         * Finds an alternate Component to focus if this Component is disabled while focused, or
         * focused while disabled, or otherwise unable to focus.
         * 
         * In both cases, focus must not be lost to document.body, but must move to an intuitively
         * connectible Component, either a sibling, or uncle or nephew.
         *
         * This is both for the convenience of keyboard users, and also for when focus is tracked
         * within a Component tree such as for ComboBoxes and their dropdowns.
         *
         * For example, a ComboBox with a PagingToolbar in is BoundList. If the "Next Page"
         * button is hit, the LoadMask shows and focuses, the next page is the last page, so
         * the "Next Page" button is disabled. When the LoadMask hides, it attempt to focus the
         * last focused Component which is the disabled "Next Page" button. In this situation,
         * focus should move to a sibling within the PagingToolbar.
         * 
         * @return {Ext.Component} A closely related focusable Component to which focus can move.
         * @private
         */
        findFocusTarget: function() {
            var me = this,
                owner,
                focusTargets,
                focusIndex;

            for (owner = me.up(':visible(true):not([disabled]):not([destroying])'); owner; owner = owner.up(':visible(true):not([disabled]):not([destroying])')) {
                // Use CQ to find a target that is fully focusable (:canfocus, NOT the theoretical :focusable)
                // Cannot use :focusable(true) because that consults findFocusTarget and would cause infinite recursion.
                // Exclude the component which currently has focus.
                // Cannot use owner.child() because the parent might not be a Container.
                // Non-Container Components may still have ownership relationships with
                // other Components. eg: BoundList with PagingToolbar
                focusTargets = Ext.ComponentQuery.query(':canfocus()', owner);
                if (focusTargets.length) {
                    focusIndex = Ext.Array.indexOf(focusTargets, Ext.ComponentManager.getActiveComponent());

                    // Return the next focusable, or the previous focusable, or the first focusable
                    return focusTargets[focusIndex + 1] || focusTargets[focusIndex - 1]
                        || focusTargets[0];
                }

                // We found no focusable siblings in our owner, but the owner may itself be focusable,
                // it is not always a Container - could be the owning Field of a BoundList.
                if (owner.isFocusable && owner.isFocusable()) {
                    return owner;
                }
            }
        },
    
        /**
         * Sets up the focus listener on this Component's {@link #getFocusEl focusEl} if it has one.
         *
         * Form Components which must implicitly participate in tabbing order usually have a naturally
         * focusable element as their {@link #getFocusEl focusEl}, and it is the DOM event of that
         * receiving focus which drives the Component's `onFocus` handling, and the DOM event of it
         * being blurred which drives the `onBlur` handling.
         * @private
         */
        initFocusableElement: function() {
            var me = this,
                tabIndex = me.tabIndex,
                focusEl = me.getFocusEl();

            if (focusEl && !focusEl.isComponent) {
                // Cache focusEl as a property for speedier lookups
                me.focusEl = focusEl;
                
                // focusEl is not available until after rendering, and rendering tabIndex
                // into focusEl is not always convenient. So we apply it here if Component's
                // tabIndex property is set and Component is otherwise focusable.
                if (tabIndex != null && me.canFocus(true)) {
                    me.setTabIndex(tabIndex, focusEl);
                }
                
                // This attribute is a shortcut to look up a Component by its Elements
                // It only makes sense on focusable elements, so we set it here
                focusEl.dom.setAttribute('data-componentid', me.id);
            }
        },

        /**
         * @private
         */
        getFocusTask: function() {
            if (!this.focusTask) {
                this.focusTask = Ext.focusTask;
            }
            
            return this.focusTask;
        },
        
        /**
         * @private
         */
        handleFocusEvent: function(e) {
            var event;
            
            // handleFocusEvent and handleBlurEvent are called by ComponentManager
            // passing the normalized element event that might or might not cause
            // component focus or blur. The component itself makes the decision
            // whether focus/blur happens or not. This is necessary for components
            // that might have more than one focusable element within the component's
            // DOM structure, like Ext.button.Split.
            if (this.isFocusing(e)) {
                event = new Ext.event.Event(e.event);
                event.type = 'focus';
                event.relatedTarget = e.fromElement;
                event.target = e.toElement;
                
                this.onFocus(event);
            }
        },
        
        /**
         * @private
         */
        handleBlurEvent: function(e) {
            var event;
            
            if (this.isBlurring(e)) {
                event = new Ext.event.Event(e.event);
                event.type = 'blur';
                event.target = e.fromElement;
                event.relatedTarget = e.toElement;
                
                this.onBlur(event);
            }
        },
        
        /**
         * @private
         */
        isFocusing: function(e) {
            var focusEl;
            
            if (this.focusable) {
                focusEl = this.getFocusEl();
            
                if (focusEl) {
                    if (focusEl.isComponent) {
                        return focusEl.isFocusing(e);
                    }
                    else {
                        return e.toElement === focusEl.dom && e.fromElement !== e.toElement;
                    }
                }
            }
            
            return false;
        },
        
        /**
         * @private
         */
        isBlurring: function(e) {
            var focusEl;
            
            if (this.focusable) {
                focusEl = this.getFocusEl();
            
                if (focusEl) {
                    if (focusEl.isComponent) {
                        return focusEl.isBlurring(e);
                    }
                    else {
                        return e.fromElement === focusEl.dom && e.fromElement !== e.toElement;
                    }
                }
            }
            
            return false;
        },
        
        /**
         * @private
         */
        blur: function() {
            var me = this,
                focusEl;
            
            if (!me.focusable || !me.canFocus()) {
                return;
            }
            
            focusEl = me.getFocusEl();

            if (focusEl) {
                me.blurring = true;
                focusEl.blur();
                delete me.blurring;
            }
            
            return me;
        },
        
        disableTabbing: function() {
            var me = this,
                el = me.el,
                focusEl;
            
            if (el) {
                el.saveTabbableState();
            }
            
            focusEl = me.getFocusEl();
            
            if (focusEl) {
                // focusEl may happen to be a focus delegate for a container
                if (focusEl.isComponent) {
                    focusEl.disableTabbing();
                }
                
                // Alternatively focusEl may happen to be outside of the main el,
                // or else it can be a string reference to an element that
                // has not been resolved yet
                else if (focusEl.isElement && el && !el.contains(focusEl)) {
                    focusEl.saveTabbableState();
                }
            }
        },
        
        enableTabbing: function() {
            var me = this,
                el = me.el,
                focusEl;
            
            focusEl = me.getFocusEl();
            
            if (focusEl) {
                if (focusEl.isComponent) {
                    focusEl.enableTabbing();
                }
                else if (focusEl.isElement && el && !el.contains(focusEl)) {
                    focusEl.restoreTabbableState();
                }
            }
            
            if (el) {
                el.restoreTabbableState();
            }
        },
        
        updateMaskState: function(state, mask) {
            var me = this,
                ariaEl = me.ariaEl.dom,
                value;
            
            if (state) {
                me.disableTabbing();
                me.setMasked(true);
                
                if (ariaEl) {
                    ariaEl.setAttribute('aria-busy', 'true');
                    
                    // It is possible that ariaEl already has aria-describedby attribute;
                    // in that case we need to save it to restore later.
                    value = ariaEl.getAttribute('aria-describedby');
                    
                    if (value) {
                        me._savedAriaDescribedBy = value;
                    }
                    
                    ariaEl.setAttribute('aria-describedby', mask.ariaEl.id);
                }
            }
            else {
                me.enableTabbing();
                me.setMasked(false);
                
                if (ariaEl) {
                    ariaEl.removeAttribute('aria-busy');
                    
                    value = ariaEl.getAttribute('aria-describedby');
                    ariaEl.removeAttribute('aria-describedby');
                    
                    if (value === mask.ariaEl.id && me._savedAriaDescribedBy) {
                        ariaEl.setAttribute('aria-describedby', me._savedAriaDescribedBy);
                        delete me._savedAriaDescribedBy;
                    }
                }
            }
        }
    }
},

function() {
    // One global DelayedTask to assign focus
    // So that the last focus call wins.
    if (!Ext.focusTask) {
        Ext.focusTask = new Ext.util.DelayedTask();
    }
});
