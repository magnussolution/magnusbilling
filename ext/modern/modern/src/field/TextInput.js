/**
 * @private
 */
Ext.define('Ext.field.TextInput', {
    extend: 'Ext.field.Input',
    xtype: 'textinput',

    type: 'text',

    fastFocus: false,

    classCls: Ext.baseCSSPrefix + 'textinput',

    beforeTemplate: [{
        reference: 'beforeElement',
        cls: Ext.baseCSSPrefix + 'before-el'
    }],

    afterTemplate: [{
        reference: 'afterElement',
        cls: Ext.baseCSSPrefix + 'after-el'
    }]
});