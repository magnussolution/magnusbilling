/**
 * Sometimes you want to show several screens worth of information but you've only got a small screen to work with.
 * TabPanels and Carousels both enable you to see one screen of many at a time, and underneath they both use a Card
 * Layout.
 *
 * Card Layout takes the size of the Container it is applied to and sizes the currently active item to fill the
 * Container completely. It then hides the rest of the items, allowing you to change which one is currently visible but
 * only showing one at once.
 *
 * Here the gray box is our Container, and the blue box inside it is the currently active card. The three other cards
 * are hidden from view, but can be swapped in later. While it's not too common to create Card layouts directly, you
 * can do so like this:
 *
 *     var panel = Ext.create('Ext.Panel', {
 *         layout: 'card',
 *         items: [
 *             {
 *                 html: "First Item"
 *             },
 *             {
 *                 html: "Second Item"
 *             },
 *             {
 *                 html: "Third Item"
 *             },
 *             {
 *                 html: "Fourth Item"
 *             }
 *         ]
 *     });
 *
 *     panel.setActiveItem(1);
 *
 * Here we create a Panel with a Card Layout and later set the second item active (the active item index is zero-based,
 * so 1 corresponds to the second item). Normally you're better off using a {@link Ext.tab.Panel tab panel} or a
 * {@link Ext.carousel.Carousel carousel}.
 */
Ext.define('Ext.layout.Card', {
    extend: 'Ext.layout.Default',

    alias: 'layout.card',

    type: 'card',

    isCard: true,

    /**
     * @event activeitemchange
     * @preventable
     * Fires when an card is made active
     * @param {Ext.layout.Card} this The layout instance
     * @param {Mixed} newActiveItem The new active item
     * @param {Mixed} oldActiveItem The old active item
     */
        
    cls: Ext.baseCSSPrefix + 'layout-card',

    itemCls: Ext.baseCSSPrefix + 'layout-card-item',

    requires: [
        'Ext.fx.layout.Card'
    ],

    /**
     * @private
     */
    applyAnimation: function(animation) {
        return new Ext.fx.layout.Card(animation);
    },

    /**
     * @private
     */
    updateAnimation: function(animation, oldAnimation) {
        if (animation && animation.isAnimation) {
            animation.setLayout(this);
        }

        if (oldAnimation) {
            oldAnimation.destroy();
        }
    },

    setContainer: function(container) {
        this.callParent(arguments);

        container.onInitialized('onContainerInitialized', this);
    },

    onContainerInitialized: function() {
        var me = this,
            container = me.container,
            firstItem = container.getInnerAt(0),
            activeItem = container.getActiveItem();

        me.callParent();

        if (activeItem) {
            activeItem.show();

            if (firstItem && firstItem !== activeItem) {
                firstItem.hide();
            }
        }

        container.on('activeitemchange', 'onContainerActiveItemChange', me);
    },

    /**
     * @private
     */
    onContainerActiveItemChange: function(container, newItem, oldItem) {
        this.fireEventedAction('activeitemchange', [this, newItem, oldItem],
            'doActiveItemChange', this);
    },

    onItemInnerStateChange: function(item, isInner, destroying) {
        this.callParent(arguments);
        var container = this.container,
            activeItem = container.getActiveItem();

        item.setLayoutSizeFlags(isInner ? container.LAYOUT_BOTH : 0);

        if (isInner) {
            if (activeItem !== container.innerIndexOf(item) && activeItem !== item && item !== container.pendingActiveItem) {
                item.hide();
            }
        } else {
            if (!destroying && !item.destroyed && item.destroying !== true) {
                item.show();
            }
        }
    },

    /**
     * @private
     */
    doActiveItemChange: function(me, newActiveItem, oldActiveItem) {
        if (oldActiveItem) {
            oldActiveItem.hide();
        }

        if (newActiveItem) {
            newActiveItem.show();
        }
    },

    destroy: function() {
        Ext.destroy(this.getAnimation());
        this.callParent();
    }
});
