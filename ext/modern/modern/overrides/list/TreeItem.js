/**
 * @class Ext.list.TreeItem
 */
Ext.define('Ext.overrides.list.TreeItem', {
    override: 'Ext.list.TreeItem',

    runAnimation: function(animation) {
        return this.itemContainer.animate(animation);
    },

    stopAnimation: function(animation) {
        animation.end();
    },

    privates: {
        applyFloated: function (floated, wasFloated) {
            this.initialized = true;
            this.callParent([floated, wasFloated]);
            return floated;
        },

        updateFloated: function (floated, wasFloated) {
            var me = this,
                ownerTree,
                toolElement = me.getToolElement(),
                node, wasExpanded;

            if (floated) {
                me.wasExpanded = me.getExpanded();
                me.nextElementSibling = me.el.dom.nextSibling;
                me.setExpanded(true);
            } else {
                wasExpanded = me.wasExpanded;
                node = me.getNode();
                me.setExpanded(me.wasExpanded);
                if (!wasExpanded && node.isExpanded()) {
                    me.preventAnimation = true;
                    node.collapse();
                    me.preventAnimation = false;
                }
            }
            me.callParent([floated, wasFloated]);
            if (floated) {
                ownerTree = me.getOwner();

                // Need an extra wrapping el to carry the necessary CSS classes
                // for the theming to apply to the item.
                me.floatWrap = me.el.wrap({
                    cls: ownerTree.self.prototype.element.cls + ' ' + ownerTree.uiPrefix + ownerTree.getUi() + ' ' + Ext.baseCSSPrefix + 'treelist-floater',
                    style: {
                        width: '200px'
                    }
                });
                me.floatWrap.alignTo(toolElement, 'tl-tr');
                me.floatWrap.on({
                    click: ownerTree.onClick,
                    mouseover: ownerTree.onMouseOver,
                    scope: ownerTree
                });
            } else {
                // Reinsert this el back into the tree
                me.getOwner().rootItem.el.dom.insertBefore(me.el.dom, me.nextElementSibling);
                me.floatWrap.destroy();
                me.floatWrap = null;
            }
            toolElement.toggleCls(me.floatedToolCls, floated);
        }
    }
});
