/**
 * List filters are able to be preloaded/backed by an Ext.data.Store to load
 * their options the first time they are shown. ListFilter utilizes the
 * {@link Ext.ux.grid.menu.ListMenu} component.
 *
 * List filters are also able to create their own list of values from  all unique values of
 * the specified {@link #dataIndex} field in the store at first time of filter invocation.
 *
 * Although not shown here, this class accepts all configuration options
 * for {@link Ext.ux.grid.menu.ListMenu}.
 *
 * Example Usage:
 *
 *     var filters = Ext.create('Ext.ux.grid.GridFilters', {
 *         ...
 *         filters: [{
 *             type: 'list',
 *             dataIndex: 'size',
 *             phpMode: true,
 *             // options will be used as data to implicitly creates an ArrayStore
 *             options: ['extra small', 'small', 'medium', 'large', 'extra large']
 *         }]
 *     });
 *
 */
Ext.define('Ext.ux.grid.filter.ListFilter', {
    extend: 'Ext.ux.grid.filter.Filter',
    alias: 'gridfilter.list',
    /**
     * @cfg {Array} [options]
     * `data` to be used to implicitly create a data store
     * to back this list when the data source is **local**. If the
     * data for the list is remote, use the {@link #store}
     * config instead.
     *
     * If neither store nor {@link #options} is specified, then the choices list is automatically
     * populated from all unique values of the specified {@link #dataIndex} field in the store at first
     * time of filter invocation.
     *
     * Each item within the provided array may be in one of the
     * following formats:
     *
     *   - **Array** :
     *
     *         options: [
     *             [11, 'extra small'],
     *             [18, 'small'],
     *             [22, 'medium'],
     *             [35, 'large'],
     *             [44, 'extra large']
     *         ]
     *
     *   - **Object** :
     *
     *         labelField: 'name', // override default of 'text'
     *         options: [
     *             {id: 11, name:'extra small'},
     *             {id: 18, name:'small'},
     *             {id: 22, name:'medium'},
     *             {id: 35, name:'large'},
     *             {id: 44, name:'extra large'}
     *         ]
     * 
     *   - **String** :
     *
     *         options: ['extra small', 'small', 'medium', 'large', 'extra large']
     *
     */
    /**
     * @cfg {Boolean} phpMode
     * Adjust the format of this filter. Defaults to false.
     *
     * When GridFilters `@cfg encode = false` (default):
     *
     *     // phpMode == false (default):
     *     filter[0][data][type] list
     *     filter[0][data][value] value1
     *     filter[0][data][value] value2
     *     filter[0][field] prod
     *
     *     // phpMode == true:
     *     filter[0][data][type] list
     *     filter[0][data][value] value1, value2
     *     filter[0][field] prod
     *
     * When GridFilters `@cfg encode = true`:
     *
     *     // phpMode == false (default):
     *     filter : [{"type":"list","value":["small","medium"],"field":"size"}]
     *
     *     // phpMode == true:
     *     filter : [{"type":"list","value":"small,medium","field":"size"}]
     *
     */
    phpMode: false,
    /**
     * @cfg {Ext.data.Store} [store]
     * The {@link Ext.data.Store} this list should use as its data source
     * when the data source is **remote**. If the data for the list
     * is local, use the {@link #options} config instead.
     *
     * If neither store nor {@link #options} is specified, then the choices list is automatically
     * populated from all unique values of the specified {@link #dataIndex} field in the store at first
     * time of filter invocation.
     */
    /**
     * @private
     * Template method that is to initialize the filter.
     * @param {Object} config
     */
    init: function(config) {
        this.dt = Ext.create('Ext.util.DelayedTask', this.fireUpdate, this);
    },
    /**
     * @private @override
     * Creates the Menu for this filter.
     * @param {Object} config Filter configuration
     * @return {Ext.menu.Menu}
     */
    createMenu: function(config) {
        var menu = Ext.create('Ext.ux.grid.menu.ListMenu', config);
        menu.on('checkchange', this.onCheckChange, this);
        return menu;
    },
    /**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
    getValue: function() {
        return this.menu.getSelected();
    },
    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     */
    setValue: function(value) {
        this.menu.setSelected(value);
        this.fireEvent('update', this);
    },
    /**
     * Template method that is to return true if the filter
     * has enough configuration information to be activated.
     * @return {Boolean}
     */
    isActivatable: function() {
        return this.getValue().length > 0;
    },
    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function() {
        return {
            type: 'list',
            value: this.phpMode ? this.getValue().join(',') : this.getValue()
        };
    },
    /** @private */
    onCheckChange: function() {
        this.dt.delay(this.updateBuffer);
    },
    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function(record) {
        var valuesArray = this.getValue();
        return Ext.Array.indexOf(valuesArray, record.get(this.dataIndex)) > -1;
    }
});