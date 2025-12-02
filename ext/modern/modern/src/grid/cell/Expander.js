Ext.define('Ext.grid.cell.Expander', {
    extend: 'Ext.grid.cell.Base',
    xtype: 'expandercell',
    isExpanderCell: true,

    align: 'center',

    classCls: Ext.baseCSSPrefix + 'expandercell',

    innerTemplate: [{
        reference: 'iconElement',
        classList:[
            Ext.baseCSSPrefix + 'icon-el',
            Ext.baseCSSPrefix + 'font-icon'
        ]
    }]
});
