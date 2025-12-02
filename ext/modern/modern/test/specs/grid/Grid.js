/* global Ext, jasmine, expect */

describe("Ext.grid.Grid", function() {

    var Model = Ext.define(null, {
        extend: 'Ext.data.Model',
        fields: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9']
    });

    var TestGrid = Ext.define(null, {
        extend: 'Ext.grid.Grid',

        // This method forces a synchronous layout of the grid to make testing easier
        $testRefresh: function() {
            var container = this.container;
            this.onContainerResize(container, { height: container.element.getHeight() });
        }
    });

    var grid, store, colMap;

    function spyOnEvent(object, eventName, fn) {
        var obj = {
            fn: fn || Ext.emptyFn
        },
        spy = spyOn(obj, "fn");
        object.addListener(eventName, obj.fn);
        return spy;
    }

    function makeStore(rows) {
        var data = [],
            i;

        if (rows) {
            if (typeof rows !== 'number') {
                data = rows;
            }
        } else if (rows !== 0) {
            rows = 20;
        }

        for (i = 1; i <= rows; ++i) {
            data.push({
                f1: 'f1' + i,
                f2: 'f2' + i,
                f3: 'f3' + i,
                f4: 'f4' + i,
                f5: 'f5' + i,
                f6: 'f6' + i,
                f7: 'f7' + i,
                f8: 'f8' + i,
                f9: 'f9' + i
            });
        }

        store = new Ext.data.Store({
            model: Model,
            data: data
        });
    }

    afterEach(function() {
        store = grid = Ext.destroy(grid, store);
    });

    function makeGrid(columns, data, gridOptions, specOptions) {
        gridOptions = gridOptions || {};
        specOptions = specOptions || {};

        if (!specOptions.preventStore && !gridOptions.store) {
            makeStore(data);
        }

        if (!columns && !specOptions.preventColumns) {
            columns = [{
                dataIndex: 'f1',
                width: 100,
                text: 'F1',
                itemId: 'colf1'
            }, {
                dataIndex: 'f2',
                width: 100,
                text: 'F2',
                itemId: 'colf2'
            }, {
                dataIndex: 'f3',
                width: 100,
                text: 'F3',
                itemId: 'colf3'
            }, {
                dataIndex: 'f4',
                width: 100,
                text: 'F4',
                itemId: 'colf4'
            }, {
                dataIndex: 'f5',
                width: 100,
                text: 'F5',
                itemId: 'colf5'
            }];
        }

        if (columns && !specOptions.preventColumns) {
            columns.forEach(function(col, i) {
                col.dataIndex = col.dataIndex || 'f' + (i + 1);
            });
        }

        grid = new TestGrid(Ext.apply({
            width: 600,
            height: 1200,
            store: store,
            columns: columns
        }, gridOptions));
        setColMap();
    }

    function setColMap() {
        colMap = {};
        grid.query('column').forEach(function(col) {
            colMap[col.getItemId()] = col;
        });
    }

    function renderWithRefresh(el) {
        grid.renderTo(el || Ext.getBody());
        grid.$testRefresh();
    }

    // Force any flex sizes to be published internally
    function refreshColSizes() {
        var cols = grid.query('column');
        Ext.event.publisher.ElementSize.instance.syncRefresh(cols);
    }

    function resizeColumn(column, by) {
        var el = column.resizerElement,
            colBox = column.el.getBox(),
            fromMx = colBox.x + colBox.width - 2,
            fromMy = colBox.y + colBox.height / 2;

        // Mousedown on the header to drag
        Ext.testHelper.touchStart(el, {x: fromMx, y: fromMy});

        // Move to resize
        Ext.testHelper.touchMove(el, {x: fromMx + by, y: fromMy});
        Ext.testHelper.touchEnd(el, {x: fromMx + by, y: fromMy});
    }

    // In this method we don't test for exact sizing, rather
    // that the cells match the column sizes. This is because the
    // way the native browser flexing behaviour works, for example
    // 3 items, flexed as [{flex: 1}, {flex: 1}, {flex: 2}] in a 600px
    // container will be 155.00~px, 155.00~px, 289.000~px
    function expectSizes() {
        var columns = grid.query('column'),
            len = columns.length,
            colWidths = [],
            cols = [],
            i, col;

        refreshColSizes();                    
        for (i = 0; i < len; ++i) {
            col = columns[i];
            cols.push(col);
            colWidths.push(col.element.getWidth(false, true));
        }

        store.each(function(rec) {
            var row = grid.getItem(rec);

            cols.forEach(function(col, idx) {
                var w = row.getCellByColumn(col).element.getWidth(false, true);
                expect(w).toBeApprox(colWidths[idx]);
            });
        });
    }

    function getCells(col) {
        var cells = [];

        refreshColSizes();
        store.each(function(rec) {
            var row = grid.getItem(rec);
            cells.push(row.getCellByColumn(col));
        });
        return cells;
    }

    describe("columns", function() {
        it("should be able to be configured with no columns", function() {
            expect(function() {
                makeGrid(null, null, null, {
                    preventColumns: true
                });
            }).not.toThrow();
        });

        describe("hideHeaders", function() {
            describe("the header", function() {
                describe("at construction", function() {
                    it("should be visible by default", function() {
                        makeGrid();
                        renderWithRefresh();
                        expect(grid.getHeaderContainer().getHeight()).toBeNull();
                    });

                    it("should be hidden if configured as hidden", function() {
                        makeGrid(null, null, {
                            hideHeaders: true
                        });
                        renderWithRefresh();
                        expect(grid.getHeaderContainer().getHeight()).toBe(0);
                    });
                });

                describe("after construction", function() {
                    it("should be able to hide headers", function() {
                        makeGrid();
                        renderWithRefresh();
                        var ct = grid.getHeaderContainer();
                        expect(ct.getHeight()).toBeNull();
                        grid.setHideHeaders(true);
                        expect(ct.getHeight()).toBe(0);
                    });

                    it("should be able to show headers", function() {
                        makeGrid(null, null, {
                            hideHeaders: true
                        });
                        renderWithRefresh();
                        var ct = grid.getHeaderContainer();
                        expect(ct.getHeight()).toBe(0);
                        grid.setHideHeaders(false);
                        expect(ct.getHeight()).toBeNull();
                    });

                    it("should restore a configured height when starting as hidden", function() {
                        makeGrid(null, null, {
                            hideHeaders: true,
                            headerContainer: {
                                height: 100
                            }
                        });
                        renderWithRefresh();
                        var ct = grid.getHeaderContainer();
                        expect(ct.getHeight()).toBe(0);
                        grid.setHideHeaders(false);
                        expect(ct.getHeight()).toBe(100);
                    });

                    it("should restore a configured height when hiding", function() {
                        makeGrid(null, null, {
                            headerContainer: {
                                height: 100
                            }
                        });
                        renderWithRefresh();
                        var ct = grid.getHeaderContainer();
                        expect(ct.getHeight()).toBe(100);
                        grid.setHideHeaders(true);
                        expect(ct.getHeight()).toBe(0);
                        grid.setHideHeaders(false);
                        expect(ct.getHeight()).toBe(100);
                    });
                });
            });

            describe("sizing of cells when hidden", function() {
                it("should size cells correctly initially", function() {
                    makeGrid([{
                        width: 300
                    }, {
                        flex: 1
                    }, {
                        width: 150
                    }], null, {
                        hideHeaders: true
                    });
                    renderWithRefresh();
                    expectSizes();
                });

                it("should size correctly when adding columns", function() {
                    makeGrid([{
                        width: 100
                    }, {
                        flex: 1
                    }], null, {
                        hideHeaders: true
                    });
                    renderWithRefresh();
                    expectSizes();
                    grid.addColumn({width: 100});
                    grid.addColumn({flex: 1});
                    expectSizes();
                });

                it("should size correctly when removing columns", function() {
                    makeGrid([{
                        width: 100,
                        itemId: 'colf1'
                    }, {
                        flex: 1
                    }], null, {
                        hideHeaders: true
                    });
                    renderWithRefresh();
                    expectSizes();
                    grid.removeColumn(colMap.colf1);
                    expectSizes();
                });

                it("should size correctly when showing columns", function() {
                    makeGrid([{
                        width: 100
                    }, {
                        flex: 1
                    }, {
                        width: 100,
                        itemId: 'colf3',
                        hidden: true
                    }, {
                        flex: 1,
                        itemId: 'colf4',
                        hidden: true
                    }], null, {
                        hideHeaders: true
                    });
                    renderWithRefresh();
                    expectSizes();
                    colMap.colf3.show();
                    colMap.colf4.show();
                    expectSizes();
                });

                it("should size correctly when hiding columns", function() {
                    makeGrid([{
                        width: 100
                    }, {
                        flex: 1
                    }, {
                        width: 100,
                        itemId: 'colf3'
                    }, {
                        flex: 1,
                        itemId: 'colf4'
                    }], null, {
                        hideHeaders: true
                    });
                    renderWithRefresh();
                    expectSizes();
                    colMap.colf3.hide();
                    colMap.colf4.hide();
                    expectSizes();
                });

                it("should size correctly when resizing cells", function() {
                    makeGrid([{
                        flex: 1,
                        itemId: 'colf1'
                    }, {
                        width: 200,
                        itemId: 'colf2'
                    }, {
                        flex: 1
                    }]);
                    renderWithRefresh();
                    expectSizes();
                    colMap.colf1.setFlex(2);
                    colMap.colf2.setWidth(50);
                    expectSizes();
                });
            });
        });

        describe("align", function() {
            function expectAlignCls(col, cls) {
                var cells = getCells(col);
                cells.forEach(function(cell) {
                    expect(cell.element).toHaveCls(cls);
                });
            }

            it("should add the column align class to cells", function() {
                makeGrid([{
                    align: 'left',
                    itemId: 'colf1'
                }, {
                    align: 'center',
                    itemId: 'colf2'
                }, {
                    align: 'right',
                    itemId: 'colf3'
                }]);
                renderWithRefresh();

                expectAlignCls(colMap.colf1, 'x-align-left');
                expectAlignCls(colMap.colf2, 'x-align-center');
                expectAlignCls(colMap.colf3, 'x-align-right');
            });

            it("should give precedence to the cell cfg", function() {
                makeGrid([{
                    align: 'center',
                    itemId: 'colf1',
                    cell: {
                        align: 'right'
                    }
                }]);
                renderWithRefresh();
                expectAlignCls(colMap.colf1, 'x-align-right');
            });
        });

        describe("resizable", function() {
            describe("visibility", function() {
                it("should not show the resizer if the grid doesn't have the plugin", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: true
                    }]);
                    renderWithRefresh();

                    expect(colMap.colf1.resizerElement.isVisible()).toBe(false);
                });

                it("should not show the resizer with resizable: false", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: false
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });
                    renderWithRefresh();

                    expect(colMap.colf1.resizerElement.isVisible()).toBe(false);
                });

                it("should show the resizer with resizable: true and the plugin", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: true
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });
                    renderWithRefresh();

                    expect(colMap.colf1.resizerElement.isVisible()).toBe(true);
                });

                it("should be able to toggle the resizer on", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: false
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });
                    renderWithRefresh();

                    var col = colMap.colf1;

                    expect(col.resizerElement.isVisible()).toBe(false);
                    col.setResizable(true);
                    expect(col.resizerElement.isVisible()).toBe(true);
                });

                it("should be able to toggle the resizer off", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: true
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });
                    renderWithRefresh();

                    var col = colMap.colf1;

                    expect(col.resizerElement.isVisible()).toBe(true);
                    col.setResizable(false);
                    expect(col.resizerElement.isVisible()).toBe(false);
                });
                it('should not fire drag events on headercontainer during resize', function() {
                    makeGrid([{
                        itemId: 'colf1',
                        resizable: true,
                        width: 100
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });
                    renderWithRefresh();

                    var col = colMap.colf1,
                        colWidth = col.getWidth(),
                        dragSpy = spyOnEvent(grid.getHeaderContainer().el, 'drag');

                    resizeColumn(col, 10);
                    runs(function() {
                        expect(dragSpy).not.toHaveBeenCalled();
                    });
                });

                it("should work with a flexed column", function() {
                    makeGrid([{
                        itemId: 'colf1',
                        flex: 1,
                        resizable: true
                    }], null, {
                        plugins: [{
                            type: 'columnresizing'
                        }]
                    });
                    renderWithRefresh();

                    var col = colMap.colf1;

                    expect(col.resizerElement.isVisible()).toBe(true);
                    col.setResizable(false);
                    expect(col.resizerElement.isVisible()).toBe(false);
                });
            });
        });

        describe("adding columns", function() {
            describe("events", function() {
                it("should not fire events during construction", function() {
                    var spy = jasmine.createSpy();
                    makeGrid(null, null, {
                        listeners: {
                            columnadd: spy
                        }
                    });
                    renderWithRefresh();
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    grid.on('columnadd', spy);
                    col = grid.addColumn({
                        dataIndex: 'f9'
                    });
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                    expect(spy.mostRecentCall.args[2]).toBe(5);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    renderWithRefresh();
                    grid.on('columnadd', spy);
                    col = grid.addColumn({
                        dataIndex: 'f9'
                    });
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                    expect(spy.mostRecentCall.args[2]).toBe(5);
                });
            });
        });

        describe("inserting columns", function() {
            describe("events", function() {
                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    grid.on('columnadd', spy);
                    col = grid.insertColumn(0, {
                        dataIndex: 'f9'
                    });
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                    expect(spy.mostRecentCall.args[2]).toBe(0);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    renderWithRefresh();
                    grid.on('columnadd', spy);
                    col = grid.insertColumn(0, {
                        dataIndex: 'f9'
                    });
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                    expect(spy.mostRecentCall.args[2]).toBe(0);
                });
            });
        });

        describe("removing columns", function() {
            describe("events", function() {
                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    grid.on('columnremove', spy);
                    col = grid.down('#colf1');
                    grid.removeColumn(col);
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(null, null);
                    renderWithRefresh();
                    grid.on('columnremove', spy);
                    col = grid.down('#colf1');
                    grid.removeColumn(col);
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });
            });
        });

        describe("column size", function() {
            describe("default width", function() {
                describe("subclassed column", function() {
                    function defineIt(cfg) {
                        Ext.define('spec.CustomColumn', Ext.apply(cfg, {
                            extend: 'Ext.grid.column.Column',
                            xtype: 'customcolumn'
                        }));
                    }

                    afterEach(function() {
                        Ext.undefine('spec.CustomColumn');
                    });

                    it("should not apply the defaultWidth if a width is specified", function() {
                        defineIt({
                            width: 200
                        });
                        makeGrid([{
                            xtype: 'customcolumn',
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(200);
                    });

                    it("should not apply the defaultWidth if a flex is specified", function() {
                        defineIt({
                            flex: 1
                        });
                        makeGrid([{
                            xtype: 'customcolumn',
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBeNull();
                    });

                    it("should apply the defaultWidth if there is no width/flex", function() {
                        defineIt({});
                        makeGrid([{
                            xtype: 'customcolumn',
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(100);
                    });
                });

                describe("instance column", function() {
                    it("should not apply the defaultWidth if a width is specified", function() {
                        makeGrid([{
                            width: 200,
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(200);
                    });

                    it("should not apply the defaultWidth if a flex is specified", function() {
                        makeGrid([{
                            flex: 1,
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBeNull();
                    });

                    it("should apply the defaultWidth if there is no width/flex", function() {
                        makeGrid([{
                            itemId: 'colf1'
                        }]);
                        expect(colMap.colf1.getWidth()).toBe(100);
                    });
                });
            });

            describe("cell sizing", function() {
                describe("at construction", function() {
                    describe("widths", function() {
                        describe("fixed width only", function() {
                            it("should render the cells to the correct size", function() {
                                makeGrid([{
                                    width: 100,
                                    itemId: 'colf1',
                                    dataIndex: 'f1'
                                }, {
                                    width: 200,
                                    itemId: 'colf2',
                                    dataIndex: 'f2'
                                }, {
                                    width: 350,
                                    itemId: 'colf3',
                                    dataIndex: 'f3'
                                }]);
                                renderWithRefresh();
                                expectSizes();
                            });
                        });

                        describe("flex only", function() {
                            it("should distribute sizes based on the column flex", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1',
                                    dataIndex: 'f1'
                                }, {
                                    flex: 1,
                                    itemId: 'colf2',
                                    dataIndex: 'f2'
                                }, {
                                    flex: 2,
                                    itemId: 'colf3',
                                    dataIndex: 'f3'
                                }]);
                                renderWithRefresh();
                                expectSizes();    
                            });
                        });

                        describe("fixed + flex width", function() {
                            it("should set fixed sizes then distribute flexes", function() {
                                makeGrid([{
                                    width: 400,
                                    itemId: 'colf1',
                                    dataIndex: 'f1'
                                }, {
                                    flex: 1,
                                    itemId: 'colf2',
                                    dataIndex: 'f2'
                                }, {
                                    flex: 1,
                                    itemId: 'colf3',
                                    dataIndex: 'f3'
                                }]);
                                renderWithRefresh();
                                expectSizes();    
                            });
                        });

                        describe("events", function() {
                            it("should not fire events", function() {
                                var spy = jasmine.createSpy();
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 300
                                }], null, {
                                    listeners: {
                                        columnresize: spy
                                    }
                                });
                                renderWithRefresh();
                                expect(spy).not.toHaveBeenCalled();
                            });
                        });
                    });

                    describe("column visibility", function() {
                        it("should set the cells not to be visible when hidden", function() {
                            makeGrid([{
                                flex: 1,
                                itemId: 'colf1'
                            }, {
                                width: 200,
                                itemId: 'colf2'
                            }, {
                                flex: 1,
                                itemId: 'colf3',
                                hidden: true
                            }, {
                                width: 200,
                                itemId: 'colf4',
                                hidden: true
                            }]);
                            renderWithRefresh();
                            expectSizes();

                            expect(colMap.colf3.getComputedWidth()).toBe(0);
                            expect(colMap.colf4.getComputedWidth()).toBe(0);

                            var c1 = colMap.colf1.getComputedWidth(),
                                c2 = colMap.colf2.getComputedWidth();

                            getCells(colMap.colf1).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(false);
                                expect(cell.element.isVisible()).toBe(true);
                                expect(cell.getComputedWidth()).toBe(c1);
                            });

                            getCells(colMap.colf2).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(false);
                                expect(cell.element.isVisible()).toBe(true);
                                expect(cell.getComputedWidth()).toBe(c2);
                            });

                            getCells(colMap.colf3).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(true);
                                expect(cell.element.isVisible()).toBe(false);
                                expect(cell.getComputedWidth()).toBe(0);
                            });

                            getCells(colMap.colf4).forEach(function(cell) {
                                expect(cell.getHidden()).toBe(true);
                                expect(cell.element.isVisible()).toBe(false);
                                expect(cell.getComputedWidth()).toBe(0);
                            });
                        });

                        describe("events", function() {
                            it("should not fire events", function() {
                                var spy = jasmine.createSpy();

                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200
                                }, {
                                    flex: 1,
                                    itemId: 'colf3',
                                    hidden: true
                                }, {
                                    width: 200,
                                    itemId: 'colf4',
                                    hidden: true
                                }], null, {
                                    listeners: {
                                        columnresize: spy
                                    }
                                });
                                renderWithRefresh();
                                expectSizes();
                                expect(spy).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe("dynamic", function() {
                    describe("adding columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                grid.addColumn({
                                    width: 100
                                });
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        width: 300
                                    });
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        width: 300
                                    });
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                grid.addColumn({
                                    flex: 1
                                });
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        flex: 1
                                    });
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.addColumn({
                                        flex: 1
                                    });
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("removing columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                grid.removeColumn(colMap.colf2);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf1);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf2);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                grid.removeColumn(colMap.colf1);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf3);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    grid.removeColumn(colMap.colf1);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf3);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf3.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("hiding columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf2.hide();
                                expectSizes();
                            });

                            it("should hide the cells", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf2.hide();
                                getCells(colMap.colf2).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(true);
                                    expect(cell.element.isVisible()).toBe(false);
                                    expect(cell.getComputedWidth()).toBe(0);
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.hide();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf2.hide();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf1.hide();
                                expectSizes();
                            });

                            it("should hide the cells", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf1.hide();
                                expectSizes();
                                getCells(colMap.colf1).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(true);
                                    expect(cell.element.isVisible()).toBe(false);
                                    expect(cell.getComputedWidth()).toBe(0);
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf3.hide();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.hide();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf3);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf3.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("showing columns", function() {
                        describe("with a fixed width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2',
                                    hidden: true
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf2.show();
                                expectSizes();
                            });

                            it("should show the cells", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2',
                                    hidden: true
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf2.show();
                                expectSizes();
                                var w = colMap.colf2.getComputedWidth();
                                getCells(colMap.colf2).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(false);
                                    expect(cell.element.isVisible()).toBe(true);
                                    expect(cell.getComputedWidth()).toBe(w);
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1',
                                        hidden: true
                                    }, {
                                        width: 200
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.show();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2',
                                        hidden: true
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf2.show();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("with a flex width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1',
                                    hidden: true
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf1.show();
                                expectSizes();
                            });

                            it("should hide the cells", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1',
                                    hidden: true
                                }, {
                                    width: 200
                                }, {
                                    flex: 1
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf1.show();
                                expectSizes();
                                var w = colMap.colf1.getComputedWidth();
                                getCells(colMap.colf1).forEach(function(cell) {
                                    expect(cell.getHidden()).toBe(false);
                                    expect(cell.element.isVisible()).toBe(true);
                                    expect(cell.getComputedWidth()).toBe(w);
                                });
                            });

                            describe("events", function() {
                                it("should not fire events with fixed width columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        width: 100
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3',
                                        hidden: true
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf3.show();
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire resize events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();

                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1',
                                        hidden: true
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();

                                    grid.on('columnresize', spy);
                                    colMap.colf1.show();
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf3);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf3.getComputedWidth());
                                });
                            });
                        });
                    });

                    describe("changing size", function() {
                        describe("from width -> width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1
                                }, {
                                    width: 200,
                                    itemId: 'colf2'
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf2.setWidth(300);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should fire an event for the resized column with fixed widths", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        width: 200
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf2.setWidth(300);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf2);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf2.getComputedWidth());
                                });

                                it("should fire an event for the resized column and affected flex columns", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 200,
                                        itemId: 'colf2'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf2.setWidth(300);
                                    expectSizes();
                                    expect(spy.callCount).toBe(2);

                                    expect(spy.calls[0].args[0]).toBe(grid);
                                    expect(spy.calls[0].args[1]).toBe(colMap.colf2);
                                    expect(spy.calls[0].args[2]).toBe(colMap.colf2.getComputedWidth());

                                    expect(spy.calls[1].args[0]).toBe(grid);
                                    expect(spy.calls[1].args[1]).toBe(colMap.colf1);
                                    expect(spy.calls[1].args[2]).toBe(colMap.colf1.getComputedWidth());
                                });
                            });
                        });

                        describe("from flex -> flex", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf1.setFlex(2);
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should not fire events with only fixed widths", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        width: 200
                                    }, {
                                        width: 200
                                    }, {
                                        flex: 1,
                                        itemId: 'colf3'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf3.setFlex(2);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should not fire an event if changing the flex causes the width to stay the same", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(2);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire an event for the resized column and affected flex columns", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        flex: 2,
                                        itemId: 'colf2'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(3);
                                    expectSizes();
                                    expect(spy.callCount).toBe(2);

                                    expect(spy.calls[0].args[0]).toBe(grid);
                                    expect(spy.calls[0].args[1]).toBe(colMap.colf1);
                                    expect(spy.calls[0].args[2]).toBe(colMap.colf1.getComputedWidth());

                                    expect(spy.calls[1].args[0]).toBe(grid);
                                    expect(spy.calls[1].args[1]).toBe(colMap.colf2);
                                    expect(spy.calls[1].args[2]).toBe(colMap.colf2.getComputedWidth());
                                });
                            });
                        });

                        describe("from width -> flex", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    width: 100,
                                    itemId: 'colf1'
                                }, {
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf1.setFlex(2);
                                expect(colMap.colf1.getWidth()).toBeNull();
                                expectSizes();
                            });

                            describe("events", function() {
                                it("should fire events for the changed column with fixed widths", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        width: 100,
                                        itemId: 'colf1'
                                    }, {
                                        width: 400
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(1);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                });

                                it("should not fire an event if the width does not change", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        width: 300,
                                        itemId: 'colf1'
                                    }, {
                                        width: 300
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(1);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire events for other affected flex columns", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        width: 200,
                                        itemId: 'colf1'
                                    }, {
                                        flex: 1,
                                        itemId: 'colf2'
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setFlex(1);
                                    expectSizes();
                                    expect(spy.callCount).toBe(2);

                                    expect(spy.calls[0].args[0]).toBe(grid);
                                    expect(spy.calls[0].args[1]).toBe(colMap.colf1);
                                    expect(spy.calls[0].args[2]).toBe(colMap.colf1.getComputedWidth());

                                    expect(spy.calls[1].args[0]).toBe(grid);
                                    expect(spy.calls[1].args[1]).toBe(colMap.colf2);
                                    expect(spy.calls[1].args[2]).toBe(colMap.colf2.getComputedWidth());
                                });
                            });
                        });

                        describe("from flex -> width", function() {
                            it("should size cells correctly", function() {
                                makeGrid([{
                                    flex: 1,
                                    itemId: 'colf1'
                                }, {
                                    flex: 1
                                }, {
                                    width: 200
                                }]);
                                renderWithRefresh();
                                expectSizes();
                                colMap.colf1.setWidth(200);
                                expect(colMap.colf1.getFlex()).toBeNull();
                                expectSizes();
                                expect(colMap.colf1.el.getWidth()).toBe(200);
                            });

                            describe("events", function() {
                                it("should fire events for the changed column with fixed widths", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 400
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setWidth(100);
                                    expectSizes();
                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                                    expect(spy.mostRecentCall.args[1]).toBe(colMap.colf1);
                                    expect(spy.mostRecentCall.args[2]).toBe(colMap.colf1.getComputedWidth());
                                expect(colMap.colf1.el.getWidth()).toBe(100);
                                });

                                it("should not fire an event if the width does not change", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        width: 300
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setWidth(300);
                                    expectSizes();
                                    expect(spy).not.toHaveBeenCalled();
                                });

                                it("should fire events for affected flex columns", function() {
                                    var spy = jasmine.createSpy();
                                    makeGrid([{
                                        flex: 1,
                                        itemId: 'colf1'
                                    }, {
                                        flex: 1,
                                        itemId: 'colf2'
                                    }, {
                                        width: 100
                                    }]);
                                    renderWithRefresh();
                                    expectSizes();
                                    grid.on('columnresize', spy);
                                    colMap.colf1.setWidth(400);
                                    expectSizes();
                                    expect(spy.callCount).toBe(2);
                                    expect(colMap.colf1.el.getWidth()).toBe(400);

                                    expect(spy.calls[0].args[0]).toBe(grid);
                                    expect(spy.calls[0].args[1]).toBe(colMap.colf1);
                                    expect(spy.calls[0].args[2]).toBe(colMap.colf1.getComputedWidth());

                                    expect(spy.calls[1].args[0]).toBe(grid);
                                    expect(spy.calls[1].args[1]).toBe(colMap.colf2);
                                    expect(spy.calls[1].args[2]).toBe(colMap.colf2.getComputedWidth());
                                });
                            });
                        });
                    });
                });
            });
        });

        describe("showing columns", function() {
            var colDefaults;

            beforeEach(function() {
                colDefaults = [{
                    dataIndex: 'f1',
                    text: 'F1',
                    width: 100,
                    itemId: 'colf1'
                }, {
                    dataIndex: 'f2',
                    text: 'F2',
                    width: 100,
                    itemId: 'colf2',
                    hidden: true
                }];
            });

            afterEach(function() {
                colDefaults = null;
            });

            describe("events", function() {
                it("should not fire events during construction", function() {
                    var spy = jasmine.createSpy();
                    makeGrid(colDefaults, null, {
                        listeners: {
                            columnshow: spy
                        }
                    });
                    renderWithRefresh();
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    grid.on('columnshow', spy);
                    col = grid.down('#colf2');
                    col.show();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    renderWithRefresh();
                    grid.on('columnshow', spy);
                    col = grid.down('#colf2');
                    col.show();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });
            });
        });

        describe("hiding columns", function() {
            var colDefaults;

            beforeEach(function() {
                colDefaults = [{
                    dataIndex: 'f1',
                    text: 'F1',
                    width: 100,
                    itemId: 'colf1'
                }, {
                    dataIndex: 'f2',
                    text: 'F2',
                    width: 100,
                    itemId: 'colf2',
                    hidden: true
                }];
            });

            afterEach(function() {
                colDefaults = null;
            });

            describe("events", function() {
                it("should not fire events during construction", function() {
                    var spy = jasmine.createSpy();
                    makeGrid(colDefaults, null, {
                        listeners: {
                            columnhide: spy
                        }
                    });
                    renderWithRefresh();
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should fire after construction before painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    grid.on('columnhide', spy);
                    col = grid.down('#colf1');
                    col.hide();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });

                it("should fire after construction after painting", function() {
                    var spy = jasmine.createSpy(),
                        col;

                    makeGrid(colDefaults, null);
                    renderWithRefresh();
                    grid.on('columnhide', spy);
                    col = grid.down('#colf1');
                    col.hide();
                    expect(spy.callCount).toBe(1);
                    expect(spy.mostRecentCall.args[0]).toBe(grid);
                    expect(spy.mostRecentCall.args[1]).toBe(col);
                });
            });
        });
    });

    describe("destroy", function() {
        describe("events", function() {
            it("should not fire column remove events", function() {
                var spy = jasmine.createSpy();
                makeGrid();
                renderWithRefresh();
                grid.on('columnremove', spy);
                grid.destroy();
                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe("component cleanup", function() {
            describe("before rendering", function() {
                it("should destroy all created components", function() {
                    var count = Ext.ComponentManager.getCount();
                    makeGrid();
                    grid.destroy();
                    expect(Ext.ComponentManager.getCount()).toBe(count);
                });
            });

            describe("after painting", function() {
                it("should destroy all created components", function() {
                    var count = Ext.ComponentManager.getCount();
                    makeGrid();
                    grid.renderTo(Ext.getBody());
                    grid.destroy();
                    expect(Ext.ComponentManager.getCount()).toBe(count);
                });
            });

            describe("after refreshing", function() {
                it("should destroy all created components", function() {
                    var count = Ext.ComponentManager.getCount();
                    makeGrid();
                    renderWithRefresh();
                    grid.destroy();
                    expect(Ext.ComponentManager.getCount()).toBe(count);
                });
            });
        });
    });

    describe("misc tests", function() {
        var store, grid, rows, cells;

        function completeWithData(theData) {
            Ext.Ajax.mockComplete({
                status: 200,
                responseText: Ext.encode(theData)
            });
        }

        function makeData(n) {
            var i = 0,
                recs = [];

            for (n = n || 50; i < n; i++) {
                recs.push({
                    name: 'Name ' + i,
                    email: 'dev_' + i + '@sencha.com',
                    phone: '1-717-' + i
                });
            }

            return recs;
        }

        var createGrid = function(storeCfg, gridCfg) {
            if (!(gridCfg && gridCfg.viewModel && gridCfg.viewModel.stores)) {
                if (!(storeCfg instanceof Ext.data.Store)) {
                    store = new Ext.data.Store(Ext.apply({
                        fields: ['name', 'email', 'phone'],
                        data: [
                            { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
                            { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
                            { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
                            { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
                        ]
                    }, storeCfg));
                } else {
                    store = storeCfg;
                }
            } else {
                store = null;
            }

            grid = new Ext.grid.Grid(Ext.apply({
                title: 'Simpsons',
                store: store,
                columns: [
                    { text: 'Name',  dataIndex: 'name', width: 100 },
                    { text: 'Email', dataIndex: 'email', width: 100 },
                    { text: 'Phone', dataIndex: 'phone', width: 100 }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody()
            }, gridCfg));

            waits(100);
            runs(function() {
                rows = grid.query('gridrow');
                cells = grid.query('gridrow > gridcell');
            });
        };

        afterEach(function() {
            Ext.destroy(grid, store);
        });

        describe('Grouped headers', function() {
            it('should render grouped', function() {
                createGrid(null, {
                    columns: [{
                        text: 'All Data',
                        columns: [
                            { text: 'Name',  dataIndex: 'name', width: 100 },
                            { text: 'Email', dataIndex: 'email', width: 100 },
                            { text: 'Phone', dataIndex: 'phone', width: 100 }
                        ]
                    }]
                });
                
                runs(function() {
                    // HeaderContainer has no immediate child columns
                    expect(grid.getHeaderContainer().query('>column').length).toBe(0);

                    // HeaderContainer has one header group
                    expect(grid.getHeaderContainer().query('>gridheadergroup').length).toBe(1);

                    // And there are leaf subcolumns
                    expect(grid.getHeaderContainer().query('>gridheadergroup>column').length).toBe(3);
                });
            });

            it('should hide a column group when all its child columns are hidden', function() {
                createGrid(null, {
                    columns: [{
                        text: 'Name',  dataIndex: 'name', width: 100
                    }, {
                        text: 'Contact Details',
                        columns: [
                            { text: 'Email', dataIndex: 'email', width: 100 },
                            { text: 'Phone', dataIndex: 'phone', width: 100 }
                        ]
                    }]
                });

                runs(function() {
                    var contactDetailsHeader = grid.down('[text="Contact Details"]'),
                        emailHeader = grid.down('[text="Email"]'),
                        phoneHeader = grid.down('[text="Phone"]');

                    emailHeader.hide();
                    phoneHeader.hide();

                    // Hiding all child headers in a HeaerGroup results it being hidden
                    expect(contactDetailsHeader.isHidden()).toBe(true);

                    // Showing an empty HeaderGroup shows the first child header
                    contactDetailsHeader.show();
                    expect(contactDetailsHeader.isHidden()).toBe(false);

                    // Must be showing one child header at this point
                    expect(contactDetailsHeader.getVisibleCount()).toBe(1);
                });
            });
        });
    });
});