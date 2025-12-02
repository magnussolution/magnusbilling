/* global expect, jasmine, Ext */

describe("Ext.grid.column.Check", function() {
    var grid, container, store, col;

    function getColCfg() {
        return {
            xtype: 'checkcolumn',
            text: 'Checked',
            dataIndex: 'val'
        };
    }
    
    function makeGrid(columns, data, gridCfg) {
        store = new Ext.data.Store({
            model: spec.CheckColumnModel,
            data: data || [{
                val: true
            }, {
                val: true
            }, {
                val: false
            }, {
                val: true
            }, {
                val: false
            }]
        });

        if (!columns) {
            columns = [getColCfg()];
        }
        
        grid = new Ext.grid.Grid(Ext.apply({
            width: 200,
            height: 200,
            renderTo: Ext.getBody(),
            store: store,
            columns: columns
        }, gridCfg));
        container = grid.container;
        grid.onContainerResize(container, { height: container.element.getHeight() });
        col = grid.getColumns()[0];
    }
    
    function clickCheckbox(rowIdx, cellIdx, button, x, y) {
        var target = getCellCheckbox(rowIdx, cellIdx);

        if (Ext.supports.TouchEvents) {
            Ext.testHelper.tap(target);
        } else {
            jasmine.fireMouseEvent(target, 'click', x, y, button);
        }
    }

    function getCell(rowIdx, cellIdx) {
        return grid.query('gridrow')[rowIdx].query('gridcell')[cellIdx || 0].el;
    }

    function getCellComponent(rowIdx, cellIdx) {
        return grid.query('gridrow')[rowIdx].query('gridcell')[cellIdx || 0];
    }

    function getCellCheckbox(rowIdx, cellIdx) {
        var cell = grid.query('gridrow')[rowIdx].query('gridcell')[cellIdx || 0];
        return cell.checkboxElement;
    }

    function clickHeader() {
        if (Ext.supports.TouchEvents) {
            Ext.testHelper.tap(col.checkboxElement);
        } else {
            jasmine.fireMouseEvent(col.checkboxElement, 'click');
        }
    }

    function hasCls(el, cls) {
        return Ext.get(el).hasCls(cls);
    }

    beforeEach(function() {
        Ext.define('spec.CheckColumnModel', {
            extend: 'Ext.data.Model',
            fields: ['val']
        });
    });
    
    afterEach(function() {
        Ext.destroy(grid, store);
        col = grid = store = null;
        Ext.undefine('spec.CheckColumnModel');
        Ext.data.Model.schema.clear();
    });
    
    describe("check rendering", function() {
        it("should set the x-checked class on checked items", function() {
            makeGrid();

            expect(getCell(0).hasCls('x-checked')).toBe(true);
            expect(getCell(2).hasCls('x-checked')).toBe(false);
        });
    });
    
    describe("enable/disable", function() {
        describe("during config", function() {
            it("should not include the disabledCls if the column is not disabled", function() {
                makeGrid();
                expect(hasCls(getCell(0), Ext.grid.cell.Check.prototype.disabledCls)).toBe(false);
            });
        
            it("should include the disabledCls if the column is disabled", function() {
                var cfg = getColCfg();
                cfg.disabled = true;
                makeGrid([cfg]);
                expect(hasCls(getCell(0), Ext.grid.cell.Check.prototype.disabledCls)).toBe(true);
            });
        });
        
        describe("after render", function() {
            it("should add the disabledCls if disabling", function() {
                makeGrid();
                col.disable();
                expect(hasCls(getCell(0), Ext.grid.cell.Check.prototype.disabledCls)).toBe(true);
                expect(hasCls(getCell(1), Ext.grid.cell.Check.prototype.disabledCls)).toBe(true);
                expect(hasCls(getCell(2), Ext.grid.cell.Check.prototype.disabledCls)).toBe(true);
                expect(hasCls(getCell(3), Ext.grid.cell.Check.prototype.disabledCls)).toBe(true);
                expect(hasCls(getCell(4), Ext.grid.cell.Check.prototype.disabledCls)).toBe(true);
            });
            
            it("should remove the disabledCls if enabling", function() {
                var cfg = getColCfg();
                cfg.disabled = true;
                makeGrid([cfg]);
                col.enable();
                expect(hasCls(getCell(0), Ext.grid.cell.Check.prototype.disabledCls)).toBe(false);
                expect(hasCls(getCell(1), Ext.grid.cell.Check.prototype.disabledCls)).toBe(false);
                expect(hasCls(getCell(2), Ext.grid.cell.Check.prototype.disabledCls)).toBe(false);
                expect(hasCls(getCell(3), Ext.grid.cell.Check.prototype.disabledCls)).toBe(false);
                expect(hasCls(getCell(4), Ext.grid.cell.Check.prototype.disabledCls)).toBe(false);
            });
        });
    });
    
    describe("interaction", function() {
        describe("stopSelection", function() {
            describe("stopSelection: false", function() {
                it("should select when a full row update is required", function() {
                    var cfg = getColCfg();
                    cfg.stopSelection = false;
                    // Template column always required a full update
                    makeGrid([cfg, {
                        xtype: 'templatecolumn',
                        dataIndex: 'val',
                        tpl: '{val}'
                    }]);
                    clickCheckbox(0);
                    expect(grid.isSelected(store.getAt(0))).toBe(true);
                });

                it("should select when a full row update is not required", function() {
                    var cfg = getColCfg();
                    cfg.stopSelection = false;
                    // Template column always required a full update
                    makeGrid([cfg, {
                        dataIndex: 'val'
                    }]);
                    clickCheckbox(0);
                    expect(grid.isSelected(store.getAt(0))).toBe(true);
                });
            });

            describe("stopSelection: true", function() {
                it("should not select when a full row update is required", function() {
                    var cfg = getColCfg();
                    cfg.stopSelection = true;
                    // Template column always required a full update
                    makeGrid([cfg, {
                        xtype: 'templatecolumn',
                        dataIndex: 'val',
                        tpl: '{val}'
                    }]);
                    clickCheckbox(0);
                    expect(grid.isSelected(store.getAt(0))).toBe(false);
                });

                it("should not select when a full row update is not required", function() {
                    var cfg = getColCfg();
                    cfg.stopSelection = true;
                    // Template column always required a full update
                    makeGrid([cfg, {
                        dataIndex: 'val'
                    }]);
                    clickCheckbox(0);
                    expect(grid.isSelected(store.getAt(0))).toBe(false);
                });
            });
        });

        describe("events", function() {
            it("should pass the cell, record index, new checked state & record for beforecheckchange", function() {
                var arg1, arg2, arg3, arg4;
                makeGrid();
                col.on('beforecheckchange', function(a, b, c, d) {
                    arg1 = a;
                    arg2 = b;
                    arg3 = c;
                    arg4 = d;
                });
                clickCheckbox(0);
                expect(arg1).toBe(getCellComponent(0, 0));
                expect(arg2).toBe(0);
                expect(arg3).toBe(false);
                expect(arg4).toBe(store.getAt(0));
            });
            
            it("should pass the cell, record index, new checked state & record for checkchange", function() {
                var arg1, arg2, arg3, arg4;
                makeGrid();
                col.on('checkchange', function(a, b, c, d) {
                    arg1 = a;
                    arg2 = b;
                    arg3 = c;
                    arg4 = d;
                });
                clickCheckbox(2);
                expect(arg1).toBe(getCellComponent(2, 0));
                expect(arg2).toBe(2);
                expect(arg3).toBe(true);
                expect(arg4).toBe(store.getAt(2));
            });
            
            it("should not fire fire checkchange if beforecheckchange returns false", function() {
                var called = false;
                makeGrid();
                col.on('checkchange', function(a, b, c) {
                    called = true;
                });
                col.on('beforecheckchange', function() {
                    return false;
                });
                clickCheckbox(2);
                expect(called).toBe(false);
            });
        });
        
        it("should invert the record value", function() {
            makeGrid();
            clickCheckbox(0);
            expect(store.getAt(0).get('val')).toBe(false);
            clickCheckbox(2);
            expect(store.getAt(2).get('val')).toBe(true);
        });
        
        it("should not trigger any changes when disabled", function() {
            var cfg = getColCfg();
            cfg.disabled = true;
            makeGrid([cfg]);
            clickCheckbox(0);
            expect(store.getAt(0).get('val')).toBe(true);
            clickCheckbox(2);
            expect(store.getAt(2).get('val')).toBe(false);
        });
    });
    
    describe('Header checkbox', function() {
        beforeEach(function() {
            var ready;

            makeGrid([{
                xtype: 'checkcolumn',
                headerCheckbox: true,
                text: 'Checked',
                dataIndex: 'val',
                listeners: {
                    headercheckchange: function() {
                        ready = true;
                    }
                }
            }]);

            // Wait for the header state to be synched.
            // This is done on animation frae, and there's no event.
            waits(100);
        });

        it('should toggle all on header checkbox click', function() {
            var headercheckchangeCount = 0;

            col.on({
                headercheckchange: function() {
                    headercheckchangeCount++;
                }
            });

            // Test selecting all
            clickHeader();
            store.each(function(rec) {
                expect(rec.get('val')).toBe(true);
            });

            // Header checkbox is updated on a timer for efficiency, so must wait
            waitsFor(function() {
                expect(headercheckchangeCount).toBe(1);
                return col.el.hasCls(col.checkedCls) === true;
            });
            
            runs(function() {
                // Test deselecting all
                clickHeader();
                store.each(function(rec) {
                    expect(rec.get('val')).toBe(false);
                });
            });

            // Header checkbox is updated on a timer for efficiency, so must wait
            waitsFor(function() {
                expect(headercheckchangeCount).toBe(2);
                return col.el.hasCls(col.checkedCls) === false;
            });
        });
        it('should not toggle all on header checkbox click if the beforeheadercheckchange event is vetoed', function() {
            var headercheckchangeCalled = false;

            col.on({
                beforeheadercheckchange: function() {
                    return false;
                },
                headercheckchange: function() {
                    headercheckchangeCalled = true;
                }
            });

            // Test vetoing of selecting all
            clickHeader();
            store.each(function(rec) {
                expect(rec.isModified('val')).toBe(false);
            });

            // Nothing should happen.
            // We are expecting the header checkbox state to remain false
            waits(100);

            // The header must not have been updated to true because of the veto
            runs(function() {
                expect(headercheckchangeCalled).toBe(false);
                expect(col.el.hasCls(col.checkedCls)).toBe(false);
            });
        });

        it('should set the header checkbox when all rows are checked', function() {
            var headercheckchangeCount = 0;

            col.on({
                headercheckchange: function() {
                    headercheckchangeCount++;
                }
            });

            // Rows 2 and 4 are unchecked. Header should start unchecked.
            expect(col.el.hasCls(col.checkedCls)).toBe(false);

            clickCheckbox(2);

            // Nothing should happen.
            // We are expecting the header checkbox state to remain false
            waits(100);

            // The header must not have been updated to true because of the veto
            runs(function() {
                expect(headercheckchangeCount).toBe(0);
                expect(col.el.hasCls(col.checkedCls)).toBe(false);
                clickCheckbox(4);
            });

            // Header checkbox is updated on a timer for efficiency, so must wait
            waitsFor(function() {
                return col.el.hasCls(col.checkedCls) === true;
            });
        });

        it('should clear the header checkbox when a new, unchecked record is added', function() {
            var rowCount = grid.query('gridrow').length;

            // Rows 2 and 4 are unchecked. Header should start unchecked.
            expect(col.el.hasCls(col.checkedCls)).toBe(false);

            // Now all are selected
            clickHeader();

            // Header checkbox is updated on a timer for efficiency, so must wait
            waitsFor(function() {
                return col.el.hasCls(col.checkedCls) === true;
            });

            // Add a record. This should cause the header checkbox to clear
            runs(function() {
                store.add({});
            });

            // Header checkbox is updated on a timer for efficiency, so must wait
            waitsFor(function() {
                return grid.query('gridrow').length === rowCount + 1 &&
                       col.el.hasCls(col.checkedCls) === false;
            });
        });

        it('should set the header checkbox when all records have the dataIndex field set', function() {
            // Rows 2 and 4 are unchecked. Header should start unchecked.
            expect(col.el.hasCls(col.checkedCls)).toBe(false);

            store.getAt(2).set('val', true);

            // Nothing should happen.
            // We are expecting the header checkbox state to remain false
            waits(100);
            
            runs(function() {
                expect(col.el.hasCls(col.checkedCls)).toBe(false);
                store.getAt(4).set('val', true);
            });

            // Header checkbox is updated on a timer for efficiency, so must wait
            waitsFor(function() {
                return col.el.hasCls(col.checkedCls) === true;
            });
        });
    });
});
