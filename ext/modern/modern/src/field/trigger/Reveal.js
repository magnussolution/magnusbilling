/**
 * A "reveal" trigger.  Used in {@link Ext.field.Password Password Fields} when
 * `{@link Ext.field.Password#revealable revealable}` is `true`.
 */
Ext.define('Ext.field.trigger.Reveal', {
    extend: 'Ext.field.trigger.Trigger',
    xtype: 'revealtrigger',
    alias: 'trigger.reveal',
    classCls: Ext.baseCSSPrefix + 'revealtrigger',
    weight: -1000,
    hidden: true,
    handler: 'onRevealTap',
    scope: 'this'
});