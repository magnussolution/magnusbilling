/**
 * @class Ext.grid.HeaderContainer
 * @extends Ext.Container
 * Description
 */
Ext.define('Ext.grid.HeaderContainer', {
    extend: 'Ext.Container',
    xtype: 'headercontainer',

    config: {
        docked: 'top',

        /**
         * A default {@link #ui ui} to use for {@link Ext.grid.Column columns} in this header.
         */
        defaultColumnUI: null,

        defaultType: 'column',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },

        /**
         * @private
         * Set this to `false` to disable sorting via tap on all column headers
         */
        sortable: true,

        scrollable: {
            x: false,
            y: false
        },

        grid: null
    },

    classCls: Ext.baseCSSPrefix + 'headercontainer',

    initialize: function() {
        var me = this;

        me.columns = [];

        me.callParent();

        me.on({
            tap: 'onHeaderTap',
            columnresize: 'onColumnResize',
            show: 'onColumnShow',
            hide: 'onColumnHide',
            sort: 'onColumnSort',
            scope: me,
            delegate: 'column'
        });

        me.on({
            tap: 'onGroupTap',
            show: 'onGroupShow',
            hide: 'onGroupHide',
            add: 'onColumnAdd',
            move: 'onColumnMove',
            remove: 'onColumnRemove',
            scope: me,
            delegate: 'gridheadergroup'
        });

        me.on({
            add: 'onColumnAdd',
            move: 'onColumnMove',
            remove: 'onColumnRemove',
            scope: me
        });
    },

    factoryItem: function (item) {
        // If the columns contains a columns config, then create a HeaderGroup
        if (item.columns) {
            return Ext.factory(item, Ext.grid.HeaderGroup);
        }
        return this.callParent([item]);
    },

    getColumns: function() {
        return this.columns;
    },

    getAbsoluteColumnIndex: function(column) {
        var items = this.getInnerItems(),
            ret = this.getBottomColumnIndex(items, column);

        return ret.found ? ret.index : items.length;
    },

    getBottomColumnIndex: function(items, column){
        var i = 0,
            ln = items.length,
            ret = {
                found: false,
                index: 0
            },
            innerIndex, item, retV;

        while (!ret.found && i < ln) {
            item = items[i];

            if (item === column) {
                ret.found = true;
            }
            else if (item.isHeaderGroup) {
                innerIndex = item.innerIndexOf(column);
                if (innerIndex !== -1) {
                    ret.index += innerIndex;
                    ret.found = true;
                }
                else {
                    retV = this.getBottomColumnIndex(item.getInnerItems(), column);
                    ret.index += retV.index;
                    ret.found = retV.found;
                }
            }
            else {
                ret.index++;
            }
            i++;
        }
        return ret;
    },

    onColumnAdd: function(parent, column) {
        this.doColumnAdd(column, null);
    },

    doColumnAdd: function(column, group){
        var me = this,
            columns = me.columns,
            columnIndex = me.getAbsoluteColumnIndex(column),
            groupColumns, ln, i, ui;

        if (column.isHeaderGroup) {
            groupColumns = column.getItems().items;

            for (i = 0, ln = groupColumns.length; i < ln; i++) {
                me.doColumnAdd(groupColumns[i], column);
            }
        } else {
            ui = column.getUi();

            if (ui == null) {
                column.setUi(me.getDefaultColumnUI());
            }

            columns.splice(columnIndex, 0, column);
            me.fireEvent('columnadd', me, column, group);
        }
    },

    onColumnMove: function(parent, column) {
        var me = this,
            columns = me.columns,
            columnIndex = me.getAbsoluteColumnIndex(column),
            groupColumns, ln, i, groupColumn,
            after, oldIndex, fromIdx, toIdx;

        if (column.isHeaderGroup) {
            groupColumns = column.getItems().items;

            for (i = 0, ln = groupColumns.length; i < ln; i++) {
                groupColumn = groupColumns[i];

                if (i === 0) {
                    oldIndex = columns.indexOf(groupColumn);
                    after = oldIndex - columnIndex < 0;
                }

                // Treat the moves as sequential
                if (after) {
                    // |  Group   | c | d     ->     | c | d |   Group   |
                    //    a   b                                  a   b
                    //
                    // We need to fire:
                    // a from 0 -> 3, since b is still in place
                    // b from 0 -> 3, to account for a still in place
                    toIdx = columnIndex + ln - 1;
                    fromIdx = oldIndex;
                } else {
                    // | c | d |   Group   |      ->     |  Group   | c | d
                    //             a   b                    a   b
                    //
                    // We need to fire:
                    // a from 2 -> 0
                    // b from 2 -> 1, to account for a moving
                    fromIdx = oldIndex + i;
                    toIdx = columnIndex + i;
                }
                Ext.Array.move(columns, fromIdx, toIdx);
                me.fireEvent('columnmove', me, groupColumn, column, fromIdx, toIdx);
            }
        } else {
            fromIdx = columns.indexOf(column);
            toIdx = columnIndex;
            Ext.Array.move(columns, fromIdx, toIdx);
            me.fireEvent('columnmove', me, column, null, fromIdx, toIdx);
        }
    },

    onColumnRemove: function(parent, column) {
        if (column.isHeaderGroup) {
            var columns = column.getItems().items,
                ln = columns.length,
                i;

            for (i = 0; i < ln; i++) {
                this.onColumnRemove(column, columns[i]);
            }
        } else {
            Ext.Array.remove(this.columns, column);
            this.fireEvent('columnremove', this, column);
        }
    },

    onHeaderTap: function(column) {
        if (this.getSortable() && !column.getIgnore() && column.getSortable()) {
            var sortDirection = column.getSortDirection() || 'DESC',
                newDirection = (sortDirection === 'DESC') ? 'ASC' : 'DESC';

            column.setSortDirection(newDirection);
        }

        this.fireEvent('columntap', this, column);
    },

    onColumnShow: function(column) {
        this.fireEvent('columnshow', this, column);
    },

    onColumnHide: function(column) {
        this.fireEvent('columnhide', this, column);
    },

    onGroupShow: function(group) {
        var columns = group.getInnerItems(),
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (!column.isHidden()) {
                this.fireEvent('columnshow', this, column);
            }
        }
    },

    onGroupHide: function(group) {
        var columns = group.getInnerItems(),
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            this.fireEvent('columnhide', this, column);
        }
    },

    onGroupTap: function(column) {
        this.fireEvent('headergrouptap', this, column);
    },

    onColumnResize: function(column, width, oldWidth) {
        this.fireEvent('columnresize', this, column, width, oldWidth);
    },

    onColumnSort: function(column, direction, newDirection) {
        if (direction !== null) {
            this.fireEvent('columnsort', this, column, direction, newDirection);
        }
    },

    scrollTo: function(x) {
        this.getScrollable().scrollTo(x);
    },

    updateGrid: function(grid) {
        this.parent = grid;
    },

    doDestroy: function() {
        var me = this,
            task = me.spacerTask;

        if (task) {
            task.cancel();
            me.spacerTask = null;
        }
        
        me.setGrid(null);
        me.callParent();
    },

    privates: {
        setScrollbarSpacer: function(scrollbarSize) {
            var me = this,
                spacerEl = me.spacerEl;

            if (!spacerEl) {
                spacerEl = me.spacerEl = Ext.dom.Element.create();
            }

            me.innerElement.appendChild(spacerEl); // spacer element must always be the last child
            spacerEl.setStyle('min-width', scrollbarSize + 'px');
        }
    }
});
