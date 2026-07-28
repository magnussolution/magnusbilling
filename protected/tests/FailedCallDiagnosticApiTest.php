<?php

require_once dirname(__DIR__) . '/components/FailedCallDiagnosticService.php';

class FailedCallDiagnosticFakeCommand
{
    private $db;
    private $sql;
    private $params = [];

    public function __construct($db, $sql)
    {
        $this->db = $db;
        $this->sql = $sql;
        $this->db->sql[] = preg_replace('/\s+/', ' ', trim($sql));
    }

    public function bindValues($params)
    {
        $this->params = $params;
    }

    public function queryRow()
    {
        if (strpos($this->sql, 'FROM pkg_cdr_failed c') !== false) {
            return $this->db->cdr;
        }
        return false;
    }

    public function queryAll()
    {
        if (strpos($this->sql, 'FROM pkg_magnus_sentinel_trunk_event e') !== false) {
            return $this->db->events;
        }
        return [];
    }

    public function queryScalar()
    {
        if (strpos($this->sql, 'information_schema.tables') !== false) {
            $table = isset($this->params[':table'])
                ? $this->params[':table']
                : null;
            if ($table === 'pkg_magnus_sentinel_trunk_event') {
                return $this->db->sentinelAvailable ? 1 : 0;
            }
            if ($table === 'pkg_magnus_sentinel_component_health') {
                return $this->db->healthAvailable ? 1 : 0;
            }
        }
        if (strpos($this->sql, 'MIN(event_time)') !== false) {
            return $this->db->earliestEventAt;
        }
        return false;
    }
}

class FailedCallDiagnosticFakeDb
{
    public $cdr;
    public $events = [];
    public $sentinelAvailable = true;
    public $healthAvailable = true;
    public $earliestEventAt = '2026-07-23 12:00:00';
    public $sql = [];

    public function createCommand($sql)
    {
        return new FailedCallDiagnosticFakeCommand($this, $sql);
    }
}

function failedDiagnosticAssert($condition, $message)
{
    if (! $condition) {
        throw new RuntimeException($message);
    }
}

function failedDiagnosticCdr($overrides = [])
{
    return array_merge([
        'id' => 123,
        'uniqueid' => '1785188714.1274726',
        'starttime' => '2026-07-27 18:45:14',
        'src' => '1001',
        'callerid' => '5511999999999',
        'calledstation' => '5511888888888',
        'terminatecauseid' => 2,
        'hangupcause' => 486,
        'id_user' => 10,
        'id_plan' => 20,
        'id_prefix' => 30,
        'id_trunk' => 255,
        'id_server' => 5,
        'username' => 'client',
        'plan_name' => 'Plan',
        'prefix_name' => 'Brazil',
        'trunk_name' => 'Trunk A',
        'server_name' => 'Server 1',
    ], $overrides);
}

function failedDiagnosticEvent($code, $reason, $overrides = [])
{
    return array_merge([
        'id' => 5000001,
        'event_time' => '2026-07-27 18:45:20',
        'id_trunk' => 255,
        'id_server' => 5,
        'response_code' => $code,
        'response_reason' => $reason,
        'trunk_name' => 'Trunk A',
        'server_name' => 'Server 1',
    ], $overrides);
}

function failedDiagnosticService($db, $status = 'HEALTHY')
{
    return new FailedCallDiagnosticService($db, function () use ($status) {
        return [
            'status' => $status,
            'checkedAt' => '2026-07-27 22:30:00',
            'reasons' => $status === 'HEALTHY' ? [] : ['test_state'],
        ];
    });
}

function assertClassification($code, $reason, $expected)
{
    $classification = FailedCallDiagnosticService::classify($code, $reason);
    failedDiagnosticAssert(
        $classification['key'] === $expected,
        $code . ' expected ' . $expected . ', got ' . $classification['key']
    );
}

assertClassification(486, 'Busy Here', 'busy');
assertClassification(403, 'Unauthorized IP', 'authentication');
assertClassification(403, 'Forbidden', 'rejected');
assertClassification(404, 'Not Found', 'number_not_found');
assertClassification(484, 'Invalid number format', 'invalid_format');
assertClassification(408, 'Request Timeout', 'timeout');
assertClassification(488, 'Not Acceptable Here', 'codec_or_media');
assertClassification(500, 'Server Internal Error', 'provider_server_error');
assertClassification(503, 'Service Unavailable', 'service_unavailable');
assertClassification(504, 'Gateway Timeout', 'timeout');
assertClassification(617, 'Unknown', 'internal_unknown');
assertClassification(701, 'Unexpected', 'unknown');

$singleDb = new FailedCallDiagnosticFakeDb;
$singleDb->cdr = failedDiagnosticCdr();
$singleDb->events = [failedDiagnosticEvent(486, 'Busy Here')];
$single = failedDiagnosticService($singleDb)->diagnose(123);
failedDiagnosticAssert($single['status'] === 'confirmed', 'single event status');
failedDiagnosticAssert(count($single['attempts']) === 1, 'single event count');
failedDiagnosticAssert(
    $single['lastObservedResult']['classificationKey'] === 'busy',
    'single event classification'
);

$multipleDb = new FailedCallDiagnosticFakeDb;
$multipleDb->cdr = failedDiagnosticCdr(['id_trunk' => 276]);
$multipleDb->events = [
    failedDiagnosticEvent(503, 'Service Unavailable'),
    failedDiagnosticEvent(486, 'Busy Here', [
        'id' => 5000002,
        'event_time' => '2026-07-27 18:45:21',
        'id_trunk' => 276,
        'trunk_name' => 'Trunk B',
    ]),
];
$multiple = failedDiagnosticService($multipleDb)->diagnose(123);
failedDiagnosticAssert(count($multiple['attempts']) === 2, 'multiple attempts');
failedDiagnosticAssert(
    $multiple['attempts'][1]['trunk']['id'] === 276,
    'multiple trunks'
);
failedDiagnosticAssert(
    $multiple['lastObservedResult']['classificationKey'] === 'busy',
    'ordered last result'
);

$missingDb = new FailedCallDiagnosticFakeDb;
$missingDb->cdr = false;
failedDiagnosticAssert(
    failedDiagnosticService($missingDb)->diagnose(999) === null,
    'missing CDR'
);

$noEventDb = new FailedCallDiagnosticFakeDb;
$noEventDb->cdr = failedDiagnosticCdr();
$noEvent = failedDiagnosticService($noEventDb)->diagnose(123);
failedDiagnosticAssert($noEvent['status'] === 'inconclusive', 'missing event');
failedDiagnosticAssert(
    strpos($noEvent['summary'], 'not enough evidence') !== false,
    'missing event wording'
);
failedDiagnosticAssert(
    stripos(json_encode($noEvent), 'trunk was not') === false,
    'must not claim trunk was not called'
);

$expiredDb = new FailedCallDiagnosticFakeDb;
$expiredDb->cdr = failedDiagnosticCdr([
    'starttime' => '2026-07-20 10:00:00',
]);
$expired = failedDiagnosticService($expiredDb)->diagnose(123);
failedDiagnosticAssert(
    $expired['evidence']['retention']['possiblyExpired'] === true,
    'expired evidence'
);

$absentDb = new FailedCallDiagnosticFakeDb;
$absentDb->cdr = failedDiagnosticCdr();
$absentDb->sentinelAvailable = false;
$absent = failedDiagnosticService($absentDb)->diagnose(123);
failedDiagnosticAssert(
    $absent['evidence']['sentinelAvailable'] === false,
    'Sentinel not installed'
);

$staleDb = new FailedCallDiagnosticFakeDb;
$staleDb->cdr = failedDiagnosticCdr();
$staleDb->events = [failedDiagnosticEvent(486, 'Busy Here')];
$stale = failedDiagnosticService($staleDb, 'STALE')->diagnose(123);
failedDiagnosticAssert($stale['status'] === 'partial', 'stale pipeline');

$limitDb = new FailedCallDiagnosticFakeDb;
$limitDb->cdr = failedDiagnosticCdr();
for ($index = 0; $index < 51; $index++) {
    $limitDb->events[] = failedDiagnosticEvent(503, 'Service Unavailable', [
        'id' => 5000000 + $index,
        'event_time' => '2026-07-27 18:45:' . str_pad(
            (string) ($index % 60),
            2,
            '0',
            STR_PAD_LEFT
        ),
    ]);
}
$limited = failedDiagnosticService($limitDb)->diagnose(123);
failedDiagnosticAssert(count($limited['attempts']) === 50, 'event limit');
failedDiagnosticAssert($limited['evidence']['truncated'] === true, 'truncated');
failedDiagnosticAssert($limited['status'] === 'partial', 'truncated status');
$allSql = implode("\n", $limitDb->sql);
failedDiagnosticAssert(
    strpos($allSql, 'FORCE INDEX (ix_uniqueid)') !== false,
    'indexed correlation'
);
failedDiagnosticAssert(
    strpos($allSql, 'ORDER BY e.event_time ASC,e.id ASC LIMIT 51') !== false,
    'bounded deterministic order'
);

$malicious = '<img src=x onerror=alert(1)>';
$maliciousDb = new FailedCallDiagnosticFakeDb;
$maliciousDb->cdr = failedDiagnosticCdr();
$maliciousDb->events = [failedDiagnosticEvent(403, $malicious)];
$maliciousResult = failedDiagnosticService($maliciousDb)->diagnose(123);
failedDiagnosticAssert(
    $maliciousResult['attempts'][0]['raw']['reason'] === $malicious,
    'raw malicious reason must be preserved'
);
$encoded = htmlspecialchars(
    $maliciousResult['attempts'][0]['raw']['reason'],
    ENT_QUOTES,
    'UTF-8'
);
failedDiagnosticAssert(strpos($encoded, '<img') === false, 'escaped rendering');

$controllerSource = file_get_contents(
    dirname(__DIR__) . '/controllers/CallDiagnosticController.php'
);
failedDiagnosticAssert(
    strpos($controllerSource, "empty(Yii::app()->session['isAdmin'])") !== false,
    'admin-only controller'
);
failedDiagnosticAssert(
    strpos($controllerSource, "\$keys !== ['cdrFailedId']") !== false,
    'strict endpoint input'
);

echo "FailedCallDiagnosticApiTest OK\n";
