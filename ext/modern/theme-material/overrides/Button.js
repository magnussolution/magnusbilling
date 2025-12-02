Ext.define('Ext.theme.material.Button', {
    override: 'Ext.Button',

    config: {
        ripple: true
    },

    destroy: function () {
        this.callParent(arguments);
        this.destroyRipple();
    },

    updateHidden: function (hidden) {
        this.callParent(arguments);

        if (hidden) {
            this.removeRippleEffect();
        }
    },

    onPress: function (e) {
        if (!this.getDisabled()) {
            var shouldRipple = this.getRipple();
            if (shouldRipple) {
                var color = window.getComputedStyle(this.element.dom).color,
                    offset = this.element.getXY(),
                    elementWidth = this.element.getWidth(),
                    elementHeight = this.element.getHeight(),
                    rippleDiameter = elementWidth > elementHeight ? elementWidth : elementHeight,
                    pos = e.getXY(),
                    posX = pos[0] - offset[0] - (rippleDiameter / 2),
                    posY = pos[1] - offset[1] - (rippleDiameter / 2);

                this.$ripple.setStyle('backgroundColor', color);
                this.$ripple.toggleCls('md-ripple-effect', true);
                this.$ripple.setWidth(rippleDiameter);
                this.$ripple.setHeight(rippleDiameter);
                this.$ripple.setTop(posY);
                this.$ripple.setLeft(posX);
                this.$rippleWrap.show();

                if (this.$rippleAnimationListener) {
                    this.$rippleAnimationListener.destroy();
                }

                this.$rippleAnimationListener = this.$ripple.on('animationend', this.onRippleEnd, this, {
                    single: true,
                    destroyable: true
                });
            }
        }

        this.callParent(arguments);
    },

    onRippleEnd: function () {
        if (this.$ripple) {
            this.$ripple.toggleCls('md-ripple-effect', false);
            this.$rippleWrap.hide();
        }
    },

    updateRipple: function (ripple, oldRipple) {
        var me = this;

        if (ripple) {
            me.$rippleWrap = me.element.insertFirst({cls: 'md-ripple-wrap'});
            me.$ripple = me.$rippleWrap.insertFirst({cls: 'md-ripple'});
        } else if (me.$ripple) {
            me.destroyRipple();
        }
    },

    removeRippleEffect: function () {
        if (this.$rippleAnimationListener) {
            this.$rippleAnimationListener.destroy();
        }
        this.onRippleEnd();
    },

    destroyRipple: function () {
        this.removeRippleEffect();
        if (this.$rippleWrap) {
            this.$rippleWrap.destroy();
        }
    },

    applyIconCls: function (cls) {
        var materialMatch = cls && cls.match(/^md-icon[-|_](.*)/),
            materialIcon = materialMatch && materialMatch.length > 1 ? materialMatch[1] : null;

        if (materialIcon) {
            return 'md-icon ' + cls;
        }

        return cls;
    }
});
