describe('Ext.grid.column.Column', function () {
    var panel, container, store,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore;

    function createGrid(gridCfg, storeCfg) {
        store = new Ext.data.Store(Ext.apply({
            fields: ['name', 'email', 'phone', 'income'],
            data: [
                { name: 'Lisa',  email:'lisa@simpsons.com',  phone:'555-111-1224', income: 1244.246 },
                { name: 'Bart',  email:'bart@simpsons.com',  phone:'555-222-1234', income: 3444.985 },
                { name: 'Homer', email:'homer@simpsons.com', phone:'555-222-1244', income: 2474.45 },
                { name: 'Marge', email:'marge@simpsons.com', phone:'555-222-1254', income: 244.745 },
                { name: 'Kid', email:'kid@simpsons.com', phone:'555-222-1254', income: 0 }
            ],
            autoDestroy: true
        }, storeCfg));

        panel = new Ext.grid.Grid(Ext.apply({
            store: store,
            columns: [
                { header: 'Income', dataIndex: 'income', width: 100, formatter: 'number("0,000.00")' },
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', width: 100 },
                { header: 'Phone', dataIndex: 'phone', width: 100 }
            ],
            height: 200,
            width: 400
        }, gridCfg));
        container = panel.container;
        panel.onContainerResize(container, { height: container.element.getHeight() });
    }

    function getCell(row, column, query) {
        query = query || 'gridcell';
        return panel.getItem(store.getAt(row)).query(query)[column];
    }

    beforeEach(function() {
        // Override so that we can control asynchronous loading
        loadStore = Ext.data.ProxyStore.prototype.load = function() {
            proxyStoreLoad.apply(this, arguments);
            if (synchronousLoad) {
                this.flushLoad.apply(this, arguments);
            }
            return this;
        };
    });

    afterEach(function() {
        // Undo the overrides.
        Ext.data.ProxyStore.prototype.load = proxyStoreLoad;

        panel = store = Ext.destroy(panel);
    });

    describe("binding", function() {
        it("should be able to bind column properties", function() {
            createGrid({
                renderTo: Ext.getBody(),
                viewModel: {
                    data: {
                        theName: 'Foo'
                    }
                },
                columns: [{
                    dataIndex: 'name',
                    itemId: 'col',
                    bind: {
                        text: '{theName}'
                    }
                }]
            });
            panel.getViewModel().notify();
            var col = panel.down('#col');
            expect(col.getInnerHtmlElement()).hasHTML('Foo');
        });
    });

    describe('grids', function () {
        it('should show the correct value in the cell', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1244.246');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3444.985');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.745');
        });

        it('should show the correct zeroValue in the gridcell', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    cell: {
                        zeroValue: 'zero'
                    }
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(4, 0).el.down('.x-inner-el', true).innerHTML).toBe('zero');
        });

        it('should show the correct zeroValue in the textcell', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    cell: {
                        xtype: 'textcell',
                        zeroValue: 'zero'
                    }
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(4, 0, 'textcell').el.down('.x-inner-el', true).innerHTML).toBe('zero');
        });

        it('should apply the zeroValue of gridcell correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    zeroValue: 'zero'
                }
            });

            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    cell: {
                        viewModel: vm,
                        bind: {
                            zeroValue: '{zeroValue}'
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            vm.notify();
            expect(getCell(4, 0).el.down('.x-inner-el', true).innerHTML).toBe('zero');
        });

        it('should apply the zeroValue of textcell correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    zeroValue: 'zero'
                }
            });

            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    cell: {
                        xtype: 'textcell',
                        viewModel: vm,
                        bind: {
                            zeroValue: '{zeroValue}'
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            vm.notify();
            expect(getCell(4, 0, 'textcell').el.down('.x-inner-el', true).innerHTML).toBe('zero');
        });

        it('should apply the formatter correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    formatter: 'number("0,000.00")'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the scoped formatter correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    formatter: 'this.myTest("0,000.00")',
                    scope: {
                        myTest: function(v, format){
                            return Ext.util.Format.number(v, format);
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the cell formatter correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    formatter: 'number("0,000")'
                }
            });

            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    cell: {
                        viewModel: vm,
                        bind: {
                            formatter: '{formatter}'
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            vm.notify();
            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,445');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('245');
        });

        it('should apply the renderer correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    renderer: Ext.util.Format.numberRenderer("0,000.00")
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the scoped renderer correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    renderer: 'myTest',
                    scope: {
                        myTest: function(v){
                            return Ext.util.Format.number(v, '0,000.00');
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the cell renderer correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    renderer: Ext.util.Format.numberRenderer("0,000")
                }
            });

            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    cell: {
                        viewModel: vm,
                        bind: {
                            renderer: '{renderer}'
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            vm.notify();
            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,445');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('245');
        });

        it('should apply the template correctly without dataIndex', function () {
            createGrid({
                columns: [{
                    header: 'Income', width: 100,
                    tpl: '{income:number("0,000.00")}'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the scoped template correctly without dataIndex', function () {
            createGrid({
                columns: [{
                    header: 'Income', width: 100,
                    tpl: [
                        '{income:this.myTest("0,000.00")}',
                        {
                            myTest: function(v, format){
                                return Ext.util.Format.number(v, format);
                            }
                        }
                    ]
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the template correctly with dataIndex', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    tpl: '{income:number("0,000.00")}'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the scoped template correctly with dataIndex', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    tpl: [
                        '{income:this.myTest("0,000.00")}',
                        {
                            myTest: function (v, format) {
                                return Ext.util.Format.number(v, format);
                            }
                        }
                    ]
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the cell template correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    template: [
                        '{income:this.myTest("0,000")}',
                        {
                            myTest: function (v, format) {
                                return Ext.util.Format.number(v, format);
                            }
                        }
                    ]
                }
            });

            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100,
                    cell: {
                        viewModel: vm,
                        bind: {
                            tpl: '{template}'
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            vm.notify();
            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,445');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('245');
        });

    });

});
