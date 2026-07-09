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

// MassiveCall handles calls initiated by outbound campaigns or click-to-
// call actions.  It reads AGI variables set by the dialer application
// (TRUNK_ID, PHONENUMBER_ID, CAMPAIGN_ID, etc.), plays campaign audio or
// TTS, collects DTMF responses for authorization or polls, updates campaign
// reports, and ultimately forwards the call to a destination.  Billing is
// performed based on the result of the dial.
class MassiveCall
{
    // send: main entry point for massive calls.  This method:
    // 1. Answers the channel and updates campaign/phonenumber status.
    // 2. Determines which audio to play (pre-recorded or TTS).
    // 3. Optionally prompts for authorization DTMF or conducts a poll.
    // 4. Handles automatic machine detection and updates reports.
    // 5. After interacting with the caller, may route the call to a SIP
    //    account or other destination via SipCallAgi or DidAgi.
    // 6. Performs billing similarly to a standard call using CalcAgi.
    public static function send($agi, &$MAGNUS, &$CalcAgi)
    {

        require_once 'Tts.php';
        $uploaddir = $MAGNUS->magnusFilesDirectory . 'sounds/';

        $id_trunk              = $agi->get_variable("TRUNK_ID", true);
        $idPhonenumber         = $agi->get_variable("PHONENUMBER_ID", true);
        $phonenumberCity       = $agi->get_variable("PHONENUMBER_CITY", true);
        $idCampaign            = $agi->get_variable("CAMPAIGN_ID", true);
        $idRate                = $agi->get_variable("RATE_ID", true);
        $MAGNUS->id_user       = $agi->get_variable("IDUSER", true);
        $MAGNUS->username      = $MAGNUS->accountcode      = $agi->get_variable("USERNAME", true);
        $MAGNUS->id_agent      = $agi->get_variable("AGENT_ID", true);
        $MAGNUS->id_plan_agent = $agi->get_variable("AGENT_ID_PLAN", true);
        $MAGNUS->destination   = $destination   = $MAGNUS->dnid;

        $agi->answer();

        $sql = "UPDATE pkg_campaign_report SET status = 3 WHERE id_phonenumber = $idPhonenumber AND id_campaign = $idCampaign ORDER BY id DESC LIMIT 1";
        $agi->verbose($sql, 25);
        $agi->exec($sql);

        if ($agi->get_variable("STARTTIME", true) && $agi->get_variable("STARTTIME", true) > 1) {
            $now = $agi->get_variable("STARTTIME", true);
        } else {
            $now = time();
        }

        if ($MAGNUS->dnid == 'failed' || ! is_numeric($MAGNUS->dnid)) {
            $agi->verbose("Hangup becouse dnid is OutgoingSpoolFailed", 25);
            $MAGNUS->hangup($agi);
        }

        $sql = "SELECT *, pkg_campaign.id AS id, pkg_campaign.id_user AS id_user, pkg_campaign.description AS description, pkg_campaign.record_call AS record_call FROM pkg_campaign LEFT JOIN pkg_user ON pkg_campaign.id_user = pkg_user.id WHERE pkg_campaign.id = $idCampaign LIMIT 1";
        $agi->verbose($sql, 25);
        $modelCampaign = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (! isset($modelCampaign->id)) {
            $agi->verbose($idCampaign . ' campaing not exist');
            return;
        }
        $sql = "SELECT * FROM pkg_phonenumber WHERE id = $idPhonenumber LIMIT 1";
        $agi->verbose($sql, 25);
        $modelPhoneNumber = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        if (! isset($modelPhoneNumber->id)) {
            $agi->verbose($idPhonenumber . ' number not exist');
            exit;
        }

        if ($agi->get_variable("AMDSTATUS", true) && preg_match("/MACHINE/", $agi->get_variable("AMDSTATUS", true))) {
            $amd_status = $agi->get_variable("AMDSTATUS", true);
            $agi->verbose(date("Y-m-d H:i:s") . " => " . $MAGNUS->dnid . ': amd_status ' . $amd_status . ", hangup call", 5);

            $sql = "UPDATE pkg_campaign_report SET status = 4 WHERE id_phonenumber = $idPhonenumber AND id_campaign = $idCampaign ORDER BY id DESC LIMIT 1";
            $agi->verbose($sql, 25);
            $agi->exec($sql);

            $sql = "UPDATE pkg_phonenumber SET status = 5, info = '" . $agi->get_variable("AMDCAUSE", true) . "' WHERE id = $idPhonenumber LIMIT 1";
            $agi->verbose($sql, 25);
            $agi->exec($sql);
        } else {

            $sql = "UPDATE pkg_phonenumber SET status = 3 WHERE id = $idPhonenumber LIMIT 1";
            $agi->verbose($sql, 25);
            $agi->exec($sql);

            $forward_number = $modelCampaign->forward_number;

            if ($agi->get_variable("MBILLINGRESULT", true) && preg_match('/AGI\|FORWARD/', $agi->get_variable("MBILLINGRESULT", true))) {
                //massive call execute from app_mbilling and have redirect
                $res = explode('|', $agi->get_variable("MBILLINGRESULT", true));
                $agi->verbose(print_r($res, true));
                $now                = $res[2];
                $res_dtmf['result'] = $modelCampaign->digit_authorize;
            } elseif ($agi->get_variable("MBILLINGRESULT", true) && preg_match('/AGI\|POLL/', $agi->get_variable("MBILLINGRESULT", true))) {
                //massive call execute from app_mbilling and have poll
                $res = explode('|', $agi->get_variable("MBILLINGRESULT", true));
                $agi->verbose(print_r($res, true));
                $now                = $res[2];
                $res_dtmf['result'] = $res[3];

                /*VERIFICA SE CAMPAÃ‘A TEM ENCUESTA*/
                $sql = "SELECT * FROM pkg_campaign_poll WHERE id_campaign = $idCampaign";
                $agi->verbose($sql, 25);
                $modelCampaignPoll = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);
                $forward_number    = "";
            } else {

                /*VERIFICA SE CAMPAÃ‘A TEM ENCUESTA*/
                $sql = "SELECT * FROM pkg_campaign_poll WHERE id_campaign = $idCampaign";
                $agi->verbose($sql, 25);
                $modelCampaignPoll = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);

                if (isset($modelCampaign->audio_2) && strlen($modelPhoneNumber->name) > 3 && (strlen($modelCampaign->audio_2) > 5) || strlen($modelCampaign->tts_audio2) > 2) {
                    $agi->verbose('get phonenumber name from TTS', 10);
                    $tts  = true;
                    $file = $idPhonenumber . date("His");

                    $audio_name = Tts::create($MAGNUS, $agi, $modelPhoneNumber->name);
                }

                /*AUDIO FOR CAMPAIN*/
                if (strlen($modelCampaign->tts_audio) > 2) {

                    $file = 'campaign_' . MD5($modelCampaign->tts_audio);
                    if (file_exists('/tmp/' . $file . '.wav')) {
                        $agi->verbose('Audio already exist');
                        $audio = '/tmp/' . $file;
                    } else {
                        $agi->verbose('Get audio from TTS');
                        $audio = Tts::create($MAGNUS, $agi, $modelCampaign->tts_audio);
                    }
                } else {
                    $audio = $uploaddir . "idCampaign_" . $modelCampaign->id;
                }

                //If exist audio2 execute audio1
                if (isset($tts)) {
                    $agi->stream_file($audio, '#');
                } else {
                    // CHECK IF NEED AUTORIZATION FOR EXECUTE POLL OR IS EXISTE FORWARD NUMBER
                    if (strlen($forward_number) > 2 || (isset($modelCampaignPoll[0]->id) && $modelCampaignPoll[0]->request_authorize == 1)) {
                        $res_dtmf = $agi->get_data($audio, 5000, 1);
                    } else {
                        $agi->stream_file($audio, ' #');
                    }
                }

                //execute
                if (isset($tts)) {
                    $agi->stream_file($audio_name, ' #');
                }

                if (strlen($modelCampaign->audio_2) > 5 || strlen($modelCampaign->tts_audio2) > 2) {

                    /*Execute audio 2*/

                    if (strlen($modelCampaign->tts_audio2) > 2) {

                        $audio = Tts::create($MAGNUS, $agi, $modelCampaign->tts_audio2);
                    } else {
                        $audio = $uploaddir . "idCampaign_" . $idCampaign . "_2";
                    }

                    // CHECK IF NEED AUTORIZATION FOR EXECUTE POLL OR IS EXISTE FORWARD NUMBER
                    if (strlen($forward_number) > 2 || (isset($modelCampaignPoll[0]) && $modelCampaignPoll[0]->request_authorize == 1)) {
                        $res_dtmf = $agi->get_data($audio, 5000, 1);
                    } else {
                        $agi->stream_file($audio, ' #');
                    }
                }

                if (strlen($modelCampaign->asr_options)) {
                    //execute audio to ASR
                    for ($i = 0; $i < 4; $i++) {
                        $agi->execute('AGI speech-recog.agi,"pt-BR",2,,NOBEEP');
                        $textASR = $agi->get_variable("utterance", true);
                        $agi->verbose('O texto que você acabou de dizer: ' . $textASR);
                        if (strlen($textASR) < 1) {
                            $text  = "Desculpe não consegui te compreender. Vamos tentar novamente?";
                            $audio = Tts::create($MAGNUS, $agi, $text);

                            $agi->stream_file($audio, ' #');
                        } elseif (preg_match('/' . $modelCampaign->asr_options . '/', $textASR)) {

                            $text  = "Você disse. " . $textASR . ". Por favor aguarde.";
                            $audio = Tts::create($MAGNUS, $agi, $text);

                            $agi->stream_file($audio, ' #');

                            $res_dtmf['result'] = 1;
                            break;
                        } else {

                            $text  = "Você realmente não quer escutar o recado? Vamos tentar novamente?";
                            $audio = Tts::create($MAGNUS, $agi, $text);

                            $agi->stream_file($audio, ' #');
                        }
                    }
                }

                $agi->verbose('RESULT DTMF ' . $res_dtmf['result'], 25);

                //CHECK IF IS FORWARD EXTERNAL CALLL
                $agi->verbose("forward_number $forward_number , res_dtmf: " . $res_dtmf['result'] . ", digit_authorize: " . $modelCampaignPoll[0]->digit_authorize, 10);
            }

            //if have a forward                         if res_dtmf is equal the digit_authorize                OR press any digit and digit_authorize equal -2 (any digit)    OR  digit_authorize equal -3 (every)
            if (strlen($forward_number) > 2 && (($res_dtmf['result'] == $modelCampaign->digit_authorize) || ($res_dtmf['result'] >= 0 && strlen($res_dtmf['result']) > 0 && $modelCampaign->digit_authorize == -2) || $modelCampaign->digit_authorize == -3)) {
                $agi->verbose("have Forward number $forward_number");
                $sql = "UPDATE pkg_phonenumber SET info = 'Forward DTMF " . $res_dtmf['result'] . " at " . date('Y-m-d H:i:s') . "' WHERE id = $idPhonenumber LIMIT 1";
                $agi->verbose($sql, 25);
                $agi->exec($sql);

                $sql = "UPDATE pkg_campaign_report SET status = 7 WHERE id_phonenumber = $idPhonenumber AND id_campaign = $idCampaign ORDER BY id DESC LIMIT 1";
                $agi->verbose($sql, 25);
                $agi->exec($sql);

                $chanStatus = $agi->channel_status($MAGNUS->channel);
                if ($chanStatus['result'] == 6) {

                    $MAGNUS->record_call = $modelCampaign->record_call;
                    $agi->set_variable("RECORD_CALL_DID", $MAGNUS->record_call);

                    $forwardOption     = explode("|", $forward_number);
                    $forwardOptionType = $forwardOption[0];

                    $agi->verbose(print_r($forwardOption, true), 15);

                    if ($forwardOptionType == 'sip') {

                        $sql = "SELECT name FROM pkg_sip WHERE id = $forwardOption[1] LIMIT 1";
                        $agi->verbose($sql, 25);
                        $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                        $dialstr = 'SIP/' . $modelSip->name;

                        $MAGNUS->startRecordCall($agi);

                        $agi->set_variable("CALLERID(num)", $destination);
                        $agi->set_variable("CALLERID(name)", $modelPhoneNumber->name);
                        $MAGNUS->CallerID = $destination;

                        $myres      = $MAGNUS->run_dial($agi, $dialstr, $MAGNUS->agiconfig['dialcommand_param_sipiax_friend']);
                        $dialstatus = $agi->get_variable("DIALSTATUS");
                        $dialstatus = $dialstatus['data'];

                        if ($dialstatus == "NOANSWER") {
                            $agi->stream_file('prepaid-callfollowme', '#');
                        } elseif (($dialstatus == "BUSY" || $dialstatus == "CHANUNAVAIL") || ($dialstatus == "CONGESTION")) {
                            $agi->stream_file('prepaid-isbusy', '#');
                        }
                    } elseif ($forwardOptionType == 'queue') {

                        $DidAgi                                  = new DidAgi();
                        $DidAgi->modelDestination[0]['id_queue'] = $forwardOption[1];
                        $DidAgi->modelDid->did                   = $destination;

                        $agi->set_variable("CALLERID(num)", $destination);
                        $agi->set_variable("CALLERID(name)", $modelPhoneNumber->name);
                        $MAGNUS->CallerID = $destination;

                        QueueAgi::callQueue($agi, $MAGNUS, $CalcAgi, $DidAgi, 'torpedo');
                    } elseif ($forwardOptionType == 'ivr') {

                        $DidAgi                                = new DidAgi();
                        $DidAgi->modelDestination[0]['id_ivr'] = $forwardOption[1];
                        $DidAgi->modelDid->did                 = $destination;

                        $agi->set_variable("CALLERID(num)", $destination);
                        $agi->set_variable("CALLERID(name)", $modelPhoneNumber->name);
                        $MAGNUS->CallerID = $destination;

                        IvrAgi::callIvr($agi, $MAGNUS, $CalcAgi, $DidAgi, 'torpedo_' . $modelPhoneNumber->id);
                    } elseif ($forwardOptionType == 'group') {

                        $agi->verbose("Call group " . $forwardOption[1], 25);
                        $sql = "SELECT name FROM pkg_sip WHERE `sip_group` = '" . $forwardOption[1] . "'";
                        $agi->verbose($sql, 25);
                        $modelSip = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);

                        if (isset($modelSip[0]) == 0) {
                            $agi->verbose('GROUP NOT FOUND');
                            $agi->stream_file('prepaid-invalid-digits', '#');
                        } else {
                            $group = '';
                            foreach ($modelSip as $key => $value) {
                                $group .= "SIP/" . $value->name . "&";
                            }

                            $dialstr = substr($group, 0, -1);
                            $agi->verbose("DIAL $dialstr", 25);
                            $MAGNUS->run_dial($agi, $dialstr, $MAGNUS->agiconfig['dialcommand_param_sipiax_friend']);
                        }
                    } elseif ($forwardOptionType == 'custom') {
                        $agi->set_variable("CALLERID(num)", $destination);
                        $agi->set_variable("CALLERID(name)", $modelPhoneNumber->name);
                        $MAGNUS->CallerID = $destination;

                        if (preg_match('/^http/', $forwardOption[1])) {

                            $url = preg_replace("/\%number\%/", $destination, $forwardOption[1]);
                            $url = preg_replace("/\%name\%/", $modelPhoneNumber->name, $url);

                            if (preg_match('/POST/', $url)) {
                                $url = explode('?', $url);
                                exec(" curl -k -X POST  -d '" . $url[1] . "' " . $url[0] . "");
                            } else {
                                file_get_contents($url);
                            }
                        } else if (preg_match('/AGI/', $forwardOption[1])) {
                            $agi = explode("|", $forwardOption[1]);
                            $agi->exec_agi($agi[1] . ",$destination,$idCampaign,$idPhonenumber");
                        } else if (strtoupper($forwardOption[1]) == 'SMS') {

                            $text = $modelCampaign->description;
                            $text = preg_replace("/\%name\%/", $modelPhoneNumber->name, $text);
                            $text = addslashes((string) $text);
                            //CODIFICA O TESTO DO SMS
                            $text = urlencode($text);

                            $sql = "SELECT pkg_rate.id AS idRate, rateinitial, pkg_prefix.id AS id_prefix, id_trunk_group, id_trunk_group, pkg_trunk_group.type AS trunk_group_type
                            FROM pkg_rate
                            LEFT JOIN pkg_plan ON pkg_rate.id_plan=pkg_plan.id
                            LEFT JOIN pkg_prefix ON pkg_rate.id_prefix=pkg_prefix.id
                            LEFT JOIN pkg_trunk_group ON pkg_trunk_group.id = pkg_rate.id_trunk_group
                            WHERE prefix = SUBSTRING(999$destination,1,length(prefix)) and pkg_plan.id= " . $modelCampaign->id_plan . "
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
                        } else {
                            $MAGNUS->run_dial($agi, $forwardOption[1]);
                        }
                    }

                    $agi->set_variable("CALLERID(num)", $destination);
                    $agi->set_variable("CALLERID(name)", $modelPhoneNumber->name);
                    $MAGNUS->CallerID = $destination;

                    if ($MAGNUS->record_call == 1) {
                        $myres = $agi->execute("StopMixMonitor");
                    }
                }
            } else if (is_numeric($res_dtmf['result'])) {
                $sql = "UPDATE pkg_campaign_report SET status = 4 WHERE id_phonenumber = $idPhonenumber AND id_campaign = $idCampaign ORDER BY id DESC LIMIT 1";
                $agi->verbose($sql, 25);
                $agi->exec($sql);
            } else {
                $MAGNUS->sip_account = $MAGNUS->username;
            }

            //execute poll if exist
            if (isset($modelCampaignPoll[0])) {

                foreach ($modelCampaignPoll as $poll) {

                    if (isset($execute_poll_name)) {
                        $poll = $execute_poll_name;
                        unset($execute_poll_name);
                    }

                    $repeat = $poll->repeat;

                    if ($dtmf_result == -1) {
                        break;
                    }
                    sleep(1);
                    $dtmf_result == '';

                    if ($poll->id == 18 && $dtmf_result > 0) {
                        continue;
                    }

                    if ($poll->id == 20 && $dtmf_result > 0) {
                        continue;
                    }

                    for ($i = 0; $i < 12; $i++) {

                        $audio = $uploaddir . "idPoll_" . $poll->id;

                        $agi->verbose("audio: $audio", 5);
                        if ($poll->request_authorize == 1) {
                            $agi->verbose('Request authorize', 5);
                            //IF CUSTOMER MARK 1 EXECUTE POLL
                            if ($res_dtmf['result'] == $modelCampaignPoll[0]->digit_authorize) {
                                $agi->verbose('Authorized', 5);
                                $res_dtmf = $agi->get_data($audio, 5000, 1);
                            } else {
                                $dtmf_result = -1;
                                $agi->verbose('NOT authorized', 5);
                                break;
                            }
                        } else {

                            $agi->verbose("poll->option10: $poll->option10", 5);

                            if (strlen($poll->option10)) {

                                if (preg_match('/\#/', $poll->option10)) {
                                    $digit_timeout = preg_split('/\#/', $poll->option10);

                                    $agi->verbose(print_r($digit_timeout, true), 5);
                                    $digit_timeout = end($digit_timeout);
                                } else {
                                    $digit_timeout = strlen($poll->option10);
                                }

                                $res_dtmf = $agi->get_data($audio, strlen($poll->option10) * 2000, $digit_timeout);
                            } else {
                                $res_dtmf = $agi->get_data($audio, 5000, 1);
                            }
                        }

                        //GET RESULT OF POLL
                        $dtmf_result = $res_dtmf['result'];

                        $agi->verbose("Cliente votou na opcao: $dtmf_result", 5);

                        $sql = "SELECT * FROM pkg_campaign_poll WHERE name = '" . $poll->{'option' . $dtmf_result} . "' AND id_campaign = $idCampaign";
                        $agi->verbose($sql, 25);
                        $poll2 = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);

                        if (isset($poll2[0]->id)) {
                            //execute other poll
                            $fields = "id_campaign_poll,resposta,number,city,resposta_text";
                            $values = "'$poll->id', '$dtmf_result', '$destination', '$phonenumberCity','" . strtok($poll->{'option' . $dtmf_result}, '#') . "'";
                            $sql    = "INSERT INTO pkg_campaign_poll_info ($fields) VALUES ($values)";
                            $agi->verbose($sql, 25);
                            $agi->exec($sql);

                            $execute_poll_name = $poll2[0];
                            continue;
                        }

                        //Hungaup call if the fisrt poll dtmf is not numeric
                        if ($i == 0 && ! is_numeric($dtmf_result)) {
                            $agi->verbose('nao votou nada na 1º enquete', 5);
                            break;
                        }

                        if ($repeat > 0) {
                            for ($i = 0; $i < $repeat; $i++) {

                                if ($i > 0) {
                                    $agi->stream_file('prepaid-invalid-digits', ' #');

                                    $res_dtmf = $agi->get_data($audio, 5000, 1);

                                    //GET RESULT OF POLL
                                    $dtmf_result = $res_dtmf['result'];
                                }

                                if ($i == 2) {
                                    $agi->verbose('Client press invalid option after two try');
                                    $dtmf_result = 'error';
                                    break;
                                }

                                if (is_numeric($dtmf_result) && $dtmf_result >= 0 ) {
                                    $agi->verbose("dtmf_result es numerico ", 8);

                                    $sql = "SELECT option" . $dtmf_result . " as resposta_option FROM pkg_campaign_poll WHERE id = $poll->id LIMIT 1";
                                    $agi->verbose($sql, 25);
                                    $modelCampaignPoll = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                                    $agi->verbose('$i' . $i . " " . $repeat, 25);
                                    if ($modelCampaignPoll->resposta_option == '' && $i >= $repeat - 1) {
                                        $agi->verbose("Client press invalid option after try $repeat, hangup call on poll " . $poll->id);
                                        $agi->stream_file('prepaid-invalid-digits', ' #');
                                        $dtmf_result = 'error';
                                        break;
                                    } else if ($modelCampaignPoll->resposta_option == '') {
                                        $agi->verbose("Client press invalid option $dtmf_result on poll " . $poll->id, 8);
                                    } else {
                                        $agi->verbose("Client press number: $dtmf_result", 8);
                                        break;
                                    }
                                }
                            }
                        }

                        if ($modelCampaignPoll->resposta_option != 'repeat') {
                            break;
                        }
                    }

                    if (is_numeric($dtmf_result) && $dtmf_result >= 0) {

                        if (preg_match('/play_/', $poll->{'option' . $dtmf_result})) {

                            preg_match_all('/play_(.*)\#/', $poll->{'option' . $dtmf_result}, $play_audio);

                            if (isset($play_audio[1][0])) {
                                $agi->stream_file($play_audio[1][0], ' #');
                            }
                        }

                        if (preg_match('/^http/', $poll->{'option' . $dtmf_result})) {

                            $agi->verbose('chamar API', 25);

                            $url = preg_replace("/\%number\%/", $destination, $poll->{'option' . $dtmf_result});
                            $url = preg_replace("/\%name\%/", $modelPhoneNumber->name, $url);
                            if (preg_match('/JSON/', $url)) {
                                $url2  = explode('?', $url);
                                $parts = parse_url($url);
                                parse_str($parts['query'], $query);
                                $data = json_encode($query);
                                exec(" curl -k -X POST  -d '" . $data . "' " . $url2[0] . "");
                            } else if (preg_match('/POST/', $url)) {
                                $url = explode('?', $url);
                                exec(" curl -k -X POST  -d '" . $url[1] . "' " . $url[0] . "");
                            } else {
                                file_get_contents($url);
                            }

                            $sql = "INSERT INTO pkg_campaign_poll_info (id_campaign_poll,resposta,number,city ) VALUES
                             (  $poll->id, '$dtmf_result', '$destination', '$phonenumberCity') ";
                            $agi->verbose($sql, 25);
                            $agi->exec($sql);

                            break;
                        }
                        //si esta hangup en la opcion, corlgar.
                        else if ($poll->{'option' . $dtmf_result} == 'hangup') {

                            $agi->verbose('desligar chamadas', 25);

                            $newIdPoll = explode('_', $poll->{'option' . $dtmf_result});

                            //si tiene una id en el hangup, executar el audio
                            if (isset($newIdPoll[1])) {
                                $audio    = $uploaddir . "idPoll_" . $newIdPoll[1];
                                $res_dtmf = $agi->get_data($audio, 5000, 1);
                            }

                            $sql = "INSERT INTO pkg_campaign_poll_info (id_campaign_poll,resposta,number,city ) VALUES
                             (  $poll->id, '$dtmf_result', '$destination', '$phonenumberCity') ";
                            $agi->verbose($sql, 25);
                            $agi->exec($sql);

                            break;
                        } elseif (preg_match('/create/', $poll->{'option' . $dtmf_result})) {

                            $sql = "SELECT * FROM pkg_plan WHERE signup = 1 LIMIT 1";
                            $agi->verbose($sql, 25);
                            $modelPlan = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                            if (isset($modelPlan->id)) {

                                $id_plan = $modelPlan->id;
                                $credit  = $modelPlan->ini_credit;
                                $sql     = "SELECT * FROM pkg_group_user WHERE id_user_type = 3 LIMIT 1";
                                $agi->verbose($sql, 25);
                                $modelGroupUser  = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                                $id_group        = $modelGroupUser->id;
                                $password        = Util::generatePassword(8, true, true, true, false);
                                $callingcard_pin = Util::getNewLock_pin($agi);
                                $prefix_local    = $MAGNUS->config['global']['base_language'] == 'pt_BR'
                                    ? '0/55,*/5511/8,*/5511/9'
                                    : '';
                                $fields = "username,password,id_user,id_plan,credit,id_group,active,prefix_local,callingcard_pin,loginkey,typepaid";
                                $values = "'$destination', '$password', '1', '$id_plan', '$credit', '$id_group',
                                    '1', '$prefix_local', '$callingcard_pin', '', 0";
                                $sql = "INSERT INTO pkg_user ($fields) VALUES ($values)";
                                $agi->verbose($sql, 25);
                                if ($agi->exec($sql)) {

                                    $fields = "id_user,accountcode,name,allow,host,insecure,defaultuser,secret";
                                    $values = "'" . $agi->lastInsertId() . "', '$destination', '$destination',
                                            'g729,gsm,g726,alaw,ulaw', 'dynamic', 'no',
                                            '$destination', '$password'";
                                    $sql = "INSERT INTO pkg_user ($fields) VALUES ($values)";
                                    $agi->verbose($sql, 25);
                                    $agi->exec($sql);
                                }
                            } else {
                                $agi->verbose('NOT HAVE PLAN ENABLE ON SIGNUP', 25);
                            }
                        } else {

                            $fields = "id_campaign_poll,resposta,number,city,resposta_text";
                            $values = "'$poll->id', '$dtmf_result', '$destination', '$phonenumberCity','" . strtok($poll->{'option' . $dtmf_result}, '#') . "'";
                            $sql    = "INSERT INTO pkg_campaign_poll_info ($fields) VALUES ($values)";
                            $agi->verbose($sql, 25);
                            $agi->exec($sql);

                            if (preg_match('/SIP|sip/', $poll->{'option' . $res_dtmf['result']})) {
                                $MAGNUS->destination = $destination;
                                $MAGNUS->startRecordCall($agi);

                                $dialstr = $poll->{'option' . $res_dtmf['result']};
                                $dialstr = preg_replace("/number/", $destination, $dialstr);
                                $agi->set_variable("CALLERID(num)", $destination . ' ' . $modelPhoneNumber->name);
                                $agi->set_callerid($destination . ' ' . $modelPhoneNumber->name);
                                $MAGNUS->CallerID = $destination . ' ' . $modelPhoneNumber->name;
                                $agi->verbose('CALL SEND TO SIP IN POLL -> ' . $dialstr, 25);

                                $myres = $MAGNUS->run_dial($agi, $dialstr, $MAGNUS->agiconfig['dialcommand_param_sipiax_friend']);

                                $MAGNUS->stopRecordCall($agi);
                            }
                        }

                        if (preg_match('/hangup/', $poll->{'option' . $dtmf_result})) {
                            break;
                        }
                    } else {
                        $agi->verbose('Cliente no marco nada', 8);
                        break;
                    }
                }

                $agi->stream_file('prepaid-final', ' #');
            }
        }
        $sql = "SELECT * FROM pkg_rate WHERE id = $idRate LIMIT 1";
        $agi->verbose($sql, 25);
        $modelRate = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (! isset($modelRate->id)) {
            return;
        }

        $max_len_prefix = strlen($MAGNUS->destination);
        $prefixclause   = '(';
        while ($max_len_prefix >= 1) {
            $prefixclause .= "prefix='" . substr($MAGNUS->destination, 0, $max_len_prefix) . "' OR ";
            $max_len_prefix--;
        }

        $prefixclause = substr($prefixclause, 0, -3) . ")";

        $sql = "SELECT * FROM pkg_rate_provider t  JOIN pkg_prefix p ON t.id_prefix = p.id WHERE " .
            "id_provider = ( SELECT id_provider FROM pkg_trunk WHERE id = " . $id_trunk . ") AND " . $prefixclause .
            "ORDER BY LENGTH( prefix ) DESC LIMIT 1";
        $agi->verbose($sql, 25);
        $modelRateProvider = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);

        /*buy rate*/
        if (isset($modelRateProvider[0]->id)) {
            $buyrate          = $modelRateProvider[0]->buyrate;
            $buyrateinitblock = $modelRateProvider[0]->buyrateinitblock;
            $buyrateincrement = $modelRateProvider[0]->buyrateincrement;
            $minimal_time_buy = $modelRateProvider[0]->minimal_time_buy;
        } else {
            $buyrate = 0;
        }

        $id_prefix = $modelRate->id_prefix;

        /*sell rate*/
        $rateinitial         = $modelRate->rateinitial;
        $initblock           = $modelRate->initblock;
        $billingblock        = $modelRate->billingblock;
        $minimal_time_charge = $modelRate->minimal_time_charge;

        $duration = $real_sessiontime = time() - $now;

        /*recondeo call*/
        if ($MAGNUS->config["global"]['bloc_time_call'] == 1 && $duration > 0) {
            $initblock    = ($initblock < 1) ? 1 : $initblock;
            $billingblock = ($billingblock < 1) ? 1 : $billingblock;

            if ($duration > $initblock) {
                $restominutos   = $duration % $billingblock;
                $calculaminutos = ($duration - $restominutos) / $billingblock;
                if ($restominutos > '0') {
                    $calculaminutos++;
                }
                $duration = $calculaminutos * $billingblock;
            } elseif ($duration < '1') {
                $duration = 0;
            } else {
                $duration = $initblock;
            }
        }

        /* ####     CALCUL BUYRATE COST     #####*/
        if ($real_sessiontime > $minimal_time_buy) {
            $buyratecost = $MAGNUS->calculation_price($buyrate, $real_sessiontime, $buyrateinitblock, $buyrateincrement);
        } else {
            $buyratecost = 0;
        }
        if ($real_sessiontime > $minimal_time_charge) {
            $sellratecost = $MAGNUS->calculation_price($rateinitial, $duration, $initblock, $billingblock);
        } else {
            $sellratecost = 0;
        }

        $agi->verbose("[TEMPO DA LIGAÃ‡AO] " . $duration, 8);

        $MAGNUS->id_plan = $modelRate->id_plan;
        if ($duration > 1) {

            if (isset($modelCampaign->enable_max_call) && $modelCampaign->enable_max_call == 1 && $duration >= $modelCampaign->nb_callmade) {
                //desativa a campanha se o limite de chamadas foi alcançado
                //diminui 1 do total de chamadas permitidas completas , se o tempo da chamada for superior ao tempo do audio
                $status = $modelCampaign->secondusedreal < 1 ? 0 : 1;
                $sql    = "UPDATE pkg_campaign SET status = $status, secondusedreal = secondusedreal -1
                        WHERE id = $modelCampaign->id LIMIT 1";
                $agi->verbose($sql, 25);
                $agi->exec($sql);
            }

            if (! is_null($MAGNUS->id_agent) && $MAGNUS->id_agent > 1) {
                $sql = "SELECT rateinitial, initblock, billingblock, minimal_time_charge, package_offer " .
                    "FROM pkg_plan " .
                    "LEFT JOIN pkg_rate_agent ON pkg_rate_agent.id_plan=pkg_plan.id " .
                    "LEFT JOIN pkg_prefix ON pkg_rate_agent.id_prefix=pkg_prefix.id " .
                    "WHERE $prefixclause AND " .
                    "pkg_plan.id= $MAGNUS->id_plan_agent ORDER BY LENGTH(prefix) DESC LIMIT 3";
                $agi->verbose($sql, 25);
                $MAGNUS->modelRateAgent = $agi->query($sql)->fetchAll(PDO::FETCH_ASSOC);

                $result[0]['package_offer'] = $MAGNUS->modelRateAgent[0]['package_offer'];
                $CalcAgi->agent_bill        = $CalcAgi->updateSystemAgent($agi, $MAGNUS, $destination, $sellratecost, $duration);
            }

            $CalcAgi->starttime        = date("Y-m-d H:i:s", time() - $duration);
            $CalcAgi->sessiontime      = $duration;
            $CalcAgi->real_sessiontime = intval($real_sessiontime);
            $MAGNUS->destination       = $destination;
            $CalcAgi->terminatecauseid = 1;
            $CalcAgi->sessionbill      = $sellratecost;
            $MAGNUS->id_trunk          = $id_trunk;
            $CalcAgi->sipiax           = 5;
            $CalcAgi->buycost          = $buyratecost;
            $CalcAgi->id_prefix        = $id_prefix;
            $CalcAgi->id_campaign      = $idCampaign;
            $MAGNUS->CallerID          = intval($destination);

            $id_call = $CalcAgi->saveCDR($agi, $MAGNUS, true);
        }

        $MAGNUS->hangup($agi);
    }
}
