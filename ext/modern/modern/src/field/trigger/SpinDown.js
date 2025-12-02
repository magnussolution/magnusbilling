/**
 * A "spin down" trigger.  Used in {@link Ext.field.Spinner Spinner Fields}.
 */
Ext.define('Ext.field.trigger.SpinDown', {
    extend: 'Ext.field.trigger.Trigger',
    xtype: 'spindowntrigger',
    alias: 'trigger.spindown',
    classCls: Ext.baseCSSPrefix + 'spindowntrigger',
    handler: 'onSpinDown',
    scope: 'this'
});