<?php
/** Offline regressions for DID-destination ownership. Uses only in-memory SQLite.
 * Run: php protected/tests/DidDestinationOwnershipTest.php
 */
$root = dirname(__DIR__, 2);
chdir($root);
require $root . '/yii/framework/yii.php';
require $root . '/protected/components/BaseController.php';
require $root . '/protected/components/Model.php';
require $root . '/protected/models/Diddestination.php';

class Controller extends BaseController {}
class MagnusLog { public static function insertLOG($level, $message) {} }
class Did extends CActiveRecord {
    public static function model($className = __CLASS__) { return parent::model($className); }
    public function tableName() { return 'pkg_did'; }
}
class User extends Did {
    public static function model($className = __CLASS__) { return parent::model($className); }
    public function tableName() { return 'pkg_user'; }
}
class Sip extends Did {
    public static function model($className = __CLASS__) { return parent::model($className); }
    public function tableName() { return 'pkg_sip'; }
}
class Ivr extends Sip {
    public static function model($className = __CLASS__) { return parent::model($className); }
    public function tableName() { return 'pkg_ivr'; }
}
class Queue extends Sip {
    public static function model($className = __CLASS__) { return parent::model($className); }
    public function tableName() { return 'pkg_queue'; }
}
require $root . '/protected/controllers/DiddestinationController.php';
class TestDidOwnershipController extends DiddestinationController {
    public function checkActionAccess($values = [], $module = null, $action = null) {}
    public function afterSave($model, $values) {} // Avoid Asterisk, mail and billing side effects.
    public function saveGetNewRecord($namePk, $id, $filter = '') {}
    public function sendError($message, $params = [], $statusCode = null) {
        throw new RuntimeException(Yii::t('zii', $message, $params));
    }
}
$app = Yii::createWebApplication(['basePath' => $root . '/protected', 'components' => [
    'db' => ['class' => 'CDbConnection', 'connectionString' => 'sqlite::memory:'],
]]);
foreach ([
    'CREATE TABLE pkg_did (id INTEGER PRIMARY KEY, id_user INTEGER, reserved INTEGER, connection_charge NUMERIC DEFAULT 0, fixrate NUMERIC DEFAULT 0)',
    'CREATE TABLE pkg_user (id INTEGER PRIMARY KEY, credit NUMERIC, creditlimit NUMERIC)',
    'CREATE TABLE pkg_sip (id INTEGER PRIMARY KEY, id_user INTEGER)',
    'CREATE TABLE pkg_ivr (id INTEGER PRIMARY KEY, id_user INTEGER)',
    'CREATE TABLE pkg_queue (id INTEGER PRIMARY KEY, id_user INTEGER)',
    'CREATE TABLE pkg_did_destination (id INTEGER PRIMARY KEY AUTOINCREMENT, id_user INTEGER, id_did INTEGER, id_sip INTEGER, id_ivr INTEGER, id_queue INTEGER, priority INTEGER, activated INTEGER, voip_call INTEGER, destination TEXT, context TEXT, secondusedreal INTEGER, creationdate TEXT)',
    'INSERT INTO pkg_user VALUES (20,100,0),(30,100,0)',
    'INSERT INTO pkg_did VALUES (201,20,1,0,0),(202,30,1,0,0),(203,NULL,0,1,2),(204,NULL,1,0,0)',
    'INSERT INTO pkg_sip VALUES (21,20),(31,30)',
    'INSERT INTO pkg_ivr VALUES (21,20),(31,30)',
    'INSERT INTO pkg_queue VALUES (21,20),(31,30)',
] as $sql) { $app->db->createCommand($sql)->execute(); }

$base = ['id' => 0, 'id_did' => 201, 'id_sip' => 21, 'priority' => -1, 'activated' => 1, 'destination' => ''];
$cases = [
    ['foreign DID, omitted type', ['id_did' => 202], false],
    ['foreign DID, explicit SIP', ['id_did' => 202, 'voip_call' => 1], false],
    ['foreign DID, null type', ['id_did' => 202, 'voip_call' => null], false],
    ['foreign DID, PSTN', ['id_did' => 202, 'voip_call' => 0], false],
    ['forged beneficiary', ['id_did' => 202, 'id_user' => 30], false],
    ['own DID, omitted type', [], true],
    ['own DID, explicit SIP', ['voip_call' => 1], true],
    ['foreign SIP, omitted type', ['id_sip' => 31], false],
    ['missing SIP', ['id_sip' => 999], false],
    ['own IVR', ['voip_call' => 2, 'id_ivr' => 21], true],
    ['foreign IVR', ['voip_call' => 2, 'id_ivr' => 31], false],
    ['missing IVR', ['voip_call' => 2, 'id_ivr' => 999], false],
    ['own queue', ['voip_call' => 7, 'id_queue' => 21], true],
    ['foreign queue', ['voip_call' => 7, 'id_queue' => 31], false],
    ['missing queue', ['voip_call' => 7, 'id_queue' => 999], false],
    ['nonexistent DID', ['id_did' => 999], false],
    ['array DID', ['id_did' => [201]], false],
    ['purchase available DID', ['id_did' => 203], true],
    ['unassigned reserved DID', ['id_did' => 204], false],
    ['edit own priority', ['id' => 1, 'priority' => 2], true],
    ['partial edit own destination', ['id' => 1], true, false, ['id_did', 'id_sip']],
    ['move own destination to foreign DID', ['id' => 1, 'id_did' => 202], false],
    ['foreign stored DID, partial edit', ['id' => 2], false, false, ['id_did']],
    ['edit foreign destination', ['id' => 3], false],
    ['edit with foreign SIP', ['id' => 1, 'id_sip' => 31], false],
    ['edit with missing SIP', ['id' => 1, 'id_sip' => 999], false],
    ['edit to own IVR', ['id' => 1, 'voip_call' => 2, 'id_ivr' => 21], true],
    ['edit to foreign IVR', ['id' => 1, 'voip_call' => 2, 'id_ivr' => 31], false],
    ['edit to foreign queue', ['id' => 1, 'voip_call' => 7, 'id_queue' => 31], false],
    ['nonexistent destination', ['id' => 999], false],
    ['admin creates destination for another user', ['id_did' => 202, 'id_user' => 30, 'id_sip' => 31], true, true],
    ['admin edits another user destination', ['id' => 3, 'id_did' => 202, 'id_user' => 30, 'id_sip' => 31], true, true],
];
foreach ($cases as $case) {
    foreach (['form', 'json'] as $encoding) {
        [$label, $changes, $allowed] = $case;
        $admin = isset($case[3]) && $case[3];
        $app->db->createCommand('DELETE FROM pkg_did_destination')->execute();
        $app->db->createCommand('INSERT INTO pkg_did_destination (id,id_user,id_did,id_sip,voip_call,priority) VALUES (1,20,201,21,1,0),(2,20,202,21,1,0),(3,30,202,31,1,0)')->execute();
        $app->session['isClient'] = ! $admin;
        $app->session['isAdmin'] = $admin;
        $app->session['isAgent'] = false;
        $app->session['id_user'] = $admin ? 1 : 20;
        $post = array_replace($base, $changes);
        foreach (isset($case[4]) ? $case[4] : [] as $field) { unset($post[$field]); }
        // Exercise both supported request representations through actionSave.
        $_POST = $encoding === 'json' ? ['rows' => json_encode($post)] : $post;
        $controller = new TestDidOwnershipController('diddestination');
        $controller->instanceModel = new Diddestination;
        $controller->abstractModel = Diddestination::model();
        $controller->nameOtherFkRelated = '__related';
        $before = $app->db->createCommand('SELECT * FROM pkg_did_destination ORDER BY id')->queryAll();
        ob_start();
        try {
            $controller->actionSave();
            $response = json_decode(ob_get_contents(), true);
            $success = isset($response['success']) && $response['success'] === true;
        } catch (RuntimeException $error) { $success = false; }
        $output = ob_get_clean();
        $after = $app->db->createCommand('SELECT * FROM pkg_did_destination ORDER BY id')->queryAll();
        if ($success !== $allowed || (! $allowed && $before !== $after)) {
            fwrite(STDERR, "FAIL: $label: $output\n"); exit(1);
        }
        if ($success && (int) $post['id'] === 0) {
            $row = end($after);
            if ((int) $row['id_user'] !== ($admin ? 30 : 20)
                || (int) $row['voip_call'] !== (isset($post['voip_call']) ? (int) $post['voip_call'] : 1)) {
                fwrite(STDERR, "FAIL: saved owner/type for $label\n"); exit(1);
            }
        }
    }
}
echo 'PASS: ' . (count($cases) * 2) . " DID ownership, relation, purchase and admin scenarios through actionSave.\n";
