<?php

require_once dirname(__DIR__) . '/components/PjsipAuthenticationMode.php';
require_once dirname(__DIR__) . '/components/CallDiagnosticService.php';
require_once dirname(__DIR__, 2) . '/resources/asterisk/AGI.Class.php';

function callDiagnosticRegressionAssert($condition, $message)
{
    if (! $condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$manualPassword = [
    'host' => 'dynamic',
    'secret' => 'manual-password',
    'insecure' => 'no',
];
$apiIpOnly = [
    'host' => '198.51.100.10',
    'secret' => '',
    'insecure' => 'no',
];
$migratedIpOnly = [
    'host' => '198.51.100.20',
    'secret' => 'legacy-password-still-stored',
    'insecure' => 'port,invite',
];
$fixedIpWithCredentials = [
    'host' => '198.51.100.30',
    'secret' => 'required-password',
    'insecure' => 'no',
];

callDiagnosticRegressionAssert(
    PjsipAuthenticationMode::requiresInboundAuth($manualPassword),
    'manually-created dynamic account must retain username/password auth'
);
callDiagnosticRegressionAssert(
    ! PjsipAuthenticationMode::requiresInboundAuth($apiIpOnly),
    'API-created fixed-IP account without a password must be IP-only'
);
callDiagnosticRegressionAssert(
    ! PjsipAuthenticationMode::requiresInboundAuth($migratedIpOnly),
    'MB7 migrated port,invite account must be IP-only'
);
callDiagnosticRegressionAssert(
    PjsipAuthenticationMode::requiresInboundAuth($fixedIpWithCredentials),
    'fixed-IP account explicitly requiring credentials must retain auth'
);

foreach ([$apiIpOnly, $migratedIpOnly] as $ipOnly) {
    $generated = PjsipAuthenticationMode::authSection(
        $ipOnly,
        'fixture_auth',
        'fixture'
    ) . PjsipAuthenticationMode::endpointAuthLine($ipOnly, 'fixture_auth');
    callDiagnosticRegressionAssert(
        strpos($generated, 'type=auth') === false && strpos($generated, 'auth=') === false,
        'IP-only generated configuration must contain neither auth section nor auth='
    );
    callDiagnosticRegressionAssert(
        PjsipAuthenticationMode::endpointIdentifyBy($ipOnly) === 'ip',
        'IP-only endpoint must be identified exclusively by identify/match'
    );
}

$credentialConfig = PjsipAuthenticationMode::authSection(
    $manualPassword,
    'fixture_auth',
    'fixture'
) . PjsipAuthenticationMode::endpointAuthLine($manualPassword, 'fixture_auth');
callDiagnosticRegressionAssert(
    strpos($credentialConfig, 'type=auth') !== false
        && strpos($credentialConfig, 'auth=fixture_auth') !== false,
    'username/password generated configuration must retain auth section and auth='
);

$invalidUtf8 = "client-" . chr(0xC3) . chr(0x28);
$encoded = AGI::encodeDebugResult([
    'success' => true,
    'status' => 'ready_to_dial',
    'context' => ['resultStage' => 'regression.invalidUtf8'],
    'messages' => [['level' => 3, 'message' => $invalidUtf8]],
    'events' => [],
]);
$decoded = json_decode($encoded, true);
callDiagnosticRegressionAssert(
    is_array($decoded) && json_last_error() === JSON_ERROR_NONE,
    'invalid UTF-8 must still produce a valid JSON result'
);

$parsed = CallDiagnosticService::parseAgiResultOutput(
    "PHP Warning: harmless pre-marker warning\nMBILLING_RESULT {$encoded}\n"
        . "unexpected text after result\n",
    ''
);
callDiagnosticRegressionAssert(is_array($parsed['result']), 'complete result must decode');
callDiagnosticRegressionAssert(
    $parsed['additionalOutputAfterMarker'],
    'additional stdout after the result must be detected'
);
callDiagnosticRegressionAssert(
    $parsed['warningOrErrorOutputDetected'],
    'warnings outside the payload must be detected'
);
callDiagnosticRegressionAssert(
    ! $parsed['invalidUtf8'],
    'serialized result must contain valid UTF-8'
);

$broken = CallDiagnosticService::parseAgiResultOutput(
    "MBILLING_RESULT {\"status\":\"ready" . chr(0xC3) . "\"}\n",
    "PHP Warning: fixture\n"
);
callDiagnosticRegressionAssert(
    $broken['result'] === null
        && $broken['jsonError'] !== null
        && $broken['invalidUtf8']
        && $broken['rawPayloadBytes'] > 0,
    'malformed result evidence must include JSON error, invalid bytes, and size'
);

callDiagnosticRegressionAssert(
    PjsipAuthenticationMode::normalizedInsecure(
        $apiIpOnly['host'],
        $apiIpOnly['secret'],
        $apiIpOnly['insecure']
    ) === 'port,invite',
    'fixed-IP records without a password must be normalized on save'
);

$service = new CallDiagnosticService(null, true, 1);
$safeOutputMethod = new ReflectionMethod(
    CallDiagnosticService::class,
    'safeDiagnosticOutput'
);
$safeOutputMethod->setAccessible(true);
$safeOutput = $safeOutputMethod->invoke(
    $service,
    "secret=do-not-log token:\"also-private\" invalid=" . chr(0xFF)
);
callDiagnosticRegressionAssert(
    strpos($safeOutput, 'do-not-log') === false
        && strpos($safeOutput, 'also-private') === false
        && strpos($safeOutput, '[REDACTED]') !== false
        && strpos($safeOutput, '\\xFF') !== false,
    'diagnostic evidence must redact credentials and escape invalid bytes'
);

echo "CallDiagnosticRegressionTest: OK\n";
