/**
 * A "clear" trigger.  Used in {@link Ext.field.Text Text Fields} when
 * `{@link Ext.field.Text#clearIcon clearIcon}` is `true`.
 */
Ext.define('Ext.field.trigger.Clear', {
    extend: 'Ext.field.trigger.Trigger',
    xtype: 'cleartrigger',
    alias: 'trigger.clear',
    classCls: Ext.baseCSSPrefix + 'cleartrigger',
    weight: -1000,
    hidden: true,
    handler: 'onClearIconTap',
    scope: 'this'
});
