/**
 * A body component to be used with Grid Rows. This component should not be used directly.
 * Always use the Grid row's {@link Ext.grid.Row#body body} config to create a row body.
 *
 * Typically used together with a {@link Ext.grid.plugin.RowExpander Row Expander}
 */
Ext.define('Ext.grid.RowBody', {
    extend: 'Ext.Component',
    xtype: 'rowbody',

    config: {
        widget: null
    },

    classCls: Ext.baseCSSPrefix + 'rowbody',

    template: [{
        reference: 'spacerElement',
        cls: Ext.baseCSSPrefix + 'spacer-el'
    }, {
        reference: 'contentElement',
        cls: Ext.baseCSSPrefix + 'content-el'
    }],

    initialize: function() {
        var me = this,
            grid, rowExpander;

        me.callParent();

        grid = me.parent.getGrid();

        if (grid && grid.hasRowExpander) {
            rowExpander = grid.findPlugin('rowexpander');

            if (rowExpander) {
                me.spacerElement.setWidth(rowExpander.getColumn().getWidth());
            }
        }
    },

    applyWidget: function (widget) {
        var row = this.parent;

        if (widget) {
            widget = Ext.apply({
                parent: row
            }, widget);
            widget = Ext.widget(widget);
        }
        return widget;
    },

    updateWidget: function (widget, oldWidget) {
        if (oldWidget) {
            oldWidget.destroy();
        }

        if (widget) {
            this.contentElement.appendChild(widget.element);
        }
    },

    updateRecord: function (record, oldRecord) {
        var tpl = this.getTpl();

        if (tpl) {
            this.callParent([record, oldRecord]);
        }
    },

    getInnerHtmlElement: function() {
        return this.contentElement;
    },

    doDestroy: function () {
        this.setWidget(null);
        this.callParent();
    }
});
