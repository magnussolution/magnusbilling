<?php

require_once dirname(__DIR__)
    . '/components/MagnusSentinelIncidentApiV1.php';

class SentinelHealthFakeCommand
{
    private $db;
    private $sql;
    private $params = [];

    public function __construct($db, $sql)
    {
        $this->db = $db;
        $this->sql = $sql;
    }

    public function bindValues($params)
    {
        $this->params = $params;
    }

    public function queryAll()
    {
        if (strpos($this->sql, 'component_health') !== false) {
            return $this->db->healthRows;
        }
        if (strpos($this->sql, "type IN ('asterisk','mbilling')") !== false) {
            return $this->db->serverRows;
        }
        if (strpos($this->sql, 'SELECT i.id') !== false) {
            return [];
        }
        return [];
    }

    public function queryRow()
    {
        if (strpos($this->sql, 'COUNT(*) total') !== false) {
            return ['total' => 0, 'critical' => 0, 'warning' => 0];
        }
        return false;
    }

    public function queryScalar()
    {
        if (strpos($this->sql, 'UTC_TIMESTAMP') !== false) {
            return '2026-07-25 18:00:00.000000';
        }
        return false;
    }
}

class SentinelHealthFakeDb
{
    public $healthRows = [];
    public $serverRows = [];

    public function createCommand($sql)
    {
        return new SentinelHealthFakeCommand($this, $sql);
    }
}

function assertSameValue($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new RuntimeException(
            $message . ': expected ' . var_export($expected, true)
            . ', got ' . var_export($actual, true)
        );
    }
}

function healthRow($component, $idServer, $heartbeatAge, $lastCommit = null)
{
    return [
        'component' => $component,
        'id_server' => $idServer,
        'heartbeat_at' => '2026-07-25 17:59:00.000000',
        'process_started_at' => '2026-07-25 17:00:00.000000',
        'last_cycle_success_at' => '2026-07-25 17:59:00.000000',
        'last_event_seen_at' => $lastCommit,
        'last_event_committed_at' => $lastCommit,
        'pending_events' => 0,
        'oldest_pending_event_at' => null,
        'consecutive_database_failures' => 0,
        'last_error_at' => null,
        'last_error_code' => null,
        'last_error_message' => null,
        'stale_after_seconds' => $component === 'analyzer' ? 1200 : 180,
        'version' => 'test',
        'filesystem_status' => null,
        'filesystem_reason' => null,
        'filesystem_path' => null,
        'filesystem_used_percent' => null,
        'filesystem_available_bytes' => null,
        'filesystem_inode_used_percent' => null,
        'filesystem_available_inodes' => null,
        'filesystem_checked_at' => null,
        'server_name' => $idServer ? 'Worker ' . $idServer : null,
        'heartbeat_age_seconds' => $heartbeatAge,
        'ingest_lag_seconds' => 0,
    ];
}

function healthComponentKeys($health)
{
    return array_map(
        function ($component) {
            return $component['component'] . ':' . $component['id_server'];
        },
        $health['components']
    );
}

$emptyDb = new SentinelHealthFakeDb;
$empty = MagnusSentinelIncidentApiV1::getHealth($emptyDb);
assertSameValue('UNKNOWN', $empty['health_status'], 'empty install');

$staleDb = new SentinelHealthFakeDb;
$staleDb->healthRows = [
    healthRow('collector', 0, 60, '2026-07-25 17:58:00.000000'),
    healthRow('analyzer', 0, 1201),
];
$stale = MagnusSentinelIncidentApiV1::listIncidents(
    $staleDb,
    ['state' => 'active']
);
assertSameValue(
    'STALE',
    $stale['health']['health_status'],
    'stale analyzer must control aggregate'
);
assertSameValue(0, $stale['summary']['total'], 'empty incident list');

$healthyDb = new SentinelHealthFakeDb;
$healthyDb->healthRows = [
    healthRow('collector', 0, 60, '2026-07-25 17:58:00.000000'),
    healthRow('analyzer', 0, 60),
];
$healthy = MagnusSentinelIncidentApiV1::getHealth($healthyDb);
assertSameValue('HEALTHY', $healthy['health_status'], 'healthy pipeline');

$diskDb = new SentinelHealthFakeDb;
$diskCollector = healthRow(
    'collector',
    9,
    60,
    '2026-07-25 17:58:00.000000'
);
$diskCollector['filesystem_status'] = 'UNHEALTHY';
$diskCollector['filesystem_reason'] = 'filesystem_space_critical';
$diskCollector['filesystem_path'] = '/';
$diskCollector['filesystem_used_percent'] = '98.00';
$diskCollector['filesystem_available_bytes'] = 470810624;
$diskCollector['filesystem_inode_used_percent'] = '12.50';
$diskCollector['filesystem_available_inodes'] = 100000;
$diskCollector['filesystem_checked_at'] = '2026-07-25 17:59:00.000000';
$diskDb->healthRows = [
    healthRow('collector', 0, 60, '2026-07-25 17:58:00.000000'),
    healthRow('analyzer', 0, 60),
    $diskCollector,
];
$diskDb->serverRows = [['id' => 9, 'name' => 'Worker 5']];
$disk = MagnusSentinelIncidentApiV1::getHealth($diskDb);
assertSameValue(
    'UNHEALTHY',
    $disk['health_status'],
    'critical filesystem controls aggregate'
);
$diskRows = array_values(array_filter(
    $disk['components'],
    function ($component) {
        return $component['id_server'] === 9;
    }
));
assertSameValue(
    'filesystem_space_critical',
    $diskRows[0]['health_reasons'][0],
    'filesystem reason'
);
assertSameValue(
    98.0,
    $diskRows[0]['filesystem_used_percent'],
    'filesystem percentage'
);
assertSameValue(
    470810624,
    $diskRows[0]['filesystem_available_bytes'],
    'filesystem available bytes'
);

$oldSnapshotDb = new SentinelHealthFakeDb;
$oldSnapshot = healthRow(
    'collector',
    0,
    60,
    '2026-07-25 17:58:00.000000'
);
$oldSnapshot['filesystem_status'] = 'UNHEALTHY';
$oldSnapshot['filesystem_reason'] = 'filesystem_space_critical';
$oldSnapshot['filesystem_checked_at'] = '2026-07-25 16:00:00.000000';
$oldSnapshotDb->healthRows = [
    $oldSnapshot,
    healthRow('analyzer', 0, 60),
];
$oldResult = MagnusSentinelIncidentApiV1::getHealth($oldSnapshotDb);
assertSameValue(
    'HEALTHY',
    $oldResult['health_status'],
    'snapshot before process start must be ignored'
);

$currentMasterDb = new SentinelHealthFakeDb;
$oldAnalyzer = healthRow('analyzer', 1, 300000);
$oldAnalyzer['process_started_at'] = '2026-07-22 17:00:00.000000';
$oldCollector = healthRow(
    'collector',
    1,
    300000,
    '2026-07-22 17:58:00.000000'
);
$oldCollector['process_started_at'] = '2026-07-22 17:00:00.000000';
$currentMasterDb->healthRows = [
    healthRow('collector', 0, 60, '2026-07-25 17:58:00.000000'),
    healthRow('analyzer', 0, 60),
    $oldAnalyzer,
    $oldCollector,
    healthRow('collector', 5, 60, '2026-07-25 17:58:00.000000'),
];
$currentMasterDb->serverRows = [
    ['id' => 1, 'name' => 'Legacy master row'],
    ['id' => 5, 'name' => 'Worker 1'],
];
$currentMaster = MagnusSentinelIncidentApiV1::getHealth($currentMasterDb);
assertSameValue(
    'HEALTHY',
    $currentMaster['health_status'],
    'historical master identity must not control aggregate'
);
assertSameValue(
    ['analyzer:0', 'collector:0', 'collector:5'],
    healthComponentKeys($currentMaster),
    'only current master and active topology are exposed'
);

$legacyMasterDb = new SentinelHealthFakeDb;
$legacyMasterDb->healthRows = [
    healthRow('collector', 1, 60, '2026-07-25 17:58:00.000000'),
    healthRow('analyzer', 1, 60),
];
$legacyMasterDb->serverRows = [['id' => 1, 'name' => 'Master']];
$legacyMaster = MagnusSentinelIncidentApiV1::getHealth($legacyMasterDb);
assertSameValue(
    'HEALTHY',
    $legacyMaster['health_status'],
    'legacy master identity remains supported'
);
assertSameValue(
    ['analyzer:1', 'collector:1'],
    healthComponentKeys($legacyMaster),
    'legacy master records remain current when they are the active identity'
);
assertSameValue(
    'MASTER',
    $legacyMaster['components'][0]['server_name'],
    'selected legacy master is labeled as master'
);

$rollbackDb = new SentinelHealthFakeDb;
$historicalExplicitAnalyzer = healthRow('analyzer', 0, 300000);
$historicalExplicitAnalyzer['process_started_at'] =
    '2026-07-22 17:00:00.000000';
$historicalExplicitCollector = healthRow(
    'collector',
    0,
    300000,
    '2026-07-22 17:58:00.000000'
);
$historicalExplicitCollector['process_started_at'] =
    '2026-07-22 17:00:00.000000';
$rollbackDb->healthRows = [
    $historicalExplicitAnalyzer,
    $historicalExplicitCollector,
    healthRow('analyzer', 1, 60),
    healthRow('collector', 1, 60, '2026-07-25 17:58:00.000000'),
];
$rollbackDb->serverRows = [['id' => 1, 'name' => 'Master']];
$rollback = MagnusSentinelIncidentApiV1::getHealth($rollbackDb);
assertSameValue(
    'HEALTHY',
    $rollback['health_status'],
    'newly started legacy identity wins after rollback'
);
assertSameValue(
    ['analyzer:1', 'collector:1'],
    healthComponentKeys($rollback),
    'rollback excludes the older explicit identity'
);

$decommissionedDb = new SentinelHealthFakeDb;
$decommissionedDb->healthRows = [
    healthRow('collector', 0, 60, '2026-07-25 17:58:00.000000'),
    healthRow('analyzer', 0, 60),
    healthRow('collector', 11, 300000, '2026-07-22 17:58:00.000000'),
];
$decommissioned = MagnusSentinelIncidentApiV1::getHealth($decommissionedDb);
assertSameValue(
    'HEALTHY',
    $decommissioned['health_status'],
    'decommissioned server history must not control aggregate'
);
assertSameValue(
    ['analyzer:0', 'collector:0'],
    healthComponentKeys($decommissioned),
    'decommissioned server is not exposed as current'
);

$currentStaleDb = new SentinelHealthFakeDb;
$currentStaleDb->healthRows = [
    healthRow('collector', 0, 60, '2026-07-25 17:58:00.000000'),
    healthRow('analyzer', 0, 60),
    healthRow('collector', 5, 300000, '2026-07-22 17:58:00.000000'),
];
$currentStaleDb->serverRows = [['id' => 5, 'name' => 'Worker 1']];
$currentStale = MagnusSentinelIncidentApiV1::getHealth($currentStaleDb);
assertSameValue(
    'STALE',
    $currentStale['health_status'],
    'stale server in current topology must control aggregate'
);
assertSameValue(
    ['analyzer:0', 'collector:0', 'collector:5'],
    healthComponentKeys($currentStale),
    'current stale server remains exposed'
);

echo "MagnusSentinelHealthApiTest OK\n";
