/**
 * @private
 */
Ext.define('Ext.grid.HeaderGroup', {
    extend: 'Ext.Container',
    xtype: ['headergroup', 'gridheadergroup'],
    isHeaderGroup: true,

    config: {
        /**
         * @cfg {String} text
         * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
         */
        text: '&nbsp;',

        /**
         * @cfg {Object[]} columns
         * The columns in this group.
         */
        columns: null,

        // Default items to undefined here so that we get processed initially, allows
        // us to check the columns config.
        items: undefined,

        defaultType: 'column',

        /**
         * We hide the HeaderGroup by default, and show it when any columns are added to it.
         * @hide
         */
        hidden: true,

        layout: {
            type: 'hbox',
            align: 'stretch'
        }
    },

    classCls: Ext.baseCSSPrefix + 'headergroup',
    headerCls: Ext.baseCSSPrefix + 'gridcolumn',

    getElementConfig: function() {
        return {
            reference: 'element',
            children: [{
                // This markup intentionally mimics that of a gridcolumn for styling reasons.
                // This header element can be styled using column uis (see updtateUi)
                reference: 'headerElement',
                classList: [ this.headerCls, Ext.baseCSSPrefix + 'align-center' ],
                children: [{
                    reference: 'titleElement',
                    className: Ext.baseCSSPrefix + 'title-el',
                    children: [{
                        reference: 'textElement',
                        className: Ext.baseCSSPrefix + 'text-el'
                    }]
                }]
            }, {
                reference: 'innerElement',
                className: Ext.baseCSSPrefix + 'inner'
            }]
        };
    },

    applyItems: function(items, collection) {
        if (!items) {
            items = this.getColumns();
        }
        this.callParent([items, collection]);
    },

    updateText: function(text) {
        this.textElement.setHtml(text);
    },

    initialize: function() {
        var me = this;

        me.on({
            add: 'doVisibilityCheck',
            remove: 'doVisibilityCheck',
            show: 'onColumnShow',
            hide: 'onColumnHide',
            delegate: '> column',
            scope: 'this'
        });
        
        me.on({
            show: 'onShow',
            scope: 'this'
        });

        me.textElement.on({
            tap: 'onHeaderGroupTap',
            longpress: 'onHeaderGroupLongPress',
            scope: this
        });

        me.callParent();

        me.doVisibilityCheck();
    },

    onHeaderGroupTap: function(e) {
        this.fireEvent('tap', this, e);
    },

    onHeaderGroupLongPress: function(e) {
        this.fireEvent('longpress', this, e);
    },

    onColumnShow: function(column) {
        if (this.getVisibleCount() > 0) {
            this.show();
        }
    },

    onColumnHide: function(column) {
        if (this.getVisibleCount() === 0) {
            this.hide();
        }
    },

    onShow: function() {
        var toShow;

        // No visible subcolumns, then show the first child.
        if (!this.getVisibleCount()) {
            toShow = this.getComponent(0);
            if (toShow) {
                toShow.show();
            }
        }
    },

    doVisibilityCheck: function() {
        var me = this,
            columns = me.getInnerItems(),
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (!column.isHidden()) {
                if (me.isHidden()) {
                    if (me.initialized) {
                        me.show();
                    } else {
                        me.setHidden(false);
                    }
                }
                return;
            }
        }

        me.hide();
    },

    doDestroy: function() {
        this.setColumns(null);
        this.callParent();
    },

    updateUi: function(ui, oldUi) {
        var me = this,
            headerCls = me.headerCls,
            headerElement = me.headerElement;

        if (oldUi) {
            headerElement.removeCls(oldUi, headerCls);
        }

        if (ui) {
            headerElement.addCls(ui, headerCls);
        }

        me.callParent([ui, oldUi]);
    },

    privates: {
        getVisibleCount: function() {
            var columns = this.getInnerItems(),
                len = columns.length,
                count = 0,
                i;

            for (i = 0; i < len; ++i) {
                if(columns[i].isHeaderGroup){
                    count += columns[i].getVisibleCount();
                }else {
                    count += columns[i].isHidden() ? 0 : 1;
                }
            }

            return count;
        }
    }
});
