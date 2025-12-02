describe("Ext.tree.plugin.TreeViewDragDrop", function() {
    var TreeItem = Ext.define(null, {
        extend: 'Ext.data.TreeModel',
        fields: ['id', 'text', 'secondaryId'],
        proxy: {
            type: 'memory'
        }
    }),
    testNodes = [{
        id: 'A',
        text: 'A',
        secondaryId: 'AA',
        children: [{
            id: 'B',
            text: 'B',
            secondaryId: 'BB',
            children: [{
                id: 'C',
                text: 'C',
                secondaryId: 'C',
                leaf: true
            }, {
                id: 'D',
                text: 'D',
                secondaryId: 'D',
                leaf: true
            }]
        }, {
            id: 'E',
            text: 'E',
            secondaryId: 'EE',
            leaf: true
        }, {
            id: 'F',
            text: 'F',
            secondaryId: 'FF',
            children: [{
                id: 'G',
                text: 'G',
                secondaryId: 'GG',
                children: [{
                    id: 'H',
                    text: 'H',
                    secondaryId: 'HH',
                    leaf: true
                }]
            }]
        }]
    }, {
        id: 'I',
        text: 'I',
        secondaryId: 'II',
        children: [{
            id: 'J',
            text: 'J',
            secondaryId: 'JJ',
            children: [{
                id: 'K',
                text: 'K',
                secondaryId: 'KK',
                leaf: true
            }]
        }, {
            id: 'L',
            text: 'L',
            secondaryId: 'LL',
            leaf: true
        }]
    }, {
        id: 'M',
        text: 'M',
        secondaryId: 'MM',
        children: [{
            id: 'N',
            text: 'N',
            secondaryId: 'NN',
            leaf: true
        }]
    }],
    tree, view, store, rootNode, colRef, plugin, dragZone;

    function makeTree(nodes, cfg, storeCfg, rootCfg) {
        cfg = cfg || {};
        Ext.applyIf(cfg, {
            animate: false,
            renderTo: Ext.getBody(),
            viewConfig: {
                plugins: {
                    ptype: 'treeviewdragdrop',
                    dragZone: {
                        animRepair: false
                    }
                },
                loadMask: false
            },
            store: store = new Ext.data.TreeStore(Ext.apply({
                model: TreeItem,
                root: Ext.apply({
                    secondaryId: 'root',
                    id: 'root',
                    text: 'Root',
                    expanded: true,
                    children: nodes || testNodes
                }, rootCfg)
            }, storeCfg))
        });
        tree = new Ext.tree.Panel(cfg);
        view = tree.view;
        rootNode = tree.getRootNode();
        store = tree.getStore();
        colRef = tree.getColumnManager().getColumns();
        plugin = view.findPlugin('treeviewdragdrop');
        dragZone = plugin.dragZone;
    }

    function getWidget(index, col) {
        col = col || colRef[1];
        return col.getWidget(store.getAt(index));
    }

    afterEach(function() {
        tree.destroy();
        tree = view = rootNode = store = colRef = plugin = dragZone = null;
    });

    describe("basic functionality", function() {
        it("should be able to drag", function() {
            var cell, rec;
            makeTree();

            rec = store.getById('A');
            cell = view.getCell(rec, tree.down('treecolumn'));

            // Disable fx to avoid animation errors while destroying the treepanel
            Ext.enableFx = false;
            jasmine.fireMouseEvent(cell, 'mousedown');
            jasmine.fireMouseEvent(cell, 'mousemove', 5, 20);
            expect(Ext.fly(dragZone.dragData.item).contains(cell)).toBe(true);
            jasmine.fireMouseEvent(cell, 'mouseup');
            Ext.enableFx = true;
        });
    });

    describe("with widget columns", function() {
        beforeEach(function() {
            makeTree(null,{
                columns: [{
                    xtype: 'treecolumn',
                    dataIndex: 'text'
                },{
                    xtype : 'widgetcolumn',
                    dataIndex: 'secondaryId',
                    widget : {          
                        xtype : 'textfield'
                    }
                }]
            });
        });

        it("should be able to focus the widget with a mouse click", function() {
            jasmine.fireMouseEvent(getWidget(0).el.dom, 'click');

            expect(getWidget(0).hasFocus).toBe(true);
        });
    });
});