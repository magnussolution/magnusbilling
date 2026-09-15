<?php

/**
 * Standalone regression test: php protected/tests/unit/PjsipInsecureInviteTest.php
 * Exercises the real generator and validator without a database or AMI connection.
 */
class Util
{
    public static function getColumnsFromModel($model)
    {
        return $model;
    }
}

class InsecureInviteTestDb
{
    public function createCommand($sql)
    {
        return $this;
    }

    public function queryAll()
    {
        return [];
    }
}

class Yii
{
    public static function app()
    {
        return (object) ['db' => new InsecureInviteTestDb()];
    }
}

require_once __DIR__ . '/../../components/AsteriskConfigValue.php';
require_once __DIR__ . '/../../components/AsteriskAccess.php';

function checkInsecureInvite($condition, $message)
{
    if (! $condition) {
        throw new RuntimeException($message);
    }
}

$generator = (new ReflectionClass('AsteriskAccess'))->newInstanceWithoutConstructor();
$fixture = [
    'trunkcode' => 'TEST_PROVIDER', 'name' => 'TEST_PROVIDER',
    'user' => 'TEST_USER', 'secret' => 'test-only-password',
    'host' => '192.0.2.10',
    'register_string' => 'TEST_USER:test-only-password@192.0.2.10',
    'port' => '5060', 'qualify' => 'yes', 'context' => 'billing',
    'allow' => 'alaw,ulaw', 'directmedia' => 'no', 'language' => '',
    'fromuser' => 'TEST_USER', 'fromdomain' => '192.0.2.10',
];

// Label, overrides, head field, expected IP-only identification.
$cases = [
    ['invite', ['insecure' => 'invite'], 'trunkcode', true],
    ['port and invite', ['insecure' => 'port,invite'], 'trunkcode', true],
    ['case and whitespace', ['insecure' => ' PORT, INVITE '], 'trunkcode', true],
    ['reversed options', ['insecure' => 'invite,port'], 'trunkcode', true],
    ['hostname', ['insecure' => 'invite', 'host' => 'carrier.example.com'], 'trunkcode', true],
    ['no outbound registration', ['insecure' => 'invite', 'register_string' => ''], 'trunkcode', true],
    ['port only', ['insecure' => 'port'], 'trunkcode', false],
    ['empty insecure', ['insecure' => ''], 'trunkcode', false],
    ['missing insecure', [], 'trunkcode', false],
    ['substring is not an option', ['insecure' => 'notinvite'], 'trunkcode', false],
    ['dynamic invite', ['insecure' => 'invite', 'host' => 'dynamic'], 'trunkcode', false],
    ['dynamic combined', ['insecure' => 'port,invite', 'host' => ' Dynamic '], 'trunkcode', false],
    ['non-trunk endpoint', ['insecure' => 'invite'], 'name', false],
    ['no credentials', ['insecure' => 'invite', 'secret' => '', 'register_string' => ''], 'trunkcode', false],
];

$failures = [];
foreach ($cases as [$label, $overrides, $headField, $trustProviderIp]) {
    $row = array_merge($fixture, $overrides);
    // Avoid pjsip/iax in the output path: those names trigger a live reload.
    $file = tempnam(sys_get_temp_dir(), 'trunk-auth-test-');
    try {
        checkInsecureInvite($file !== false, 'cannot create temporary file');
        checkInsecureInvite(! preg_match('/pjsip|iax/', $file), 'unsafe temporary directory');
        $generator->writeAsteriskFile([$row], $file, $headField);
        $config = file_get_contents($file);
        $dynamic = strtolower(trim($row['host'])) === 'dynamic';
        $hasCredentials = strlen($row['user']) && strlen($row['secret']);
        $authName = 'auth_reg_' . $row[$headField] . '_' . $row['user'] . '_' . $row['host'];
        $endpointCount = 0;
        $registrationCount = 0;

        foreach (preg_split('/^\[[^\r\n]+\]\r?\n/m', $config) as $section) {
            if (strpos($section, "type = endpoint\n") === 0) {
                $endpointCount++;
                checkInsecureInvite(
                    (bool) preg_match('/^auth = /m', $section) === ($hasCredentials && ! $trustProviderIp),
                    'unexpected inbound authentication'
                );
                checkInsecureInvite(
                    (strpos($section, 'outbound_auth = ' . $authName . "\n") !== false) === (bool) $hasCredentials,
                    'outbound endpoint authentication changed'
                );
                checkInsecureInvite(
                    (bool) preg_match('/^identify_by = ip$/m', $section) === $trustProviderIp,
                    'unexpected endpoint identification method'
                );
            } elseif (strpos($section, "type = registration\n") === 0) {
                $registrationCount++;
                checkInsecureInvite(strpos($section, 'outbound_auth = ' . $authName . "\n") !== false,
                    'outbound registration authentication changed');
            }
        }

        checkInsecureInvite($endpointCount === ($dynamic ? 2 : 1), 'endpoint or dynamic alias missing');
        checkInsecureInvite($registrationCount === ((! $dynamic && strlen($row['register_string'])) ? 1 : 0),
            'outbound registration changed');
        if ($trustProviderIp) {
            checkInsecureInvite(strpos($config, "type = identify\nendpoint = TEST_PROVIDER\nmatch = " . $row['host'] . "\n") !== false,
                'IP-only endpoint must retain its provider match');
        }
        if ($hasCredentials) {
            checkInsecureInvite(strpos($config, '[' . $authName . "]\ntype = auth\nusername = TEST_USER\npassword = test-only-password\n") !== false,
                'outbound credentials changed');
        }
    } catch (Throwable $error) {
        $failures[] = $label . ': ' . $error->getMessage();
    } finally {
        if ($file !== false) {
            unlink($file);
        }
    }
}

if ($failures) {
    fwrite(STDERR, implode("\n", $failures) . "\n");
    exit(1);
}
echo 'PASS: ' . count($cases) . " PJSIP inbound-auth regression cases\n";
