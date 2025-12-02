Ext.define('Ext.theme.blackberry.viewport.Default', {
    override: 'Ext.viewport.Default',

    attachSwipeListeners: function() {
        var me = this,
            toggleMenu;

        me.callParent();

        // Add BB10 webworks API for swipe down.
        if (window.blackberry) {
            toggleMenu = function() {
                var menus = me.getMenus(),
                    menu = menus['top'];

                if (!menu) {
                    return;
                }

                if (menu.isHidden()) {
                    me.showMenu('top');
                } else {
                    me.hideMenu('top');
                }
            };

            if (blackberry.app && blackberry.app.event && blackberry.app.event.onSwipeDown) {
                blackberry.app.event.onSwipeDown(toggleMenu); // PlayBook
            } else if (blackberry.event && blackberry.event.addEventListener) {
                blackberry.event.addEventListener("swipedown", toggleMenu); // BB10
            }
        }
    },

    getMenuCfg: function(menu, side) {
        var type;
        if (side === 'top' || side === 'bottom') {
            type = 'Ext.theme.blackberry.ApplicationMenu';
        } else {
            type = 'Ext.theme.blackberry.ContextMenu';
        }
        return Ext.apply({
            xclass: type
        }, menu);
    }
});