/**
 * This is the default cell class for {@link Ext.grid.Grid grid} cells. Use this class if
 * you use the {@link Ext.grid.column.Column#renderer} or {@link Ext.grid.column.Column#tpl}
 * configs for a column.
 *
 * {@link Ext.grid.Row Rows} create cells based on the {@link Ext.grid.column.Column#cell}
 * config. Application code would rarely create cells directly.
 */
Ext.define('Ext.grid.cell.Cell', {
    extend: 'Ext.grid.cell.Text',
    xtype: 'gridcell',

    config: {
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
        scope: null
    },

    updateColumn: function (column, oldColumn) {
        var me = this,
            tpl, renderer, formatter;

        me.callParent([column, oldColumn]);

        /*
            The `tpl`, `renderer` and `formatter` configs are on the Cell level
            so that a ViewModel can be used for cells to change these configs dynamically.
            If `formatter` is changed dynamically then performance will decrease since
            expressions need to be parsed for each cell.
         */

        if (column) {
            me.columnInitializing = true;
            tpl = column.getTpl();
            renderer = column.getRenderer();
            formatter = column.getFormatter();

            if (tpl !== null) {
                me.setTpl(tpl);
            }
            if (renderer !== null) {
                me.setRenderer(renderer);
            }
            if (formatter !== null) {
                me.setFormatter(formatter);
            }
            me.columnInitializing = false;
        }
    },

    applyTpl: function (tpl) {
        if (!tpl || !tpl.isXTemplate) {
            tpl = new Ext.XTemplate(tpl);
        }

        return tpl;
    },

    applyFormatter: function(format){
        var me = this,
            fmt = format,
            parser;

        if(typeof fmt === 'string'){
            parser = Ext.app.bind.Parser.fly(fmt);
            fmt = parser.compileFormat();
            parser.release();
            return function(v){
                return fmt(v, me.getScope() || me.resolveListenerScope());
            };
        }
        //<debug>
        else if(typeof fmt !== 'function'){
            Ext.raise('Invalid formatter');
        }
        //</debug>

        return fmt;
    },

    updateTpl: function(){
        if(!this.columnInitializing) {
            this.writeValue();
        }
    },

    updateRenderer: function(){
        if(!this.columnInitializing) {
            this.writeValue();
        }
    },

    updateFormatter: function(){
        if(!this.columnInitializing) {
            this.writeValue();
        }
    },

    /**
     * This function is called when the cell value is updated.
     *
     * @private
     */
    writeValue: function(){
        var me = this,
            column = me.getColumn(),
            record = me.getRecord(),
            v = me.getValue(),
            zeroValue = me.getZeroValue(),
            raw = v, // raw value takes as default the cell value
            dataIndex, tpl, renderer, scope, format;

        if(v === 0 && zeroValue !== null) {
            raw = zeroValue;
        }else if (record && column) {
            tpl = me.getTpl();
            renderer = me.getRenderer();
            format = me.getFormatter();

            if (tpl) {
                raw = tpl.apply(record.getData(true));
            } else if (typeof format === 'function'){
                raw = format(v);
            } else if (renderer) {
                dataIndex = me.dataIndex;
                scope = me.getScope() || column.getScope();

                if (typeof renderer === 'function') {
                    raw = renderer.call(scope || column, v, record, dataIndex, me, column);
                } else {
                    raw = Ext.callback(renderer, scope,
                        [v, record, dataIndex, me, column], 0, me);
                }
            }
        }
        me.setRawValue(raw);
    }
});
