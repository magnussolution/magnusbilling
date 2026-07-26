/**
 * Store paginado dos incidentes do Magnus Sentinel.
 */
Ext.define('MBilling.store.MagnusSentinelIncident', {
    extend: 'Ext.data.Store',
    alias: 'store.magnussentinelincident',
    requires: ['MBilling.model.MagnusSentinelIncident'],
    model: 'MBilling.model.MagnusSentinelIncident',
    pageSize: 100,
    autoLoad: false,
    autoDestroy: true,
    remoteSort: false
});
