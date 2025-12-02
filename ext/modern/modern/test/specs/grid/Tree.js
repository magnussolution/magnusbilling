/* global Ext, expect, spyOn, jasmine */

describe("Ext.grid.Tree", function() {

    var TreeItem = Ext.define(null, {
            extend: 'Ext.data.TreeModel',
            fields: ['id', 'text', 'secondaryId'],
            proxy: {
                type: 'memory'
            }
        }),
        tree,
        container,
        store,
        rootNode,
        recordCount,
        testNodes,
        synchronousLoad = true,
        treeStoreLoad = Ext.data.TreeStore.prototype.load,
        loadStore;

    function getRow(row) {
        var rec = store.getAt(row);
        return tree.getItem(rec);
    }

    function getCell(row, column) {
        row = getRow(row);
        return row.cells[column];
    }

    function spyOnEvent(object, eventName, fn) {
        var obj = {
            fn: fn || Ext.emptyFn
        },
        spy = spyOn(obj, "fn");
        object.addListener(eventName, obj.fn);
        return spy;
    }

    // Force any flex sizes to be published internally
    function refreshColSizes() {
        var cols = tree.query('column');
        Ext.event.publisher.ElementSize.instance.syncRefresh(cols);
    }

    function makeTree(nodes, cfg, storeCfg, rootCfg) {
        tree = new Ext.grid.Tree(Ext.apply({
            renderTo: Ext.getBody(),
            store: store = new Ext.data.TreeStore(Ext.apply({
                model: TreeItem,
                root: Ext.apply({
                    id: 'root',
                    secondaryId: 'root',
                    text: 'Root',

                    // Add cls. Tests must not throw errors with this present.
                    cls: 'test-EXTJS-16367',
                    children: nodes
                }, rootCfg)
            }, storeCfg)),
            width: 200,
            height: 300
        }, cfg));
        rootNode = store.getRootNode();
        container = tree.container;
        tree.onContainerResize(container, { height: container.element.getHeight() });

        // Need because of async response to flex
        refreshColSizes();
    }

    beforeEach(function() {
        MockAjaxManager.addMethods();
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
        }];

        // Override so that we can control asynchronous loading
        loadStore = Ext.data.TreeStore.prototype.load = function() {
            treeStoreLoad.apply(this, arguments);
            if (synchronousLoad) {
                this.flushLoad.apply(this, arguments);
            }
            return this;
        };
    });

    afterEach(function(){
        // Undo the overrides.
        Ext.data.TreeStore.prototype.load = treeStoreLoad;
        Ext.destroy(tree);
        MockAjaxManager.removeMethods();
    });
    
    describe('expand and collapse', function() {
        beforeEach(function() {
            makeTree(testNodes, {
                rootVisible: true
            });
        });

        it('should insert nodes on expand and removed nodes on collapse', function() {
            // Just the root node
            expect(store.getCount()).toBe(1);

            rootNode.expand();

            // Root node plus its children
            expect(store.getCount()).toBe(rootNode.childNodes.length + 1);

            rootNode.collapse();

            // Back to just the root node
            expect(store.getCount()).toBe(1);
        });
    });
    
    describe('events', function() {
        var returnFalse = function() {
            return false;
        };

        beforeEach(function() {
            makeTree(testNodes);
        });

        it('should veto expand when false returned from beforeitemexpand listener', function() {
            // Just the root node
            expect(store.getCount()).toBe(1);

            // Veto expanding
            tree.on('beforeitemexpand', returnFalse);
            rootNode.expand();

            // Still just the root node
            expect(store.getCount()).toBe(1);

            // Remove the vetoing function
            tree.un('beforeitemexpand', returnFalse);

            rootNode.expand();

            // Root node plus its children
            expect(store.getCount()).toBe(rootNode.childNodes.length + 1);

            // Veto collapsing
            tree.on('beforeitemcollapse', returnFalse);
            rootNode.collapse();

            // Still root node plus its children
            expect(store.getCount()).toBe(rootNode.childNodes.length + 1);

            // Remove the vetoing function
            tree.un('beforeitemcollapse', returnFalse);

            rootNode.collapse();

            // Back to just the root node
            expect(store.getCount()).toBe(1);
        });
    });

    describe("construction", function() {
        it("should render while the root node is loading", function() {
            expect(function() {
                makeTree(null, null, {
                    proxy: {
                        type: 'ajax',
                        url: 'fake'
                    }
                }, {
                    expanded: true
                });
            }).not.toThrow();
        });
        
        describe("with invisible root", function() {
            it("should expand the root node by default", function() {
                makeTree(null, {
                    rootVisible: false
                });
                
                expect(rootNode.isExpanded()).toBe(true);
            });
            
            it("should skip root.expand() when root is loaded", function() {
                spyOn(TreeItem.prototype, 'expand').andCallThrough();
                spyOn(Ext.data.TreeStore.prototype, 'onNodeExpand').andCallThrough();
                
                makeTree(null, {
                    rootVisible: false
                }, null, {
                    // Pretend that the root node is loaded
                    loaded: true
                });
                
                expect(rootNode.expand).not.toHaveBeenCalled();
                expect(rootNode.data.expanded).toBe(true);
                expect(store.onNodeExpand).toHaveBeenCalled();
            });
            
            it("should not expand the root node when store.autoLoad === false", function() {
                makeTree(null, {
                    rootVisible: false
                }, {
                    autoLoad: false,
                    proxy: {
                        type: 'memory',
                        data: testNodes.children
                    }
                });
                
                expect(rootNode.isExpanded()).toBe(false);
            });
            
            it("should not expand the root node when store has pending load", function() {
                makeTree(null, {
                    rootVisible: false
                }, {
                    // Pretend that we're loading the store
                    loading: true,
                    proxy: {
                        type: 'memory',
                        data: testNodes.children
                    }
                });
                
                expect(rootNode.isExpanded()).toBe(false);
            });
        });
    });

    describe("setting the root node", function() {
        it("should set the nodes correctly when setting root on the store", function() {
            makeTree();
            store.setRootNode({
                expanded: true,
                children: testNodes
            });
            expect(store.getCount()).toBe(4);
            expect(store.getAt(0).id).toBe('root');
            expect(store.getAt(1).id).toBe('A');
            expect(store.getAt(2).id).toBe('I');
            expect(store.getAt(3).id).toBe('M');
        });

        it("should set the nodes correctly when setting root on the tree", function() {
            makeTree();
            tree.setRootNode({
                expanded: true,
                children: testNodes
            });
            expect(store.getCount()).toBe(4);
            expect(store.getAt(0).id).toBe('root');
            expect(store.getAt(1).id).toBe('A');
            expect(store.getAt(2).id).toBe('I');
            expect(store.getAt(3).id).toBe('M');
        });

        it("should preserve events", function() {
            var spy = jasmine.createSpy();
            var root2 = {
                expanded: true,
                children: testNodes
            };
            makeTree();
            tree.on({
                beforeitemcollapse: spy, 
                beforeitemexpand: spy, 
                itemcollapse: spy, 
                itemexpand: spy
            });
            tree.setRootNode(root2);

            rootNode = tree.getRootNode();
            rootNode.childNodes[0].expand();
            rootNode.childNodes[0].collapse();

            expect(spy.callCount).toBe(4);
        });
    });

    describe('Binding to a TreeStore', function() {
        it('should bind to a TreeStore in the ViewModel', function() {
            tree = new Ext.panel.Panel({
                renderTo: document.body,
                height: 400,
                width: 600,
                layout: 'fit',
                viewModel: {
                    stores: {
                        nodes: {
                            type: 'tree',
                            model: TreeItem,
                            root: {
                                secondaryId: 'root',
                                id: 'root',
                                text: 'Root',
                                children: testNodes,
                                expanded: true
                            }
                        }
                    }
                },
                items: {
                    xtype: 'tree',
                    bind: {
                        store: '{nodes}'
                    }
                }
            });
            var treepanel = tree.down('tree');

            // No store bound yet
            expect(treepanel.getStore()).toBeNull();

            // Wait until the store has been bound
            waitsFor(function() {
                return treepanel.getStore() && treepanel.getRootNode().childNodes.length === 3 && treepanel.query('gridrow').length === 4;
            }, 'new store to be bound to');
        });
    });

    describe("mouse click to expand/collapse", function() {
        function makeAutoTree(animate, data) {
            makeTree(data, {
                animate: animate
            }, null, {
                expanded: true
            });
        }

        describe("Clicking on expander", function() {
            it("should not fire a click event on click of expander", function() {
                makeAutoTree(true, [{
                    id: 'a',
                    text: 'A',
                    expanded: false,
                    children: [{
                        text: 'B',
                        id: 'b'
                    }]
                }]);
                var spy = jasmine.createSpy(),
                    itemClickSpy = jasmine.createSpy(),
                    rowCount = tree.query('gridrow').length,
                    expander = getCell(1, 0).expanderElement;

                tree.on('itemexpand', spy);
                tree.on('itemtap', itemClickSpy);
                jasmine.fireMouseEvent(expander, 'click');
                waitsFor(function() {
                    return spy.callCount > 0;
                });
                runs(function() {
                    expect(tree.query('gridrow').length).toBeGreaterThan(rowCount);

                    // Clicking on an expander should not trigger an item click
                    expect(itemClickSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe("Clicking outside of a cell", function() {
            var errorSpy, onError;

            beforeEach(function() {
                errorSpy = jasmine.createSpy();
                onError = window.onError;
                // We can't catch any exceptions thrown by synthetic events,
                // so a standard toThrow() or even try/catch won't do the job
                // here. They will hit onerror though, so use that.
                window.onerror = errorSpy.andCallFake(function() {
                    if (onError) {
                        onError();
                    }
                });
            });

            afterEach(function() {
                window.onError = onError;
                errorSpy = null;
            });

            it("should not expand the node", function() {
                makeAutoTree(true, [{
                    id: 'a',
                    text: 'A',
                    expanded: false,
                    children: [{
                        text: 'B',
                        id: 'b'
                    }]
                }]);
                var rowCount = tree.query('gridrow').length;

                jasmine.fireMouseEvent(getRow(1).el, 'click');

                // Must have thrown no error
                expect(errorSpy).not.toHaveBeenCalled();

                // Nothing to wait for. Success means nothing happening
                waits(100);

                runs(function() {
                    expect(tree.query('gridrow').length).toBe(rowCount);
                });
            });
        });
        
    });

    describe('collapsing when collapse zone overflows the rendered zone', function() {
        beforeEach(function() {
            for (var i = 0; i < 100; i++) {
                testNodes[0].children.push({
                    text: 'Extra node ' + i,
                    id: 'extra-node-' + i
                });
            }
            testNodes[0].expanded = true;

            makeTree(testNodes, {
                renderTo: document.body,
                height: 200,
                width: 400
            }, null, {
                expanded: true
            });
        });

        it("should collapse correctly, leaving the collapsee's siblings visible", function() {
            // Collapse node "A".
            tree.getRootNode().childNodes[0].collapse();
            
            // We now should have "Root", and nodes "A", "I" and "M"
            // https://sencha.jira.com/browse/EXTJS-13908
            expect(tree.query('gridrow').length).toBe(4);
        });
    });

    describe('autoexpand collapsed ancestors', function() {
        beforeEach(function() {
            makeTree(testNodes, {
                height: 250
            });
        });
        it("should expand the whole path down to 'G' as well as 'G'", function() {
            // Start off with only the root visible.
            expect(store.getCount()).toBe(1);

            tree.getStore().getNodeById('G').expand();

            // "A" should be expanded all the way down to "H", then "I", then "M"
            expect(store.getCount()).toBe(9);
        });
    });

    describe("expand/collapse", function(){
        beforeEach(function(){
            makeTree(testNodes);
        });
        
        describe("expandAll", function(){
            
            describe("callbacks", function(){
                it("should pass the direct child nodes of the root", function(){
                    var expectedNodes,
                        callCount = 0,
                        store = tree.getStore();
                        
                    tree.expandAll(function(nodes) {
                        expectedNodes = nodes;
                        callCount++;
                    });
                    
                    expect(callCount).toEqual(1);
                    expect(expectedNodes[0]).toBe(store.getById('A'));
                    expect(expectedNodes[1]).toBe(store.getById('I'));
                    expect(expectedNodes[2]).toBe(store.getById('M'));
                });
                
                it("should default the scope to the tree", function() {
                    var expectedScope;
                    tree.expandAll(function(){
                        expectedScope = this;
                    });    
                    expect(expectedScope).toBe(tree);
                });
                
                it("should use a passed scope", function() {
                    var o = {}, expectedScope;
                    tree.expandAll(function(){
                        expectedScope = this;
                    }, o);    
                    expect(expectedScope).toBe(o);
                });
            });
            
            it("should expand all nodes", function(){
                tree.expandAll();
                Ext.Array.forEach(tree.getStore().getRange(), function(node){
                    if (!node.isLeaf()) {
                        expect(node.isExpanded()).toBe(true);
                    }
                });
            });
            
            it("should continue down the tree even if some nodes are expanded", function(){
                var store = tree.getStore();
                store.getNodeById('A').expand();
                store.getNodeById('I').expand();
                tree.expandAll();
                Ext.Array.forEach(tree.getStore().getRange(), function(node){
                    if (!node.isLeaf()) {
                        expect(node.isExpanded()).toBe(true);
                    }
                });
            });
            
        });
        
        describe("collapseAll", function(){
            describe("callbacks", function(){
                
                it("should pass the direct child nodes of the root", function(){
                    var expectedNodes,
                        store = tree.getStore();
                        
                    tree.collapseAll(function(nodes) {
                        expectedNodes = nodes;
                    });
                    
                    expect(expectedNodes[0]).toBe(store.getNodeById('A'));
                    expect(expectedNodes[1]).toBe(store.getNodeById('I'));
                    expect(expectedNodes[2]).toBe(store.getNodeById('M'));
                });
                
                it("should default the scope to the tree", function() {
                    var expectedScope;
                    tree.collapseAll(function(){
                        expectedScope = this;
                    });    
                    expect(expectedScope).toBe(tree);
                });
                
                it("should use a passed scope", function() {
                    var o = {}, expectedScope;
                    tree.expandAll(function(){
                        expectedScope = this;
                    }, o);    
                    expect(expectedScope).toBe(o);
                });
            });
            
            it("should collapse all nodes", function(){
                tree.expandAll();
                tree.collapseAll();
                Ext.Array.forEach(tree.getStore().getRange(), function(node){
                    if (!node.isLeaf()) {
                        expect(node.isExpanded()).toBe(false);
                    }
                });
            });
        });
        
        describe("expand", function(){
            describe("callbacks", function(){
               it("should pass the nodes directly under the expanded node", function(){
                   var expectedNodes,
                        store = tree.getStore();
                        
                   tree.expandNode(tree.getRootNode(), false, function(nodes){
                       expectedNodes = nodes;
                   });
                   
                   expect(expectedNodes[0]).toBe(store.getNodeById('A'));
                   expect(expectedNodes[1]).toBe(store.getNodeById('I'));
                   expect(expectedNodes[2]).toBe(store.getNodeById('M'));
               });
               
               it("should default the scope to the tree", function(){
                   var expectedScope;
                   tree.expandNode(tree.getRootNode(), false, function(){
                       expectedScope = this;
                   });
                   expect(expectedScope).toBe(tree);
               });
               
               it("should use a passed scope", function(){
                   var o = {}, expectedScope;
                   tree.expandNode(tree.getRootNode(), false, function(){
                       expectedScope = this;
                   }, o);
                   expect(expectedScope).toBe(o);
               });
            });
            
            describe("deep", function(){
                it("should only expand a single level if deep is not specified", function(){
                    var store = tree.getStore();
                    tree.expandNode(tree.getRootNode());
                    expect(store.getNodeById('A').isExpanded()).toBe(false);
                    expect(store.getNodeById('I').isExpanded()).toBe(false);  
                    expect(store.getNodeById('M').isExpanded()).toBe(false);      
                });  
                
            });
        });
        
        describe("collapse", function(){
            describe("callbacks", function(){
               it("should pass the nodes directly under the expanded node", function(){
                   var expectedNodes,
                       store = tree.getStore();
                        
                   tree.collapseNode(tree.getRootNode(), false, function(nodes){
                       expectedNodes = nodes;
                   });              
                   expect(expectedNodes[0]).toBe(store.getNodeById('A'));
                   expect(expectedNodes[1]).toBe(store.getNodeById('I'));
                   expect(expectedNodes[2]).toBe(store.getNodeById('M'));
               });
               
               it("should default the scope to the tree", function(){
                   var expectedScope;
                   tree.collapseNode(tree.getRootNode(), false, function(){
                       expectedScope = this;
                   });
                   expect(expectedScope).toBe(tree);
               });
               
               it("should use a passed scope", function(){
                   var o = {}, expectedScope;
                   tree.collapseNode(tree.getRootNode(), false, function(){
                       expectedScope = this;
                   }, o);
                   expect(expectedScope).toBe(o);
               });
            });
            
            describe("deep", function(){
                it("should only collapse a single level if deep is not specified", function(){
                    var store = tree.getStore();
                    tree.expandAll();
                    tree.collapseNode(tree.getRootNode());
                    expect(store.getNodeById('A').isExpanded()).toBe(true);
                    expect(store.getNodeById('I').isExpanded()).toBe(true);  
                    expect(store.getNodeById('M').isExpanded()).toBe(true);      
                });  
            });
        });
    });

    describe('event order', function() {
        it("should fire 'beforeitemexpand' before 'beforeload'", function() {
            var order = 0,
                beforeitemexpandOrder,
                beforeloadOrder,
                loadOrder;

            makeTree(null, {
                store: new Ext.data.TreeStore({
                    asynchronousLoad: false,
                    proxy: {
                        type: 'ajax',
                        url: 'fakeUrl'
                    },
                    root: {
                        text: 'Ext JS',
                        id: 'src'
                    },
                    folderSort: true,
                    sorters: [{
                        property: 'text',
                        direction: 'ASC'
                    }]
                }),
                listeners: {
                    beforeitemexpand: function() {
                        beforeitemexpandOrder = order;
                        order++;
                    },
                    beforeload : function() {
                        beforeloadOrder = order;
                        order++;
                    },  
                    load : function() {
                        loadOrder = order;
                    }
                }
            });
            tree.getStore().getRoot().expand();

            Ext.Ajax.mockComplete({
                status: 200,
                responseText: Ext.encode(testNodes)
            });

            // The order of events expected: beforeitemexpand, beforeload, load.
            expect(beforeitemexpandOrder).toBe(0);
            expect(beforeloadOrder).toBe(1);
            expect(loadOrder).toBe(2);
        });
    });

    describe("rendering while a child node is loading and the root is specified on the tree", function() {
        it("should render the correct number of nodes", function() {
            var ProxyModel = Ext.define(null, {
                extend: 'Ext.data.TreeModel',
                fields: ['id', 'text', 'secondaryId'],
                proxy: {
                    type: 'ajax',
                    url: 'fakeUrl'
                }
            });

            makeTree(null, {
                root: {
                    text: 'Root',
                    expanded: true,
                    children: [{
                        id: 'node1',
                        text: 'Node1',
                        expandable: true,
                        expanded: true
                    }, {
                        id: 'node2',
                        text: 'Node2',
                        expandable: true,
                        expanded: false
                    }]
                }
            }, {
                model: ProxyModel,
                root: null
            });

            expect(tree.query('gridrow').length).toBe(3);

            // At this point, node1 will be loading because it's expanded
            Ext.Ajax.mockComplete({
                status: 200,
                responseText: Ext.encode([{
                    id: 'node1.1'
                }])
            });
            expect(tree.query('gridrow').length).toBe(4);
        });
    });

    describe('top down filtering', function() {
        var treeData = [{
            text: 'Top 1',
            children: [{
                text: 'foo',
                leaf: true
            }, {
                text: 'bar',
                leaf: true
            }, {
                text: 'Second level 1',
                children: [{
                    text: 'foo',
                    leaf: true
                }, {
                    text: 'bar',
                    leaf: true
                }]
            }]
        }, {
            text: 'Top 2',
            children: [{
                text: 'foo',
                leaf: true
            }, {
                text: 'wonk',
                leaf: true
            }, {
                text: 'Second level 2',
                children: [{
                    text: 'foo',
                    leaf: true
                }, {
                    text: 'wonk',
                    leaf: true
                }]
            }]
        }, {
            text: 'Top 3',
            children: [{
                text: 'zarg',
                leaf: true
            }, {
                text: 'bar',
                leaf: true
            }, {
                text: 'Second level 3',
                children: [{
                    text: 'zarg',
                    leaf: true
                }, {
                    text: 'bar',
                    leaf: true
                }]
            }]
        }];

        beforeEach(function() {
            makeTree(treeData, {
                rootVisible: false
            });
        });

        function testRowText(rowIdx, value) {
            return tree.getStore().getAt(rowIdx).get('text') === value;
        }

        it('should only show nodes which pass a filter', function() {
            // Check correct initial state
            expect(tree.query('gridrow').length).toBe(3);
            expect(tree.getStore().getCount()).toBe(3);
            expect(testRowText(0, 'Top 1')).toBe(true);
            expect(testRowText(1, 'Top 2')).toBe(true);
            expect(testRowText(2, 'Top 3')).toBe(true);

            // Filter so that only "foo" nodes and their ancestors are visible.
            // filterer = 'bottomup' means that visible leaf nodes cause their ancestors to be visible.
            store.filterer = 'bottomup';
            store.filter({
                filterFn: function(node) {
                    return  node.get('text') === 'foo';
                },
                id: 'testFilter'
            });

            rootNode.childNodes[0].expand();

            // The "Second level 1" branch node is visible because it has a child with text "foo"
            expect(tree.query('gridrow').length).toBe(4);
            expect(tree.getStore().getCount()).toBe(4);
            expect(testRowText(0, 'Top 1')).toBe(true);
            expect(testRowText(1, 'foo')).toBe(true);
            expect(testRowText(2, 'Second level 1')).toBe(true);
            expect(testRowText(3, 'Top 2')).toBe(true);

            // Expand "Second level 1". It contains 1 "foo" child.
            rootNode.childNodes[0].childNodes[2].expand();

            expect(tree.query('gridrow').length).toBe(5);
            expect(tree.getStore().getCount()).toBe(5);
            expect(testRowText(0, 'Top 1')).toBe(true);
            expect(testRowText(1, 'foo')).toBe(true);
            expect(testRowText(2, 'Second level 1')).toBe(true);
            expect(testRowText(3, 'foo')).toBe(true);
            expect(testRowText(4, 'Top 2')).toBe(true);

            // Now, with "Top 1" amd "Second level 1" already expanded, let's see only "bar" nodes and their ancestors.
            // View should refresh.
            store.filter({
                filterFn: function(node) {
                    return node.get('text') === 'bar';
                },
                id: 'testFilter'
            });

            expect(tree.query('gridrow').length).toBe(5);
            expect(tree.getStore().getCount()).toBe(5);
            expect(testRowText(0, 'Top 1')).toBe(true);
            expect(testRowText(1, 'bar')).toBe(true);
            expect(testRowText(2, 'Second level 1')).toBe(true);
            expect(testRowText(3, 'bar')).toBe(true);
            expect(testRowText(4, 'Top 3')).toBe(true);

            // Expand "Top 3". It contains a "bar" and "Second level3", which should be visible because it contains a "bar"
            rootNode.childNodes[2].expand();

            expect(tree.query('gridrow').length).toBe(7);
            expect(tree.getStore().getCount()).toBe(7);
            expect(testRowText(0, 'Top 1')).toBe(true);
            expect(testRowText(1, 'bar')).toBe(true);
            expect(testRowText(2, 'Second level 1')).toBe(true);
            expect(testRowText(3, 'bar')).toBe(true);
            expect(testRowText(4, 'Top 3')).toBe(true);
            expect(testRowText(5, 'bar')).toBe(true);
            expect(testRowText(6, 'Second level 3')).toBe(true);

            // Collapse "Top 3". The "bar" and "Second level3" which contains a "bar" should disappear
            rootNode.childNodes[2].collapse();

            expect(tree.query('gridrow').length).toBe(5);
            expect(tree.getStore().getCount()).toBe(5);
            expect(testRowText(0, 'Top 1')).toBe(true);
            expect(testRowText(1, 'bar')).toBe(true);
            expect(testRowText(2, 'Second level 1')).toBe(true);
            expect(testRowText(3, 'bar')).toBe(true);
            expect(testRowText(4, 'Top 3')).toBe(true);

            // Collapse the top level nodes
            // So now only top levels which contain a "bar" somewhere in their hierarchy should be visible.
            rootNode.collapseChildren();
            expect(tree.query('gridrow').length).toBe(2);
            expect(tree.getStore().getCount()).toBe(2);
            expect(testRowText(0, 'Top 1')).toBe(true);
            expect(testRowText(1, 'Top 3')).toBe(true);
        });
    });

    describe('sorting', function() {
        it('should sort nodes', function() {
            var bNode;

            makeTree(testNodes, null, {
                folderSort: true,
                sorters: [{
                    property: 'text',
                    direction: 'ASC'
                }]
            });
            tree.expandAll();
            bNode = tree.getStore().getNodeById('B');

            // Insert an out of order node.
            // MUST be leaf: true so that the automatically prepended sort by leaf status has no effect.
            bNode.insertChild(0, {
                text:'Z',
                leaf: true
            });

            // Check that we have disrupted the sorted state.
            expect(bNode.childNodes[0].get('text')).toBe('Z');
            expect(bNode.childNodes[1].get('text')).toBe('C');
            expect(bNode.childNodes[2].get('text')).toBe('D');

            // Sort using the owning TreeStore's sorter set.
            // It is by leaf status, then text, ASC.
            // These are all leaf nodes.
            bNode.sort();
            expect(bNode.childNodes[0].get('text')).toBe('C');
            expect(bNode.childNodes[1].get('text')).toBe('D');
            expect(bNode.childNodes[2].get('text')).toBe('Z');

            // Sort passing a comparator which does a descending sort on text
            bNode.sort(function(node1, node2) {
                return node1.get('text') > node2.get('text') ? -1 : 1;
            });
            expect(bNode.childNodes[0].get('text')).toBe('Z');
            expect(bNode.childNodes[1].get('text')).toBe('D');
            expect(bNode.childNodes[2].get('text')).toBe('C');
        });
    });

    describe('Changing root node', function() {
        it('should remove all listeners from old root node', function() {
            tree = new Ext.grid.Tree({
                title: 'Test',
                height: 200,
                width: 400,
                store: {
                    type: 'tree',
                    root: {
                        text: 'Root',
                        expanded: true,
                        children: [{
                            text: 'A',
                            leaf: true
                        }, {
                            text: 'B',
                            leaf: true
                        }]
                    }
                }
            });

            var oldRoot = tree.getRootNode();

            // The old root should have fireEventArgs overridden
            expect(oldRoot.fireEventArgs).not.toBe(Ext.data.TreeModel.prototype.fireEventArgs);

            tree.getStore().setRoot({
                text: 'NewRoot',
                expanded: true,
                children: [{
                    text: 'New A',
                    leaf: true
                }, {
                    text: 'New B',
                    leaf: true
                }]
            });

            // The old root should have the non-overridden fireEventArgs
            expect(oldRoot.fireEventArgs).toBe(Ext.data.TreeModel.prototype.fireEventArgs);

        });
    });

    describe('sorting a collapsed node', function() {
        it('should not expand a collapsed node upon sort', function() {
            makeTree(testNodes, null, {
                folderSort: true,
                sorters: [{
                    property: 'text',
                    direction: 'ASC'
                }]
            });
            rootNode.expand();
            var aNode = tree.getStore().getNodeById('A');

            // Sort the "A" node
            aNode.sort(function(a, b) {
                return a.get('text').localeCompare(b.get('text'));
            });

            // Should NOT have resulted in expansion
            expect(tree.getStore().indexOf(aNode.childNodes[0])).toBe(-1);
            expect(tree.getStore().indexOf(aNode.childNodes[1])).toBe(-1);
            expect(tree.getStore().indexOf(aNode.childNodes[2])).toBe(-1);
        });
    });

    describe('bottom up filtering', function() {
        it('should show path to all filtered in leaf nodes', function() {
            makeTree(testNodes, null, {
                filterer: 'bottomup'
            });
            tree.expandAll();

            // All nodes must be visible
            expect(tree.query('gridrow').length).toBe(15);

            // This should only pass one leaf node.
            // But its ancestors obviously have to be visible.
            store.filter({
                property: 'text',
                operator: '=',
                value: 'H'
            });

            // These nodes must be available
            expect(tree.getItem(store.getById('root'))).not.toBe(null);
            expect(tree.getItem(store.getById('A'))).not.toBe(null);
            expect(tree.getItem(store.getById('F'))).not.toBe(null);
            expect(tree.getItem(store.getById('G'))).not.toBe(null);
            expect(tree.getItem(store.getById('H'))).not.toBe(null);

            // These nodes must not be available
            expect(tree.getItem(store.getById('B'))).toBe(null);
            expect(tree.getItem(store.getById('C'))).toBe(null);
            expect(tree.getItem(store.getById('D'))).toBe(null);
            expect(tree.getItem(store.getById('E'))).toBe(null);
            expect(tree.getItem(store.getById('I'))).toBe(null);
            expect(tree.getItem(store.getById('J'))).toBe(null);
            expect(tree.getItem(store.getById('K'))).toBe(null);
            expect(tree.getItem(store.getById('L'))).toBe(null);
            expect(tree.getItem(store.getById('M'))).toBe(null);
            expect(tree.getItem(store.getById('N'))).toBe(null);

            // Just the path to the H node must be visible
            expect(tree.query('gridrow').length).toBe(5);
        });
    });

});