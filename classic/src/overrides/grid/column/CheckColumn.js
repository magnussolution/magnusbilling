Ext.define('Overrides.grid.column.CheckColumn', {
    override: 'Ext.grid.column.CheckColumn'
    /*,
        checkedValue: true,
        uncheckedValue: false,

        processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
            var me = this,
                key = type === 'keydown' && e.getKey(),
                mousedown = type == 'mousedown';

            if (!me.disabled && (mousedown || (key == e.ENTER || key == e.SPACE))) {
                var dataIndex = me.dataIndex,
                    checked = record.get(dataIndex) ? me.uncheckedValue : me.checkedValue;

                // Allow apps to hook beforecheckchange
                if (me.fireEvent('beforecheckchange', me, recordIndex, checked) !== false) {
                    record.set(dataIndex, checked);
                    me.fireEvent('checkchange', me, recordIndex, checked, record);

                    // Mousedown on the now nonexistent cell causes the view to blur, so stop it continuing.
                    if (mousedown) {
                        e.stopEvent();
                    }

                    // Selection will not proceed after this because of the DOM update caused by the record modification
                    // Invoke the SelectionModel unless configured not to do so
                    if (!me.stopSelection) {
                        view.selModel.selectByPosition({
                            row: recordIndex,
                            column: cellIndex
                        });
                    }

                    // Prevent the view from propagating the event to the selection model - we have done that job.
                    return false;
                } else {
                    // Prevent the view from propagating the event to the selection model if configured to do so.
                    return !me.stopSelection;
                }
            } else {
                return me.callParent(arguments);
            }
        }*/
});