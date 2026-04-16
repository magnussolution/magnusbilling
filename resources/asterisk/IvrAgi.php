<?php

/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusSolution. All rights reserved.
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

// IVR (Interactive Voice Response) handler.  Plays IVR menus defined in
// pkg_ivr and routes callers based on DTMF input.  Can also initiate direct
// extension dialing and track user choices.  Called from DidAgi or QueueAgi.
class IvrAgi
{
    // callIvr: play an IVR menu for the DID or queue destination.  Accepts
    // a $DidAgi object so it can update DID-specific variables and billing
    // info.  Iterates through menu options, handles direct extension dialing,
    // and dispatches actions (sip, queue, ivr, number, sms).  The $type
    // parameter indicates context (e.g. 'ivr' or 'queue').
    public static function callIvr(&$agi, &$MAGNUS, &$CalcAgi, &$DidAgi = null, $type = 'ivr')
    {

        $agi->verbose("Ivr module", 5);
        $agi->verbose("DID IVR - CallerID=" . $MAGNUS->CallerID . " -> DID=" . $DidAgi->modelDid->did, 6);
        $agi->answer();
        $MAGNUS->sip_account = '';
        $startTime           = time();

        $MAGNUS->destination = $DidAgi->modelDid->did;

        $sql = "SELECT *, pkg_ivr.id id, pkg_ivr.id_user id_user FROM pkg_ivr LEFT JOIN pkg_user ON pkg_ivr.id_user = pkg_user.id WHERE pkg_ivr.id = " . $DidAgi->modelDestination[0]['id_ivr'] . " LIMIT 1";
        $agi->verbose($sql, 25);
        $modelIvr = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        $username        = $modelIvr->username;
        $MAGNUS->id_user = $modelIvr->id_user;
        $MAGNUS->id_plan = $modelIvr->id_plan;

        $work = $MAGNUS->checkIVRSchedule($modelIvr->monFriStart, $modelIvr->satStart, $modelIvr->sunStart);

        if ($modelIvr->use_holidays == 1) {
            $sql = "SELECT * FROM pkg_holidays  WHERE day = '" . date('Y-m-d') . "' LIMIT 1";
            $agi->verbose($sql, 25);
            $modelHolidays = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelHolidays->id)) {
                $work = 'closed';
            }
        }

        //esta dentro do hario de atencao
        if ($work == 'open') {
            $audioURA   = 'idIvrDidWork_';
            $optionName = 'option_';
        } else {
            $audioURA   = 'idIvrDidNoWork_';
            $optionName = 'option_out_';
        }

        $continue  = true;
        $insertCDR = false;
        $i         = 0;
        while ($continue == true) {

            $agi->verbose("EXECUTE IVR " . $modelIvr->name);
            $i++;

            if ($i == 10) {
                $continue = false;
                break;
            }
            $audio         = $MAGNUS->magnusFilesDirectory . '/sounds/' . $audioURA . $DidAgi->modelDestination[0]['id_ivr'];
            $digit_timeout = 1;
            $wait_time     = 3000;

            if ($modelIvr->direct_extension == 1) {
                $sql = "SELECT name FROM pkg_sip WHERE id_user = " . $MAGNUS->id_user . " AND name REGEXP '^[0-9]*$' ORDER BY LENGTH(name) DESC LIMIT 1";
                $agi->verbose($sql, 25);
                $modelSipDirect = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                if (isset($modelSipDirect->name)) {
                    $digit_timeout       = strlen($modelSipDirect->name);
                    $wait_time           = 6000;
                    $is_direct_extention = true;
                } else {
                    $sql = "SELECT alias FROM pkg_sip WHERE id_user = " . $MAGNUS->id_user . " ORDER BY LENGTH(alias) DESC LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelSipDirect      = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                    $digit_timeout       = strlen($modelSipDirect->alias);
                    $wait_time           = 6000;
                    $is_direct_extention = true;
                }
            }
            if (file_exists($audio . ".gsm") || file_exists($audio . ".wav")) {
                $res_dtmf = $agi->get_data($audio, $wait_time, $digit_timeout);
                $option   = $res_dtmf['result'];
            } else {
                $agi->verbose('NOT EXIST AUDIO TO IVR DEFAULT OPTION ' . $audio, 5);
                $option   = '10';
                $continue = false;
            }
            $agi->verbose('option' . $option, 10);
            //se nao marcou
            if (strlen($option) < 1) {
                $agi->verbose('DEFAULT OPTION');
                $dialstatus = 'ANSWER';
                $option     = '10';
                $continue   = false;
                $insertCDR  = true;
            } else if (isset($is_direct_extention) && $is_direct_extention == 1 && strlen($option) > 1) {
                $agi->verbose('Dial to expecific SIP ACCOUNT', 5);

                $sql = "SELECT name, dial_timeout FROM pkg_sip WHERE name = '$option' OR (alias = '$option' AND id_user = " . $MAGNUS->id_user . ")  LIMIT 1";
                $agi->verbose($sql, 25);
                $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                if (isset($modelSip->name)) {

                    $dialparams = $dialparams = $MAGNUS->agiconfig['dialcommand_param_sipiax_friend'];
                    $dialparams = str_replace("%timeout%", 3600, $dialparams);
                    $dialparams = str_replace("%timeoutsec%", 3600, $dialparams);

                    $dialparams = explode(',', $dialparams);
                    if (isset($dialparams[1])) {
                        $dialparams[1] = $modelSip->dial_timeout;
                    }
                    $dialparams = implode(',', $dialparams);

                    $dialstr = 'SIP/' . $modelSip->name . $dialparams;
                    $agi->verbose($dialstr, 25);
                    $MAGNUS->sip_account = $modelSip->name;
                    $MAGNUS->startRecordCall($agi);
                    $agi->set_variable("CALLERID(num)", $MAGNUS->CallerID);
                    $MAGNUS->run_dial($agi, $dialstr);

                    $dialstatus = $agi->get_variable("DIALSTATUS");
                    $dialstatus = $dialstatus['data'];
                    $sql        = "SELECT * FROM pkg_sip WHERE name = '$modelSip->name' LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelSipForward = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                    if (strlen($modelSipForward->forward) > 3 && $dialstatus != 'CANCEL' && $dialstatus != 'ANSWER') {
                        $agi->verbose(" SIP HAVE callForward " . $modelSip->name);
                        SipCallAgi::callForward($MAGNUS, $agi, $CalcAgi, $modelSipForward);
                        $MAGNUS->hangup($agi);
                    }

                    $agi->verbose("FIM do loop", 25);

                    $continue  = false;
                    $insertCDR = true;
                } else {
                    $agi->verbose('NUMBER EXTENTION');
                    $agi->stream_file('prepaid-invalid-digits', '#');
                    continue;
                }
            }
            //se marca uma opÃ§ao que esta em branco
            else if ($modelIvr->{$optionName . $option} == '') {
                $agi->verbose('NUMBER INVALID');
                $agi->stream_file('prepaid-invalid-digits', '#');
                $insertCDR = true;
                continue;
            }

            $dtmf        = explode(("|"), $modelIvr->{$optionName . $option});
            $optionType  = $dtmf[0];
            $optionValue = $dtmf[1];
            $agi->verbose("CUSTOMER PRESS $optionType -> $optionValue", 10);

            if (preg_match('/torpedo/', $type)) {
                $data          = explode('_', $type);
                $idPhonenumber = $data[1];
                $sql           = "UPDATE pkg_phonenumber SET info = CONCAT(info,'|IVR " . $modelIvr->name . " DTMF " . $option . " at " . date('Y-m-d H:i:s') . "') WHERE id = $idPhonenumber LIMIT 1";
                $agi->verbose($sql, 25);
                $agi->exec($sql);
            }

            $chanStatus = $agi->channel_status($MAGNUS->channel);

            if ($chanStatus['result'] == 6) {
                if ($optionType == 'sip') // QUEUE
                {
                    $agi->verbose('Sip call, active insertCDR', 25);
                    $insertCDR = true;
                    $sql       = "SELECT name, dial_timeout FROM pkg_sip WHERE id = $optionValue LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                    $dialparams = $dialparams = $MAGNUS->agiconfig['dialcommand_param_sipiax_friend'];
                    $dialparams = str_replace("%timeout%", 3600, $dialparams);
                    $dialparams = str_replace("%timeoutsec%", 3600, $dialparams);

                    $dialparams = explode(',', $dialparams);
                    if (isset($dialparams[1])) {
                        $dialparams[1] = $modelSip->dial_timeout;
                    }
                    $dialparams = implode(',', $dialparams);

                    $dialstr = 'SIP/' . $modelSip->name;
                    $agi->verbose($dialstr, 25);
                    $MAGNUS->sip_account = $modelSip->name;
                    $MAGNUS->startRecordCall($agi);
                    $agi->set_variable("CALLERID(num)", $MAGNUS->CallerID);
                    $MAGNUS->run_dial($agi, $dialstr, $dialparams);

                    $dialstatus = $agi->get_variable("DIALSTATUS");
                    $dialstatus = $dialstatus['data'];
                    $sql        = "SELECT * FROM pkg_sip WHERE name = '$modelSip->name' LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelSipForward = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                    if (strlen($modelSipForward->forward) > 3 && $dialstatus != 'CANCEL' && $dialstatus != 'ANSWER') {
                        $agi->verbose(" SIP HAVE callForward " . $modelSip->name);
                        SipCallAgi::callForward($MAGNUS, $agi, $CalcAgi, $modelSipForward);
                        $MAGNUS->hangup($agi);
                    }

                    break;
                } else if ($optionType == 'repeat') // CUSTOM
                {
                    $agi->verbose("repetir IVR");
                    $continue = true;
                    continue;
                } else if (preg_match("/hangup/", $optionType)) // hangup
                {
                    $agi->verbose("Hangup IVR");
                    $insertCDR = true;
                    break;
                } else if ($optionType == 'group') // CUSTOM
                {
                    $agi->verbose("Call to group " . $optionValue, 1);
                    $sql = "SELECT * FROM pkg_sip WHERE sip_group = '$optionValue'";
                    $agi->verbose($sql, 25);
                    $modelSip = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);

                    if (! isset($modelSip[0]->id)) {
                        $agi->verbose('GROUP NOT FOUND');
                        $agi->stream_file('prepaid-invalid-digits', '#');
                        continue;
                    }
                    $MAGNUS->sip_account = $modelSip[0]->name;
                    $group               = '';

                    foreach ($modelSip as $key => $value) {
                        $group .= "SIP/" . $value->name . "&";
                    }

                    $dialstr = substr($group, 0, -1) . $dialparams;

                    $MAGNUS->startRecordCall($agi);
                    $agi->set_variable("CALLERID(num)", $MAGNUS->CallerID);
                    $MAGNUS->run_dial($agi, $dialstr, $MAGNUS->agiconfig['dialcommand_param_call_2did']);
                    $dialstatus = $agi->get_variable("DIALSTATUS");
                    $dialstatus = $dialstatus['data'];
                    $insertCDR  = true;
                } else if (preg_match("/custom/", $optionType)) // CUSTOM
                {
                    $insertCDR = true;
                    $MAGNUS->startRecordCall($agi);
                    $agi->set_variable("CALLERID(num)", $MAGNUS->CallerID);
                    $myres      = $MAGNUS->run_dial($agi, $optionValue);
                    $dialstatus = $agi->get_variable("DIALSTATUS");
                    $dialstatus = $dialstatus['data'];
                } else if ($optionType == 'ivr') // QUEUE
                {
                    $DidAgi->modelDestination[0]['id_ivr'] = $optionValue;
                    IvrAgi::callIvr($agi, $MAGNUS, $CalcAgi, $DidAgi, $type);
                } else if ($optionType == 'queue') // QUEUE
                {
                    $insertCDR                               = false;
                    $DidAgi->modelDestination[0]['id_queue'] = $optionValue;
                    QueueAgi::callQueue($agi, $MAGNUS, $CalcAgi, $DidAgi, $type, $startTime);
                    $dialstatus = $CalcAgi->sessiontime > 0 ? 'ANSWER' : 'DONTCALL';
                } else if (preg_match("/^number/", $optionType)) //envia para um fixo ou celular
                {
                    $insertCDR = false;
                    $agi->verbose("CALL number $optionValue");
                    $sql = "SELECT * FROM pkg_sip WHERE id_user = " . $MAGNUS->id_user . " LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelSIPCallerid = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                    $MAGNUS->CallerID = isset($modelSIPCallerid->callerid) ? $modelSIPCallerid->callerid : $MAGNUS->CallerID;
                    $agi->set_callerid($MAGNUS->CallerID);
                    $DidAgi->call_did($agi, $MAGNUS, $CalcAgi, $optionValue);
                }
            }

            $agi->verbose("FIM do loop", 25);

            $continue  = false;
            $insertCDR = true;
        }

        $stopTime = time();

        $answeredtime = $stopTime - $startTime;

        $terminatecauseid = 1;

        $siptransfer = $agi->get_variable("SIPTRANSFER");

        $tipo = 9;
        $MAGNUS->stopRecordCall($agi);

        if ($agi->get_variable("ISFROMCALLBACKPRO", true)) {
            return;
        }

        if ($siptransfer['data'] != 'yes' && $insertCDR == true && $type == 'ivr') {
            $agi->verbose('Hangup IVR call, send to call_did_billing', 25);
            $DidAgi->call_did_billing($agi, $MAGNUS, $CalcAgi, $answeredtime, $dialstatus);
        }

        return;
    }
}
