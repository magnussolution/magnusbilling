/**
 * {@link Ext.Menu}'s are used with {@link Ext.Viewport#setMenu}. A menu can be linked with any side of the screen (top, left, bottom or right)
 *  and will simply describe the contents of your menu. To use this menu you will call various menu related functions on the {@link Ext.Viewport}
 * such as {@link Ext.Viewport#showMenu}, {@link Ext.Viewport#hideMenu}, {@link Ext.Viewport#toggleMenu}, {@link Ext.Viewport#hideOtherMenus},
 * or {@link Ext.Viewport#hideAllMenus}.
 *
 *      @example preview
 *      var menu = Ext.create('Ext.Menu', {
 *          items: [{
 *              text: 'Settings',
 *              iconCls: 'settings'
 *          }, {
 *              text: 'New Item',
 *              iconCls: 'compose'
 *          }, {
 *              text: 'Star',
 *              iconCls: 'star'
 *          }]
 *      });
 *
 *      Ext.Viewport.add({
 *          xtype: 'panel',
 *          html: 'Main View Content'
 *      });
 *
 *      Ext.Viewport.setMenu(menu, {
 *          side: 'left',
 *          // omitting the reveal config defaults the animation to 'cover'
 *          reveal: true
 *      });
 *
 *      Ext.Viewport.showMenu('left');
 *
 * The {@link #defaultType} of a Menu item is a {@link Ext.Button button}.
 */
Ext.define('Ext.Menu', {
    extend: 'Ext.Sheet',
    xtype: 'menu',
    requires: ['Ext.Button'],

    /**
     * @cfg
     * @inheritdoc
     */
    baseCls: Ext.baseCSSPrefix + 'menu',

    /**
     * @cfg
     * @inheritdoc
     */
    left: 0,

    /**
     * @cfg
     * @inheritdoc
     */
    right: 0,

    /**
     * @cfg
     * @inheritdoc
     */
    bottom: 0,

    /**
     * @cfg
     * @inheritdoc
     */
    height: 'auto',

    /**
     * @cfg
     * @inheritdoc
     */
    width: 'auto',

    /**
     * @cfg
     * @inheritdoc
     */
    defaultType: 'button',

    /**
     * @hide
     */
    showAnimation: null,

    /**
     * @hide
     */
    hideAnimation: null,

    /**
     * @hide
     */
    centered: false,

    /**
     * @hide
     */
    modal: true,

    /**
     * @hide
     */
    hidden: true,

    /**
     * @hide
     */
    hideOnMaskTap: true,

    /**
     * @hide
     */
    translatable: {
        translationMethod: null
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    floated: true,

    hide: function() {
        var me = this,
            parent = me.parent;

        if (parent && parent.isViewport && me.$side && !me.viewportIsHiding) {
            me.viewportIsHiding = true;
            parent.hideMenu(me.$side, true);
        } else {
            me.viewportIsHiding = false;
            me.callParent();
        }
    },

    constructor: function() {
        this.config.translatable.translationMethod = 'csstransform';
        this.callParent(arguments);
    },

    updateUi: function(newUi, oldUi) {
        this.callParent(arguments);

        if (newUi != oldUi && Ext.theme.is.Blackberry) {
            if (newUi == 'context') {
                this.innerElement.swapCls('x-vertical', 'x-horizontal');
            }
            else if (newUi == 'application') {
                this.innerElement.swapCls('x-horizontal', 'x-vertical');
            }
        }
    },

    updateHideOnMaskTap : function(hide) {
        if (!this.isFloated()) {
            var mask = this.getModal();

            if (mask) {
                mask[hide ? 'on' : 'un']('tap', this.onMaskTap, this);
            }
        }
    },

    onMaskTap: function() {
        Ext.Viewport.hideMenu(this.$side);
    }
});
