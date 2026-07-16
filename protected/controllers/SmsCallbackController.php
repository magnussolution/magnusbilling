<?php
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

class SmsCallbackController extends Controller
{

    public function actionRead($asJson = true, $condition = null)
    {

        if ( ! isset($_GET['number']) || ! isset($_GET['callerid'])) {
            exit;
        }
        $destination = isset($_GET['number']) ? $_GET['number'] : '';
        $callerid    = isset($_GET['callerid']) ? $_GET['callerid'] : '';
        $date        = date('Y-m-d H:i:s');

        $modelCallerid = Callerid::model()->find("cid = :callerid AND activated = 1", [':callerid' => $callerid]);

        if ( ! isset($modelCallerid->id)) {
            $error_msg = Yii::t('zii', 'Error : Authentication Error!');
            echo $error_msg;
            exit;
        }

        /*protabilidade*/
        $callerid = Portabilidade::getDestination($callerid, $modelCallerid->idUser->id_plan);

        $SearchTariff = new SearchTariff();
        $callTrunk    = $SearchTariff->find($callerid, $modelCallerid->idUser->id_plan, $modelCallerid->id_user);

        if (substr("$callerid", 0, 4) == 1111) {
            $callerid = str_replace(substr($callerid, 0, 7), "", $callerid);
        }

        if (count($callTrunk) == 0) {
            $error_msg = Yii::t('zii', 'Prefix not found');
            echo $error_msg;
            exit;
        } else {

            if ($searchTariff[0]['trunk_group_type'] == 1) {
                $order = 'id ASC';
            } else if ($searchTariff[0]['trunk_group_type'] == 2) {
                $order = 'RAND()';
            }

            $modelTrunkGroupTrunk = TrunkGroupTrunk::model()->find([
                'condition' => 'id_trunk_group = :key',
                'params'    => [':key' => $searchTariff[0]['id_trunk_group']],
                'order'     => $order,
            ]);

            $modelTrunk   = Trunk::model()->findByPk((int) $modelTrunkGroupTrunk->id_trunk);
            $idTrunk      = $modelTrunk->id;
            $providertech = $modelTrunk->providertech;
            $ipaddress    = $modelTrunk->trunkcode;
            $removeprefix = $modelTrunk->removeprefix;
            $prefix       = $modelTrunk->trunkprefix;

            if (strncmp($callerid, $removeprefix, strlen($removeprefix)) == 0 || substr(strtoupper($removeprefix), 0, 1) == 'X') {
                $callerid = substr($callerid, strlen($removeprefix));
            }

            $dialstr = "$providertech/$ipaddress/$prefix$callerid";

            $call = AsteriskAccess::buildCallFile([
                'Channel'   => $dialstr,
                'Callerid'  => $callerid,
                'Context'   => 'billing',
                'Extension' => $callerid,
                'Priority'  => 1,
            ], [
                'CALLED'      => $callerid,
                'TARRIFID'    => $callTrunk[0]['idRate'],
                'SELLCOST'    => $callTrunk[0]['rateinitial'],
                'BUYCOST'     => $callTrunk[0]['buyrate'],
                'CIDCALLBACK' => 1,
                'IDUSER'      => $modelCallerid->id_user,
                'IDPREFIX'    => $callTrunk[0]['id_prefix'],
                'IDTRUNK'     => $idTrunk,
                'IDPLAN'      => $modelCallerid->idUser->id_plan,
                'SECCALL'     => $destination,
            ]);
            AsteriskAccess::generateCallFile($call, 5);
        }
    }
}
