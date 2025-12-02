Ext.define('Overrides.grid.feature.Grouping', {
    override: 'Ext.grid.feature.Grouping',
    groupHeaderTpl: '{columnName}: {renderedGroupValue}',
    groupByText: t('Group by this column'),
    showGroupsText: t('Show in groups'),
    setupRowData: function(record, idx, rowValues) {
        var me = this,
            recordIndex = rowValues.recordIndex,
            data = me.refreshData,
            groupInfo = me.groupInfo,
            header = data.header,
            groupField = data.groupField,
            store = me.view.getStore(),
            dataSource = me.view.dataSource,
            grouper, groupName, prev, next, items;
        rowValues.isCollapsedGroup = false;
        rowValues.summaryRecord = rowValues.groupHeaderCls = null;
        if (data.doGrouping) {
            grouper = store.getGrouper();
            // This is a placeholder record which represents a whole collapsed group
            // It is a special case.
            if (record.isCollapsedPlaceholder) {
                groupName = record.group.getGroupKey();
                items = record.group.items;
                rowValues.isFirstRow = rowValues.isLastRow = true;
                rowValues.groupHeaderCls = me.hdCollapsedCls;
                rowValues.isCollapsedGroup = rowValues.needsWrap = true;
                rowValues.groupName = groupName;
                rowValues.groupInfo = groupInfo;
                groupInfo.groupField = groupField;
                groupInfo.name = groupName;
                groupInfo.groupValue = items[0].get(groupField);
                groupInfo.columnName = header ? header.text : groupField;
                rowValues.collapsibleCls = me.collapsible ? me.collapsibleCls : me.hdNotCollapsibleCls;
                groupInfo.rows = groupInfo.children = items;
                if (me.showSummaryRow) {
                    rowValues.summaryRecord = data.summaryData[groupName];
                }
                return;
            }
            groupName = grouper.getGroupString(record);
            // If caused by an update event on the first or last records of a group fired by a GroupStore, the record's group will be attached.
            if (record.group) {
                items = record.group.items;
                rowValues.isFirstRow = record === items[0];
                rowValues.isLastRow = record === items[items.length - 1];
            } else {
                // See if the current record is the last in the group
                rowValues.isFirstRow = recordIndex === 0;
                if (!rowValues.isFirstRow) {
                    prev = store.getAt(recordIndex - 1);
                    // If the previous row is of a different group, then we're at the first for a new group
                    if (prev) {
                        // Must use Model's comparison because Date objects are never equal
                        rowValues.isFirstRow = !prev.isEqual(grouper.getGroupString(prev), groupName);
                    }
                }
                // See if the current record is the last in the group
                rowValues.isLastRow = recordIndex == (store.isBufferedStore ? store.getTotalCount() : store.getCount()) - 1;
                if (!rowValues.isLastRow) {
                    next = store.getAt(recordIndex + 1);
                    if (next) {
                        // Must use Model's comparison because Date objects are never equal
                        rowValues.isLastRow = !next.isEqual(grouper.getGroupString(next), groupName);
                    }
                }
            }
            if (rowValues.isFirstRow) {
                groupInfo.groupField = groupField;
                groupInfo.name = groupName;
                groupInfo.groupValue = record.get(groupField);
                groupInfo.columnName = header ? header.text : groupField;
                groupInfo.renderedGroupValue = header && header.renderer ? Ext.bind(header.renderer, header.scope || header, [groupName, null, record, idx, null, dataSource, me.view]).call() : groupName; //override
                rowValues.collapsibleCls = me.collapsible ? me.collapsibleCls : me.hdNotCollapsibleCls;
                rowValues.groupName = groupName;
                if (!me.isExpanded(groupName)) {
                    rowValues.itemClasses.push(me.hdCollapsedCls);
                    rowValues.isCollapsedGroup = true;
                }
                // We only get passed a GroupStore if the store is not buffered
                if (dataSource.isBufferedStore) {
                    groupInfo.rows = groupInfo.children = [];
                } else {
                    groupInfo.rows = groupInfo.children = me.getRecordGroup(record).items;
                }
                rowValues.groupInfo = groupInfo;
            }
            if (rowValues.isLastRow) {
                // Add the group's summary record to the last record in the group
                if (me.showSummaryRow) {
                    rowValues.summaryRecord = data.summaryData[groupName];
                    rowValues.itemClasses.push(Ext.baseCSSPrefix + 'grid-group-last');
                }
            }
            rowValues.needsWrap = (rowValues.isFirstRow || rowValues.summaryRecord);
        }
    }
});