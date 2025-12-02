/**
 * A mixin for groups of Focusable things (Components, Widgets, etc) that
 * should respond to arrow keys to navigate among the peers, but keep only
 * one of the peers tabbable by default (tabIndex=0)
 *
 * Some examples: Toolbars, Tab bars, Panel headers, Menus
 */
Ext.define('Ext.util.FocusableContainer', {
    extend: 'Ext.Mixin',
    
    requires: [
        'Ext.util.KeyNav'
    ],
    
    mixinConfig: {
        id: 'focusablecontainer',
        
        // The methods listed below are injected into the parent class
        // via special mixin mechanism, which makes them hard to override
        // in child classes. This is why these special methods are split,
        // and the injected wrapper will call the corresponding "doSomething"
        // method that is not special in any way and can be easily overridden.
        // The actual logic should go into the second part.
        before: {
            onAdd: 'onFocusableChildAdd',
            onRemove: 'onFocusableChildRemove',
            doDestroy: 'destroyFocusableContainer',
            onFocusEnter: 'onFocusEnter'
        },
        
        after: {
            afterRender: 'initFocusableContainer',
            onFocusLeave: 'onFocusLeave',
            afterShow: 'activateFocusableContainer'
        }
    },
    
    isFocusableContainer: true,
    
    /**
     * @cfg {Boolean} [enableFocusableContainer=true] Enable or disable
     * navigation with arrow keys for this FocusableContainer. This option may
     * be useful with nested FocusableContainers such as Grid column headers,
     * when only the root container should handle keyboard events.
     */
    enableFocusableContainer: true,
    
    /**
     * @cfg {Number} [activeChildTabIndex=0] DOM tabIndex attribute to set on the
     * active Focusable child of this container when using the "Roaming tabindex"
     * technique.
     */
    activeChildTabIndex: 0,
    
    /**
     * @cfg {Number} [inactiveChildTabIndex=-1] DOM tabIndex attribute to set on
     * inactive Focusable children of this container when using the "Roaming tabindex"
     * technique. This value rarely needs to be changed from its default.
     */
    inactiveChildTabIndex: -1,
    
    /**
     * @cfg {Boolean} allowFocusingDisabledChildren Set this to `true` to enable focusing
     * disabled children via keyboard.
     */
    
    /**
     * @property {String/Ext.dom.Element} [focusableContainerEl="el"] The name of the element
     * that FocusableContainer should bind its keyboard handler to. Similar to {@link #ariaEl},
     * this name is resolved to the {@link #Ext.dom.Element} instance after rendering.
     */
    focusableContainerEl: 'el',
    
    tabGuard: true,
    
    privates: {
        initFocusableContainer: function(clearChildren) {
            var items, i, len;
            
            // Allow nested containers to optionally disable
            // children containers' behavior
            if (this.enableFocusableContainer) {
                clearChildren = clearChildren != null ? clearChildren : true;
                this.doInitFocusableContainer(clearChildren);
            }
            
            // A FocusableContainer instance such as a toolbar could have decided
            // to opt out of FC behavior for some reason; it could have happened
            // after all or almost all child items have been initialized with
            // focusableContainer reference. We need to clean this up if we're not
            // going to behave like a FocusableContainer after all.
            else {
                items = this.getFocusables();
                
                for (i = 0, len = items.length; i < len; i++) {
                    items[i].focusableContainer = null;
                }
            }
        },
        
        doInitFocusableContainer: function(clearChildren) {
            var me = this,
                el = me.focusableContainerEl,
                child;
            
            // This flag allows post factum initialization of the focusable container,
            // i.e. when container was empty initially and then some tabbable children
            // were added and we need to clear their tabIndices after priming our own
            // tab guard elements' tabIndex.
            // This is useful for Panel and Window headers that might have tools
            // added dynamically.
            if (clearChildren) {
                me.clearFocusables();
            }
            
            // If we have no potentially focusable children, or all potentially focusable
            // children are presently disabled, don't init the container tab guards.
            // There is no point in tabbing into container when it can't shift focus
            // to a child.
            child = me.findNextFocusableChild({ step: 1, beforeRender: true });
            
            if (child) {
                // We set tabIndex on the focusable container tab guard elements so that
                // the user could tab into it; we catch guard focus events and focus
                // a child instead.
                me.activateFocusableContainer(true);
            }
            // Some FCs such as Grid header containers can be dynamically reconfigured
            // which might leave them with no focusable children. In this case we need
            // to remove tab stops from the empty FocusableContainer.
            else if (me.isFocusableContainerActive()) {
                me.activateFocusableContainer(false);
            }

            // Resolve property name to the actual Element instance if it hasn't been
            // resolved already; doInitFocusableContainer can be called more than once
            if (!el.isElement) {
                el = me.focusableContainerEl = me[el];
            }
            
            // Having keyNav doesn't hurt when container el is not focusable
            me.focusableKeyNav = me.createFocusableContainerKeyNav(el);
        },
        
        createFocusableContainerKeyNav: function(el) {
            var me = this;
            
            return new Ext.util.KeyNav(el, {
                eventName: 'keydown',
                ignoreInputFields: true,
                scope: me,

                tab: me.onFocusableContainerTabKey,
                enter: me.onFocusableContainerEnterKey,
                space: me.onFocusableContainerSpaceKey,
                up: me.onFocusableContainerUpKey,
                down: me.onFocusableContainerDownKey,
                left: me.onFocusableContainerLeftKey,
                right: me.onFocusableContainerRightKey
            });
        },
        
        destroyFocusableContainer: function() {
            if (this.enableFocusableContainer) {
                this.doDestroyFocusableContainer();
            }
        },
    
        doDestroyFocusableContainer: function() {
            this.focusableKeyNav = Ext.destroy(this.focusableKeyNav);
        },
        
        // Default FocusableContainer implies a flat list of focusable children
        getFocusables: function() {
            return this.items.items;
        },

        initDefaultFocusable: function() {
            var me = this,
                activeIndex = me.activeChildTabIndex,
                haveFocusable = false,
                items, item, i, len, tabIdx;

            items = me.getFocusables();
            len   = items.length;

            if (!len) {
                return;
            }

            // Check if any child Focusable is already active.
            // Note that we're not determining *which* focusable child
            // to focus here, ONLY that we have some focusables.
            for (i = 0; i < len; i++) {
                item = items[i];

                if (!item.disabled && item.isFocusable && item.isFocusable()) {
                    haveFocusable = true;
                    
                    // DO NOT return an item here! We want to fall through
                    // to findNextFocusableChild below.
                    break;
                }
            }

            if (!haveFocusable) {
                return;
            }

            item = me.findNextFocusableChild({
                items: items,
                step: true
            });

            if (item) {
                me.activateFocusable(item);
            }

            return item;
        },

        clearFocusables: function() {
            var me = this,
                items = me.getFocusables(),
                len = items.length,
                item, i;

            for (i = 0; i < len; i++) {
                item = items[i];

                if (item.focusable && !item.disabled) {
                    me.deactivateFocusable(item);
                }
            }
        },

        activateFocusable: function(child, /* optional */ newTabIndex) {
            var activeIndex = newTabIndex != null ? newTabIndex : this.activeChildTabIndex;

            child.setTabIndex(activeIndex);
        },

        deactivateFocusable: function(child, /* optional */ newTabIndex) {
            var inactiveIndex = newTabIndex != null ? newTabIndex : this.inactiveChildTabIndex;

            child.setTabIndex(inactiveIndex);
        },
        
        activateFocusableContainer: function(activate) {
            var me = this,
                beforeGuard = me.tabGuardBeforeEl,
                afterGuard = me.tabGuardAfterEl;
            
            // Some FocusableContainers do not use tab guards
            if (!me.rendered || me.destroying || me.destroyed || !beforeGuard || !afterGuard) {
                return;
            }
            
            activate = activate != null ? activate : true;
            
            if (activate) {
                beforeGuard.dom.setAttribute('tabIndex', me.activeChildTabIndex);
                afterGuard.dom.setAttribute('tabIndex', me.activeChildTabIndex);
            }
            else {
                beforeGuard.dom.removeAttribute('tabIndex');
                afterGuard.dom.removeAttribute('tabIndex');
            }
        },

        onFocusableContainerTabKey: function() {
            return true;
        },

        onFocusableContainerEnterKey: function() {
            return true;
        },

        onFocusableContainerSpaceKey: function() {
            return true;
        },

        onFocusableContainerUpKey: function(e) {
            // Default action is to scroll the nearest vertically scrollable container
            e.preventDefault();
            
            return this.moveChildFocus(e, false);
        },
        
        onFocusableContainerDownKey: function(e) {
            // Ditto
            e.preventDefault();
            
            return this.moveChildFocus(e, true);
        },
        
        onFocusableContainerLeftKey: function(e) {
            // Default action is to scroll the nearest horizontally scrollable container
            e.preventDefault();
            
            return this.moveChildFocus(e, false);
        },
        
        onFocusableContainerRightKey: function(e) {
            // Ditto
            e.preventDefault();
            
            return this.moveChildFocus(e, true);
        },
        
        getFocusableFromEvent: function(e) {
            var child = Ext.Component.fromElement(e.getTarget());
        
            //<debug>
            if (!child) {
                Ext.raise("No focusable child found for keyboard event!");
            }
            //</debug>
            
            return child;
        },
        
        moveChildFocus: function(e, forward) {
            var child = this.getFocusableFromEvent(e);
            
            return this.focusChild(child, forward, e);
        },
    
        focusChild: function(child, forward) {
            var nextChild = this.findNextFocusableChild({
                child: child,
                step: forward
            });
        
            if (nextChild) {
                nextChild.focus();
            }
        
            return nextChild;
        },
        
        findNextFocusableChild: function(options) {
            // This method is private, so options should always be provided
            var beforeRender = options.beforeRender,
                items, item, child, step, idx, i, len, allowDisabled;
        
            items = options.items || this.getFocusables();
            step  = options.step != null ? options.step : 1;
            child = options.child;
            
            // Some containers such as Menus need to support arrowing over disabled children
            allowDisabled = !!this.allowFocusingDisabledChildren;
            
            // If the child is null or undefined, idx will be -1.
            // The loop below will account for that, trying to find
            // the first focusable child from either end (depending on step)
            idx = Ext.Array.indexOf(items, child);
            
            // It's often easier to pass a boolean for 1/-1
            step = step === true ? 1 : step === false ? -1 : step;
        
            len = items.length;
            i   = step > 0 ? (idx < len ? idx + step : 0) : (idx > 0 ? idx + step : len - 1);
        
            for (;; i += step) {
                // We're looking for the first or last focusable child
                // and we've reached the end of the items, so punt
                if (idx < 0 && (i >= len || i < 0)) {
                    return null;
                }
                
                // Loop over forward
                else if (i >= len) {
                    i = -1; // Iterator will increase it once more
                    continue;
                }
                
                // Loop over backward
                else if (i < 0) {
                    i = len;
                    continue;
                }
                
                // Looped to the same item, give up
                else if (i === idx) {
                    return null;
                }
                
                item = items[i];
                
                if (!item || !item.focusable || (item.disabled && !allowDisabled)) {
                    continue;
                }
                
                // This loop can be run either at FocusableContainer init time,
                // or later when we need to navigate upon pressing an arrow key.
                // When we're navigating, we have to know exactly if the child is
                // focusable or not, hence only rendered children will make the cut.
                // At the init time item.isFocusable() may return false incorrectly
                // just because the item has not been rendered yet and its focusEl
                // is not defined, so we don't bother to call isFocusable and return
                // the first potentially focusable child.
                if (beforeRender || (item.isFocusable && item.isFocusable())) {
                    return item;
                }
            }
        
            return null;
        },
        
        isFocusableContainerActive: function() {
            var me = this,
                isActive = false,
                beforeGuard = me.tabGuardBeforeEl,
                el = me.focusableContainerEl,
                child, focusEl;
            
            // Most FocusableContainers use two tab guards; we always set their tabIndex
            // synchronously as a pair so no point in checking both.
            if (beforeGuard && beforeGuard.isTabbable && beforeGuard.isTabbable()) {
                isActive = true;
            }
            // Some FocusableContainers like Menus do not use tab guards, they make
            // focusableContainerEl tabbable instead.
            else if (el.isTabbable && el.isTabbable()) {
                isActive = true;
            }
            else {
                child = me.lastFocusedChild;
                focusEl = child && child.getFocusEl && child.getFocusEl();
                
                if (focusEl && focusEl.isTabbable && focusEl.isTabbable()) {
                    isActive = true;
                }
            }
            
            return isActive;
        },

        onFocusEnter: function(e) {
            var me = this,
                target = e.toComponent,
                child;
            
            if (!me.enableFocusableContainer || me.destroying || me.destroyed) {
                return null;
            }
            
            // Some FocusableContainers such as Menus are focusable by themselves,
            // and it is possible that either the container gained focus or one
            // of its tab guards gained focus. In either case we need to focus
            // a child instead, if such a child can be found. However if a child
            // is not found we don't want to disturb focus state by deactivating
            // tab guards and potentially throwing focus to the document body.
            if (target === me) {
                child = me.initDefaultFocusable();
                
                if (child) {
                    child.focus();
                    me.activateFocusableContainer(false);
                }
            }
            // One of the children got focused, safe to deactivate tab guards.
            else {
                me.activateFocusableContainer(false);
            }
            
            return target;
        },

        onFocusLeave: function(e) {
            var me = this,
                lastFocused = me.lastFocusedChild;
            
            if (!me.enableFocusableContainer || me.destroying || me.destroyed) {
                return;
            }

            me.clearFocusables();

            if (lastFocused && !lastFocused.disabled) {
                me.activateFocusable(lastFocused);
            }
            else {
                me.activateFocusableContainer(true);
            }
        },
        
        beforeFocusableChildBlur: Ext.privateFn,
        afterFocusableChildBlur: Ext.privateFn,
    
        beforeFocusableChildFocus: function(child) {
            var me = this;
            
            if (!me.enableFocusableContainer || me.destroying || me.destroyed) {
                return;
            }
            
            me.clearFocusables();
            me.activateFocusable(child);
            
            if (child.needArrowKeys) {
                me.guardFocusableChild(child);
            }
        },
        
        guardFocusableChild: function(child) {
            var me = this,
                index = me.activeChildTabIndex,
                guard;
            
            guard = me.findNextFocusableChild({ child: child, step: -1 });
            
            if (guard) {
                guard.setTabIndex(index);
            }
            
            guard = me.findNextFocusableChild({ child: child, step: 1 });
            
            if (guard) {
                guard.setTabIndex(index);
            }
        },
    
        afterFocusableChildFocus: function(child) {
            var me = this;
            
            if (!me.enableFocusableContainer || me.destroying || me.destroyed) {
                return;
            }
            
            me.lastFocusedChild = child;
        },
        
        onFocusableChildAdd: function(child) {
            if (this.enableFocusableContainer) {
                return this.doFocusableChildAdd(child);
            }
        },
        
        doFocusableChildAdd: function(child) {
            var me = this;
            
            if (child.focusable) {
                child.focusableContainer = me;

                // Some FocusableContainers such as Grid header containers and Tab bars
                // need to be inactive and out of tab order when containing no children.
                // When at least one child is added we need to activate the tab guards;
                // we don't want to do that while bulk adding is done in initItems()
                // because of performance reasons.
                if (!me.$initingItems && !me.isFocusableContainerActive()) {
                    me.activateFocusableContainer(true);
                }
            }
        },
        
        onFocusableChildRemove: function(child) {
            if (this.enableFocusableContainer) {
                return this.doFocusableChildRemove(child);
            }
            
            child.focusableContainer = null;
        },
    
        doFocusableChildRemove: function(child) {
            var me = this;
            
            // If the focused child is being removed, we reactivate the FocusableContainer
            // so that it returns to the tabbing order. For example, locking a grid column
            // must return the owning HeaderContainer to tabbability.
            if (child === me.lastFocusedChild) {
                me.lastFocusedChild = null;
                me.activateFocusableContainer(true);
            }
            
            // If we have removed the last child we need to deactivate
            // tab guards so that our FocusableContainer won't remain
            // in tab order.
            child = me.findNextFocusableChild({ step: 1, beforeRender: true });
            
            if (!child) {
                me.activateFocusableContainer(false);
            }
        },
        
        beforeFocusableChildEnable: Ext.privateFn,
        
        onFocusableChildEnable: function(child) {
            var me = this;
            
            if (!me.enableFocusableContainer || me.destroying || me.destroyed) {
                return;
            }
            
            // Some Components like Buttons do not render tabIndex attribute
            // when they start their lifecycle disabled, or remove tabIndex
            // if they get disabled later. Subsequently, such Components will
            // reset their tabIndex to default configured value upon enabling.
            // We don't want these children to be tabbable so we reset their
            // tabIndex yet again, unless this child is the last focused one.
            if (child !== me.lastFocusedChild) {
                me.deactivateFocusable(child);
                
                if (!me.isFocusableContainerActive()) {
                    me.activateFocusableContainer(true);
                }
            }
        },
        
        beforeFocusableChildDisable: function(child) {
            var me = this,
                nextTarget;
            
            if (!me.enableFocusableContainer || me.destroying || me.destroyed) {
                return;
            }
            
            // When currently focused child is about to be disabled,
            // it may lose the focus as well. For example, Buttons
            // will remove tabIndex attribute upon disabling, which
            // in turn will throw focus to the document body and cause
            // onFocusLeave to fire on the FocusableContainer.
            // We're focusing the next sibling to prevent that.
            if (child.hasFocus) {
                nextTarget = me.findNextFocusableChild({ child: child }) ||
                             child.findFocusTarget();
                
                // Note that it is entirely possible not to find the nextTarget,
                // e.g. when we're disabling the last button in a toolbar rendered
                // directly into document body. We don't have a good way to handle
                // such cases at present.
                if (nextTarget) {
                    nextTarget.focus();
                }
            }
        },
        
        onFocusableChildDisable: function(child) {
            var me = this,
                lastFocused = me.lastFocusedChild,
                firstFocusableChild;
            
            if (!me.enableFocusableContainer || me.destroying || me.destroyed) {
                return;
            }
            
            // If the disabled child was the last focused item of this
            // FocusableContainer, we have to reset the tabbability of
            // our container tab guards.
            if (child === lastFocused) {
                me.activateFocusableContainer(true);
            }
            
            // It is also possible that the disabled child was the last
            // focusable child of this container, in which case we need
            // to make the container untabbable.
            firstFocusableChild = me.findNextFocusableChild({ step: 1 });
            
            if (!firstFocusableChild) {
                me.activateFocusableContainer(false);
            }
        },
        
        beforeFocusableChildHide: function(child) {
            return this.beforeFocusableChildDisable(child);
        },
        
        onFocusableChildHide: function(child) {
            return this.onFocusableChildDisable(child);
        },
        
        beforeFocusableChildShow: function(child) {
            return this.beforeFocusableChildEnable(child);
        },
        
        onFocusableChildShow: function(child) {
            return this.onFocusableChildEnable(child);
        },

        // TODO
        onFocusableChildMasked: Ext.privateFn,
        onFocusableChildDestroy: Ext.privateFn,
        onFocusableChildUpdate: Ext.privateFn
    }
});
