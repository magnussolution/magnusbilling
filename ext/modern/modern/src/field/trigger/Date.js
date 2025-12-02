/**
 * A "date" trigger.  Used in {@link Ext.field.DatePicker DatePicker Fields}.
 */
Ext.define('Ext.field.trigger.Date', {
    extend: 'Ext.field.trigger.Trigger',
    xtype: 'datetrigger',
    alias: 'trigger.date',
    classCls: Ext.baseCSSPrefix + 'datetrigger',
    handler: 'onExpandTap',
    scope: 'this'
});
