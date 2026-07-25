/**
 * Lista operacional dos incidentes do Magnus Sentinel.
 */
Ext.define('MBilling.view.magnusSentinel.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.magnussentinellist',
    region: 'center',
    reference: 'incidentList',
    border: true,
    columnLines: true,
    selModel: {
        mode: 'SINGLE'
    },
    viewConfig: {
        loadMask: {
            msg: t('Loading...')
        },
        emptyText: '<div class="grid-empty">' + t('No problems found') + '</div>',
        deferEmptyText: false
    },
    listeners: {
        selectionchange: 'onIncidentSelectionChange'
    },
    initComponent: function () {
        var me = this;
        me.store = Ext.create('MBilling.store.MagnusSentinelIncident');
        me.columns = [{
            text: t('Priority'),
            dataIndex: 'severity',
            flex: 2,
            renderer: function (value) {
                var critical = value === 'critical';
                return '<span style="font-weight:bold;color:' +
                    (critical ? '#8e1b12' : '#8a3418') + '">' +
                    Ext.util.Format.htmlEncode(
                        critical ? t('Check now') : t('Monitor')
                    ) + '</span>';
            }
        }, {
            text: t('Problem'),
            dataIndex: 'title',
            flex: 5,
            renderer: function (value, metadata, record) {
                metadata.tdAttr = 'data-qtip="' +
                    Ext.util.Format.htmlEncode(record.get('summary')) + '"';
                return Ext.util.Format.htmlEncode(value);
            }
        }, {
            text: t('Component'),
            dataIndex: 'entity_name',
            flex: 4,
            renderer: function (value, metadata, record) {
                return Ext.util.Format.htmlEncode(
                    me.entityLabel(record.get('entity_kind')) + ' ' + value
                );
            }
        }, {
            text: t('State'),
            dataIndex: 'state',
            flex: 1,
            renderer: function (value) {
                return Ext.util.Format.htmlEncode(me.stateLabel(value));
            }
        }, {
            text: t('Recurrences'),
            dataIndex: 'occurrence_count',
            flex: 1,
            align: 'right'
        }, {
            text: t('Last detection'),
            dataIndex: 'last_seen',
            flex: 3,
            renderer: function (value) {
                return Ext.util.Format.htmlEncode(me.formatDate(value));
            }
        }];
        me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            items: [{
                xtype: 'combobox',
                reference: 'stateFilter',
                fieldLabel: t('State'),
                labelWidth: 42,
                width: 190,
                editable: false,
                queryMode: 'local',
                value: 'active',
                store: [
                    ['active', t('Active')],
                    ['new', t('New only')],
                    ['acknowledged', t('Acknowledged')],
                    ['resolved', t('Resolved')],
                    ['false_positive', t('False positives')]
                ],
                listeners: {
                    change: 'onFilterChange'
                }
            }, {
                xtype: 'combobox',
                reference: 'severityFilter',
                fieldLabel: t('Priority'),
                labelWidth: 52,
                width: 190,
                editable: false,
                queryMode: 'local',
                value: '',
                store: [
                    ['', t('All')],
                    ['critical', t('Check now')],
                    ['warning', t('Monitor')]
                ],
                listeners: {
                    change: 'onFilterChange'
                }
            }, {
                xtype: 'combobox',
                reference: 'entityFilter',
                fieldLabel: t('Component'),
                labelWidth: 70,
                width: 200,
                editable: false,
                queryMode: 'local',
                value: '',
                store: [
                    ['', t('All')],
                    ['trunk', t('Trunks')],
                    ['server', t('Servers')],
                    ['proxy', t('Proxies')]
                ],
                listeners: {
                    change: 'onFilterChange'
                }
            }, {
                xtype: 'combobox',
                reference: 'typeFilter',
                fieldLabel: t('Problem'),
                labelWidth: 52,
                width: 245,
                editable: false,
                queryMode: 'local',
                value: '',
                store: [
                    ['', t('All problems')],
                    ['low_asr', t('Low ASR')],
                    ['abnormal_acd', t('Abnormal ACD')],
                    ['trunk_offline', t('Trunk offline')],
                    ['recurring_trunk_error', t('Recurring trunk error')],
                    ['server_activity_drop', t('Server activity drop')],
                    ['server_error_divergence', t('Divergent server errors')],
                    ['dispatcher_membership_mismatch',
                        t('Persistent dispatcher mismatch')],
                    ['dispatcher_runtime_mismatch',
                        t('Dispatcher in-memory mismatch')],
                    ['proxy_runtime_probe_unavailable',
                        t('Proxy probe unavailable')],
                    ['proxy_dispatcher_unreachable',
                        t('Proxy destination unavailable')]
                ],
                listeners: {
                    change: 'onFilterChange'
                }
            }, {
                xtype: 'combobox',
                reference: 'daysFilter',
                fieldLabel: t('Period'),
                labelWidth: 42,
                width: 140,
                hidden: true,
                editable: false,
                queryMode: 'local',
                value: 7,
                store: [
                    [7, t('7 days')],
                    [30, t('30 days')],
                    [90, t('90 days')]
                ],
                listeners: {
                    change: 'onFilterChange'
                }
            }, '->', {
                xtype: 'button',
                text: t('Refresh now'),
                handler: 'onRefresh'
            }]
        }, {
            xtype: 'pagingtoolbar',
            dock: 'bottom',
            store: me.store,
            displayInfo: true
        }];
        me.callParent(arguments);
    },
    stateLabel: function (value) {
        return {
            'new': t('New'),
            acknowledged: t('Acknowledged'),
            resolved: t('Resolved'),
            false_positive: t('False positive')
        }[value] || value;
    },
    entityLabel: function (value) {
        return {
            trunk: t('Trunk'),
            server: t('Server'),
            proxy: t('Proxy')
        }[value] || value;
    },
    formatDate: function (value) {
        if (!value) {
            return t('Not informed');
        }
        return String(value).replace(/\.\d+$/, '') + ' ' + t('UTC');
    }
});
