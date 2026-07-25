/**
 * Controller do painel operacional do Magnus Sentinel.
 */
Ext.define('MBilling.view.magnusSentinel.Controller', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.magnussentinel',
    onRenderModule: function() {
        var me = this;
        me.list = me.lookupReference('incidentList');
        me.detail = me.lookupReference('incidentDetail');
        me.store = me.list.getStore();
        me.store.on('load', me.onStoreLoad, me);
        me.store.getProxy().on('exception', me.onProxyException, me);
        me.loadIncidents();
    },
    onDestroyModule: function() {
        var me = this;
        me.detailGeneration = (me.detailGeneration || 0) + 1;
        if (me.store) {
            me.store.un('load', me.onStoreLoad, me);
            me.store.getProxy().un('exception', me.onProxyException, me);
        }
        Ext.Array.each(me.detailRequests || [], function(request) {
            Ext.Ajax.abort(request);
        });
    },
    onFilterChange: function() {
        var me = this;
        var state = me.lookupReference('stateFilter');
        var days = me.lookupReference('daysFilter');
        if (state && days) {
            days.setVisible(
                state.getValue() === 'resolved' ||
                state.getValue() === 'false_positive'
            );
        }
        if (me.store) {
            me.loadIncidents();
        }
    },
    onRefresh: function() {
        this.loadIncidents();
    },
    loadIncidents: function() {
        var me = this;
        var state = me.lookupReference('stateFilter').getValue();
        var params = {
            state: state,
            limit: 100
        };
        var severity = me.lookupReference('severityFilter').getValue();
        var entity = me.lookupReference('entityFilter').getValue();
        var type = me.lookupReference('typeFilter').getValue();
        if (severity) {
            params.severity = severity;
        }
        if (entity) {
            params.entity_kind = entity;
        }
        if (type) {
            params.incident_type = type;
        }
        if (state === 'resolved' || state === 'false_positive') {
            params.days = me.lookupReference('daysFilter').getValue();
        }
        me.store.getProxy().setExtraParams(params);
        me.store.loadPage(1);
    },
    onStoreLoad: function(store, records, successful, operation) {
        var me = this;
        var resultSet = operation && operation.getResultSet ?
            operation.getResultSet() : null;
        var reader = store.getProxy().getReader();
        var raw = reader.rawData || {};
        var data = raw.data || {};
        var summary = resultSet && resultSet.getMetadata ?
            resultSet.getMetadata() : null;
        var state = me.lookupReference('stateFilter').getValue();
        if (!successful) {
            return;
        }
        summary = summary || data.summary || {};
        me.getView().down('magnussentinelsummary').setSummary(
            summary,
            state === 'resolved' || state === 'false_positive'
        );
        me.list.getSelectionModel().deselectAll();
        me.detail.clearIncident();
        me.detail.collapse();
    },
    onProxyException: function() {
        Ext.ux.Alert.alert(
            t('Error'),
            t('Check the session, the Sentinel API and server connectivity.'),
            'error'
        );
    },
    onIncidentSelectionChange: function(selectionModel, records) {
        if (records.length) {
            this.detail.expand();
            this.loadDetail(records[0].get('id'));
        }
    },
    loadDetail: function(id) {
        var me = this;
        var generation = (me.detailGeneration || 0) + 1;
        var pending = 2;
        var detailData = null;
        var transitions = [];
        var errorMessage = '';
        me.detailGeneration = generation;
        Ext.Array.each(me.detailRequests || [], function(request) {
            Ext.Ajax.abort(request);
        });
        me.detail.setLoading(t('Loading...'));
        function complete() {
            pending -= 1;
            if (pending > 0 || generation !== me.detailGeneration) {
                return;
            }
            me.detail.setLoading(false);
            if (errorMessage || !detailData) {
                me.detail.showError(
                    errorMessage || t('Invalid server response.')
                );
                return;
            }
            me.detail.update(me.prepareDetail(detailData, transitions));
        }
        function callback(kind) {
            return function(options, success, response) {
                var payload;
                if (!success) {
                    errorMessage = t(
                        'The details did not respond. Refresh and try again.'
                    );
                    complete();
                    return;
                }
                try {
                    payload = Ext.decode(response.responseText);
                    if (!payload || payload.success !== true ||
                        payload.api_version !== 'magnus-sentinel.api/v1') {
                        throw new Error(
                            payload && payload.error ?
                                payload.error : t('Invalid server response.')
                        );
                    }
                    if (kind === 'detail') {
                        detailData = payload.data;
                    } else {
                        transitions = payload.data.items || [];
                    }
                } catch (error) {
                    errorMessage = error.message;
                }
                complete();
            };
        }
        me.detailRequests = [
            Ext.Ajax.request({
                url: 'index.php/magnusSentinelIncident/detail',
                method: 'GET',
                params: {
                    id: id
                },
                timeout: 15000,
                callback: callback('detail')
            }),
            Ext.Ajax.request({
                url: 'index.php/magnusSentinelIncident/transitions',
                method: 'GET',
                params: {
                    id: id,
                    limit: 25
                },
                timeout: 15000,
                callback: callback('transitions')
            })
        ];
    },
    prepareDetail: function(data, transitions) {
        var me = this;
        var incident = data.incident || {};
        var entity = incident.entity || {};
        var probableCause = incident.probable_cause || {};
        var action = incident.recommended_action || {};
        var operatorSteps = action.operator_steps || [
            t('Confirm whether calls are affected and note numbers, times and results.'),
            t('Send this incident and your observations to support. Do not change the configuration without guidance.')
        ];
        var technicalSteps = action.technical_steps || (
            action.description ? [action.description] : [
                t('Review the evidence and correlate it with logs and configuration before making changes.')
            ]
        );
        return {
            loaded: true,
            priority: data.severity === 'critical' ?
                t('CHECK NOW') : t('MONITOR'),
            priorityColor: data.severity === 'critical' ?
                '#8e1b12' : '#8a3418',
            title: incident.title || '',
            summary: incident.summary || '',
            entity: me.entityLabel(entity.kind) + ' ' + (entity.name || ''),
            state: me.stateLabel(data.state),
            firstSeen: me.formatDate(data.first_seen),
            lastSeen: me.formatDate(data.last_seen),
            impact: (incident.impact || {}).description || '',
            probableCause: probableCause.description || '',
            probableCauseHelp: probableCause.hypothesis === true ?
                t('This is a hypothesis based on the available evidence. It must be confirmed before changing the system.') :
                t('This cause is supported by direct evidence collected by the Sentinel.'),
            confidence: me.confidenceLabel(probableCause.confidence),
            hypothesis: probableCause.hypothesis === true,
            recommendedAction: t('Follow the steps for your role. Do not make configuration changes without confirming the cause.'),
            operatorSteps: operatorSteps,
            technicalSteps: technicalSteps,
            evidence: Ext.Array.map(
                incident.evidence || [],
                me.prepareEvidence,
                me
            ),
            transitions: Ext.Array.map(
                transitions || [],
                me.prepareTransition,
                me
            )
        };
    },
    prepareEvidence: function(item) {
        var labels = {
            response_code: t('Received code'),
            response_reason: t('Received response'),
            current_asr: t('Current ASR'),
            baseline_asr: t('Historical reference ASR'),
            current_acd: t('Current ACD'),
            baseline_acd: t('Expected ACD'),
            calls: t('Attempts'),
            answered: t('Answered'),
            baseline_calls: t('Baseline attempts'),
            baseline_answered: t('Baseline answered calls'),
            baseline_days: t('Baseline days'),
            baseline_answered_days: t('Baseline answered days'),
            current_count: t('Current occurrences'),
            previous_count: t('Previous occurrences'),
            current_rate: t('Current rate'),
            previous_rate: t('Previous rate'),
            current_events: t('Current events'),
            expected_events: t('Expected events'),
            error_rate: t('Error rate'),
            peer_median: t('Peer median'),
            events: t('Events'),
            expected_members: t('Expected servers'),
            configured_members: t('Configured servers'),
            runtime_members: t('In-memory servers'),
            missing_workers: t('Missing servers'),
            missing_in_memory: t('Missing in memory'),
            extra_destinations: t('Unexpected destinations'),
            extra_workers: t('Unexpected servers'),
            extra_in_memory: t('Unexpected in memory'),
            unhealthy_destinations: t('Unavailable destinations'),
            weight_mismatches: t('Different weights'),
            priority_mismatches: t('Different priorities'),
            nonzero_states: t('Nonzero states'),
            nonzero_state_destinations: t('Destinations with nonzero state'),
            invalid_destinations: t('Invalid destinations'),
            invalid_worker_addresses: t('Invalid server addresses'),
            snapshot_age_seconds: t('Snapshot age'),
            probe_duration_ms: t('Probe duration'),
            runtime_state_verified: t('Runtime verified'),
            proxy_host: t('Proxy address'),
            error_code: t('Error code'),
            error_class: t('Technical error category')
        };
        var help = {
            current_asr: t('Percentage of answered calls in the current 15-minute window: answered calls divided by total attempts.'),
            baseline_asr: t('Historical ASR for this trunk in the same 15-minute windows of up to seven previous days. It is not a configured target or a carrier guarantee.'),
            current_acd: t('Average duration of answered calls in the current 15-minute window.'),
            baseline_acd: t('Historical average call duration for the same time windows of previous days.'),
            calls: t('Answered calls plus rejected calls in the current 15-minute window.'),
            answered: t('Calls answered in the current 15-minute window.'),
            baseline_calls: t('Sum of answered and rejected calls in the historical windows used as reference.'),
            baseline_answered: t('Calls answered in the historical windows used to calculate the reference ASR.'),
            baseline_days: t('Previous days with valid data in the same time window. At least three days are required.'),
            baseline_answered_days: t('Previous days with answered calls in the same time window.'),
            response_code: t('Raw code received from the trunk or internal Asterisk cause. The Sentinel does not change its meaning.'),
            response_reason: t('Raw text received with the attempt result.'),
            current_count: t('Occurrences observed in the current detector window.'),
            previous_count: t('Occurrences observed in the historical comparison window.'),
            current_rate: t('Percentage share of this occurrence in the current window.'),
            previous_rate: t('Historical percentage share of this occurrence.'),
            current_events: t('Events received from this server in the current window.'),
            expected_events: t('Expected event count based on the recent behavior of the servers.'),
            error_rate: t('Percentage of this server attempts classified as failures by the detector.'),
            peer_median: t('Median failure rate of the other comparable servers.'),
            events: t('Total events used to calculate the displayed rate.'),
            expected_members: t('Servers that should participate according to the MagnusBilling topology.'),
            configured_members: t('Destinations found in the persistent dispatcher configuration.'),
            runtime_members: t('Destinations found in the dispatcher currently loaded in memory.'),
            missing_workers: t('Expected servers not found in the persistent configuration.'),
            missing_in_memory: t('Persistent destinations not found in the dispatcher loaded in memory.'),
            extra_destinations: t('Persistent destinations that are not part of the expected topology.'),
            extra_workers: t('Configured destinations that are not part of the expected topology.'),
            extra_in_memory: t('Destinations found in memory but absent from the persistent configuration.'),
            unhealthy_destinations: t('Destinations loaded in memory with a state other than healthy.'),
            weight_mismatches: t('Destinations whose weights differ between the compared sources.'),
            priority_mismatches: t('Destinations whose priorities differ between configuration and memory.'),
            nonzero_states: t('Persistent destinations with an administrative state other than zero.'),
            nonzero_state_destinations: t('Persistent destinations with an administrative state other than zero.'),
            invalid_destinations: t('Destinations that could not be built or validated from the current configuration.'),
            invalid_worker_addresses: t('Servers whose expected SIP address could not be built or validated.'),
            snapshot_age_seconds: t('Age in seconds of the proxy runtime snapshot.'),
            probe_duration_ms: t('Time spent by the local probe querying the proxy state.'),
            runtime_state_verified: t('Indicates whether the Sentinel verified the state actually loaded in memory.'),
            proxy_host: t('Address of the proxy related to this diagnosis.'),
            error_code: t('Safe identifier for the failure found by the probe.'),
            error_class: t('Technical exception category. Credentials and sensitive messages are not exposed.')
        };
        return {
            label: labels[item.key] || item.key,
            value: this.evidenceValue(item),
            help: item.description || help[item.key] ||
                t('Technical evidence used by the detector to explain this incident.')
        };
    },
    confidenceLabel: function(value) {
        return {
            low: t('Low'),
            medium: t('Medium'),
            high: t('High')
        }[value] || t('Not informed');
    },
    evidenceValue: function(item) {
        var value = item.value;
        if (Ext.isArray(value)) {
            return value.length ? value.join(', ') : t('None');
        }
        if (Ext.isObject(value)) {
            return Ext.encode(value);
        }
        if (Ext.isNumber(value) && [
            'current_asr', 'baseline_asr', 'error_rate',
            'current_rate', 'previous_rate'
        ].indexOf(item.key) !== -1) {
            return value + '%';
        }
        if (Ext.isNumber(value) && [
            'current_acd', 'baseline_acd'
        ].indexOf(item.key) !== -1) {
            return value + ' s';
        }
        return String(Ext.isEmpty(value) ? '' : value);
    },
    prepareTransition: function(item) {
        var from = item.from_state ?
            this.stateLabel(item.from_state) : t('Creation');
        return {
            state: from + ' → ' + this.stateLabel(item.to_state),
            date: this.formatDate(item.changed_at),
            note: item.note || ''
        };
    },
    stateLabel: function(value) {
        return {
            'new': t('New'),
            acknowledged: t('Acknowledged'),
            resolved: t('Resolved'),
            false_positive: t('False positive')
        }[value] || value;
    },
    entityLabel: function(value) {
        return {
            trunk: t('Trunk'),
            server: t('Server'),
            proxy: t('Proxy')
        }[value] || value;
    },
    formatDate: function(value) {
        if (!value) {
            return t('Not informed');
        }
        return String(value).replace(/\.\d+$/, '') + ' ' + t('UTC');
    }
});
