<?php

/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2018 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 *
 */

class CallbackAgi
{
    public static function callbackCID($agi, $MAGNUS, $CalcAgi, $DidAgi)
    {
        $agi->verbose("MAGNUS CID CALLBACK");
        $MAGNUS->agiconfig['cid_enable'] = 1;

        if ($MAGNUS->dnid == 'failed' || ! is_numeric($MAGNUS->dnid)) {
            $agi->verbose("Hangup becouse dnid is OutgoingSpoolFailed", 25);
            $MAGNUS->hangup($agi);
            exit;
        }

        $agi->verbose('CallerID ' . $MAGNUS->CallerID);

        if (strlen($MAGNUS->CallerID) > 1 && is_numeric($MAGNUS->CallerID)) {
            $cia_res = AuthenticateAgi::authenticateUser($agi, $MAGNUS);

            if ($cia_res == 1) {

                $MAGNUS->destination = $MAGNUS->countryCode . $MAGNUS->CallerID;

                $agi->verbose('$MAGNUS->destination =>' . $MAGNUS->destination);

                /*protabilidade*/
                $MAGNUS->number_translation($agi, $MAGNUS->destination);

                $searchTariff = new SearchTariff();
                $resfindrate  = $searchTariff->find($MAGNUS, $agi);

                $CalcAgi->tariffObj    = $resfindrate;
                $CalcAgi->number_trunk = count($resfindrate);

                if (substr("$MAGNUS->destination", 0, 4) == 1111) {
                    $MAGNUS->destination = str_replace(substr($MAGNUS->destination, 0, 7), "", $MAGNUS->destination);
                }

                $CalcAgi->usedratecard = 0;
                if ($resfindrate != 0) {
                    $res_all_calcultimeout = $CalcAgi->calculateAllTimeout($MAGNUS, $agi);
                    if ($res_all_calcultimeout) {
                        $destination  = $MAGNUS->destination;
                        $providertech = $CalcAgi->tariffObj[0]['rc_providertech'];
                        $ipaddress    = $CalcAgi->tariffObj[0]['rc_providerip'];
                        $removeprefix = $CalcAgi->tariffObj[0]['rc_removeprefix'];
                        $prefix       = $CalcAgi->tariffObj[0]['rc_trunkprefix'];

                        if (strncmp($destination, $removeprefix, strlen($removeprefix)) == 0 || substr(strtoupper($removeprefix), 0, 1) == 'X') {
                            $destination = substr($destination, strlen($removeprefix));
                        }

                        $dialstr = "$providertech/$ipaddress/$prefix$destination";

                        $call = AsteriskAccess::buildCallFile([
                            'Channel'   => $dialstr,
                            'Callerid'  => $MAGNUS->CallerID,
                            'Context'   => 'billing',
                            'Extension' => $MAGNUS->destination,
                            'Priority'  => 1,
                        ], [
                            'CALLED'      => $MAGNUS->destination,
                            'TARRIFID'    => $CalcAgi->tariffObj[0]['id_rate'],
                            'SELLCOST'    => $CalcAgi->tariffObj[0]['rateinitial'],
                            'BUYCOST'     => $CalcAgi->tariffObj[0]['buyrate'],
                            'CIDCALLBACK' => 1,
                            'IDUSER'      => $MAGNUS->id_user,
                            'IDPREFIX'    => $CalcAgi->tariffObj[0]['id_prefix'],
                            'IDTRUNK'     => $CalcAgi->tariffObj[0]['id_trunk'],
                            'IDPLAN'      => $MAGNUS->id_plan,
                        ]);
                        AsteriskAccess::generateCallFile($call, 3);

                        $agi->answer();
                    }
                } else {
                    $agi->verbose("NO TARIFF FOUND");
                }
            }
        }

        $MAGNUS->hangup($agi);
        exit;
    }

    public static function callback0800($agi, $MAGNUS, $CalcAgi, $DidAgi)
    {

        $agi->verbose("MAGNUS 0800 CALLBACK");

        if ($MAGNUS->dnid == 'failed' || ! is_numeric($MAGNUS->dnid)) {
            $agi->verbose("Hangup becouse dnid is OutgoingSpoolFailed");
            $MAGNUS->hangup($agi);
            exit;
        }

        $destination = $MAGNUS->CallerID;

        $removeprefix = $MAGNUS->config['global']['callback_remove_prefix'];
        if (strncmp($destination, $removeprefix, strlen($removeprefix)) == 0 || substr(strtoupper($removeprefix), 0, 1) == 'X') {
            $destination = substr($destination, strlen($removeprefix));
        }

        $addprefix   = $MAGNUS->config['global']['callback_add_prefix'];
        $destination = $addprefix . $destination;

        $user = $MAGNUS->modelUser->username;

        $sql = "SELECT * FROM pkg_sip WHERE id_user = " . $DidAgi->modelDestination[0]['id_user'] . " LIMIT 1";
        $agi->verbose($sql, 25);
        $MAGNUS->modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (! isset($MAGNUS->modelSip->id)) {
            $agi->verbose("Username not have SIP ACCOUNT");
            $MAGNUS->hangup($agi);
            return;
        }

        $destino = $MAGNUS->modelSip->name;
        $id_user = $DidAgi->modelDestination[0]['id_user'];

        if ($MAGNUS->config['global']['answer_callback'] == 1) {
            $agi->answer();
            sleep(2);
            $agi->stream_file('prepaid-callback', '#');
        }

        $dialstr = "SIP/$destino";
        $call = AsteriskAccess::buildCallFile([
            'Channel'   => $dialstr,
            'Callerid'  => $destination,
            'Context'   => 'billing',
            'Extension' => $destination,
            'Priority'  => 1,
        ], [
            'IDUSER'  => $id_user,
            'SECCALL' => $destination,
        ]);
        AsteriskAccess::generateCallFile($call);

        $agi->evaluate("ANSWER 0");
        $MAGNUS->hangup($agi);
    }

    public static function chargeFistCall($agi, $MAGNUS, $CalcAgi, $sessiontime = 0)
    {

        if ($MAGNUS->dnid == 'failed' || ! is_numeric($MAGNUS->dnid)) {
            $agi->verbose("Hangup becouse dnid is OutgoingSpoolFailed", 25);
            $MAGNUS->hangup($agi);
            exit;
        }

        if ($agi->get_variable("IDPREFIX", true) > 0) {

            $agi->verbose("Callback: CHARGE FOR THE 1ST LEG callback_username=$MAGNUS->username", 10);
            $sell = $agi->get_variable("SELLCOST", true);

            $buycost = $agi->get_variable("BUYCOST", true);

            $MAGNUS->id_user  = $agi->get_variable("IDUSER", true);
            $called           = $agi->get_variable("CALLED", true);
            $MAGNUS->id_plan  = $agi->get_variable("IDPLAN", true);
            $MAGNUS->id_trunk = $agi->get_variable("IDTRUNK", true);
            $idPrefix         = $agi->get_variable("IDPREFIX", true);
            $called           = $agi->get_variable("CALLED", true);

            $sql = "SELECT * FROM pkg_sip WHERE id_user = " . $agi->get_variable("IDUSER", true) . " LIMIT 1";
            $agi->verbose($sql, 25);
            $MAGNUS->modelSip    = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            $MAGNUS->sip_account = $MAGNUS->modelSip->name;

            if ($sessiontime == 0) {

                $sell30    = $sell / 2;
                $buycost30 = $buycos / 2;

                //desconto 1 minuto assim que o cliente atende a chamada
                $sql = "UPDATE pkg_user SET credit = credit - " . $MAGNUS->round_precision(abs($sell30)) . " WHERE id = '$MAGNUS->id_user' LIMIT 1";
                $agi->verbose($sql, 25);
                $agi->exec($sql);

                $sessiontime1fsLeg = 30;

                $CalcAgi->starttime        = date("Y-m-d H:i:s", time() - $sessiontime1fsLeg);
                $CalcAgi->sessiontime      = $sessiontime1fsLeg;
                $CalcAgi->real_sessiontime = intval($sessiontime1fsLeg);
                $CalcAgi->terminatecauseid = 1;
                $CalcAgi->sessionbill      = $sell30;
                $CalcAgi->sipiax           = 4;
                $CalcAgi->buycost          = $buycost30;
                $CalcAgi->id_prefix        = $idPrefix;
                $id_call                   = $CalcAgi->saveCDR($agi, $MAGNUS, true);

                $CalcAgi->idCallCallBack = $id_call;
            } elseif ($sessiontime) {

                $selltNew = ($sell / 60) * $sessiontime;

                $sessiontime = $sessiontime + 30;
                $sell        = ($sell / 60) * $sessiontime;
                $buycost     = ($buycost / 60) * $sessiontime;

                $sql = "UPDATE pkg_cdr SET sessiontime = '$sessiontime', sessionbill = '$sell', buycost = '$buycost', calledstation = '$called' WHERE id = '$CalcAgi->idCallCallBack' LIMIT 1 ";
                $agi->verbose($sql, 25);
                $agi->exec($sql);

                $sql = "UPDATE pkg_user SET credit = credit - $MAGNUS->round_precision(abs($selltNew))
                            WHERE id = $MAGNUS->modelUser->id LIMIT 1";
                $agi->verbose($sql, 25);
                $agi->exec($sql);
            }
        }
    }

    public static function advanced0800CallBack($agi, $MAGNUS, $DidAgi, $CalcAgi)
    {
        $MAGNUS->prefix_local = $MAGNUS->modelUser->prefix_local;
        $MAGNUS->CallerID     = preg_replace("/\+/", '', $MAGNUS->CallerID);
        $MAGNUS->number_translation($agi, $MAGNUS->CallerID);
        $callerID = $MAGNUS->destination;

        //adiciona o 55 se o callerid tiver somente com DDD numero
        if ((strtoupper($MAGNUS->config['global']['base_country']) == 'BRL' || strtoupper($MAGNUS->config['global']['base_country']) == 'ARG')
            && (strlen($callerID) == 10 || strlen($callerID) == 11)
        ) {
            $callerID = "55" . $callerID;
        }
        $work   = $MAGNUS->checkIVRSchedule($DidAgi->modelDid->TimeOfDay_monFri, $DidAgi->modelDid->TimeOfDay_sat, $DidAgi->modelDid->TimeOfDay_sun);
        $status = $work != 'open' ? 4 : 1;

        $sql = "SELECT * FROM pkg_callback WHERE exten = '$callerID' AND status IN (1,4) AND id_did = " . $DidAgi->modelDestination[0]['id_did'] . " LIMIT 1 ";
        $agi->verbose($sql, 25);
        $modelCallBack = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (isset($modelCallBack->id)) {
            $sql = "UPDATE pkg_callback SET status = '$status' WHERE id = $modelCallBack->id LIMIT 1";
            $agi->verbose($sql, 25);
            $agi->exec($sql);
        } else {
            $sql = "INSERT INTO pkg_callback (id_did,exten, id_user, status, entry_time) VALUES ('" . $DidAgi->modelDestination[0]['id_did'] . "',
                    '$callerID','" . $DidAgi->modelDestination[0]['id_user'] . "', $status, '" . date('Y-m-d H:i:s') . "')";
            $agi->verbose($sql, 25);
            $agi->exec($sql);
        }

        $agi->verbose($callerID, 25);

        //audio enable
        if ($DidAgi->modelDid->cbr_ua == 1) {

            //esta dentro do hario de atencao
            $audioURA = $work == 'open' ? 'idDidAudioProWork_' : 'idDidAudioProNoWork_';
            $audio    = $MAGNUS->magnusFilesDirectory . '/sounds/' . $audioURA . $DidAgi->modelDestination[0]['id_did'];
            //early_media enable
            if ($DidAgi->modelDid->cbr_em == 1) {
                $agi->set_variable("AUDIO", $audio);
                $agi->execute('goto', 'earlymedia,0800,1');
                exit;
            } else {
                $agi->answer();
                $agi->execute('Wait', '1');
                $time            = time();
                $MAGNUS->id_user = $MAGNUS->modelUser->id;
                $MAGNUS->id_plan = $MAGNUS->modelUser->id_plan;
                $DidAgi->didCallCost($agi, $MAGNUS);
                $agi->stream_file($audio, '#');
                $answeredtime = time() - $time;
                $DidAgi->call_did_billing($agi, $MAGNUS, $CalcAgi, $answeredtime, 'ANSWER');
            }
        }

        $agi->execute('Congestion', '5');
        $MAGNUS->hangup($agi);
        exit;
    }
}
