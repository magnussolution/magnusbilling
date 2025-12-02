/**
 * A general sheet class. This renderable container provides base support for orientation-aware transitions for popup or
 * side-anchored sliding Panels.
 *
 * In most cases, you should use {@link Ext.ActionSheet}, {@link Ext.MessageBox}, {@link Ext.picker.Picker}, or {@link Ext.picker.Date}.
 */
Ext.define('Ext.Sheet', {
    extend: 'Ext.Panel',

    xtype: 'sheet',

    requires: ['Ext.fx.Animation'],

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        modal: true,

        /**
         * @cfg {Boolean} centered
         * Whether or not this component is absolutely centered inside its container.
         * @accessor
         * @evented
         */
        centered: true,

        /**
         * @cfg {Boolean} stretchX `true` to stretch this sheet horizontally.
         */
        stretchX: null,

        /**
         * @cfg {Boolean} stretchY `true` to stretch this sheet vertically.
         */
        stretchY: null,

        /**
         * @cfg {String} enter
         * The viewport side used as the enter point when shown. Valid values are 'top', 'bottom', 'left', and 'right'.
         * Applies to sliding animation effects only.
         */
        enter: 'bottom',

        /**
         * @cfg {String} exit
         * The viewport side used as the exit point when hidden. Valid values are 'top', 'bottom', 'left', and 'right'.
         * Applies to sliding animation effects only.
         */
        exit: 'bottom',

        /**
         * @cfg
         * @inheritdoc
         */
        showAnimation: {
            type: 'slideIn',
            duration: 250,
            easing: 'ease-out'
        },

        /**
         * @cfg
         * @inheritdoc
         */
        hideAnimation: {
            type: 'slideOut',
            duration: 250,
            easing: 'ease-in'
        }
    },

    baseCls: Ext.baseCSSPrefix + 'sheet',

    border: null,

    bodyBorder: false,

    floated: true,

    manageBorders: false,

    isInputRegex: /^(input|textarea|select|a)$/i,

    applyHideAnimation: function(config) {
        var exit = this.getExit(),
            direction = exit;

        if (exit === null) {
            return null;
        }

        if (config === true) {
            config = {
                type: 'slideOut'
            };
        }
        var anim = this.callParent([config]);

        if (anim) {
            if (exit === 'bottom') {
                direction = 'down';
            }
            if (exit === 'top') {
                direction = 'up';
            }
            anim.setDirection(direction);
        }
        return anim;
    },

    applyShowAnimation: function(config) {
        var enter = this.getEnter(),
            direction = enter;

        if (enter === null) {
            return null;
        }

        if (config === true) {
            config = {
                type: 'slideIn'
            };
        }
        var anim = this.callParent([config]);

        if (anim) {
            if (enter === 'bottom') {
                direction = 'down';
            }
            if (enter === 'top') {
                direction = 'up';
            }
            anim.setBefore({
                display: null
            });
            anim.setReverse(true);
            anim.setDirection(direction);
        }
        return anim;
    },

    updateStretchX: function(newStretchX) {
        this.getLeft();
        this.getRight();

        if (newStretchX) {
            this.setLeft(0);
            this.setRight(0);
        }
    },

    updateStretchY: function(newStretchY) {
        this.getTop();
        this.getBottom();

        if (newStretchY) {
            this.setTop(0);
            this.setBottom(0);
        }
    }
});
