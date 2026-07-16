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

            $destination = isset($_REQUEST['number']) ? $this->getDialableValue($_REQUEST['number']) : '';
            $user        = isset($_GET['user']) ? $this->getIdentifierValue($_GET['user']) : '';

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

            $callerid = $this->getCallFileValue($model->callerid);
            if (isset($_GET['callerid'])) {
                $callerid = $this->getCallerIdValue($_GET['callerid']);
            }

            $variables = [
                'IDUSER' => $model->id_user,
                'SECCALL' => $destination,
            ];
            if (isset($_GET['max_duration'])) {
                $variables['TIMEOUT(absolute)'] = $this->getCallFileDuration($_GET['max_duration']);
            }

            $call = AsteriskAccess::buildCallFile([
                'Channel'   => $dialstr,
                'Callerid'  => $callerid,
                'Context'   => 'billing',
                'Extension' => $user,
                'Priority'  => 1,
            ], $variables);
            AsteriskAccess::generateCallFile($call);

            $this->render('index', [
                'send' => true,
            ]);

        }

    }

    private function getCallFileValue($value)
    {
        try {
            return AsteriskAccess::callFileValue($value);
        } catch (InvalidArgumentException $exception) {
            throw new CHttpException(400, Yii::t('zii', 'Invalid input'));
        }
    }

    private function getCallFileDuration($value)
    {
        try {
            return AsteriskAccess::callFileInteger($value);
        } catch (InvalidArgumentException $exception) {
            throw new CHttpException(400, Yii::t('zii', 'Invalid input'));
        }
    }

    private function getDialableValue($value)
    {
        $value = $this->getCallFileValue($value);
        $value = preg_replace('/[().\- ]/', '', $value);
        if ( ! preg_match('/\A[0-9*#+]{1,80}\z/', $value)) {
            throw new CHttpException(400, Yii::t('zii', 'Invalid input'));
        }

        return $value;
    }

    private function getIdentifierValue($value)
    {
        $value = $this->getCallFileValue($value);
        if ( ! preg_match('/\A[A-Za-z0-9_.@+\-]{1,80}\z/', $value)) {
            throw new CHttpException(400, Yii::t('zii', 'Invalid input'));
        }

        return $value;
    }

    private function getCallerIdValue($value)
    {
        $value = $this->getCallFileValue($value);
        if ( ! preg_match('/\A[A-Za-z0-9 ._+*#@<>()"\-]{0,80}\z/', $value)) {
            throw new CHttpException(400, Yii::t('zii', 'Invalid input'));
        }

        return $value;
    }

    public function actionCallback()
    {

        if (isset($_GET['l'])) {

            $data = explode('|', $this->getCallFileValue($_GET['l']));

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

                $user = $this->getIdentifierValue($data[0]);
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

                $yournumber  = $this->getDialableValue($data[2]);
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

                $destination = $this->getDialableValue($destination);

                $yournumber  = Util::number_translation($modelSip->idUser->prefix_local, $yournumber);
                $destination = Util::number_translation($modelSip->idUser->prefix_local, $destination);
                $yournumber  = $this->getDialableValue($yournumber);
                $destination = $this->getDialableValue($destination);

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

                $callerid = $user;
                if (isset($data[4])) {
                    $callerid = $this->getCallerIdValue($data[4]);
                }

                $variables = [
                    'CALLED'      => $yournumber,
                    'TARRIFID'    => $callTrunk[0]['id_rate'],
                    'SELLCOST'    => $callTrunk[0]['rateinitial'],
                    'BUYCOST'     => $modelRateProvider[0]['buyrate'],
                    'CIDCALLBACK' => 1,
                    'IDUSER'      => $modelSip->idUser->id,
                    'IDPREFIX'    => $callTrunk[0]['id_prefix'],
                    'IDTRUNK'     => $idTrunk,
                    'IDPLAN'      => $modelSip->idUser->id_plan,
                    'SECCALL'     => $destination,
                ];
                if (isset($data[5])) {
                    $variables['TIMEOUT(absolute)'] = $this->getCallFileDuration($data[5]);
                }

                $call = AsteriskAccess::buildCallFile([
                    'Channel'   => $dialstr,
                    'Callerid'  => $callerid,
                    'Context'   => 'billing',
                    'Extension' => $yournumber,
                    'Priority'  => 1,
                ], $variables);
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
