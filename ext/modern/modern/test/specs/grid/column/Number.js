describe('Ext.grid.column.Number', function () {
    var panel, container, store,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore, Controller;

    function createGrid(gridCfg, storeCfg) {
        store = new Ext.data.Store(Ext.apply({
            fields: ['name', 'email', 'phone', 'income'],
            data: [
                { 'name': 'Lisa',  'email':'lisa@simpsons.com',  'phone':'555-111-1224', income: 1244.246 },
                { 'name': 'Bart',  'email':'bart@simpsons.com',  'phone':'555-222-1234', income: 3444.985 },
                { 'name': 'Homer', 'email':'homer@simpsons.com', 'phone':'555-222-1244', income: 2474.45 },
                { 'name': 'Marge', 'email':'marge@simpsons.com', 'phone':'555-222-1254', income: 244.745 }
            ],
            autoDestroy: true
        }, storeCfg));

        panel = new Ext.grid.Grid(Ext.apply({
            store: store,
            columns: [
                { header: 'Income', dataIndex: 'income', width: 100, xtype: 'numbercolumn' },
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

    function getCell(row, column) {
        return panel.getItem(store.getAt(row)).query('numbercell')[column];
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

        Controller = Ext.define('spec.TestController', {
            extend: 'Ext.app.ViewController',
            alias: 'controller.test'
        });
    });

    afterEach(function() {
        // Undo the overrides.
        Ext.data.ProxyStore.prototype.load = proxyStoreLoad;

        Ext.destroy(panel);
        panel = store = null;

        Ext.undefine('spec.TestController');
        Controller = null;
        Ext.Factory.controller.instance.clearCache();
    });

    describe('grids', function () {
        it('should show the correct value in the cell', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100, xtype: 'numbercolumn'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1,244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3,444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2,474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the format correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100, xtype: 'numbercolumn',
                    format: '0.00'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('1244.25');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('3444.99');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('2474.45');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('244.75');
        });

        it('should apply the cell format correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    format: '0,000'
                }
            });

            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100, xtype: 'numbercolumn',
                    cell: {
                        viewModel: vm,
                        bind: {
                            format: '{format}'
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
