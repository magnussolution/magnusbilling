describe('Ext.chart.series.Pie.classic', function () {

    describe('label.display', function () {
        it('should hide the labels if set to `none`', function () {
            var chart,
                redrawCount = 0;

            runs(function () {
                chart = new Ext.chart.PolarChart({
                    renderTo: document.body,
                    animation: false,
                    interactions: 'rotate',
                    height: 400,
                    width: 400,
                    innerPadding: 20,
                    series: {
                        type: 'pie',
                        angleField: 'data1',
                        label: {
                            field: 'name',
                            display: 'none'
                        }
                    },
                    store: {
                        fields: ['name', 'data1'],
                        data: [{
                            name: 'metric one',
                            data1: 200
                        }, {
                            name: 'metric two',
                            data1: 100
                        }]
                    },
                    listeners: {
                        redraw: function () {
                            redrawCount++;
                        }
                    }
                });
            });
            waitsFor(function () {
                return redrawCount >= 2;
            });
            runs(function () {
                var series = chart.getSeries()[0];
                var labels = series.getSprites()[0].getMarker('labels');
                expect(labels.instances[0].hidden).toBe(false);
                expect(labels.instances[1].hidden).toBe(false);
                expect(labels.attr.hidden).toBe(true);

                series.setLabel({
                    display: 'inside'
                });
                expect(labels.instances[0].display).toBe('inside');
                expect(labels.instances[1].display).toBe('inside');
                expect(labels.instances[0].hidden).toBe(false);
                expect(labels.instances[1].hidden).toBe(false);
                expect(labels.attr.hidden).toBe(false);

                Ext.destroy(chart);
            });
        });
    });

});