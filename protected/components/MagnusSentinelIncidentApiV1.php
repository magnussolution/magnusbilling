<?php

/**
 * Contrato e consultas somente de leitura da API de incidentes.
 *
 * @magnus-sentinel-managed
 *
 * Este componente não consulta CDR nem eventos brutos. Todas as consultas
 * possuem período e paginação limitados.
 */
class MagnusSentinelIncidentApiV1
{
    const API_VERSION = 'magnus-sentinel.api/v1';
    const CONTRACT_VERSION = 'magnus-sentinel.incident/v1';
    const DEFAULT_LIMIT = 25;
    const MAX_LIMIT = 100;
    const DEFAULT_DAYS = 7;
    const MAX_DAYS = 90;
    const MAX_START = 10000;
    const MAX_CONTRACT_BYTES = 262144;

    private static $states = [
        'new',
        'acknowledged',
        'resolved',
        'false_positive',
        'active',
    ];
    private static $severities = ['warning', 'critical'];
    private static $entityKinds = ['trunk', 'server', 'proxy', 'fleet'];
    private static $healthRanks = [
        'HEALTHY' => 0,
        'UNKNOWN' => 1,
        'DEGRADED' => 2,
        'STALE' => 3,
        'UNHEALTHY' => 4,
    ];
    private static $evidenceKeys = [
        'response_code',
        'response_reason',
        'current_asr',
        'baseline_asr',
        'current_acd',
        'baseline_acd',
        'calls',
        'answered',
        'baseline_calls',
        'baseline_answered',
        'baseline_days',
        'baseline_answered_days',
        'current_count',
        'previous_count',
        'current_rate',
        'previous_rate',
        'current_events',
        'expected_events',
        'drop_percentage',
        'involved_servers',
        'monitored_servers',
        'server_distribution',
        'current_expected_ratio',
        'peer_ratio_median',
        'additional_to_global_drop',
        'error_rate',
        'peer_median',
        'events',
        'expected_members',
        'configured_members',
        'runtime_members',
        'missing_workers',
        'missing_in_memory',
        'extra_destinations',
        'extra_workers',
        'extra_in_memory',
        'unhealthy_destinations',
        'weight_mismatches',
        'priority_mismatches',
        'nonzero_states',
        'nonzero_state_destinations',
        'invalid_destinations',
        'invalid_worker_addresses',
        'snapshot_age_seconds',
        'probe_duration_ms',
        'runtime_state_verified',
        'proxy_host',
        'error_code',
        'error_class',
    ];

    public static function parseListParams($input)
    {
        $state = self::enumValue(
            $input,
            'state',
            self::$states,
            'new'
        );
        $severity = self::enumValue(
            $input,
            'severity',
            self::$severities,
            null
        );
        $entityKind = self::enumValue(
            $input,
            'entity_kind',
            self::$entityKinds,
            null
        );
        $entityId = self::optionalInteger($input, 'entity_id', 1, 4294967295);
        if ($entityKind === null && $entityId !== null) {
            throw new InvalidArgumentException(
                'entity_kind_required_for_entity_id'
            );
        }

        $incidentType = null;
        if (isset($input['incident_type']) && $input['incident_type'] !== '') {
            $incidentType = (string) $input['incident_type'];
            if (! preg_match('/^[a-z0-9_]{1,64}$/', $incidentType)) {
                throw new InvalidArgumentException('invalid_incident_type');
            }
        }

        return [
            'state' => $state,
            'severity' => $severity,
            'entity_kind' => $entityKind,
            'entity_id' => $entityId,
            'incident_type' => $incidentType,
            'start' => self::integerValue(
                $input,
                'start',
                0,
                self::MAX_START,
                0
            ),
            'limit' => self::integerValue(
                $input,
                'limit',
                1,
                self::MAX_LIMIT,
                self::DEFAULT_LIMIT
            ),
            'days' => self::integerValue(
                $input,
                'days',
                1,
                self::MAX_DAYS,
                self::DEFAULT_DAYS
            ),
        ];
    }

    public static function parseId($input)
    {
        return self::integerValue($input, 'id', 1, 9223372036854775807, null);
    }

    public static function parseTransitionParams($input)
    {
        return [
            'id' => self::parseId($input),
            'limit' => self::integerValue(
                $input,
                'limit',
                1,
                self::MAX_LIMIT,
                self::DEFAULT_LIMIT
            ),
        ];
    }

    public static function listIncidents($db, $input)
    {
        $options = self::parseListParams($input);
        list($where, $params, $index) = self::listWhere($options);

        $countSql = "
            SELECT COUNT(*) total,
                   COALESCE(SUM(i.severity='critical'),0) critical,
                   COALESCE(SUM(i.severity='warning'),0) warning
            FROM pkg_magnus_sentinel_incident i FORCE INDEX ({$index})
            WHERE {$where}
        ";
        $summary = self::queryRow($db, $countSql, $params);
        $total = (int) $summary['total'];

        $sql = "
            SELECT i.id,i.incident_type,i.detector_version,i.state,
                   i.severity,i.entity_kind,i.entity_id,i.first_seen,
                   i.last_seen,i.occurrence_count,i.state_changed_at,
                   i.incident_json
            FROM pkg_magnus_sentinel_incident i FORCE INDEX ({$index})
            WHERE {$where}
            ORDER BY i.severity DESC,i.last_seen DESC,i.id DESC
            LIMIT :limit OFFSET :start
        ";
        $queryParams = $params;
        $queryParams[':limit'] = $options['limit'];
        $queryParams[':start'] = $options['start'];
        $rows = self::queryAll($db, $sql, $queryParams);

        $items = [];
        foreach ($rows as $row) {
            $items[] = self::projectListRow($row);
        }
        return [
            'items' => $items,
            'pagination' => [
                'start' => $options['start'],
                'limit' => $options['limit'],
                'returned' => count($items),
                'total' => $total,
                'has_more' => $options['start'] + count($items) < $total,
            ],
            'summary' => [
                'total' => $total,
                'critical' => (int) $summary['critical'],
                'warning' => (int) $summary['warning'],
            ],
            'health' => self::getHealth($db),
            'filters' => [
                'state' => $options['state'],
                'severity' => $options['severity'],
                'entity_kind' => $options['entity_kind'],
                'entity_id' => $options['entity_id'],
                'incident_type' => $options['incident_type'],
                'days' => in_array(
                    $options['state'],
                    ['resolved', 'false_positive'],
                    true
                ) ? $options['days'] : null,
            ],
        ];
    }

    public static function getHealth($db, $input = [])
    {
        $evaluatedAt = (string) self::queryScalar(
            $db,
            'SELECT UTC_TIMESTAMP(6)',
            []
        );
        $rows = self::queryAll(
            $db,
            "
            SELECT h.component,h.id_server,h.heartbeat_at,
                   h.process_started_at,h.last_cycle_success_at,
                   h.last_event_seen_at,h.last_event_committed_at,
                   h.pending_events,h.oldest_pending_event_at,
                   h.consecutive_database_failures,h.last_error_at,
                   h.last_error_code,h.last_error_message,
                   h.stale_after_seconds,h.version,
                   COALESCE(NULLIF(s.name,''),NULLIF(s.public_ip,'')) server_name,
                   TIMESTAMPDIFF(
                       SECOND,h.heartbeat_at,UTC_TIMESTAMP(6)
                   ) heartbeat_age_seconds,
                   CASE WHEN h.pending_events>0
                        AND h.oldest_pending_event_at IS NOT NULL
                        THEN TIMESTAMPDIFF(
                            SECOND,h.oldest_pending_event_at,UTC_TIMESTAMP(6)
                        )
                        ELSE 0 END ingest_lag_seconds
            FROM pkg_magnus_sentinel_component_health h
            LEFT JOIN pkg_servers s ON s.id=h.id_server AND h.id_server<>0
            ORDER BY h.id_server,h.component
            ",
            []
        );
        $serverRows = self::queryAll(
            $db,
            "
            SELECT id,COALESCE(NULLIF(name,''),NULLIF(public_ip,'')) name
            FROM pkg_servers
            WHERE type IN ('asterisk','mbilling')
              AND status IN (1,4)
            ORDER BY id
            ",
            []
        );

        $records = [];
        $serverNames = [0 => 'MASTER'];
        foreach ($serverRows as $serverRow) {
            $serverNames[(int) $serverRow['id']] = (
                $serverRow['name'] !== null
                ? (string) $serverRow['name']
                : 'Server ' . (int) $serverRow['id']
            );
        }
        foreach ($rows as $row) {
            $record = self::projectHealthRow($row, $evaluatedAt);
            $key = $record['component'] . ':' . $record['id_server'];
            $records[$key] = $record;
            if ($record['server_name'] !== '') {
                $serverNames[$record['id_server']] = $record['server_name'];
            }
        }

        $masterId = 0;
        foreach ($records as $record) {
            if ($record['component'] === 'analyzer') {
                $masterId = $record['id_server'];
                break;
            }
        }
        if ($masterId === 0 && isset($serverNames[1])) {
            $masterId = isset($records['collector:0']) ? 0 : 1;
        }
        self::ensureHealthRecord(
            $records,
            'analyzer',
            $masterId,
            isset($serverNames[$masterId]) ? $serverNames[$masterId] : 'MASTER',
            1200,
            $evaluatedAt
        );
        self::ensureHealthRecord(
            $records,
            'collector',
            $masterId,
            isset($serverNames[$masterId]) ? $serverNames[$masterId] : 'MASTER',
            180,
            $evaluatedAt
        );
        foreach ($serverRows as $serverRow) {
            $idServer = (int) $serverRow['id'];
            if ($idServer === $masterId || $idServer === 1) {
                continue;
            }
            self::ensureHealthRecord(
                $records,
                'collector',
                $idServer,
                $serverNames[$idServer],
                180,
                $evaluatedAt
            );
        }

        $components = array_values($records);
        usort($components, function ($left, $right) {
            if ($left['id_server'] === $right['id_server']) {
                return strcmp($left['component'], $right['component']);
            }
            return $left['id_server'] < $right['id_server'] ? -1 : 1;
        });
        $aggregateStatus = 'HEALTHY';
        foreach ($components as $component) {
            if (
                self::$healthRanks[$component['health_status']]
                > self::$healthRanks[$aggregateStatus]
            ) {
                $aggregateStatus = $component['health_status'];
            }
        }
        if (! $components) {
            $aggregateStatus = 'UNKNOWN';
        }
        $aggregateReasons = [];
        $servers = [];
        foreach ($components as $component) {
            $serverKey = (string) $component['id_server'];
            if (! isset($servers[$serverKey])) {
                $servers[$serverKey] = [
                    'id_server' => (
                        $component['id_server'] === 0
                        ? null
                        : $component['id_server']
                    ),
                    'server_name' => $component['server_name'],
                    'health_status' => 'HEALTHY',
                    'health_reasons' => [],
                    'components' => [],
                ];
            }
            $servers[$serverKey]['components'][] = $component['component'];
            if (
                self::$healthRanks[$component['health_status']]
                > self::$healthRanks[$servers[$serverKey]['health_status']]
            ) {
                $servers[$serverKey]['health_status'] =
                    $component['health_status'];
                $servers[$serverKey]['health_reasons'] =
                    $component['health_reasons'];
            } elseif (
                $component['health_status']
                === $servers[$serverKey]['health_status']
            ) {
                $servers[$serverKey]['health_reasons'] = array_values(
                    array_unique(array_merge(
                        $servers[$serverKey]['health_reasons'],
                        $component['health_reasons']
                    ))
                );
            }
            if ($component['health_status'] === $aggregateStatus) {
                foreach ($component['health_reasons'] as $reason) {
                    $aggregateReasons[] = [
                        'component' => $component['component'],
                        'id_server' => (
                            $component['id_server'] === 0
                            ? null
                            : $component['id_server']
                        ),
                        'server_name' => $component['server_name'],
                        'reason' => $reason,
                    ];
                }
            }
        }
        return [
            'health_status' => $aggregateStatus,
            'health_reasons' => $aggregateReasons,
            'evaluated_at' => $evaluatedAt,
            'components' => $components,
            'servers' => array_values($servers),
        ];
    }

    private static function ensureHealthRecord(
        &$records,
        $component,
        $idServer,
        $serverName,
        $staleAfter,
        $evaluatedAt
    ) {
        $key = $component . ':' . $idServer;
        if (isset($records[$key])) {
            return;
        }
        $records[$key] = [
            'component' => $component,
            'id_server' => (int) $idServer,
            'server_name' => (string) $serverName,
            'heartbeat_at' => null,
            'process_started_at' => null,
            'last_cycle_success_at' => null,
            'last_event_seen_at' => null,
            'last_event_committed_at' => null,
            'pending_events' => 0,
            'oldest_pending_event_at' => null,
            'consecutive_database_failures' => 0,
            'last_error_at' => null,
            'last_error_code' => null,
            'last_error_message' => null,
            'stale_after_seconds' => (int) $staleAfter,
            'version' => null,
            'heartbeat_age_seconds' => null,
            'ingest_lag_seconds' => 0,
            'health_status' => 'UNKNOWN',
            'health_reasons' => ['heartbeat_missing'],
            'evaluated_at' => $evaluatedAt,
        ];
    }

    private static function projectHealthRow($row, $evaluatedAt)
    {
        $pending = (int) $row['pending_events'];
        $failures = (int) $row['consecutive_database_failures'];
        $heartbeatAge = max(0, (int) $row['heartbeat_age_seconds']);
        $lag = max(0, (int) $row['ingest_lag_seconds']);
        $staleAfter = (int) $row['stale_after_seconds'];
        $reasons = [];
        if ($heartbeatAge > $staleAfter) {
            $status = 'STALE';
            $reasons[] = 'heartbeat_stale';
        } elseif ($row['last_cycle_success_at'] === null) {
            $status = 'UNKNOWN';
            $reasons[] = 'successful_cycle_missing';
        } elseif (
            $row['last_error_at'] !== null
            && (
                $row['last_cycle_success_at'] === null
                || $row['last_error_at'] > $row['last_cycle_success_at']
            )
        ) {
            $status = 'UNHEALTHY';
            $reasons[] = (
                $row['last_error_code'] ?: 'component_error'
            );
        } elseif ($failures >= 3) {
            $status = 'UNHEALTHY';
            $reasons[] = 'repeated_database_failures';
        } elseif ($failures > 0 || $pending > 0) {
            $status = 'DEGRADED';
            if ($failures > 0) {
                $reasons[] = 'recoverable_database_failures';
            }
            if ($pending > 0) {
                $reasons[] = 'pending_events';
            }
        } elseif (
            $row['component'] === 'collector'
            && $row['last_event_committed_at'] === null
        ) {
            $status = 'UNKNOWN';
            $reasons[] = 'committed_event_evidence_missing';
        } else {
            $status = 'HEALTHY';
        }
        return [
            'component' => (string) $row['component'],
            'id_server' => (int) $row['id_server'],
            'server_name' => (
                $row['id_server'] == 0
                ? 'MASTER'
                : (
                    $row['server_name'] !== null
                    ? self::boundedText($row['server_name'], 160)
                    : 'Server ' . (int) $row['id_server']
                )
            ),
            'heartbeat_at' => $row['heartbeat_at'],
            'process_started_at' => $row['process_started_at'],
            'last_cycle_success_at' => $row['last_cycle_success_at'],
            'last_event_seen_at' => $row['last_event_seen_at'],
            'last_event_committed_at' => $row['last_event_committed_at'],
            'pending_events' => $pending,
            'oldest_pending_event_at' => $row['oldest_pending_event_at'],
            'consecutive_database_failures' => $failures,
            'last_error_at' => $row['last_error_at'],
            'last_error_code' => $row['last_error_code'],
            'last_error_message' => (
                $row['last_error_message'] !== null
                ? self::boundedText($row['last_error_message'], 255)
                : null
            ),
            'stale_after_seconds' => $staleAfter,
            'version' => $row['version'],
            'heartbeat_age_seconds' => $heartbeatAge,
            'ingest_lag_seconds' => $lag,
            'health_status' => $status,
            'health_reasons' => $reasons,
            'evaluated_at' => $evaluatedAt,
        ];
    }

    public static function getIncident($db, $input)
    {
        $id = self::parseId($input);
        $sql = "
            SELECT id,LOWER(HEX(fingerprint)) fingerprint,incident_type,
                   detector_version,state,severity,entity_kind,entity_id,
                   first_seen,last_seen,occurrence_count,state_changed_at,
                   incident_json
            FROM pkg_magnus_sentinel_incident
            WHERE id=:id
            LIMIT 1
        ";
        $row = self::queryRow($db, $sql, [':id' => $id]);
        if ($row === false) {
            return null;
        }
        $contract = self::decodeContract($row['incident_json']);
        unset($row['incident_json']);
        $row['id'] = (int) $row['id'];
        $row['detector_version'] = (int) $row['detector_version'];
        $row['entity_id'] = (int) $row['entity_id'];
        $row['occurrence_count'] = (int) $row['occurrence_count'];
        $row['incident'] = $contract;
        return $row;
    }

    public static function getTransitions($db, $input)
    {
        $options = self::parseTransitionParams($input);
        $exists = self::queryScalar(
            $db,
            'SELECT id FROM pkg_magnus_sentinel_incident WHERE id=:id LIMIT 1',
            [':id' => $options['id']]
        );
        if ($exists === false) {
            return null;
        }
        $sql = "
            SELECT id,from_state,to_state,changed_at,actor,note
            FROM pkg_magnus_sentinel_incident_transition
                 FORCE INDEX (ix_transition_incident)
            WHERE id_incident=:id
            ORDER BY changed_at DESC,id DESC
            LIMIT :limit
        ";
        $rows = self::queryAll(
            $db,
            $sql,
            [':id' => $options['id'], ':limit' => $options['limit']]
        );
        foreach ($rows as &$row) {
            $row['id'] = (int) $row['id'];
        }
        unset($row);
        return [
            'incident_id' => $options['id'],
            'items' => $rows,
            'limit' => $options['limit'],
        ];
    }

    public static function projectListRow($row)
    {
        $contract = self::decodeContract($row['incident_json']);
        $entity = isset($contract['entity']) && is_array($contract['entity'])
            ? $contract['entity']
            : [];
        $impact = isset($contract['impact']) && is_array($contract['impact'])
            ? $contract['impact']
            : [];
        return [
            'id' => (int) $row['id'],
            'incident_type' => (string) $row['incident_type'],
            'detector_version' => (int) $row['detector_version'],
            'state' => (string) $row['state'],
            'severity' => (string) $row['severity'],
            'entity_kind' => (string) $row['entity_kind'],
            'entity_id' => (int) $row['entity_id'],
            'entity_name' => isset($entity['name'])
                ? self::boundedText($entity['name'], 160)
                : (string) $row['entity_id'],
            'title' => isset($contract['title'])
                ? self::boundedText($contract['title'], 160)
                : (string) $row['incident_type'],
            'summary' => isset($contract['summary'])
                ? self::boundedText($contract['summary'], 512)
                : '',
            'priority' => isset($impact['priority'])
                ? self::boundedText($impact['priority'], 32)
                : (
                    $row['severity'] === 'critical'
                    ? 'immediate'
                    : 'attention'
                ),
            'first_seen' => (string) $row['first_seen'],
            'last_seen' => (string) $row['last_seen'],
            'occurrence_count' => (int) $row['occurrence_count'],
            'state_changed_at' => (string) $row['state_changed_at'],
        ];
    }

    public static function decodeContract($raw)
    {
        if (! is_string($raw) || strlen($raw) > self::MAX_CONTRACT_BYTES) {
            throw new RuntimeException('invalid_incident_contract_size');
        }
        $contract = json_decode($raw, true);
        if (
            ! is_array($contract)
            || ! isset($contract['schema_version'])
            || $contract['schema_version'] !== self::CONTRACT_VERSION
        ) {
            throw new RuntimeException('invalid_incident_contract');
        }
        $required = [
            'schema_version',
            'fingerprint',
            'type',
            'detector',
            'severity',
            'detected_at',
            'window',
            'entity',
            'title',
            'summary',
            'impact',
            'probable_cause',
            'recommended_action',
            'evidence',
        ];
        foreach ($required as $key) {
            if (! array_key_exists($key, $contract)) {
                throw new RuntimeException('invalid_incident_contract');
            }
        }
        $projected = array_intersect_key(
            $contract,
            array_flip($required)
        );
        $nested = [
            'detector' => ['id', 'version'],
            'window' => ['start', 'end'],
            'entity' => ['kind', 'id', 'name', 'host'],
            'impact' => ['priority', 'description'],
            'probable_cause' => [
                'description',
                'confidence',
                'hypothesis',
            ],
            'recommended_action' => [
                'description',
                'automatic',
                'operator_steps',
                'technical_steps',
            ],
        ];
        foreach ($nested as $key => $allowed) {
            if (! is_array($projected[$key])) {
                throw new RuntimeException('invalid_incident_contract');
            }
            $projected[$key] = array_intersect_key(
                $projected[$key],
                array_flip($allowed)
            );
        }
        if (! is_array($projected['evidence'])) {
            throw new RuntimeException('invalid_incident_contract');
        }
        $evidence = [];
        foreach (array_slice($projected['evidence'], 0, 24) as $item) {
            if (
                ! is_array($item)
                || ! isset($item['key'])
                || ! in_array(
                    $item['key'],
                    self::$evidenceKeys,
                    true
                )
            ) {
                continue;
            }
            $evidence[] = array_intersect_key(
                $item,
                array_flip([
                    'key',
                    'kind',
                    'description',
                    'value',
                    'item_count',
                    'truncated',
                ])
            );
        }
        $projected['evidence'] = $evidence;
        return $projected;
    }

    private static function listWhere($options)
    {
        $where = [];
        $params = [];
        if ($options['state'] === 'active') {
            $where[] = "i.state IN ('new','acknowledged')";
        } else {
            $where[] = 'i.state=:state';
            $params[':state'] = $options['state'];
        }
        if (
            in_array(
                $options['state'],
                ['resolved', 'false_positive'],
                true
            )
        ) {
            $where[] = "i.last_seen>=UTC_TIMESTAMP()-INTERVAL "
                . $options['days'] . ' DAY';
        }
        if ($options['severity'] !== null) {
            $where[] = 'i.severity=:severity';
            $params[':severity'] = $options['severity'];
        }
        if ($options['incident_type'] !== null) {
            $where[] = 'i.incident_type=:incident_type';
            $params[':incident_type'] = $options['incident_type'];
        }
        $index = 'ix_incident_state_priority';
        if ($options['entity_kind'] !== null) {
            $where[] = 'i.entity_kind=:entity_kind';
            $params[':entity_kind'] = $options['entity_kind'];
            if ($options['entity_id'] !== null) {
                $where[] = 'i.entity_id=:entity_id';
                $params[':entity_id'] = $options['entity_id'];
            }
            $index = 'ix_incident_entity';
        }
        return [implode(' AND ', $where), $params, $index];
    }

    private static function queryAll($db, $sql, $params)
    {
        $command = $db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryAll();
    }

    private static function queryRow($db, $sql, $params)
    {
        $command = $db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryRow();
    }

    private static function queryScalar($db, $sql, $params)
    {
        $command = $db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryScalar();
    }

    private static function enumValue($input, $key, $allowed, $default)
    {
        if (! isset($input[$key]) || $input[$key] === '') {
            return $default;
        }
        $value = (string) $input[$key];
        if (! in_array($value, $allowed, true)) {
            throw new InvalidArgumentException('invalid_' . $key);
        }
        return $value;
    }

    private static function optionalInteger($input, $key, $min, $max)
    {
        if (! isset($input[$key]) || $input[$key] === '') {
            return null;
        }
        return self::integerValue($input, $key, $min, $max, null);
    }

    private static function integerValue($input, $key, $min, $max, $default)
    {
        if (! isset($input[$key]) || $input[$key] === '') {
            if ($default === null) {
                throw new InvalidArgumentException('missing_' . $key);
            }
            return $default;
        }
        $value = filter_var(
            $input[$key],
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => $min, 'max_range' => $max]]
        );
        if ($value === false) {
            throw new InvalidArgumentException('invalid_' . $key);
        }
        return (int) $value;
    }

    private static function boundedText($value, $limit)
    {
        $value = (string) $value;
        return strlen($value) <= $limit
            ? $value
            : substr($value, 0, $limit);
    }
}
