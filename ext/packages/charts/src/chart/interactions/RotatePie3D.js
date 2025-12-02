/**
 * @class Ext.chart.interactions.RotatePie3D
 * @extends Ext.chart.interactions.Rotate
 *
 * A special version of the Rotate interaction used by Pie3D Chart.
 */
Ext.define('Ext.chart.interactions.RotatePie3D', {

    extend: 'Ext.chart.interactions.Rotate',

    type: 'rotatePie3d',

    alias: 'interaction.rotatePie3d',

    getAngle: function (e) {
        var chart = this.getChart(),
            rtl = chart.getInherited().rtl,
            direction = rtl ? -1 : 1,
            pageXY = e.getXY(),
            xy = chart.element.getXY(),
            rect = chart.getMainRect();

        return direction * Math.atan2(
            pageXY[1] - xy[1] - rect[3] * 0.5,
            pageXY[0] - xy[0] - rect[2] * 0.5
        );
    },

    getRadius: function (e) {
        var chart = this.getChart(),
            radius = chart.getRadius(),
            seriesList = chart.getSeries(),
            ln = seriesList.length,
            i = 0,
            series, seriesRadius;

        // With 3D pie series, series may have a radius that is
        // different from the radius of the chart, because the 'pie3d'
        // series will automatically adjust its radius based on
        // distortion, thickness and other configs.
        // It's not critical to check if the series radius is smaller
        // than the chart radius, since the base Rotate interaction
        // will rotate all series there are anyway.
        // Rotating series individually (i.e. if having multiple concentric
        // pie series) is not possible with neither this nor the base Rotate
        // interaction.
        for (; i < ln; i++) {
            series = seriesList[i];
            if (series.is3D) {
                seriesRadius = series.getRadius();
                if (seriesRadius > radius) {
                    radius = seriesRadius;
                }
            }
        }

        return radius;
    }

});
