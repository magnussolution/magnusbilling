#!/usr/bin/php -q
<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
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
if (function_exists('pcntl_signal')) {
    pcntl_signal(SIGHUP, SIG_IGN);
}

error_reporting(E_ALL ^ (E_NOTICE | E_WARNING | E_DEPRECATED));

require_once 'AGI.Class.php';
require_once 'AGI_AsteriskManager.Class.php';
require_once 'AuthenticateAgi.php';
require_once 'CalcAgi.php';
require_once 'CallbackAgi.php';
require_once 'DidAgi.php';
require_once 'IvrAgi.php';
require_once 'MassiveCall.php';
require_once 'PickupAgi.php';
require_once 'PortabilidadeAgi.php';
require_once 'PortalDeVozAgi.php';
require_once 'QueueAgi.php';
require_once 'SearchTariff.php';
require_once 'SipCallAgi.php';
require_once 'SipTransferAgi.php';
require_once 'StandardCallAgi.php';
require_once 'Magnus.php';
require_once '/var/www/html/mbilling/protected/components/AsteriskAccess.php';

$agi     = new AGI();
$MAGNUS  = new Magnus();
$CalcAgi = new CalcAgi();
//$agi->verboseLevel = 1;

$agi->verbose("Start MBilling AGI", 6);

$MAGNUS->load_conf($agi, null, 0, 1);
$MAGNUS->get_agi_request_parameter($agi);

$MAGNUS->init();
$CalcAgi->init();

$MAGNUS->mode = 'standard';
if (file_exists('/root/log.conf')) {
    $resultFile = file_get_contents('/root/log.conf');
    if (preg_match(
        '/' .
            $MAGNUS->accountcode . '|' .
            $MAGNUS->dnid . '|' .
            $MAGNUS->sip_account . '/',
        $resultFile
    )) {
        $agi->verboseLevel = 1;
    }
}
$agi->verbose("Start MBilling AGI", 6);
if ($MAGNUS->dnid == 'failed') {
    $agi->verbose("Hangup becouse dnid is OutgoingSpoolFailed", 25);
    $MAGNUS->hangup($agi);
    exit;
}

if (substr($MAGNUS->dnid, 0, 2) == '*7') {
    PickupAgi::execute($agi, $MAGNUS);
}

if ($MAGNUS->dnid == '*180' || $MAGNUS->dnid == '*181') {
    QueueAgi::pauseQueue($agi, $MAGNUS);
    $MAGNUS->hangup($agi);
    exit;
}
if ($MAGNUS->dnid == '*120') {
    $agi->answer();

    $res_dtmf = $agi->get_data('prepaid-enter-pin-number', 6000, 6);
    $agi->verbose('VOUCHER ' . $res_dtmf["result"], 20);

    $dtmf = $res_dtmf["result"];

    $sql = "SELECT * FROM pkg_voucher WHERE voucher = '$dtmf' AND used = 0 LIMIT 1";
    $agi->verbose($sql, 25);
    $modelVoucher = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
    if (isset($modelVoucher->id)) {
        $agi->verbose("Found valid voucher Number $modelVoucher->voucher");

        $sql = "SELECT * FROM pkg_user WHERE username = '" . $MAGNUS->accountcode . "'";
        $agi->verbose($sql, 25);
        $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (isset($modelUser->id)) {

            $sql = "UPDATE pkg_voucher SET id_user = $modelUser->id, usedate = NOW(), used = 1 WHERE voucher = '$modelVoucher->voucher' LIMIT 1";
            $agi->verbose($sql, 25);
            $agi->exec($sql);

            $sql = "UPDATE pkg_user SET credit = credit + " . $modelVoucher->credit . " WHERE username = '" . $modelUser->username . "' LIMIT 1";
            $agi->verbose($sql, 25);
            $agi->exec($sql);

            $values = "" . $modelUser->id . ",'" . $modelVoucher->credit . "','Voucher " . $modelVoucher->voucher . ". Old credit " . $modelUser->credit . "',1";
            $sql    = "INSERT INTO pkg_refill (id_user,credit,description,payment) VALUES ($values)";
            $agi->verbose($sql, 25);
            $agi->exec($sql);
            $prompt = "prepaid-final";
        } else {
            $prompt = "prepaid-invalid-digits";
        }
    } else {
        $prompt = "prepaid-invalid-digits";
    }

    $agi->stream_file($prompt, '#');
    exit;
}

//Hangup call that start with 1111, avoid fake call to Brasilian portability
if (substr($MAGNUS->dnid, 0, 4) == 1111) {
    $agi->execute((congestion), Congestion);
    $MAGNUS->hangup($agi);
}

if ($agi->get_variable("IDCALLBACK", true)) {
    $sql = "SELECT callerid FROM pkg_sip WHERE id_user = " . $agi->get_variable("IDUSER", true) . " LIMIT 1";
    $agi->verbose($sql, 25);
    $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
    if (isset($modelSip->callerid)) {
        $agi->set_callerid($modelSip->callerid);
    }
}

if ($agi->get_variable("CIDCALLBACK", true)) {

    CallbackAgi::chargeFistCall($agi, $MAGNUS, $CalcAgi, 0);
    $MAGNUS->agiconfig['answer']     = 1;
    $MAGNUS->agiconfig['cid_enable'] = 1;
    $MAGNUS->agiconfig['use_dnid']   = 0;
    $MAGNUS->agiconfig['number_try'] = 3;
}

if ($agi->get_variable("MEMBERNAME", true) || $agi->get_variable("QUEUEPOSITION", true)) {

    $sql = "SELECT * FROM pkg_sip WHERE name = '$MAGNUS->dnid' OR (alias = '$MAGNUS->dnid' AND accountcode = (SELECT accountcode FROM pkg_sip WHERE name = '" . substr($agi->get_variable("MEMBERNAME", true), 4) . "') ) LIMIT 1";
    $agi->verbose($sql, 25);
    $MAGNUS->modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
    if (isset($MAGNUS->modelSip->id) && strlen($MAGNUS->modelSip->name) > 3) {

        if ($MAGNUS->dnid == $MAGNUS->modelSip->alias) {
            $sql = "SELECT alias FROM pkg_sip WHERE name = '" . $MAGNUS->sip_account . "' LIMIT 1";
            $agi->verbose($sql, 25);
            $modelSipCallerID = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (strlen($modelSipCallerID->alias)) {
                $agi->set_callerid($modelSipCallerID->alias);
                $agi->set_variable("CALLERID(num)", $modelSipCallerID->alias);
                $MAGNUS->CallerID = $modelSipCallerID->alias;
            }
        }
        $MAGNUS->destination = $MAGNUS->dnid = $MAGNUS->modelSip->name;
        $MAGNUS->mode        = 'call-sip';
        $MAGNUS->voicemail   = $MAGNUS->modelSip->voicemail;
        $agi->verbose("CALL TO SIP", 15);
        $sipCallAgi = new SipCallAgi();
        $sipCallAgi->processCall($MAGNUS, $agi, $CalcAgi);
    } else {
        $agi->answer();
        $CalcAgi->init();
        QueueAgi::recIvrQueue($agi, $MAGNUS, $CalcAgi);
    }
}

if ($agi->get_variable("PHONENUMBER_ID", true) > 0 && $agi->get_variable("CAMPAIGN_ID", true) > 0) {
    $MAGNUS->mode = 'massive-call';
    MassiveCall::send($agi, $MAGNUS, $CalcAgi);
}

if ($agi->get_variable("SPY", true) == 1) {

    $channel = $agi->get_variable("CHANNELSPY", true);
    $spyType = $agi->get_variable("SPYTYPE", true);
    $agi->verbose('SPY CALL ' . $channel);
    $agi->execute("ChanSpy", $channel . ',' . $spyType);
    $agi->stream_file('prepaid-final', '#');
    $MAGNUS->hangup($agi);
    exit;
}

if (preg_match('/\-/', $MAGNUS->config['global']['apply_local_prefix_did_sip'])) {
    $rules = explode('-', $MAGNUS->config['global']['apply_local_prefix_did_sip']);
    if (substr($MAGNUS->dnid, 0, 1) == $rules['0']) {
        $agi->verbose($MAGNUS->dnid);
        $MAGNUS->dnid = $MAGNUS->destination = $rules['1'] . substr($MAGNUS->dnid, 1);
        $agi->verbose($MAGNUS->dnid);
    }
}

$didAgi = new DidAgi();
$didAgi->checkIfIsDidCall($agi, $MAGNUS, $CalcAgi);

if ($MAGNUS->mode == 'standard') {

    //get if the call have the second number
    if ($agi->get_variable("SECCALL", true)) {

        $agi->stream_file('prepaid-secondCall', '#');
        $MAGNUS->agiconfig['use_dnid'] = 1;
        $sql                           = "SELECT * FROM pkg_user WHERE id = " . $agi->get_variable("IDUSER", true) . " LIMIT 1";
        $agi->verbose($sql, 25);
        $MAGNUS->modelUser   = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        $MAGNUS->accountcode = isset($MAGNUS->modelUser->username) ? $MAGNUS->modelUser->username : null;

        if ($agi->get_variable("SIPUSER", true)) {
            $sql = "SELECT * FROM pkg_sip WHERE name = '" . $agi->get_variable("SIPUSER", true) . "' LIMIT 1";
        } else {
            $sql = "SELECT * FROM pkg_sip WHERE name = '" . $MAGNUS->dnid . "'  OR (alias = '$MAGNUS->dnid' AND accountcode = '$MAGNUS->accountcode') LIMIT 1";
        }
        $agi->verbose($sql, 25);
        $MAGNUS->modelSip    = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        $MAGNUS->sip_account = $MAGNUS->modelSip->name;

        $MAGNUS->destination = $MAGNUS->extension = $MAGNUS->dnid = $agi->get_variable("SECCALL", true);

        $agi->verbose("CALL TO PSTN FROM CLIC TO CALL", 15);
        $standardCall = new StandardCallAgi();
        $standardCall->processCall($MAGNUS, $agi, $CalcAgi);
    } else {

        if ($agi->get_variable("DIDACCOUNTCODE", true)) {
            $agi->verbose(25, "Get account code from trasnfered DID");
            $MAGNUS->accountcode = $agi->get_variable("DIDACCOUNTCODE", true);
        }
        $sql = "SELECT * FROM pkg_sip WHERE name = '$MAGNUS->dnid' OR (alias = '$MAGNUS->dnid' AND accountcode = '$MAGNUS->accountcode') LIMIT 1";
        $agi->verbose($sql, 25);
        $MAGNUS->modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (isset($MAGNUS->modelSip->id) && strlen($MAGNUS->modelSip->name) > 3) {

            if ($MAGNUS->dnid == $MAGNUS->modelSip->alias) {
                //find the caller alias set callerid
                $sql = "SELECT alias FROM pkg_sip WHERE name = '" . $MAGNUS->sip_account . "' LIMIT 1";
                $agi->verbose($sql, 25);
                $modelSipCallerID = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                if (strlen($modelSipCallerID->alias)) {
                    $agi->set_callerid($modelSipCallerID->alias);
                    $agi->set_variable("CALLERID(num)", $modelSipCallerID->alias);
                    $MAGNUS->CallerID = $modelSipCallerID->alias;
                }
            }

            if ($agi->request['agi_calleridname'] !== 'unknown' && ! empty($agi->request['agi_calleridname'])) {
                $agi->set_variable("CALLERID(name)", $agi->request['agi_calleridname']);
            }

            $MAGNUS->destination = $MAGNUS->dnid = $MAGNUS->modelSip->name;
            $MAGNUS->mode        = 'call-sip';
            $MAGNUS->voicemail   = $MAGNUS->modelSip->voicemail;
            $agi->verbose("CALL TO SIP", 15);
            $sipCallAgi = new SipCallAgi();
            $sipCallAgi->processCall($MAGNUS, $agi, $CalcAgi);
        } else {

            if ($MAGNUS->config['global']['use_sip_to_iax'] == 1) {
                require_once 'IaxCallAgi.php';

                $sql = "SELECT * FROM pkg_iax WHERE name = '$MAGNUS->dnid'  LIMIT 1";
                $agi->verbose($sql, 25);
                $modeIax = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                if (isset($modeIax->id) && strlen($modeIax->name) > 3) {
                    $MAGNUS->destination = $MAGNUS->dnid = $modeIax->name;
                    $MAGNUS->mode        = 'call-iax';
                    $MAGNUS->voicemail   = 0;
                    $agi->verbose("CALL TO IAX", 15);
                    $iaxCallAgi = new IaxCallAgi();
                    $iaxCallAgi->processCall($MAGNUS, $agi, $CalcAgi, $modeIax);
                    exit;
                }
            }

            $agi->verbose("CALL TO PSTN", 15);
            $standardCall = new StandardCallAgi();
            $standardCall->processCall($MAGNUS, $agi, $CalcAgi);
        }
    }
}
SipTransferAgi::billing($MAGNUS, $agi, $CalcAgi);
$MAGNUS->hangup($agi);

?>