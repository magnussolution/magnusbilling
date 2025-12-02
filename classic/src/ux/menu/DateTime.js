Ext.define('Ext.ux.menu.DateTime', {
    extend: 'Ext.menu.Menu',
    alias: 'widget.datetimemenu',
    requires: ['Ext.ux.picker.DateTime'],
    hideOnClick: true,
    pickerId: null,
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            showSeparator: false,
            plain: true,
            border: false,
            bodyPadding: 0,
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-date-item',
                id: me.pickerId,
                xtype: 'datetimepicker'
            }, me.initialConfig)
        });
        me.callParent(arguments);
        me.picker = me.down('datetimepicker');
        me.relayEvents(me.picker, ['select']);
        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    },
    hidePickerOnSelect: function() {
        Ext.menu.Manager.hideAll();
    }
});