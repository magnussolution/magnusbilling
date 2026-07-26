/**
 * Saúde operacional da pipeline, independente do estado dos incidentes.
 */
Ext.define('MBilling.view.magnusSentinel.Health', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.magnussentinelhealth',
    reference: 'sentinelHealth',
    border: true,
    columnLines: true,
    title: t('Sentinel health'),
    store: {
        fields: [
            'component', 'server_name', 'health_status', 'heartbeat_at',
            'heartbeat_age_seconds', 'pending_events', 'ingest_lag_seconds',
            'health_reasons', 'last_error_at', 'last_error_message'
        ],
        data: []
    },
    viewConfig: {
        emptyText: t('Sentinel health data is not available yet.'),
        deferEmptyText: false
    },
    initComponent: function() {
        var me = this;
        me.columns = [{
            text: t('Status'),
            dataIndex: 'health_status',
            width: 110,
            renderer: function(value) {
                var colors = {
                    HEALTHY: '#18794e',
                    UNKNOWN: '#5f6b7a',
                    DEGRADED: '#8a5a00',
                    STALE: '#8a3418',
                    UNHEALTHY: '#8e1b12'
                };
                return '<b style="color:' + (colors[value] || '#5f6b7a') +
                    '">' + Ext.util.Format.htmlEncode(me.statusLabel(value)) +
                    '</b>';
            }
        }, {
            text: t('Component'),
            dataIndex: 'component',
            width: 110,
            renderer: function(value) {
                return Ext.util.Format.htmlEncode(
                    value === 'collector' ? t('Collector') : t('Analyzer')
                );
            }
        }, {
            text: t('Server'),
            dataIndex: 'server_name',
            flex: 2,
            minWidth: 120,
            renderer: Ext.util.Format.htmlEncode
        }, {
            text: t('Last heartbeat'),
            dataIndex: 'heartbeat_at',
            flex: 2,
            minWidth: 155,
            renderer: function(value) {
                return Ext.util.Format.htmlEncode(me.formatDate(value));
            }
        }, {
            text: t('Data age'),
            dataIndex: 'heartbeat_age_seconds',
            width: 105,
            renderer: function(value) {
                return Ext.util.Format.htmlEncode(me.formatAge(value));
            }
        }, {
            text: t('Backlog'),
            dataIndex: 'pending_events',
            width: 90,
            align: 'right'
        }, {
            text: t('Ingest lag'),
            dataIndex: 'ingest_lag_seconds',
            width: 105,
            renderer: function(value) {
                return Ext.util.Format.htmlEncode(me.formatAge(value || 0));
            }
        }, {
            text: t('Reason'),
            dataIndex: 'health_reasons',
            flex: 3,
            minWidth: 180,
            renderer: function(value) {
                return Ext.util.Format.htmlEncode(
                    Ext.Array.map(value || [], me.reasonLabel, me).join('; ') ||
                    t('No degradation detected')
                );
            }
        }, {
            text: t('Last error'),
            dataIndex: 'last_error_at',
            flex: 2,
            minWidth: 170,
            renderer: function(value, metadata, record) {
                if (!value) {
                    return Ext.util.Format.htmlEncode(t('None'));
                }
                return Ext.util.Format.htmlEncode(
                    me.formatDate(value) +
                    (record.get('last_error_message') ?
                        ' — ' + record.get('last_error_message') : '')
                );
            }
        }];
        me.dockedItems = [{
            xtype: 'component',
            dock: 'top',
            itemId: 'aggregateHealth',
            padding: '7 10',
            style: 'background:#f5f7f9;border-bottom:1px solid #d9d9d9',
            html: Ext.util.Format.htmlEncode(
                t('Waiting for Sentinel health data...')
            )
        }];
        me.callParent(arguments);
    },
    setHealth: function(health) {
        health = health || {
            health_status: 'UNKNOWN',
            components: [],
            evaluated_at: null
        };
        this.getStore().loadData(health.components || []);
        this.down('#aggregateHealth').update(
            '<b>' + Ext.util.Format.htmlEncode(
                t('Pipeline status') + ': ' +
                this.statusLabel(health.health_status)
            ) + '</b> &nbsp; ' +
            Ext.util.Format.htmlEncode(
                t('Evaluated at') + ': ' + this.formatDate(health.evaluated_at)
            )
        );
    },
    statusLabel: function(value) {
        return {
            HEALTHY: t('Healthy'),
            UNKNOWN: t('Unknown'),
            DEGRADED: t('Degraded'),
            STALE: t('Outdated'),
            UNHEALTHY: t('Unhealthy')
        }[value] || t('Unknown');
    },
    reasonLabel: function(value) {
        return {
            heartbeat_missing: t('Heartbeat was never received'),
            heartbeat_stale: t('Heartbeat is outdated'),
            successful_cycle_missing: t('No successful cycle was recorded'),
            database_unavailable: t('Central database is unavailable'),
            repeated_database_failures: t('Repeated database failures'),
            recoverable_database_failures: t('Recent recoverable database failures'),
            pending_events: t('Events are waiting to be persisted'),
            committed_event_evidence_missing: t('No persisted event evidence yet'),
            asterisk_log_unavailable: t('Asterisk event log is unavailable'),
            collector_cycle_failed: t('Collector cycle failed'),
            analysis_partial: t('Analyzer cycle was incomplete'),
            analyzer_failed: t('Analyzer cycle failed')
        }[value] || value;
    },
    formatAge: function(value) {
        if (!Ext.isNumber(value)) {
            return t('Not informed');
        }
        if (value < 60) {
            return value + ' ' + t('seconds');
        }
        return Math.floor(value / 60) + ' ' + t('minutes');
    },
    formatDate: function(value) {
        if (!value) {
            return t('Not informed');
        }
        return String(value).replace(/\.\d+$/, '') + ' ' + t('UTC');
    }
});
