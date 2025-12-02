/**
 *
 */
Ext.define('Ext.grid.Tree', {
    extend: 'Ext.grid.Grid',
    xtype: 'tree',
    alternateClassName: 'Ext.tree.Tree',

    classCls: Ext.baseCSSPrefix + 'treelist',
    expanderFirstCls: Ext.baseCSSPrefix + 'treelist-expander-first',
    expanderOnlyCls: Ext.baseCSSPrefix + 'treelist-expander-only',

    /**
     * @event beforenodeexpand
     * Fires before an row is visually expanded. May be vetoed by returning false from a handler.
     * @param {Ext.grid.Row} row                    The row to be expanded
     * @param {Ext.data.NodeInterface} record       The record to be expanded
     */

    /**
     * @event nodeexpand
     * Fires after an row has been visually expanded and its child nodes are visible in the tree.
     * @param {Ext.grid.Row} row                    The row that was expanded
     * @param {Ext.data.NodeInterface} record       The record that was expanded
     */

    /**
     * @event beforenodecollapse
     * Fires before an row is visually collapsed. May be vetoed by returning false from a handler.
     * @param {Ext.grid.Row} node                   The row to be collapsed
     * @param {Ext.data.NodeInterface} record       The record to be collapsed
     */

    /**
     * @event nodecollapse
     * Fires after an row has been visually collapsed and its child nodes are no longer visible in the tree.
     * @param {Ext.grid.Row} node                   The row that was collapsed
     * @param {Ext.data.NodeInterface} record       The record that was collapsed
     */

    cachedConfig: {
        expanderFirst: true,

        /**
         * @cfg {Boolean} expanderOnly
         * `true` to expand only on the click of the expander element. Setting this to
         * `false` will allow expansion on click of any part of the element.
         */
        expanderOnly: true
    },

    config: {
        root: {},

        /**
         * @cfg {Boolean} selectOnExpander
         * `true` to select the node when clicking the expander.
         */
        selectOnExpander: false,

        /**
         * @cfg {Boolean} [singleExpand=false]
         * `true` if only 1 node per branch may be expanded.
         */
        singleExpand: null,

        rootVisible: true,

        iconSize: null,

        indent: null,

        displayField: 'text',

        columns: false, // Non-null to force running the applier.

        rowLines: false,
        
        /**
         * @cfg {Boolean} [folderSort=false]
         * True to automatically prepend a leaf sorter to the store.
         */
        folderSort: false
    },

    // Instruct rows to create view models so we can use data binding
    itemConfig: {
        viewModel: true
    },

    eventsSelector: '.' + Ext.baseCSSPrefix + 'grid-cell',

    constructor: function(config) {
        var me = this,
            el;

        me.callParent([config]);
        
        el = me.element;
        if (el.isPainted()) {
            me.syncIconSize();
        } else {
            el.on({
                scope: me,
                painted: me.syncIconSize,
                single: true
            });
        }
    },

    onItemTrigger: function(me, index, target, record, e) {
        var cell = me.getCellFromEvent(e);

        if (cell && (!cell.isTreeCell || me.getSelectOnExpander() || e.target !== cell.expanderElement.dom)) {
            me.callParent([me, index, target, record, e]);
        }
    },

    applyColumns: function(columns) {
        if (!columns) {
            this.setHideHeaders(true);
            columns = [{
                xtype: 'treecolumn',
                text: 'Name',
                dataIndex: this.getDisplayField(),
                minWidth: 100,
                flex: 1
            }];
        }
        return columns;
    },

    updateStore: function(newStore, oldStore) {
        var me = this,
            oldRoot,
            newRoot;

        // We take over from event firing so we can relay
        if (oldStore) {
            oldRoot = oldStore.getRootNode();
            Ext.destroy(me.storeListeners, me.storeRelayers);
        }
        
        if (newStore) {

            // If there is no root node defined, then create one.
            // Ensure a first onRootChange is called so we can hook into the event firing
            if (newRoot = newStore.getRoot()) {
                me.onRootChange(newRoot);
            } else {
                newStore.setRoot(me.getRoot());
                newRoot = newStore.getRoot();
            }

            // Store must have the same idea about root visibility as us before callParent binds it.
            if (!('rootVisible' in newStore.initialConfig)) {
                newStore.setRootVisible(me.getRootVisible());
            }

            me.callParent([newStore, oldStore]);
            newStore.folderSort = me.getFolderSort();

            // Monitor the TreeStore for the root node being changed. Return a Destroyable object
            me.storeListeners = me.mon(newStore, {
                destroyable: true,
                rootchange: me.onRootChange,
                scope: me
            });

            // Relay store events. relayEvents always returns a Destroyable object.
            me.storeRelayers = me.relayEvents(newStore, [
                /**
                 * @event beforeload
                 * @inheritdoc Ext.data.TreeStore#beforeload
                 */
                'beforeload',

                /**
                 * @event load
                 * @inheritdoc Ext.data.TreeStore#load
                 */
                'load'
            ]);

            // If rootVisible is false, we *might* need to expand the node.
            // If store is autoLoad, that will already have been kicked off.
            // If its already expanded, or in the process of loading, the TreeStore
            // has started that at the end of updateRoot 
            if (!newStore.rootVisible && !newStore.autoLoad && !(newRoot.isExpanded() || newRoot.isLoading())) {
                // A hidden root must be expanded, unless it's overridden with autoLoad: false.
                // If it's loaded, set its expanded field (silently), and skip ahead to the onNodeExpand callback.
                if (newRoot.isLoaded()) {
                    newRoot.data.expanded = true;
                    newStore.onNodeExpand(newRoot, newRoot.childNodes);
                }
                // Root is not loaded; go through the expand mechanism to force a load
                // unless we were told explicitly not to load the store by setting
                // autoLoad: false. This is useful with Direct proxy in cases when
                // Direct API is loaded dynamically and may not be available at the time
                // when TreePanel is created.
                else if (newStore.autoLoad !== false && !newStore.hasPendingLoad()) {
                    newRoot.data.expanded = false;
                    newRoot.expand();
                }
            }

            // TreeStore must have an upward link to the TreePanel so that nodes can find their owning tree in NodeInterface.getOwnerTree
            // TODO: NodeInterface.getOwnerTree is deprecated. Data class must not be coupled to UI. Remove this link
            // when that method is removed.
            newStore.ownerTree = me;
        }
    },

    onRootChange: function(newRoot, oldRoot) {
        var me = this,
            fireEventArgs;

        if (oldRoot) {
            delete oldRoot.fireEventArgs;
        }
        
        // We take over from event firing so we can relay.
        // Cannot use Function.createSequence. That does not return the return values
        if (newRoot) {
            fireEventArgs = newRoot.fireEventArgs;
            newRoot.fireEventArgs = function(eventName) {
                // Fire on the original firer
                var ret = fireEventArgs.apply(newRoot, arguments);

                // If not stopped, fire through this Tree
                if (ret !== false) {
                    arguments[0] = me.rootEventsMap[eventName] || ('item' + eventName);
                    ret = me.fireEventArgs.apply(me, arguments);
                }
                return ret;
            };
        }
    },

    updateUi: function (ui, oldUi) {
        this.callParent([ui, oldUi]);

        // Ensure that the cached iconSize is read from the style.
        delete this.iconSize;
        this.syncIconSize();
    },

    updateExpanderFirst: function (expanderFirst) {
        this.element.toggleCls(this.expanderFirstCls, expanderFirst);
    },

    updateExpanderOnly: function (value) {
        this.element.toggleCls(this.expanderOnlyCls, !value);
    },

    /**
     * Sets root node of this tree. All trees *always* have a root node. It may be {@link #rootVisible hidden}.
     *
     * If the passed node has not already been loaded with child nodes, and has its expanded field set, this triggers the {@link #cfg-store} to load the child nodes of the root.
     * @param {Ext.data.TreeModel/Object} root
     * @return {Ext.data.TreeModel} The new root
     */
    setRootNode: function(newRoot) {
        var store = this.getStore();

        newRoot = store.setRoot(newRoot);

        return newRoot;
    },

    /**
     * Returns the root node for this tree.
     * @return {Ext.data.TreeModel}
     */
    getRootNode: function() {
        return this.getStore().getRoot();
    },

    
    /**
     * Expands a record that is loaded in the tree.
     * @param {Ext.data.Model} record The record to expand
     * @param {Boolean} [deep] True to expand nodes all the way down the tree hierarchy.
     * @param {Function} [callback] The function to run after the expand is completed
     * @param {Object} [scope] The scope of the callback function.
     */
    expandNode: function(record, deep, callback, scope) {
        return record.expand(deep, callback, scope || this);
    },

    /**
     * Collapses a record that is loaded in the tree.
     * @param {Ext.data.Model} record The record to collapse
     * @param {Boolean} [deep] True to collapse nodes all the way up the tree hierarchy.
     * @param {Function} [callback] The function to run after the collapse is completed
     * @param {Object} [scope] The scope of the callback function.
     */
    collapseNode: function(record, deep, callback, scope) {
        return record.collapse(deep, callback, scope || this);
    },

    /**
     * Expand all nodes
     * @param {Function} [callback] A function to execute when the expand finishes.
     * @param {Object} [scope] The scope of the callback function
     */
    expandAll: function(callback, scope) {
        var me = this,
            root = me.getRootNode();

        if (root) {
            Ext.suspendLayouts();
            root.expand(true, callback, scope || me);
            Ext.resumeLayouts(true);
        }
    },

    /**
     * Collapse all nodes
     * @param {Function} [callback] A function to execute when the collapse finishes.
     * @param {Object} [scope] The scope of the callback function
     */
    collapseAll: function(callback, scope) {
        var me = this,
            root = me.getRootNode();

        if (root) {
            Ext.suspendLayouts();
            scope = scope || me;
            if (me.getStore().rootVisible) {
                root.collapse(true, callback, scope);
            } else {
                root.collapseChildren(true, callback, scope);
            }
            Ext.resumeLayouts(true);
        }
    },

    privates: {
        rootEventsMap: {
            beforeappend: 'beforeitemappend',
            beforeremove: 'beforeritememove',
            beforemove: 'beforeitemmove',
            beforeinsert: 'beforeiteminsert',
            beforeexpand: 'beforeitemexpand',
            beforecollapse: 'beforeitemcollapse'
        },

        syncIconSize: function() {
            var me = this,
                size = me.iconSize ||
                      (me.iconSize = parseInt(me.element.getStyle('background-position'), 10));

           me.setIconSize(size);
        },

        defaultIconSize: 22,

        updateIconSize: function (value) {
            this.setIndent(value || this.defaultIconSize);
        },

        updateIndent: function (value) {
            Ext.Array.each(this.query('treecell'), function(cell) {
                cell.setIndent(value);
            });
        }
    }
});
