/**
 * @private
 */
Ext.define('Ext.dataview.ListItemDisclosure', {
    extend: 'Ext.Component',
    xtype: 'listitemdisclosure',
    baseCls: Ext.baseCSSPrefix + 'listitem-disclosure',

    template: [{
        reference: 'iconElement',
        classList: [
            Ext.baseCSSPrefix + 'icon-el',
            Ext.baseCSSPrefix + 'font-icon'
        ]
    }]
});