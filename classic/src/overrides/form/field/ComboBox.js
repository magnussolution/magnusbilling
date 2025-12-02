Ext.define('Overrides.form.field.ComboBox', {
    override: 'Ext.form.field.ComboBox',
    queryMode: 'local',
    minCharFilter: 0,
    filterMode: 'local',
    triggerAction: 'all',
    forceSelection: true,
    grow: true,
    extraValues: [],
    initComponent: function() {
        var me = this;
        if (me.filterMode === 'remote') {
            me.hideTrigger = true;
        }
        me.store = Ext.isString(me.store) ? Ext.create('MBilling.store.' + me.store) : me.store;
        me.on('render', me.loadStore, me);
        me.on('keyup', me.filterStore, me);
        me.callParent(arguments);
    },
    loadStore: function(combo) {
        var me = this,
            store = combo.store,
            record;
        if (combo.filterMode === 'local') {
            store.load({
                callback: function() {
                    if (me.extraValues.length) {
                        store.insert(0, me.extraValues);
                    }
                }
            });
        } else {
            me.deferredLoad = Ext.create('Ext.util.DelayedTask', function() {
                store.load({
                    scope: me,
                    callback: function() {
                        combo.getValue() ? me.expand() : combo.collapse();
                    }
                });
                delete store.proxy.extraParams.filter;
                me.deferredLoad.cancel();
            }, me);
            me.up('form').on('edit', me.onEditForm, me);
        }
    },
    filterStore: function(combo, evt) {
        var me = this;
        valueValid = combo.getValue() && (combo.getValue().length > me.minCharFilter);
        if (combo.filterMode === 'remote' && evt.getKey() !== evt.UP && evt.getKey() !== evt.DOWN && evt.getKey() !== evt.ENTER && valueValid) {
            var valueFilter = Ext.encode([{
                type: 'string',
                value: combo.getValue(),
                field: combo.displayField
            }]);
            combo.store.proxy.extraParams.filter = valueFilter;
            me.deferredLoad.delay(2000, null, [{
                filter: valueFilter
            }]);
        }
    },
    onEditForm: function(form) {
        var me = this,
            value = form.getRecord().get(me.name),
            filter = Ext.encode([{
                type: 'list',
                value: [value],
                field: me.valueField
            }]);
        me.store.load({
            params: {
                filter: filter
            },
            scope: me,
            callback: function(record) {
                me.store.removeAll();
                me.store.add(record);
                me.setValue(value);
            }
        });
    }
});