/**
 * Grids are an excellent way of showing large amounts of tabular data on the client side.
 * Essentially a supercharged `<table>`, Grid makes it easy to fetch, sort and filter large
 * amounts of data.
 *
 * Grids are composed of two main pieces - a {@link Ext.data.Store Store} full of data and
 * a set of columns to render.
 *
 * ## A Basic Grid
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         fields: ['name', 'email', 'phone'],
 *         data: [
 *             { 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
 *             { 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234" },
 *             { 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  },
 *             { 'name': 'Marge', "email":"marge@simpsons.com", "phone":"555-222-1254"  }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         title: 'Simpsons',
 *
 *         store: store,
 *
 *         columns: [
 *             { text: 'Name',  dataIndex: 'name', width: 200 },
 *             { text: 'Email', dataIndex: 'email', width: 250 },
 *             { text: 'Phone', dataIndex: 'phone', width: 120 }
 *         ],
 *
 *         height: 200,
 *         layout: 'fit',
 *         fullscreen: true
 *     });
 *
 * The code above produces a simple grid with three columns. We specified a Store which will
 * load JSON data inline. In most apps we would be placing the grid inside another container
 * and wouldn't need to provide the {@link #height}, {@link #width} and 
 * {@link #cfg-fullscreen} options but they are included here to for demonstration.
 *
 * The grid we created above will contain a header bar with a title ('Simpsons'), a row of
 * column headers directly underneath and finally the grid rows under the headers.
 *
 * ## Columns
 *
 * By default, each {@link Ext.grid.column.Column column} is sortable and toggles between
 * ascending and descending sorting when you click on its header. There are several basic
 * configs that can be applied to columns to change these behaviors. For example:
 *
 *     columns: [
 *         {
 *             text: 'Name',
 *             dataIndex: 'name',
 *             sortable: false,  // column cannot be sorted
 *             width: 250
 *         },
 *         {
 *             text: 'Email',
 *             dataIndex: 'email',
 *             hidden: true  // column is initially hidden
 *         },
 *         {
 *             text: 'Phone',
 *             dataIndex: 'phone',
 *             width: 100
 *         }
 *     ]
 *
 * We turned off sorting on the 'Name' column so clicking its header now has no effect. We
 * also made the Email column hidden by default (it can be shown again by using the
 * {@link Ext.grid.plugin.ViewOptions ViewOptions} plugin). See the
 * {@link Ext.grid.column.Column column class} for more details.
 *
 * A top-level column definition may contain a `columns` configuration. This means that the 
 * resulting header will be a group header, and will contain the child columns.
 *
 * ## Rows and Cells
 *
 * Grid extends the `{@link Ext.dataview.List List}` component and connects records in the
 * store to `{@link Ext.grid.Row row components}` for the list's items. The Row component
 * utilizes the configs of the grid's {@link Ext.grid.column.Column columns} to create the
 * appropriate type of {@link Ext.grid.cell.Base cells}. Essentially, a Row is a container
 * for {@link Ext.Widget Cell widgets}.
 *
 * For the most part, configuring a grid is about configuring the columns and their cells.
 * There are several built-in column types to display specific types of data:
 *
 *  - {@link Ext.grid.column.Boolean} for true/false values.
 *  - {@link Ext.grid.column.Date} for date/time values.
 *  - {@link Ext.grid.column.Number} for numeric values.
 *
 * These columns specify (via their {@link Ext.grid.column.Column#cell cell config}) one
 * of these basic cell widget types:
 *
 *  - {@link Ext.grid.cell.Boolean}
 *  - {@link Ext.grid.cell.Date}
 *  - {@link Ext.grid.cell.Number}
 *
 * In addition to the above basic cell types, there are two other useful cell types to
 * know about:
 *
 *  - {@link Ext.grid.cell.Text} is the base class for the boolean, date and number cell
 *    classes. It is useful when a cell contains only text.
 *  - {@link Ext.grid.cell.Widget} is a cell class that manages a single child item (either
 *    a {@link Ext.Component component} or a {@link Ext.Widget widget}). The child item is
 *    configured using the `{@link Ext.grid.cell.Widget#widget widget config}`. The most
 *    important part of this config is the `xtype` of the child item to create.
 *
 * ## Cells and Binding
 *
 * One technique to controll cell content and styling is to use data binding to target
 * cell configs like {@link Ext.grid.cell.Base#cls} and {@link Ext.grid.cell.Base#innerCls}.
 * This is done by assigning a {@link Ext.app.ViewModel viewModel} to each Row like so:
 *
 *      itemConfig: {
 *          viewModel: true  // create default ViewModel for each item (i.e., Row)
 *      }
 *
 * Now that each Row has a ViewModel, cells can bind to the fields of the associated record
 * like so:
 *
 *      columns: [{
 *          ...
 *          cell: {
 *              bind: {
 *                  cls: '{record.someCls}'
 *              }
 *          }
 *      }]
 *
 * The "record" property in the ViewModel is managed by the Row. As Row instances are
 * recycled due to buffered rendering, the associated record instance simply changes over
 * time.
 *
 * ### Cell Widgets
 *
 * When using {@link Ext.grid.cell.Widget}, the contained widgets can also use binding to
 * configure themsleves using properties of the associated record.
 *
 *      columns: [{
 *          ...
 *          cell: {
 *              xtype: 'widgetcell',
 *              widget: {
 *                  xtype: 'button',
 *                  bind: {
 *                      text: 'Update {record.firstName}'
 *                  }
 *              }
 *          }
 *      }]
 *
 * ### Row ViewModels
 *
 * In some cases a custom ViewModel could be useful, for example to provide useful values
 * via {@link Ext.app.ViewModel#formulas formulas}.
 *
 *      itemConfig: {
 *          viewModel: {
 *              type: 'rowViewModel'
 *          }
 *      }
 *
 * ## Renderers and Templates
 *
 * Columns provide two other mechanisms to format their cell content:
 *
 *  - {@link Ext.grid.column.Column#renderer}
 *  - {@link Ext.grid.column.Column#tpl}
 *
 * These column configs are processed by the {@link Ext.grid.column.Cell default cell type}
 * for a column. These configs have some downsides compared to data binding but are provided
 * for compatibility with previous releases.
 *
 *  - Renderers and templates must update the cell content when _any_ field changes. They
 *    cannot assume that only changes to the dataIndex will affect the rendering. Using
 *    data binding, only the configs affected by the changed data will be updated.
 *  - Updates are processed synchronously in response to the record update notification.
 *    Contrast to ViewModels which provide a buffered update mechanism.
 *  - Constructing HTML blocks in code (even in a template) is a common cause of security
 *    problems such as XSS attacks.
 *
 * ## Sorting & Filtering
 *
 * Every grid is attached to a {@link Ext.data.Store Store}, which provides multi-sort and
 * filtering capabilities. It's easy to set up a grid to be sorted from the start:
 *
 *     var myGrid = Ext.create('Ext.grid.Panel', {
 *         store: {
 *             fields: ['name', 'email', 'phone'],
 *             sorters: ['name', 'phone']
 *         },
 *         columns: [
 *             { text: 'Name',  dataIndex: 'name' },
 *             { text: 'Email', dataIndex: 'email' }
 *         ]
 *     });
 *
 * Sorting at run time is easily accomplished by simply clicking each column header. If you
 * need to perform sorting on more than one field at run time it's easy to do so by adding
 * new sorters to the store:
 *
 *     myGrid.store.sort([
 *         { property: 'name',  direction: 'ASC' },
 *         { property: 'email', direction: 'DESC' }
 *     ]);
 *
 * See {@link Ext.data.Store} for examples of filtering.
 *
 * ## Plugins
 *
 * Grid supports addition of extra functionality through plugins:
 *
 * - {@link Ext.grid.plugin.ViewOptions ViewOptions} - adds the ability to show/hide
 *  columns and reorder them.
 *
 * - {@link Ext.grid.plugin.ColumnResizing ColumnResizing} - allows for the ability to
 *  resize columns.
 *
 * - {@link Ext.grid.plugin.Editable Editable} - editing grid contents one row at a time.
 *
 * - {@link Ext.grid.plugin.MultiSelection MultiSelection} - selecting and deleting several
 *   rows at a time.
 *
 * - {@link Ext.grid.plugin.PagingToolbar PagingToolbar} - adds a toolbar at the bottom of
 *   the grid that allows you to quickly navigate to another page of data.
 *
 * - {@link Ext.grid.plugin.SummaryRow SummaryRow} - adds and pins an additional row to the
 *   top of the grid that enables you to display summary data.
 */
Ext.define('Ext.grid.Grid', {
    extend: 'Ext.dataview.List',
    xtype: 'grid',

    isGrid: true,

    requires: [
        'Ext.grid.Row',
        'Ext.grid.column.Column',
        'Ext.grid.column.Date',
        'Ext.grid.column.Template',
        'Ext.grid.HeaderContainer',
        'Ext.grid.HeaderGroup',
        'Ext.TitleBar',
        'Ext.MessageBox'
    ],

    config: {
        defaultType: 'gridrow',

        /**
         * @cfg {Boolean} infinite
         * This List configuration should always be set to true on a Grid.
         * @hide
         */
        infinite: true,

        /**
         * @cfg {Ext.grid.column.Column[]} columns (required)
         * An array of column definition objects which define all columns that appear in this grid.
         * Each column definition provides the header text for the column, and a definition of where
         * the data for that column comes from.
         *
         * This can also be a configuration object for a {Ext.grid.header.Container HeaderContainer}
         * which may override certain default configurations if necessary. For example, the special
         * layout may be overridden to use a simpler layout, or one can set default values shared
         * by all columns:
         *
         *      columns: {
         *          items: [
         *              {
         *                  text: "Column A"
         *                  dataIndex: "field_A",
         *                  width: 200
         *              },{
         *                  text: "Column B",
         *                  dataIndex: "field_B",
         *                  width: 150
         *              },
         *              ...
         *          ]
         *      }
         *
         */
        columns: null,

        /**
         * @cfg {Boolean} variableHeights
         * This configuration is best left to false on a Grid for performance reasons.
         * @private
         */
        variableHeights: false,

        headerContainer: {
            xtype: 'headercontainer'
        },

        /**
         * @cfg {Boolean} hideHeaders
         * `true` to hide the grid column headers.
         *
         * @since 6.0.1
         */
        hideHeaders: false,

        pinnedHeader: {
            xtype: 'rowheader'
        },

        /**
         * @cfg {Boolean} striped
         * @inherit
         */
        striped: true,

        scrollToTopOnRefresh: false,

        titleBar: {
            xtype: 'titlebar',
            docked: 'top'
        },

        /**
         * @cfg {String} title
         * The title that will be displayed in the TitleBar at the top of this Grid.
         */
        title: '',

        /**
         * @cfg {Number} totalColumnWidth
         * The total column width
         * @private
         */
        totalColumnWidth: null
    },

    /**
     * @event columnadd
     * Fires whenever a column is added to the Grid.
     * @param {Ext.grid.Grid} this The Grid instance.
     * @param {Ext.grid.column.Column} column The added column.
     * @param {Number} index The index of the added column.
     */
    
    /**
     * @event columnmove
     * Fires whenever a column is moved in the grid.
     * @param {Ext.grid.Grid} this The Grid instance.
     * @param {Ext.grid.column.Column} column The moved column.
     * @param {Number} fromIndex The index the column was moved from.
     * @param {Number} toIndex The index the column was moved to.
     */

    /**
     * @event columnremove
     * Fires whenever a column is removed from the Grid.
     * @param {Ext.grid.Grid} this The Grid instance.
     * @param {Ext.grid.column.Column} column The removed column.
     */

    /**
     * @event columnshow
     * Fires whenever a column is shown in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance.
     * @param {Ext.grid.column.Column} column The shown column.
     */

    /**
     * @event columnhide
     * Fires whenever a column is hidden in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance.
     * @param {Ext.grid.column.Column} column The shown column.
     */

    /**
     * @event columnresize
     * Fires whenever a column is resized in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance.
     * @param {Ext.grid.column.Column} column The resized column.
     * @param {Number} width The new column width.
     */

    /**
     * @event columnsort
     * Fires whenever a column is sorted in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance.
     * @param {Ext.grid.column.Column} column The sorted column.
     * @param {String} direction The direction of the sort on this Column. Either 'asc' or 'desc'.
     */

    classCls: Ext.baseCSSPrefix + 'grid',
    itemSelector: '.' + Ext.baseCSSPrefix + 'gridrow',

    getElementConfig: function() {
        var config = this.callParent();

        config.children.push({
            reference: 'resizeMarkerElement',
            className: Ext.baseCSSPrefix + 'resize-marker-el',
            hidden: true
        });

        return config;
    },

    initialize: function() {
        var me = this,
            titleBar = me.getTitleBar(),
            headerContainer = me.getHeaderContainer(),
            scrollable = me.getScrollable();

        me.callParent();

        me.on('resize', 'onResize', me);

        if (scrollable) {
            headerContainer.getScrollable().addPartner(scrollable, 'x');
        }
        if (titleBar) {
            me.add(titleBar);
        }
        me.add(headerContainer);
    },

    applyTitleBar: function(titleBar) {
        if (titleBar && !titleBar.isComponent) {
            titleBar = Ext.factory(titleBar, Ext.TitleBar);
        }
        return titleBar;
    },

    updateTitle: function(title) {
        var titleBar = this.getTitleBar();
        if (titleBar) {
            if (title) {
                titleBar.setTitle(title);
            } else {
                titleBar.hide();
            }
        }
    },

    applyHeaderContainer: function(headerContainer) {
        if (headerContainer && !headerContainer.isComponent) {
            headerContainer = Ext.factory(headerContainer, Ext.grid.HeaderContainer);
        }
        return headerContainer;
    },

    updateHeaderContainer: function(headerContainer, oldHeaderContainer) {
        var me = this;

        if (oldHeaderContainer) {
            oldHeaderContainer.un({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnmove: 'onColumnMove',
                columnremove: 'onColumnRemove',
                scope: me
            });
        }

        if (headerContainer) {
            headerContainer.on({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnmove: 'onColumnMove',
                columnremove: 'onColumnRemove',
                scope: me
            });
            headerContainer.setGrid(me);
        }
    },

    updateHideHeaders: function(hideHeaders) {
        var ct = this.getHeaderContainer(),
            oldCtHeight = this.oldCtHeight || null;
 
        // Don't touch the height if we don't need to
        if (!hideHeaders && ct.getHeight() !== 0) {
            return;
        }

        // We rely on the headers to provide sizing, so we can't just hide
        // the headerCt. Try and capture the old height if we had one.
        if (hideHeaders) {
            this.oldCtHeight = ct.getHeight();
        }
        ct.setHeight(hideHeaders ? 0 : oldCtHeight);
    },

    addColumn: function(column) {
        return this.getHeaderContainer().add(column);
    },

    removeColumn: function(column) {
        return this.getHeaderContainer().remove(column);
    },

    insertColumn: function(index, column) {
        return this.getHeaderContainer().insert(index, column);
    },

    onColumnAdd: function(container, column) {
        var me = this,
            items, ln, columnIndex, i, row;

        if (me.initialized && !me.destroying) {
            items = this.listItems;
            ln = items.length;
            columnIndex = container.getColumns().indexOf(column);

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.insertColumn(columnIndex, column);
            }

            me.refreshScroller();

            me.fireEvent('columnadd', me, column, columnIndex);
        }
    },

    onColumnMove: function(container, column, group, fromIdx, toIdx) {
        var me = this,
            items, ln, i, row;

        if (me.initialized && !me.destroying) {
            items = me.listItems;
            ln = items.length;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.moveColumn(column, fromIdx, toIdx);
            }

            me.fireEvent('columnmove', me, column, fromIdx, toIdx);
        }
    },

    onColumnRemove: function(container, column) {
        var me = this,
            items, ln, i, row;

        if (me.initialized && !me.destroying) {
            if (column === me.sortedColumn) {
                me.sortedColumn = null;
            }

            items = me.listItems;
            ln = items.length;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.removeColumn(column);
            }

            me.refreshScroller();

            me.fireEvent('columnremove', me, column);
        }
    },

    updateColumns: function(columns) {
        var header = this.getHeaderContainer();

        if(header) {
            header.removeAll(true, true);
        }

        if (columns && columns.length) {
            this.addColumn(columns);
            this.refreshScroller();
        }
    },

    getColumns: function() {
        return this.getHeaderContainer().getColumns();
    },

    onColumnResize: function(container, column, width, oldWidth) {
        var me = this,
            items = me.listItems,
            ln = items.length,
            i, row;

        if (!me.destroying) {
            for (i = 0; i < ln; i++) {
                row = items[i];
                row.setColumnWidth(column, width);
            }
            if (me.initialized) {
                me.refreshScroller();
                // Will be null on the first time
                if (oldWidth && !column.getHidden()) {
                    me.fireEvent('columnresize', me, column, width);
                }
            }
        }
    },

    onColumnShow: function(container, column) {
        var me = this,
            items, ln, i, row, w;

        if (me.initialized && !me.destroying) {
            items = me.listItems;
            ln = items.length;

            me.refreshScroller();
            if (!column.getFlex()) {
                w = column.getWidth();
            }
            for (i = 0; i < ln; i++) {
                row = items[i];
                row.showColumn(column);
                // If we have a fixed width column, we won't get a resize event
                // from the resize listener, so force the cell width
                if (w !== undefined) {
                    row.setColumnWidth(column, w);
                }
            }

            me.fireEvent('columnshow', me, column);
        }
    },

    onColumnHide: function(container, column) {
        var me = this,
            items, ln, i, row;

        if (me.initialized && !me.destroying) {
            items = me.listItems;
            ln = items.length;

            me.refreshScroller();
            for (i = 0; i < ln; i++) {
                row = items[i];
                row.hideColumn(column);
            }

            me.fireEvent('columnhide', me, column);
        }
    },

    onColumnSort: function(container, column, direction) {
        var me = this,
            sorted = me.sortedColumn;

        if (sorted && sorted !== column) {
            sorted.setSortDirection(null);
        }
        me.sortedColumn = column;

        me.getStore().sort(column.getDataIndex(), direction);

        me.fireEvent('columnsort', me, column, direction);
    },

    onResize: function() {
        this.refreshScroller();
    },

    calculateTotalColumnWidth: function() {
        return this.getColumnsWidth(this.getColumns());
    },

    getColumnsWidth: function(columns) {
        var width = 0,
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];

            if (column.isHeaderGroup && !column.isHidden()) {
                width += this.getColumnsWidth(column.getColumns());
            } else if (!column.isHeaderGroup && !column.isHidden()) {
                width += column.element.getWidth(false, true);
            }
        }
        return width;
    },

    getVisibleColumns: function() {
        var columns = this.getColumns,
            len = columns.length, i, column,
            result = [];

        for (i = 0; i < len; i++) {
            column = columns[i];
            if (!column.isHeaderGroup && !column.isHidden()) {
                result.push(column);
            }
        }
        return result;
    },

    refreshScroller: function(skipOnRefresh) {
        var me = this,
            scroller = me.getScrollable(),
            headerContainer = me.getHeaderContainer(),
            headerScroller = headerContainer.getScrollable(),
            totalWidth = me.calculateTotalColumnWidth(),
            pinned = me.getPinnedHeader(),
            scrollbarSize;

        if (totalWidth && !isNaN(totalWidth)) {
            me.setTotalColumnWidth(totalWidth);
            if (scroller) {
                scroller.setSize({
                    x: totalWidth,
                    y: me.getInfinite() ? me.getItemMap().getTotalHeight() : null
                });

                scrollbarSize = me.getVerticalScrollbarSize();

                if (scrollbarSize) {
                    totalWidth -= scrollbarSize;

                    scroller.setSize({
                        x: totalWidth
                    });
                }
            }

            if (headerScroller) {
                scrollbarSize = scrollbarSize || me.getVerticalScrollbarSize();

                headerScroller.setSize({
                    x: totalWidth + scrollbarSize,
                    y: null
                });
            }

            scrollbarSize = scrollbarSize || 0;
            headerContainer.setScrollbarSpacer(scrollbarSize);
            // Because it's pinned it sits outside of the scrolling container, which is why we need this madness.
            if (pinned) {
                if (scrollbarSize) {
                    pinned.setWidth(Ext.String.format('calc(100% - {0}px)', scrollbarSize + 1));
                } else {
                    pinned.setWidth('100%');
                }
            }
        }

        me.afterRefreshScroller(scroller, skipOnRefresh);
    },

    getVerticalScrollbarSize: function() {
        var scroller = this.getScrollable();

        return (scroller && scroller.getMaxUserPosition().y) && (Ext.getScrollbarSize().width || 0);
    },

    createItem: function(config) {
        config.grid = this;

        return this.callParent([config]);
    },

    doDestroy: function() {
        this.sortedColumn = null;
        
        this.callParent();
    },

    privates: {
        getCellFromEvent: function(e) {
            var selector = Ext.grid.cell.Base.prototype.cellSelector,
                target = e.getTarget(selector, this.element),
                ret;

            if (target) {
                ret = Ext.getCmp(target.id);
            }
            return ret || null;
        },

        applyTotalColumnWidth: function(totalColumnWidth) {
            var rows = this.listItems;
            // If we don't have any items yet, wait
            return rows.length === 0 ? undefined : totalColumnWidth;
        },

        updateTotalColumnWidth: function(totalColumnWidth) {
            var rows = this.listItems,
                len = rows.length,
                i, header;

            for (i = 0; i < len; ++i) {
                header = rows[i].getHeader();
                if (header) {
                    header.setMinWidth('100%');
                    header.setWidth(totalColumnWidth);
                }
            }
        }
    }
});
