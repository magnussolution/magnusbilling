describe('Ext.chart.series.Series', function() {

    var proto = Ext.chart.series.Series.prototype,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore;

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
    });

    describe('label', function () {
        it('should allow for dynamic updates of the "field" config', function () {
            var chart;

            runs(function () {
                chart = Ext.create({
                    xtype: 'polar',
                    animation: false,
                    renderTo: document.body,
                    width: 400,
                    height: 400,
                    theme: 'green',
                    store: {
                        fields: ['name', 'data1'],
                        data: [{
                            name: 'metric one',
                            name2: 'metric 1',
                            data1: 14
                        }, {
                            name: 'metric two',
                            name2: 'metric 2',
                            data1: 16
                        }]
                    },
                    series: {
                        id: 'mySeries',
                        type: 'pie',
                        highlight: true,
                        angleField: 'data1',
                        label: {
                            field: 'name',
                            display: 'rotate'
                        },
                        donut: 30
                    }
                });
            });

            waitsFor(function () {
                // wait till sprites have rendered
                return !chart.getSeries()[0].getSprites()[0].getDirty();
            });

            runs(function () {
                var series = chart.get('mySeries');
                var label = series.getLabel();

                expect(label.get(0).text).toBe('metric one');
                expect(label.get(1).text).toBe('metric two');

                series.setLabel({
                    field: 'name2'
                });

                expect(label.get(0).text).toBe('metric 1');
                expect(label.get(1).text).toBe('metric 2');

                Ext.destroy(chart);
            });
        });
    });

    describe('resolveListenerScope', function () {

        var testScope;

        function setTestScope() {
            testScope = this;
        }

        var scopeObject = {
            setTestScope: setTestScope
        };

        var store = Ext.create('Ext.data.Store', {
            fields: ['x', 'y'],
            data: [
                {x: 0, y: 0},
                {x: 1, y: 1}
            ]
        });

        var seriesConfig = {
            type: 'bar',
            xField: 'x',
            yField: 'y'
        };

        function createContainer(options) {
            var config = {
                width: 400,
                height: 400,
                layout: 'fit'
            };
            Ext.apply(config, options);
            var container = Ext.create('Ext.container.Container', config);
            container.setTestScope = setTestScope;
            return container;
        }

        function createController() {
            return Ext.create('Ext.app.ViewController', {
                setTestScope: setTestScope
            });
        }

        function createChart(options) {
            var config = {
                store: store,
                series: seriesConfig
            };
            Ext.apply(config, options);
            var chart = Ext.create('Ext.chart.CartesianChart', config);
            chart.setTestScope = setTestScope;
            return chart;
        }

        function createSeriesClass(listenerScope) {
            return Ext.define(null, {
                extend: 'Ext.chart.series.Bar',
                xField: 'x',
                yField: 'y',
                setTestScope: setTestScope,
                listeners: {
                    test: {
                        fn: 'setTestScope',
                        scope: listenerScope
                    }
                }
            });
        }

        describe('series instance listener', function () {

            describe('no chart controller, chart container controller', function () {
                var chart, series,
                    container, containerController;

                beforeEach(function () {
                    testScope = undefined;
                    containerController = createController();
                    chart = createChart();
                    container = createContainer({
                        controller: containerController
                    });
                    container.add(chart);
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart container controller", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(containerController);
                });

                it("listener with no explicit scope should be scoped to chart container controller", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(containerController);
                });
            });


            describe('chart controller, no chart container controller', function () {
                var chart, series,
                    container, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    chart = createChart({
                        controller: chartController
                    });
                    container = createContainer();
                    container.add(chart);
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart controller", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to chart controller", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });
            });


            describe('chart controller, chart container controller', function () {
                var chart, container, series,
                    chartController,
                    containerController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    containerController = createController();
                    chart = createChart({
                        controller: chartController
                    });
                    container = createContainer({
                        controller: containerController
                    });
                    container.add(chart);
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart controller", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to chart controller", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });
            });

            describe('no chart controller, no chart container controller', function () {
                var chart, series, container;

                beforeEach(function () {
                    testScope = undefined;
                    chart = createChart();
                    container = createContainer();
                    container.add(chart);
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should fail", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    expect(function () {
                        series.fireEvent('test', series);
                    }).toThrow();
                });

                it("listener with no explicit scope should be scoped to the chart", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chart);
                });
            });

            describe('chart inside container with defaultListenerScope: true (no controllers)', function () {
                var chart, series, container;

                beforeEach(function () {
                    testScope = undefined;
                    chart = createChart();
                    container = createContainer({
                        defaultListenerScope: true
                    });
                    container.add(chart);
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should fail", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    expect(function () {
                        series.fireEvent('test', series);
                    }).toThrow();
                });

                it("listener with no explicit scope should be scoped to the container", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(container);
                });
            });

            describe('chart with a controller and defaultListenerScope: true', function () {
                var chart, series, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    chart = createChart({
                        controller: chartController,
                        defaultListenerScope: true
                    });
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to the chart controller", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to the chart", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chart);
                });
            });

            describe('chart with a controller (no container)', function () {
                var chart, series, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    chart = createChart({
                        controller: chartController
                    });
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to the chart controller", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to the chart controller", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });
            });

            describe('chart with defaultListenerScope: true (container, no controllers)', function () {
                var chart, container, series, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chart = createChart({
                        defaultListenerScope: true
                    });
                    container = createContainer();
                    container.add(chart);
                    series = chart.getSeries()[0];
                    series.setTestScope = setTestScope;
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'this'
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: scopeObject
                    });
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to the chart controller", function () {
                    series.on({
                        test: 'setTestScope',
                        scope: 'controller'
                    });
                    expect(function () {
                        series.fireEvent('test', series);
                    }).toThrow();
                });

                it("listener with no explicit scope should be scoped to the chart", function () {
                    series.on('test', 'setTestScope');
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chart);
                });
            });

        });

        // #######################################################################################

        describe('series class listener', function () {

            describe('no chart controller, chart container controller', function () {
                var chart, series,
                    container, containerController;

                beforeEach(function () {
                    testScope = undefined;
                    containerController = createController();
                    chart = createChart({
                        series: []
                    });
                    container = createContainer({
                        controller: containerController
                    });
                    container.add(chart);
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart container controller", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(containerController);
                });

                it("listener with no explicit scope should be scoped to chart container controller", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(containerController);
                });
            });


            describe('chart controller, no chart container controller', function () {
                var chart, series,
                    container, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    chart = createChart({
                        series: [],
                        controller: chartController
                    });
                    container = createContainer();
                    container.add(chart);
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart controller", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to chart controller", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });
            });


            describe('chart controller, chart container controller', function () {
                var chart, container, series,
                    chartController,
                    containerController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    containerController = createController();
                    chart = createChart({
                        series: [],
                        controller: chartController
                    });
                    container = createContainer({
                        controller: containerController
                    });
                    container.add(chart);
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart controller", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to chart controller", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });
            });

            describe('no chart controller, no chart container controller', function () {
                var chart, series, container;

                beforeEach(function () {
                    testScope = undefined;
                    chart = createChart({
                        series: []
                    });
                    container = createContainer();
                    container.add(chart);
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should fail", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    expect(function () {
                        series.fireEvent('test', series);
                    }).toThrow();
                });

                it("listener with no explicit scope should be scoped to the series", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });
            });

            describe('chart inside container with defaultListenerScope: true (no controllers)', function () {
                var chart, series, container;

                beforeEach(function () {
                    testScope = undefined;
                    chart = createChart({
                        series: []
                    });
                    container = createContainer({
                        defaultListenerScope: true
                    });
                    container.add(chart);
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should fail", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    expect(function () {
                        series.fireEvent('test', series);
                    }).toThrow();
                });

                it("listener with no explicit scope should be scoped to chart container", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(container);
                });
            });

            describe('chart with a controller and defaultListenerScope: true', function () {
                var chart, series, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    chart = createChart({
                        series: [],
                        controller: chartController,
                        defaultListenerScope: true
                    });
                });

                afterEach(function () {
                    chart.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart controller", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to chart", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chart);
                });
            });

            describe('chart with a controller (no container)', function () {
                var chart, series, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    chart = createChart({
                        series: [],
                        controller: chartController
                    });
                });

                afterEach(function () {
                    chart.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart controller", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to chart controller", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });
            });

            describe('chart with defaultListenerScope: true (container, no controllers)', function () {
                var chart, container, series, chartController;

                beforeEach(function () {
                    testScope = undefined;
                    chartController = createController();
                    chart = createChart({
                        series: [],
                        controller: chartController,
                        defaultListenerScope: true
                    });
                    container = createContainer();
                    container.add(chart);
                });

                afterEach(function () {
                    chart.destroy();
                    container.destroy();
                });

                it("listener scoped to 'this' should refer to the series", function () {
                    series = new (createSeriesClass('this'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(series);
                });

                it("listener scoped to an arbitrary object should refer to that object", function () {
                    series = new (createSeriesClass(scopeObject))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(scopeObject);
                });

                it("listener scoped to 'controller' should refer to chart controller", function () {
                    series = new (createSeriesClass('controller'))();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chartController);
                });

                it("listener with no explicit scope should be scoped to chart", function () {
                    series = new (createSeriesClass())();
                    chart.setSeries(series);
                    series.fireEvent('test', series);
                    expect(testScope).toBe(chart);
                });
            });

        });

    });

    describe('coordinateData', function () {
        it("should handle empty strings as valid discrete axis values", function () {
            var originalMethod = proto.coordinateData,
                data;

            proto.coordinateData = function (items, field, axis) {
                var result = originalMethod.apply(this, arguments);
                if (field === 'xfield') {
                    data = result;
                }
                return result;
            };

            Ext.create('Ext.chart.CartesianChart', {
                store: {
                    fields: ['xfield', 'a', 'b', 'c'],
                    data: [{
                        xfield: '',
                        a: 10,
                        b: 20,
                        c: 30
                    }]
                },
                axes: [{
                    type: 'numeric',
                    position: 'left',
                    fields: ['a', 'b', 'c']
                }, {
                    type: 'category',
                    position: 'bottom'
                }],
                series: {
                    type: 'bar',
                    stacked: true,
                    xField: 'xfield',
                    yField: ['a', 'b', 'c']
                }
            }).destroy();
            proto.coordinateData = originalMethod;

            expect(data).toEqual([0]);
        });
    });

    describe('updateChart', function () {
        it("should remove sprites from the old chart, destroying them", function () {
            var chart = new Ext.chart.CartesianChart({
                store: {
                    fields: ['xfield', 'a', 'b', 'c'],
                    data: [{
                        xfield: 'A',
                        a: 10,
                        b: 20,
                        c: 30
                    }, {
                        xfield: 'B',
                        a: 30,
                        b: 20,
                        c: 10
                    }]
                },
                axes: [{
                    type: 'numeric',
                    position: 'left',
                    fields: ['a', 'b', 'c']
                }, {
                    type: 'category',
                    position: 'bottom'
                }],
                series: {
                    type: 'bar',
                    stacked: true,
                    xField: 'xfield',
                    yField: ['a', 'b', 'c']
                }
            });

            // Series create 3 bar series sprites (Ext.chart.series.sprite.Bar - marker holder)
            // and 3 marker sprites (Ext.chart.Markers) with 'rect' sprite as a template.
            // So 6 sprites total are in the 'series' surface. The 'rect' sprite templates belong
            // to the markers themselves.
            // This actually checks MarkerHolder's 'destroy' method as well.

            var series = chart.getSeries()[0];
            series.setChart(null);
            expect(chart.getSurface('series').getItems().length).toBe(0);

            chart.destroy();
        });
    });

    describe('showMarkers config', function () {
        var chart, series;

        beforeEach(function () {
            chart = new Ext.chart.CartesianChart({
                renderTo: Ext.getBody(),
                width: 300,
                height: 200,
                innerPadding: 10,
                animation: false,
                store: {
                    fields: ['x', 'y1', 'y2'],
                    data: [
                        {
                            x: 0,
                            y1: 1,
                            y2: 2
                        },
                        {
                            x: 1,
                            y1: 5,
                            y2: 4
                        },
                        {
                            x: 2,
                            y1: 2,
                            y2: 3
                        }
                    ]
                },
                axes: [{
                    type: 'numeric',
                    position: 'left'
                }, {
                    type: 'category',
                    position: 'bottom'
                }],
                series: [{
                    type: 'line',
                    xField: 'x',
                    yField: 'y1',
                    marker: {
                        type: 'square'
                    },
                    showMarkers: false
                }, {
                    type: 'line',
                    xField: 'x',
                    yField: 'y2',
                    marker: {
                        type: 'arrow'
                    },
                    showMarkers: true
                }]
            });
            chart.performLayout();
            series = chart.getSeries();
        });

        afterEach(function () {
            series = chart = Ext.destroy(chart);
        });

        it("should work with initial value of 'false'", function () {
            var sprite = series[0].getSprites()[0],
                markers = sprite.getMarker('markers'),
                template = markers.getTemplate();

            expect(template.attr.hidden).toBe(true);
        });
        it("should toggle properly from false to true", function () {
            var seriesItem = series[0],
                sprite = seriesItem.getSprites()[0],
                markers = sprite.getMarker('markers'),
                template = markers.getTemplate();

            expect(template.attr.hidden).toBe(true);
            seriesItem.setShowMarkers(true);
            expect(template.attr.hidden).toBe(false);
        });
        it("should toggle properly from true to false", function () {
            var seriesItem = series[1],
                sprite = seriesItem.getSprites()[0],
                markers = sprite.getMarker('markers'),
                template = markers.getTemplate();

            expect(template.attr.hidden).toBe(false);
            seriesItem.setShowMarkers(false);
            expect(template.attr.hidden).toBe(true);
        });
        it("should remain 'false' after series itself are hidden and shown again", function () {
            var seriesItem = series[0],
                sprite = seriesItem.getSprites()[0],
                markers = sprite.getMarker('markers'),
                template = markers.getTemplate();

            expect(template.attr.hidden).toBe(true);
            seriesItem.setHiddenByIndex(0, true);
            seriesItem.setHiddenByIndex(0, false);
            expect(template.attr.hidden).toBe(true);
        });

        it("should remain 'true' after series itself are hidden and shown again", function () {
            var seriesItem = series[1],
                sprite = seriesItem.getSprites()[0],
                markers = sprite.getMarker('markers'),
                template = markers.getTemplate();

            expect(template.attr.hidden).toBe(false);
            seriesItem.setHiddenByIndex(0, true);
            seriesItem.setHiddenByIndex(0, false);
            expect(template.attr.hidden).toBe(false);
        });

    });

});