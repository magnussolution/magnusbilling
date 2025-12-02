/**
 * A plugin which is a {@link Ext.tip.ToolTip} which shows itself upon mouseover of a DataView item.
 *
 * The associated {@link Ext.data.Model record} is passed into the {@link #setData} method just before
 * the tip is shown. The record is stored in the `record` property.
 */
Ext.define('Ext.dataview.plugin.ItemTip', {
    extend: 'Ext.tip.ToolTip',
    alias: 'plugin.dataviewtip',

    anchor: true,

    showOnTap: true,

    defaultBindProperty: 'data',

    config: {
        // So that we can get early access to the owning DataView
        // in applyBind so we can ensure we have a ViewModel.
        cmp: null
    },

    listeners: {
        beforeshow: 'onBeforeShow',
        scope: 'this'
    },

    init: function(dataview) {
        this.dataview = dataview;

        dataview.on({
            initialize: this.onDataViewInitialized,
            scope: this
        });
        dataview.getScrollable().on({
            scroll: this.onDataViewScroll,
            scope: this
        });
    },

    destroy: function() {
        // We need to null out the parent very early, otherwise
        // it will try and call remove() when this isn't really
        // a child item.
        this.parent = null;
        this.callParent();
    },

    applyData: function(data) {
        if (data.isEntity) {
            data = data.getData(true);
        }
        return data;
    },

    updateCmp: function(dataview) {
        this.dataview = this.parent = dataview;
    },

    onDataViewInitialized: function(dataview) {
        this.setTarget(dataview.container.el);
        this.itemSelector = '#' + dataview.container.el.id + '>*';

        if (!this.getDelegate()) {
            this.setDelegate(this.itemSelector);
        }
    },

    onDataViewScroll: function() {
        var me = this,
            isInView;

        if (me.currentTarget) {
            isInView = me.dataview.getScrollable().isInView(me.currentTarget);
            if (!isInView.x && isInView.y) {
                me.hide();
            }
            if (me.isVisible()) {
                me.showByTarget(me.currentTarget);
            }
        }
    },

    onBeforeShow: function() {
        var me = this,
            viewModel = me.getViewModel(),
            dataview = me.dataview,
            itemEl = me.currentTarget;

        if (!itemEl.is(me.itemSelector)) {
            itemEl = itemEl.up(me.itemSelector);
        }
        
        me.recordIndex = dataview.container.getViewItems().indexOf(itemEl.dom);
        me.record = dataview.getStore().getAt(me.recordIndex);

        if (me.getBind()) {
            viewModel.set('record', me.record);
            viewModel.set('recordIndex', me.recordIndex);

            // Flush the data now so that the alignment is correct
            viewModel.notify();
        } else {
            me.setData(me.record.data);
        }
    },

    privates: {
        getConstrainRegion: function() {
            return this.dataview.getScrollable().getElement().getConstrainRegion();
        },

        applyBind: function(binds, currentBindings) {
            var me = this,
                dataview = me.getCmp(),
                viewModel = me.getViewModel(),
                parentViewModel = dataview.lookupViewModel();

            // Ensure we have a connected ViewModel before binding is processed.
            if (viewModel) {
                viewModel.setParent(parentViewModel);
            } else {
                me.setViewModel(Ext.Factory.viewModel({
                    parent: parentViewModel,
                    data: {}
                }));
            }

            me.callParent([binds, currentBindings]);
        }
    }
});
