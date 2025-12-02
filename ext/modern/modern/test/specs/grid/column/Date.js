describe('Ext.grid.column.Date', function () {
    var panel, container, store,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore, Controller;

    function createGrid(gridCfg, storeCfg) {
        store = new Ext.data.Store(Ext.apply({
            fields: ['name', 'email', 'phone', {name: 'bday', type:'date' }],
            data: [
                { 'name': 'Lisa',  'email':'lisa@simpsons.com',  'phone':'555-111-1224', bday: '01/01/1980' },
                { 'name': 'Bart',  'email':'bart@simpsons.com',  'phone':'555-222-1234', bday: '12/31/1981' },
                { 'name': 'Homer', 'email':'homer@simpsons.com', 'phone':'555-222-1244', bday: '02/28/1947' },
                { 'name': 'Marge', 'email':'marge@simpsons.com', 'phone':'555-222-1254', bday: '04/01/1950' }
            ],
            autoDestroy: true
        }, storeCfg));

        panel = new Ext.grid.Grid(Ext.apply({
            store: store,
            columns: [
                { header: 'Birthday', dataIndex: 'bday', width: 100, xtype: 'datecolumn'},
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
        return panel.getItem(store.getAt(row)).query('datecell')[column];
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
                    header: 'Birthday', dataIndex: 'bday', width: 100, xtype: 'datecolumn'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('01/01/1980');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('12/31/1981');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('02/28/1947');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('04/01/1950');
        });

        it('should apply the format correctly', function () {
            createGrid({
                columns: [{
                    header: 'Birthday', dataIndex: 'bday', width: 100, xtype: 'datecolumn',
                    format: 'd.m.Y'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('01.01.1980');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('31.12.1981');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('28.02.1947');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('01.04.1950');
        });

        it('should apply the cell format correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    format: 'd.m.Y'
                }
            });

            createGrid({
                columns: [{
                    header: 'Birthday', dataIndex: 'bday', width: 100, xtype: 'datecolumn',
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
            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('01.01.1980');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('31.12.1981');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('28.02.1947');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('01.04.1950');
        });

    });

});
