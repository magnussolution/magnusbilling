Ext.define('Ext.rtl.grid.column.Column', {
    override: 'Ext.grid.column.Column',

    isAtStartEdge: function(e, margin) {
        var me = this,
            offset;

        if (!me.getInherited().rtl !== !Ext.rootInheritedState.rtl) { // jshint ignore:line
            offset = me.getX() + me.getWidth() - e.getXY()[0];
            
            // To the right of the first column, not over
            if (offset < 0 && this.getIndex() === 0) {
                return false;
            }

            return (offset <= me.getHandleWidth(e));
        } else {
            return me.callParent([e, margin]);
        }
    },

    isAtEndEdge: function(e, margin) {
        var me = this;
        return (!me.getInherited().rtl !== !Ext.rootInheritedState.rtl) ? // jshint ignore:line
            (e.getXY()[0] - me.getX() <= me.getHandleWidth(e)) : me.callParent([e, margin]);
    },

    privates: {
        _alignMap: {
            start: 'right',
            end: 'left'
        }
    }
});
