/**
 * This is a supporting class for {@link Ext.ux.grid.filter.ListFilter}.
 * Although not listed as configuration options for this class, this class
 * also accepts all configuration options from {@link Ext.ux.grid.filter.ListFilter}.
 */
Ext.define('Ext.ux.grid.menu.ListMenu', {
    extend: 'Ext.menu.Menu',
    /**
     * @cfg {String} idField
     * Defaults to 'id'.
     */
    idField: 'id',
    /**
     * @cfg {String} labelField
     * Defaults to 'text'.
     */
    labelField: 'text',
    /**
     * @cfg {String} paramPrefix
     * Defaults to 'Loading...'.
     */
    loadingText: 'Loading...',
    /**
     * @cfg {Boolean} loadOnShow
     * Defaults to true.
     */
    loadOnShow: true,
    /**
     * @cfg {Boolean} single
     * Specify true to group all items in this list into a single-select
     * radio button group. Defaults to false.
     */
    single: false,
    plain: true,
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
        }
    },
    destroy: function() {
        var me = this,
            store = me.store;
        if (store) {
            if (me.autoStore) {
                store.destroy();
            } else {
                store.un('unload', me.onLoad, me);
            }
        }
        me.callParent();
    },
    /**
     * Lists will initially show a 'loading' item while the data is retrieved from the store.
     * In some cases the loaded data will result in a list that goes off the screen to the
     * right (as placement calculations were done with the loading item). This adapter will
     * allow show to be called with no arguments to show with the previous arguments and
     * thus recalculate the width and potentially hang the menu from the left.
     */
    show: function() {
        var me = this;
        if (me.loadOnShow && !me.loaded && !me.store.loading) {
            me.store.load();
        }
        me.callParent();
    },
    /** @private */
    onLoad: function(store, records) {
        var me = this,
            gid, itemValue, i, len,
            listeners = {
                checkchange: me.checkChange,
                scope: me
            };
        Ext.suspendLayouts();
        me.removeAll(true);
        gid = me.single ? Ext.id() : null;
        for (i = 0, len = records.length; i < len; i++) {
            itemValue = records[i].get(me.idField);
            me.add(Ext.create('Ext.menu.CheckItem', {
                text: records[i].get(me.labelField),
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
    },
    /**
     * Get the selected items.
     * @return {Array} selected
     */
    getSelected: function() {
        return this.selected;
    },
    /** @private */
    setSelected: function(value) {
        value = this.selected = [].concat(value);
        if (this.loaded) {
            this.items.each(function(item) {
                item.setChecked(false, true);
                for (var i = 0, len = value.length; i < len; i++) {
                    if (item.value == value[i]) {
                        item.setChecked(true, true);
                    }
                }
            });
        }
    },
    /**
     * Handler for the 'checkchange' event from an check item in this menu
     * @param {Object} item Ext.menu.CheckItem
     * @param {Object} checked The checked value that was set
     */
    checkChange: function(item, checked) {
        var value = [];
        this.items.each(function(item) {
            if (item.checked) {
                value.push(item.value);
            }
        });
        this.selected = value;
        this.fireEvent('checkchange', item, checked);
    }
});