/* global Ext, jasmine, expect */

describe('Ext.grid.header.Container', function () {
    var createGrid = function (storeCfg, gridCfg) {
        store = Ext.create('Ext.data.Store', Ext.apply({
            storeId:'simpsonsStore',
            fields:['name', 'email', 'phone'],
            data:{'items':[
                { 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
                { 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234"  },
                { 'name': 'Homer', "email":"homer@simpsons.com", "phone":"555-222-1244"  },
                { 'name': 'Marge', "email":"marge@simpsons.com", "phone":"555-222-1254"  }
            ]},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    rootProperty: 'items'
                }
            }
        }, storeCfg));

        grid = Ext.create('Ext.grid.Panel', Ext.apply({
            title: 'Simpsons',
            store: store,
            columns: [
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone', flex: 1, hidden: true }
            ],
            height: 200,
            width: 400,
            renderTo: Ext.getBody()
        }, gridCfg));
    },
    store, grid;

    afterEach(function(){
        store.destroy();
        grid = store = Ext.destroy(grid);
        Ext.state.Manager.clear('foo');
    });

    describe('column menu showing', function() {
        it('should show the menu on trigger click', function() {
            var col,
                menu;

            runs(function() {
                createGrid({}, {
                    renderTo: Ext.getBody()
                });

                col = grid.columns[0];
                col.triggerEl.show();
                jasmine.fireMouseEvent(col.triggerEl.dom, 'click');

                menu = col.activeMenu;
                expect(menu.isVisible()).toBe(true);
                expect(menu.containsFocus).toBeFalsy();

                jasmine.fireMouseEvent(col.triggerEl.dom, 'mousedown');
                expect(menu.isVisible()).toBe(false);

                // Opening the menu with down arrow focuses it
                col.el.focus();
                jasmine.fireKeyEvent(col.el.dom, 'keydown', Ext.event.Event.DOWN);
            });
            waitsFor(function() {
                return menu.isVisible() && menu.containsFocus;
            });
        });
        
        if (Ext.supports.TouchEvents) {
            it('should show the menu on trigger mousedown+mouseup', function() {
                var col,
                    menu;

                createGrid({}, {
                    renderTo: Ext.getBody()
                });

                col = grid.columns[0];
                col.triggerEl.show();
                jasmine.fireMouseEvent(col.triggerEl.dom, 'mousedown');
                jasmine.fireMouseEvent(col.triggerEl.dom, 'mouseup');

                menu = col.activeMenu;

                // Should have shown the header menu
                expect(menu && menu.isVisible()).toBe(true);
            });
            it('should show the menu on trigger touchstart+touchend', function() {
                var col,
                    menu,
                    x, y;

                createGrid({}, {
                    renderTo: Ext.getBody()
                });

                col = grid.columns[0];
                col.triggerEl.show();
                x = col.triggerEl.getX() + col.triggerEl.getWidth() / 2;
                y = col.triggerEl.getY() + col.triggerEl.getHeight() / 2;
                jasmine.fireTouchEvent(col.triggerEl.dom, 'touchstart', [{ pageX: x, pageY: y }]);
                jasmine.fireTouchEvent(col.triggerEl.dom, 'touchend', [{ pageX: x, pageY: y }]);

                menu = col.activeMenu;

                // Should have shown the header menu
                expect(menu && menu.isVisible()).toBe(true);
            });
        }
    });

    describe('columnManager delegations', function () {
        it('should allow columns to call methods on the ColumnManager', function () {
            var col;

            createGrid({}, {
                renderTo: Ext.getBody()
            });

            col = grid.columns[0];

            expect(col.getHeaderIndex(col)).toBe(0);
            expect(col.getHeaderAtIndex(0)).toBe(col);
            expect(col.getVisibleHeaderClosestToIndex(0)).toBe(col);
        });
    });

    describe('gridVisibleColumns', function () {
        it('should keep track of state information for visible grid columns', function () {
            var columns = [
                // It's necessary to pass in columns with a headerId property for this test.
                { header: 'Name',  headerId: 'a', dataIndex: 'name', width: 100 },
                { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1, hidden: true }
            ];

            new Ext.state.Provider();

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            // Update state information.
            grid.columns[2].show();

            grid.saveState();

            Ext.destroy(grid);

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            expect(grid.headerCt.gridVisibleColumns.length).toBe(3);
        });

        it('should keep track of state information for visible grid columns when moved', function () {
            // This spec simulates a stateful bug: EXTJSIV-10262. This bug occurs when a previously hidden
            // header is shown and then moved. The bug occurs because the gridVisibleColumns cache is created
            // from stale information. This happens when the visible grid columns are retrieved before applying
            // the updated state info.
            var columns = [
                // It's necessary to pass in columns with a headerId property for this test.
                { header: 'Name',  headerId: 'a', dataIndex: 'name', width: 100 },
                { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1, hidden: true }
            ];

            new Ext.state.Provider();

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            // Update state information.
            grid.columns[2].show();
            grid.headerCt.move(2, 0);

            grid.saveState();

            Ext.destroy(grid);

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            expect(grid.headerCt.gridVisibleColumns.length).toBe(3);
            expect(grid.headerCt.gridVisibleColumns[0].dataIndex).toBe('phone');
        });

        it('should insert new columns into their correct new ordinal position after state restoration', function () {
            // Test ticket EXTJS-15690.
            var initialColumns = [
                    // It's necessary to pass in columns with a headerId property for this test.
                    { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1 }
                ],
                newColumns = [
                    // It's necessary to pass in columns with a headerId property for this test.
                    { header: 'Name',  headerId: 'a', dataIndex: 'name', width: 100 },
                    { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1 }
                ];

            new Ext.state.Provider();

            createGrid({}, {
                columns: initialColumns,
                stateful: true,
                stateId: 'foo'
            });

            // Update state information.
            // Should now be Phone,Email
            grid.headerCt.move(1, 0);

            grid.saveState();

            Ext.destroy(grid);

            // Create the grids with a new column in at index 0
            // The stateful columns should be in their stateful *order*
            // But the insertion point of the new column must be honoured.
            createGrid({}, {
                columns: newColumns,
                stateful: true,
                stateId: 'foo'
            });

            // The order of the two initial stateful columns should be restored.
            // And the new, previously unknown column "name" which was configured
            // At index 0 should have been inserted at index 0
            expect(grid.headerCt.gridVisibleColumns[0].dataIndex).toBe('name');
            expect(grid.headerCt.gridVisibleColumns[1].dataIndex).toBe('phone');
            expect(grid.headerCt.gridVisibleColumns[2].dataIndex).toBe('email');
        });
    });

    describe('non-column descendants of headerCt', function () {
        describe('headerCt events', function () {
            var headerCt, field;

            beforeEach(function () {
                createGrid(null, {
                    columns: [
                        { header: 'Name',  dataIndex: 'name', width: 100 },
                        { header: 'Email', dataIndex: 'email', flex: 1,
                            items: [{
                                xtype: 'textfield'
                            }]
                        }
                    ]
                });

                headerCt = grid.headerCt;
                field = headerCt.down('textfield');
            });

            afterEach(function () {
                headerCt = field = null;
            });

            it('should not throw in reaction to a delegated keydown event', function () {
                // Note that unfortunately we're testing a private method since that's where it throws.
                jasmine.fireKeyEvent(field.inputEl, 'keydown', 13);

                expect(function () {
                    var e = {
                        getTarget: function () {
                            return field.inputEl.dom;
                        }
                    };

                    headerCt.onHeaderActivate(e);
                }).not.toThrow();
            });

            it('should not react to keydown events delegated from the headerCt', function () {
                // For this test, we'll know that the event was short-circuited b/c the sortable column
                // wasn't sorted.
                var wasCalled = false,
                    fn = function () {
                        wasCalled = true;
                    };

                headerCt.on('sortchange', fn);
                jasmine.fireKeyEvent(field.inputEl, 'keydown', 13);

                expect(wasCalled).toBe(false);
            });
        });
    });
    
    describe("keyboard events", function() {
        beforeEach(function() {
            createGrid();
        });
        
        it("should focus first column header on Home key", function() {
            jasmine.syncPressKey(grid.headerCt.el, 'home');
            jasmine.expectFocused(grid.headerCt.gridVisibleColumns[0]);
        });
        
        it("should focus last column header on End key", function() {
            jasmine.syncPressKey(grid.headerCt.el, 'end');
            jasmine.expectFocused(grid.headerCt.gridVisibleColumns[1]);
        });
    });

    describe('Disabling column hiding', function() {
        beforeEach(function() {
            createGrid();
        });
        
        it('should disable hiding the last visible column', function() {
            var menu,
                col = grid.columns[0],
                colItem,
                colMenu,
                nameItem,
                emailItem;

            // Open the header menu and mouseover the "Columns" item.
            col.triggerEl.show();
            jasmine.fireMouseEvent(col.triggerEl.dom, 'click');
            menu = col.activeMenu;
            colItem = menu.child('#columnItem');
            jasmine.fireMouseEvent(colItem.el.dom, 'mouseover');

            // Wait for the column show/hide menu to appear
            waitsFor(function() {
                colMenu = colItem.menu;
                return colMenu && colMenu.isVisible();
            });
            
            // Hide the "Name" column, leaving only the "Email" column visible
            runs(function() {
                nameItem = colMenu.child('[text=Name]');
                emailItem = colMenu.child('[text=Email]');
                jasmine.fireMouseEvent(nameItem.el.dom, 'click');
            });

            // The "Email" column is the last visible column, so its
            // hide menu check item must be disabled.
            waitsFor(function() {
                return emailItem.disabled;
            });
        });
    });
    
    describe("reconfiguring parent grid", function() {
        it("should enable tabIndex on its tab guards after adding columns", function() {
            createGrid({}, { columns: [] });
            
            expect(grid.headerCt.el).not.toHaveAttr('tabIndex');
            
            grid.reconfigure(null, [
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone', flex: 1, hidden: true }
            ]);
            
            expect(grid.headerCt.tabGuardBeforeEl).toHaveAttr('tabIndex', '0');
            expect(grid.headerCt.tabGuardAfterEl).toHaveAttr('tabIndex', '0');
        });
        
        it("should disable tabIndex on its tab guards after removing all columns", function() {
            createGrid();
            
            expect(grid.headerCt.tabGuardBeforeEl).toHaveAttr('tabIndex', '0');
            expect(grid.headerCt.tabGuardAfterEl).toHaveAttr('tabIndex', '0');
            
            grid.reconfigure(null, []);
            
            expect(grid.headerCt.tabGuardBeforeEl).not.toHaveAttr('tabIndex');
            expect(grid.headerCt.tabGuardAfterEl).not.toHaveAttr('tabIndex');
        });
    });

    describe('grid panel', function(){
        it('should be notified when adding a column header', function(){
            createGrid({}, { columns: [] });

            grid.headerCt.insert(0, [
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone', flex: 1 }
            ]);

            var view = grid.getView(),
                c0_0 = view.getCellByPosition({row:0,column:0}, true),
                c0_1 = view.getCellByPosition({row:0,column:1}, true),
                c0_2 = view.getCellByPosition({row:0,column:2}, true);

            expect(c0_0).not.toBe(false);
            expect(c0_1).not.toBe(false);
            expect(c0_2).not.toBe(false);

        });

        // EXTJS-21400
        it('should be notified when adding a group header', function(){
            createGrid({}, { columns: [] });

            grid.headerCt.insert(0, {header: 'test', columns: [
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone', flex: 1 }
            ]});

            var view = grid.getView(),
                c0_0 = view.getCellByPosition({row:0,column:0}, true),
                c0_1 = view.getCellByPosition({row:0,column:1}, true),
                c0_2 = view.getCellByPosition({row:0,column:2}, true);

            expect(c0_0).not.toBe(false);
            expect(c0_1).not.toBe(false);
            expect(c0_2).not.toBe(false);

        });
    });
});
