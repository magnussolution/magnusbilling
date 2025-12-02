/**
 * AbstractBox is a superclass for the two box layouts:
 *
 * * {@link Ext.layout.HBox hbox}
 * * {@link Ext.layout.VBox vbox}
 *
 * FlexBox itself is never used directly, but its subclasses provide flexible arrangement of child components
 * inside a {@link Ext.Container Container}.
 *
 * ## Horizontal Box
 *
 * HBox allows you to easily lay out child components horizontally. It can size items based on a fixed width or a
 * fraction of the total width available, enabling you to achieve flexible layouts that expand or contract to fill the
 * space available.
 *
 * {@img ../guides/layouts/hbox.jpg}
 *
 * See the {@link Ext.layout.HBox HBox layout docs} for more information on using hboxes.
 *
 * ## Vertical Box
 *
 * VBox allows you to easily lay out child components verticaly. It can size items based on a fixed height or a
 * fraction of the total height available, enabling you to achieve flexible layouts that expand or contract to fill the
 * space available.
 *
 * See the {@link Ext.layout.VBox VBox layout docs} for more information on using vboxes.
 */
Ext.define('Ext.layout.FlexBox', {
    extend: 'Ext.layout.Box',

    alias: 'layout.box',

    config: {
        align: 'stretch'
    },

    cls: Ext.baseCSSPrefix + 'layout-box',
    baseItemCls: Ext.baseCSSPrefix + 'layout-box-item',

    orientMap: {
        horizontal: {
            sizeProp: 'width',
            event: 'widthchange',
            containerCls: [
                Ext.baseCSSPrefix + 'layout-hbox', 
                Ext.baseCSSPrefix + 'horizontal'
            ],
            itemCls: Ext.baseCSSPrefix + 'layout-hbox-item'
        },
        vertical: {
            sizeProp: 'height',
            event: 'heightchange',
            containerCls: [
                Ext.baseCSSPrefix + 'layout-vbox', 
                Ext.baseCSSPrefix + 'vertical'
            ],
            itemCls: Ext.baseCSSPrefix + 'layout-vbox-item'
        }
    },

    setContainer: function(container) {
        this.callParent([container]);

        this.monitorSizeFlagsChange();
    },

    applyOrient: function(orient) {
        //<debug>
        if (orient !== 'horizontal' && orient !== 'vertical') {
            Ext.Logger.error("Invalid box orient of: '" + orient + "', must be either 'horizontal' or 'vertical'");
        }
        //</debug>

        return orient;
    },

    updateOrient: function(orient, oldOrient) {
        var me = this,
            container = me.container,
            innerElement = container.innerElement,
            innerItems = container.innerItems,
            len = innerItems.length,
            map = me.orientMap,
            newMap = map[orient],
            oldMap = map[oldOrient],
            delegation = {
                delegate: '> component'
            }, i, itemCls, item;

        me.sizePropertyName = newMap.sizeProp;

        if (oldOrient) {
            innerElement.removeCls(oldMap.containerCls);
            container.un(oldMap.event, 'onItemSizeChange', me, delegation);
            for (i = 0; i < len; ++i) {
                innerItems[i].removeCls(oldMap.itemCls);
            }
        }

        innerElement.addCls(newMap.containerCls);

        container.on(newMap.event, 'onItemSizeChange', me, delegation);
        me.itemCls = itemCls = [me.baseItemCls, newMap.itemCls];
        for (i = 0; i < len; ++i) {
            item = innerItems[i];
            item.addCls(itemCls);
            me.refreshItemSizeState(item);
        }

        if (oldOrient) {
            me.redrawContainer();
        }
    },

    onItemInnerStateChange: function(item, isInner) {
        this.callParent(arguments);

        var flex, size;

        if (isInner) {
            flex = item.getFlex();
            size = item.getConfig(this.sizePropertyName);

            if (flex) {
                this.doItemFlexChange(item, flex);
            }
            else if (size) {
                this.doItemSizeChange(item, size);
            }
        }

        this.refreshItemSizeState(item);
    },

    refreshItemSizeState: function(item) {
        var isInner = item.isInnerItem(),
            container = this.container,
            LAYOUT_HEIGHT = container.LAYOUT_HEIGHT,
            LAYOUT_WIDTH = container.LAYOUT_WIDTH,
            dimension = this.sizePropertyName,
            layoutSizeFlags = 0,
            containerSizeFlags = container.getSizeFlags();

        if (isInner) {
            layoutSizeFlags |= container.LAYOUT_STRETCHED;

            if (this.getAlign() === 'stretch') {
                layoutSizeFlags |= containerSizeFlags & (dimension === 'width' ? LAYOUT_HEIGHT : LAYOUT_WIDTH);
            }

            if (item.getFlex()) {
                layoutSizeFlags |= containerSizeFlags & (dimension === 'width' ? LAYOUT_WIDTH : LAYOUT_HEIGHT);
            }
        }

        item.setLayoutSizeFlags(layoutSizeFlags);
    },

    refreshAllItemSizedStates: function() {
        var innerItems = this.container.innerItems,
            i, ln, item;

        for (i = 0,ln = innerItems.length; i < ln; i++) {
            item = innerItems[i];
            this.refreshItemSizeState(item);
        }
    },

    onContainerSizeFlagsChange: function() {
        this.refreshAllItemSizedStates();

        this.callParent(arguments);
    },

    onItemSizeChange: function(item, size) {
        if (item.isInnerItem()) {
            this.doItemSizeChange(item, size);
        }
    },

    doItemSizeChange: function(item, size) {
        if (size) {
            item.setFlex(null);
            this.redrawContainer();
        }
    },

    onItemFlexChange: function(item, flex) {
        if (item.isInnerItem()) {
            this.doItemFlexChange(item, flex);
            this.refreshItemSizeState(item);
        }
    },

    doItemFlexChange: function(item, flex) {
        this.setItemFlex(item, flex);

        if (flex) {
            item.setConfig(this.sizePropertyName, null);
        }
        else {
            this.redrawContainer();
        }
    },

    redrawContainer: function() {
        var container = this.container,
            renderedTo = container.element.dom.parentNode;

        if (renderedTo && renderedTo.nodeType !== 11) {
            container.innerElement.redraw();
        }
    },

    /**
     * Sets the flex of an item in this box layout.
     * @param {Ext.Component} item The item of this layout which you want to update the flex of.
     * @param {Number} flex The flex to set on this method
     */
    setItemFlex: function(item, flex) {
        var element = item.element,
            style = element.dom.style;

        element.toggleCls(Ext.baseCSSPrefix + 'flexed', !!flex);

        if (Ext.isWebKit) {
            style.setProperty('-webkit-box-flex', flex ? flex : '', null);
        } else if (Ext.isIE) {
            style.setProperty('-ms-flex', (flex ? flex + ' ' + flex + ' 0px' : ''), null);
        }

        style.setProperty('flex', (flex ? flex + ' ' + flex + ' 0px' : ''), null);
    },

    convertPosition: function(position) {
        var positionMap = this.positionMap;

        if (positionMap.hasOwnProperty(position)) {
            return positionMap[position];
        }

        return position;
    },

    applyAlign: function(align) {
        return this.convertPosition(align);
    },

    updateAlign: function(align, oldAlign) {
        var container = this.container;

        container.innerElement.swapCls(align, oldAlign, true, 'x-align');

        if (oldAlign !== undefined) {
            this.refreshAllItemSizedStates();
        }
    },

    applyPack: function(pack) {
        return this.convertPosition(pack);
    },

    updatePack: function(pack, oldPack) {
        this.container.innerElement.swapCls(pack, oldPack, true, 'x-pack');
    }
});
