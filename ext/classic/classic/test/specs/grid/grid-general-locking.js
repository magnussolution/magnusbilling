/* global Ext, expect, spyOn, jasmine, xit, MockAjaxManager, it */

describe("grid-general-locking", function() {
    var grid, view, store, colRef, navModel,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore = function() {
            proxyStoreLoad.apply(this, arguments);
            if (synchronousLoad) {
                this.flushLoad.apply(this, arguments);
            }
            return this;
        };

    function spyOnEvent(object, eventName, fn) {
        var obj = {
            fn: fn || Ext.emptyFn
        },
        spy = spyOn(obj, "fn");
        object.addListener(eventName, obj.fn);
        return spy;
    }

    beforeEach(function() {
        // Override so that we can control asynchronous loading
        Ext.data.ProxyStore.prototype.load = loadStore;
    });

    afterEach(function() {
        // Undo the overrides.
        Ext.data.ProxyStore.prototype.load = proxyStoreLoad;

        grid = store = Ext.destroy(grid, store);
    });

    function createGrid(cfg) {
        grid = new Ext.grid.Panel(Ext.apply({
            title: 'Test',
            height: 300,
            width: 400,
            renderTo: document.body,
            store: store,
            columns: [{
                text: 'Row',
                dataIndex: 'row',
                locked: true,
                width: 50
            }, {
                text: 'Lorem',
                dataIndex: 'lorem'
            }]
        }, cfg));
        navModel = grid.getNavigationModel();
    }

    describe("Locking configuration", function () {
        beforeEach(function () {
            store = new Ext.data.ArrayStore({
                data: [
                    [ 1, 'Lorem'],
                    [ 2, 'Ipsum'],
                    [ 3, 'Dolor']
                ],
                fields: ['row', 'lorem']
            });
        });

        describe("on init", function () {
            beforeEach(function () {
                createGrid({
                    enableColumnHide: true,
                    rowLines: true,
                    enableColumnMove: false,
                    normalGridConfig: {
                        enableColumnHide: false
                    },
                    lockedGridConfig: {
                        rowLines: false
                    }
                });
            });

            it("should pass down configs to normalGrid", function () {
                expect(grid.enableColumnMove).toBe(false);
                expect(grid.normalGrid.enableColumnMove).toBe(false);
            });

            it("should pass down configs to lockedGrid", function () {
                expect(grid.enableColumnMove).toBe(false);
                expect(grid.lockedGrid.enableColumnMove).toBe(false);
            });

            it("should not pass down configs specified in normalGridConfig", function () {
                expect(grid.enableColumnHide).toBe(true);
                expect(grid.normalGrid.enableColumnHide).toBe(false);
            });

            it("should not pass down configs specified in lockedGridConfig", function () {
                expect(grid.rowLines).toBe(true);
                expect(grid.lockedGrid.rowLines).toBe(false);
            });
        });

        describe("when stateful", function () {
            afterEach(function () {
                Ext.state.Manager.set(grid.getStateId(), null);
            });

            describe("retaining state across page loads", function () {
                function makeGrid(stateId) {
                    createGrid({
                        columns: [{
                            text: 'Row',
                            dataIndex: 'row',
                            locked: true,
                            width: 50
                        }, {
                            text: 'Lorem',
                            stateId: stateId || null,
                            dataIndex: 'lorem'
                        }],
                        stateful: true,
                        stateId: 'foo'
                    });
                    view = grid.getView();
                    colRef = grid.getColumnManager().getColumns();

                }

                function saveAndRecreate(stateId) {
                    grid.saveState();
                    Ext.destroy(grid);

                    // After page refresh.
                    makeGrid(stateId);
                }

                function testStateId(stateId) {
                    var maybe = !!stateId ? '' : 'not';

                    describe("when columns are " + maybe + ' configured with a stateId', function () {
                        function testLockingPartner(which) {
                            describe(which + ' locking partner', function () {
                                var partner = which + 'Grid';

                                beforeEach(function () {
                                    makeGrid(stateId);
                                });

                                it("should retain column width", function () {
                                    grid[partner].columnManager.getColumns()[0].setWidth(250);
                                    saveAndRecreate(stateId);

                                    expect(grid[partner].columnManager.getColumns()[0].getWidth()).toBe(250);
                                });

                                it("should retain column visibility", function () {
                                    grid[partner].columnManager.getColumns()[0].hide();
                                    saveAndRecreate(stateId);

                                    expect(grid[partner].columnManager.getColumns()[0].hidden).toBe(true);
                                });

                                it("should retain the column sort", function () {
                                    var column = grid[partner].columnManager.getColumns()[0];

                                    column.sort();
                                    expect(column.sortState).toBe('ASC');

                                    // Let's sort again.
                                    column.sort();

                                    saveAndRecreate(stateId);

                                    expect(grid[partner].columnManager.getColumns()[0].sortState).toBe('DESC');
                                });

                                it("should restore state when columns are moved between sides", function() {
                                    grid.unlock(colRef[0], 0);
                                    colRef[0].sort();
                                    colRef[0].setWidth(100);
                                    colRef[1].setWidth(200);

                                    saveAndRecreate(stateId);

                                    expect(colRef[0].dataIndex).toBe('row');
                                    expect(colRef[0].getWidth()).toBe(100);
                                    expect(colRef[0].sortState).toBe('ASC');
                                    expect(colRef[1].dataIndex).toBe('lorem');
                                    expect(colRef[1].getWidth()).toBe(200);
                                });
                            });
                        }

                        testLockingPartner('locked');
                        testLockingPartner('normal');
                    });
                }

                testStateId('theOwlHouse');
                testStateId(null);
            });
        });
        
        describe('border layout locking', function() {
            var GridEventModel = Ext.define(null, {
                extend: 'Ext.data.Model',
                fields: [
                    'field1',
                    'field2',
                    'field3',
                    'field4',
                    'field5',
                    'field6',
                    'field7',
                    'field8',
                    'field9',
                    'field10'
                ]
            }),
            lockedGrid, lockedView,
            normalGrid, normalView;

            function makeGrid(lockedColumnCount, cfg, lockedGridConfig, normalGridConfig) {               
                var data = [],
                    defaultCols = [],
                    i;
                    
                for (i = 1; i <= 10; ++i) {
                    defaultCols.push({
                        text: 'F' + i,
                        dataIndex: 'field' + i,
                        locked: (i <= lockedColumnCount)
                    });
                }

                for (i = 1; i <= 500; ++i) {
                    data.push({
                        field1: i + '.' + 1,
                        field2: i + '.' + 2,
                        field3: i + '.' + 3,
                        field4: i + '.' + 4,
                        field5: i + '.' + 5,
                        field6: i + '.' + 6,
                        field7: i + '.' + 7,
                        field8: i + '.' + 8,
                        field9: i + '.' + 9,
                        field10: i + '.' + 10
                    });
                }
                
                store = new Ext.data.Store({
                    model: GridEventModel,
                    data: data
                });
                
                grid = new Ext.grid.Panel(Ext.apply({
                    columns: defaultCols,
                    store: store,
                    width: 1000,
                    height: 500,
                    viewConfig: {
                        mouseOverOutBuffer: 0
                    },
                    layout: 'border',
                    lockedGridConfig: Ext.apply({
                        collapsible: true,
                        split: true
                    }, lockedGridConfig),
                    normalGridConfig: normalGridConfig,
                    renderTo: Ext.getBody()
                }, cfg));
                view = grid.getView();
                lockedGrid = grid.lockedGrid;
                lockedView = lockedGrid.getView();
                normalGrid = grid.normalGrid;
                normalView = normalGrid.getView();
            }

            it('should be able to lock columns', function() {
                makeGrid(0, {
                    enableLocking: true
                });
                expect(grid.lockedGrid.isVisible()).toBe(false);

                // Because the locked side is collapsible, it gets a header with the collapse tool
                expect(grid.normalGrid.header).not.toBeUndefined();

                grid.lock(grid.columns[0]);

                // Because the locked side is collapsible, it gets a header with the collapse tool
                expect(grid.lockedGrid.header).not.toBeUndefined();

                // Width should exactly shrinkwrap the columns
                expect(grid.lockedGrid.getWidth()).toBe(grid.lockedGrid.headerCt.getTableWidth() + grid.lockedGrid.gridPanelBorderWidth);

                grid.lockedGrid.collapse();

                waitsForSpy(spyOnEvent(lockedGrid, 'collapse'));

                runs(function() {
                    jasmine.fireMouseEvent(grid.lockedGrid.placeholder.el, 'click');
                });

                waitsForSpy(spyOnEvent(lockedGrid, 'float'));

                runs(function() {
                    grid.lock(grid.columns[1]);
                    
                    grid.lockedGrid.expand();
                });
                waitsForSpy(spyOnEvent(lockedGrid, 'expand'));

                runs(function() {
                    // Width should exactly shrinkwrap the columns
                    expect(grid.lockedGrid.getWidth()).toBe(grid.lockedGrid.headerCt.getTableWidth() + grid.lockedGrid.gridPanelBorderWidth);

                    grid.unlock(grid.columns[1]);

                    // Width should exactly shrinkwrap the columns
                    expect(grid.lockedGrid.getWidth()).toBe(grid.lockedGrid.headerCt.getTableWidth() + grid.lockedGrid.gridPanelBorderWidth);

                    // Now test column moving in locked side when floated
                    grid.lockedGrid.headerCt.moveBefore(grid.columns[1], grid.columns[0]);

                    // Width should exactly shrinkwrap the columns
                    expect(grid.lockedGrid.getWidth()).toBe(grid.lockedGrid.headerCt.getTableWidth() + grid.lockedGrid.gridPanelBorderWidth);

                    grid.lockedGrid.headerCt.moveBefore(grid.columns[0], grid.columns[1]);

                    // Width should exactly shrinkwrap the columns
                    expect(grid.lockedGrid.getWidth()).toBe(grid.lockedGrid.headerCt.getTableWidth() + grid.lockedGrid.gridPanelBorderWidth);
                });
            });
            
        });
    });

    describe('tabbing between sides', function() {
        it('should move to the same row on the other side', function() {
            store = new Ext.data.ArrayStore({
                data: [
                    [ 1, 'Lorem'],
                    [ 2, 'Ipsum'],
                    [ 3, 'Dolor']
                ],
                fields: ['row', 'lorem']
            });

            createGrid();

            grid.lockedGrid.view.focus();

            waitsFor(function() {
                return grid.lockedGrid.view.containsFocus;
            });
            runs(function() {
                jasmine.simulateTabKey(Ext.Element.getActiveElement(), true);
            });
            waitsFor(function() {
                return grid.normalGrid.view.containsFocus;
            });
            runs(function() {
                var p = navModel.getPosition();

                // Tabbed across the boundary
                expect(p.view === grid.normalGrid.view);
                expect(p.rowIdx).toBe(0);
                expect(p.colIdx).toBe(0);
            });
        });
    });
});
