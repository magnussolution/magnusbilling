<?php

require_once dirname(__DIR__) . '/components/AsteriskConfigValue.php';
require_once dirname(__DIR__) . '/components/PjsipAuthenticationMode.php';

function asteriskConfigValueAssert($condition, $message)
{
    if (! $condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

foreach (["endpoint\n[admin]", "endpoint\rcontext=admin", "secret\0value"] as $unsafe) {
    $rejected = false;
    try {
        AsteriskConfigValue::assertSingleLine($unsafe, 'fixture');
    } catch (InvalidArgumentException $e) {
        $rejected = true;
    }
    asteriskConfigValueAssert($rejected, 'CR, LF, and NUL must be rejected');
}

$legitimate = 'client-01_user@example.net:+-.@';
asteriskConfigValueAssert(
    AsteriskConfigValue::assertSingleLine($legitimate, 'fixture') === $legitimate,
    'legitimate single-line values must remain unchanged'
);

$rejected = false;
try {
    AsteriskConfigValue::assertRecord(
        ['trunkcode' => 'carrier-01', 'host' => "gateway.example\n[attacker]"],
        'trunk.1'
    );
} catch (InvalidArgumentException $e) {
    $rejected = true;
}
asteriskConfigValueAssert(
    $rejected,
    'record validation must reject a newline in any generated trunk field'
);

$rejected = false;
try {
    PjsipAuthenticationMode::authSection(
        ['host' => 'dynamic', 'secret' => "safe\n[attacker]", 'insecure' => 'no'],
        'client_auth',
        'client'
    );
} catch (InvalidArgumentException $e) {
    $rejected = true;
}
asteriskConfigValueAssert(
    $rejected,
    'PJSIP auth generation must reject a newline-delimited directive'
);

$rejected = false;
try {
    PjsipAuthenticationMode::authSection(
        ['host' => 'dynamic', 'secret' => 'safe-password', 'insecure' => 'no'],
        "client_auth\n[attacker]",
        'client'
    );
} catch (InvalidArgumentException $e) {
    $rejected = true;
}
asteriskConfigValueAssert(
    $rejected,
    'PJSIP auth generation must reject a newline in a section name'
);

$config = PjsipAuthenticationMode::authSection(
    ['host' => 'dynamic', 'secret' => 'safe-password', 'insecure' => 'no'],
    'client_auth',
    'client'
);
asteriskConfigValueAssert(
    strpos($config, "[client_auth]\n") !== false
        && strpos($config, "password=safe-password\n") !== false,
    'legitimate credential configuration must remain supported'
);

echo "AsteriskConfigValueRegressionTest: OK\n";
