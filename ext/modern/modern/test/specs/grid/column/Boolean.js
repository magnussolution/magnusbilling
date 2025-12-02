describe('Ext.grid.column.Boolean', function () {
    var panel, container, store,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore, Controller;

    function createGrid(gridCfg, storeCfg) {
        store = new Ext.data.Store(Ext.apply({
            fields: ['name', 'email', 'phone', {name: 'married', type: 'boolean'}],
            data: [
                { 'name': 'Lisa',  'email':'lisa@simpsons.com',  'phone':'555-111-1224', married: false },
                { 'name': 'Bart',  'email':'bart@simpsons.com',  'phone':'555-222-1234', married: false },
                { 'name': 'Homer', 'email':'homer@simpsons.com', 'phone':'555-222-1244', married: true },
                { 'name': 'Marge', 'email':'marge@simpsons.com', 'phone':'555-222-1254', married: true }
            ],
            autoDestroy: true
        }, storeCfg));

        panel = new Ext.grid.Grid(Ext.apply({
            store: store,
            columns: [
                { header: 'Married', dataIndex: 'married', width: 100, xtype: 'booleancolumn' },
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
        return panel.getItem(store.getAt(row)).query('booleancell')[column];
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
                    header: 'Income', dataIndex: 'married', width: 100, xtype: 'booleancolumn'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('False');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('False');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('True');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('True');
        });

        it('should apply the trueText/falseText correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'married', width: 100, xtype: 'booleancolumn',
                    trueText: 'Wahr', falseText: 'Falsch'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('Falsch');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('Falsch');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('Wahr');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('Wahr');
        });

        it('should apply the cell trueText/falseText correctly from a VM', function () {
            var vm = new Ext.app.ViewModel({
                data: {
                    trueText: 'Adevarat',
                    falseText: 'Fals'
                }
            });

            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'married', width: 100, xtype: 'booleancolumn',
                    cell: {
                        viewModel: vm,
                        bind: {
                            trueText: '{trueText}',
                            falseText: '{falseText}'
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            vm.notify();
            expect(getCell(0, 0).el.down('.x-inner-el', true).innerHTML).toBe('Fals');
            expect(getCell(1, 0).el.down('.x-inner-el', true).innerHTML).toBe('Fals');
            expect(getCell(2, 0).el.down('.x-inner-el', true).innerHTML).toBe('Adevarat');
            expect(getCell(3, 0).el.down('.x-inner-el', true).innerHTML).toBe('Adevarat');
        });

    });

});
