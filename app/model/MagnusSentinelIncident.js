/**
 * Model dos incidentes do Magnus Sentinel.
 */
Ext.define('MBilling.model.MagnusSentinelIncident', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'incident_type',
        type: 'string'
    }, {
        name: 'state',
        type: 'string'
    }, {
        name: 'severity',
        type: 'string'
    }, {
        name: 'entity_kind',
        type: 'string'
    }, {
        name: 'entity_id',
        type: 'int'
    }, {
        name: 'entity_name',
        type: 'string'
    }, {
        name: 'title',
        type: 'string'
    }, {
        name: 'summary',
        type: 'string'
    }, {
        name: 'first_seen',
        type: 'string'
    }, {
        name: 'last_seen',
        type: 'string'
    }, {
        name: 'occurrence_count',
        type: 'int'
    }],
    proxy: {
        type: 'ajax',
        url: 'index.php/magnusSentinelIncident/read',
        actionMethods: {
            read: 'GET'
        },
        pageParam: false,
        sortParam: false,
        filterParam: false,
        reader: {
            type: 'json',
            rootProperty: 'data.items',
            totalProperty: 'data.pagination.total',
            successProperty: 'success',
            metaProperty: 'data.summary'
        }
    }
});
