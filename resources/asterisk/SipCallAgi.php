<?php

/**
 *
 */
class SipCallAgi
{

    public static function processCall(&$MAGNUS, &$agi, &$CalcAgi, $type = 'normal')
    {
        if (($MAGNUS->agiconfig['use_dnid'] == 1) && (strlen($MAGNUS->dnid) > 2)) {
            $MAGNUS->destination = $MAGNUS->dnid;
        }

        if (file_exists(dirname(__FILE__) . '/push/Push.php')) {
            include_once dirname(__FILE__) . '/push/Push.php';
            Push::send($agi, $MAGNUS->destination, $MAGNUS->CallerID);
        }

        $MAGNUS->destination = $MAGNUS->dnid;
        $dialparams          = $MAGNUS->agiconfig['dialcommand_param_sipiax_friend'];
        //add the sipaccount dial timeout in dialcommand_param.
        $dialparams = explode(',', $dialparams);
        if (isset($dialparams[1])) {
            $dialparams[1] = $MAGNUS->modelSip->dial_timeout;
        }
        $dialparams = implode(',', $dialparams);

        $sql = "SELECT * FROM pkg_user WHERE id = " . $MAGNUS->modelSip->id_user . " LIMIT 1";
        $agi->verbose($sql, 25);
        $MAGNUS->modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        if ($MAGNUS->modelSip->record_call == 1) {
            $record_call = 1;
        }

        AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $MAGNUS->modelUser);

        if ($MAGNUS->modelSip->record_call == 1 || $record_call == 1) {
            $MAGNUS->record_call = 1;
        }

        $MAGNUS->startRecordCall($agi);

        $dialstr = "SIP/" . $MAGNUS->destination;

        $startCall = time();
        $MAGNUS->run_dial($agi, $dialstr, $dialparams);

        $blindTransfer = $agi->get_variable("BLINDTRANSFER");
        $blindTransfer = $blindTransfer['data'];
        if (strlen($blindTransfer) > 1) {
            exit;
        }

        $answeredtime = $agi->get_variable("ANSWEREDTIME");
        $answeredtime = $answeredtime['data'];
        $dialstatus   = $agi->get_variable("DIALSTATUS");
        $dialstatus   = $dialstatus['data'];

        $MAGNUS->stopRecordCall($agi);

        $agi->verbose("[" . $MAGNUS->username . " Friend]:[ANSWEREDTIME=" . $answeredtime . "-DIALSTATUS=" . $dialstatus . "]", 6);

        if (! preg_match('/^CANCEL|^ANSWER/', strtoupper($dialstatus))) {

            $sql = "SELECT * FROM pkg_sip WHERE name = '$MAGNUS->destination' LIMIT 1 ";
            $agi->verbose($sql, 25);
            $modelSipForward = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelSipForward->id) && strlen($modelSipForward->forward) > 3) {
                SipCallAgi::callForward($MAGNUS, $agi, $CalcAgi, $modelSipForward);
                $MAGNUS->hangup($agi);
            }
        }

        $sql = "SELECT voicemail FROM pkg_sip WHERE name = '$MAGNUS->destination' LIMIT 1 ";
        $agi->verbose($sql, 25);
        $modelSipVoiceMail = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        if (isset($modelSipForward->id)) {
            $MAGNUS->voicemail = $modelSipVoiceMail->voicemail;
        }

        $answeredtime = $MAGNUS->executeVoiceMail($agi, $dialstatus, $answeredtime);

        if ($agi->get_variable("ISFROMCALLBACKPRO", true)) {
            return;
        }

        if ($type == 'normal') {

            if (strlen($MAGNUS->dialstatus_rev_list[$dialstatus]) > 0) {
                $terminatecauseid = $MAGNUS->dialstatus_rev_list[$dialstatus];
            } else {
                $terminatecauseid = 0;
            }
            $cost        = 0;
            $siptransfer = $agi->get_variable("SIPTRANSFER");
            if ($answeredtime > 0 && $siptransfer['data'] != 'yes' && $terminatecauseid == 1) {
                if ($MAGNUS->config['global']['charge_sip_call'] > 0) {
                    $cost = ($MAGNUS->config['global']['charge_sip_call'] / 60) * $answeredtime;
                    $agi->verbose("Update credit username after transfer $MAGNUS->username, " . $cost, 15);
                }
            }

            $CalcAgi->starttime        = date("Y-m-d H:i:s", $startCall);
            $CalcAgi->sessiontime      = $answeredtime;
            $CalcAgi->terminatecauseid = $terminatecauseid;
            $CalcAgi->sessionbill      = $cost;
            $CalcAgi->sipiax           = 1;
            $CalcAgi->buycost          = 0;
            $CalcAgi->saveCDR($agi, $MAGNUS);

            $MAGNUS->hangup($agi);
        } else {
            return [
                'dialstatus'   => $dialstatus,
                'answeredtime' => $answeredtime,
            ];
        }
    }

    // callForward: invoked when a SIP account has a forward configured.
    // The forward rule may point to another SIP user, a custom string, an
    // IVR, queue, telephone number or SMS.  Depending on the type the method
    // either recursively calls processCall, uses IvrAgi/QueueAgi, or sends an
    // SMS.  Called after a dial attempt fails or immediately when a SIP
    // contact indicates forwarding.
    public static function callForward($MAGNUS, $agi, $CalcAgi, $modelSipForward)
    {

        $forward     = explode(("|"), $modelSipForward->forward);
        $optionType  = $forward[0];
        $optionValue = $forward[1];

        if ($optionType == 'sip') // SIP
        {
            $agi->verbose('Sip call', 25);
            $insertCDR = true;
            $sql       = "SELECT name, callerid,id_user,dial_timeout FROM pkg_sip WHERE id = $optionValue LIMIT 1";
            $agi->verbose($sql, 25);
            $MAGNUS->modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            $MAGNUS->dnid = $MAGNUS->destination = $MAGNUS->sip_account = $MAGNUS->modelSip->name;
            sipCallAgi::processCall($MAGNUS, $agi, $CalcAgi);
        } else if ($optionType == 'group') // CUSTOM
        {
            $agi->verbose("Call to group " . $optionValue, 1);
            $sql = "SELECT * FROM pkg_sip WHERE sip_group = '$optionValue'";
            $agi->verbose($sql, 25);
            $modelSip = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);

            if (! isset($modelSip[0]->id)) {
                $agi->verbose('GROUP NOT FOUND');
                $agi->stream_file('prepaid-invalid-digits', '#');
            }
            $MAGNUS->sip_account = $modelSip[0]->name;
            $group               = '';

            foreach ($modelSip as $key => $value) {
                $group .= "SIP/" . $value->name . "&";
            }

            $dialstr = substr($group, 0, -1) . $dialparams;

            $MAGNUS->startRecordCall($agi);

            $MAGNUS->run_dial($agi, $dialstr, $MAGNUS->agiconfig['dialcommand_param_call_2did']);
            $dialstatus = $agi->get_variable("DIALSTATUS");
            $dialstatus = $dialstatus['data'];
        } else if (preg_match("/custom/", $optionType)) // CUSTOM
        {
            if (preg_match('/^SMS/', $optionValue)) // QUEUE
            {
                SipCallAgi::smsForward($MAGNUS, $agi, $CalcAgi, $optionValue);
            } else {
                $MAGNUS->startRecordCall($agi);

                $MAGNUS->run_dial($agi, $optionValue);
                $dialstatus = $agi->get_variable("DIALSTATUS");
                $dialstatus = $dialstatus['data'];
            }
        } else if ($optionType == 'ivr') // QUEUE
        {
            $didAgi                                = new DidAgi();
            $didAgi->modelDestination[0]['id_ivr'] = $optionValue;
            IvrAgi::callIvr($agi, $MAGNUS, $CalcAgi, $didAgi, $type);
        } else if ($optionType == 'queue') // QUEUE
        {
            $didAgi                                  = new DidAgi();
            $didAgi->modelDestination[0]['id_queue'] = $optionValue;
            QueueAgi::callQueue($agi, $MAGNUS, $CalcAgi, $didAgi);
            $dialstatus = $CalcAgi->sessiontime > 0 ? 'ANSWER' : 'DONTCALL';
        } else if (preg_match("/^number/", $optionType)) //envia para um fixo ou celular
        {
            $sql = "SELECT * FROM pkg_user WHERE id = $modelSipForward->id_user  LIMIT 1";
            $agi->verbose($sql, 25);
            $modelUserForward    = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            $MAGNUS->CallerID    = strlen($modelSipForward->callerid) > 3 ?  $modelSipForward->callerid : $MAGNUS->CallerID;
            $MAGNUS->accountcode = $modelUserForward->accountcode;
            $agi->set_callerid($MAGNUS->CallerID);
            $agi->verbose("CALL number $optionValue");
            $didAgi = new DidAgi();
            $didAgi->call_did($agi, $MAGNUS, $CalcAgi, $optionValue);
        } else if (strtoupper($optionType) == 'SMS') // QUEUE
        {
            $this->sendSMS($MAGNUS, $agi, $CalcAgi, $optionValue);
        }
    }

    // smsForward: helper that constructs and sends an SMS via a configured
    // trunk.  Option value comes from a forward rule like "SMS/text@number".
    // After sending the message the method writes a CDR and hangs up the call.
    public static function smsForward($MAGNUS, $agi, $CalcAgi, $optionValue)
    {
        $agi->verbose("try send SMS", 5);

        //SMS/menssagem+sms@55DDDnumero
        $data = explode("@", substr($optionValue, 4));

        $text        = $data[0];
        $destination = $data[1];
        $text        = addslashes((string) $text);
        //CODIFICA O TESTO DO SMS
        $text = urlencode($text);

        $sql = "SELECT pkg_rate.id AS idRate, rateinitial, pkg_prefix.id AS id_prefix, id_trunk_group, id_trunk_group, pkg_trunk_group.type AS trunk_group_type
                            FROM pkg_rate
                            LEFT JOIN pkg_plan ON pkg_rate.id_plan=pkg_plan.id
                            LEFT JOIN pkg_prefix ON pkg_rate.id_prefix=pkg_prefix.id
                            LEFT JOIN pkg_trunk_group ON pkg_trunk_group.id = pkg_rate.id_trunk_group
                            WHERE prefix = SUBSTRING(999$destination,1,length(prefix)) and pkg_plan.id= " . $MAGNUS->modelUser->id_plan . "
                            ORDER BY LENGTH(prefix) DESC";

        $agi->verbose($sql, 25);
        $modelRate = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        $agi->verbose($sql, 1);

        if ($modelRate->trunk_group_type == 1) {
            $sql = "SELECT * FROM pkg_trunk_group_trunk WHERE id_trunk_group = " . $modelRate->id_trunk_group . " ORDER BY id ASC";
        } else if ($modelRate->trunk_group_type == 2) {
            $sql = "SELECT * FROM pkg_trunk_group_trunk WHERE id_trunk_group = " . $modelRate->id_trunk_group . " ORDER BY RAND() ";
        } else if ($modelRate[0]['trunk_group_type'] == 3) {
            $sql = "SELECT *, (SELECT buyrate FROM pkg_rate_provider WHERE id_provider = tr.id_provider AND id_prefix = " . $modelRate->id_prefix . " LIMIT 1) AS buyrate  FROM pkg_trunk_group_trunk t  JOIN pkg_trunk tr ON t.id_trunk = tr.id WHERE id_trunk_group = " . $modelRate->id_trunk_group . " ORDER BY buyrate IS NULL , buyrate ";
        }
        $agi->verbose($sql, 25);
        $modelTrunks = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);
        $agi->verbose($sql, 1);

        foreach ($modelTrunks as $key => $trunk) {
            $sql = "SELECT *, pkg_trunk.id id  FROM pkg_trunk JOIN pkg_provider ON id_provider = pkg_provider.id WHERE pkg_trunk.id = " . $trunk->id_trunk . " LIMIT 1";
            $agi->verbose($sql, 25);
            $modelTrunk = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            if ($modelTrunk->credit_control == 1 && $modelTrunk->credit <= 0) {
                $agi->verbose("Provider not have credit", 1);
                continue;
            }

            if ($modelTrunk->status == 0) {
                $agi->verbose("Trunk is inactive", 1);
                continue;
            }

            if (strlen($modelTrunk->link_sms) == 0) {
                $agi->verbose("Trunk not have sms link", 1);
                continue;
            }
            break;
        }

        //retiro e adiciono os prefixos do tronco
        if (strncmp($destination, $modelTrunk->removeprefix, strlen($modelTrunk->removeprefix)) == 0 || substr(strtoupper($modelTrunk->removeprefix), 0, 1) == 'X') {
            $destination = substr($destination, strlen($modelTrunk->removeprefix));
        }
        $destination = $modelTrunk->trunkprefix . $destination;

        $url = $modelTrunk->link_sms;
        $url = preg_replace("/\%number\%/", $destination, $url);
        $url = preg_replace("/\%text\%/", $text, $url);

        $agi->verbose($url);

        if (! $res = @file_get_contents($url, false)) {
            $agi->verbose("ERRO SMS -> " . $url);
        }

        $MAGNUS->uniqueid    = "$destination-" . date('His');
        $MAGNUS->destination = $destination;
        $MAGNUS->id_plan     = $MAGNUS->modelUser->id_plan;

        $CalcAgi->starttime        = date("Y-m-d H:i:s");
        $CalcAgi->sessiontime      = $CalcAgi->real_sessiontime      = 60;
        $CalcAgi->terminatecauseid = 1;
        $CalcAgi->sessionbill      = $modelRate->rateinitial;
        $CalcAgi->sipiax           = 6;
        $CalcAgi->buycost          = 0;
        $CalcAgi->id_prefix        = $modelRate->id_prefix;
        $CalcAgi->saveCDR($agi, $MAGNUS);
        $MAGNUS->hangup($agi, 34);
        exit;
    }
}
