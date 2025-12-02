Ext.define('Overrides.ux.form.SearchField', {
    override: 'Ext.ux.form.SearchField',
    paramName: 'filter',
    filterOnClick: true,
    comparison: 'st',
    type: 'string',
    initComponent: function() {
        var me = this,
            proxy;
        me.store = Ext.data.StoreManager.lookup(me.store || 'ext-empty-store');
        me.callParent(arguments);
        if (!me.filterOnClick) {
            me.getTrigger('search').cls = null;
            me.on('change', me.onSearchClick, me);
        } else {
            me.on('specialkey', function(f, e) {
                if (e.getKey() == e.ENTER) {
                    me.onSearchClick();
                }
            }, me, {
                single: true
            });
        }
        // We're going to use filtering
        me.store.setRemoteFilter(true);
        // Set up the proxy to encode the filter in the simplest way as a name/value pair
        proxy = me.store.getProxy();
        proxy.setFilterParam(me.paramName);
        proxy.encodeFilters = function(filters) {
            return filters[0].getValue();
        }
    },
    onClearClick: function() {
        var me = this;
        if (me.activeFilter) {
            me.setValue('');
            me.cleanFilter();
            me.store.load();
            me.activeFilter = null;
            me.getTrigger('clear').hide();
            me.updateLayout();
        }
    },
    onSearchClick: function() {
        var me = this,
            value = me.getValue();
        if (value.length > 0) {
            // Param name is ignored here since we use custom encoding in the proxy.
            // id is used by the Store to replace any previous filter
            if (me.store.defaultFilter[0] && me.type == 'date') {
                //console.log('existe filter');
            } else {
                me.cleanFilter();
            }
            me.activeFilter = {
                type: me.type,
                field: me.fieldFilter,
                value: me.comparison == 'gt' && value.length == 10 ? value + ' 00:00:00' : me.comparison == 'lt' && value.length == 10 ? value + ' 23:59:59' : value,
                comparison: me.comparison
            };
            me.store.defaultFilter.push(me.activeFilter);
            me.store.load();
            me.getTrigger('clear').show();
            me.updateLayout();
        }
    },
    cleanFilter: function() {
        var me = this,
            mantainFilter = false;
        Ext.each(me.store.defaultFilter, function(filter, idx, filters) {
            if (filter.type === 'string' && filter.comparison === 'ct' && filter.field === me.fieldFilter) {
                delete filters[idx];
            }
        });
        if (mantainFilter == false) {
            me.store.defaultFilter = [];
            me.store.defaultFilter = Ext.Array.clean(me.store.defaultFilter);
        }
    }
});