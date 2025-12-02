/**
 * @class Ext.chart.sprite.Label
 * @extends Ext.draw.sprite.Text
 *
 * Sprite used to represent labels in series.
 *
 * Important: the actual default values are determined by the theme used.
 * Please see the `label` config of the {@link Ext.chart.theme.Base#axis}.
 */
Ext.define('Ext.chart.sprite.Label', {
    extend: 'Ext.draw.sprite.Text',
    alternateClassName: 'Ext.chart.label.Label',
    requires: ['Ext.chart.modifier.Callout'],

    inheritableStatics: {
        def: {
            processors: {
                callout: 'limited01',
                // Meant to be set by the Callout modifier only.
                calloutHasLine: 'bool',
                // The position where the callout would end, if not for the label:
                // callout stops at the bounding box of the label,
                // so the actual point where the callout ends - calloutEndX/Y -
                // is calculated by the Callout modifier.
                calloutPlaceX: 'number',
                calloutPlaceY: 'number',
                // The start/end points used to render the callout line.
                calloutStartX: 'number',
                calloutStartY: 'number',
                calloutEndX: 'number',
                calloutEndY: 'number',

                calloutColor: 'color',
                calloutWidth: 'number',
                calloutVertical: 'bool',
                labelOverflowPadding: 'number',
                display: 'enums(none,under,over,rotate,insideStart,insideEnd,inside,outside)',
                orientation: 'enums(horizontal,vertical)',
                renderer: 'default'
            },

            defaults: {
                callout: 0,
                calloutHasLine: true,
                calloutPlaceX: 0,
                calloutPlaceY: 0,
                calloutStartX: 0,
                calloutStartY: 0,
                calloutEndX: 0,
                calloutEndY: 0,
                calloutWidth: 1,
                calloutVertical: false,
                calloutColor: 'black',
                labelOverflowPadding: 5,
                display: 'none',
                orientation: '',
                renderer: null
            },

            triggers: {
                callout: 'transform',
                calloutPlaceX: 'transform',
                calloutPlaceY: 'transform',
                labelOverflowPadding: 'transform',
                calloutRotation: 'transform',
                display: 'hidden'
            },

            updaters: {
                hidden: function (attr) {
                    attr.hidden = (attr.display === 'none');
                }
            }
        }
    },

    config: {
        /**
         * @cfg {Object} fx Animation configuration.
         */
        fx: {
            customDurations: {
                callout: 200
            }
        },
        field: null,
        /**
         * @cfg {Boolean|Object} calloutLine
         *
         * True to draw a line between the label and the chart with the default settings,
         * or an Object that defines the 'color', 'width' and 'length' properties of the line.
         * This config is only applicable when the label is displayed outside the chart.
         *
         * Default value: false.
         */
        calloutLine: true
    },

    applyCalloutLine: function (calloutLine) {
        if (calloutLine) {
            return Ext.apply({}, calloutLine);
        }
    },

    prepareModifiers: function () {
        this.callParent(arguments);
        this.calloutModifier = new Ext.chart.modifier.Callout({sprite: this});
        this.fx.setUpper(this.calloutModifier);
        this.calloutModifier.setUpper(this.topModifier);
    },

    render: function (surface, ctx) {
        var me = this,
            attr = me.attr,
            calloutColor = attr.calloutColor;

        ctx.save();
        ctx.globalAlpha *= attr.callout;
        if (ctx.globalAlpha > 0 && attr.calloutHasLine) {
            if (calloutColor && calloutColor.isGradient) {
                calloutColor = calloutColor.getStops()[0].color;
            }
            ctx.strokeStyle = calloutColor;
            ctx.fillStyle = calloutColor;
            ctx.lineWidth = attr.calloutWidth;
            ctx.beginPath();
            ctx.moveTo(me.attr.calloutStartX, me.attr.calloutStartY);
            ctx.lineTo(me.attr.calloutEndX, me.attr.calloutEndY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(me.attr.calloutStartX, me.attr.calloutStartY, 1 * attr.calloutWidth, 0, 2 * Math.PI, true);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(me.attr.calloutEndX, me.attr.calloutEndY, 1 * attr.calloutWidth, 0, 2 * Math.PI, true);
            ctx.fill();
        }
        ctx.restore();

        Ext.draw.sprite.Text.prototype.render.apply(me, arguments);
    }
});