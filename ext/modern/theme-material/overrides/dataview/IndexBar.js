Ext.define('Ext.theme.material.dataview.IndexBar', {
    override: 'Ext.dataview.IndexBar',

    config: {
        direction: 'vertical',
        letters: ['*', '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    },

    getElementConfig: function () {
        return {
            reference: 'wrapper',
            classList: ['x-center', 'x-indexbar-wrapper'],
            children: [{
                reference: 'indicator',
                classList: ['x-indexbar-indicator'],
                hidden: true,
                children: [{
                    reference: 'indicatorInner',
                    classList: ['x-indexbar-indicator-inner']
                }]
                // We want to skip the default list getElementConfig
            }, this.callSuper()]
        };
    },

    onDragEnd: function (event, target) {
        this.callParent([event, target]);
        this.indicator.hide();
    },

    privates: {
        onVerticalDrag: function (point, target, isValidTarget) {
            var indicator = this.indicator;

            indicator.show();
            var element = this.element,
                indicatorInner = this.indicatorInner,
                indicatorHeight = indicator.getHeight(),
                halfIndicatorHeight = indicatorHeight / 2,
                elementY = element.getY(),
                y = point.y - elementY;

            y = Math.min(Math.max(y, halfIndicatorHeight), element.getHeight() - halfIndicatorHeight);

            if (isValidTarget) {
                indicatorInner.setHtml(target.getHtml().toUpperCase());
            }
            indicator.setTop(y - halfIndicatorHeight);
        }
    }
});