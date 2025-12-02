/**
 * A simple "expand" trigger.  Used in {@link Ext.field.Picker Picker Fields}.
 */
Ext.define('Ext.field.trigger.Expand', {
    extend: 'Ext.field.trigger.Trigger',
    xtype: 'expandtrigger',
    alias: 'trigger.expand',
    classCls: Ext.baseCSSPrefix + 'expandtrigger',
    handler: 'onExpandTap',
    scope: 'this'
});
