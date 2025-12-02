/* global Ext, expect */

describe("Ext.grid.RowBody", function () {
    var numRecords = 5,
        fields = ['d1', 'd2', 'd3', {
            name: 'expanded',
            type: 'boolean'
        }],
        TestModel = Ext.define(null, {
            extend: 'Ext.data.Model',
            fields: fields
        }),
        TestGrid = Ext.define(null, {
            extend: 'Ext.grid.Grid',

            // This method forces a synchronous layout of the grid to make testing easier
            $testRefresh: function () {
                var container = this.container;
                this.onContainerResize(container, {height: container.element.getHeight()});
            }
        }),
        store, grid, expandField;

    function getStore(count) {
        var data = [], field, i, j;
        
        if (!count) {
            count = numRecords;
        }

        for (i = 0; i < count; i++) {
            data[i] = {};
            for (j = 0; j < fields.length; j++) {
                field = fields[j];
                data[i][field] = 'foo';
            }
            data.expanded = false;
        }

        return new Ext.data.Store({
            model: TestModel,
            data: data
        });
    }

    function getTplGrid(config, numRecords) {
        var defaults = {
            width: 300,
            height: 400,
            store: getStore(numRecords),
            columns: fields.map(function (name) {
                name = (typeof name === 'object') ? name.name : name;
                return {
                    dataIndex: name,
                    width: 100,
                    text: name.toUpperCase(),
                    itemId: 'col' + name
                };
            }),
            plugins: 'rowexpander',
            itemConfig: {
                expandedField: expandField,
                viewModel: {},
                body: {
                    tpl: '{d1}'
                }
            }
        };

        config = Ext.apply(defaults, config);
        return new TestGrid(config);
    }

    function getWidgetGrid(config, numRecords) {
        var defaults = {
            width: 300,
            height: 400,
            store: getStore(numRecords),
            columns: fields.map(function (name) {
                name = (typeof name === 'object') ? name.name : name;
                return {
                    dataIndex: name,
                    width: 100,
                    text: name.toUpperCase(),
                    itemId: 'col' + name
                };
            }),
            plugins: 'rowexpander',
            itemConfig: {
                expandedField: expandField,
                viewModel: {},
                body: {
                    widget: {
                        xtype: 'button',
                        height: 42,
                        bind: '{record.d1}'
                    }
                }
            }
        };

        config = Ext.apply(defaults, config);
        return new TestGrid(config);
    }

    runTests('expanded state in grid', null);

    runTests('expanded state in record', 'expanded');

    function runTests(testName, expandFieldName) {
        describe(testName, function() {
            beforeEach(function() {
                expandField = expandFieldName;
            });
            afterEach(function () {
                store = grid = Ext.destroy(grid, store);
            });

            describe("Visibility", function () {
                beforeEach(function () {
                    grid = getTplGrid();
                    store = grid.getStore();

                    grid.renderTo(Ext.getBody());
                    grid.$testRefresh();
                });

                it("should be collapsed and hidden by default", function () {
                    var row = grid.getItemAt(0),
                        body = row.getBody();

                    expect(row.getCollapsed()).toBeTruthy();
                    expect(body.getHidden()).toBe(true);
                    expect(body.el.isVisible()).toBe(false);
                });

                it("should set collapsed false and unhide when expanded", function () {
                    var top = grid.getItemAt(0),
                        body = top.getBody();

                    top.expand();

                    expect(top.getCollapsed()).toBe(false);
                    expect(body.getHidden()).toBe(false);
                    expect(body.el.isVisible()).toBe(true);
                });

                it("should call the updater when collapse/expand is called", function () {
                    var top = grid.getItemAt(0),
                        body = top.getBody();

                    spyOn(top, 'updateCollapsed');
                    top.expand();
                    top.collapse();

                    expect(top.updateCollapsed.calls.length).toEqual(2);
                    expect(top.getCollapsed()).toBeTruthy();
                    expect(body.getHidden()).toBe(true);
                    expect(body.el.isVisible()).toBe(false);
                });

                it("should trigger grid item layout when expanded", function () {
                    var top = grid.getItemAt(0);

                    spyOn(grid, 'onItemHeightChange');
                    top.expand();

                    expect(grid.onItemHeightChange).toHaveBeenCalled();
                });
            });

            describe("Template Based Row Body", function () {
                beforeEach(function () {
                    grid = getTplGrid();
                    store = grid.getStore();

                    grid.renderTo(Ext.getBody());
                    grid.$testRefresh();
                });

                describe("Template Based ViewModel Access", function () {
                    it("should render data from the view model properly", function () {
                        var row = grid.getItemAt(0),
                            body = row.getBody(),
                            inner = body.getInnerHtmlElement(),
                            html = inner.getHtml();

                        expect(html).toBe('foo');
                    });
                });

                describe("Template Based Row Spacing", function () {
                    it("should space rows properly when RowBody is collapsed", function () {
                        var count = grid.getStore().getCount(),
                            headerHeight = grid.getHeaderContainer().el.getHeight(),
                            height = grid.getItemAt(0).el.getHeight(),
                            i, y, row;

                        for (i = 0; i < count; i++) {
                            row = grid.getItemAt(i);
                            y = headerHeight + (i * height);
                            expect(row.el.getY()).toBe(y);
                        }
                    });

                    it("should space rows properly when RowBody is expanded", function () {
                        var top = grid.getItemAt(0),
                            headerHeight = grid.getHeaderContainer().el.getHeight(),
                            rowHeight = top.el.getHeight(), rowBodyHeight,
                            count = grid.getStore().getCount(), i, row, y;

                        top.expand();
                        rowBodyHeight = top.getBody().el.getHeight();

                        for (i = 1; i < count; ++i) {
                            row = grid.getItemAt(i);
                            y = headerHeight + (i * (rowHeight + rowBodyHeight));
                            expect(row.el.getY()).toBe(y);
                            row.expand();
                        }
                    });

                    it("should space rows properly when RowBody is expanded and collapsed", function () {
                        var top = grid.getItemAt(0),
                            headerHeight = grid.getHeaderContainer().el.getHeight(),
                            height = top.el.getHeight(),
                            count = grid.getStore().getCount(), i, row, y;


                        for (i = 0; i < count; ++i) {
                            row = grid.getItemAt(i);
                            row.expand();
                        }

                        for (i = 0; i < count; ++i) {
                            row = grid.getItemAt(i);
                            row.collapse();
                            y = headerHeight + (i * height);
                            expect(row.el.getY()).toBe(y);
                        }
                    });
                });
            });

            describe('recycling Rows', function() {
                it('should maintain expanded/collapsed state in the plugin context', function() {
                    grid = getTplGrid(null, 500);
                    grid.renderTo(Ext.getBody());
                    grid.$testRefresh();

                    var scroller = grid.getScrollable(),
                        row = grid.getItemAt(0),
                        recZero = row.getRecord(),
                        collapsedHeight = row.el.getHeight(),
                        expandedHeight;

                    row.expand();
                    expect((expandedHeight = row.el.getHeight())).toBeGreaterThan(collapsedHeight);

                    // Scroll until the row gets recycled for use by another record
                    waitsFor(function() {
                        scroller.scrollBy(0, 50);
                        return row.getRecord() !== recZero;
                    });

                    // When the row is in use for another record, it must no longer be expanded
                    runs(function() {
                        expect(row.getCollapsed()).toBe(true);
                        expect(row.el.getHeight()).toBe(collapsedHeight);
                    });

                    // Scroll until the row gets its original record
                    waitsFor(function() {
                        scroller.scrollBy(0, -50);
                        return row.getRecord() === recZero;
                    });

                    runs(function() {
                        expect(row.getCollapsed()).toBe(false);
                        expect(row.el.getHeight()).toBe(expandedHeight);
                    });

                });
            });

            describe("Widget Based Row Body", function () {
                beforeEach(function () {
                    grid = getWidgetGrid();
                    store = grid.getStore();

                    grid.renderTo(Ext.getBody());
                    grid.$testRefresh();
                });

                describe("Widget Based ViewModel Access", function () {
                    it("should render data from the view model properly", function () {
                        var row = grid.getItemAt(0),
                            body = row.getBody(),
                            widget = body.getWidget(), text;


                        // Update bindings for testing
                        row.getViewModel().notify();
                        text = widget.getText();
                        expect(text).toBe('foo');
                    });
                });

                describe("Widget Based Row Spacing", function () {
                    it("should space rows properly when RowBody is collapsed", function () {
                        var count = grid.getStore().getCount(),
                            headerHeight = grid.getHeaderContainer().el.getHeight(),
                            height = grid.getItemAt(0).el.getHeight(),
                            i, y, row;

                        for (i = 0; i < count; i++) {
                            row = grid.getItemAt(i);
                            y = headerHeight + (i * height);
                            expect(row.el.getY()).toBe(y);
                        }
                    });

                    it("should space rows properly when RowBody is expanded", function () {
                        var top = grid.getItemAt(0),
                            headerHeight = grid.getHeaderContainer().el.getHeight(),
                            rowHeight = top.el.getHeight(), rowBodyHeight,
                            count = grid.getStore().getCount(), i, row, padding, y;

                        top.expand();
                        // Widget height is set to 42
                        rowBodyHeight = 42;

                        for (i = 1; i < count; ++i) {
                            row = grid.getItemAt(i);
                            padding = row.getBody().contentElement.getPadding('tb');
                            y = headerHeight + (i * (padding + rowHeight + rowBodyHeight));
                            expect(row.el.getY()).toBe(Math.round(y));
                            row.expand();
                        }
                    });
                });
            });
        });
    }
});
