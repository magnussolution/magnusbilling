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
    private static $entityKinds = ['trunk', 'server', 'proxy'];
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
