Ext.define('Overrides.ux.grid.menu.ListMenu', {
    override: 'Ext.ux.grid.menu.ListMenu',
    requires: ['Ext.Template'],
    loadingText: t('Loading...'),
    constructor: function(cfg) {
        var me = this,
            options,
            i,
            len,
            value;
        me.selected = [];
        me.callParent(arguments);
        // A ListMenu which is completely unconfigured acquires its store from the unique values of its field in the store
        if (!me.store && !me.options) {
            me.options = me.grid.store.collect(me.dataIndex, false, true);
        }
        if (!me.store && me.options) {
            options = [];
            for (i = 0, len = me.options.length; i < len; i++) {
                value = me.options[i];
                switch (Ext.typeOf(value)) {
                    case 'array':
                        options.push(value);
                        break;
                    case 'object':
                        options.push([value[me.idField], value[me.labelField]]);
                        break;
                    default:
                        if (value != null) {
                            options.push([value, value]);
                        }
                }
            }
            me.store = Ext.create('Ext.data.ArrayStore', {
                fields: [me.idField, me.labelField],
                data: options,
                listeners: {
                    load: me.onLoad,
                    scope: me
                }
            });
            me.loaded = true;
            me.autoStore = true;
        } else {
            me.add({
                text: me.loadingText,
                iconCls: 'loading-indicator'
            });
            me.store.on('load', me.onLoad, me);
            //include
            if (!me.store.getCount()) {
                me.store.load();
            } else {
                me.onLoad(me.store);
            }
        }
    },
    onLoad: function(store, records) {
        var me = this,
            gid, itemValue, i, len, text,
            listeners = {
                checkchange: me.checkChange,
                scope: me
            };
        records = records || store.data.items; // include
        Ext.suspendLayouts();
        me.removeAll(true);
        gid = me.single ? Ext.id() : null;
        for (i = 0, len = records.length; i < len; i++) {
            itemValue = records[i].get(me.idField);
            text = me.labelField.indexOf('{') !== -1 ? Ext.create('Ext.Template', me.labelField).apply(records[i].data) : records[i].get(me.labelField); // include
            me.add(Ext.create('Ext.menu.CheckItem', {
                text: text, // changed
                group: gid,
                checked: Ext.Array.contains(me.selected, itemValue),
                hideOnClick: false,
                value: itemValue,
                listeners: listeners
            }));
        }
        me.loaded = true;
        Ext.resumeLayouts(true);
        me.fireEvent('load', me, records);
    }
});