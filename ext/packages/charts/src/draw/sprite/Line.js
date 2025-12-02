/**
 * A sprite that represents a line.
 *
 *     @example
 *     Ext.create({
 *        xtype: 'draw', 
 *        renderTo: document.body,
 *        width: 600,
 *        height: 400,
 *        sprites: [{
 *            type: 'line',
 *            fromX: 20,
 *            fromY: 20,
 *            toX: 120,
 *            toY: 120,
 *            strokeStyle: '#1F6D91',
 *            lineWidth: 3
 *        }]
 *     });
 */
Ext.define('Ext.draw.sprite.Line', {
    extend: 'Ext.draw.sprite.Sprite',
    alias: 'sprite.line',
    type: 'line',

    inheritableStatics: {
        def: {
            processors: {
                fromX: 'number',
                fromY: 'number',
                toX: 'number',
                toY: 'number'
            },

            defaults: {
                fromX: 0,
                fromY: 0,
                toX: 1,
                toY: 1,
                strokeStyle: 'black'
            },

            aliases: {
                x1: 'fromX',
                y1: 'fromY',
                x2: 'toX',
                y2: 'toY'
            }
        }
    },

    updateLineBBox: function (bbox, isTransform, x1, y1, x2, y2) {
        var attr = this.attr,
            matrix = attr.matrix,
            halfLineWidth = attr.lineWidth / 2,
            fromX, fromY, toX, toY,
            dx, dy,
            p;

        if (isTransform) {
            p = matrix.transformPoint([x1, y1]);
            x1 = p[0];
            y1 = p[1];

            p = matrix.transformPoint([x2, y2]);
            x2 = p[0];
            y2 = p[1];
        }

        fromX = Math.min(x1, x2);
        toX   = Math.max(x1, x2);

        fromY = Math.min(y1, y2);
        toY   = Math.max(y1, y2);

        var angle = Math.atan2(toX - fromX, toY - fromY),
            sin = Math.sin(angle),
            cos = Math.cos(angle),
            dx = halfLineWidth * cos,
            dy = halfLineWidth * sin;

        // Offset start and end points of the line by half its thickness,
        // while accounting for line's angle.
        fromX -= dx;
        fromY -= dy;
        toX += dx;
        toY += dy;

        bbox.x = fromX;
        bbox.y = fromY;
        bbox.width = toX - fromX;
        bbox.height = toY - fromY;
    },

    updatePlainBBox: function (plain) {
        var attr = this.attr;

        this.updateLineBBox(plain, false, attr.fromX, attr.fromY, attr.toX, attr.toY);
    },

    updateTransformedBBox: function (transform, plain) {
        var attr = this.attr;

        this.updateLineBBox(transform, true, attr.fromX, attr.fromY, attr.toX, attr.toY);
    },

    render: function (surface, ctx) {
        var attr = this.attr,
            matrix = this.attr.matrix;

        matrix.toContext(ctx);

        ctx.beginPath();
        ctx.moveTo(attr.fromX, attr.fromY);
        ctx.lineTo(attr.toX, attr.toY);
        ctx.stroke();

        //<debug>
        var debug = attr.debug || this.statics().debug || Ext.draw.sprite.Sprite.debug;
        if (debug) {
            // This assumes no part of the sprite is rendered after this call.
            // If it is, we need to re-apply transformations.
            // But the bounding box should always be rendered as is, untransformed.
            this.attr.inverseMatrix.toContext(ctx);
            debug.bbox && this.renderBBox(surface, ctx);
        }
        //</debug>
    }
});