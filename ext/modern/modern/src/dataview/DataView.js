/**
 * DataView makes it easy to create lots of components dynamically, usually based off a {@link Ext.data.Store Store}.
 * It's great for rendering lots of data from your server backend or any other data source and is what powers
 * components like {@link Ext.List}.
 *
 * Use DataView whenever you want to show sets of the same component many times, for examples in apps like these:
 *
 * - List of messages in an email app
 * - Showing latest news/tweets
 * - Tiled set of albums in an HTML5 music player
 *
 * # Creating a Simple DataView
 *
 * At its simplest, a DataView is just a Store full of data and a simple template that we use to render each item:
 *
 *     @example miniphone preview
 *     var gbTeam = Ext.create('Ext.DataView', {
 *         fullscreen: true,
 *         store: {
 *             fields: ['name', 'age'],
 *             data: [
 *                 {name: 'Peter',  age: 26},
 *                 {name: 'Ray',   age: 21},
 *                 {name: 'Egon', age: 24},
 *                 {name: 'Winston', age: 24}
 *             ]
 *         },
 *
 *         itemTpl: '<div>{name} is {age} years old</div>'
 *     });
 *
 * Here we just defined everything inline so it's all local with nothing being loaded from a server. For each of the 5
 * data items defined in our Store, DataView will render a {@link Ext.Component Component} and pass in the name and age
 * data. The component will use the tpl we provided above, rendering the data in the curly bracket placeholders we
 * provided.
 *
 * Because DataView is integrated with Store, any changes to the Store are immediately reflected on the screen. For
 * example, if we add a new record to the Store it will be rendered into our DataView:
 *
 *     gbTeam.getStore().add({
 *         name: 'Gozer',
 *         age: 567
 *     });
 *
 * We didn't have to manually update the DataView, it's just automatically updated. The same happens if we modify one
 * of the existing records in the Store:
 *
 *     gbTeam.getStore().getAt(0).set('age', 42);
 *
 * This will get the first record in the Store (Peter), change the age to 42 and automatically update what's on the
 * screen.
 *
 *     @example miniphone
 *     var gbTeam = Ext.create('Ext.DataView', {
 *         fullscreen: true,
 *         store: {
 *             fields: ['name', 'age'],
 *             data: [
 *                 {name: 'Peter',  age: 26},
 *                 {name: 'Ray',   age: 21},
 *                 {name: 'Egon', age: 24},
 *                 {name: 'Winston', age: 24}
 *             ]
 *         },
 *
 *         itemTpl: '<div>{name} is {age} years old</div>'
 *     });
 *
 *     gbTeam.getStore().add({
 *         name: 'Gozer',
 *         age: 21
 *     });
 *
 *     gbTeam.getStore().getAt(0).set('age', 42);
 *
 * # Loading data from a server
 *
 * We often want to load data from our server or some other web service so that we don't have to hard code it all
 * locally. Let's say we want to load some horror movies from Rotten Tomatoes into a DataView, and for each one
 * render the cover image and title. To do this all we have to do is grab an api key from rotten tomatoes (http://developer.rottentomatoes.com/)
 * and modify the {@link #store} and {@link #itemTpl} a little:
 *
 *     @example portrait
 *     Ext.create('Ext.DataView', {
 *         fullscreen: true,
 *         store: {
 *             autoLoad: true,
 *             fields: ['id', 'title',
 *              {
 *                  name:'thumbnail_image',
 *                  convert: function(v, record) {return record.raw.posters.thumbnail; }
 *              }],
 *
 *             proxy: {
 *                 type: 'jsonp',
 *                 // Modify this line with your API key, pretty please...
 *                 url: 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=hbjgfgryw8tygxztr5wtag3u&q=Horror',
 *
 *                 reader: {
 *                     type: 'json',
 *                     rootProperty: 'results'
 *                 }
 *             }
 *         },
 *
 *         itemTpl: '<img src="{thumbnail_image}" /><p>{title}</p><div style="clear: both"></div>'
 *     });
 *
 * The Store no longer has hard coded data, instead we've provided a {@link Ext.data.proxy.Proxy Proxy}, which fetches
 * the data for us. In this case we used a JSON-P proxy so that we can load from Twitter's JSON-P search API. We also
 * specified the fields present for each tweet, and used Store's {@link Ext.data.Store#autoLoad autoLoad} configuration
 * to load automatically. Finally, we configured a Reader to decode the response from Twitter, telling it to expect
 * JSON and that the tweets can be found in the 'results' part of the JSON response.
 *
 * The last thing we did is update our template to render the image, Twitter username and message. All we need to do
 * now is add a little CSS to style the list the way we want it and we end up with a very basic Twitter viewer. Click
 * the preview button on the example above to see it in action.
 */
Ext.define('Ext.dataview.DataView', {
    extend: 'Ext.Container',

    alternateClassName: 'Ext.DataView',

    mixins: ['Ext.mixin.Selectable'],

    xtype: 'dataview',

    requires: [
        'Ext.LoadMask',
        'Ext.data.StoreManager',
        'Ext.dataview.component.Container',
        'Ext.dataview.element.Container'
    ],

    /**
     * @event containertap
     * Fires when a tap occurs and it is not on a template node.
     * @removed 2.0.0
     */

    /**
     * @event itemtouchstart
     * Fires whenever an item is touched
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item touched
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem touched
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemtouchmove
     * Fires whenever an item is moved
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item moved
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem moved
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemtouchend
     * Fires whenever an item is touched
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item touched
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem touched
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemtap
     * Fires whenever an item is tapped
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item tapped
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem tapped
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemtaphold
     * Fires whenever an item's taphold event fires
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item touched
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem touched
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemsingletap
     * Fires whenever an item is singletapped
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item singletapped
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem singletapped
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemdoubletap
     * Fires whenever an item is doubletapped
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item doubletapped
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem doubletapped
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemswipe
     * Fires whenever an item is swiped
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item swiped
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem swiped
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemmouseenter
     * Fires whenever the mouse pointer moves over an item
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event itemmouseleave
     * Fires whenever the mouse pointer leaves an item
     * @param {Ext.dataview.DataView} this
     * @param {Number} index The index of the item
     * @param {Ext.Element/Ext.dataview.component.DataItem} target The element or DataItem
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event select
     * @preventable
     * Fires whenever an item is selected
     * @param {Ext.dataview.DataView} this
     * @param {Ext.data.Model} record The record associated to the item
     */

    /**
     * @event deselect
     * @preventable
     * Fires whenever an item is deselected
     * @param {Ext.dataview.DataView} this
     * @param {Ext.data.Model} record The record associated to the item
     * @param {Boolean} supressed Flag to suppress the event
     */

    /**
     * @event refresh
     * @preventable
     * Fires whenever the DataView is refreshed
     * @param {Ext.dataview.DataView} this
     */

    /**
     * @hide
     * @event add
     */

    /**
     * @hide
     * @event remove
     */

    /**
     * @hide
     * @event move
     */

    eventedConfig: {
        /**
         * @cfg {Ext.data.Store/Object} store
         * Can be either a Store instance or a configuration object that will be turned into a Store. The Store is used
         * to populate the set of items that will be rendered in the DataView. See the DataView intro documentation for
         * more information about the relationship between Store and DataView.
         * @accessor
         */
        store: null
    },

    config: {
        /**
         * @cfg layout
         * Hide layout config in DataView. It only causes confusion.
         * @accessor
         * @private
         */

        /**
         * @cfg {Object[]} data
         * @inheritdoc
         */
        data: null,

        /**
         * @cfg {String} emptyText
         * The text to display in the view when there is no data to display
         */
        emptyText: null,

        /**
         * @cfg {Boolean} deferEmptyText `true` to defer `emptyText` being applied until the store's first load.
         */
        deferEmptyText: true,

        /**
         * @cfg {String/String[]/Ext.XTemplate} itemTpl
         * The `tpl` to use for each of the items displayed in this DataView.
         */
        itemTpl: '<div>{text}</div>',

        /**
         * @cfg {String} itemCls
         * An additional CSS class to apply to items within the DataView.
         * @accessor
         */
        itemCls: null,

        /**
         * @cfg {String} triggerEvent
         * Determines what type of touch event causes an item to be selected.
         * Valid options are: 'itemtap', 'itemsingletap', 'itemdoubletap', 'itemswipe', 'itemtaphold'.
         * @accessor
         */
        triggerEvent: 'itemtap',

        /**
         * @cfg {String} triggerCtEvent
         * Determines what type of touch event is recognized as a touch on the container.
         * Valid options are 'tap' and 'singletap'.
         * @accessor
         */
        triggerCtEvent: 'tap',

        /**
         * @cfg {Boolean} deselectOnContainerClick
         * When set to true, tapping on the DataView's background (i.e. not on
         * an item in the DataView) will deselect any currently selected items.
         * @accessor
         */
        deselectOnContainerClick: true,

        /**
         * @cfg scrollable
         * @inheritdoc
         */
        scrollable: true,

        /**
         * @cfg {Boolean/Object} inline
         * When set to `true` the items within the DataView will have their display set to inline-block
         * and be arranged horizontally. By default the items will wrap to the width of the DataView.
         * Passing an object with `{ wrap: false }` will turn off this wrapping behavior and overflowed
         * items will need to be scrolled to horizontally.
         * @accessor
         */
        inline: null,

        /**
         * @cfg {Number} pressedDelay
         * The amount of delay between the `tapstart` and the moment we add the `pressedCls`.
         *
         * Settings this to `true` defaults to 100ms.
         * @accessor
         */
        pressedDelay: 100,

        /**
         * @cfg {String/Boolean} loadingText
         * A string to display during data load operations.  If specified, this text will be
         * displayed in a loading div and the view's contents will be cleared while loading, otherwise the view's
         * contents will continue to display normally until the new data is loaded and the contents are replaced.
         */
        loadingText: 'Loading...',

        /**
         * @cfg {Boolean} useComponents
         * Flag the use a component based DataView implementation.  This allows the full use of components in the
         * DataView at the cost of some performance.
         *
         * @accessor
         */
        useComponents: null,

        /**
         * @cfg {Object} itemConfig
         * A configuration object that is passed to every item created by a component based DataView. Because each
         * item that a DataView renders is a Component, we can pass configuration options to each component to
         * easily customize how each child component behaves.
         *
         * __Note:__ this is only used when `{@link #useComponents}` is `true`.
         * @accessor
         */
        itemConfig: {},

        /**
         * @cfg {Number} maxItemCache
         * Maintains a cache of reusable components when using a component based DataView.  Improving performance at
         * the cost of memory.
         *
         * __Note:__ this is currently only used when `{@link #useComponents}` is `true`.
         * @accessor
         */
        maxItemCache: 20,

        /**
         * @cfg {String} defaultType
         * The xtype used for the component based DataView.
         *
         * __Note:__ this is only used when `{@link #useComponents}` is `true`.
         * @accessor
         */
        defaultType: 'dataitem',

        /**
         * @cfg {Boolean} scrollToTopOnRefresh
         * Scroll the DataView to the top when the DataView is refreshed.
         * @accessor
         */
        scrollToTopOnRefresh: true
    },

    classCls: Ext.baseCSSPrefix + 'dataview',
    hoveredCls: Ext.baseCSSPrefix + 'hovered',
    selectedCls: Ext.baseCSSPrefix + 'selected',
    pressedCls: Ext.baseCSSPrefix + 'pressed',
    inlineCls: Ext.baseCSSPrefix + 'inline',
    noWrapCls: Ext.baseCSSPrefix + 'nowrap',
    emptyTextCls: Ext.baseCSSPrefix + 'empty-text',

    defaultBindProperty: 'store',

    constructor: function(config) {
        var me = this;

        me.hasLoadedStore = false;

        me.mixins.selectable.constructor.apply(me, arguments);

        me.indexOffset = 0;

        me.callParent(arguments);

        //<debug>
        var layout = this.getLayout();
        if (layout && !layout.isAuto) {
            Ext.Logger.error('The base layout for a DataView must always be an Auto Layout');
        }
        //</debug>

        me.initSelectable();
    },

    updateItemCls: function(newCls, oldCls) {
        var container = this.container;
        if (container) {
            if (oldCls) {
                container.doRemoveItemCls(oldCls);
            }
            if (newCls) {
                container.doAddItemCls(newCls);
            }
        }
    },

    storeEventHooks: {
        beforeload: 'onBeforeLoad',
        groupchange: 'onStoreGroupChange',
        load: 'onLoad',
        refresh: 'refresh',
        add: 'onStoreAdd',
        remove: 'onStoreRemove',
        clear: 'onStoreClear',
        update: 'onStoreUpdate'
    },

    initialize: function() {
        this.callParent();
        var me = this,
            triggerEvent = me.getTriggerEvent(),
            container;

        me.on(me.getTriggerCtEvent(), me.onContainerTrigger, me);

        if (me.getUseComponents()) {
            container = new Ext.dataview.component.Container();
        } else {
            container = new Ext.dataview.element.Container();
        }

        me.container = me.add(container);
        container.dataview = me;
        me.itemSelector = me.itemSelector || container.itemSelector;

        if (triggerEvent) {
            me.on(triggerEvent, me.onItemTrigger, me);
        }

        container.on({
            itemtouchstart: 'onItemTouchStart',
            itemtouchend: 'onItemTouchEnd',
            itemtap: 'onItemTap',
            itemtaphold: 'onItemTapHold',
            itemtouchmove: 'onItemTouchMove',
            itemsingletap: 'onItemSingleTap',
            itemdoubletap: 'onItemDoubleTap',
            itemswipe: 'onItemSwipe',
            itemmouseover: 'onItemMouseOver',
            itemmouseout: 'onItemMouseOut',
            scope: me
        });

        if (me.getStore()) {
            if (me.isPainted()) {
                me.refresh();
            }
            else {
                me.on({
                    painted: 'refresh',
                    single: true
                });
            }
        }
    },

    applyInline: function(config) {
        if (Ext.isObject(config)) {
            config = Ext.apply({}, config);
        }
        return config;
    },

    updateInline: function(inline) {
        var me = this,
            inlineCls = me.inlineCls,
            noWrapCls = me.noWrapCls;

        me.toggleCls(inlineCls, !!inline);

        if (inline) {
            me.toggleCls(noWrapCls, inline.wrap === false);
        }
    },

    /**
     * Function which can be overridden to provide custom formatting for each Record that is used by this
     * DataView's {@link #tpl template} to render each node.
     * @param {Object/Object[]} data The raw data object that was used to create the Record.
     * @param {Number} index the index number of the Record being prepared for rendering.
     * @param {Ext.data.Model} record The Record being prepared for rendering.
     * @return {Array/Object} The formatted data in a format expected by the internal {@link #tpl template}'s `overwrite()` method.
     * (either an array if your params are numeric (i.e. `{0}`) or an object (i.e. `{foo: 'bar'}`))
     */
    prepareData: function(data, index, record) {
        return data;
    },

    // apply to the selection model to maintain visual UI cues
    onContainerTrigger: function(e) {
        var me = this;
        if (e.target != me.element.dom) {
            return;
        }
        if (me.getDeselectOnContainerClick() && me.getStore()) {
            me.deselectAll();
        }
    },

    // apply to the selection model to maintain visual UI cues
    onItemTrigger: function(me, index, target, record, e) {
        if (!e.stopSelection && !this.destroyed) {
            this.selectWithEvent(this.getStore().getAt(index));
        }
    },

    doAddPressedCls: function(record) {
        var me = this,
            item = me.getItemAt(me.getStore().indexOf(record));
        if (Ext.isElement(item)) {
            item = Ext.get(item);
        }
        if (item) {
            if (item.isComponent) {
                item.renderElement.addCls(me.pressedCls);
            } else {
                item.addCls(me.pressedCls);
            }
        }
    },

    onItemTouchStart: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        me.fireAction('itemtouchstart', [me, index, target, record, e], 'doItemTouchStart');
    },

    doItemTouchStart: function(me, index, target, record) {
        var pressedDelay = me.getPressedDelay();

        if (record) {
            if (pressedDelay > 0) {
                me.pressedTimeout = Ext.defer(me.doAddPressedCls, pressedDelay, me, [record]);
            }
            else {
                me.doAddPressedCls(record);
            }
        }
    },

    onItemTouchEnd: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        if (this.hasOwnProperty('pressedTimeout')) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout;
        }

        if (record && target) {
            if (target.isComponent) {
                target.renderElement.removeCls(me.pressedCls);
            } else {
                target.removeCls(me.pressedCls);
            }
        }

        me.fireEvent('itemtouchend', me, index, target, record, e);
    },

    onItemTouchMove: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        if (me.hasOwnProperty('pressedTimeout')) {
            clearTimeout(me.pressedTimeout);
            delete me.pressedTimeout;
        }

        if (record && target) {
            if (target.isComponent) {
                target.renderElement.removeCls(me.pressedCls);
            } else {
                target.removeCls(me.pressedCls);
            }
        }
        me.fireEvent('itemtouchmove', me, index, target, record, e);
    },

    onItemTap: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        me.fireEvent('itemtap', me, index, target, record, e);
    },

    onItemTapHold: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        me.fireEvent('itemtaphold', me, index, target, record, e);
    },

    onItemSingleTap: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        me.fireEvent('itemsingletap', me, index, target, record, e);
    },

    onItemDoubleTap: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        me.fireEvent('itemdoubletap', me, index, target, record, e);
    },

    onItemSwipe: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            record = store && store.getAt(index);

        me.fireEvent('itemswipe', me, index, target, record, e);
    },

    onItemMouseOver: function(container, target, index, e) {
        var me = this,
            store, record;

        if (me.mouseOverItem !== target) {
            me.mouseOverItem = target;
            store = me.getStore();
            record = store && store.getAt(index);

            target.addCls(me.hoveredCls);

            me.fireEvent('itemmouseenter', me, index, target, record, e);
        }
    },

    onItemMouseOut: function(container, target, index, e) {
        var me = this,
            relatedTarget = e.getRelatedTarget(me.itemSelector),
            store, record;

        if (target.dom !== relatedTarget) {
            store = me.getStore();
            record = store && store.getAt(index);

            target.removeCls(me.hoveredCls);

            me.fireEvent('itemmouseleave', me, index, target, record, e);

            me.mouseOverItem = null;
        }
    },

    // invoked by the selection model to maintain visual UI cues
    onItemSelect: function(record, suppressEvent) {
        var me = this;
        if (suppressEvent) {
            me.doItemSelect(me, record);
        } else {
            me.fireAction('select', [me, record], 'doItemSelect');
        }
    },

    // invoked by the selection model to maintain visual UI cues
    doItemSelect: function(me, record) {
        if (me.container && !me.destroyed) {
            var item = me.getItemAt(me.getStore().indexOf(record));
            if (Ext.isElement(item)) {
                item = Ext.get(item);
            }
            if (item) {
                if (item.isComponent) {
                    item.renderElement.removeCls(me.pressedCls);
                    item.renderElement.addCls(me.selectedCls);
                } else {
                    item.removeCls(me.pressedCls);
                    item.addCls(me.selectedCls);
                }
            }
        }
    },

    // invoked by the selection model to maintain visual UI cues
    onItemDeselect: function(record, suppressEvent) {
        var me = this;
        if (me.container && !me.destroyed) {
            if (suppressEvent) {
                me.doItemDeselect(me, record);
            }
            else {
                me.fireAction('deselect', [me, record, suppressEvent], 'doItemDeselect');
            }
        }
    },

    doItemDeselect: function(me, record) {
        var item = me.getItemAt(me.getStore().indexOf(record));

        if (Ext.isElement(item)) {
            item = Ext.get(item);
        }

        if (item) {
            if (item.isComponent) {
                item.renderElement.removeCls([me.pressedCls, me.selectedCls]);
            } else {
                item.removeCls([me.pressedCls, me.selectedCls]);
            }
        }
    },

    updateData: function(data) {
        var store = this.getStore();
        if (!store) {
            this.setStore(Ext.create('Ext.data.Store', {
                data: data,
                autoDestroy: true
            }));
        } else {
            store.add(data);
        }
    },

    applyStore: function(store) {
        var me = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            if (store && Ext.isObject(store) && store.isStore) {
                store.on(bindEvents);
                proxy = store.getProxy();
                if (proxy) {
                    reader = proxy.getReader();
                    if (reader) {
                        reader.on('exception', 'handleException', this);
                    }
                }
            }
            //<debug>
            else {
                Ext.Logger.warn("The specified Store cannot be found", this);
            }
            //</debug>
        }

        return store;
    },

    /**
     * Method called when the Store's Reader throws an exception
     * @method handleException
     */
    handleException: function() {
        this.setMasked(false);
    },

    updateStore: function(newStore, oldStore) {
        var me = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (oldStore && Ext.isObject(oldStore) && oldStore.isStore) {
            oldStore.un(bindEvents);

            if (!me.destroying && !me.destroyed) {
                me.onStoreClear();
            }

            if (oldStore.getAutoDestroy()) {
                oldStore.destroy();
            }
            else {
                proxy = oldStore.getProxy();
                if (proxy) {
                    reader = proxy.getReader();
                    if (reader) {
                        reader.un('exception', 'handleException', this);
                    }
                }
            }
        }

        if (newStore) {
            if (newStore.isLoaded()) {
                this.hasLoadedStore = true;
            }

            if (newStore.isLoading()) {
                me.onBeforeLoad();
            }
            if (me.container) {
                me.refresh();
            }
        }
    },

    onBeforeLoad: function() {
        var me = this,
            loadingText = me.getLoadingText();
            
        if (loadingText && me.isPainted()) {
            me.setMasked({
                xtype: 'loadmask',
                message: loadingText
            });
        }

        me.hideEmptyText();
    },

    updateEmptyText: function(newEmptyText, oldEmptyText) {
        var me = this,
            store;

        if (oldEmptyText && me.emptyTextCmp) {
            me.remove(me.emptyTextCmp, true);
            delete me.emptyTextCmp;
        }

        if (newEmptyText) {
            me.emptyTextCmp = me.add({
                xtype: 'component',
                cls: me.emptyTextCls,
                html: newEmptyText,
                hidden: true
            });
            store = me.getStore();
            if (store && me.hasLoadedStore && !store.getCount()) {
                me.showEmptyText();
            }
        }
    },

    onLoad: function(store) {
        //remove any masks on the store
        this.hasLoadedStore = true;
        this.setMasked(false);

        if (!store.getCount()) {
            this.showEmptyText();
        }
    },

    /**
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function() {
        var me = this,
            container = me.container;

        if (!me.getStore()) {
            if (!me.hasLoadedStore && !me.getDeferEmptyText()) {
                me.showEmptyText();
            }
            return;
        }
        if (me.initialized && container) {
            me.fireAction('refresh', [me], 'doRefresh');
        }
    },

    applyItemTpl: function(config) {
        return (Ext.isObject(config) && config.isTemplate) ? config : new Ext.XTemplate(config);
    },

    onAfterRender: function() {
        var me = this;
        me.updateStore(me.getStore());
    },

    /**
     * Returns an item at the specified index.
     * @param {Number} index Index of the item.
     * @return {Ext.dom.Element/Ext.dataview.component.DataItem} item Item at the specified index.
     */
    getItemAt: function(index) {
        return this.getViewItems()[index - this.indexOffset];
    },

    /**
     * Returns an index for the specified item.
     * @param {Number} item The item to locate.
     * @return {Number} Index for the specified item.
     */
    getItemIndex: function(item) {
        var index = this.getViewItems().indexOf(item);
        return (index === -1) ? index : this.indexOffset + index;
    },

    /**
     * Returns an array of the current items in the DataView.
     * @return {Ext.dom.Element[]/Ext.dataview.component.DataItem[]} Array of Items.
     */
    getViewItems: function() {
        var container = this.container;
        return container ? container.getViewItems() : [];
    },

    doRefresh: function(me) {
        var container = me.container,
            store = me.getStore(),
            records = store.getRange(),
            items = me.getViewItems(),
            recordsLn = records.length,
            itemsLn = items.length,
            deltaLn = recordsLn - itemsLn,
            scroller = me.getScrollable(),
            i, item;

        if (this.getScrollToTopOnRefresh() && scroller) {
            scroller.scrollTo(0, 0);
        }

        // No items, hide all the items from the collection.
        if (recordsLn < 1) {
            me.onStoreClear();
            return;
        } else {
            me.hideEmptyText();
        }

        // Too many items, hide the unused ones
        if (deltaLn < 0) {
            container.moveItemsToCache(itemsLn + deltaLn, itemsLn - 1);
            // Items can changed, we need to refresh our references
            items = me.getViewItems();
            itemsLn = items.length;
        }
        // Not enough items, create new ones
        else if (deltaLn > 0) {
            container.moveItemsFromCache(store.getRange(itemsLn));
        }

        // Update Data and insert the new html for existing items
        for (i = 0; i < itemsLn; i++) {
            item = items[i];
            container.updateListItem(records[i], item);
        }

        if (this.hasSelection()) {
            var selection = this.getSelection(),
                selectionLn = this.getSelectionCount(),
                record;
            for (i = 0; i < selectionLn; i++) {
                record = selection[i];
                this.doItemSelect(this, record);
            }
        }
    },

    showEmptyText: function() {
        if (this.getEmptyText() && (this.hasLoadedStore || !this.getDeferEmptyText())) {
            this.emptyTextCmp.show();
        }
    },

    hideEmptyText: function() {
        if (this.getEmptyText()) {
            this.emptyTextCmp.hide();
        }
    },

    doDestroy: function() {
        var store = this.getStore(),
            proxy = (store && !store.destroyed && store.getProxy()),
            reader = (proxy && !proxy.destroyed && proxy.getReader());

        if (reader) {
            // TODO: Use un() instead of clearListeners() when TOUCH-2723 is fixed.
//          reader.un('exception', 'handleException', this);
            reader.clearListeners();
        }

        this.setStore(null);
        
        this.callParent();
    },

    onStoreClear: function() {
        var me = this,
            container = me.container,
            items = me.getViewItems();

        container.moveItemsToCache(0, items.length - 1);
        this.showEmptyText();
    },

    /**
     * @method
     * @private
     * @param {Ext.data.Store} store
     * @param {Ext.util.Grouper} grouper
     */
    onStoreGroupChange: Ext.emptyFn,

    /**
     * @method
     * @private
     * @param {Ext.data.Store} store
     * @param {Array} records
     */
    onStoreAdd: function(store, records) {
        if (records) {
            this.hideEmptyText();
            this.container.moveItemsFromCache(records);
        }
    },

    /**
     * @private
     * @param {Ext.data.Store} store
     * @param {Array} records
     * @param {Number} index
     */
    onStoreRemove: function(store, records, index) {
        var container = this.container,
            ln = records.length,
            i;

        for (i = ln - 1; i >= 0; i--) {
            container.moveItemsToCache(index + i, index + i);
        }
    },

    /**
     * @private
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model} record
     * @param {Number} newIndex
     * @param {Number} oldIndex
     */
    onStoreUpdate: function(store, record, type, modifiedFieldNames, info) {
        var me = this,
            container = me.container,
            item;

        if (info.indexChanged) {
            container.updateAtNewIndex(info.oldIndex, info.newIndex, record);
            if (me.isSelected(record)) {
                me.doItemSelect(me, record);
            }
        } else {
            item = me.getViewItems()[me.getStore().indexOf(record)];
            if (item) {
                // Bypassing setter because sometimes we pass the same record (different data)
                container.updateListItem(record, item);
            }
        }
    }
});
