describe("Ext.chart.legend.SpriteLegend", function () {

    function generateStoreData(pointCount) {

        var data = [
                { month: 'Jan' },
                { month: 'Feb' },
                { month: 'Mar' },
                { month: 'Apr' },
                { month: 'May' },
                { month: 'Jun' },
                { month: 'Jul' },
                { month: 'Aug' },
                { month: 'Sep' },
                { month: 'Oct' },
                { month: 'Nov' },
                { month: 'Dec' }
            ],
            i = 0,
            j = 0,
            ln = data.length,
            entry;

        for (; i < ln; i++) {
            entry = data[i];
            for (j = 0; j < pointCount; j++) {
                entry['data' + (j + 1).toString()] = Math.random() * 10
            }
        }

        return data;
    }

    describe("updateTheme", function () {
        var storeData = generateStoreData(2);

        var chartConfig = {
            width: 400,
            height: 300,
            renderTo: document.body,
            axes: [{
                type: 'numeric',
                position: 'left',
                adjustByMajorUnit: true,
                grid: true,
                fields: ['data1'],
                minimum: 0
            }, {
                type: 'category',
                position: 'bottom',
                grid: true,
                fields: ['month'],
                label: {
                    rotate: {
                        degrees: -45
                    }
                }
            }],
            series: [{
                type: 'bar',
                title: [ 'IE', 'Firefox' ],
                xField: 'month',
                yField: [ 'data1', 'data2' ],
                stacked: true,
                style: {
                    opacity: 0.80
                },
                highlight: {
                    fillStyle: 'yellow'
                }
            }]
        };

        var store, chart;

        beforeEach(function () {
            store = new Ext.data.Store({
                fields: [ 'month', 'data1', 'data2' ],
                data: storeData
            });
        });

        afterEach(function () {
            Ext.destroy(store, chart);
        });

        it("should use the style from the theme, " +
            "if the user hasn't provided their own config", function () {
            var CustomTheme = Ext.define(null, {
                extend: 'Ext.chart.theme.Base',
                singleton: true,
                config: {
                    legend: {
                        label: {
                            fontSize: 15,
                            fontWeight: 'bold',
                            fontFamily: 'Tahoma',
                            fillStyle: '#ff0000'
                        },
                        border: {
                            lineWidth: 2,
                            radius: 5,
                            fillStyle: '#ffff00',
                            strokeStyle: '#ff0000'
                        }
                    }
                }
            });

            var config = Ext.merge({
                theme: new CustomTheme,
                store: store,
                legend: {
                    type: 'sprite',
                    docked: 'top'
                }
            }, chartConfig);

            chart = new Ext.chart.CartesianChart(config);

            var legend = chart.getLegend();
            var borderSprite = legend.getBorder();
            var itemSprites = legend.getSprites();

            expect(borderSprite.attr.lineWidth).toBe(2);
            expect(borderSprite.attr.radius).toBe(5);
            expect(borderSprite.attr.fillStyle).toBe('#ffff00');
            expect(borderSprite.attr.strokeStyle).toBe('#ff0000');

            for (var i = 0, ln = itemSprites.length; i < ln; i++) {
                var label = itemSprites[i].getLabel();

                expect(label.attr.fontSize).toBe('15px');
                expect(label.attr.fontWeight).toBe('bold');
                expect(label.attr.fontFamily).toBe('Tahoma');
                expect(label.attr.fillStyle).toBe('#ff0000');
            }
        });

        it("should should use the style from the user config, if it was provided", function () {
            var config = Ext.merge({
                store: store,
                legend: {
                    type: 'sprite',
                    docked: 'top',
                    label: {
                        fontSize: 15,
                        fontWeight: 'bold',
                        fontFamily: 'Tahoma',
                        fillStyle: '#ff0000'
                    },
                    border: {
                        lineWidth: 2,
                        radius: 5,
                        fillStyle: '#ffff00',
                        strokeStyle: '#ff0000'
                    }
                }
            }, chartConfig);

            chart = new Ext.chart.CartesianChart(config);

            var legend = chart.getLegend();
            var borderSprite = legend.getBorder();
            var itemSprites = legend.getSprites();

            expect(borderSprite.attr.lineWidth).toBe(2);
            expect(borderSprite.attr.radius).toBe(5);
            expect(borderSprite.attr.fillStyle).toBe('#ffff00');
            expect(borderSprite.attr.strokeStyle).toBe('#ff0000');

            for (var i = 0, ln = itemSprites.length; i < ln; i++) {
                var label = itemSprites[i].getLabel();

                expect(label.attr.fontSize).toBe('15px');
                expect(label.attr.fontWeight).toBe('bold');
                expect(label.attr.fontFamily).toBe('Tahoma');
                expect(label.attr.fillStyle).toBe('#ff0000');
            }
        });
    });

    describe("store", function () {
        var storeData = generateStoreData(4),
            store, chart;

        beforeEach(function () {
            store = new Ext.data.Store({
                fields: [ 'month', 'data1', 'data2', 'data3', 'data4' ],
                data: storeData
            });
            chart = new Ext.chart.CartesianChart({
                width: 400,
                height: 300,
                renderTo: document.body,

                store: store,
                legend: {
                    type: 'sprite',
                    docked: 'top'
                },
                axes: [{
                    type: 'numeric',
                    position: 'left',
                    adjustByMajorUnit: true,
                    grid: true,
                    fields: ['data1'],
                    minimum: 0
                }, {
                    type: 'category',
                    position: 'bottom',
                    grid: true,
                    fields: ['month'],
                    label: {
                        rotate: {
                            degrees: -45
                        }
                    }
                }],
                series: [{
                    type: 'bar',
                    title: [ 'IE', 'Firefox', 'Chrome', 'Safari' ],
                    xField: 'month',
                    yField: [ 'data1', 'data2', 'data3', 'data4' ],
                    stacked: true,
                    style: {
                        opacity: 0.80
                    },
                    highlight: {
                        fillStyle: 'yellow'
                    }
                }]
            });
        });

        afterEach(function () {
            Ext.destroy(chart, store);
        });

        it("should trigger sprite/layout update on data update", function () {
            var series = chart.getSeries()[0];
            var legend = chart.getLegend();
            var originalMethod = legend.performLayout;
            var oldBorderWidth, newBorderWidth;
            var oldSecondItem, oldSecondItemX, newSecondItem, newSecondItemX;
            var layoutDone;

            legend.performLayout = function () {
                originalMethod.call(legend);
                layoutDone = true;
            };

            runs(function () {
                legend.scheduleLayout();
            });

            waitsFor(function () {
                return layoutDone;
            }, "initial layout to finish");

            runs(function () {
                oldBorderWidth = legend.borderSprite.getBBox().width;
                oldSecondItem = legend.getSprites()[1];
                oldSecondItemX = oldSecondItem.getBBox().x;
                expect(oldSecondItemX > 0).toBe(true);
            });

            runs(function () {
                layoutDone = false;
                series.setTitle([ 'Edge', 'Firewall', 'Cross', 'Savanna' ]);
            });

            waitsFor(function () {
                return layoutDone;
            });

            runs(function () {
                newBorderWidth = legend.borderSprite.getBBox().width;
                expect(newBorderWidth > oldBorderWidth).toBe(true);
                newSecondItem = legend.getSprites()[1];
                // The sprite should be reused.
                expect(newSecondItem).toEqual(oldSecondItem);
                expect(newSecondItem.getLabel().attr.text).toEqual('Firewall');
                newSecondItemX = newSecondItem.getBBox().x;
                expect(newSecondItemX > oldSecondItemX).toBe(true);

                legend.performLayout = originalMethod;
            });
        });

        it("should trigger sprite/layout update on data change", function () {
            var series = chart.getSeries()[0];
            var legend = chart.getLegend();
            var originalMethod = legend.performLayout;
            var oldBorderWidth, newBorderWidth;
            var oldSecondItem, oldSecondItemX, newSecondItem, newSecondItemX, lastItem;
            var layoutDone;

            legend.performLayout = function () {
                originalMethod.call(legend);
                layoutDone = true;
            };

            runs(function () {
                legend.scheduleLayout();
            });

            waitsFor(function () {
                return layoutDone;
            }, "initial layout to finish");

            runs(function () {
                oldBorderWidth = legend.borderSprite.getBBox().width;
                oldSecondItem = legend.getSprites()[1];
                oldSecondItemX = oldSecondItem.getBBox().x;
                expect(oldSecondItemX > 0).toBe(true);
                lastItem = legend.getSprites()[3];
            });

            runs(function () {
                layoutDone = false;
                series.setTitle([ 'IE', 'Chrome', 'Safari' ]);
            });

            waitsFor(function () {
                return layoutDone;
            });

            runs(function () {
                newBorderWidth = legend.borderSprite.getBBox().width;
                expect(newBorderWidth < oldBorderWidth).toBe(true);
                newSecondItem = legend.getSprites()[1];
                // The sprite should be reused.
                expect(newSecondItem).toEqual(oldSecondItem);
                expect(newSecondItem.getLabel().attr.text).toEqual('Chrome');
                expect(legend.getSprites().length).toBe(4);
                newSecondItemX = newSecondItem.getBBox().x;
                // The second sprite now displays the third title ('Chrome'),
                // but because the whole legend is centered, it should actually
                // move to the right, as there is now one less item.
                expect(newSecondItemX > oldSecondItemX).toBe(true);
                expect(legend.getSprites()[3].getLabel().attr.text).toBe('data4');

                legend.performLayout = originalMethod;
            });
        });

        it("should trigger sprite/layout update on data sort", function () {
            var legend = chart.getLegend();
            var originalMethod = legend.performLayout;
            var oldBorderWidth, newBorderWidth;
            var sprites = legend.getSprites();
            var layoutDone;

            legend.performLayout = function () {
                originalMethod.call(legend);
                layoutDone = true;
            };

            function checkPositions(sprites) {
                expect(sprites[0].getBBox().x < sprites[1].getBBox().x).toBe(true);
                expect(sprites[1].getBBox().x < sprites[2].getBBox().x).toBe(true);
                expect(sprites[2].getBBox().x < sprites[3].getBBox().x).toBe(true);
            }

            runs(function () {
                legend.scheduleLayout();
            });

            waitsFor(function () {
                return layoutDone;
            }, "initial legend layout to finish");

            runs(function () {
                // Initial positions:
                // IE - Firefox - Chrome - Safari
                checkPositions(sprites);

                oldBorderWidth = legend.borderSprite.getBBox().width;
            });

            runs(function () {
                layoutDone = false;
                chart.legendStore.sort('name', 'DESC');
            });

            waitsFor(function () {
                return layoutDone;
            }, "legend layout to finish after DESC sort");

            runs(function () {
                newBorderWidth = legend.borderSprite.getBBox().width;
                // The sum of all sprite widths should stay the same,
                // and thus the legend border width too.
                expect(newBorderWidth).toEqual(oldBorderWidth);

                // Safari - IE - Firefox - Chrome
                expect(sprites[0].getLabel().attr.text).toBe('Safari');
                expect(sprites[1].getLabel().attr.text).toBe('IE');
                expect(sprites[2].getLabel().attr.text).toBe('Firefox');
                expect(sprites[3].getLabel().attr.text).toBe('Chrome');

                // Relative positions of the sprites should stay the same.
                checkPositions(sprites);
            });

            runs(function () {
                layoutDone = false;
                chart.legendStore.sort('name', 'ASC');
            });

            waitsFor(function () {
                return layoutDone;
            }, "legend layout to finish after ASC sort");

            runs(function () {
                // Chrome - Firefox - IE - Safari
                expect(sprites[0].getLabel().attr.text).toBe('Chrome');
                expect(sprites[1].getLabel().attr.text).toBe('Firefox');
                expect(sprites[2].getLabel().attr.text).toBe('IE');
                expect(sprites[3].getLabel().attr.text).toBe('Safari');

                // Relative positions of the sprites should stay the same.
                checkPositions(sprites);
            });

        });
    });
});