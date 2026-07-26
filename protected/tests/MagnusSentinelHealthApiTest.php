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
        'server_name' => $idServer ? 'Worker ' . $idServer : null,
        'heartbeat_age_seconds' => $heartbeatAge,
        'ingest_lag_seconds' => 0,
    ];
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

echo "MagnusSentinelHealthApiTest OK\n";
