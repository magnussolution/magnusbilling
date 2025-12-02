Ext.define('Ext.scroll.TableScroller', {
    extend: 'Ext.scroll.Scroller',
    alias: 'scroller.table',

    config: {
        lockingScroller: null
    },

    private: {
        doScrollTo: function(x, y, animate) {
            var lockingScroller;

            if (y != null) {
                lockingScroller = this.getLockingScroller();

                if (lockingScroller) {
                    lockingScroller.doScrollTo(null, y, animate);
                    y = null;
                }
            }

            this.callParent([x, y, animate]);
        }
    }

});
