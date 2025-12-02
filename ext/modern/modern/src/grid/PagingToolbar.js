/**
 * A toolbar used for paging in grids.  Do not instantiate this class directly.  Use
 * the {@link Ext.grid.plugin.PagingToolbar #toolbar} config of the Paging Toolbar grid
 * plugin to configure its options
 */
Ext.define('Ext.grid.PagingToolbar', {
    extend: 'Ext.Toolbar',
    xtype: 'pagingtoolbar',

    classCls: Ext.baseCSSPrefix + 'pagingtoolbar',

    config: {
        /**
         * @cfg {Object}
         * A configuration object for the "previous" button
         */
        prevButton: {
            xtype: 'button',
            iconCls: Ext.baseCSSPrefix + 'pagingtoolbar-prev'
        },

        /**
         * @cfg {Object}
         * A configuration object for the "next" button
         */
        nextButton: {
            xtype: 'button',
            iconCls: Ext.baseCSSPrefix + 'pagingtoolbar-next'
        },

        /**
         * @cfg {Object}
         * A configuration object for the slider field
         */
        sliderField: {
            xtype: 'singlesliderfield',
            liveUpdate: true,
            value: 1,
            flex: 1,
            minValue: 1
        },

        // TODO:
        // this is private because the API may change in a future release.
        // We need more than just a "num / count" summary text, the current page should be
        // displayed in a textfield that can be modified by the user
        /**
         * @cfg {Object}
         * A configuration object for the paging toolbar's summary component
         * @private
         */
        summaryComponent: {
            xtype: 'component',
            cls: Ext.baseCSSPrefix + 'pagingtoolbar-summary'
        }
    },

    defaultButtonUI: 'flat',

    initialize: function() {
        var me = this;

        me.callParent();

        me.add([
            me.getPrevButton(),
            me.getSummaryComponent(),
            me.getSliderField(),
            me.getNextButton()
        ]);
    },

    applyPrevButton: function(prevButton, oldPrevButton) {
        return Ext.factory(prevButton, Ext.Button, oldPrevButton);
    },

    applyNextButton: function(nextButton, oldNextButton) {
        return Ext.factory(nextButton, Ext.Button, oldNextButton);
    },

    applySliderField: function(sliderField, oldSliderField) {
        return Ext.factory(sliderField, Ext.field.SingleSlider, oldSliderField);
    },

    applySummaryComponent: function(summaryComponent, oldSummaryComponent) {
        return Ext.factory(summaryComponent, Ext.Component, oldSummaryComponent);
    }
});