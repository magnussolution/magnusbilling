/**
 * List is a custom styled DataView which allows Grouping, Indexing, Icons, and a Disclosure.
 *
 *     @example miniphone preview
 *     Ext.create('Ext.List', {
 *         fullscreen: true,
 *         itemTpl: '{title}',
 *         data: [
 *             { title: 'Item 1' },
 *             { title: 'Item 2' },
 *             { title: 'Item 3' },
 *             { title: 'Item 4' }
 *         ]
 *     });
 *
 * A more advanced example showing a list of people grouped by last name:
 *
 *     @example miniphone preview
 *     Ext.define('Contact', {
 *         extend: 'Ext.data.Model',
 *         config: {
 *             fields: ['firstName', 'lastName']
 *         }
 *     });
 *
 *     var store = Ext.create('Ext.data.Store', {
 *        model: 'Contact',
 *        sorters: 'lastName',
 *
 *        grouper: {
 *            groupFn: function(record) {
 *                return record.get('lastName')[0];
 *            }
 *        },
 *
 *        data: [
 *            { firstName: 'Peter',   lastName: 'Venkman'  },
 *            { firstName: 'Raymond', lastName: 'Stantz'   },
 *            { firstName: 'Egon',    lastName: 'Spengler' },
 *            { firstName: 'Winston', lastName: 'Zeddemore'}
 *        ]
 *     });
 *
 *     Ext.create('Ext.List', {
 *        fullscreen: true,
 *        itemTpl: '<div class="contact">{firstName} <strong>{lastName}</strong></div>',
 *        store: store,
 *        grouped: true
 *     });
 *
 * If you want to dock items to the bottom or top of a List, you can use the scrollDock configuration on child items in this List. The following example adds a button to the bottom of the List.
 *
 *     @example phone preview
 *     Ext.define('Contact', {
 *         extend: 'Ext.data.Model',
 *         config: {
 *             fields: ['firstName', 'lastName']
 *         }
 *     });
 *
 *     var store = Ext.create('Ext.data.Store', {
 *        model: 'Contact',
 *        sorters: 'lastName',
 *
 *        grouper: {
 *            groupFn: function(record) {
 *                return record.get('lastName')[0];
 *            }
 *        },
 *
 *        data: [
 *            { firstName: 'Peter',   lastName: 'Venkman'  },
 *            { firstName: 'Raymond', lastName: 'Stantz'   },
 *            { firstName: 'Egon',    lastName: 'Spengler' },
 *            { firstName: 'Winston', lastName: 'Zeddemore'}
 *        ]
 *     });
 *
 *     Ext.create('Ext.List', {
 *         fullscreen: true,
 *         itemTpl: '<div class="contact">{firstName} <strong>{lastName}</strong></div>',
 *         store: store,
 *         items: [{
 *             xtype: 'button',
 *             scrollDock: 'bottom',
 *             docked: 'bottom',
 *             text: 'Load More...'
 *         }]
 *     });
 */
Ext.define('Ext.dataview.List', {
    alternateClassName: 'Ext.List',
    extend: 'Ext.dataview.DataView',
    xtype: 'list',

    mixins: ['Ext.mixin.Hookable'],

    requires: [
        'Ext.data.Store',
        'Ext.dataview.IndexBar',
        'Ext.dataview.ItemHeader',
        'Ext.dataview.ListItem',
        'Ext.dataview.SimpleListItem',
        'Ext.util.PositionMap'
    ],

    /**
     * @event disclose
     * @preventable
     * Fires whenever a disclosure is handled
     * @param {Ext.dataview.List} this The List instance
     * @param {Ext.data.Model} record The record associated to the item
     * @param {HTMLElement} target The element disclosed
     * @param {Number} index The index of the item disclosed
     * @param {Ext.EventObject} e The event object
     */

    config: {
        /**
         * @cfg {Object} container
         * This config is used to control the internal {@link Ext.Container} created to
         * manage this list's items. One common use for this is to apply a {@link #userCls}
         * to the item container.
         *
         *      {
         *          xtype: 'list',
         *          container: {
         *              userCls: 'mylist-cls'
         *          },
         *          ...
         *      }
         *
         * @since 6.0.1
         */
        container: {
            lazy: true,
            $value: {
                xtype: 'container',
                scrollable: {}
            }
        },

        /**
         * @cfg layout
         * Hide layout config in DataView. It only causes confusion.
         * @accessor
         * @private
         */
        layout: 'fit',

        /**
         * @cfg {Boolean/Object} indexBar
         * `true` to render an alphabet IndexBar docked on the right.
         * This can also be a config object that will be passed to {@link Ext.IndexBar}.
         * @accessor
         */
        indexBar: false,

        icon: null,

        /**
         * @cfg {Boolean} preventSelectionOnDisclose `true` to prevent the item selection when the user
         * taps a disclose icon.
         * @accessor
         */
        preventSelectionOnDisclose: true,

        /**
         * @cfg {Boolean} pinHeaders
         * Whether or not to pin headers on top of item groups while scrolling for an iPhone native list experience.
         * @accessor
         */
        pinHeaders: true,

        /**
         * @cfg {Object} pinnedHeader
         * A config object for the pinned header.  Only applicable when {@link #pinHeaders}
         * is `true`.
         */
        pinnedHeader: {
            xtype: 'itemheader',
            pinned: true
        },

        /**
         * @cfg {Boolean} grouped
         * Whether or not to group items in the provided Store with a header for each item.
         * @accessor
         */
        grouped: null,

        /**
         * @cfg {Boolean/Function/String/Object} onItemDisclosure
         * `true` to display a disclosure icon on each list item.
         * The list will still fire the disclose event, and the event can be stopped before itemtap.
         * By setting this config to a function, the function passed will be called when the disclosure
         * is tapped.
         * Finally you can specify an object with a 'scope' and 'handler'
         * property defined. This will also be bound to the tap event listener
         * and is useful when you want to change the scope of the handler.
         * @accessor
         * @controllable
         */
        onItemDisclosure: null,

        /**
         * @cfg {String} disclosureProperty
         * A property to check on each record to display the disclosure on a per record basis.  This
         * property must be false to prevent the disclosure from being displayed on the item.
         * @accessor
         */
        disclosureProperty: 'disclosure',

        /**
         * @cfg {Boolean} useComponents
         * @hide
         */

        /**
         * @cfg {Object} itemConfig
         * A configuration object that is passed to every item created by a component based DataView. Because each
         * item that a List renders is a Component, we can pass configuration options to each component to
         * easily customize how each child component behaves.
         * @accessor
         * @private
         */

        /**
         * @cfg {Number} maxItemCache
         * Maintains a cache of reusable components when using a component based DataView.  Improving performance at
         * the cost of memory.
         * Note this is currently only used when useComponents is true.
         * @accessor
         * @private
         */

        /**
         * @cfg {String} defaultType
         * The xtype used for the component based DataView. Defaults to dataitem.
         * Note this is only used when useComponents is true.
         * @accessor
         */
        defaultType: undefined,

        /**
         * @cfg {Object} itemMap
         * @private
         */
        itemMap: {},

        /**
         * @cfg {Number} itemHeight
         * This allows you to set the default item height and is used to roughly calculate the amount
         * of items needed to fill the list. By default items are around 50px high.
         */
        itemHeight: null,

        /**
         * @cfg {Boolean} variableHeights
         * This configuration allows you optimize the list by not having it read the DOM heights of list items.
         * Instead it will assume (and set) the height to be the {@link #itemHeight}.
         * @private
         */
        variableHeights: false,

        /**
         * @cfg {Boolean} refreshHeightOnUpdate
         * Set this to false if you make many updates to your list (like in an interval), but updates
         * won't affect the item's height. Doing this will increase the performance of these updates.
         */
        refreshHeightOnUpdate: true,

        /**
         * @cfg {Boolean} infinite
         * Set this to false to render all items in this list, and render them relatively.
         * Note that this configuration can not be dynamically changed after the list has instantiated.
         */
        infinite: false,

        /**
         * @cfg {Boolean} useSimpleItems
         * Set this to true if you just want to have the list create simple items that use the itemTpl.
         * These simple items still support headers, grouping and disclosure functionality but avoid
         * container layouts and deeply nested markup. For many Lists using this configuration will
         * drastically increase the scrolling and render performance.
         */
        useSimpleItems: true,

        /**
         * @cfg {Object} scrollable
         * @private
         */
        scrollable: null,

        /**
         * @cfg {String} scrollDock
         * The dock position of a list's child items relative to the list itself. Can be `top` or `bottom`.
         *
         *     Ext.create('Ext.List', {
         *          fullscreen: true,
         *          itemTpl: '{firstName}',
         *          data: [
         *              { firstName: 'Peter'},
         *              { firstName: 'Raymond'},
         *              { firstName: 'Egon'},
         *              { firstName: 'Winston'}
         *          ],
         *          items: [{
         *               xtype: 'component',
         *               html: 'Docked!',
         *               docked: 'top'
         *          },{
         *               xtype: 'component',
         *               html: 'Scroll Docked!',
         *               scrollDock: 'top'
         *          }]
         *      });
         */
        scrollDock: null,

        /**
         * @cfg {Number} bufferSize
         * The amount of items we render additionally besides the ones currently visible.
         * We try to prevent the rendering of items while scrolling until the next time you stop scrolling.
         * If you scroll close to the end of the buffer, we start rendering individual items to always
         * have the {@link #minimumBufferSize} prepared.
         */
        bufferSize: 20,

        minimumBufferDistance: 5,

        /**
         * @cfg {Boolean} striped
         * Set this to true if you want the items in the list to be zebra striped, alternating their
         * background color.
         */
        striped: false,

        /**
         * @cfg {Boolean} rowLines
         * Set this to `false` to suppress the borders in between the items in this list.
         * By default the presence of borders in between the items is determined by the stylesheet
         */
        rowLines: null
    },

    classCls: Ext.baseCSSPrefix + 'list',
    infiniteCls: Ext.baseCSSPrefix + 'infinite',
    scrollDockCls: Ext.baseCSSPrefix + 'scrolldock',
    firstCls: Ext.baseCSSPrefix + 'first',
    lastCls: Ext.baseCSSPrefix + 'last',
    groupFirstCls: Ext.baseCSSPrefix + 'group-first',
    groupLastCls: Ext.baseCSSPrefix + 'group-last',
    oddCls: Ext.baseCSSPrefix + 'odd',
    groupedCls: Ext.baseCSSPrefix + 'grouped',
    noRowLinesCls: Ext.baseCSSPrefix + 'no-row-lines',
    disclosureSelector: '.' + Ext.baseCSSPrefix + 'listitem-disclosure',

    topRenderedIndex: 0,
    topVisibleIndex: 0,
    visibleCount: 0,

    itemSelector: '.' + Ext.baseCSSPrefix + 'listitem',

    //<debug>
    constructor: function(config) {
        this.callParent([config]);
        var layout = this.getLayout();
        if (layout && !layout.isFit) {
            Ext.Logger.error('The base layout for a DataView must always be a Fit Layout');
        }
    },
    //</debug>

    // We create complex instance arrays and objects in beforeInitialize so that we can use these inside of the initConfig process.
    beforeInitialize: function() {
        var me = this,
            container = me.container;

        Ext.apply(me, {
            listItems: [],
            headerItems: [],
            updatedItems: [],
            headerMap: [],
            recordMap: {},
            scrollDockItems: {
                top: [],
                bottom: []
            }
        });

        me.translationMethod = 'csstransform';

        // Create the inner container that will actually hold all the list items
        if (!container) {
            container = me.container = me.createContainer();
        }

        // We add the container after creating it manually because when you add the container,
        // the items config is initialized. When this happens, any scrollDock items will be added,
        // which in turn tries to add these items to the container
        me.add(container);

        // We make this List's scrollable the inner containers scrollable
        me.scrollElement = container.innerElement;

        container.getScrollable().on({
            scroll: 'onScroll',
            refresh: 'onScrollerRefresh',
            scope: me
        });
    },

    /**
     * @private
     */
    createContainer: function () {
        var config = Ext.merge({
        }, this.getContainer());

        return Ext.create(config);
    },

    getScrollable: function() {
        var container = this.container;
        
        if (container && !container.destroyed) {
            return container.getScrollable();
        }
    },

    // We override DataView's initialize method with an empty function
    initialize: function() {
        var me = this,
            container = me.container,
            indexBar = me.getIndexBar(),
            triggerEvent = me.getTriggerEvent(),
            triggerCtEvent = me.getTriggerCtEvent();

        if (indexBar) {
            me.container.element.appendChild(indexBar.renderElement);
        }

        if (triggerEvent) {
            me.on(triggerEvent, me.onItemTrigger, me);
        }
        if (triggerCtEvent) {
            me.on(triggerCtEvent, me.onContainerTrigger, me);
        }

        container.element.on({
            delegate: me.disclosureSelector,
            tap: 'handleItemDisclosure',
            scope: me
        });

        container.element.on({
            resize: 'onContainerResize',
            scope: me
        });

        // Android 2.x not a direct child
        container.innerElement.on({
            touchstart: 'onItemTouchStart',
            touchend: 'onItemTouchEnd',
            tap: 'onItemTap',
            taphold: 'onItemTapHold',
            singletap: 'onItemSingleTap',
            doubletap: 'onItemDoubleTap',
            swipe: 'onItemSwipe',
            mouseover: 'onItemMouseOver',
            mouseout: 'onItemMouseOut',
            delegate: me.itemSelector,
            scope: me
        });

        if (me.getStore()) {
            if (me.isPainted()) {
                me.refresh();
            } else {
                me.on({
                    painted: 'refresh',
                    single: true
                });
            }
        }
    },

    getRefItems: function(deep) {
        var result = [],
            candidates = this.callParent([deep]),
            len = candidates.length,
            i, candidate;

        // We must only return list items that are part of the rendered block.
        // Check that their record is defined
        for (i = 0; i < len; i++) {
            candidate = candidates[i];
            if (!candidate.isGridRow || candidate.getRecord() != null) {
                result[result.length] = candidate;
            }
        }

        return result;
    },

    onScroll: function(scroller, x, y) {
        var me = this,
            pinnedHeader = me.getPinnedHeader(),
            store = me.getStore(),
            storeCount = store && store.getCount(),
            grouped = me.isGrouping(),
            infinite = me.getInfinite();

        // This method was originally written as an interceptor for doTranslate, so the
        // coordinates are expected to be in CSS translation form (negative number ==
        // positive scroll position).  It was changed to be a scroll event listener in v5
        // which uses scroll position coordinates.
        if (x) {
            x = -x;
        }
        if (y) {
            y = -y;
        }

        if (!storeCount) {
            me.showEmptyText();
            me.showEmptyScrollDock();

            pinnedHeader.$position = -10000;
            me.translate(pinnedHeader, 0, -10000);
        }
        else if (infinite && me.itemsCount) {
            me.handleItemUpdates(y);
            me.handleItemHeights();
            me.handleItemTransforms();

            if (!me.onIdleBound) {
                Ext.AnimationQueue.onIdle(me.onAnimationIdle, me);
                me.onIdleBound = true;
            }
        }

        if (grouped && me.groups && me.groups.length && me.getPinHeaders()) {
            me.handlePinnedHeader(y);
        }

        me.handleIndexBarSize();

        // This is a template method that can be intercepted by plugins to do things when scrolling
        me.onScrollBinder(x, y);
    },

    onScrollerRefresh: function(scroller) {
        var position = scroller.getPosition();
        this.onScroll(scroller, position.x, position.y);
    },

    onScrollBinder: function(){},

    handleItemUpdates: function(y) {
        var me = this,
            listItems = me.listItems,
            itemsCount = listItems.length,
            info = me.getListItemInfo(),
            itemMap = me.getItemMap(),
            bufferSize = me.getBufferSize(),
            lastIndex = me.getStore().getCount() - 1,
            minimumBufferDistance = me.getMinimumBufferDistance(),
            currentTopVisibleIndex = me.topVisibleIndex,
            topRenderedIndex = me.topRenderedIndex,
            updateCount, i, item, topVisibleIndex, bufferDistance, itemIndex;

        // This is the index of the item that is currently visible at the top
        me.topVisibleIndex = topVisibleIndex = Math.max(0, itemMap.findIndex(-y) || 0);

        if (currentTopVisibleIndex !== topVisibleIndex) {
            // When we are scrolling up
            if (currentTopVisibleIndex > topVisibleIndex) {
                bufferDistance = topVisibleIndex - topRenderedIndex;
                if (bufferDistance < minimumBufferDistance) {
                    updateCount = Math.min(itemsCount, minimumBufferDistance - bufferDistance);

                    if (updateCount == itemsCount) {
                        me.topRenderedIndex = topRenderedIndex = Math.max(0, topVisibleIndex - (bufferSize - minimumBufferDistance));
                        // Update all
                        for (i = 0; i < updateCount; i++) {
                            itemIndex = topRenderedIndex + i;
                            item = listItems[i];
                            me.updateListItem(item, itemIndex, info);
                        }
                    }
                    else {
                        for (i = 0; i < updateCount; i++) {
                            itemIndex = topRenderedIndex - i - 1;
                            if (itemIndex < 0) {
                                break;
                            }

                            item = listItems.pop();
                            listItems.unshift(item);
                            me.updateListItem(item, itemIndex, info);
                            me.topRenderedIndex--;
                        }
                    }
                }
            }
            // When we are scrolling down
            else {
                bufferDistance = bufferSize - (topVisibleIndex - topRenderedIndex);

                if (bufferDistance < minimumBufferDistance) {
                    updateCount = Math.min(itemsCount, minimumBufferDistance - bufferDistance);

                    if (updateCount == itemsCount) {
                        me.topRenderedIndex = topRenderedIndex = Math.min(lastIndex - itemsCount, topVisibleIndex - minimumBufferDistance);
                        // Update all
                        for (i = 0; i < updateCount; i++) {
                            itemIndex = topRenderedIndex + i;
                            item = listItems[i];
                            me.updateListItem(item, itemIndex, info);
                        }
                    }
                    else {
                        for (i = 0; i < updateCount; i++) {
                            itemIndex = topRenderedIndex + itemsCount + i;
                            if (itemIndex > lastIndex) {
                                break;
                            }

                            item = listItems.shift();
                            listItems.push(item);
                            me.updateListItem(item, itemIndex, info);
                            me.topRenderedIndex++;
                        }
                    }
                }
            }
        }
    },

    onAnimationIdle: function() {
        var me = this,
            info = me.getListItemInfo(),
            bufferSize = me.getBufferSize(),
            topVisibleIndex = me.topVisibleIndex,
            topRenderedIndex = me.topRenderedIndex,
            lastIndex = me.getStore().getCount() - 1,
            listItems = me.listItems,
            itemsCount = listItems.length,
            topBufferDistance, bottomBufferDistance,
            i, ln, item, itemIndex;

        topBufferDistance = topVisibleIndex - topRenderedIndex;
        bottomBufferDistance = topRenderedIndex + bufferSize - topVisibleIndex;

        if (topBufferDistance < bottomBufferDistance) {
            // This means there are more items below the visible list. The user
            // has probably just scrolled up. In this case we move some items
            // from the bottom to the top only if the list is scrolled down a bit
            if (topVisibleIndex > 0) {
                ln = bottomBufferDistance - topBufferDistance;

                for (i = 0; i < ln; i++) {
                    itemIndex = topRenderedIndex - i - 1;
                    if (itemIndex < 0) {
                        break;
                    }

                    item = listItems.pop();
                    listItems.unshift(item);
                    me.updateListItem(item, itemIndex, info);
                    me.topRenderedIndex--;
                }
            }
        }
        else {
            ln = topBufferDistance - bottomBufferDistance;
            for (i = 0; i < ln; i++) {
                itemIndex = topRenderedIndex + itemsCount + i;
                if (itemIndex > lastIndex) {
                    break;
                }

                item = listItems.shift();
                listItems.push(item);
                me.updateListItem(item, itemIndex, info);
                me.topRenderedIndex++;
            }
        }

        me.handleItemHeights();
        me.handleItemTransforms();

        me.onIdleBound = false;
    },

    handleItemHeights: function() {
        var me = this,
            updatedItems = me.updatedItems,
            ln = updatedItems.length,
            itemMap = me.getItemMap(),
            useSimpleItems = me.getUseSimpleItems(),
            minimumHeight = itemMap.getMinimumHeight(),
            headerIndices = me.headerIndices,
            headerMap = me.headerMap,
            variableHeights = me.getVariableHeights(),
            itemIndex, body, i, j, jln, item, height, scrollDockHeight;

        for (i = 0; i < ln; i++) {
            item = updatedItems[i];
            itemIndex = item.$dataIndex;

            // itemIndex may not be set yet if the store is still being loaded
            if (itemIndex !== null) {
                if (variableHeights) {
                    height = useSimpleItems ? item.element.getHeight() : item.element.getFirstChild().getHeight();
                    height = Math.max(height, minimumHeight);
                } else {
                    height = minimumHeight;
                }

                item.$ownItemHeight = height;

                jln = me.scrollDockItems.top.length;
                if (item.isFirst) {
                    me.totalScrollDockTopHeight = 0;
                    for (j = 0; j < jln; j++) {
                        scrollDockHeight = me.scrollDockItems.top[j].$scrollDockHeight;
                        height += scrollDockHeight;
                        me.totalScrollDockTopHeight += scrollDockHeight;
                    }
                }

                jln = me.scrollDockItems.bottom.length;
                if (item.isLast) {
                    for (j = 0; j < jln; j++) {
                        scrollDockHeight = me.scrollDockItems.bottom[j].$scrollDockHeight;
                        height += scrollDockHeight;
                    }
                }

                if (item.getHeader && headerIndices && item.getHeader() && headerIndices[itemIndex]) {
                    height += me.headerHeight;
                }

                // body height may vary so we dynamically get the height per item
                if (item.getBody && (body = item.getBody()) && body.renderElement && body.isVisible()) {
                    height += body.renderElement.getHeight();
                }

                itemMap.setItemHeight(itemIndex, height);
                item.$height = height;
            }
        }

        itemMap.update();

        headerMap.length = 0;
        for (i in headerIndices) {
            if (headerIndices.hasOwnProperty(i)) {
                headerMap.push(itemMap.map[i]);
            }
        }

        me.updatedItems.length = 0;

        me.refreshScroller(true);
    },

    handleItemTransforms: function() {
        var me = this,
            listItems = me.listItems,
            itemsCount = listItems.length,
            itemMap = me.getItemMap(),
            scrollDockItems = me.scrollDockItems,
            grouped = me.isGrouping(),
            item, header, transY, i, jln, j;

        for (i = 0; i < itemsCount; i++) {
            item = listItems[i];
            transY = itemMap.map[item.$dataIndex];

            if (!item.$hidden && item.$position !== transY) {
                item.$position = transY;

                jln = scrollDockItems.top.length;
                if (item.isFirst && jln) {
                    for (j = 0; j < jln; j++) {
                        me.translate(scrollDockItems.top[j], 0, transY);
                        transY += scrollDockItems.top[j].$scrollDockHeight;
                    }
                }

                header = item.getHeader && item.getHeader();
                if (grouped && header && me.headerIndices && me.headerIndices[item.$dataIndex]) {
                    me.translate(header, 0, transY);
                    transY += me.headerHeight;
                }

                me.translate(item, 0, transY);
                transY += item.$ownItemHeight;

                jln = scrollDockItems.bottom.length;
                if (item.isLast && jln) {
                    for (j = 0; j < jln; j++) {
                        me.translate(scrollDockItems.bottom[j], 0, transY);
                        transY += scrollDockItems.bottom[j].$scrollDockHeight;
                    }
                }
            }
        }
    },

    handlePinnedHeader: function(y) {
        var me = this,
            pinnedHeader = me.getPinnedHeader(),
            itemMap = me.getItemMap(),
            groups = me.groups,
            headerMap = me.headerMap,
            headerHeight = me.headerHeight,
            store = me.getStore(),
            totalScrollDockTopHeight = me.totalScrollDockTopHeight,
            record, closestHeader, pushedHeader, transY, headerString;

        closestHeader = itemMap.binarySearch(headerMap, -y);
        record = groups.getAt(closestHeader).getAt(0);

        if (record) {
            pushedHeader = y + headerMap[closestHeader + 1] - headerHeight;
            // Top of the list or above (hide the pinned header offscreen)
            if (y >= 0 || (closestHeader === 0 && totalScrollDockTopHeight + y >= 0) || (closestHeader === 0 && -y <= headerMap[closestHeader])) {
                transY = -10000;
            }
            // Scroll the pinned header a bit
            else if (pushedHeader < 0) {
                transY = pushedHeader;
            }
            // Stick to the top of the screen
            else {
                transY = Math.max(0, y);
            }

            headerString = store.getGrouper().getGroupString(record);

            if (pinnedHeader.$currentHeader != headerString) {
                pinnedHeader.setHtml(headerString);
                pinnedHeader.$currentHeader = headerString;
            }

            if (pinnedHeader.$position != transY) {
                me.translate(pinnedHeader, 0, transY);
                pinnedHeader.$position = transY;
            }
        }
    },

    createItem: function(config) {
        var me = this,
            container = me.container,
            listItems = me.listItems,
            infinite = me.getInfinite(),
            scrollElement = me.scrollElement,
            item, header;

        config.$initParent = me;
        item = Ext.factory(config);
        delete config.$initParent;
        item.dataview = me;
        item.$height = config.minHeight;

        header = item.getHeader && item.getHeader();
        if (header) {
            if (infinite) {
                header.setTranslatable({
                    translationMethod: this.translationMethod
                });
                me.translate(header, 0, -10000);

                scrollElement.insertFirst(header.renderElement);
            }
        }

        container.doAdd(item);
        listItems.push(item);

        return item;
    },

    onItemHeightChange: function() {
        this.handleItemHeights();
        this.updateAllListItems();
    },

    setItemsCount: function(itemsCount, itemConfig) {
        var me = this,
            listItems = me.listItems,
            config = itemConfig || me.getListItemConfig(),
            difference = itemsCount - listItems.length,
            i;

        // This loop will create new items if the new itemsCount is higher than the amount of items we currently have
        for (i = 0; i < difference; i++) {
            me.createItem(config);
        }

        // This loop will destroy unneeded items if the new itemsCount is lower than the amount of items we currently have
        for (i = difference; i < 0; i++) {
            listItems.pop().destroy();
        }

        me.itemsCount = itemsCount;

        // Finally we update all the list items with the correct content
        me.updateAllListItems();

        //Android Stock bug where redraw is needed to show empty list
        if (Ext.browser.is.AndroidStock && me.container.element && itemsCount === 0 && difference !== 0) {
            me.container.element.redraw();
        }

        return me.listItems;
    },

    updateListItem: function(item, index, info) {
        var me = this,
            recordMap = me.recordMap,
            oldRecord = item.getRecord(),
            store = info.store,
            grouped = info.grouped,
            record = store.getAt(index),
            headerIndices = me.headerIndices,
            footerIndices = me.footerIndices,
            header = item.getHeader && item.getHeader(),
            scrollDockItems = me.scrollDockItems,
            updatedItems = me.updatedItems,
            infinite = me.getInfinite(),
            storeCount = store.getCount(),
            grouper = store.getGrouper(),
            itemCls = [],
            headerCls = [],
            firstCls = me.firstCls,
            lastCls = me.lastCls,
            groupFirstCls = me.groupFirstCls,
            groupLastCls = me.groupLastCls,
            oddCls = me.oddCls,
            selectedCls = me.selectedCls,
            itemRemoveCls = [firstCls, lastCls, groupFirstCls, groupLastCls, selectedCls, oddCls],
            headerRemoveCls = [firstCls, lastCls, groupFirstCls, groupLastCls],
            ln, i, scrollDockItem, viewModel;

        // When we update a list item, the header and scrolldocks can make it have to be retransformed.
        // For that reason we want to always set the position to -10000 so that the next time we translate
        // all the pieces are transformed to the correct location
        if (infinite) {
            item.$position = -10000;
        }

        // Avoid recursion
        item.$updating = true;

        // We begin by hiding/showing the item and its header depending on a record existing at this index
        if (!record) {
            item.setRecord(null);
            if (oldRecord && recordMap[oldRecord.internalId] === item) {
                delete recordMap[oldRecord.internalId];
            }
            if (infinite) {
                me.translate(item, 0, -10000);
            } else {
                item.hide();
            }

            if (header) {
                if (infinite) {
                    me.translate(header, 0, -10000);
                } else {
                    header.hide();
                }
            }
            item.$hidden = true;
            item.$updating = false;
            return;
        } else if (item.$hidden) {
            if (!infinite) {
                item.show();
            }
            item.$hidden = false;
        }

        if (infinite) {
            updatedItems.push(item);
        }

        // If this item was previously used for the first record in the store, and now it will not be, then we hide
        // any scrollDockTop items and change the isFirst flag
        if (item.isFirst && index !== 0) {
            ln = scrollDockItems.top.length;
            for (i = 0; i < ln; i++) {
                scrollDockItem = scrollDockItems.top[i];
                if (infinite) {
                    me.translate(scrollDockItem, 0, -10000);
                }
            }
            item.isFirst = false;
        }

        // If this item was previously used for the last record in the store, and now it will not be, then we hide
        // any scrollDockBottom items and change the istLast flag
        if (item.isLast && index !== storeCount - 1) {
            ln = scrollDockItems.bottom.length;
            for (i = 0; i < ln; i++) {
                scrollDockItem = scrollDockItems.bottom[i];
                if (infinite) {
                    me.translate(scrollDockItem, 0, -10000);
                }
            }
            item.isLast = false;
        }

        // If the item is already bound to this record then we shouldn't have to do anything
        if (item.$dataIndex !== index) {
            item.$dataIndex = index;
            me.fireEvent('itemindexchange', me, record, index, item);
        }

        // This is where we actually update the item with the record
        if (oldRecord === record) {
            item.updateRecord(record);
        } else {
            if (oldRecord && recordMap[oldRecord.internalId] === item) {
                delete recordMap[oldRecord.internalId];
            }
            recordMap[record.internalId] = item;
            item.setRecord(record);

            viewModel = item.getViewModel();
            if (viewModel) {
                viewModel.set('record', record);
            }
        }

        if (me.isSelected(record)) {
            itemCls.push(selectedCls);
        }

        if (grouped) {
            if (header && headerIndices[index]) {
                itemCls.push(groupFirstCls);
                header.setHtml(grouper.getGroupString(record));

                // The header must always be the previous sibling of its item, even
                // in infinite mode where absolute positioning is used.  This allows
                // for the item's top border to act as the bottom border of the header
                // and for the theme to style the item using the next sibling selector.
                header.renderElement.insertBefore(item.renderElement);
                header.show();
            } else if (header) {
                if (infinite) {
                    me.translate(header, 0, -10000);
                } else {
                    header.hide();
                }
            }
            if (footerIndices[index]) {
                itemCls.push(groupLastCls);
            }
        }

        if (header && !grouped) {
            if (infinite) {
                me.translate(header, 0, -10000);
            } else {
                header.hide();
            }
        }

        if (index === 0) {
            item.isFirst = true;

            if (header && grouped) {
                headerCls.push(firstCls);
            } else {
                itemCls.push(firstCls);
            }

            if (!infinite) {
                for (i = 0, ln = scrollDockItems.top.length; i < ln; i++) {
                    scrollDockItem = scrollDockItems.top[i];
                    if (grouped) {
                        scrollDockItem.renderElement.insertBefore(header.renderElement);
                    } else {
                        scrollDockItem.renderElement.insertBefore(item.renderElement);
                    }
                }
            }
        }

        if (index === storeCount - 1) {
            item.isLast = true;
            itemCls.push(lastCls);

            if (!infinite) {
                for (i = 0, ln = scrollDockItems.bottom.length; i < ln; i++) {
                    scrollDockItem = scrollDockItems.bottom[i];
                    scrollDockItem.renderElement.insertAfter(item.renderElement);
                }
            }
        }

        if (info.striped && index % 2 === 1) {
            itemCls.push(oddCls);
        }

        item.renderElement.replaceCls(itemRemoveCls, itemCls);
        if (header) {
            header.renderElement.replaceCls(headerRemoveCls, headerCls);
        }
        item.$updating = false;
    },

    updateAllListItems: function() {
        var me = this,
            store, items, info, topRenderedIndex, i, ln;

        if (!me.initialized) {
            return;
        }

        store = me.getStore();
        items = me.listItems;
        info = me.getListItemInfo();
        topRenderedIndex = me.topRenderedIndex;

        if (store) {
            for (i = 0, ln = items.length; i < ln; i++) {
                me.updateListItem(items[i], topRenderedIndex + i, info);
            }
        }

        if (me.isPainted()) {
            if (me.getInfinite() && store && store.getCount()) {
                me.handleItemHeights();
            }
            me.refreshScroller();
        }
    },

    doRefresh: function() {
        var me = this,
            infinite = me.getInfinite(),
            container = me.container,
            scroller = container.getScrollable(),
            storeCount = me.getStore().getCount();

        if (infinite) {
            me.getItemMap().populate(storeCount, this.topRenderedIndex);
        }

        if (me.getGrouped()) {
            me.refreshHeaderIndices();
        }

        // This will refresh the items on the screen with the new data
        if (storeCount) {
            me.hideScrollDockItems();
            me.hideEmptyText();
            if (!infinite) {
                me.setItemsCount(storeCount);
                if (me.getScrollToTopOnRefresh()) {
                    scroller.scrollTo(0, 0);
                }
            } else {
                if (me.getScrollToTopOnRefresh()) {
                    me.topRenderedIndex = 0;
                    me.topVisibleIndex = 0;
                    scroller.scrollTo(null, 0);
                }
                me.updateAllListItems();
            }
        } else {
            me.onStoreClear();
        }

        if (me.getIndexBar()) {
            me.handleIndexBarSize();
        }

        me._fireResizeOnNextPaint = false;
        me.onContainerResize(container, { height: container.element.getHeight() });
    },

    updateStore: function(store, oldStore) {
        var me = this,
            container = me.container;

        me.callParent([store, oldStore]);

        if (me._fireResizeOnNextLoad && me.hasLoadedStore) {
            me._fireResizeOnNextLoad = false;
            me.onContainerResize(container, { height: container.element.getHeight() });
        }
    },

    onLoad: function(store) {
        var me = this,
            container = me.container;

        me.callParent([store]);

        if (me._fireResizeOnNextLoad) {
            me._fireResizeOnNextLoad = false;
            me.onContainerResize(container, { height: container.element.getHeight() });
        }
    },

    onContainerResize: function(container, size) {
        var me = this,
            store = me.getStore(),
            currentVisibleCount, newVisibleCount, minHeight, listItems, item, itemMap,
            itemBody, itemConfig, pinnedHeaderElement;


        // This will cause a resize to be called on the next painted event
        // we do this because data has changed while the grid was hidden.
        // so we cannot measure the row sizes properly, we need to wait for the grid
        // to become visible again to re-calculate
        if (!me.isPainted()) {
            if (!me._fireResizeOnNextPaint) {
                me.on({
                    painted: 'refresh',
                    single: true
                });
                me._fireResizeOnNextPaint = true;
            }
            return;
        }

        if (!me.headerHeight) {
            pinnedHeaderElement = me.getPinnedHeader().renderElement;
            me.headerHeight = parseInt(pinnedHeaderElement.getHeight(), 10) -
                // the pinned header may have an extra bottom border that normal headers
                // do not have because normal headers get their visual "bottom" border from
                // the top border of the first item in the group item below.
                pinnedHeaderElement.getBorderWidth('b');
        }

        if (me.getInfinite()) {
            itemMap = me.getItemMap();
            minHeight = itemMap.getMinimumHeight();

            if (!store || !store.getCount()) {
                // If the store is not yet loaded we can't measure the height of the first item
                // to determine minHeight
                // TODO: refactor
                me._fireResizeOnNextLoad = true;
                return;
            }

            if (!minHeight) {
                listItems = me.listItems;

                // If there was no itemHeight/minHeight specified, we measure and cache
                // the height of the first item for purposes of buffered rendering
                // caluclations.
                // TODO: this won't handle variable row heights

                if (!listItems.length) {
                    // make sure the list contains at least one item so that we can measure
                    // its height from the dom.  Don't worry about ending up with the wrong
                    // number of items - it will be corrected when we invoke setItemsCount
                    // shortly
                    itemConfig = me.getListItemConfig();
                    me.createItem(itemConfig);
                    item = listItems[0];
                    me.updateListItem(item, 0, me.getListItemInfo());
                    me.visibleCount++;

                    minHeight = item.element.getHeight();

                    // If we have a RowBody that is visible on first render we need to subtract its height
                    // as the minHeight of the row would be the collapsed state when the RowBody is hidden
                    itemBody = item.getBody && item.getBody();
                    if (itemBody && itemBody.renderElement && itemBody.isVisible()) {
                        minHeight -= itemBody.renderElement.getHeight();
                    }
                }

                // cache the minimum height on the itemMap for next time
                itemMap.setMinimumHeight(minHeight);
                me.getItemMap().populate(me.getStore().getCount(), me.topRenderedIndex);
            }

            currentVisibleCount = me.visibleCount;

            // (minHeight || 1) here as a protection in case minHeight is 0 would assign Infinity to newVisibleCount
            newVisibleCount = Math.ceil(size.height / (minHeight || 1));

            if (newVisibleCount != currentVisibleCount) {
                me.visibleCount = newVisibleCount;
                me.setItemsCount(newVisibleCount + me.getBufferSize(), itemConfig);
                // This is a private event used by some plugins
                me.fireEvent('updatevisiblecount', this, newVisibleCount, currentVisibleCount);
            }
        } else if (me.listItems.length && me.getGrouped() && me.getPinHeaders()) {
            // Whenever the container resizes, headers might be in different locations. For this reason
            // we refresh the header position map
            me.updateHeaderMap();
        }
    },

    refreshScroller: function(skipOnRefresh) {
        var me = this,
            scroller = me.container.getScrollable(),
            height, scrollSize;

        if (me.getInfinite()) {
            height = me.getItemMap().getTotalHeight();
            scrollSize = scroller.getSize();

            if (height != scrollSize.y) {
                scroller.setSize({
                    y: height
                });
            }
        }

        me.afterRefreshScroller(scroller, skipOnRefresh);
    },

    afterRefreshScroller: function(scroller, skipOnRefresh) {
        var me = this;

        if (me.getInfinite()) {
            if (!skipOnRefresh) {
                me.onScrollerRefresh(scroller);
            }
        } else {
            if (me.getGrouped() && me.getPinHeaders()) {
                me.updateHeaderMap();
            }
        }
    },

    updateHeaderMap: function() {
        var me = this,
            headerMap = me.headerMap,
            headerIndices = me.headerIndices,
            header, i;

        headerMap.length = 0;
        for (i in headerIndices) {
            if (headerIndices.hasOwnProperty(i)) {
                header = me.getItemAt(i).getHeader();
                headerMap.push(header.renderElement.dom.offsetTop);
            }
        }
    },

    applyVariableHeights: function(value) {
        if (!this.getInfinite()) {
            return true;
        }
        return value;
    },

    applyDefaultType: function(defaultType) {
        if (!defaultType) {
            defaultType = this.getUseSimpleItems() ? 'simplelistitem' : 'listitem';
        }
        return defaultType;
    },

    applyItemMap: function(itemMap) {
        return Ext.factory(itemMap, Ext.util.PositionMap, this.getItemMap());
    },

    updateItemHeight: function(itemHeight) {
        this.getItemMap().setMinimumHeight(itemHeight);
    },

    applyIndexBar: function(indexBar) {
        if (indexBar) {
            if (indexBar === true) {
                indexBar = {};
            }

            Ext.apply(indexBar, {
                parentList: this
            });
        }

        return Ext.factory(indexBar, Ext.dataview.IndexBar, this.getIndexBar());
    },

    updatePinHeaders: function(pinnedHeaders) {
        var me = this,
            pinnedHeader;

        if (me.isPainted()) {
            pinnedHeader = me.getPinnedHeader();
            me.translate(pinnedHeader, 0, pinnedHeaders ? pinnedHeader.$position : -10000);
        }
    },

    updateItemTpl: function(newTpl) {
        var me = this,
            listItems = me.listItems,
            ln = listItems.length || 0,
            i, listItem;

        for (i = 0; i < ln; i++) {
            listItem = listItems[i];
            listItem.setTpl(newTpl);
        }

        me.updateAllListItems();
    },

    updateItemCls: function(newCls, oldCls) {
        var items = this.listItems,
            ln = items.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            item.removeCls(oldCls);
            item.addCls(newCls);
        }
    },

    updateIndexBar: function(indexBar, oldIndexBar) {
        var me = this;

        if (oldIndexBar) {
            oldIndexBar.setParentList(null);
            oldIndexBar.destroy();
        }

        if (indexBar) {
            indexBar.on({
                scope: me,
                index: me.onIndex,
                directionchange: me.handleIndexBarSize
            });

            me.container.element.appendChild(indexBar.renderElement);

            me.handleIndexBarSize();
        }
    },

    updateGrouped: function(grouped) {
        if (this.initialized) {
            this.handleGroupChange();
        }
    },

    onStoreGroupChange: function() {
        if (this.initialized) {
            this.handleGroupChange();
        }
    },

    onStoreAdd: function() {
        this.doRefresh();
    },

    onStoreRemove: function() {
        this.doRefresh();
    },

    onStoreUpdate: function(store, record, type, modifiedFieldNames, info) {
        var me = this,
            index, item;

        if (info.indexChanged) {
            me.doRefresh();
        } else {
            index = store.indexOf(record);
            item = me.getItem(record);
            if (item) {
                me.updateListItem(item, index, me.getListItemInfo());
            }
        }
    },

    onStoreClear: function() {
        var me = this,
            scroller = me.container.getScrollable(),
            infinite = me.getInfinite(),
            pinnedHeader = me.getPinnedHeader();

        if (pinnedHeader) {
            me.translate(pinnedHeader, 0, -10000);
        }

        me.getItemMap().populate(0, 0);

        if (!infinite) {
            me.setItemsCount(0);
        } else {
            me.topRenderedIndex = 0;
            me.topVisibleIndex = 0;
            me.updateAllListItems();
        }

        me.showEmptyText();

        scroller.scrollTo(null, 0);
        me.refreshScroller();
    },

    showEmptyScrollDock: function() {
        var me = this,
            infinite = me.getInfinite(),
            scrollDockItems = me.scrollDockItems,
            offset = 0,
            i, ln, item;

        for (i = 0, ln = scrollDockItems.top.length; i < ln; i++) {
            item = scrollDockItems.top[i];
            if (infinite) {
                me.translate(item, 0, offset);
                offset += item.$scrollDockHeight;
            } else {
                this.scrollElement.appendChild(item.renderElement);
            }
        }

        for (i = 0, ln = scrollDockItems.bottom.length; i < ln; i++) {
            item = scrollDockItems.bottom[i];
            if (infinite) {
                me.translate(item, 0, offset);
                offset += item.$scrollDockHeight;
            } else {
                this.scrollElement.appendChild(item.renderElement);
            }
        }
    },

    hideScrollDockItems: function() {
        var me = this,
            infinite = me.getInfinite(),
            scrollDockItems = me.scrollDockItems,
            i, ln, item;

        if (!infinite) {
            return;
        }

        for (i = 0, ln = scrollDockItems.top.length; i < ln; i++) {
            item = scrollDockItems.top[i];
            me.translate(item, 0, -10000);
        }

        for (i = 0, ln = scrollDockItems.bottom.length; i < ln; i++) {
            item = scrollDockItems.bottom[i];
            me.translate(item, 0, -10000);
        }
    },

    /**
     * Gets a list item by record.
     * @param {Ext.data.Model} The record
     * @return {Ext.dataview.component.(Simple)ListItem} The list item, if found.
     * `null` if no matching item exists.
     */
    getItem: function(record) {
        var item;
        if (record) {
            item = this.recordMap[record.internalId];
        }
        return item || null;
    },

    /**
     * Returns an item at the specified index.
     * @param {Number} index Index of the item.
     * @return {Ext.dom.Element/Ext.dataview.component.DataItem} item Item at the specified index.
     */
    getItemAt: function(index) {
        var listItems = this.listItems,
            ln = listItems.length,
            i, listItem;

        for (i = 0; i < ln; i++) {
            listItem = listItems[i];
            if (listItem.$dataIndex == index) {
                return listItem;
            }
        }
    },

    getListItems: function() {
        return this.listItems.slice();
    },

    /**
     * Returns an index for the specified item.
     * @param {Number} item The item to locate.
     * @return {Number} Index for the specified item.
     */
    getItemIndex: function(item) {
        return item.$dataIndex;
    },

    /**
     * Returns an array of the current items in the DataView.
     * @return {Ext.dom.Element[]/Ext.dataview.component.DataItem[]} Array of Items.
     */
    getViewItems: function() {
        return this.listItems;
    },

    getListItemInfo: function() {
        var me = this;

        return {
            store: me.getStore(),
            grouped: me.isGrouping(),
            striped: me.getStriped(),
            itemMap: me.getItemMap(),
            defaultItemHeight: me.getItemHeight()
        };
    },

    getListItemConfig: function() {
        var me = this,
            minimumHeight = me.getItemMap().getMinimumHeight(),
            config = {
                xtype: me.getDefaultType(),
                tpl: me.getItemTpl(),
                minHeight: minimumHeight,
                cls: me.getItemCls()
            };

        if (me.getInfinite()) {
            config.translatable = {
                translationMethod: this.translationMethod
            };
        }

        if (!me.getVariableHeights()) {
            config.height = minimumHeight;
        }

        return Ext.merge(config, me.getItemConfig());
    },

    refreshHeaderIndices: function() {
        var me = this,
            store = me.getStore(),
            storeLn = store && store.getCount(),
            groups = store.getGrouper() ? store.getGroups() : null,
            grouped = me.getGrouped(),
            headerIndices = me.headerIndices = {},
            footerIndices = me.footerIndices = {},
            i, previousIndex, firstGroupedRecord, storeIndex, groupLn;

        if (!grouped || !groups) {
            return footerIndices;
        }
        groupLn = groups.length;
        me.groups = groups;

        for (i = 0; i < groupLn; i++) {
            firstGroupedRecord = groups.getAt(i).getAt(0);
            storeIndex = store.indexOf(firstGroupedRecord);
            headerIndices[storeIndex] = true;

            previousIndex = storeIndex - 1;
            if (previousIndex >= 0) {
                footerIndices[previousIndex] = true;
            }
        }

        footerIndices[storeLn - 1] = true;

        return headerIndices;
    },

    /**
     *
     * Scrolls the list so that the specified record is at the top.
     *
     * @param {Ext.data.Model} record Record in the store to scroll to.
     * @param {Boolean} [animate=false] Determines if scrolling is animated.
     * @param {Boolean} [overscroll=true] Determines if list can be overscrolled.
     */
    scrollToRecord: function(record, animate, overscroll) {
        var me = this,
            scroller = me.container.getScrollable(),
            store = me.getStore(),
            index = store.indexOf(record),
            header, offset, item,
            elementHeight, scrollHeight, maxOffset, el;

        //make sure the new offsetTop is not out of bounds for the scroller
        elementHeight = scroller.getElement().getHeight();
        scrollHeight = scroller.getSize().y;
        maxOffset = scrollHeight - elementHeight;

        if (me.getInfinite()) {
            offset = me.getItemMap().map[index];
        } else {
            item = me.listItems[index];
            header = item.getHeader && item.getHeader();

            el = header && header.isPainted() ? header : item;
            offset = el.renderElement.dom.offsetTop;
        }

        if (!overscroll) {
            offset = Math.min(offset, maxOffset);
        }

        scroller.scrollTo(null, offset, !!animate);
    },

    onItemAdd: function(item, index) {
        var me = this,
            config = item.config;

        if (config.scrollDock) {
            if (config.scrollDock == 'bottom') {
                me.scrollDockItems.bottom.push(item);
            } else {
                me.scrollDockItems.top.push(item);
            }

            if (me.getInfinite()) {
                item.on({
                    resize: 'onScrollDockItemResize',
                    scope: this
                });

                item.addCls(me.scrollDockCls);
                item.setTranslatable({
                    translationMethod: this.translationMethod
                });
                me.translate(item, 0, -10000);
                item.$scrollDockHeight = 0;
            }

            me.container.doAdd(item);
        } else {
            me.callParent([item, index]);
        }
    },

    /**
     * Returns all the items that are docked in the scroller in this list.
     * @return {Ext.Component[]} An array of the scrollDock items
     */
    getScrollDockedItems: function() {
        return this.scrollDockItems.bottom.slice().concat(this.scrollDockItems.top.slice());
    },

    onScrollDockItemResize: function(dockItem, size) {
        var me = this,
            items = me.listItems,
            ln = items.length,
            i, item;

        Ext.getCmp(dockItem.id).$scrollDockHeight = size.height;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.isLast) {
                me.updatedItems.push(item);
                if (me.isPainted()) {
                    me.refreshScroller();
                }
                break;
            }
        }
    },

    onItemTouchStart: function(e) {
        var me = this,
            isDisclosure = e.getTarget(me.disclosureSelector);

        if (!isDisclosure) {
            me.container.innerElement.on({
                touchmove: 'onItemTouchMove',
                delegate: '.' + Ext.baseCSSPrefix + 'listitem',
                single: true,
                scope: me
            });

            me.callParent(me.parseEvent(e));
        }
    },

    onItemTouchMove: function(e) {
        this.callParent(this.parseEvent(e));
    },

    onItemTouchEnd: function(e) {
        var me = this,
            isDisclosure = e.getTarget(me.disclosureSelector);

        if (!isDisclosure) {
            me.container.innerElement.un({
                touchmove: 'onItemTouchMove',
                delegate: '.' + Ext.baseCSSPrefix + 'listitem',
                scope: me
            });

            me.callParent(me.parseEvent(e));
        }
    },

    onItemTap: function(e) {
        this.callParent(this.parseEvent(e));
    },

    onItemTapHold: function(e) {
        this.callParent(this.parseEvent(e));
    },

    onItemSingleTap: function(e) {
        this.callParent(this.parseEvent(e));
    },

    onItemDoubleTap: function(e) {
        this.callParent(this.parseEvent(e));
    },

    onItemSwipe: function(e) {
        this.callParent(this.parseEvent(e));
    },

    onItemMouseOver: function(e) {
        this.callParent(this.parseEvent(e));
    },

    onItemMouseOut: function(e) {
        this.callParent(this.parseEvent(e));
    },

    parseEvent: function(e) {
        var me = this,
            target = e.getTarget(me.itemSelector),
            item = Ext.getCmp(target.id);

        return [me, item, item.$dataIndex, e];
    },

    applyOnItemDisclosure: function(config) {
        if (Ext.isFunction(config)) {
            return {
                scope: this,
                handler: config
            };
        }
        return config;
    },

    handleItemDisclosure: function(e) {
        var me = this,
            item = Ext.getCmp(Ext.get(e.currentTarget).up(me.itemSelector).id),
            index = item.$dataIndex,
            record = me.getStore().getAt(index);

        me.fireAction('disclose', [me, record, item, index, e], 'doDisclose');
    },

    doDisclose: function(me, record, item, index, e) {
        var onItemDisclosure = me.getOnItemDisclosure(),
            handler = onItemDisclosure,
            scope;

        if (handler && handler !== true) {
            if (handler.handler) {
                scope = handler.scope;
                handler = handler.handler;
            }

            Ext.callback(handler, scope, [record, item, index, e], 0, me);
        }
    },

    // apply to the selection model to maintain visual UI cues
    onItemTrigger: function(me, index, target, record, e) {
        if (!(this.getPreventSelectionOnDisclose() && e.getTarget(me.disclosureSelector))) {
            this.callParent(arguments);
        }
    },

    doDestroy: function() {
        var me = this,
            indexBarTask = me.indexBarTask;

        if (indexBarTask) {
            indexBarTask.cancel();
            me.indexBarTask = null;
        }

        me.getPinnedHeader().destroy();
        me.setIndexBar(null);

        if (me.onIdleBound) {
            Ext.AnimationQueue.unIdle(me.onAnimationIdle, me);
        }

        me.callParent();
    },

    updateInfinite: function(infinite) {
        this.toggleCls(this.infiniteCls, !!infinite);
    },

    updateRowLines: function(rowLines) {
        this.container.innerElement.toggleCls(this.noRowLinesCls, rowLines === false);
    },

    applyPinnedHeader: function(pinnedHeader, oldPinnedHeader) {
        var me = this,
            container = me.container;

        pinnedHeader = Ext.apply(pinnedHeader, {
            list: me,
            translatable: {
                translationMethod: me.translationMethod
            }
        });

        pinnedHeader = Ext.factory(pinnedHeader, null, oldPinnedHeader);

        if (!oldPinnedHeader) {
            me.translate(pinnedHeader, 0, -10000);
            pinnedHeader.$position = -10000;
            container.element.insertFirst(pinnedHeader.renderElement);
        }

        return pinnedHeader;
    },

    privates: {
        translate: function(item, x, y) {
            var style;

            if (Ext.isIE || Ext.isEdge) {
                // workaround for https://gist.github.com/pguerrant/75a04df9dbff34d0051938af7b4598ac
                // TODO: feature detect this bug
                style = item.el.dom.style;
                style.top = (y || 0)  + 'px';
                style.left = (x || 0) + 'px';
            } else {
                item.translate(x, y);
            }
        },

        doHandleIndexBarSize: function() {
            var me = this,
                scroller = me.getScrollable(),
                indexBar = me.getIndexBar(),
                scrollerSize;

            if (indexBar) {
                scrollerSize = scroller.getScrollbarSize().width;
                if (scrollerSize !== me.lastScrollerSize) {
                    indexBar.renderElement.setStyle('padding-right', scrollerSize + 'px');
                    me.lastScrollerSize = scrollerSize;
                }
            }
        },

        handleGroupChange: function() {
            var me = this,
                grouped = me.isGrouping(),
                infinite = me.getInfinite(),
                pinnedHeader = me.getPinnedHeader(),
                cls = me.groupedCls;

            if (pinnedHeader) {
                me.translate(pinnedHeader, 0, -10000);
            }

            if (grouped) {
                me.addCls(cls);
            } else {
                me.removeCls(cls);
            }

            if (infinite) {
                me.refreshHeaderIndices();
                me.handleItemHeights();
            }
            me.updateAllListItems();
            if (infinite) {
                me.handleItemTransforms();
            }
        },

        handleIndexBarSize: function() {
            var me = this,
                task = me.indexBarTask;

            if (!task) {
                me.indexBarTask = task = new Ext.util.DelayedTask(me.doHandleIndexBarSize, me);
            }
            task.delay(1);
        },

        isGrouping: function() {
            var store = this.getStore();
            return Boolean(this.getGrouped() && store && store.getGrouper());
        },

        onIndex: function(indexBar, index) {
            var me = this,
                key = index.toLowerCase(),
                store = me.getStore(),
                groups = store.getGroups(),
                ln = groups.length,
                group, groupKey, i, closest;

            for (i = 0; i < ln; i++) {
                group = groups.getAt(i);
                groupKey = group.getGroupKey().toLowerCase();
                if (groupKey >= key) {
                    closest = group;
                    break;
                }
                else {
                    closest = group;
                }
            }

            if (closest) {
                this.scrollToRecord(closest.getAt(0));
            }
        }
    }
});
