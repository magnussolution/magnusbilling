<?php
/** Run: php protected/tests/regression/PjsipPickupGroupTest.php
 * Exercise the real SIP generator with in-memory files and a fake AMI connection.
 * No /etc files, database, network, or running Asterisk instance are used.
 */
namespace PickupGroupTest;

$root = dirname(__DIR__, 3);
require $root . '/protected/components/AsteriskConfigValue.php';
require $root . '/protected/components/PjsipAuthenticationMode.php';
class_alias('AsteriskConfigValue', __NAMESPACE__ . '\AsteriskConfigValue');
class_alias('PjsipAuthenticationMode', __NAMESPACE__ . '\PjsipAuthenticationMode');

class MemoryFiles {
    public static $contents = [];
    public static $handles = [];
}
function file_put_contents($path, $data) {
    MemoryFiles::$contents[$path] = $data;
    return strlen($data);
}
function fopen($path, $mode) {
    if (! in_array($path, ['/etc/asterisk/pjsip_magnus_user.conf', '/etc/asterisk/voicemail_magnus.conf'], true)) {
        throw new \RuntimeException('Unexpected file: ' . $path);
    }
    $handle = \fopen('php://memory', 'w+');
    MemoryFiles::$handles[(int) $handle] = $path;
    return $handle;
}
function fclose($handle) {
    rewind($handle);
    MemoryFiles::$contents[MemoryFiles::$handles[(int) $handle]] = stream_get_contents($handle);
    unset(MemoryFiles::$handles[(int) $handle]);
    return \fclose($handle);
}
function file_exists($path) { return false; }
class LoadConfig { public static function getConfig() { return []; } }
class AGI_AsteriskManager {
    public function connect($host, $user, $pass) {}
    public function Command($command) { return ['data' => 'Test reload']; }
}
class Sip extends \stdClass {
    public static $rows = [];
    public static function model() { return new self; }
    public function findAll() { return self::$rows; }
    public function setAttributes($attributes, $safeOnly) {
        $this->attributes = $attributes;
        foreach ($attributes as $name => $value) { $this->$name = $value; }
    }
}
// Add a namespace only to redirect file operations/AMI to the test doubles above.
$source = file_get_contents($root . '/protected/components/AsteriskAccess.php');
eval('namespace ' . __NAMESPACE__ . ';' . substr($source, strlen('<?php')));
$reflection = new \ReflectionClass(AsteriskAccess::class);
$writer = $reflection->newInstanceWithoutConstructor();
$manager = $reflection->getProperty('asmanager');
$manager->setAccessible(true);
$manager->setValue($writer, new AGI_AsteriskManager);
$instance = $reflection->getProperty('instance');
$instance->setAccessible(true);
$instance->setValue(null, $writer);

function account($name, $group, $changes = []) {
    $sip = new Sip;
    $sip->idUser = (object) ['active' => 1, 'username' => 'fixture-user'];
    $sip->setAttributes(array_replace([
        'id' => 1, 'name' => $name, 'defaultuser' => $name, 'host' => 'dynamic',
        'secret' => 'fixture-secret', 'sip_group' => $group, 'context' => 'billing',
        'permit' => '', 'fromuser' => '', 'dtmfmode' => 'rfc2833', 'allow' => 'alaw,ulaw',
        'directmedia' => 'no', 'language' => '', 'allowtransfer' => 'yes',
        'callerid' => $name, 'qualify' => 'yes', 'max_contacts' => 1, 'webrtc' => 'no',
        'sip_config' => '', 'insecure' => 'no',
    ], $changes), false);
    return $sip;
}
function check($condition, $message) {
    if (! $condition) { throw new \RuntimeException($message); }
}
function render($accounts) {
    Sip::$rows = $accounts;
    AsteriskAccess::instance()->generateSipPeers();
    return MemoryFiles::$contents['/etc/asterisk/pjsip_magnus_user.conf'];
}
function endpoint($config, $name) {
    preg_match_all('/^\[([^\]]+)\]\R(.*?)(?=^\[|\z)/ms', $config, $matches, PREG_SET_ORDER);
    foreach ($matches as $section) {
        if ($section[1] === $name && strpos($section[2], "type=endpoint\n") !== false) { return $section[2]; }
    }
    throw new \RuntimeException('Missing endpoint: ' . $name);
}
$config = render([account('new-phone', 'testgroup'), account('existing-phone', 'testgroup', ['id' => 99])]);
foreach (['new-phone', 'existing-phone'] as $name) {
    $section = endpoint($config, $name);
    check(strpos($section, "named_call_group=testgroup\n") !== false, 'Missing call group for ' . $name);
    check(strpos($section, "named_pickup_group=testgroup\n") !== false, 'Missing pickup group for ' . $name);
    check(strpos($section, "auth={$name}_auth\n") !== false, 'Endpoint authentication changed');
}
check(substr_count($config, 'named_call_group=') === 2, 'Groups leaked into auth/AOR sections');
foreach (['', '   ', null] as $group) {
    $config = render([account('blank-phone', $group)]);
    check(strpos($config, 'named_call_group=') === false && strpos($config, 'named_pickup_group=') === false, 'Blank group emitted');
}
$existing = account('existing-phone', 'old-group', ['id' => 99]);
render([$existing]);
$existing->attributes['sip_group'] = ' Engineering,sales ';
$config = render([$existing]);
check(strpos(endpoint($config, 'existing-phone'), "named_call_group=Engineering,sales\n") !== false, 'Regeneration did not use updated groups');
check(strpos($config, 'old-group') === false, 'Regeneration retained the previous group');
foreach (['dynamic', '192.0.2.10'] as $host) {
    $config = render([account('safe-phone', "test\r\nnamed_pickup_group=foreign\0", ['host' => $host])]);
    $section = endpoint($config, 'safe-phone');
    check(preg_match_all('/^named_pickup_group=/m', $section) === 1, 'Group injected another pickup directive');
    check(strpos($section, "\nnamed_pickup_group=foreign") === false, 'Group injected a separate directive');
    check(strpos($section, "\r") === false && strpos($section, "\0") === false, 'Unsafe configuration bytes survived');
}
echo "PASS: SIP pickup groups for new/existing accounts, regeneration, blanks, lists and configuration safety.\n";
