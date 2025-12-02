/**
 * A Container has all of the abilities of {@link Ext.Component Component}, but lets you nest other Components inside
 * it. Applications are made up of lots of components, usually nested inside one another. Containers allow you to
 * render and arrange child Components inside them. Most apps have a single top-level Container called a Viewport,
 * which takes up the entire screen. Inside of this are child components, for example in a mail app the Viewport
 * Container's two children might be a message List and an email preview pane.
 *
 * Containers give the following extra functionality:
 *
 * - Adding child Components at instantiation and run time
 * - Removing child Components
 * - Specifying a Layout
 *
 * Layouts determine how the child Components should be laid out on the screen. In our mail app example we'd use an
 * HBox layout so that we can pin the email list to the left hand edge of the screen and allow the preview pane to
 * occupy the rest. There are several layouts, each of which help you achieve your desired
 * application structure.
 *
 * ## Adding Components to Containers
 *
 * As we mentioned above, Containers are special Components that can have child Components arranged by a Layout. One of
 * the code samples above showed how to create a Panel with 2 child Panels already defined inside it but it's easy to
 * do this at run time too:
 *
 *     @example miniphone
 *     //this is the Panel we'll be adding below
 *     var aboutPanel = Ext.create('Ext.Panel', {
 *         html: 'About this app'
 *     });
 *
 *     //this is the Panel we'll be adding to
 *     var mainPanel = Ext.create('Ext.Panel', {
 *         fullscreen: true,
 *
 *         layout: 'hbox',
 *         defaults: {
 *             flex: 1
 *         },
 *
 *         items: {
 *             html: 'First Panel',
 *             style: 'background-color: #5E99CC;'
 *         }
 *     });
 *
 *     //now we add the first panel inside the second
 *     mainPanel.add(aboutPanel);
 *
 * Here we created three Panels in total. First we made the aboutPanel, which we might use to tell the user a little
 * about the app. Then we create one called mainPanel, which already contains a third Panel in its
 * {@link Ext.Container#cfg-items items} configuration, with some dummy text ("First Panel"). Finally, we add the first
 * panel to the second by calling the {@link Ext.Container#method-add add} method on `mainPanel`.
 *
 * In this case we gave our mainPanel another hbox layout, but we also introduced some
 * {@link Ext.Container#defaults defaults}. These are applied to every item in the Panel, so in this case every child
 * inside `mainPanel` will be given a `flex: 1` configuration. The effect of this is that when we first render the screen
 * only a single child is present inside `mainPanel`, so that child takes up the full width available to it. Once the
 * `mainPanel.add` line is called though, the `aboutPanel` is rendered inside of it and also given a `flex` of 1, which will
 * cause it and the first panel to both receive half the full width of the `mainPanel`.
 *
 * Likewise, it's easy to remove items from a Container:
 *
 *     mainPanel.remove(aboutPanel);
 *
 * After this line is run everything is back to how it was, with the first child panel once again taking up the full
 * width inside `mainPanel`.
 */
Ext.define('Ext.Container', {
    extend: 'Ext.Component',

    alternateClassName: ['Ext.lib.Container', 'Ext.container.Container'],

    requires: [
        'Ext.util.ItemCollection'
    ],

    xtype: 'container',

    mixins: [
        'Ext.mixin.Queryable',
        'Ext.mixin.Container'
    ],

    /**
     * @event add
     * Fires whenever item added to the Container.
     * @param {Ext.Container} this The Container instance.
     * @param {Object} item The item added to the Container.
     * @param {Number} index The index of the item within the Container.
     */

    /**
     * @event remove
     * Fires whenever item removed from the Container.
     * @param {Ext.Container} this The Container instance.
     * @param {Object} item The item removed from the Container.
     * @param {Number} index The index of the item that was removed.
     */

    /**
     * @event move
     * Fires whenever item moved within the Container.
     * @param {Ext.Container} this The Container instance.
     * @param {Object} item The item moved within the Container.
     * @param {Number} toIndex The new index of the item.
     * @param {Number} fromIndex The old index of the item.
     */

    /**
     * @private
     * @event renderedchange
     * Fires whenever an item is rendered into a container or derendered
     * from a Container.
     * @param {Ext.Container} this The Container instance.
     * @param {Object} item The item in the Container.
     * @param {Boolean} rendered The current rendered status of the item.
     */

    /**
     * @event activate
     * Fires whenever item within the Container is activated.
     * @param {Object} newActiveItem The new active item within the container.
     * @param {Ext.Container} this The Container instance.
     * @param {Object} oldActiveItem The old active item within the container.
     */

    /**
     * @event deactivate
     * Fires whenever item within the Container is deactivated.
     * @param {Object} oldActiveItem The old active item within the container.
     * @param {Ext.Container} this The Container instance.
     * @param {Object} newActiveItem The new active item within the container.
     */

    eventedConfig: {
        /**
         * @cfg {Object/String/Number} activeItem The item from the {@link #cfg-items} collection that will be active first. This is
         * usually only meaningful in a {@link Ext.layout.Card card layout}, where only one item can be active at a
         * time. If passes a string, it will be assumed to be a {@link Ext.ComponentQuery} selector.
         * @accessor
         * @evented
         */
        activeItem: 0
    },

    config: {
        /**
         * @cfg {String/Object/Boolean} cardSwitchAnimation
         * Animation to be used during transitions of cards.
         * @removed 2.0.0 Please use {@link Ext.layout.Card#animation} instead
         */

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
         * @cmd-auto-dependency { aliasPrefix : "layout."}
         */
        layout: 'default',

        /**
         * @cfg {Object} control Enables you to easily control Components inside this Container by listening to their
         * events and taking some action. For example, if we had a container with a nested Disable button, and we
         * wanted to hide the Container when the Disable button is tapped, we could do this:
         *
         *     Ext.create('Ext.Container', {
         *         control: {
         *            'button[text=Disable]': {
         *                tap: 'hideMe'
         *            }
         *         },
         *
         *         hideMe: function () {
         *             this.hide();
         *         }
         *     });
         *
         * We used a {@link Ext.ComponentQuery} selector to listen to the {@link Ext.Button#tap tap} event on any
         * {@link Ext.Button button} anywhere inside the Container that has the {@link Ext.Button#text text} 'Disable'.
         * Whenever a Component matching that selector fires the `tap` event our `hideMe` function is called. `hideMe` is
         * called with scope: `this` (e.g. `this` is the Container instance).
         *
         */
        control: null,

        /**
         * @cfg {Object} defaults A set of default configurations to apply to all child Components in this Container.
         * It's often useful to specify defaults when creating more than one items with similar configurations. For
         * example here we can specify that each child is a panel and avoid repeating the xtype declaration for each
         * one:
         *
         *     Ext.create('Ext.Container', {
         *         defaults: {
         *             xtype: 'panel'
         *         },
         *         items: [
         *             {
         *                 html: 'Panel 1'
         *             },
         *             {
         *                 html: 'Panel 2'
         *             }
         *         ]
         *     });
         *
         * @accessor
         */
        defaults: null,

        // @cmd-auto-dependency { aliasPrefix: "widget.", typeProperty: "xtype", defaultTypeProperty: "defaultType", defaultsProperty: "defaults" }
        /**
         * @cfg {Array/Object} items The child items to add to this Container. This is usually an array of Component
         * configurations or instances, for example:
         *
         *     Ext.create('Ext.Container', {
         *         items: [
         *             {
         *                 xtype: 'panel',
         *                 html: 'This is an item'
         *             }
         *         ]
         *     });
         * @accessor
         */
        items: null,

        /**
         * @cfg {Boolean} autoDestroy If `true`, child items will be destroyed as soon as they are {@link #method-remove removed}
         * from this container.
         * @accessor
         */
        autoDestroy: true,

        /** @cfg {String} defaultType
         * The default {@link Ext.Component xtype} of child Components to create in this Container when a child item
         * is specified as a raw configuration object, rather than as an instantiated Component.
         * @accessor
         */
        defaultType: null,

        /**
         * @cfg {Boolean/Object/Ext.Mask/Ext.LoadMask} masked
         * A configuration to allow you to mask this container.
         * You can optionally pass an object block with and xtype of `loadmask`, and an optional `message` value to
         * display a loading mask. Please refer to the {@link Ext.LoadMask} component to see other configurations.
         *
         *     masked: {
         *         xtype: 'loadmask',
         *         message: 'My message'
         *     }
         *
         * Alternatively, you can just call the setter at any time with `true`/`false` to show/hide the mask:
         *
         *     setMasked(true); //show the mask
         *     setMasked(false); //hides the mask
         *
         * There are also two convenient methods, {@link #method-mask} and {@link #unmask}, to allow you to mask and unmask
         * this container at any time.
         *
         * Remember, the {@link Ext.Viewport} is always a container, so if you want to mask your whole application at anytime,
         * can call:
         *
         *     Ext.Viewport.setMasked({
         *         xtype: 'loadmask',
         *         message: 'Hello'
         *     });
         *
         * @accessor
         * @cmd-auto-dependency {defaultType: "Ext.Mask"}
         */
        masked: null
    },

    /**
     * @cfg {Boolean}
     * @protected
     * `true` to enable border management of docked items.  When enabled, borders of docked
     * items will collapse where they meet to avoid duplicated borders.
     */
    manageBorders: false,

    classCls: Ext.baseCSSPrefix + 'container',

    constructor: function(config) {
        var me = this;

        me._items = me.items = new Ext.util.ItemCollection();
        me.innerItems = [];

        me.getReferences = me.getFirstReferences;
        me.onItemAdd = me.onFirstItemAdd;

        me.callParent(arguments);

        delete me.getReferences;

        if (me.manageBorders) {
            me.element.addCls('x-managed-borders');
        }
    },

    initialize: function() {
        var me = this,
            classClsList = me.classClsList,
            i, ln;

        me.callParent();

        // Ensure the container's layout instance is created, even if the container
        // has no items.  This ensures border management is handled correctly on empty
        // panels.
        me.getLayout();

        if (classClsList) {
            for (i = 0, ln = classClsList.length; i < ln; i++) {
                me.innerElement.addCls(classClsList[i], null, 'inner');
            }
        }
    },

    getElementConfig: function() {
        return {
            reference: 'element',
            cls: 'x-unsized',
            children: [{
                reference: 'innerElement',
                className: 'x-inner'
            }]
        };
    },

    /**
     * Changes the {@link #masked} configuration when its setter is called, which will convert the value
     * into a proper object/instance of {@link Ext.Mask}/{@link Ext.LoadMask}. If a mask already exists,
     * it will use that instead.
     * @param {Boolean/Object/Ext.Mask/Ext.LoadMask} masked
     * @return {Object}
     */
    applyMasked: function(masked) {
        var isVisible = true,
            currentMask;

        if (masked === false) {
            masked = true;
            isVisible = false;
        }

        currentMask = Ext.factory(masked, Ext['Mask'], this.getMasked());

        if (currentMask) {
            this.add(currentMask);
            currentMask.setHidden(!isVisible);
        }

        return currentMask;
    },

    /**
     * Convenience method which calls {@link #setMasked} with a value of `true` (to show the mask). For additional
     * functionality, call the {@link #setMasked} function direction (See the {@link #masked} configuration documentation
     * for more information).
     */
    mask: function(mask) {
        this.setMasked(mask || true);
    },

    /**
     * Convenience method which calls {@link #setMasked} with a value of false (to hide the mask). For additional
     * functionality, call the {@link #setMasked} function direction (See the {@link #masked} configuration documentation
     * for more information).
     */
    unmask: function() {
        this.setMasked(false);
    },

    initInheritedState: function(inheritedState, inheritedStateInner) {
        this.callParent([inheritedState, inheritedStateInner]);
        this.initContainerInheritedState(inheritedState, inheritedStateInner);
    },

    onAdded: function(parent, instanced) {
        this.callParent([parent, instanced]);

        this.containerOnAdded(parent, instanced);
    },

    onRemoved: function(destroying) {
        this.containerOnRemoved(destroying);
        this.callParent([destroying]);
    },

    afterItemShow: function(item) {
        var layout;

        if (item.getDocked()) {
            layout = this.getLayout();
            this.items.generation++;
            layout.handleDockedItemBorders();
        }
    },

    afterItemHide: function(item) {
        var layout;

        if (item.getDocked()) {
            layout = this.getLayout();
            this.items.generation++;
            layout.handleDockedItemBorders();
        }
    },

    updateBaseCls: function(newBaseCls, oldBaseCls) {
        var me = this,
            innerElement = me.innerElement;

        me.callParent([newBaseCls, oldBaseCls]);

        if (oldBaseCls) {
            innerElement.removeCls(oldBaseCls, null, 'inner');
        }

        if (newBaseCls) {
            innerElement.addCls(newBaseCls, null, 'inner');
        }
    },

    applyItems: function(items, collection) {
        if (items) {
            var me = this,
                activeItem;

            me.getDefaultType();
            me.getDefaults();

            if (me.initialized && collection.length > 0) {
                me.removeAll();
            }

            me.add(items);

            //Don't need to call setActiveItem when Container is first initialized
            if (me.initialized) {
                activeItem = me.initialConfig.activeItem || me.config.activeItem || 0;

                me.setActiveItem(activeItem);
            }
        }
    },

    /**
     * @private
     */
    applyControl: function(selectors) {
        var selector, key, listener, listeners;

        for (selector in selectors) {
            listeners = selectors[selector];

            for (key in listeners) {
                listener = listeners[key];

                if (Ext.isObject(listener)) {
                    listener.delegate = selector;
                }
            }

            listeners.delegate = selector;

            this.addListener(listeners);
        }

        return selectors;
    },

    /**
     * Initialize layout and event listeners the very first time an item is added
     * @private
     */
    onFirstItemAdd: function() {
        var me = this;

        delete me.onItemAdd;

        if (me.innerHtmlElement && !me.getHtml()) {
            me.innerHtmlElement.destroy();
            delete me.innerHtmlElement;
        }

        me.on({
            innerstatechange: 'onItemInnerStateChange',
            floatedchange: 'onItemFloatedChange',
            scope: me,
            delegate: '> component'
        });

        return me.onItemAdd.apply(me, arguments);
    },

    //<debug>
    updateLayout: function(newLayout, oldLayout) {
        // This all should be refactored in EXTJS-18332
        if (!oldLayout || !oldLayout.isLayout) {
            return;
        }

        if (!oldLayout.isCompatible(newLayout)) {
            Ext.Logger.error('Replacing a layout after one has already been initialized is not supported. ' +
                this.$className + '#' + this.getId() + ' (' + oldLayout.$className + ' / ' +
                (Ext.isString(newLayout) ? newLayout : JSON.stringify(newLayout)) + ')');
        }
    },
    //</debug>

    getLayout: function() {
        var layout = this.layout;
        if (!(layout && layout.isLayout)) {
            layout = this.link('_layout', this.link('layout', Ext.factory(this._layout || 'default', Ext.layout.Default, null, 'layout')));
            layout.setContainer(this);
        }

        return layout;
    },

    updateDefaultType: function(defaultType) {
        // Cache the direct reference to the default item class here for performance
        this.defaultItemClass = Ext.ClassManager.getByAlias('widget.' + defaultType);

        //<debug>
        if (!this.defaultItemClass) {
            Ext.Logger.error("Invalid defaultType of: '" + defaultType + "', must be a valid component xtype");
        }
        //</debug>
    },

    /**
     * Called when an item is added to this container either during initialization of the {@link #cfg-items} config,
     * or when new items are {@link #method-add added), or {@link #method-insert inserted}.
     *
     * If the passed object is *not* an instanced component, it converts the passed object into an instanced
     * child component.
     *
     * It applies {@link #cfg-defaults} applied for contained child items - that is items
     * which are not positiond using {@link Ext.Component#cfg-left left},  {@link Ext.Component#cfg-top top},
     * {@link Ext.Component#cfg-bottom bottom}, {@link Ext.Component#cfg-right right},
     * {@link Ext.Component#cfg-centered centered} or {@link Ext.Component#cfg-docked docked}.
     *
     * Derived classes can override this method to process context appropriate short-hands
     * such as {@link Ext.Toolbar} and "->" to insert a spacer.
     *
     * @param {Mixed} item The item being added. May be a raw config object or an instanced
     * Component or some other short-hand understood by the container.
     * @return {Ext.Component} The component to be added.
     * @protected
     */
    factoryItem: function(item) {
        //<debug>
        if (!item) {
            Ext.Logger.error("Invalid item given: " + item + ", must be either the config object to factory a new item, " +
                "or an existing component instance");
        }
        //</debug>

        var me = this,
            defaults = me.getDefaults(),
            instance;

        // Existing instance
        if (item.isComponent) {
            instance = item;

            // Apply defaults only if this is not already an item of this container
            if (defaults && item.isInnerItem() && !me.has(instance)) {
                instance.setConfig(defaults, true);
            }
        }
        // Config object
        else {
            if (defaults && !item.ignoreDefaults) {
                // Note:
                // - defaults is only applied to inner items
                // - we merge the given config together with defaults into a new object so that the original object stays intact
                if (!(
                        item.hasOwnProperty('left') &&
                        item.hasOwnProperty('right') &&
                        item.hasOwnProperty('top') &&
                        item.hasOwnProperty('bottom') &&
                        item.hasOwnProperty('docked') &&
                        item.hasOwnProperty('centered')
                    )) {
                    item = Ext.mergeIf({}, item, defaults);
                }
            }

            // This forces default type to be resolved prior to any other configs that
            // may be using it to create children
            if (!me.$hasCachedDefaultItemClass) {
                me.getDefaultType();
                me.$hasCachedDefaultItemClass = true;
            }

            instance = Ext.factory(item, me.defaultItemClass);
        }

        return instance;
    },

    /**
     * Adds one or more Components to this Container. Example:
     *
     *     var myPanel = Ext.create('Ext.Panel', {
     *         html: 'This will be added to a Container'
     *     });
     *
     *     var items = myContainer.add([myPanel]); // Array returned
     *     var item = myContainer.add(myPanel); // One item is returned
     *
     * @param {Object/Object[]/Ext.Component/Ext.Component[]} newItems The new item(s) to add
     * to the Container. Note that if an array of items to add was passed in, an array of added
     * items will be returned as well even if there was only one item.
     *
     * @return {Ext.Component/Ext.Component[]} The Component(s) that were added.
     */
    add: function(newItems) {
        var me = this,
            addingArray = true,
            addedItems = [],
            i, ln, item, newActiveItem, instanced;

        if (!Ext.isArray(newItems)) {
            newItems = [newItems];
            addingArray = false;
        }

        for (i = 0, ln = newItems.length; i < ln; i++) {
            item = newItems[i];
            if (item) {
                instanced = item.isWidget;

                if (!instanced) {
                    item.$initParent = me;
                }

                item = me.factoryItem(item);
                me.doAdd(item, instanced);
                delete item.$initParent;

                if (!newActiveItem && !me.getActiveItem() && me.innerItems.length > 0 && item.isInnerItem()) {
                    newActiveItem = item;
                }

                addedItems.push(item);
            }
            //<debug>
            else {
                Ext.raise('Invalid item passed to add');
            }
            //</debug>
        }

        if (newActiveItem) {
            me.setActiveItem(newActiveItem);
        }

        return addingArray ? addedItems : addedItems[0];
    },

    /**
     * @private
     * @param {Ext.Component} item
     * @param {Boolean} instanced
     * when received.
     */
    doAdd: function(item, instanced) {
        var me = this,
            items = me.getItems(),
            index;

        if (!items.has(item)) {
            index = items.length;
            items.add(item);

            if (item.isInnerItem()) {
                me.insertInner(item);
            }

            item.onAdded(me, !!instanced);

            me.onItemAdd(item, index);
        }
    },

    /**
     * Removes an item from this Container, optionally destroying it.
     * @param {Ext.Component/String/Number} component The component instance or id or index to remove.
     * @param {Boolean} [destroy] `true` to automatically call Component's
     * {@link Ext.Component#method-destroy destroy} method.
     *
     * @return {Ext.Component} The Component that was removed.
     */
    remove: function(component, destroy) {
        var me = this,
            index, innerItems;

        component = me.getComponent(component);

        index = me.indexOf(component);
        innerItems = me.getInnerItems();

        if (destroy === undefined) {
            destroy = me.getAutoDestroy();
        }

        if (index !== -1) {
            if (!me.removingAll && innerItems.length > 1 && component === me.getActiveItem()) {
                me.on({
                    activeitemchange: 'doRemove',
                    scope: me,
                    single: true,
                    order: 'after',
                    args: [component, index, destroy]
                });

                me.doResetActiveItem(innerItems.indexOf(component));
            }
            else {
                me.doRemove(component, index, destroy);
                if (innerItems.length === 0) {
                    me.setActiveItem(null);
                }
            }
        }

        return component;
    },

    doResetActiveItem: function(innerIndex) {
        if (innerIndex === 0) {
            this.setActiveItem(1);
        }
        else {
            this.setActiveItem(0);
        }
    },

    doRemove: function(item, index, destroy) {
        var me = this;

        me.items.remove(item);

        if (item.isInnerItem()) {
            me.removeInner(item);
        }

        me.onItemRemove(item, index, destroy);

        item.onRemoved(item.destroying || destroy);

        if (destroy) {
            item.destroy();
        }
    },

    /**
     * Removes all items currently in the Container, optionally destroying them all.
     *
     * @param {Boolean} destroy If `true`, {@link Ext.Component#method-destroy destroys}
     * each removed Component.
     * @param {Boolean} everything If `true`, completely remove all items including
     * docked / centered and positioned items.
     *
     * @return {Ext.Component[]} Array of the removed Components
     */
    removeAll: function(destroy, everything) {
        var items = this.items,
            removed = [],
            ln = items.length,
            i = 0,
            item;

        if (typeof destroy != 'boolean') {
            destroy = this.getAutoDestroy();
        }

        everything = Boolean(everything);

        // removingAll flag is used so we don't unnecessarily change activeItem while removing all items.
        this.removingAll = true;

        for (; i < ln; i++) {
            item = items.getAt(i);

            if (item && (everything || item.isInnerItem())) {
                this.doRemove(item, i, destroy);
                i--;
                ln--;
            }

            removed.push(item);
        }
        this.setActiveItem(null);

        this.removingAll = false;

        return removed;
    },

    /**
     * Returns the Component for a given index in the Container's {@link #property-items}.
     * @param {Number} index The index of the Component to return.
     * @return {Ext.Component} The item at the specified `index`, if found.
     */
    getAt: function(index) {
        return this.items.getAt(index);
    },

    getInnerAt: function(index) {
        return this.innerItems[index];
    },

    /**
     * Removes the Component at the specified index:
     *
     *     myContainer.removeAt(0); // removes the first item
     *
     * @param {Number} index The index of the Component to remove.
     *
     * @return {Ext.Component} The removed Component
     */
    removeAt: function(index) {
        var item = this.getAt(index);

        if (item) {
            this.remove(item);
        }

        return item;
    },

    /**
     * Removes an inner Component at the specified index:
     *
     *     myContainer.removeInnerAt(0); // removes the first item of the innerItems property
     *
     * @param {Number} index The index of the Component to remove.
     * @return {Ext.Component} The removed Component
     */
    removeInnerAt: function(index) {
        var item = this.getInnerItems()[index];

        if (item) {
            this.remove(item);
        }

        return item;
    },

    /**
     * @private
     */
    has: function(item) {
        return this.getItems().indexOf(item) != -1;
    },

    /**
     * @private
     */
    hasInnerItem: function(item) {
        return this.innerItems.indexOf(item) != -1;
    },

    /**
     * @private
     */
    indexOf: function(item) {
        return this.getItems().indexOf(item);
    },

    innerIndexOf: function(item) {
        return this.innerItems.indexOf(item);
    },

    /**
     * @private
     * @param {Ext.Component} item
     * @param {Number} index
     */
    insertInner: function(item, index) {
        var items = this.getItems().items,
            innerItems = this.innerItems,
            currentInnerIndex = innerItems.indexOf(item),
            newInnerIndex = -1,
            nextSibling;

        if (currentInnerIndex !== -1) {
            innerItems.splice(currentInnerIndex, 1);
        }

        if (typeof index == 'number') {
            do {
                nextSibling = items[++index];
            } while (nextSibling && !nextSibling.isInnerItem());

            if (nextSibling) {
                newInnerIndex = innerItems.indexOf(nextSibling);
                innerItems.splice(newInnerIndex, 0, item);
            }
        }

        if (newInnerIndex === -1) {
            innerItems.push(item);
            newInnerIndex = innerItems.length - 1;
        }

        if (currentInnerIndex !== -1) {
            this.onInnerItemMove(item, newInnerIndex, currentInnerIndex);
        }

        return this;
    },

    onInnerItemMove: Ext.emptyFn,

    /**
     * @private
     * @param {Ext.Component} item
     */
    removeInner: function(item) {
        Ext.Array.remove(this.innerItems, item);

        return this;
    },

    /**
     * Adds a child Component at the given index. For example, here's how we can add a new item, making it the first
     * child Component of this Container:
     *
     *     myContainer.insert(0, {xtype: 'panel', html: 'new item'});
     *
     * @param {Number} index The index to insert the Component at.
     * @param {Object} item The Component to insert.
     */
    insert: function(index, item) {
        var me = this,
            instanced,
            i;

        //<debug>
        if (typeof index != 'number') {
            Ext.Logger.error("Invalid index of '" + index + "', must be a valid number");
        }
        //</debug>

        if (Ext.isArray(item)) {
            for (i = item.length - 1; i >= 0; i--) {
                me.insert(index, item[i]);
            }

            return me;
        }

        instanced = item.isWidget;
        if (!instanced) {
            item.$initParent = me;
        }
        item = me.factoryItem(item);
        me.doInsert(index, item, instanced);
        delete item.$initParent;

        return item;
    },

    /**
     * @private
     * @param {Number} index
     * @param {Ext.Component} item
     * @param {Boolean} instanced
     */
    doInsert: function(index, item, instanced) {
        var me = this,
            items = me.items,
            itemsLength = items.length,
            currentIndex, isInnerItem;

        isInnerItem = item.isInnerItem();

        if (index > itemsLength) {
            index = itemsLength;
        }

        if (items[index - 1] === item) {
            return me;
        }

        currentIndex = me.indexOf(item);

        if (currentIndex !== -1) {
            items.removeAt(currentIndex);
        }

        items.insert(index, item);

        if (currentIndex === -1) {
            item.onAdded(me, !!instanced);
        }

        if (isInnerItem) {
            me.insertInner(item, index);
        }

        if (currentIndex !== -1) {
            me.onItemMove(item, index, currentIndex);
        } else {
            me.onItemAdd(item, index);
        }
    },

    /**
     * @private
     */
    insertFirst: function(item) {
        return this.insert(0, item);
    },

    /**
     * @private
     */
    insertLast: function(item) {
        return this.insert(this.getItems().length, item);
    },

    /**
     * @private
     */
    insertBefore: function(item, relativeToItem) {
        var index = this.indexOf(relativeToItem);

        if (index !== -1) {
            this.insert(index, item);
        }
        return this;
    },

    /**
     * @private
     */
    insertAfter: function(item, relativeToItem) {
        var index = this.indexOf(relativeToItem);

        if (index !== -1) {
            this.insert(index + 1, item);
        }
        return this;
    },

    /**
     * @private
     */
    onItemAdd: function(item, index) {
        var me = this;

        me.doItemLayoutAdd(item, index);

        if (me.initialized) {
            if (item.hasListeners.added) {
                item.fireEvent('added', item, me, index);
            }
            if (me.hasListeners.add) {
                me.fireEvent('add', me, item, index);
            }
        }
    },

    doItemLayoutAdd: function(item, index) {
        var layout = this.getLayout();

        if (this.isRendered() && item.setRendered(true)) {
            item.fireAction('renderedchange', [this, item, true], 'onItemAdd', layout, {args: [item, index]});
        } else {
            layout.onItemAdd(item, index);
        }
    },

    /**
     * @private
     */
    onItemRemove: function(item, index, destroying) {
        var me = this;

        me.doItemLayoutRemove(item, index, destroying);

        if (item.hasListeners.removed) {
            item.fireEvent('removed', item, me, index);
        }
        if (me.hasListeners.remove) {
            me.fireEvent('remove', me, item, index);
        }
    },

    doItemLayoutRemove: function(item, index, destroying) {
        var layout = this.getLayout();

        if (this.isRendered() && item.setRendered(false)) {
            item.fireAction('renderedchange', [this, item, false], 'onItemRemove', layout, {args: [item, index, destroying]});
        }
        else {
            layout.onItemRemove(item, index, destroying);
        }
    },

    /**
     * @private
     */
    onItemMove: function(item, toIndex, fromIndex) {
        var me = this;

        if (item.isDocked()) {
            item.setDocked(null);
        }

        me.doItemLayoutMove(item, toIndex, fromIndex);

        if (item.hasListeners.moved) {
            item.fireEvent('moved', item, me, toIndex, fromIndex);
        }
        if (me.hasListeners.move) {
            me.fireEvent('move', me, item, toIndex, fromIndex);
        }
    },

    doItemLayoutMove: function(item, toIndex, fromIndex) {
        this.getLayout().onItemMove(item, toIndex, fromIndex);
    },

    onItemInnerStateChange: function(item, isInner) {
        var layout = this.getLayout();

        if (isInner) {
            this.insertInner(item, this.items.indexOf(item));
        }
        else {
            this.removeInner(item);
        }

        layout.onItemInnerStateChange.apply(layout, arguments);
    },

    onItemFloatedChange: function(item, floated) {
        var layout = this.getLayout();

        layout.onItemFloatedChange(item, floated);
    },

    /**
     * Returns all inner {@link #property-items} of this container. `inner` means that the item is not `docked` or
     * `positioned`.
     * @return {Array} The inner items of this container.
     */
    getInnerItems: function() {
        return this.innerItems;
    },

    /**
     * Returns all the {@link Ext.Component#docked} items in this container.
     * @return {Array} The docked items of this container.
     */
    getDockedItems: function() {
        var items = this.getItems().items,
            dockedItems = [],
            ln = items.length,
            item, i;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.isDocked()) {
                dockedItems.push(item);
            }
        }

        return dockedItems;
    },

    /**
     * @private
     */
    applyActiveItem: function(activeItem, currentActiveItem) {
        var me = this,
            innerItems = me.getInnerItems();

        // Make sure the items are already initialized
        me.getItems();

        // No items left to be active, reset back to 0 on falsy changes
        if (!activeItem && innerItems.length === 0) {
            return 0;
        } else if (typeof activeItem == 'number') {
            activeItem = Math.max(0, Math.min(activeItem, innerItems.length - 1));
            activeItem = innerItems[activeItem];

            if (activeItem) {
                return activeItem;
            }
            else if (currentActiveItem) {
                return null;
            }
        } else if (activeItem) {
            var item;

            //ComponentQuery selector?
            if (typeof activeItem == 'string') {
                item = me.child(activeItem);

                activeItem = {
                    xtype: activeItem
                };
            }

            if (!item || !item.isComponent) {
                activeItem.$initParent = me;
                item = me.factoryItem(activeItem);
            }
            me.pendingActiveItem = item;

            //<debug>
            if (!item.isInnerItem()) {
                Ext.Logger.error("Setting activeItem to be a non-inner item");
            }
            //</debug>

            if (!me.has(item)) {
                me.add(item);
            }
            delete item.$initParent;

            return item;
        }
    },

    /**
     * Animates to the supplied `activeItem` with a specified animation. Currently this only works
     * with a Card layout.  This passed animation will override any default animations on the
     * container, for a single card switch. The animation will be destroyed when complete.
     * @param {Object/Number} activeItem The item or item index to make active.
     * @param {Object/Ext.fx.layout.Card} animation Card animation configuration or instance.
     */
    animateActiveItem: function(activeItem, animation) {
        var layout = this.getLayout(),
            defaultAnimation;

        if (this.activeItemAnimation) {
            this.activeItemAnimation.destroy();
        }
        this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);
        if (animation && layout.isCard) {
            animation.setLayout(layout);
            defaultAnimation = layout.getAnimation();
            if (defaultAnimation) {
                defaultAnimation.disable();
            }
            animation.on('animationend', function() {
                if (defaultAnimation) {
                    defaultAnimation.enable();
                }
                animation.destroy();
            }, this);
        }
        return this.setActiveItem(activeItem);
    },

    /**
     * @private
     */
    updateActiveItem: function(newActiveItem, oldActiveItem) {
        delete this.pendingActiveItem;
        if (oldActiveItem) {
            oldActiveItem.fireEvent('deactivate', oldActiveItem, this, newActiveItem);
        }

        if (newActiveItem) {
            newActiveItem.fireEvent('activate', newActiveItem, this, oldActiveItem);
        }
    },

    /**
     * @private
     */
    setRendered: function(rendered) {
        if (this.callParent(arguments)) {
            var items = this.items.items,
                i, ln;

            for (i = 0, ln = items.length; i < ln; i++) {
                items[i].setRendered(rendered);
            }

            return true;
        }

        return false;
    },

    /**
     * @private
     * Used by ComponentQuery to retrieve all of the items
     * which can potentially be considered a child of this Container.
     * This should be overridden by components which have child items
     * that are not contained in items. For example `dockedItems`, `menu`, etc
     */
    getRefItems: function(deep) {
        var items = this.getItems().items,
            ln = items && items.length,
            i, item;

        if (items && deep) {
            items = items.slice();
            for (i = 0; i < ln; i++) {
                item = items[i];

                if (item.getRefItems) {
                    items = items.concat(item.getRefItems(true));
                }
            }
        }

        return items;
    },

    /**
     * Examines this container's `{@link #property-items}` property
     * and gets a direct child component of this container.
     * @param {String/Number} component This parameter may be any of the following:
     *
     * - {String} : representing the `itemId`
     * or `{@link Ext.Component#getId id}` of the child component.
     * - {Number} : representing the position of the child component
     * within the `{@link #property-items}` property.
     *
     * For additional information see {@link Ext.util.MixedCollection#get}.
     * @return {Ext.Component} The component (if found).
     */
    getComponent: function(component) {
        if (typeof component === 'number') {
            return this.getItems().getAt(component);
        }

        if (Ext.isObject(component)) {
            component = component.getItemId();
        }

        return this.getItems().get(component);
    },

    /**
     * Finds a docked item of this container using a reference, `id `or an `index` of its location
     * in {@link #getDockedItems}.
     * @param {String/Number} component The `id` or `index` of the component to find.
     * @return {Ext.Component/Boolean} The docked component, if found.
     */
    getDockedComponent: function(component) {
        if (Ext.isObject(component)) {
            component = component.getItemId();
        }

        var dockedItems = this.getDockedItems(),
            ln = dockedItems.length,
            item, i;

        if (Ext.isNumber(component)) {
            return dockedItems[component];
        }

        for (i = 0; i < ln; i++) {
            item = dockedItems[i];
            if (item.id == component) {
                return item;
            }
        }

        return false;
    },

    doDestroy: function() {
        var me = this;

        me.removeAll(true, true);
        me.items = Ext.destroy(me.items);

        me.callParent();
    },

    privates: {
        applyReference: function(reference) {
            // Need to call like this because applyReference from container comes via a mixin
            return this.setupReference(reference);
        },

        /**
         * This method is in place on the instance during construction to ensure that any
         * {@link #lookup} or {@link #getReferences} calls have the {@link #items} initialized
         * prior to the lookup.
         * @private
         */
        getFirstReferences: function() {
            var me = this;

            delete me.getReferences;
            me.getItems(); // create our items if we haven't yet

            return me.getReferences.apply(me, arguments);
        },

        syncUiCls: function() {
            var me = this,
                ui = me.getUi(),
                currentInnerUiCls = me.currentInnerUiCls,
                innerElement = me.innerElement,
                baseCls = me.getBaseCls(),
                classClsList = me.classClsList,
                uiCls = [],
                uiSuffix, i, ln, j, jln;

            if (currentInnerUiCls) {
                innerElement.removeCls(currentInnerUiCls);
            }

            if (ui) {
                ui = ui.split(' ');

                for (i = 0, ln = ui.length; i < ln; i++) {
                    uiSuffix = '-inner-' + ui[i];

                    if (baseCls && (baseCls !== me.classCls)) {
                        uiCls.push(baseCls + uiSuffix);
                    }

                    if (classClsList) {
                        for (j = 0, jln = classClsList.length; j < jln; j++) {
                            uiCls.push(classClsList[j] + uiSuffix);
                        }
                    }
                }

                innerElement.addCls(uiCls);

                me.currentInnerUiCls = uiCls;
            }

            me.callParent();
        }
    }

}, function() {
    this.prototype.defaultItemClass = this;
});
