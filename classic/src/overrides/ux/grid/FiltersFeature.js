Ext.define('Overrides.ux.grid.FiltersFeature', {
    override: 'Ext.ux.grid.FiltersFeature',
    menuFilterText: t('Filter'),
    encode: true,
    getFilterData: function() {
        var items = this.cmpsExtraFilters ? Ext.Array.merge(this.getFilterItems(), this.cmpsExtraFilters) : this.getFilterItems(),
            filters = [],
            n, nlen, item, d, i, len;
        for (n = 0, nlen = items.length; n < nlen; n++) {
            item = items[n];
            if (item.active) {
                d = [].concat(item.serialize());
                for (i = 0, len = d.length; i < len; i++) {
                    filters.push({
                        field: item.field || item.dataIndex,
                        data: d[i],
                        type: d[i].type,
                        value: d[i].value
                    });
                }
            }
        }
        return filters;
    },
    onBeforeLoad: function(store, operation) {
        var me = this,
            extraFilter = {},
            extraFilters = [],
            dataFilter = {},
            params = operation.getParams() || {},
            filters;
        Ext.each(store.defaultFilter, function(filter) {
            extraFilter = {};
            dataFilter = {};
            extraFilter.field = filter.field;
            Ext.apply(dataFilter, filter);
            extraFilter.data = dataFilter;
            extraFilters.push(Ext.clone(extraFilter));
        });
        if (extraFilters.length) {
            filters = Ext.Array.merge(extraFilters, me.getFilterData());
        } else {
            filters = me.getFilterData();
        }
        me.cleanParams(params);
        params[me.paramPrefix] = me.buildQuery(filters);
        operation.setParams(params);
    },
    createFilters: function() {
        var me = this,
            hadFilters = me.filters.getCount(),
            grid = me.getGridPanel(),
            filters = me.createFiltersCollection(),
            model = grid.store.model,
            fields = model.prototype.getFieldsMap(),
            field,
            filter,
            state;
        if (hadFilters) {
            state = {};
            me.saveState(null, state);
        }

        function add(dataIndex, config, filterable) {
            if (dataIndex && (filterable || config)) {
                field = fields[dataIndex];
                filter = {
                    dataIndex: dataIndex,
                    type: field.dateFormat === 'Y-m-d H:i:s' ? 'datetime' : ((field && field.getType()) || 'auto')
                };
                filter.type = field.dateFormat === 'Y-m-d H:i:s' ? 'datetime' : filter.type;
                if (Ext.isObject(config)) {
                    Ext.apply(filter, config);
                }
                filters.replace(filter);
            }
        }
        // We start with filters from our config
        Ext.Array.each(me.filterConfigs, function(filterConfig) {
            add(filterConfig.dataIndex, filterConfig);
        });
        // Then we merge on filters from the columns in the grid. The columns' filters take precedence.
        Ext.Array.each(grid.columnManager.getColumns(), function(column) {
            if (column.filterable === false) {
                filters.removeAtKey(column.dataIndex);
            } else {
                add(column.dataIndex, column.filter, column.filterable);
            }
        });
        me.removeAll();
        if (filters.items) {
            me.initializeFilters(filters.items);
        }
        if (hadFilters) {
            me.applyState(null, state);
        }
    }
});