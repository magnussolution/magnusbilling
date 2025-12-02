Ext.define('Ext.scroll.LockingScroller', {
    extend: 'Ext.scroll.Scroller',
    alias: 'scroller.locking',

    config: {
        lockedScroller: null,
        normalScroller: null
    },

    scrollTo: function(x, y, animate) {
        var lockedX;

        if (Ext.isObject(x)) {
            lockedX = x.lockedX;

            if (lockedX) {
                this.getLockedScroller().scrollTo(lockedX, null, animate);
            }
        }

        this.callParent([x, y, animate]);
    },

    updateLockedScroller: function(lockedScroller) {
        lockedScroller.on('scroll', 'onLockedScroll', this);
        lockedScroller.setLockingScroller(this);
    },

    updateNormalScroller: function(normalScroller) {
        normalScroller.on('scroll', 'onNormalScroll', this);
        normalScroller.setLockingScroller(this);
    },

    getPosition: function() {
        var me = this,
            position = me.callParent();

        position.x = me.getNormalScroller().getPosition().x;
        position.lockedX = me.getLockedScroller().getPosition().x;

        return position;
    },

    privates: {
        updateSpacerXY: function(pos) {
            var me = this,
                lockedScroller = me.getLockedScroller(),
                normalScroller = me.getNormalScroller(),
                lockedView = lockedScroller.component,
                normalView = normalScroller.component,
                height = pos.y + ((normalView.headerCt.tooNarrow || lockedView.headerCt.tooNarrow) ? Ext.getScrollbarSize().height : 0);

            normalView.stretchHeight(height);
            lockedView.stretchHeight(height);
            this.callParent([pos]);
        },

        doScrollTo: function(x, y, animate) {
            if (x != null) {
                this.getNormalScroller().scrollTo(x, null, animate);
                x = null;
            }

            this.callParent([x, y, animate]);
        },

        onLockedScroll: function(lockedScroller, x, y) {
            this.position.lockedX = x;
        },

        onNormalScroll: function(normalScroller, x, y) {
            this.position.x = x;
        }
    }
});