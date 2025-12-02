/**
 * User extension designed to be used on the BB10 platform.
 *
 * @private
 */
Ext.define('Ext.theme.blackberry.MenuButton', {
    extend: 'Ext.Button',
    requires: ['Ext.theme.blackberry.ContextMenu'],

    config: {
        /**
         * @hide
         */
        ui: 'tab',

        /**
         * @hide
         */
        cls: 'menu',

        menuConfig: {},

        menuItems: [],

        /**
         * @hide
         */
        menuSide: 'right',

        /**
         * @hide
         */
        menuCover: false,

        /**
         * @hide
         */
        menuCls: null,

        /**
         * @hide
         */
        listeners: {
            tap: 'onTap'
        }
    },

    /**
     * @private
     * Used to show the menu associated with this button
     */
    onTap: function(e) {
        var me = this,
            cls = Ext.baseCSSPrefix + 'open',
            menu = this.$menu;

        if (menu) {
            menu.destroy();
        }

        me.element.addCls(cls);

        me.$menu = menu = new Ext.theme.blackberry.ContextMenu(Ext.apply({}, me.getMenuConfig(), {
            cls: me.getMenuCls(),
            items: me.getMenuItems(),
            listeners: {
                scope: me,
                hide: function() {
                    if (me.$menu) {
                        me.element.removeCls(cls);
                        Ext.Viewport.removeMenu(me.getMenuSide());
                        me.$menu.destroy();
                    }
                }
            }
        }));

        menu.on({
            scope: me,
            tap: me.onMenuButtonTap,
            delegate: 'button'
        });

        Ext.Viewport.setMenu(menu, {
            side: me.getMenuSide(),
            cover: me.getMenuCover()
        });

        Ext.Viewport.showMenu(me.getMenuSide());
    },

    onMenuButtonTap: Ext.emptyFn
});