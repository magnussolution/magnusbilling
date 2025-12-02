/**
 * @class Ext.chart.series.Pie3D
 * @extends Ext.chart.series.Polar
 *
 * Creates a 3D Pie Chart.
 *
 * **Note:** Labels, legends, and lines are not currently available when using the
 * 3D Pie chart series.
 *
 *     @example
 *     Ext.create({
 *        xtype: 'polar', 
 *        renderTo: document.body,
 *        width: 600,
 *        height: 400,
 *        theme: 'green',
 *        interactions: 'rotate',
 *        store: {
 *            fields: ['data3'],
 *            data: [{
 *                'data3': 14
 *            }, {
 *                'data3': 16
 *            }, {
 *                'data3': 14
 *            }, {
 *                'data3': 6
 *            }, {
 *                'data3': 36
 *            }]
 *        },
 *        series: {
 *            type: 'pie3d',
 *            angleField: 'data3',
 *            donut: 30
 *        }
 *     });
 */
Ext.define('Ext.chart.series.Pie3D', {
    extend: 'Ext.chart.series.Polar',

    requires: [
        'Ext.chart.series.sprite.Pie3DPart',
        'Ext.draw.PathUtil'
    ],

    type: 'pie3d',
    seriesType: 'pie3d',
    alias: 'series.pie3d',
    is3D: true,

    config: {
        rect: [0, 0, 0, 0],
        thickness: 35,
        distortion: 0.5,

        /**
         * @cfg {String} angleField (required)
         * The store record field name to be used for the pie angles.
         * The values bound to this field name must be positive real numbers.
         */

        /**
         * @private
         * @cfg {String} radiusField
         * Not supported.
         */

        /**
         * @cfg {Boolean/Number} donut
         * Whether to set the pie chart as donut chart.
         * Can be set to a particular percentage to set the radius
         * of the donut chart.
         */
        donut: false,

        /**
         * @cfg {Array} hidden Determines which pie slices are hidden.
         */
        hidden: [], // Populated by the coordinateX method.

        /**
         * @cfg {Object} highlightCfg Default {@link #highlight} config for the 3D pie series.
         * Slides highlighted pie sector outward.
         */
        highlightCfg: {
            margin: 20
        },

        /**
         * @cfg {Number} [rotation=0] The starting angle of the pie slices.
         */

        /**
         * @private
         * @cfg {Boolean/Object} [shadow=false]
         */
        shadow: false
    },

    // Subtract 90 degrees from rotation, so that `rotation` config's default
    // zero value makes first pie sector start at noon, rather than 3 o'clock.
    rotationOffset: -Math.PI / 2,

    setField: function (value) {
        return this.setXField(value);
    },

    getField: function () {
        return this.getXField();
    },

    updateRotation: function (rotation) {
        this.setStyle({
            baseRotation: rotation + this.rotationOffset
        });
        this.doUpdateStyles();
    },

    updateDistortion: function () {
        this.setRadius();
    },

    updateThickness: function () {
        this.setRadius();
    },

    updateColors: function (colors) {
        this.setSubStyle({baseColor: colors});
    },

    applyShadow: function (shadow) {
        if (shadow === true) {
            shadow = {
                shadowColor: 'rgba(0,0,0,0.8)',
                shadowBlur: 30
            };
        } else if (!Ext.isObject(shadow)) {
            shadow = {
                shadowColor: Ext.util.Color.RGBA_NONE
            };
        }

        return shadow;
    },

    updateShadow: function (shadow) {
        var me = this,
            sprites = me.getSprites(),
            spritesPerSlice = me.spritesPerSlice,
            ln = sprites && sprites.length,
            i, sprite;

        for (i = 1; i < ln; i += spritesPerSlice) {
            sprite = sprites[i];
            if (sprite.attr.part = 'bottom') {
                sprite.setAttributes(shadow);
            }
        }
    },

    // This is a temporary solution until the Series.getStyleByIndex is fixed
    // to give user styles the priority over theme ones. Also, for sprites of
    // this particular series, the fillStyle shouldn't be set directly. Instead,
    // the 'baseColor' attribute should be set, from which the stops of the
    // gradient (used for fillStyle) will be calculated. Themes can't handle
    // situations like that properly.
    getStyleByIndex: function (i) {
        var indexStyle = this.callParent([i]),
            style = this.getStyle(),
            // 'fill' and 'color' are 'fillStyle' aliases
            // (see Ext.draw.sprite.Sprite.inheritableStatics.def.aliases)
            fillStyle = indexStyle.fillStyle || indexStyle.fill || indexStyle.color,
            strokeStyle = style.strokeStyle || style.stroke;

        if (fillStyle) {
            indexStyle.baseColor = fillStyle;
            delete indexStyle.fillStyle;
            delete indexStyle.fill;
            delete indexStyle.color;
        }
        if (strokeStyle) {
            indexStyle.strokeStyle = strokeStyle;
        }

        return indexStyle;
    },

    doUpdateStyles: function () {
        var me = this,
            sprites = me.getSprites(),
            spritesPerSlice = me.spritesPerSlice,
            ln = sprites && sprites.length,
            i = 0, j = 0, k,
            style;

        for (; i < ln; i += spritesPerSlice, j++) {
            style = me.getStyleByIndex(j);
            for (k = 0; k < spritesPerSlice; k++) {
                sprites[i + k].setAttributes(style);
            }
        }
    },

    coordinateX: function () {
        var me = this,
            chart = me.getChart(),
            animation = chart && chart.getAnimation(),
            store = me.getStore(),
            records = store.getData().items,
            recordCount = records.length,
            xField = me.getXField(),
            rotation = me.getRotation(),
            hidden = me.getHidden(),
            value, sum = 0, ratio,
            summation = [],
            sprites = me.getSprites(),
            spriteCount = sprites.length,
            spritesPerSlice = me.spritesPerSlice,
            lastAngle = 0,
            twoPi = Math.PI * 2,
            // To avoid adjacent start/end part blinking (z-index jitter)
            // when rotating a translucent pie chart.
            delta = 1e-10,
            i, j;

        for (i = 0; i < recordCount; i++) {
            value = Math.abs(Number(records[i].get(xField))) || 0;
            if (!hidden[i]) {
                sum += value;
            }
            summation[i] = sum;
            if (i >= hidden.length) {
                hidden[i] = false;
            }
        }
        hidden.length = recordCount;

        if (sum === 0) {
            return;
        }
        ratio = 2 * Math.PI / sum;
        for (i = 0; i < recordCount; i++) {
            summation[i] *= ratio;
        }

        for (i = 0; i < spriteCount; i++) {
            sprites[i].setAnimation(animation);
        }

        for (i = 0; i < recordCount; i++) {
            for (j = 0; j < spritesPerSlice; j++) {
                sprites[i * spritesPerSlice + j].setAttributes({
                    startAngle: lastAngle,
                    endAngle: summation[i] - delta,
                    globalAlpha: 1,
                    baseRotation: rotation
                });
            }
            lastAngle = summation[i];
        }

        for (i *= spritesPerSlice; i < spriteCount; i++) {
            sprites[i].setAnimation(animation);
            sprites[i].setAttributes({
                startAngle: twoPi,
                endAngle: twoPi,
                globalAlpha: 0,
                baseRotation: rotation
            });
        }
    },

    updateLabelData: function () {
        var me = this,
            store = me.getStore(),
            items = store.getData().items,
            sprites = me.getSprites(),
            labelField = me.getLabel().getTemplate().getField(),
            hidden = me.getHidden(),
            spritesPerSlice = me.spritesPerSlice,
            i, j, ln, labels, sprite;

        if (sprites.length && labelField) {
            labels = [];
            for (i = 0, ln = items.length; i < ln; i++) {
                labels.push(items[i].get(labelField));
            }
            // Only set labels for the sprites that compose the top lid of the pie.
            for (i = 0, j = 0, ln = sprites.length; i < ln; i += spritesPerSlice, j++) {
                sprite = sprites[i];
                sprite.setAttributes({label: labels[j]});
                sprite.putMarker('labels', {hidden: hidden[j]}, sprite.attr.attributeId);
            }
        }
    },

    // The radius here will normally be set by the PolarChart.performLayout,
    // where it's half the width or height (whichever is smaller) of the chart's rect.
    // But for 3D pie series we have to take the thickness of the pie and the
    // distortion into account to calculate the proper radius.
    // The passed value is never used (or derived from) since the radius config
    // is not really meant to be used directly, as it will be reset by the next layout.
    applyRadius: function () {
        var me = this,
            chart = me.getChart(),
            padding = chart.getInnerPadding(),
            rect = chart.getMainRect() || [0, 0, 1, 1],
            width = rect[2] - padding * 2,
            height = rect[3] - padding * 2 - me.getThickness(),
            horizontalRadius = width / 2,
            verticalRadius = horizontalRadius * me.getDistortion();

        if (verticalRadius > height / 2) {
            return height / (me.getDistortion() * 2);
        } else {
            return horizontalRadius;
        }
    },

    getSprites: function () {
        var me = this,
            store = me.getStore();

        if (!store) {
            return [];
        }

        var chart = me.getChart(),
            surface = me.getSurface(),
            records = store.getData().items,
            spritesPerSlice = me.spritesPerSlice,
            recordCount = records.length,
            animation = me.getAnimation() || chart && chart.getAnimation(),
            center = me.getCenter(),
            offsetX = me.getOffsetX(),
            offsetY = me.getOffsetY(),
            radius = me.getRadius(),
            rotation = me.getRotation(),
            highlight = me.getHighlight(),
            commonAttributes = {
                centerX: center[0] + offsetX,
                centerY: center[1] + offsetY - me.getThickness() / 2,
                endRho: radius,
                startRho: radius * me.getDonut() / 100,
                thickness: me.getThickness(),
                distortion: me.getDistortion()
            },
            sprites = me.sprites,
            label = me.getLabel(),
            labelTpl = label.getTemplate(),
            sliceSprites, sliceAttributes, sprite,
            i, j;

        for (i = 0; i < recordCount; i++) {
            sliceAttributes = Ext.apply({}, this.getStyleByIndex(i), commonAttributes);
            if (!sprites[i * spritesPerSlice]) {
                for (j = 0; j < me.partNames.length; j++) {
                    sprite = surface.add({
                        type: 'pie3dPart',
                        part: me.partNames[j]
                    });
                    if (j === 0 && labelTpl.getField()) {
                        // Make the 'top' part hold the label.
                        sprite.bindMarker('labels', label);
                    }
                    sprite.fx.setDurationOn('baseRotation', rotation);
                    if (highlight) {
                        sprite.config.highlight = highlight;
                        sprite.addModifier('highlight', true);
                    }
                    sprite.setAttributes(sliceAttributes);
                    sprites.push(sprite);
                }
            } else {
                sliceSprites = sprites.slice(i * spritesPerSlice, (i + 1) * spritesPerSlice);
                for (j = 0; j < sliceSprites.length; j++) {
                    sprite = sliceSprites[j];
                    if (animation) {
                        sprite.setAnimation(animation);
                    }
                    sprite.setAttributes(sliceAttributes);
                }
            }
        }

        return sprites;
    },

    betweenAngle: function (x, a, b) {
        var pp = Math.PI * 2,
            offset = this.rotationOffset;

        a += offset;
        b += offset;

        x -= a;
        b -= a;

        // Normalize, so that both x and b are in the [0,360) interval.
        // Since 360 * n angles will be normalized to 0,
        // we need to treat b === 0 as a special case.
        x %= pp;
        b %= pp;
        x += pp;
        b += pp;
        x %= pp;
        b %= pp;

        return x < b || b === 0;
    },

    getItemForPoint: function (x, y) {
        var me = this,
            sprites = me.getSprites();

        if (sprites) {
            var store = me.getStore(),
                records = store.getData().items,
                spritesPerSlice = me.spritesPerSlice,
                hidden = me.getHidden(),
                i, ln, sprite, topPartIndex;

            for (i = 0, ln = records.length; i < ln; i++) {
                if (!hidden[i]) {
                    topPartIndex = i * spritesPerSlice;
                    sprite = sprites[topPartIndex];

                    // This is CPU intensive on mousemove (no visial slowdown
                    // on a fast machine, but some throttling might be desirable
                    // on slower machines).
                    // On touch devices performance/battery hit is negligible.
                    if (sprite.hitTest([x, y])) {
                        return {
                            series: me,
                            sprite: sprites.slice(topPartIndex, topPartIndex + spritesPerSlice),
                            index: i,
                            record: records[i],
                            category: 'sprites',
                            field: me.getXField()
                        };
                    }

                }
            }
            return null;
        }
    },

    provideLegendInfo: function (target) {
        var me = this,
            store = me.getStore();

        if (store) {
            var items = store.getData().items,
                labelField = me.getLabel().getTemplate().getField(),
                field = me.getField(),
                hidden = me.getHidden(),
                i, style, color;

            for (i = 0; i < items.length; i++) {
                style = me.getStyleByIndex(i);
                color = style.baseColor;
                target.push({
                    name: labelField ? String(items[i].get(labelField))  : field + ' ' + i,
                    mark: color || 'black',
                    disabled: hidden[i],
                    series: me.getId(),
                    index: i
                });
            }
        }
    }
}, function () {
    var proto = this.prototype,
        definition = Ext.chart.series.sprite.Pie3DPart.def.getInitialConfig().processors.part;

    proto.partNames = definition.replace(/^enums\(|\)/g, '').split(',');
    proto.spritesPerSlice = proto.partNames.length;
});
