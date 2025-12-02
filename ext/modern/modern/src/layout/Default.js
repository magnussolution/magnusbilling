/**
 *
 */
Ext.define('Ext.layout.Default', {
    extend: 'Ext.layout.Abstract',

    isAuto: true,

    alias: ['layout.default', 'layout.auto'],

    requires: [
        'Ext.util.Wrapper',
        'Ext.layout.wrapper.BoxDock',
        'Ext.layout.wrapper.Inner'
    ],

    config: {
        /**
         * @cfg {Ext.fx.layout.Card} animation Layout animation configuration
         * Controls how layout transitions are animated.  Currently only available for
         * Card Layouts.
         *
         * Possible values are:
         *
         * - cover
         * - cube
         * - fade
         * - flip
         * - pop
         * - reveal
         * - scroll
         * - slide
         * @accessor
         */
        animation: null
    },

    centerWrapperClass: Ext.baseCSSPrefix + 'center',

    dockWrapperClass: Ext.baseCSSPrefix + 'dock',

    cls: Ext.baseCSSPrefix + 'layout-auto',

    itemCls: Ext.baseCSSPrefix + 'layout-auto-item',

    positionMap: {
        top: 'start',
        left: 'start',
        middle: 'center',
        bottom: 'end',
        right: 'end'
    },

    positionDirectionMap: {
        top: 'vertical',
        bottom: 'vertical',
        left: 'horizontal',
        right: 'horizontal'
    },

    setContainer: function(container) {
        var me = this;

        me.dockedItems = [];

        me.callParent([container]);

        container.innerElement.addCls(me.cls);

        if (container.initialized) {
            me.onContainerInitialized();
        } else {
            container.onInitialized('onContainerInitialized', me);
        }
    },

    onContainerInitialized: function() {
        var me = this;

        me.handleDockedItemBorders();

        me.container.on({
            delegate: '> component',

            beforecenteredchange: 'onItemCenteredChange',
            positionedchange: 'onItemPositionedChange',
            afterdockedchange: 'onAfterItemDockedChange', // see Component#updateDocked

            scope: me
        });
    },

    monitorSizeStateChange: function() {
        this.monitorSizeStateChange = Ext.emptyFn;
        this.container.on('sizestatechange', 'onContainerSizeStateChange', this);
    },

    monitorSizeFlagsChange: function() {
        this.monitorSizeFlagsChange = Ext.emptyFn;
        this.container.on('sizeflagschange', 'onContainerSizeFlagsChange', this);
    },

    onItemAdd: function(item) {
        if (item.getDocked() != null) {
            this.dockItem(item);
        } else if (item.isCentered()) {
            this.onItemCenteredChange(item, true);
        } else if (item.isPositioned()) {
            this.onItemPositionedChange(item, true);
        } else if (item.isFloated()) {
            this.onItemFloatedChange(item, true);
        } else {
            this.onItemInnerStateChange(item, true);
        }
    },

    /**
     * @param {Ext.Component} item
     * @param {Boolean} isInner
     * @param {Boolean} [destroying]
     */
    onItemInnerStateChange: function(item, isInner, destroying) {
        var itemCls = this.itemCls;

        if (isInner) {
            this.insertInnerItem(item, this.container.innerIndexOf(item));
            item.addCls(itemCls);
        } else {
            this.removeInnerItem(item);
            item.removeCls(itemCls);
        }
    },

    insertInnerItem: function(item, index) {
        var container = this.container,
            containerDom = container.innerElement.dom,
            itemDom = item.element.dom,
            nextSibling = index !== -1 ? container.getInnerAt(index + 1) : null,
            nextSiblingDom = null,
            translatable;

        if (nextSibling) {
            translatable = nextSibling.getTranslatable();
            if (translatable && translatable.getUseWrapper()) {
                nextSiblingDom = translatable.getWrapper().dom;
            }
            else {
                nextSiblingDom = nextSibling ? nextSibling.element.dom : null;
            }
        }

        containerDom.insertBefore(itemDom, nextSiblingDom);

        return this;
    },

    insertBodyItem: function(item) {
        var container = this.container.setUseBodyElement(true),
            bodyDom = container.bodyElement.dom;

        if (item.getZIndex() === null) {
            item.setZIndex((container.indexOf(item) + 1) * 2);
        }

        bodyDom.insertBefore(item.element.dom, bodyDom.firstChild);

        return this;
    },

    removeInnerItem: function(item) {
        item.element.detach();
    },

    removeBodyItem: function(item) {
        item.setZIndex(null);
        item.element.detach();
    },

    onItemRemove: function(item, index, destroying) {
        if (item.getDocked()) {
            this.undockItem(item);
        }
        else if (item.isCentered()) {
            this.onItemCenteredChange(item, false);
        }
        else if (item.isPositioned()) {
            this.onItemPositionedChange(item, false);
        }
        else if (item.isFloated()) {
            this.unfloatItem(item, destroying);
        }
        else {
            this.onItemInnerStateChange(item, false, destroying);
        }
    },

    onItemMove: function(item, toIndex, fromIndex) {
        if (item.isCentered() || item.isPositioned()) {
            item.setZIndex((toIndex + 1) * 2);
        }
        else if (item.isInnerItem()) {
            this.insertInnerItem(item, this.container.innerIndexOf(item));
        }
        else {
            this.undockItem(item);
            this.dockItem(item);
        }
    },

    onItemCenteredChange: function(item, centered) {
        var wrapperName = '$centerWrapper';

        if (item.isFloated()) {
            item.center();
        } else {
            if (centered) {
                this.insertBodyItem(item);
                item.link(wrapperName, new Ext.util.Wrapper({
                    className: this.centerWrapperClass
                }, item.element));
            }
            else {
                item.unlink([wrapperName]);
                this.removeBodyItem(item);
            }
        }
    },

    onItemPositionedChange: function(item, positioned) {
        if (positioned) {
            this.insertBodyItem(item);
        }
        else {
            this.removeBodyItem(item);
        }
    },

    onItemFloatedChange: function(item, floated) {
        if (item.isFloated() !== floated) {
            if (floated) {
                this.floatItem(item);
            }
            else {
                this.unfloatItem(item);
            }
        }
    },

    onAfterItemDockedChange: function(item, docked, oldDocked) {
        // Prevent this from being called during initialization of child items, the
        // setting of docked on the component will occur before add to the container
        if (item.initialized) {
            if (oldDocked) {
                this.undockItem(item, oldDocked);
            }
            if (docked) {
                this.dockItem(item);
            }
        }
    },

    onContainerSizeStateChange: function() {
        var dockWrapper = this.getDockWrapper();

        if (dockWrapper) {
            dockWrapper.setSizeState(this.container.getSizeState());
        }
    },

    onContainerSizeFlagsChange: function() {
        var items = this.dockedItems,
            i, ln, item;

        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            this.refreshDockedItemLayoutSizeFlags(item);
        }
    },

    refreshDockedItemLayoutSizeFlags: function(item) {
        var container = this.container,
            dockedDirection = this.positionDirectionMap[item.getDocked()],
            binaryMask = (dockedDirection === 'horizontal') ? container.LAYOUT_HEIGHT : container.LAYOUT_WIDTH,
            flags = (container.getSizeFlags() & binaryMask);

        item.setLayoutSizeFlags(flags);
    },

    floatItem: function(item) {
        // Remove from being an inner component
        this.onItemInnerStateChange(item, false);
    },

    unfloatItem: function(item, destroying) {
        if (!destroying) {
            // Return to being an inner component
            this.onItemInnerStateChange(item, true);
        }
    },

    dockItem: function(item) {
        var me = this,
            DockClass = Ext.layout.wrapper.BoxDock,
            dockedItems = me.dockedItems,
            ln = dockedItems.length,
            container = me.container,
            itemIndex = container.indexOf(item),
            positionDirectionMap = me.positionDirectionMap,
            direction = positionDirectionMap[item.getDocked()],
            dockInnerWrapper = me.dockInnerWrapper,
            referenceDirection, i, dockedItem, index, previousItem, slice,
            referenceItem, referenceDocked, referenceWrapper, newWrapper, nestedWrapper, oldInnerWrapper;

        me.monitorSizeStateChange();
        me.monitorSizeFlagsChange();

        if (!dockInnerWrapper) {
            dockInnerWrapper = me.link('dockInnerWrapper', new Ext.layout.wrapper.Inner({
                container: container
            }));
        }

        if (ln === 0) {
            dockedItems.push(item);

            newWrapper = new DockClass({
                container: container,
                direction: direction
            });

            newWrapper.addItem(item);
            newWrapper.getElement().replace(dockInnerWrapper.getElement(), false);
            newWrapper.setInnerWrapper(dockInnerWrapper);
            container.onInitialized('onContainerSizeStateChange', me);
        }
        else {
            for (i = 0; i < ln; i++) {
                dockedItem = dockedItems[i];
                index = container.indexOf(dockedItem);

                if (index > itemIndex) {
                    referenceItem = previousItem || dockedItems[0];
                    dockedItems.splice(i, 0, item);
                    break;
                }

                previousItem = dockedItem;
            }

            if (!referenceItem) {
                referenceItem = dockedItems[ln - 1];
                dockedItems.push(item);
            }

            referenceDocked = referenceItem.getDocked();
            referenceWrapper = referenceItem.$dockWrapper;
            referenceDirection = positionDirectionMap[referenceDocked];

            if (direction === referenceDirection) {
                referenceWrapper.addItem(item);
            }
            else {
                slice = referenceWrapper.getItemsSlice(itemIndex);

                newWrapper = new DockClass({
                    container: container,
                    direction: direction
                });

                if (slice.length > 0) {
                    if (slice.length === referenceWrapper.itemsCount) {
                        nestedWrapper = referenceWrapper;
                        newWrapper.setSizeState(nestedWrapper.getSizeState());
                        newWrapper.getElement().replace(nestedWrapper.getElement(), false);
                    }
                    else {
                        nestedWrapper = new DockClass({
                            container: container,
                            direction: referenceDirection
                        });
                        nestedWrapper.setInnerWrapper(referenceWrapper.getInnerWrapper());
                        nestedWrapper.addItems(slice);
                        referenceWrapper.setInnerWrapper(newWrapper);
                    }

                    newWrapper.setInnerWrapper(nestedWrapper);
                }
                else {
                    oldInnerWrapper = referenceWrapper.getInnerWrapper();
                    referenceWrapper.setInnerWrapper(null);
                    newWrapper.setInnerWrapper(oldInnerWrapper);
                    referenceWrapper.setInnerWrapper(newWrapper);
                }

                newWrapper.addItem(item);
            }
        }

        if (container.initialized) {
            me.handleDockedItemBorders();
        }

        container.onInitialized('refreshDockedItemLayoutSizeFlags', me, [item]);
    },

    getDockWrapper: function() {
        var dockedItems = this.dockedItems;

        if (dockedItems.length > 0) {
            return dockedItems[0].$dockWrapper;
        }

        return null;
    },

    undockItem: function(item, oldDocked) {
        var me = this,
            dockedItems = me.dockedItems,
            lastBorderMask, lastBorderCollapse,
            dockWrapper = item.$dockWrapper;

        if (dockWrapper) {
            dockWrapper.removeItem(item, oldDocked);
        }

        if (me.container.initialized) {
            lastBorderMask = item.lastBorderMask;
            lastBorderCollapse = item.lastBorderCollapse;

            if (lastBorderMask) {
                item.lastBorderMask = 0;
                item.removeCls(me.noBorderClassTable[lastBorderMask]);
            }
            if (lastBorderCollapse) {
                item.lastBorderCollapse = 0;
                item.removeCls(me.getBorderCollapseTable()[lastBorderCollapse]);
            }

            me.handleDockedItemBorders();
        }

        Ext.Array.remove(dockedItems, item);

        item.setLayoutSizeFlags(0);
    },

    destroy: function() {
        this.dockedItems = null;
        this.callParent();
    },

    /**
     * This table contains the border removal classes indexed by the sum of the edges to
     * remove. Each edge is assigned a value:
     *
     *  * `left` = 1
     *  * `bottom` = 2
     *  * `right` = 4
     *  * `top` = 8
     *
     * @private
     */
    noBorderClassTable: [
        0,                                      // TRBL
        Ext.baseCSSPrefix + 'noborder-l',       // 0001 = 1
        Ext.baseCSSPrefix + 'noborder-b',       // 0010 = 2
        Ext.baseCSSPrefix + 'noborder-bl',      // 0011 = 3
        Ext.baseCSSPrefix + 'noborder-r',       // 0100 = 4
        Ext.baseCSSPrefix + 'noborder-rl',      // 0101 = 5
        Ext.baseCSSPrefix + 'noborder-rb',      // 0110 = 6
        Ext.baseCSSPrefix + 'noborder-rbl',     // 0111 = 7
        Ext.baseCSSPrefix + 'noborder-t',       // 1000 = 8
        Ext.baseCSSPrefix + 'noborder-tl',      // 1001 = 9
        Ext.baseCSSPrefix + 'noborder-tb',      // 1010 = 10
        Ext.baseCSSPrefix + 'noborder-tbl',     // 1011 = 11
        Ext.baseCSSPrefix + 'noborder-tr',      // 1100 = 12
        Ext.baseCSSPrefix + 'noborder-trl',     // 1101 = 13
        Ext.baseCSSPrefix + 'noborder-trb',     // 1110 = 14
        Ext.baseCSSPrefix + 'noborder-trbl'     // 1111 = 15
    ],

    /**
     * The numeric values assigned to each edge indexed by the `dock` config value.
     * @private
     */
    edgeMasks: {
        top: 8,
        right: 4,
        bottom: 2,
        left: 1
    },

    handleDockedItemBorders: function() {
        var me     = this,
            edges  = 0,
            maskT  = 8,
            maskR  = 4,
            maskB  = 2,
            maskL  = 1,
            container  = me.container,
            bodyBorder = container.getBoodyBorder && container.getBodyBorder(),
            containerBorder = container.getBorder(),
            collapsed   = me.collapsed,
            edgeMasks   = me.edgeMasks,
            noBorderCls = me.noBorderClassTable,
            dockedItemsGen = container.items.generation,
            b, borderCls, docked, edgesTouched, i, ln, item, dock, lastValue, mask,
            addCls, removeCls;

        if (me.initializedBorders === dockedItemsGen || !container.manageBorders) {
            return;
        }

        addCls = [];
        removeCls = [];

        borderCls   = me.getBorderCollapseTable();
        noBorderCls = me.getBorderClassTable ? me.getBorderClassTable() : noBorderCls;

        me.initializedBorders = dockedItemsGen;

        // Borders have to be calculated using expanded docked item collection.
        me.collapsed = false;
        docked = container.getDockedItems();
        me.collapsed = collapsed;

        for (i = 0, ln = docked.length; i < ln; i++) {
            item = docked[i];

            if (item.getHidden()) {
                continue;
            }

            dock = item.getDocked();
            mask = edgesTouched = 0;
            addCls.length = 0;
            removeCls.length = 0;

            if (dock !== 'bottom') {
                if (edges & maskT) { // if (not touching the top edge)
                    b = item.border;
                } else {
                    b = containerBorder;
                    if (b !== false) {
                        edgesTouched += maskT;
                    }
                }
                if (b === false) {
                    mask += maskT;
                }
            }
            if (dock !== 'left') {
                if (edges & maskR) { // if (not touching the right edge)
                    b = item.border;
                } else {
                    b = containerBorder;
                    if (b !== false) {
                        edgesTouched += maskR;
                    }
                }
                if (b === false) {
                    mask += maskR;
                }
            }
            if (dock !== 'top') {
                if (edges & maskB) { // if (not touching the bottom edge)
                    b = item.border;
                } else {
                    b = containerBorder;
                    if (b !== false) {
                        edgesTouched += maskB;
                    }
                }
                if (b === false) {
                    mask += maskB;
                }
            }
            if (dock !== 'right') {
                if (edges & maskL) { // if (not touching the left edge)
                    b = item.border;
                } else {
                    b = containerBorder;
                    if (b !== false) {
                        edgesTouched += maskL;
                    }
                }
                if (b === false) {
                    mask += maskL;
                }
            }

            if ((lastValue = item.lastBorderMask) !== mask) {
                item.lastBorderMask = mask;
                if (lastValue) {
                    removeCls[0] = noBorderCls[lastValue];
                }
                if (mask) {
                    addCls[0] = noBorderCls[mask];
                }
            }

            if ((lastValue = item.lastBorderCollapse) !== edgesTouched) {
                item.lastBorderCollapse = edgesTouched;
                if (lastValue) {
                    removeCls[removeCls.length] = borderCls[lastValue];
                }
                if (edgesTouched) {
                    addCls[addCls.length] = borderCls[edgesTouched];
                }
            }

            if (removeCls.length) {
                item.removeCls(removeCls);
            }
            if (addCls.length) {
                item.addCls(addCls);
            }

            // mask can use += but edges must use |= because there can be multiple items
            // on an edge but the mask is reset per item

            edges |= edgeMasks[dock]; // = T, R, B or L (8, 4, 2 or 1)
        }

        mask = edgesTouched = 0;
        addCls.length = 0;
        removeCls.length = 0;

        if (edges & maskT) { // if (not touching the top edge)
            b = bodyBorder;
        } else {
            b = containerBorder;
            if (b !== false) {
                edgesTouched += maskT;
            }
        }
        if (b === false) {
            mask += maskT;
        }

        if (edges & maskR) { // if (not touching the right edge)
            b = bodyBorder;
        } else {
            b = containerBorder;
            if (b !== false) {
                edgesTouched += maskR;
            }
        }
        if (b === false) {
            mask += maskR;
        }

        if (edges & maskB) { // if (not touching the bottom edge)
            b = bodyBorder;
        } else {
            b = containerBorder;
            if (b !== false) {
                edgesTouched += maskB;
            }
        }
        if (b === false) {
            mask += maskB;
        }

        if (edges & maskL) { // if (not touching the left edge)
            b = bodyBorder;
        } else {
            b = containerBorder;
            if (b !== false) {
                edgesTouched += maskL;
            }
        }
        if (b === false) {
            mask += maskL;
        }

        if ((lastValue = me.lastBodyBorderMask) !== mask) {
            me.lastBodyBorderMask = mask;
            if (lastValue) {
                removeCls[0] = noBorderCls[lastValue];
            }
            if (mask) {
                addCls[0] = noBorderCls[mask];
            }
        }

        if ((lastValue = me.lastBodyBorderCollapse) !== edgesTouched) {
            me.lastBodyBorderCollapse = edgesTouched;
            if (lastValue) {
                removeCls[removeCls.length] = borderCls[lastValue];
            }
            if (edgesTouched) {
                addCls[addCls.length] = borderCls[edgesTouched];
            }
        }

        if (removeCls.length && container.removeBodyCls) {
            container.removeBodyCls(removeCls);
        }
        if (addCls.length && container.addBodyCls) {
            container.addBodyCls(addCls);
        }
    },

    /**
     * This object is indexed by a component's `baseCls` to yield another object which
     * is then indexed by the component's `ui` to produce an array of CSS class names.
     * This array is indexed in the same manner as the `noBorderClassTable` and indicates
     * the a particular edge of a docked item or the body element is actually "collapsed"
     * with the component's outer border.
     * @private
     */
    borderCollapseMap: {
        /*
         'x-panel': {
         'default': []
         }
         */
    },

    /**
     * Returns the array of class names to add to a docked item or body element when for
     * the edges that should collapse with the outer component border. Basically, the
     * panel's outer border must look visually like a contiguous border but may need to
     * be realized by using the border of docked items and/or the body. This class name
     * allows the border color and width to be controlled accordingly and distinctly from
     * the border of the docked item or body element when it is not having its border
     * collapsed.
     * @private
     */
    getBorderCollapseTable: function () {
        var me = this,
            map = me.borderCollapseMap,
            container = me.container,
            baseCls = container.getBaseCls(),
            ui = container.getUi(),
            uiCls = (ui ? ('-' + ui) : ''),
            table;

        ui = ui || 'default';
        map = map[baseCls] || (map[baseCls] = {});
        table = map[ui];

        if (!table) {
            baseCls += uiCls + '-outer-border-';
            map[ui] = table = [
                0,                  // TRBL
                baseCls + 'l',      // 0001 = 1
                baseCls + 'b',      // 0010 = 2
                baseCls + 'bl',     // 0011 = 3
                baseCls + 'r',      // 0100 = 4
                baseCls + 'rl',     // 0101 = 5
                baseCls + 'rb',     // 0110 = 6
                baseCls + 'rbl',    // 0111 = 7
                baseCls + 't',      // 1000 = 8
                baseCls + 'tl',     // 1001 = 9
                baseCls + 'tb',     // 1010 = 10
                baseCls + 'tbl',    // 1011 = 11
                baseCls + 'tr',     // 1100 = 12
                baseCls + 'trl',    // 1101 = 13
                baseCls + 'trb',    // 1110 = 14
                baseCls + 'trbl'    // 1111 = 15
            ];
        }

        return table;
    }
});
