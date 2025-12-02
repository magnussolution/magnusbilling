Ext.define('Ext.theme.blackberry.slider.Thumb', {
    override: 'Ext.slider.Thumb',

    getTemplate: function() {
        return [{
            tag: 'div',
            className: Ext.baseCSSPrefix + 'thumb-inner',
            reference: 'innerElement'
        }];
    }

});