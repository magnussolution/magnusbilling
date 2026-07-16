<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
/**
 * Acoes do modulo "Call".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/09/2012
 */

class Call0800WebController extends Controller
{

    public function actionIndex()
    {

        Yii::app()->setLanguage($this->config['global']['base_language']);

        if ( ! isset($_REQUEST['number'])) {

            $this->render('index', [
                'send' => false,
            ]);

        } else {

            $destination = isset($_REQUEST['number']) ? $this->getCallFileValue($_REQUEST['number']) : '';
            $user        = isset($_GET['user']) ? $this->getCallFileValue($_GET['user']) : '';

            $model = Sip::model()->find("name = :user", [':user' => $user]);

            if ( ! isset($model->id)) {

                $model = Iax::model()->find("name = :user", [':user' => $user]);
                if ( ! isset($model->id)) {
                    $error_msg = Yii::t('zii', 'Error : User no Found!');
                    echo $error_msg;
                    exit;
                } else {
                    $type = 'IAX2';
                }
            } else {
                $type = 'SIP';
            }

            $dialstr = $type . '/' . $model->name;

            // gerar os arquivos .call
            $call = "Channel: " . $dialstr . "\n";
            if (isset($_GET['callerid'])) {
                $call .= "Callerid: " . $this->getCallFileValue($_GET['callerid']) . "\n";
            } else {
                $call .= "Callerid: " . $this->getCallFileValue($model->callerid) . "\n";
            }

            $call .= "Context: billing\n";
            $call .= "Extension: " . $user . "\n";
            $call .= "Priority: 1\n";
            $call .= "Set:IDUSER=" . $model->id_user . "\n";
            $call .= "Set:SECCALL=" . $destination . "\n";

            if (isset($_GET['max_duration'])) {
                $call .= "Set:TIMEOUT(absolute)=" . $this->getCallFileValue($_GET['max_duration']) . "\n";
            }

            AsteriskAccess::generateCallFile($call);

            $this->render('index', [
                'send' => true,
            ]);

        }

    }

    private function getCallFileValue($value)
    {
        if ( ! is_scalar($value)) {
            throw new CHttpException(400, Yii::t('zii', 'Invalid input'));
        }

        $value = (string) $value;

        if (preg_match('/[\r\n\x00-\x1F\x7F]/', $value)) {
            throw new CHttpException(400, Yii::t('zii', 'Invalid input'));
        }

        return $value;
    }

    public function actionCallback()
    {

        if (isset($_GET['l'])) {

            $data = explode('|', $_GET['l']);

            Yii::log(print_r($data, true), 'error');

            if ( ! isset($data[2])) {
                echo 'Your number is required';

            } else if (strlen($data[2]) < 4) {
                echo 'The minimum length for your number is 4';

            } else if ( ! isset($data[3])) {
                echo 'Destination is required';

            } else if (strlen($data[3]) < 4) {
                echo 'The minimum length for destination is 4';

            } else {

                $user = $data[0];
                $pass = $data[1];

                $modelSip = AccessManager::checkAccess($user, $pass);

                if ( ! isset($modelSip->id)) {
                    echo 'User or password is invalid';
                    exit;
                }

                if ($modelSip->id_user > 1) {
                    $modelUserAgent = User::model()->findByPk((int) $modelSip->id_user);

                    $modelUserAgent->credit = $modelUserAgent->typepaid == 1
                    ? $modelUserAgent->credit + $modelUserAgent->creditlimit
                    : $modelUserAgent->credit;

                    //VERIFICA SE O AGENT TEM CREDITO
                    if ($modelUserAgent->credit <= 0) {
                        echo Yii::t('zii', 'You don t have enough credit to call');
                        exit;
                    }
                }

                $modelSip->idUser->credit = $modelSip->idUser->typepaid == 1
                ? $modelSip->idUser->credit + $modelSip->idUser->creditlimit
                : $modelSip->idUser->credit;

                if ($modelSip->idUser->credit <= 0) {
                    echo 'You don t have enough credit to call';
                    exit;
                }

                $yournumber  = $data[2];
                $destination = $data[3];

                if (preg_match("/->/", $destination)) {
                    $destination = explode("->", $destination);
                    $destination = preg_replace("/-|\(|\)| /", "", $destination[1]);
                    Yii::log(print_r($destination, true), 'error');
                } elseif (preg_match("/ - /", $destination)) {
                    $destination = explode(" - ", $destination);
                    $destination = preg_replace("/-|\(|\)| /", "", $destination[1]);
                    Yii::log(print_r($destination, true), 'error');
                }

                $yournumber  = Util::number_translation($modelSip->idUser->prefix_local, $yournumber);
                $destination = Util::number_translation($modelSip->idUser->prefix_local, $destination);

                /*protabilidade*/

                $SearchTariff = new SearchTariff();
                $callTrunk    = $SearchTariff->find($yournumber, $modelSip->idUser->id_plan, $modelSip->idUser->id);

                $result = Plan::model()->searchTariff($modelSip->idUser->id_plan, $yournumber);
                if ( ! is_array($result) || count($result) == 0) {
                    return 0;
                }

                $prefixclause = $result[2];
                $result       = $result[1];

                //Select custom rate to user
                $modelUserRate = UserRate::model()->find('id_prefix = :key AND id_user = :key1', [
                    ':key'  => $result[0]['id_prefix'],
                    ':key1' => $modelSip->idUser->id,
                ]);

                //change custom rate to user
                if (count($modelUserRate)) {
                    $result[0]['rateinitial']  = $modelUserRate->rateinitial;
                    $result[0]['initblock']    = $modelUserRate->initblock;
                    $result[0]['billingblock'] = $modelUserRate->billingblock;
                }

                if ( ! is_array($callTrunk) || ! count($callTrunk)) {
                    echo Yii::t('zii', 'Prefix not found to you number');
                    exit;
                }

                $destination = Portabilidade::getDestination($destination, $modelSip->idUser->id_plan);

                $callTrunkDestination = $SearchTariff->find($destination, $modelSip->idUser->id_plan, $modelSip->idUser->id);

                if ( ! is_array($callTrunkDestination) || count($callTrunkDestination) == 0) {
                    echo $sql;
                    echo Yii::t('zii', 'Prefix not found to destination');

                    exit;
                }

                if ($callTrunk[0]['trunk_group_type'] == 1) {
                    $sql = "SELECT * FROM pkg_trunk_group_trunk WHERE id_trunk_group = " . $callTrunk[0]['id_trunk_group'] . " ORDER BY id ASC";
                } else if ($callTrunk[0]['trunk_group_type'] == 2) {
                    $sql = "SELECT * FROM pkg_trunk_group_trunk WHERE id_trunk_group = " . $callTrunk[0]['id_trunk_group'] . " ORDER BY RAND() ";

                } else if ($callTrunk[0]['trunk_group_type'] == 3) {
                    $sql = "SELECT *, (SELECT buyrate FROM pkg_rate_provider WHERE id_provider = tr.id_provider AND id_prefix = " . $callTrunk[0]['id_prefix'] . " LIMIT 1) AS buyrate  FROM pkg_trunk_group_trunk t  JOIN pkg_trunk tr ON t.id_trunk = tr.id WHERE id_trunk_group = " . $callTrunk[0]['id_trunk_group'] . " ORDER BY buyrate IS NULL , buyrate ";
                }
                $modelTrunkGroupTrunk = TrunkGroupTrunk::model()->findBySql($sql);

                foreach ($modelTrunkGroupTrunk as $key => $trunk) {
                    $modelTrunk = Trunk::model()->findByPk((int) $modelTrunkGroupTrunk->id_trunk);
                    if ($modelTrunk->status == 0) {
                        continue;
                    }
                    $idTrunk      = $modelTrunk->id;
                    $ipaddress    = $modelTrunk->trunkcode;
                    $prefix       = $modelTrunk->trunkprefix;
                    $removeprefix = $modelTrunk->removeprefix;
                    $providertech = $modelTrunk->providertech;
                    break;
                }

                $sql = "SELECT * FROM pkg_rate_provider t  JOIN pkg_prefix p ON t.id_prefix = p.id WHERE " .
                "id_provider = " . $modelTrunk->id_provider . " AND " . $prefixclause .
                    "ORDER BY LENGTH( prefix ) DESC LIMIT 1";
                $modelRateProvider = Yii::app()->db->createCommand($sql)->queryAll();

                if (substr("$yournumber", 0, 4) == 1111) {
                    $yournumber = str_replace(substr($yournumber, 0, 7), "", $yournumber);
                }

                if (substr("$destination", 0, 4) == 1111) {
                    $destination = str_replace(substr($destination, 0, 7), "", $destination);
                }

                $yournumber = $yournumber;

                if (strncmp($yournumber, $removeprefix, strlen($removeprefix)) == 0 || substr(strtoupper($removeprefix), 0, 1) == 'X') {
                    $yournumber = substr($yournumber, strlen($removeprefix));
                }

                $dialstr = "$providertech/$ipaddress/$prefix$yournumber";

                // gerar os arquivos .call
                $call = "Channel: " . $dialstr . "\n";
                if (isset($data[4])) {
                    $call .= "Callerid: " . $data[4] . "\n";
                } else {
                    $call .= "Callerid: " . $user . "\n";
                }

                $call .= "Context: billing\n";
                $call .= "Extension: " . $yournumber . "\n";
                $call .= "Priority: 1\n";
                $call .= "Set:CALLED=" . $yournumber . "\n";
                $call .= "Set:TARRIFID=" . $callTrunk[0]['id_rate'] . "\n";
                $call .= "Set:SELLCOST=" . $callTrunk[0]['rateinitial'] . "\n";
                $call .= "Set:BUYCOST=" . $modelRateProvider[0]['buyrate'] . "\n";
                $call .= "Set:CIDCALLBACK=1\n";
                $call .= "Set:IDUSER=" . $modelSip->idUser->id . "\n";
                $call .= "Set:IDPREFIX=" . $callTrunk[0]['id_prefix'] . "\n";
                $call .= "Set:IDTRUNK=" . $idTrunk . "\n";
                $call .= "Set:IDPLAN=" . $modelSip->idUser->id_plan . "\n";

                $call .= "Set:SECCALL=" . $destination . "\n";

                if (isset($data[5])) {
                    $call .= "Set:TIMEOUT(absolute)=" . $data[5] . "\n";
                }

                AsteriskAccess::generateCallFile($call, 5);
                echo Yii::t('zii', 'CallBack Success');
            }

        }
    }

}

/*
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript">
function submitForm() {
var number = document.getElementById('number').value;
var user = document.getElementById('user').value;
if (number == '') {
alert('Numero invalido');
exit;
}
$.ajax({
type: "GET",
url: "http://ip/mbilling/index.php/callFree?user="+user+"&number="+number,
success: function(returnValue){
alert("Su telefono va llamar");
},
error: function(request,error) {
alert("error");
}
});
}
</script>
<form method='GET' >
<input name="number" type="text" class="input" id="number" size="10" style="font-family: 'Handlee', cursive" />
<input type="hidden" name="user" id='user' value="prueba">
<input name="button" type="button" value="Ll&aacute;mame" onclick="return submitForm();">
</form>

 */
