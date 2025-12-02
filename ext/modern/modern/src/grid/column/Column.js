/**
 * This class specifies the definition for a column inside a {@link Ext.grid.Grid}. It
 * encompasses both the grid header configuration as well as displaying data within the
 * grid itself.
 *
 * In general an array of column configurations will be passed to the grid:
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId: 'employeeStore',
 *         fields: ['firstname', 'lastname', 'seniority', 'dep', 'hired'],
 *         data: [
 *             {firstname:"Michael", lastname:"Scott", seniority:7, dep:"Management", hired:"01/10/2004"},
 *             {firstname:"Dwight", lastname:"Schrute", seniority:2, dep:"Sales", hired:"04/01/2004"},
 *             {firstname:"Jim", lastname:"Halpert", seniority:3, dep:"Sales", hired:"02/22/2006"},
 *             {firstname:"Kevin", lastname:"Malone", seniority:4, dep:"Accounting", hired:"06/10/2007"},
 *             {firstname:"Angela", lastname:"Martin", seniority:5, dep:"Accounting", hired:"10/21/2008"}
 *         ]
 *     });
 *
 *     var grid = Ext.create('Ext.grid.Grid', {
 *         title: 'Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {text: 'Hired Month',  dataIndex:'hired', xtype:'datecolumn', format:'M'},
 *             {text: 'Department (Yrs)', xtype:'templatecolumn', tpl:'{dep} ({seniority})'}
 *         ],
 *         width: 400
 *     });
 *     Ext.ViewPort.add(grid);
 *
 * # Convenience Subclasses
 *
 * There are several column subclasses that provide default rendering for various data types
 *
 *  - {@link Ext.grid.column.Boolean}: Renders for boolean values
 *  - {@link Ext.grid.column.Date}: Renders for date values
 *  - {@link Ext.grid.column.Number}: Renders for numeric values
 *
 * For more information about configuring cell content, see {@link Ext.grid.Grid}.
 *
 * # Setting Sizes
 *
 * The columns can be only be given an explicit width value. If no width is specified the
 * grid will automatically the size the column to 20px.
 *
 * # Header Options
 *
 *  - {@link #text}: Sets the header text for the column
 *  - {@link #sortable}: Specifies whether the column can be sorted by clicking the header
 *    or using the column menu
 *
 * # Data Options
 *
 *  - {@link #dataIndex}: The dataIndex is the field in the underlying {@link Ext.data.Store}
 *    to use as the value for the column.
 *  - {@link #renderer}: Allows the underlying store value to be transformed before being
 *    displayed in the grid.
 */
Ext.define('Ext.grid.column.Column', {
    extend: 'Ext.Component',
    alternateClassName: 'Ext.grid.column.Template',

    xtype: ['gridcolumn', 'column', 'templatecolumn'],

    // This mixin is used to cache the padding size for cells in this column,
    // to be shared by all cells in the column.
    mixins: ['Ext.mixin.StyleCacher'],

    config: {
        /**
         * @cfg {String} [align='left']
         * Sets the alignment of the header and rendered columns.
         * Possible values are: `'left'`, `'center'`, and `'right'`.
         */
        align: null,

        /**
         * @cfg {Object} cell
         * The config object used to create {@link Ext.grid.cell.Base cells} for this column.
         * By default, cells use the {@link Ext.grid.cell.Cell gridcell} `xtype`. To create
         * a different type of cell, simply provide this config and the desired `xtype`.
         */
        cell: {
            xtype: 'gridcell'
        },

        /**
         * @cfg {String} dataIndex
         * The name of the field in the grid's {@link Ext.data.Store}'s {@link Ext.data.Model} definition from
         * which to draw the column's value. **Required.**
         */
        dataIndex: null,

        /**
         * @cfg {Number} defaultWidth
         * A width to apply if the {@link #flex} or {@link #width} configurations have not
         * been specified.
         *
         * @since 6.2.0
         */
        defaultWidth: 100,

        /**
         * @cfg {String} text
         * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
         * **Note**: to have a clickable header with no text displayed you can use the default of `&#160;` aka `&nbsp;`.
         */
        text: '&nbsp;',

        /**
         * @cfg {Boolean} sortable
         * False to disable sorting of this column. Whether local/remote sorting is used is specified in
         * `{@link Ext.data.Store#remoteSort}`.
         */
        sortable: true,

        /**
         * @cfg {Boolean} groupable
         * If the grid is {@link Ext.grid.Grid#grouped grouped}, and uses a
         * {@link Ext.grid.plugin.ViewOptions ViewOptions} plugin this option may be used to
         * disable the option to group by this column. By default, the group option is enabled.
         */
        groupable: true,

        /**
         * @cfg {Boolean} resizable
         * False to prevent the column from being resizable.
         * Note that this configuration only works when the {@link Ext.grid.plugin.ColumnResizing ColumnResizing} plugin
         * is enabled on the {@link Ext.grid.Grid Grid}.
         */
        resizable: true,

        /**
         * @cfg {Boolean} hideable
         * False to prevent the user from hiding this column.
         * TODO: Not implemented yet
         * @private
         */
        hideable: true,

        /**
         * @cfg {Function/String} renderer
         * A renderer is a method which can be used to transform data (value, appearance, etc.)
         * before it is rendered.
         *
         * For example:
         *
         *      {
         *          text: 'Some column',
         *          dataIndex: 'fieldName',
         *
         *          renderer: function (value, record) {
         *              if (value === 1) {
         *                  return '1 person';
         *              }
         *              return value + ' people';
         *          }
         *      }
         *
         * If a string is supplied, it should be the name of a renderer method from the
         * appropriate {@link Ext.app.ViewController}.
         *
         * This config is only processed if the {@link #cell} type is the default of
         * {@link Ext.grid.cell.Cell gridcell}.
         *
         * **Note** See {@link Ext.grid.Grid} documentation for other, better alternatives
         * to rendering cell content.
         *
         * @cfg {Object} renderer.value The data value for the current cell.
         * @cfg {Ext.data.Model} renderer.record The record for the current row.
         * @cfg {Number} renderer.dataIndex The dataIndex of the current column.
         * @cfg {Ext.grid.cell.Base} renderer.cell The current cell.
         * @cfg {Ext.grid.column.Column} renderer.column The current column.
         * @cfg {String} renderer.return The HTML string to be rendered.
         */
        renderer: null,

        /**
         * @cfg {String} formatter
         * This config accepts a format specification as would be used in a `Ext.Template`
         * formatted token. For example `'round(2)'` to round numbers to 2 decimal places
         * or `'date("Y-m-d")'` to format a Date.
         *
         * In previous releases the `renderer` config had limited abilities to use one
         * of the `Ext.util.Format` methods but `formatter` now replaces that usage and
         * can also handle formatting parameters.
         *
         * When the value begins with `"this."` (for example, `"this.foo(2)"`), the
         * implied scope on which "foo" is found is the `scope` config for the column.
         *
         * If the `scope` is not given, or implied using a prefix of `"this"`, then either the
         * {@link #method-getController ViewController} or the closest ancestor component configured
         * as {@link #defaultListenerScope} is assumed to be the object with the method.
         * @since 6.2.0
         */
        formatter: null,

        /**
         * @cfg {Object} scope
         * The scope to use when calling the {@link #renderer} or {@link #formatter} function.
         */
        scope: null,

        /**
         * @cfg {Boolean} editable
         * Set this to true to make this column editable.
         * Only applicable if the grid is using an {@link Ext.grid.plugin.Editable Editable} plugin.
         */
        editable: false,

        /**
         * @cfg {Object/String} editor
         * An optional xtype or config object for a {@link Ext.field.Field Field} to use for editing.
         * Only applicable if the grid is using an {@link Ext.grid.plugin.Editable Editable} plugin.
         * Note also that {@link #editable} has to be set to true if you want to make this column editable.
         * If this configuration is not set, and {@link #editable} is set to true, the {@link #defaultEditor} is used.
         */
        editor: null,

        /**
         * @cfg {Object/Ext.field.Field}
         * An optional config object that should not really be modified. This is used to create
         * a default editor used by the {@link Ext.grid.plugin.Editable Editable} plugin when no
         * {@link #editor} is specified.
         */
        defaultEditor: {
            xtype: 'textfield',
            required: true
        },

        /**
         * @cfg {Boolean} ignore
         * This configuration should be left alone in most cases. This is used to prevent certain columns
         * (like the MultiSelection plugin column) to show up in plugins (like the {@link Ext.grid.plugin.ViewOptions} plugin).
         */
        ignore: false,

        /**
         * @cfg {Boolean} ignoreExport
         * This flag indicates that this column will be ignored when grid data is exported.
         *
         * When grid data is exported you may want to export only some columns that are important
         * and not everything. You can set this flag on any column that you want to be ignored during export.
         *
         * This is used by {@link Ext.grid.plugin.Exporter exporter plugin}.
         */
        ignoreExport: false,

        /**
         * @cfg {Ext.exporter.file.Style/Ext.exporter.file.Style[]} exportStyle
         *
         * A style definition that is used during data export via the {@link Ext.grid.plugin.Exporter exporter plugin}.
         * This style will be applied to the columns generated in the exported file.
         *
         * You could define it as a single object that will be used by all exporters:
         *
         *      {
         *          xtype: 'numbercolumn',
         *          dataIndex: 'price',
         *          exportStyle: {
         *              format: 'Currency',
         *              alignment: {
         *                  horizontal: 'Right'
         *              },
         *              font: {
         *                  italic: true
         *              }
         *          }
         *      }
         *
         * You could also define it as an array of objects, each object having a `type` that specifies by
         * which exporter will be used:
         *
         *      {
         *          xtype: 'numbercolumn',
         *          dataIndex: 'price',
         *          exportStyle: [{
         *              type: 'html', // used by the `html` exporter
         *              format: 'Currency',
         *              alignment: {
         *                  horizontal: 'Right'
         *              },
         *              font: {
         *                  italic: true
         *              }
         *          },{
         *              type: 'csv', // used by the `csv` exporter
         *              format: 'General'
         *          }]
         *      }
         *
         * Or you can define it as an array of objects that has:
         *
         * - one object with no `type` key that is considered the style to use by all exporters
         * - objects with the `type` key defined that are exceptions of the above rule
         *
         *      {
         *          xtype: 'numbercolumn',
         *          dataIndex: 'price',
         *          exportStyle: [{
         *              // no type defined means this is the default
         *              format: 'Currency',
         *              alignment: {
         *                  horizontal: 'Right'
         *              },
         *              font: {
         *                  italic: true
         *              }
         *          },{
         *              type: 'csv', // only the CSV exporter has a special style
         *              format: 'General'
         *          }]
         *      }
         *
         */
        exportStyle: null,

        /**
         * @cfg {Object} cell
         * The config object used to create {@link Ext.grid.cell.Base cells} in
         * {@link Ext.grid.plugin.Summary Summary Rows} for this column.
         */
        summaryCell: {
            xtype: 'summarycell'
        },

        /**
         * @cfg {String/Function} summaryType
         * This configuration specifies the type of summary. There are several built in
         * summary types. These call underlying methods on the store:
         *
         *  - {@link Ext.data.Store#count count}
         *  - {@link Ext.data.Store#sum sum}
         *  - {@link Ext.data.Store#min min}
         *  - {@link Ext.data.Store#max max}
         *  - {@link Ext.data.Store#average average}
         *
         * Any other name is assumed to be the name of a method on the associated
         * {@link Ext.app.ViewController view controller}.
         *
         * Note that this configuration only works when the grid has the
         * {@link Ext.grid.plugin.SummaryRow SummaryRow} plugin enabled.
         */
        summaryType: null,

        /**
         * @cfg {String/Function} summaryRenderer
         * This summaryRenderer is called before displaying a value in the SummaryRow. The
         * function is optional, if not specified the default calculated value is shown. The
         * summaryRenderer is called with:
         *
         *  - value {Object} - The calculated value.
         *
         * Note that this configuration only works when the grid has the
         * {@link Ext.grid.plugin.SummaryRow SummaryRow} plugin enabled.
         */
        summaryRenderer: null,

        /**
         * @cfg {String} summaryFormatter
         * This summaryFormatter is similar to {@link #formatter} but is called before displaying a value in the SummaryRow. The
         * config is optional, if not specified the default calculated value is shown. The
         * summaryFormatter is called with:
         *
         *  - value {Object} - The calculated value.
         *
         * Note that this configuration only works when the grid has the
         * {@link Ext.grid.plugin.SummaryRow SummaryRow} plugin enabled.
         */
        summaryFormatter: null,

        minWidth: 40,
        sortDirection: null,

        /**
         * @cfg {String/String[]/Ext.XTemplate} tpl
         * An {@link Ext.XTemplate XTemplate}, or an XTemplate *definition string* to use
         * to process a {@link Ext.data.Model records} data to produce a cell's rendered
         * value.
         *
         *     @example
         *     Ext.create('Ext.data.Store', {
         *         storeId:'employeeStore',
         *         fields:['firstname', 'lastname', 'seniority', 'department'],
         *         groupField: 'department',
         *         data:[
         *             { firstname: "Michael", lastname: "Scott",   seniority: 7, department: "Management" },
         *             { firstname: "Dwight",  lastname: "Schrute", seniority: 2, department: "Sales" },
         *             { firstname: "Jim",     lastname: "Halpert", seniority: 3, department: "Sales" },
         *             { firstname: "Kevin",   lastname: "Malone",  seniority: 4, department: "Accounting" },
         *             { firstname: "Angela",  lastname: "Martin",  seniority: 5, department: "Accounting" }
         *         ]
         *     });
         *
         *     Ext.create('Ext.grid.Panel', {
         *         title: 'Column Template Demo',
         *         store: Ext.data.StoreManager.lookup('employeeStore'),
         *         columns: [{
         *             text: 'Full Name',
         *             tpl: '{firstname} {lastname}'
         *         }, {
         *             text: 'Department (Yrs)',
         *             tpl: '{department} ({seniority})'
         *         }],
         *         height: 200,
         *         width: 300,
         *         renderTo: Ext.getBody()
         *     });
         *
         * This config is only processed if the {@link #cell} type is the default of
         * {@link Ext.grid.cell.Cell gridcell}.
         *
         * **Note** See {@link Ext.grid.Grid} documentation for other, better alternatives
         * to rendering cell content.
         */
        tpl: null,

        /**
         * @cfg {Number} computedWidth
         * The computed width for this column, may come from either
         * {@link #width} or {@link #flex}.
         * @readonly
         */
        computedWidth: null
    },

    classCls: Ext.baseCSSPrefix + 'gridcolumn',
    sortedCls: Ext.baseCSSPrefix + 'sorted',
    resizableCls: Ext.baseCSSPrefix + 'resizable',

    getTemplate: function () {
        var me = this,
            template = [],
            beforeTitleTemplate = me.beforeTitleTemplate,
            afterTitleTemplate = me.afterTitleTemplate;

        // Hook for subclasses to insert extra elements
        if (beforeTitleTemplate) {
            template.push.apply(template, beforeTitleTemplate);
        }

        template.push({
            reference: 'titleElement',
            className: Ext.baseCSSPrefix + 'title-el',
            children: [{
                reference: 'textElement',
                className: Ext.baseCSSPrefix + 'text-el'
            }, {
                reference: 'sortIconElement',
                classList: [
                    Ext.baseCSSPrefix + 'sort-icon-el',
                    Ext.baseCSSPrefix + 'font-icon'
                ]
            }]
        });

        // Hook for subclasses to insert extra elements
        if (afterTitleTemplate) {
            template.push.apply(template, afterTitleTemplate);
        }

        template.push({
            reference: 'resizerElement',
            className: Ext.baseCSSPrefix + 'resizer-el'
        });

        return template
    },

    getCells: function() {
        var cells = [],
            rows = this.grid.getListItems(),
            len = rows.length,
            i;

        for (i = 0; i < len; ++i) {
            cells.push(rows[i].getCellByColumn(this));
        }

        return cells;
    },

    onAdded: function(parent, instanced) {
        var me = this;

        me.callParent([parent, instanced]);
        me.grid = me.up('headercontainer').getGrid();
    },

    applyTpl: function (tpl) {
        if (!tpl || !tpl.isXTemplate) {
            tpl = new Ext.XTemplate(tpl);
        }

        return tpl;
    },

    updateAlign: function (align, oldAlign) {
        var prefix = Ext.baseCSSPrefix + 'align-';

        if (oldAlign) {
            this.removeCls(prefix + align);
        }
        if (align) {
            this.addCls(prefix + align);
        }
    },

    initialize: function () {
        var me = this;

        if (!me.getWidth() && me.getFlex() == null) {
            me.setWidth(me.getDefaultWidth());
        }

        me.callParent();

        me.element.on({
            tap: 'onColumnTap',
            longpress: 'onColumnLongPress',
            scope: this
        });
    },

    onColumnTap: function (e) {
        this.fireEvent('tap', this, e);
    },

    onColumnLongPress: function (e) {
        this.fireEvent('longpress', this, e);
    },

    updateResizable: function(resizable) {
        this.element.toggleCls(this.resizableCls, resizable);
    },

    updateText: function (text) {
        this.setHtml(text || '&#160;');
    },

    applyWidth: function(width) {
        var minWidth = this.getMinWidth() || -Infinity,
            maxWidth = this.getMaxWidth() || Infinity;

        if (width !== null) {
            return Math.max(Math.min(maxWidth, width), minWidth);
        }

        return width;
    },

    updateWidth: function (width, oldWidth) {
        this.callParent([width, oldWidth]);
        // If width === null, it means we've been set to flex and the, layout
        // is trying to update us, don't want to trigger here
        if (width !== null) {
            this.setComputedWidth(width);
        }
    },

    updateFlex: function (flex, oldFlex) {
        var me = this,
            listener = me.resizeListener;

        me.callParent([flex, oldFlex]);
        if (!flex) {
            me.resizeListener = Ext.destroy(listener);
        } else if (!listener) {
            me.resizeListener = me.on('resize', me.onFlexResize, me, {destroyable: true});
        }
    },

    onFlexResize: function () {
        this.setComputedWidth(this.element.getWidth(false, true));
    },

    getComputedWidth: function () {
        return this.isVisible(true) ? this.callParent() : 0;
    },

    updateComputedWidth: function (computedWidth, oldComputedWidth) {
        this.fireEvent('columnresize', this, computedWidth, oldComputedWidth);
    },

    updateDataIndex: function (dataIndex) {
        var editor = this.getEditor();
        if (editor) {
            editor.name = dataIndex;
        } else {
            this.getDefaultEditor().name = dataIndex;
        }
    },

    updateSortDirection: function (direction, oldDirection) {
        var me = this,
            sortedCls, element;

        if (me.getSortable()) {
            sortedCls = me.sortedCls;
            element = me.element;

            if (oldDirection) {
                element.removeCls([sortedCls, sortedCls + '-' + oldDirection.toLowerCase()]);
            }

            if (direction) {
                element.addCls([sortedCls, sortedCls + '-' + direction.toLowerCase()]);
            }

            me.fireEvent('sort', this, direction, oldDirection);
        }
    },

    applyFormatter: function(format){
        var me = this,
            fmt = format,
            parser;

        if(fmt){
            parser = Ext.app.bind.Parser.fly(fmt);
            fmt = parser.compileFormat();
            parser.release();
            return function(v){
                return fmt(v, me.getScope() || me.resolveListenerScope());
            };
        }

        return fmt;
    },

    applySummaryFormatter: function(format){
        var me = this,
            fmt = format,
            parser;

        if(fmt){
            parser = Ext.app.bind.Parser.fly(fmt);
            fmt = parser.compileFormat();
            parser.release();
            return function(v){
                return fmt(v, me.getScope() || me.resolveListenerScope());
            };
        }

        return fmt;
    },

    doDestroy: function () {
        this.resizeListener = Ext.destroy(this.resizeListener);
        this.callParent();
    },

    getInnerHtmlElement: function() {
        return this.textElement;
    }

    /**
     * @method getEditor
     * Returns the value of {@link #editor}
     *
     * **Note:** This method will only have an implementation if the
     * {@link Ext.grid.plugin.Editable Editing plugin} has been enabled on the grid.
     *
     * @return {Mixed} The editor value.
     */
    /**
     * @method setEditor
     * @chainable
     * Sets the form field to be used for editing.
     *
     * **Note:** This method will only have an implementation if the
     * {@link Ext.grid.plugin.Editable Editing plugin} has been enabled on the grid.
     *
     * @param {Object} field An object representing a field to be created. You must
     * include the column's dataIndex as the value of the field's name property when
     * setting the editor field.
     *
     *     column.setEditor({
     *         xtype: 'textfield',
     *         name: column.getDataIndex()
     *     });
     *
     * @return {Ext.column.Column} this
     */

    /**
     * @method getDefaultEditor
     * Returns the value of {@link #defaultEditor}
     *
     * **Note:** This method will only have an implementation if the
     * {@link Ext.grid.plugin.Editable Editing plugin} has been enabled on the grid.
     *
     * @return {Mixed} The defaultEditor value.
     */
    /**
     * @method setDefaultEditor
     * @chainable
     * Sets the default form field to be used for editing.
     *
     * **Note:** This method will only have an implementation if the
     * {@link Ext.grid.plugin.Editable Editing plugin} has been enabled on the grid.
     *
     * @param {Object} field An object representing a field to be created. You must
     * include the column's dataIndex as the value of the field's name property when
     * setting the default editor field.
     *
     *     column.setDefaultEditor({
     *         xtype: 'textfield',
     *         name: column.getDataIndex()
     *     });
     *
     * @return {Ext.column.Column} this
     */
});
