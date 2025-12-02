/**
 * This class is used for {@link Ext.grid.Grid grid} cells that contain a child
 * {@link Ext.Component} or {@link Ext.Widget}. This cell type is typically used by
 * specifying {@link Ext.grid.column.Widget} column type.
 *
 * {@link Ext.grid.Row Rows} create cells based on the {@link Ext.grid.column.Column#cell}
 * config. Application code would rarely create cells directly.
 */
Ext.define('Ext.grid.cell.Widget', {
    extend: 'Ext.grid.cell.Base',
    xtype: 'widgetcell',

    config: {
        /**
         * @cfg {Boolean} forceWidth
         * `true` to measure the available width of the cell and set that
         * width on the underlying widget. If `false`, the widget width will auto
         * size.
         */
        forceWidth: false,

        /**
         * @cfg {Object} widget (required)
         * The config object for a {@link Ext.Component} or {@link Ext.Widget}.
         *
         * @cfg {String} widget.xtype (required) The type of component or widget to create.
         */
        widget: null
    },

    align: 'center',

    classCls: Ext.baseCSSPrefix + 'widgetcell',

    updateColumn: function(column, oldColumn) {
        var me = this,
            parent, firstCell;

        me.callParent([column, oldColumn]);

        if (!column || !me.getForceWidth()) {
            return;
        }

        // We need to be able to measure some dimensions of the cells
        // to be able to size the widgets if forceWidth is true. We can
        // only do this once we hit the DOM. However, we only want to do this
        // for the first cell because it can be expensive. If we've already
        // done it, no need to do so again.

        firstCell = column.firstCell;
        if (firstCell && firstCell.measured) {
            me.measured = true;
            return;
        }

        parent = me.getParent();
        if (parent && !parent.isSpecialRow && !column.firstCell) {
            column.firstCell = me;
            me.element.on('resize', 'handleFirstResize', me, {single: true});
        }
    },

    updateValue: function(value) {
        var widget = this.getWidget(),
            defaultBindProperty;
            
        if (widget) {
            defaultBindProperty = widget.defaultBindProperty;

            if (defaultBindProperty) {
                widget.setConfig(defaultBindProperty, value);
            }
        }
    },

    applyWidget: function(widget) {
        if (widget) {
            var parent = this.getParent();

            if (parent && !parent.isSpecialRow) {
                widget = Ext.apply({
                    parent: this
                }, widget);
                widget = Ext.widget(widget);
            } else {
                widget = undefined;
            }
        }
        return widget;
    },

    updateWidget: function(widget, oldWidget) {
        var me = this;

        if (oldWidget) {
            oldWidget.measurer = null;
            oldWidget.destroy();
        }

        if (widget) {
            me.innerElement.appendChild(widget.element);
            if (me.getForceWidth()) {
                me.setWidgetWidth(me.getWidth());
            }
        }
    },

    updateWidth: function(width, oldWidth) {
        this.callParent([width, oldWidth]);
        this.setWidgetWidth(width);
    },

    doDestroy: function() {
        this.setWidget(null);
        this.callParent();
    },

    privates: {
        handleFirstResize: function() {
            var me = this,
                width = me.getWidth(),
                cells, len, i, cell;

            // Once we have the measurement available for the first cell, 
            // go and cascade it for other cells.
            cells = me.getColumn().getCells();

            for (i = 0, len = cells.length; i < len; ++i) {
                cell = cells[i];
                cell.measured = true;
                cell.setWidgetWidth(width);
            }
        },

        setWidgetWidth: function(width) {
            var me = this,
                el = me.innerElement,
                widget, column, leftPad, rightPad;

            if (!me.measured) {
                return;
            }

            widget = me.getWidget();
            if (widget) {
                column = me.getColumn();
                leftPad = parseInt(column.getCachedStyle(el, 'padding-left'), 10) || 0;
                rightPad = parseInt(column.getCachedStyle(el, 'padding-right'), 10) || 0;
                // Give the widget a reference to ourself to allow it to do any extra measuring
                widget.measurer = column;
                widget.setWidth(width - leftPad - rightPad);
                widget.redraw();
            }
        }
    }
});
