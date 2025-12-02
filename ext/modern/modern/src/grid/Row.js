/**
 * This class is created by a {@link Ext.grid.Grid grid} to manage each record. Rows act
 * as containers for {@link Ext.grid.cell.Base cells}.
 *
 * Row does not extend {@link Ext.Container} to keep overhead to a minimum. Application
 * code should not need to create instances of this class directly. Rows are created by
 * the {@link Ext.dataview.List} base as configured by {@link Ext.grid.Grid}.
 */
Ext.define('Ext.grid.Row', {
    extend: 'Ext.Component',
    xtype: 'gridrow',

    requires: [
        'Ext.grid.cell.Cell',
        'Ext.grid.RowBody'
    ],

    mixins: [
        'Ext.mixin.Queryable'
    ],

    isGridRow: true,

    config: {
        // Lazy mean if anything calls getter this will be spun up, otherwise it will not
        // update list to not call getHeader unless grouped is true
        header: {
            $value: {
                xtype: 'rowheader'
            },
            lazy: true
        },

        /**
         * @cfg {Object}
         * A config object for this row's {@link Ext.grid.RowBody Row Body}.
         * When a {@link Ext.grid.plugin.RowExpander Row Expander} is used all row bodies
         * begin collapsed, and can be expanded by clicking on the row expander icon.
         * When no Row Expander is present row bodies are always expanded by default but
         * can be collapsed programmatically using {@link #collapse}.
         */
        body: null,

        grid: null,

        /**
         * @cfg {String} [expandedField]
         * The name of a `boolean` field in the grid's record which is to be used to check expanded state.
         * Note that this field should be `true` to indicate expanded, and `false` to indicate collapsed.
         * By default the expanded state of a record is stored on the associated `grid` component allowing
         * that record to have different expand/collapse states on a per-grid basis.
         */
        expandedField: null,

        /**
         * A default {@link #ui ui} to use for {@link Ext.grid.cell.Base cells} in this row.
         */
        defaultCellUI: null
    },

    classCls: [
        Ext.baseCSSPrefix + 'listitem',
        Ext.baseCSSPrefix + 'gridrow'
    ],

    expandedCls: Ext.baseCSSPrefix + 'expanded',

    element: {
        reference: 'element',
        children: [{
            reference: 'cellsElement',
            className: Ext.baseCSSPrefix + 'cells-el'
        }]
    },

    // Causes this config to only run against the first instance
    cachedConfig: {
        collapsed: true
    },

    constructor: function (config) {
        this.cells = [];
        this.columnMap = {};
        this.callParent([config]);
    },

    toggleCollapsed: function() {
        this.setCollapsed(!this.getCollapsed());
    },

    /**
     * Collapses the row {@link #body}
     */
    collapse: function () {
        this.setCollapsed(true);
    },

    /**
     * Expands the row {@link #body}
     */
    expand: function () {
        this.setCollapsed(false);
    },

    updateCollapsed: function (collapsed) {
        var me = this,
            body = me.getBody(),
            grid = me.getGrid(),
            record = me.getRecord(),
            expandField = me.getExpandedField(),
            expandedCls = me.expandedCls,
            recordsExpanded;

        // Set state correctly before any other code executes which may read this.
        if (record) {
            // We have to track the state separately, if we are not using a record
            // field to track expanded state.
            if (expandField) {
                record.set(expandField, !collapsed);
            } else {
                recordsExpanded = grid.$recordsExpanded || (grid.$recordsExpanded = {});
                if (collapsed) {
                    delete recordsExpanded[record.internalId];
                } else {
                    recordsExpanded[record.internalId] = true;
                }
            }
        }

        if (body) {
            if (collapsed) {
                body.hide();
                me.removeCls(expandedCls);
            } else {
                body.show();
                me.addCls(expandedCls);
            }

            if (!me.$updating) {
                grid.onItemHeightChange();
            }
        }
    },

    applyHeader: function (header) {
        var grid = this.getGrid();
        if (grid && grid.isGrouping() && header && !header.isComponent) {
            header = Ext.factory(header, Ext.Component, this.getHeader());
            return header;
        }

        return null;
    },

    updateHeader: function (header, oldHeader) {
        if (oldHeader) {
            oldHeader.destroy();
        }
    },

    applyBody: function (body) {
        if (body) {
            body = Ext.merge({parent: this, hidden: true}, body);
            body = Ext.factory(body, Ext.grid.RowBody, this.getBody());
        }
        return body;
    },

    updateBody: function (body, oldBody) {
        var me = this,
            grid = me.getGrid();

        if (oldBody) {
            oldBody.destroy();
        }

        if (body) {
            me.innerElement.appendChild(body.element);
        }

        if (grid && !grid.hasRowExpander) {
            me.expand();
        }
    },

    updateGrid: function (grid) {
        var me = this,
            i, columns, ln;

        if (grid) {
            columns = grid.getColumns();
            for (i = 0, ln = columns.length; i < ln; i++) {
                me.addColumn(columns[i]);
            }
        }
    },

    addColumn: function (column) {
        this.insertColumn(this.cells.length, column);
    },

    getRefItems: function () {
        return this.cells;
    },

    insertColumn: function (index, column) {
        var me = this,
            cells, cell;

        if (column.isHeaderGroup) {
            return;
        }

        cells = me.cells;
        cell = me.createCell(column);
        if (index >= cells.length) {
            me.cellsElement.appendChild(cell.element);
            cells.push(cell);
        } else {
            cell.element.insertBefore(cells[index].element);
            cells.splice(index, 0, cell);
        }

        me.columnMap[column.getId()] = cell;
    },

    moveColumn: function (column, fromIdx, toIdx) {
        var cells = this.cells,
            cell = cells[fromIdx];

        Ext.Array.move(cells, fromIdx, toIdx);
        if (toIdx === cells.length - 1) {
            this.cellsElement.appendChild(cell.element);
        } else {
            cell.element.insertBefore(cells[toIdx + 1].element);
        }
    },

    removeColumn: function (column) {
        var me = this,
            columnMap = me.columnMap,
            columnId = column.getId(),
            cell = columnMap[columnId];

        if (cell) {
            Ext.Array.remove(me.cells, cell);
            delete columnMap[columnId];
            cell.destroy();
        }
    },

    updateRecord: function(record) {
        if (!record || this.destroyed) {
            return;
        }

        var me = this,
            cells = me.cells,
            body = me.getBody(),
            len = cells.length,
            expandField = me.getExpandedField(),
            i, cell, grid, recordsExpanded;

        for (i = 0; i < len; ++i) {
            cell = cells[i];
            if (cell.getRecord() === record) {
                cell.updateRecord(record);
            } else {
                cell.setRecord(record);
            }
        }

        if (body) {
            grid = me.getGrid();
            if (body.getRecord() === record) {
                body.updateRecord(record);
            } else {
                body.setRecord(record);
            }

            // If the plugin knows that the record contains an expanded flag
            // ensure our state is synchronized with our record.
            // Maintainer: We are testing the result of the assignment of expandedField
            // in order to avoid a messy, multiple level if...else.
            if (expandField) {
                me.setCollapsed(!record.get(expandField));
            } else {
                recordsExpanded = grid.$recordsExpanded || (grid.$recordsExpanded = {});
                if (grid.hasRowExpander) {
                    me.setCollapsed(!recordsExpanded[record.internalId]);
                }
            }
        }
    },

    setColumnWidth: function (column, width) {
        var cell = this.getCellByColumn(column);
        if (cell) {
            cell.setWidth(width);
        }
    },

    showColumn: function (column) {
        this.setCellHidden(column, false);
    },

    hideColumn: function (column) {
        this.setCellHidden(column, true);
    },

    getCellByColumn: function (column) {
        return this.columnMap[column.getId()];
    },

    getColumnByCell: function (cell) {
        return cell.getColumn();
    },

    doDestroy: function() {
        var me = this;

        Ext.destroy(me.getBody());
        me.cells = Ext.destroy(me.cells, me.getHeader());
        me.setRecord(null);
        me.callParent();
    },

    privates: {
        createCell: function (column) {
            var cell = this.getCellCfg(column);

            cell.$initParent = this;
            cell = Ext.create(cell);
            delete cell.$initParent;

            return cell;
        },

        getCellCfg: function (column) {
            var me = this,
                cfg = {
                    parent: me,
                    column: column,
                    record: me.getRecord(),
                    ui: me.getDefaultCellUI(),
                    hidden: column.isHidden(me.getGrid().getHeaderContainer()),
                    width: column.getComputedWidth() || column.getWidth()
                },
                align = column.getAlign();

            if (align) {
                // only put align on the config object if it is not null.  This prevents
                // the column's default value of null from overriding a value set on the
                // cell's class definition (e.g. widgetcell)
                cfg.align = align;
            }

            return Ext.apply(cfg, me.getColumnCell(column));
        },

        // Overridden by Summary Row to return getSummaryCell()
        getColumnCell: function(column) {
            return column.getCell();
        },

        setCellHidden: function (column, hidden) {
            var cell = this.getCellByColumn(column);
            if (cell) {
                cell.setHidden(hidden);
            }
        }
    }
});
