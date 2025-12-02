Ext.define('Ext.theme.blackberry.field.Picker', {
    override: 'Ext.field.Picker',

    initialize: function() {
        this.callParent();
        this.label.on({
            scope: this,
            tap: 'onFocus'
        });
    },

    getElementConfig: function() {
        return {
            reference: 'element',
            children: [{
                reference: 'bodyElement',
                cls: Ext.baseCSSPrefix + 'body-el',
                children: [{
                    reference: 'labelElement',
                    cls: Ext.baseCSSPrefix + 'label-el',
                    children: [{
                        reference: 'labelTextElement',
                        cls: Ext.baseCSSPrefix + 'label-text-el',
                        tag: 'span'
                    }]
                }]
            }]
        };
    },

    updateLabelWidth: function() {
        return;
    },

    updateLabelAlign: function() {
        return;
    }
});