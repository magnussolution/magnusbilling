<?php

require_once dirname(__DIR__)
    . '/components/FailedCallTrunkRuntimeProbe.php';

class FailedCallRuntimeProbeFakeCommand
{
    private $db;
    private $sql;
    private $params = [];

    public function __construct($db, $sql)
    {
        $this->db = $db;
        $this->sql = preg_replace('/\s+/', ' ', trim($sql));
        $this->db->sql[] = $this->sql;
    }

    public function bindValues($params)
    {
        $this->params = $params;
    }

    public function queryRow()
    {
        if (strpos($this->sql, 'FROM pkg_trunk t') !== false) {
            return $this->db->metadata;
        }
        return false;
    }

    public function queryAll()
    {
        if (strpos($this->sql, "ip LIKE '%/%'") !== false) {
            return $this->db->cidrRows;
        }
        if (strpos($this->sql, 'FROM pkg_firewall') !== false) {
            return $this->db->firewallRows;
        }
        return [];
    }
}

class FailedCallRuntimeProbeFakeDb
{
    public $metadata;
    public $firewallRows = [];
    public $cidrRows = [];
    public $sql = [];

    public function createCommand($sql)
    {
        return new FailedCallRuntimeProbeFakeCommand($this, $sql);
    }
}

function runtimeProbeAssert($condition, $message)
{
    if (! $condition) {
        throw new RuntimeException($message);
    }
}

function runtimeProbeMetadata($overrides = [])
{
    return array_merge([
        'id' => 277,
        'trunkcode' => 'sdsdsd',
        'providertech' => 'pjsip',
        'host' => '198.51.100.20',
        'providerip' => '198.51.100.20',
        'configured_status' => 1,
        'server_id' => 7,
        'server_name' => '3',
        'server_type' => 'asterisk',
        'server_host' => '192.0.2.7',
        'server_port' => '5038',
        'server_username' => 'magnus',
        'server_password' => 'secret',
    ], $overrides);
}

$unavailableOutput = [
    'data' => " Endpoint:  sdsdsd  Not in use\n"
        . "     Contact:  sdsdsd/sip:198.51.100.20:5060  Unavail  nan\n",
];
$parsedUnavailable = FailedCallTrunkRuntimeProbe::parsePjsipEndpoint(
    $unavailableOutput
);
runtimeProbeAssert(
    $parsedUnavailable['status'] === 'unavailable',
    'PJSIP unavailable contact'
);
runtimeProbeAssert(
    $parsedUnavailable['contactIps'] === ['198.51.100.20'],
    'PJSIP contact IP'
);

$parsedAvailable = FailedCallTrunkRuntimeProbe::parsePjsipEndpoint([
    'data' => " Endpoint: provider3 Not in use\n"
        . " Contact: provider3/sip:203.0.113.30:5060 Avail 18.432\n",
]);
runtimeProbeAssert(
    $parsedAvailable['status'] === 'available'
        && $parsedAvailable['latencyMs'] === 18.432,
    'PJSIP available contact and RTT'
);

$parsedNoContact = FailedCallTrunkRuntimeProbe::parsePjsipEndpoint(
    " Endpoint: provider3 Not in use\n"
        . " Aor: provider3 0\n"
        . " Contact: <Aor/ContactUri..............................> <Hash....> <Status> <RTT(ms)..>"
);
runtimeProbeAssert(
    $parsedNoContact['status'] === 'no_contact',
    'PJSIP endpoint without contact'
);

$parsedSip = FailedCallTrunkRuntimeProbe::parseSipPeer(
    "  Addr->IP : 203.0.113.40\n  Status : OK (23 ms)\n"
);
runtimeProbeAssert(
    $parsedSip['status'] === 'available'
        && $parsedSip['latencyMs'] === 23.0,
    'chan_sip available peer'
);

$db = new FailedCallRuntimeProbeFakeDb;
$db->metadata = runtimeProbeMetadata();
$db->cidrRows = [[
    'id' => 8001,
    'ip' => '198.51.100.0/24',
    'action' => 0,
    'date' => '2026-07-28 12:00:00',
    'jail' => 'asterisk-iptables',
    'id_server' => 7,
]];
$commands = [];
$probe = new FailedCallTrunkRuntimeProbe(
    $db,
    function ($metadata, $command) use (&$commands, $unavailableOutput) {
        $commands[] = $command;
        return $unavailableOutput;
    },
    function () {
        return '2026-07-28 12:10:00';
    }
);
$result = $probe->probe([['idTrunk' => 277, 'idServer' => 7]]);
$status = $result['7:277'];
runtimeProbeAssert(
    $commands === ['pjsip show endpoint sdsdsd'],
    'only the bounded endpoint command is executed'
);
runtimeProbeAssert(
    $status['status'] === 'unavailable',
    'runtime status'
);
runtimeProbeAssert(
    $status['firewall']['blocked'] === true
        && $status['firewall']['matches'][0]['ip'] === '198.51.100.0/24',
    'CIDR firewall block'
);
$allSql = implode("\n", $db->sql);
runtimeProbeAssert(
    strpos($allSql, 'action IN (0,1)') !== false
        && strpos($allSql, 'id_server=:id_server') !== false,
    'firewall query is scoped to active blocks and server'
);

$unsafeDb = new FailedCallRuntimeProbeFakeDb;
$unsafeDb->metadata = runtimeProbeMetadata([
    'trunkcode' => "provider3\ncore stop now",
]);
$unsafeCommands = [];
$unsafeProbe = new FailedCallTrunkRuntimeProbe(
    $unsafeDb,
    function ($metadata, $command) use (&$unsafeCommands) {
        $unsafeCommands[] = $command;
        return [];
    }
);
$unsafe = $unsafeProbe->probe([['idTrunk' => 277, 'idServer' => 7]]);
runtimeProbeAssert(
    count($unsafeCommands) === 0,
    'unsafe endpoint name must never reach AMI'
);
runtimeProbeAssert(
    $unsafe['7:277']['source'] === 'validation',
    'unsafe endpoint validation result'
);

$limitDb = new FailedCallRuntimeProbeFakeDb;
$limitDb->metadata = runtimeProbeMetadata();
$limitCommands = [];
$limitProbe = new FailedCallTrunkRuntimeProbe(
    $limitDb,
    function ($metadata, $command) use (&$limitCommands) {
        $limitCommands[] = $command;
        return ['data' => 'Endpoint: trunk'];
    }
);
$limited = $limitProbe->probe([
    ['idTrunk' => 1, 'idServer' => 7],
    ['idTrunk' => 2, 'idServer' => 7],
    ['idTrunk' => 3, 'idServer' => 7],
    ['idTrunk' => 4, 'idServer' => 7],
]);
runtimeProbeAssert(
    count($limitCommands) === FailedCallTrunkRuntimeProbe::MAX_TRUNKS
        && $limited['7:4']['status'] === 'runtime_trunk_limit',
    'live AMI checks are bounded'
);

$source = file_get_contents(
    dirname(__DIR__) . '/components/FailedCallTrunkRuntimeProbe.php'
);
runtimeProbeAssert(
    strpos($source, 'shell_exec') === false
        && strpos($source, 'http://') === false
        && strpos($source, 'ssh ') === false,
    'runtime probe must not use shell, HTTP or SSH'
);

echo "FailedCallTrunkRuntimeProbeTest OK\n";
