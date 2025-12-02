Ext.define('Ext.theme.blackberry.field.Input', {
    override: 'Ext.field.Input',

    updateType: function(newType, oldType) {
        var prefix = Ext.baseCSSPrefix + 'input-';

        this.input.replaceCls(prefix + oldType, prefix + newType);
        this.callParent(arguments);
    }
});