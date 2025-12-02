/**
 *
 */
Ext.define('Ext.grid.cell.Tree', {
    extend: 'Ext.grid.cell.Cell',
    xtype: 'treecell',
    
    isTreeCell: true,

    collapsedCls: Ext.baseCSSPrefix + 'treelist-item-collapsed',
    expandedCls: Ext.baseCSSPrefix + 'treelist-item-expanded',
    floatedCls: Ext.Widget.prototype.floatedCls + ' ' + Ext.baseCSSPrefix + 'treelist-item-floated',
    floatedToolCls: Ext.baseCSSPrefix + 'treelist-item-tool-floated',
    leafCls: Ext.baseCSSPrefix + 'treelist-item-leaf',
    expandableCls: Ext.baseCSSPrefix + 'treelist-item-expandable',
    hideIconCls: Ext.baseCSSPrefix + 'treelist-item-hide-icon',
    loadingCls: Ext.baseCSSPrefix + 'treelist-item-loading',
    selectedCls: Ext.baseCSSPrefix + 'treelist-item-selected',
    selectedParentCls: Ext.baseCSSPrefix + 'treelist-item-selected-parent',
    withIconCls: Ext.baseCSSPrefix + 'treelist-item-with-icon',
    hoverCls: Ext.baseCSSPrefix + 'treelist-item-over',
    rowHoverCls: Ext.baseCSSPrefix + 'treelist-row-over',
    elbowCls: Ext.baseCSSPrefix + 'tree-elbow',

    config: {
        /**
         * @cfg {String} iconClsProperty
         * The property from the associated record to map for the {@link #iconCls} config.
         */
        iconClsProperty: 'iconCls',

        /**
         * @cfg {String} iconCls
         * @inheritdoc Ext.panel.Header#cfg-iconCls
         * @localdoc **Note:** This value is taken from the underlying {@link #node}.
         */
        iconCls: null,

        indent: null,

        /**
         * @cfg {String} text
         * The text for this item. This value is taken from
         * the underlying {@link #node}.
         */
        text: {
            lazy: true,
            $value: ''
        }
    },

    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'grid-cell ' + Ext.baseCSSPrefix + 'treelist-item',

        children: [{
            reference: 'rowElement',
            cls: Ext.baseCSSPrefix + 'treelist-row',

            children: [{
                reference: 'wrapElement',
                cls: Ext.baseCSSPrefix + 'treelist-item-wrap',
                children: [{
                    reference: 'iconElement',
                    cls: Ext.baseCSSPrefix + 'treelist-item-icon'
                }, {
                    reference: 'textElement',
                    cls: Ext.baseCSSPrefix + 'treelist-item-text'
                }, {
                    reference: 'expanderElement',
                    cls: Ext.baseCSSPrefix + 'treelist-item-expander'
                }]
            }]
        }]
    },

    /**
     * Expand this tree node if collapse, collapse it if expanded.
     */
    toggle: function() {
        var me = this,
            record = me.getRecord();

        if (record.isExpanded()) {
            me.collapse();
        } else if (record.isExpandable()) {
            me.expand();
        }
    },

    /**
     * Collapse this tree node.
     */
    collapse: function() {
        var me = this,
            record = me.getRecord();

        me.getOwner().fireEventedAction('nodecollapse', [me.parent, record, 'collapse'], 'doToggle', this);
    },

    /**
     * Expand this tree node.
     */
    expand: function() {
        var me = this,
            record = me.getRecord(),
            tree = me.getOwner(),
            siblings, i, len, sibling;

        tree.fireEventedAction('nodeexpand', [me.parent, record, 'expand'], 'doToggle', me);

        // Collapse any other expanded sibling if tree is singleExpand
        if (record.isExpanded && !record.isRoot() && tree.getSingleExpand()) {
            siblings = record.parentNode.childNodes;
            for (i = 0, len = siblings.length; i < len; ++i) {
                sibling = siblings[i];
                if (sibling !== record) {
                    sibling.collapse();
                }
            }
        }
    },

    initElement: function() {
        this.callParent();

        this.element.on({
            scope      : this,
            tap        : 'maybeToggle'
        });
    },

    updateRawValue: function (rawValue) {
        var dom = this.textElement.dom;

        if (this.getEncodeHtml()) {
            dom.textContent = rawValue || '';
        } else {
            dom.innerHTML = rawValue || '';
        }
    },
    
    updateRecord: function(record) {
        if (record) {
            this.doNodeUpdate(record);
        }
    },

    updateIconCls: function (iconCls, oldIconCls) {
        var me = this,
            el = me.element,
            iconEl = me.iconElement;

        if (oldIconCls) {
            iconEl.removeCls(oldIconCls);
        }

        if (iconCls) {
            iconEl.addCls(iconCls);
        }

        el.toggleCls(me.withIconCls, !!iconCls);
        el.toggleCls(me.hideIconCls, iconCls === null);
    },

    /**
     * Returns the owning TreeGrid.
     * @return {Ext.grid.TreeGrid} The owning TreeGrid.
     */
    getOwner: function() {
        return this.up('tree');
    },

    privates: {
        /**
         * Update properties after a record update.
         *
         * @param {Ext.data.TreeModel} record The node.
         * @param {String[]} modifiedFieldNames The modified field names, if known.
         *
         * @private
         */
        doNodeUpdate: function (record) {
            var me = this,
                dataIndex = me.dataIndex,
                iconClsProperty = me.getIconClsProperty();

            if (dataIndex) {
                me.setValue(record.get(dataIndex));
            }

            if (iconClsProperty) {
                me.setIconCls(record.data[iconClsProperty]);
            }

            me.element.toggleCls(me.loadingCls, record.data.loading);
            me.element.toggleCls(me.leafCls, record.isLeaf());
            me.syncExpandCls();
            me.updateIndent();
        },

        syncExpandCls: function () {
            if (!this.updatingExpandCls) {
                var me = this,
                    record = me.getRecord(),
                    expandable = record.isExpandable(),
                    element = me.element,
                    expanded = record.isExpanded(),
                    expandedCls = me.expandedCls,
                    collapsedCls = me.collapsedCls;

                me.updatingExpandCls = true;

                element.toggleCls(me.expandableCls, expandable);

                if (expandable) {
                    element.toggleCls(expandedCls, expanded);
                    element.toggleCls(collapsedCls, !expanded);
                } else {
                    element.removeCls([expandedCls, collapsedCls]);
                }

                me.updatingExpandCls = false;
            }
        },

        updateIndent: function () {
            var me = this,
                indent = me.getOwner().getIndent(),
                record = me.getRecord(),
                depth;

            if (record) {
                depth = record.getTreeStore().rootVisible ? record.data.depth : record.data.depth - 1;
                me.wrapElement.dom.style.marginLeft = (depth * indent) + 'px';
            }
        },

        /**
         * @private
         */
        maybeToggle: function(e) {
            var me = this,
                record = me.getRecord(),
                wasExpanded = record.isExpanded();

            if (!record.isLeaf() && (!me.getOwner().getExpanderOnly() || e.target === me.expanderElement.dom)) {
                me.toggle();
            }

            // Toggling click does not continue to bubble the event to the view.
            // TODO: When NavigationModel implemented, that still has to recieve the events.
            if (record.isExpanded() !== wasExpanded) {
                e.nodeToggled = true;
                e.stopEvent();
            }
        },

        doToggle: function(row, record, fn) {
            record[fn]();
        }
    }
});
