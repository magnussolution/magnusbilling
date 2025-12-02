/* global Ext, jasmine, expect */

describe("grid-view", function() {
    function createSuite(buffered) {
        describe(buffered ? "with buffered rendering" : "without buffered rendering", function() {
            var grid, view, navModel, locked, createGrid = function() {
                grid = new Ext.grid.Panel({
                    width: 600,
                    height: 300,
                    bufferedRenderer: buffered,
                    renderTo: Ext.getBody(),
                    store: {
                        model: spec.LockedModel,
                        data: [{
                            f1: 1,
                            f2: 2,
                            f3: 3,
                            f4: 4
                        }, {
                            f1: 5,
                            f2: 6,
                            f3: 7,
                            f4: 8
                        }, {
                            f1: 9,
                            f2: 10,
                            f3: 11,
                            f4: 12
                        }, {
                            f1: 13,
                            f2: 14,
                            f3: 15,
                            f4: 16
                        }]
                    },
                    columns: [{
                        locked: locked,
                        dataIndex: 'f1'
                    }, {
                        locked: true,
                        dataIndex: 'f2'
                    }, {
                        dataIndex: 'f3'
                    }, {
                        dataIndex: 'f4'
                    }]
                });
                view = grid.view;
                navModel = grid.getNavigationModel();
            };
            
            beforeEach(function() {
                Ext.define('spec.LockedModel', {
                    extend: 'Ext.data.Model',
                    fields: ['f1', 'f2', 'f3', 'f4']
                });
            });
            
            afterEach(function(){
                Ext.undefine('spec.LockedModel');
                Ext.data.Model.schema.clear();
                Ext.destroy(grid);
                grid = null;
                locked = false;
            });
            
            describe("locked view", function(){
                var innerSelector;
                beforeEach(function() {
                    locked = true;
                    createGrid();
                    innerSelector = grid.normalGrid.getView().innerSelector;
                    
                });
                
                describe("getCellInclusive", function(){
                    it("should be able to get a cell in the locked area", function(){
                        var cell = grid.getView().getCellInclusive({
                            row: 0,
                            column: 0
                        });
                        expect(cell.down(innerSelector, true).innerHTML).toBe('1'); 
                    });
                    
                    it("should be able to get a cell in the unlocked area", function(){
                        var cell = grid.getView().getCellInclusive({
                            row: 3,
                            column: 3
                        });
                        expect(cell.down(innerSelector, true).innerHTML).toBe('16'); 
                    });
                    
                    it("should return false if the cell doesn't exist", function(){
                        var cell = grid.getView().getCellInclusive({
                            row: 20,
                            column: 20
                        });
                        expect(cell).toBe(false); 
                    });
                    
                    it("should return a dom element if the returnDom param is passed", function(){
                        var cell = grid.getView().getCellInclusive({
                            row: 1,
                            column: 1
                        }, true);
                        expect(cell.tagName).not.toBeUndefined();
                        expect(Ext.fly(cell).down(innerSelector, true).innerHTML).toBe('6'); 
                    });
                });

                describe('reconfigure', function() {
                    beforeEach(function() {
                        // Suppress console warnings about Store created with no model
                        spyOn(Ext.log, 'warn');
                    });
                    
                    it('should use the new store to refresh', function() {
                        expect(grid.lockedGrid.view.all.getCount()).toBe(4);
                        expect(grid.normalGrid.view.all.getCount()).toBe(4);

                        grid.reconfigure(new Ext.data.Store(), [{dataIndex : name, locked : true }, { dataIndex : 'name' }]);

                        // Should have refreshed both sides to have no rows.
                        expect(grid.lockedGrid.view.all.getCount()).toBe(0);
                        expect(grid.normalGrid.view.all.getCount()).toBe(0);
                    });
                });        
            });

            describe('FocusEnter', function() {
                describe('after a reconfigure', function() {
                    xit('should restore focus to the closest cell by recIdx/colIdx', function() {
                        createGrid();

                        var cell_22 = new Ext.grid.CellContext(view).setPosition(2, 2);
                        navModel.setPosition(2, 2);

                        waitsFor(function() {
                            return Ext.Element.getActiveElement() === cell_22.getCell(true);
                        });
                        runs(function() {
                            grid.reconfigure(new Ext.data.Store({
                                model: spec.LockedModel,
                                data: [{
                                    f1: 1,
                                    f2: 2,
                                    f3: 3,
                                    f4: 4
                                }, {
                                    f1: 5,
                                    f2: 6,
                                    f3: 7,
                                    f4: 8
                                }, {
                                    f1: 9,
                                    f2: 10,
                                    f3: 11,
                                    f4: 12
                                }, {
                                    f1: 13,
                                    f2: 14,
                                    f3: 15,
                                    f4: 16
                                }]
                            }), [{
                                dataIndex: 'f1'
                            }, {
                                locked: true,
                                dataIndex: 'f2'
                            }, {
                                dataIndex: 'f3'
                            }, {
                                dataIndex: 'f4'
                            }]);
                            cell_22 = new Ext.grid.CellContext(view).setPosition(2, 2);
                            view.el.focus();
                        });

                        // Should focus back to the same position coordinates ehen though the record and column
                        // of the lastFocused position no longer exist. It falls back to using the rowIdx/colIdx
                        waitsFor(function() {
                            return Ext.Element.getActiveElement() === cell_22.getCell(true);
                        });
                    });
                });
            });
        });
    }
    createSuite(false);
    createSuite(true);
    
    describe("drag and drop between grids", function() {
        var grid1,
            grid2;

        var Model = Ext.define(null, {
            extend: 'Ext.data.Model',
            fields: ['group', 'text']
        });

        function findCell(grid, rowIdx, cellIdx) {
            return grid.getView().getCellInclusive({
                row: rowIdx,
                column: cellIdx
            }, true);
        }

        function triggerCellMouseEvent(grid, type, rowIdx, cellIdx, button, x, y) {
            var target = findCell(grid1, rowIdx, cellIdx);

            jasmine.fireMouseEvent(target, type, x, y, button);
        }

        function selectRow(grid, rowIdx) {
            var target = findCell(grid, rowIdx, 0);
            jasmine.fireMouseEvent(target, 'click', 0, 0, false, false, true, false);
            return target;
        }

        function dragAndDrop(fromEl, fromX, fromY, toEl, toX, toY) {
            var dragThresh = Ext.dd.DragDropManager.clickPixelThresh + 1;

            jasmine.fireMouseEvent(fromEl, 'mouseover', fromX, fromY);
            jasmine.fireMouseEvent(fromEl, 'mousedown', fromX, fromY);
            jasmine.fireMouseEvent(fromEl, 'mousemove', fromX + dragThresh, fromY);

            jasmine.fireMouseEvent(fromEl, 'mouseout', toX, toY);
            jasmine.fireMouseEvent(fromEl, 'mouseleave', toX, toY);
            jasmine.fireMouseEvent(toEl, 'mouseenter', toX, toY);

            jasmine.fireMouseEvent(toEl, 'mouseover', toX, toY);
            jasmine.fireMouseEvent(toEl, 'mousemove', toX - dragThresh, toY);
            jasmine.fireMouseEvent(toEl, 'mousemove', toX, toY);
            jasmine.fireMouseEvent(toEl, 'mouseup', toX, toY);
            jasmine.fireMouseEvent(toEl, 'mouseout', fromX, fromY);

            // Mousemove outside triggers removal of overCls
            jasmine.fireMouseEvent(fromEl, 'mousemove', fromX, fromY);
        }

        afterEach(function() {
            grid1 = grid2 = Ext.destroy(grid1, grid2);
        });

        function makeGrid(ddConfig, data) {
            return new Ext.grid.Panel({
                renderTo: Ext.getBody(),
                height: 200,
                width: 200,
                multiSelect: true,
                features: [{
                    ftype: 'grouping'
                }],
                viewConfig: {
                    plugins: Ext.apply({
                        ptype: 'gridviewdragdrop'
                    }, ddConfig)
                },
                store: {
                    model: Model,
                    groupField: 'group',
                    data: data
                },
                columns: [{
                    flex: 1,
                    dataIndex: 'text'
                }]
            });
        }

        describe("drag and drop non-contiguous records", function() {
            it("should not cause a Maximum call stack size exceeded error", function() {
                var spy = jasmine.createSpy(),
                    dragEl, dropEl, box,
                    startX, startY, endX, endY, old;

                grid1 = makeGrid({
                    dragGroup: 'group1',
                    dropGroup: 'group2'
                }, [{
                    group: 'Group1',
                    text: 'Item 1'
                }, {
                    group: 'Group2',
                    text: 'Item 2'
                }, {
                    group: 'Group2',
                    text: 'Item 3'
                }]);
                grid2 = makeGrid({
                    dragGroup: 'group2',
                    dropGroup: 'group1',
                    dropZone: {
                        overClass: 'dropzone-over-class'
                    }
                });
                dragEl = selectRow(grid1, 0);
                box = Ext.get(dragEl).getBox();
                startX = box.left + 1;
                startY = box.top + 1;
                dropEl = grid2.getView().el;
                box = Ext.get(dropEl).getBox();
                endX = box.left + 20;
                endY = box.top + 20;

                // The class must be added, so call through
                spyOn(dropEl, 'addCls').andCallThrough();

                old = window.onerror;
                window.onerror = spy.andCallFake(function() {
                    if (old) {
                        old();
                    }
                });

                dragAndDrop(dragEl, startX, startY, dropEl, endX, endY);
                expect(spy).not.toHaveBeenCalled();

                window.onerror = old;

                // overClass should have been added
                expect(grid2.getView().el.addCls.calls[0].args[0]).toBe('dropzone-over-class');

                // But removed
                expect(grid2.getView().el.hasCls('dropzone-over-class')).toBe(false);

                // A drag/drop must have happened
                expect(grid2.store.getCount()).toBe(1);
            });
        });
    });
}); 
