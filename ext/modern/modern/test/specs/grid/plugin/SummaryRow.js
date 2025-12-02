describe('Ext.grid.plugin.SummaryRow', function () {
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
            groupField: 'name',
            autoDestroy: true
        }, storeCfg));

        panel = new Ext.grid.Grid(Ext.apply({
            store: store,
            columns: [
                { header: 'Income', dataIndex: 'income', width: 100, summaryType: 'sum', summaryFormatter: 'number("0,000.00")' },
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', width: 100 },
                { header: 'Phone', dataIndex: 'phone', width: 100 }
            ],
            plugins: [{ type: 'summaryrow'}],
            height: 200,
            width: 400
        }, gridCfg));
        container = panel.container;
        panel.onContainerResize(container, { height: container.element.getHeight() });
    }

    function getCell(column) {
        var sRow = panel.findPlugin('summaryrow');
        return sRow ? sRow.query('gridcell')[column] : null;
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
                    header: 'Income', dataIndex: 'income', width: 100, summaryType: 'count'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0).el.down('.x-inner-el', true).innerHTML).toBe('4');
        });

        it('should apply the formatter correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100, summaryType: 'sum',
                    summaryFormatter: 'number("0,000.00")'
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0).el.down('.x-inner-el', true).innerHTML).toBe('7,408.43');
        });

        it('should apply the scoped formatter correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100, summaryType: 'sum',
                    summaryFormatter: 'this.myTest("0,000.00")',
                    scope: {
                        myTest: function(v, format){
                            return Ext.util.Format.number(v, format);
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0).el.down('.x-inner-el', true).innerHTML).toBe('7,408.43');
        });

        it('should apply the renderer correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100, summaryType: 'sum',
                    summaryRenderer: Ext.util.Format.numberRenderer("0,000.00")
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0).el.down('.x-inner-el', true).innerHTML).toBe('7,408.43');
        });

        it('should apply the scoped renderer correctly', function () {
            createGrid({
                columns: [{
                    header: 'Income', dataIndex: 'income', width: 100, summaryType: 'sum',
                    summaryRenderer: 'myTest',
                    scope: {
                        myTest: function(v){
                            return Ext.util.Format.number(v, '0,000.00');
                        }
                    }
                }],
                renderTo: Ext.getBody()
            });

            expect(getCell(0).el.down('.x-inner-el', true).innerHTML).toBe('7,408.43');
        });


    });

});
