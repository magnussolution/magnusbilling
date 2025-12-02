Ext.define('Overrides.form.field.Base', {
    override: 'Ext.form.field.Base',
    upperCaseValue: false,
    lowerCaseValue: false,
    initComponent: function() {
        var me = this;
        if (me.upperCaseValue || me.lowerCaseValue) {
            me.fieldStyle = me.fieldStyle || (me.lowerCaseValue ? 'text-transform: lowercase' : 'text-transform: uppercase');
        }
        me.callParent(arguments);
    },
    getValue: function() {
        var me = this,
            value = me.callParent(arguments);
        me.value = Ext.isString(value) && (me.upperCaseValue || me.lowerCaseValue) ? value[me.upperCaseValue ? 'toUpperCase' : 'toLowerCase']() : me.value;
        value = me.value;
        return value;
    },
    getRawValue: function() {
        var me = this,
            rawValue = me.callParent(arguments);
        me.rawValue = Ext.isString(rawValue) && (me.upperCaseValue || me.lowerCaseValue) ? rawValue[me.upperCaseValue ? 'toUpperCase' : 'toLowerCase']() : me.rawValue;
        rawValue = me.rawValue;
        return rawValue;
    }
});