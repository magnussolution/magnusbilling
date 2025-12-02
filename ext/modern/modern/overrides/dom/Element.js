/**
 * @class Ext.dom.Element
 * @override Ext.dom.Element
 */
Ext.define('Ext.overrides.dom.Element', {
    override: 'Ext.dom.Element',

    _positionTopLeft: ['position', 'top', 'left'],

    setX: function(x, animate) {
        return this.setXY([x, this.getY()], animate);
    },

    setXY: function(xy, animate) {
        var me = this;

        if (!animate) {
            me.callParent([xy]);
        } else {
            if (!Ext.isObject(animate)) {
                animate = {};
            }
            me.animate(Ext.applyIf({ to: { x: xy[0], y: xy[1] } }, animate));
        }
        return this;
    },

    setY: function(y, animate) {
        return this.setXY([this.getX(), y], animate);
    },

    translateXY: function(x, y) {
        var me = this,
            el = me.el,
            styles = el.getStyle(me._positionTopLeft),
            relative = styles.position === 'relative',
            left = parseFloat(styles.left),
            top = parseFloat(styles.top),
            xy = me.getXY();

        if (Ext.isArray(x)) {
             y = x[1];
             x = x[0];
        }
        if (isNaN(left)) {
            left = relative ? 0 : el.dom.offsetLeft;
        }
        if (isNaN(top)) {
            top = relative ? 0 : el.dom.offsetTop;
        }
        left = (typeof x === 'number') ? x - xy[0] + left : undefined;
        top = (typeof y === 'number') ? y - xy[1] + top : undefined;
        return {
            x: left,
            y: top
        };
    }

});