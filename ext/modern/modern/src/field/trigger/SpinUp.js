/**
 * A "spin up" trigger.  Used in {@link Ext.field.Spinner Spinner Fields}.
 */
Ext.define('Ext.field.trigger.SpinUp', {
    extend: 'Ext.field.trigger.Trigger',
    xtype: 'spinuptrigger',
    alias: 'trigger.spinup',
    classCls: Ext.baseCSSPrefix + 'spinuptrigger',
    handler: 'onSpinUp',
    scope: 'this'
});
