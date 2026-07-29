<?php

require_once dirname(__DIR__) . '/components/PjsipAuthenticationMode.php';
require_once dirname(__DIR__) . '/components/CallDiagnosticService.php';

function callDiagnosticIntegrationAssert($condition, $message)
{
    if (! $condition) {
        throw new RuntimeException($message);
    }
}

$account = isset($argv[1]) ? $argv[1] : '11642';
$destination = isset($argv[2]) ? $argv[2] : '551140040001';
$callerId = isset($argv[3]) ? $argv[3] : $account;
$config = parse_ini_file('/etc/asterisk/res_config_mysql.conf');
$pdo = new PDO(
    'mysql:host=' . $config['dbhost'] . ';dbname=' . $config['dbname'] . ';charset=utf8',
    $config['dbuser'],
    $config['dbpass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$userStatement = $pdo->prepare(
    'SELECT u.id, u.credit FROM pkg_user u WHERE u.username = :username LIMIT 1'
);
$userStatement->execute([':username' => $account]);
$user = $userStatement->fetch(PDO::FETCH_ASSOC);
callDiagnosticIntegrationAssert($user !== false, 'integration SIP user was not found');

$tableCount = function ($table) use ($pdo) {
    $exists = $pdo->query(
        "SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = " . $pdo->quote($table)
    )->fetchColumn();
    return (int) $exists === 1
        ? (int) $pdo->query('SELECT COUNT(*) FROM `' . $table . '`')->fetchColumn()
        : null;
};

$sideEffectsBefore = [
    'pkg_cdr' => $tableCount('pkg_cdr'),
    'pkg_cdr_failed' => $tableCount('pkg_cdr_failed'),
    'pkg_queue_status' => $tableCount('pkg_queue_status'),
    'credit' => (string) $user['credit'],
];

$suffix = getmypid();
$fixtures = [
    'manual' => [
        'name' => 'diag-manual-' . $suffix,
        'host' => 'dynamic',
        'secret' => 'manual-password',
        'insecure' => 'no',
        'expectsAuth' => true,
    ],
    'api' => [
        'name' => 'diag-api-' . $suffix,
        'host' => '198.51.100.10',
        'secret' => '',
        'insecure' => 'no',
        'expectsAuth' => false,
    ],
    'mb7' => [
        'name' => 'diag-mb7-' . $suffix,
        'host' => '198.51.100.20',
        'secret' => 'legacy-password',
        'insecure' => 'port,invite',
        'expectsAuth' => false,
    ],
];

$pdo->beginTransaction();
try {
    $insert = $pdo->prepare(
        'INSERT INTO pkg_sip
         (id_user,name,host,secret,insecure,defaultuser,context,callerid,forward)
         VALUES
         (:id_user,:name,:host,:secret,:insecure,:defaultuser,"billing",:callerid,"")'
    );
    foreach ($fixtures as $source => $fixture) {
        $insert->execute([
            ':id_user' => $user['id'],
            ':name' => $fixture['name'],
            ':host' => $fixture['host'],
            ':secret' => $fixture['secret'],
            ':insecure' => $fixture['insecure'],
            ':defaultuser' => $fixture['name'],
            ':callerid' => $callerId,
        ]);
        $row = $pdo->query(
            'SELECT host,secret,insecure FROM pkg_sip WHERE id = ' . (int) $pdo->lastInsertId()
        )->fetch(PDO::FETCH_ASSOC);
        $requiresAuth = PjsipAuthenticationMode::requiresInboundAuth($row);
        callDiagnosticIntegrationAssert(
            $requiresAuth === $fixture['expectsAuth'],
            $source . ' fixture generated an unexpected authentication mode'
        );
        $fragment = PjsipAuthenticationMode::authSection(
            $row,
            $fixture['name'] . '_auth',
            $fixture['name']
        ) . PjsipAuthenticationMode::endpointAuthLine(
            $row,
            $fixture['name'] . '_auth'
        );
        callDiagnosticIntegrationAssert(
            $fixture['expectsAuth']
                ? strpos($fragment, 'auth=') !== false
                : strpos($fragment, 'auth=') === false,
            $source . ' fixture generated an unexpected PJSIP auth association'
        );
        callDiagnosticIntegrationAssert(
            $fixture['expectsAuth']
                ? PjsipAuthenticationMode::endpointIdentifyBy($row) !== 'ip'
                : PjsipAuthenticationMode::endpointIdentifyBy($row) === 'ip',
            $source . ' fixture generated an unexpected identify_by mode'
        );
    }
} finally {
    $pdo->rollBack();
}

$command = [
    PHP_BINARY,
    dirname(__DIR__, 2) . '/resources/asterisk/mbilling.php',
    'debug',
    $destination,
    $account,
    $callerId,
    $account,
];
$descriptors = [
    0 => ['pipe', 'r'],
    1 => ['pipe', 'w'],
    2 => ['pipe', 'w'],
];
$process = proc_open($command, $descriptors, $pipes, dirname(__DIR__, 2));
callDiagnosticIntegrationAssert(is_resource($process), 'unable to start AGI integration process');
fclose($pipes[0]);
$stdout = stream_get_contents($pipes[1]);
$stderr = stream_get_contents($pipes[2]);
fclose($pipes[1]);
fclose($pipes[2]);
$exitCode = proc_close($process);

$parsed = CallDiagnosticService::parseAgiResultOutput($stdout, $stderr);
callDiagnosticIntegrationAssert($exitCode === 0, 'AGI integration process returned a non-zero exit code');
callDiagnosticIntegrationAssert(
    substr_count($stdout, 'MBILLING_RESULT ') === 1,
    'AGI must emit exactly one result marker'
);
callDiagnosticIntegrationAssert(is_array($parsed['result']), 'AGI result JSON is invalid');
callDiagnosticIntegrationAssert(
    isset($parsed['result']['context']['resultStage']),
    'AGI result does not identify its construction stage'
);
callDiagnosticIntegrationAssert(
    ! $parsed['additionalOutputAfterMarker'],
    'AGI emitted additional stdout after the result'
);

$userStatement->execute([':username' => $account]);
$userAfter = $userStatement->fetch(PDO::FETCH_ASSOC);
$sideEffectsAfter = [
    'pkg_cdr' => $tableCount('pkg_cdr'),
    'pkg_cdr_failed' => $tableCount('pkg_cdr_failed'),
    'pkg_queue_status' => $tableCount('pkg_queue_status'),
    'credit' => (string) $userAfter['credit'],
];
callDiagnosticIntegrationAssert(
    $sideEffectsBefore === $sideEffectsAfter,
    'diagnostic dry-run changed operational database state'
);

echo json_encode([
    'status' => 'OK',
    'account' => $account,
    'destination' => $destination,
    'resultStatus' => $parsed['result']['status'],
    'resultStage' => $parsed['result']['context']['resultStage'],
    'resultBytes' => $parsed['rawPayloadBytes'],
    'fixtures' => array_keys($fixtures),
    'sideEffectsBefore' => $sideEffectsBefore,
    'sideEffectsAfter' => $sideEffectsAfter,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
