describe('Ext.chart.series.Area', function () {

    describe('renderer', function () {
        it('should work on markers with style.step = false', function () {
            var chart,
                red = '#ff0000',
                green = '#ff0000',
                redrawCount = 0;

            run(function () {
                chart = new Ext.chart.CartesianChart({
                    renderTo: Ext.getBody(),
                    width: 300,
                    height: 300,
                    store: {
                        data: [{
                            month: 'JAN',
                            data1: 12
                        }, {
                            month: 'FEB',
                            data1: 14
                        }, {
                            month: 'MAR',
                            data1: 10
                        }, {
                            month: 'APR',
                            data1: 18
                        }, {
                            month: 'MAY',
                            data1: 17
                        }]
                    },
                    axes: [{
                        type: 'numeric',
                        position: 'left'
                    }, {
                        type: 'category',
                        position: 'bottom'
                    }],
                    series: [{
                        type: 'area',
                        renderer: function (sprite, config, rendererData, index) {
                            return {
                                fillStyle: index % 2 ? red : green
                            };
                        },
                        xField: 'month',
                        yField: 'data1',
                        marker: true
                    }],
                    listeners: {
                        redraw: function () {
                            redrawCount++;
                        }
                    }
                })
            });

            waitFor(function () {
                // Chart normally renders twice:
                // 1) to measure things
                // 2) to adjust layout
                return redrawCount == 2;
            });

            run(function () {
                var seriesSprite = chart.getSeries()[0].getSprites()[0],
                    markerCategory = seriesSprite.getId(),
                    markers = seriesSprite.getMarker('markers');

                expect(markers.getMarkerFor(markerCategory, 0).fillStyle).toBe(green);
                expect(markers.getMarkerFor(markerCategory, 1).fillStyle).toBe(red);
                expect(markers.getMarkerFor(markerCategory, 2).fillStyle).toBe(green);
                expect(markers.getMarkerFor(markerCategory, 3).fillStyle).toBe(red);

                Ext.destroy(chart);
            });
        });

        it('should work on markers with style.step = true', function () {
            var chart,
                red = '#ff0000',
                green = '#ff0000',
                redrawCount = 0;

            run(function () {
                chart = new Ext.chart.CartesianChart({
                    renderTo: Ext.getBody(),
                    width: 300,
                    height: 300,
                    store: {
                        data: [{
                            month: 'JAN',
                            data1: 12
                        }, {
                            month: 'FEB',
                            data1: 14
                        }, {
                            month: 'MAR',
                            data1: 10
                        }, {
                            month: 'APR',
                            data1: 18
                        }, {
                            month: 'MAY',
                            data1: 17
                        }]
                    },
                    axes: [{
                        type: 'numeric',
                        position: 'left'
                    }, {
                        type: 'category',
                        position: 'bottom'
                    }],
                    series: [{
                        type: 'area',
                        style: {
                            step: true
                        },
                        renderer: function (sprite, config, rendererData, index) {
                            return {
                                fillStyle: index % 2 ? red : green
                            };
                        },
                        xField: 'month',
                        yField: 'data1',
                        marker: true
                    }],
                    listeners: {
                        redraw: function () {
                            redrawCount++;
                        }
                    }
                })
            });

            waitFor(function () {
                // Chart normally renders twice:
                // 1) to measure things
                // 2) to adjust layout
                return redrawCount == 2;
            });

            run(function () {
                var seriesSprite = chart.getSeries()[0].getSprites()[0],
                    markerCategory = seriesSprite.getId(),
                    markers = seriesSprite.getMarker('markers');

                expect(markers.getMarkerFor(markerCategory, 0).fillStyle).toBe(green);
                expect(markers.getMarkerFor(markerCategory, 1).fillStyle).toBe(red);
                expect(markers.getMarkerFor(markerCategory, 2).fillStyle).toBe(green);
                expect(markers.getMarkerFor(markerCategory, 3).fillStyle).toBe(red);

                Ext.destroy(chart);
            });
        });
    });

});