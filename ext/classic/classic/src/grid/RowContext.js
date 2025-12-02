/**
 * @private
 * This class encapsulates a row of managed Widgets/Components when a WidgetColumn, or
 * RowWidget plugin is used in a grid.
 *
 * The instances are recycled, and this class holds instances which are derendered so that they can
 * be moved back into newly rendered rows.
 *
 * Developers should not use this class.
 *
 */
Ext.define('Ext.grid.RowContext', {
    constructor: function(config) {
        Ext.apply(this, config);
        this.widgets = {};
    },

    setRecord: function(record, recordIndex) {
        var viewModel = this.viewModel;

        this.record = record;
        this.recordIndex = recordIndex;
        if (viewModel) {
            viewModel.set('record', record);
            viewModel.set('recordIndex', recordIndex);
        }
    },

    free: function() {
        var me = this,
            widgets = me.widgets,
            widgetId,
            widget,
            focusEl,
            viewModel = me.viewModel;

        me.record = null;
        if (viewModel) {
            viewModel.set('record');
            viewModel.set('recordIndex');
        }

        // All the widgets this RowContext manages must be blurred
        // and moved into the detached body to save them from garbage collection.
        for (widgetId in widgets) {
            widget = widgets[widgetId];

            // Focusables in a grid must not be tabbable by default when they get put back in.
            focusEl = widget.getFocusEl();
            if (focusEl) {
                // Widgets are reused so we must reset their tabbable state
                // regardless of their visibility.
                // For example, when removing rows in IE8 we're attaching
                // the nodes to a document-fragment which itself is invisible,
                // so isTabbable() returns false. Next time when we're reusing
                // this widget it will be attached to the document with its
                // tabbable state unreset, which might lead to undesired results.
                if (focusEl.isTabbable(true)) {
                    focusEl.saveTabbableState({
                        includeHidden: true
                    });
                }

                // Some browsers do not deliver a focus change upon DOM removal.
                // Force the issue here.
                focusEl.blur();
            }
            widget.detachFromBody();
            widget.hidden = true;
        }
    },

    getWidget: function(ownerId, widgetCfg) {
        var me = this,
            widgets = me.widgets || (me.widgets = {}),
            result;

        // Only spin up an attached ViewModel when we instantiate our first managed Widget
        // which uses binding.
        if (widgetCfg.bind && !me.viewModel) {
            me.viewModel = Ext.Factory.viewModel({
                parent: me.ownerGrid.lookupViewModel(),
                data: {
                    record: me.record,
                    recordIndex: me.recordIndex
                }
            }, me.ownerGrid.rowViewModel);
        }

        if (!(result = widgets[ownerId])) {
            result = widgets[ownerId] = Ext.widget(Ext.apply({
                viewModel: me.viewModel,
                _rowContext: me
            }, widgetCfg));

            // Components initialize binding on render.
            // Widgets in finishRender which will not be called in this case.
            // That is only called when rendered by a layout.
            if (result.isWidget) {
                result.initBindable();
            }
        } else {
            result.hidden = false;
        }

        return result;
    },

    getWidgets: function() {
        var widgets = this.widgets,
            id,
            result = [];

        for (id in widgets) {
            result.push(widgets[id]);
        }
        return result;
    },

    destroy: function() {
        var me = this,
            widgets = me.widgets,
            widgetId,
            widget;

        for (widgetId in widgets) {
            widget = widgets[widgetId];
            widget._rowContext = null;
            widget.destroy();
        }
        
        Ext.destroy(me.viewModel);
        
        me.callParent();
    }
});
