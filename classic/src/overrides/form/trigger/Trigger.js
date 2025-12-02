Ext.define('Overrides.form.trigger.Trigger', {
    override: 'Ext.form.trigger.Trigger',
	clickOnReadOnly: false,

	onClick: function() {
        var me = this,
            args = arguments,
            e = me.clickRepeater ? args[1] : args[0],
            handler = me.handler,
            field = me.field;

        if (handler && (!field.readOnly || me.clickOnReadOnly) && me.isFieldEnabled()) {
            Ext.callback(me.handler, me.scope, [field, me, e], 0, field);
        }
    }
});