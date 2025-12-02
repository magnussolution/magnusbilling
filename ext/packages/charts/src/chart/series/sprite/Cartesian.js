/**
 * @class Ext.chart.series.sprite.Cartesian
 * @extends Ext.draw.sprite.Sprite
 *
 * Cartesian sprite.
 */
Ext.define('Ext.chart.series.sprite.Cartesian', {
    extend: 'Ext.chart.series.sprite.Series',

    inheritableStatics: {
        def: {
            processors: {
                /**
                 * @cfg {Object} [labels=null] Labels used in the series.
                 */
                labels: 'default',

                /**
                 * @cfg {Number} [labelOverflowPadding=10] Padding around labels to determine overlap.
                 */
                labelOverflowPadding: 'number',

                /**
                 * @cfg {Number} [selectionTolerance=20]
                 * The distance from the event position to the sprite's data points to trigger interactions (used for 'iteminfo', etc).
                 */
                selectionTolerance: 'number',

                /**
                 * @cfg {Boolean} flipXY If flipXY is 'true', the series is flipped.
                 */
                flipXY: 'bool',

                renderer: 'default',

                // PanZoom information
                visibleMinX: 'number',
                visibleMinY: 'number',
                visibleMaxX: 'number',
                visibleMaxY: 'number',
                innerWidth: 'number',
                innerHeight: 'number'
            },
            defaults: {
                labels: null,
                labelOverflowPadding: 10,
                selectionTolerance: 20,
                flipXY: false,
                renderer: null,
                transformFillStroke: false,

                visibleMinX: 0,
                visibleMinY: 0,
                visibleMaxX: 1,
                visibleMaxY: 1,
                innerWidth: 1,
                innerHeight: 1
            },
            triggers: {
                dataX: 'dataX,bbox',
                dataY: 'dataY,bbox',
                visibleMinX: 'panzoom',
                visibleMinY: 'panzoom',
                visibleMaxX: 'panzoom',
                visibleMaxY: 'panzoom',
                innerWidth: 'panzoom',
                innerHeight: 'panzoom'
            },
            updaters: {
                dataX: function (attr) {
                    this.processDataX();
                    this.scheduleUpdater(attr, 'dataY', ['dataY']);
                },

                dataY: function () {
                    this.processDataY();
                },

                panzoom: function (attr) {
                    var dx = attr.visibleMaxX - attr.visibleMinX,
                        dy = attr.visibleMaxY - attr.visibleMinY,
                        innerWidth = attr.flipXY ? attr.innerHeight : attr.innerWidth,
                        innerHeight = !attr.flipXY ? attr.innerHeight : attr.innerWidth,
                        surface = this.getSurface(),
                        isRtl = surface ? surface.getInherited().rtl : false;

                    if (isRtl && !attr.flipXY) {
                        attr.translationX = innerWidth + attr.visibleMinX * innerWidth / dx;
                    } else {
                        attr.translationX = -attr.visibleMinX * innerWidth / dx;
                    }
                    attr.translationY = -attr.visibleMinY * innerHeight / dy;
                    attr.scalingX = (isRtl && !attr.flipXY ? -1 : 1) * innerWidth / dx;
                    attr.scalingY = innerHeight / dy;
                    attr.scalingCenterX = 0;
                    attr.scalingCenterY = 0;
                    this.applyTransformations(true);
                }
            }
        }
    },

    processDataY: Ext.emptyFn,

    processDataX: Ext.emptyFn,

    updatePlainBBox: function (plain) {
        var attr = this.attr;
        plain.x = attr.dataMinX;
        plain.y = attr.dataMinY;
        plain.width = attr.dataMaxX - attr.dataMinX;
        plain.height = attr.dataMaxY - attr.dataMinY;
    },

    /**
     * Does a binary search of the data on the x-axis using the given key.
     * @param {String} key
     * @return {*}
     */
    binarySearch: function (key) {
        var dx = this.attr.dataX,
            start = 0,
            end = dx.length;
        if (key <= dx[0]) {
            return start;
        }
        if (key >= dx[end - 1]) {
            return end - 1;
        }
        while (start + 1 < end) {
            var mid = (start + end) >> 1,
                val = dx[mid];
            if (val === key) {
                return mid;
            } else if (val < key) {
                start = mid;
            } else {
                end = mid;
            }
        }
        return start;
    },

    render: function (surface, ctx, rect) {
        var me = this,
            attr = me.attr,
            inverseMatrix = attr.inverseMatrix.clone();

        inverseMatrix.appendMatrix(surface.inverseMatrix);

        if (attr.dataX === null || attr.dataX === undefined) {
            return;
        }
        if (attr.dataY === null || attr.dataY === undefined) {
            return;
        }

        if (inverseMatrix.getXX() * inverseMatrix.getYX() || inverseMatrix.getXY() * inverseMatrix.getYY()) {
            console.log('Cartesian Series sprite does not support rotation/sheering');
            return;
        }

        var clip = inverseMatrix.transformList([
            [rect[0] - 1, rect[3] + 1],
            [rect[0] + rect[2] + 1, -1]
        ]);

        clip = clip[0].concat(clip[1]);

        me.renderClipped(surface, ctx, clip, rect);
    },

    /**
     * @method
     * Render the given visible clip range.
     * @param {Ext.draw.Surface} surface
     * @param {Ext.draw.engine.Canvas/Ext.draw.engine.SvgContext} ctx
     * @param {Array} clip
     * @param {Array} rect
     */
    renderClipped: Ext.emptyFn,

    /**
     * Get the nearest item index from point (x, y). -1 as not found.
     * @param {Number} x
     * @param {Number} y
     * @return {Number} The index
     */
    getIndexNearPoint: function (x, y) {
        var me = this,
            mat = me.attr.matrix,
            dataX = me.attr.dataX,
            dataY = me.attr.dataY,
            selectionTolerance = me.attr.selectionTolerance,
            minX, minY, index = -1,
            imat = mat.clone().prependMatrix(me.surfaceMatrix).inverse(),
            center = imat.transformPoint([x, y]),
            positionLB = imat.transformPoint([x - selectionTolerance, y - selectionTolerance]),
            positionTR = imat.transformPoint([x + selectionTolerance, y + selectionTolerance]),
            left = Math.min(positionLB[0], positionTR[0]),
            right = Math.max(positionLB[0], positionTR[0]),
            top = Math.min(positionLB[1], positionTR[1]),
            bottom = Math.max(positionLB[1], positionTR[1]),
            xi, yi, i, len;

        for (i = 0, len = dataX.length; i < len; i++) {
            xi = dataX[i];
            yi = dataY[i];
            if (xi > left && xi < right && yi > top && yi < bottom) {
                if (index === -1 || (Math.abs(xi - center[0]) < minX) && (Math.abs(yi - center[1]) < minY)) {
                    minX = Math.abs(xi - center[0]);
                    minY = Math.abs(yi - center[1]);
                    index = i;
                }
            }
        }

        return index;
    }
});
