/**
 * Classe TextMaskPlugin
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 19/09/2022
 */
Ext.define('Ext.ux.DragDropTag', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.dragdroptag',
    requires: [],
    statics: {},
    init: function(cmp) {
        cmp.on('render', this.afterRender, this, {
            single: true
        });
    },
    afterRender: function() {
        var me = this.getCmp();
        me.boundList = me.getPicker();
        me.dragGroup = me.dropGroup = 'MultiselectDD-' + Ext.id();
        me.dragZone = Ext.create('Ext.dd.DragZone', me.itemList, {
            ddGroup: me.dragGroup,
            dragText: me.dragText,
            getDragData: function(e) {
                var sourceEl = e.getTarget(me.tagItemSelector, 10);
                //todo sprawdzić czy w tagfield-item-selected jest ten który jest w source el bo jeśli tak, to przenioś całą zgraję
                if (sourceEl) {
                    var d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return {
                        ddel: d,
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        sourceStore: me.store,
                        draggedRecord: me.getRecordByListItemNode(sourceEl)
                    }
                }
            },
            getRepairXY: function() {
                return this.dragData.repairXY;
            }
        });
        me.dropZone = Ext.create('Ext.dd.DropZone', me.itemList, {
            ddGroup: me.dropGroup,
            getTargetFromEvent: function(e) {
                var allItems = me.itemList.query(me.tagItemSelector, false);
                var mouseY = e.getY();
                var mouseX = e.getX();
                var itemsOnLine = [];
                var bestDistance = Infinity,
                    bestIsAfter, bestItem;
                for (var i = 0; i < allItems.length; i++) {
                    var item = allItems[i];
                    var t = item.getY(),
                        l = item.getX();
                    var b = item.getBottom(),
                        r = item.getRight();
                    var middle = (l + r) / 2;
                    if (mouseY > t && mouseY < b) {
                        //ten element jest na lini kursora
                        var distance;
                        if (mouseX <= middle) {
                            //kursor jest z lewej strony elementu
                            distance = l - mouseX;
                            if (distance < bestDistance) {
                                bestDistance = distance;
                                bestIsAfter = false;
                                bestItem = item;
                            }
                        } else {
                            //kursor jest z prawej strony elementu
                            distance = mouseX - r;
                            if (distance < bestDistance) {
                                bestDistance = distance;
                                bestIsAfter = true;
                                bestItem = item;
                                //break;//następne już tylko będą dalej w tej linii
                            }
                        }
                    }
                }
                if (bestItem) return {
                    element: bestItem,
                    after: bestIsAfter
                };
            },
            onNodeEnter: function(target, dd, e, data) {
                Ext.fly(target.element).addCls('a-tagfield-highlight ' + (target.after ? 'after' : 'before'));
            },
            onNodeOut: function(target, dd, e, data) {
                Ext.fly(target.element).removeCls('a-tagfield-highlight after before');
            },
            onNodeOver: function(target, dd, e, data) {
                return Ext.dd.DropZone.prototype.dropAllowed;
            },
            onNodeDrop: function(target, dd, e, data) {
                //console.info(target.element.dom, target.after ? 'after' : 'before');
                var sourceIndex = Ext.fly(data.sourceEl).getAttribute('data-selectionindex');
                var targetIndex = parseInt(target.element.getAttribute('data-selectionindex'));
                var value = Ext.Array.clone(me.getValue());
                Ext.ux.Array.moveItem(value, sourceIndex, targetIndex, target.after);
                me.setValue(null);
                me.setValue(value);
                return true;
            }
        });
    }
});
Ext.define('Ext.ux.Array', {
    singleton: true,
    /**
     *
     * @param array
     * @param from index
     * @param to index
     * @param [after]
     */
    moveItem: function(array, from, to, after) {
        if (after === true) {
            if (from > to) to++;
        } else if (after === false) {
            if (from < to) to--;
        }
        array.splice(to, 0, array.splice(from, 1)[0]);
    }
});