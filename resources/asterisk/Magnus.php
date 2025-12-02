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
class Magnus
{
    public $config;
    public $agiconfig;
    public $idconfig = 1;
    public $agentUsername;
    public $CallerID;
    public $channel;
    public $uniqueid;
    public $accountcode;
    public $dnid;
    public $extension;
    public $destination;
    public $credit;
    public $id_plan;
    public $active;
    public $currency = 'usd';
    public $mode     = '';
    public $timeout;
    public $tech;
    public $prefix;
    public $username;
    public $typepaid          = 0;
    public $removeinterprefix = 1;
    public $restriction       = 1;
    public $restriction_use   = 1;
    public $redial;
    public $enableexpire;
    public $expirationdate;
    public $expiredays;
    public $creationdate;
    public $creditlimit = 0;
    public $id_user;
    public $countryCode;
    public $add_credit;
    public $dialstatus_rev_list;
    public $callshop;
    public $id_plan_agent;
    public $id_offer;
    public $record_call;
    public $mix_monitor_format = 'gsm';
    public $prefix_local;
    public $id_agent;
    public $portabilidade       = false;
    public $portabilidadeMobile = false;
    public $portabilidadeFixed  = false;
    public $play_audio          = false;
    public $language;
    public $sip_account;
    public $user_calllimit = 0;
    public $modelUser      = [];
    public $modelSip       = [];
    public $modelUserAgent = [];
    public $demo           = false;
    public $voicemail;
    public $magnusFilesDirectory = '/usr/local/src/magnus/';
    public $tariff_limit         = 1;
    public $prefixclause;
    public $is_callingcard     = false;
    public $sip_id_trunk_group = 0;
    public $modelRateAgent;

    public function __construct()
    {
        $this->dialstatus_rev_list = Magnus::getDialStatus_Revert_List();
    }

    public function init()
    {
        $this->destination = '';
    }

    /*  load_conf */
    public function load_conf(&$agi, $config = null, $webui = 0, $idconfig = 1, $optconfig = [])
    {
        $this->idconfig = 1;
        $sql            = "SELECT id, config_key , config_value , config_group_title  FROM pkg_configuration";
        $agi->verbose($sql, 25);
        $modelConfig = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);
        foreach ($modelConfig as $key => $conf) {
            $this->config[$conf->config_group_title][$conf->config_key] = $conf->config_value;
        }

        foreach ($modelConfig as $var => $val) {
            $this->config["agi-conf$idconfig"][$var] = $val;
        }

        $this->agiconfig = $this->config["agi-conf$idconfig"];

        return true;
    }

    public function get_agi_request_parameter($agi)
    {
        $this->accountcode = $agi->request['agi_accountcode'];
        $this->dnid        = $agi->request['agi_extension'];

        $this->CallerID = $agi->request['agi_callerid'];
        $this->channel  = $agi->request['agi_channel'];
        $this->uniqueid = $agi->request['agi_uniqueid'];

        $this->lastapp = isset($agi->request['agi_lastapp']) ? $agi->request['agi_lastapp'] : null;

        if (preg_match('/^Local\//', $this->channel) && strlen($this->accountcode) < 4) {
            $sql = "SELECT * FROM pkg_sip WHERE name = '$this->dnid' LIMIT 1";
            $agi->verbose($sql, 25);
            $modelSip          = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            $this->accountcode = $modelSip->accountcode;
        }
        $account           = explode("/", $this->channel);
        $this->sip_account = substr($account[1], 0, strrpos($account[1], '-'));

        $pos_lt = strpos($this->CallerID, '<');
        $pos_gt = strpos($this->CallerID, '>');
        if (($pos_lt !== false) && ($pos_gt !== false)) {
            $len_gt         = $pos_gt - $pos_lt - 1;
            $this->CallerID = substr($this->CallerID, $pos_lt + 1, $len_gt);
        }
    }

    public function calculation_price($buyrate, $duration, $initblock, $increment)
    {

        $ratecallduration = $duration;
        $buyratecost      = 0;
        if ($ratecallduration < $initblock) {
            $ratecallduration = $initblock;
        }

        if (($increment > 0) && ($ratecallduration > $initblock)) {
            $mod_sec = $ratecallduration % $increment;
            if ($mod_sec > 0) {
                $ratecallduration += ($increment - $mod_sec);
            }
        }
        $ratecost = ($ratecallduration / 60) * $buyrate;
        $ratecost = $ratecost;
        return $ratecost;
    }
    //hangup($agi);
    public function hangup(&$agi, $code = '')
    {
        /*
        1 =  SIP/2.0 404 Not Found.
        16 = SIP/2.0 603 Declined.
        17 = SIP/2.0 486 Busy here.
        18 = SIP/2.0 408 Request Timeout.
        19 = SIP/2.0 480 Temporarily unavailable.
        21 = SIP/2.0 403 Forbidden
        22 = SIP/2.0 410 Gone.
        27 = SIP/2.0 502 Bad Gateway.
        28 = SIP/2.0 484 Address incomplete.
        29 = SIP/2.0 501 Not Implemented.
        34 = SIP/2.0 503 Service Unavailable.
        38 = SIP/2.0 500 Server internal failure
        41 = SIP/2.0 603 Declined.
        58 = SIP/2.0 488 Not Acceptable Here.
        127 = SIP/2.0 500 Network error.
         */
        $agi->verbose('Hangup Call ' . $this->destination . ' Username ' . $this->username, 6);

        if ($code == '') {
            $code = $agi->get_variable("HANGUPCAUSE", true);
        }
        $agi->execute("HANGUP $code");

        exit;
    }

    public static function getDialStatus_Revert_List()
    {
        $dialstatus_rev_list                = [];
        $dialstatus_rev_list["ANSWER"]      = 1;
        $dialstatus_rev_list["BUSY"]        = 2;
        $dialstatus_rev_list["NOANSWER"]    = 3;
        $dialstatus_rev_list["CANCEL"]      = 4;
        $dialstatus_rev_list["CONGESTION"]  = 5;
        $dialstatus_rev_list["CHANUNAVAIL"] = 6;
        $dialstatus_rev_list["DONTCALL"]    = 7;
        $dialstatus_rev_list["TORTURE"]     = 8;
        $dialstatus_rev_list["INVALIDARGS"] = 9;
        return $dialstatus_rev_list;
    }

    public function checkNumber($agi, &$CalcAgi, $try_num, $call2did = false)
    {
        $res               = 0;
        $prompt_enter_dest = 'prepaid-enter-dest';
        $msg               = "use_dnid:" . $this->agiconfig['use_dnid'] . " && len_dnid:(" . strlen($this->dnid) . " || len_exten:" . strlen($this->extension) . " ) && (try_num:$try_num)";
        $agi->verbose($msg, 15);

        if (($this->agiconfig['use_dnid'] == 1) && $try_num == 0) {
            if ($this->extension == 's') {
                $this->destination = $this->dnid;
            } else {
                $this->destination = $this->extension;
            }
            $agi->verbose("USE_DNID DESTINATION -> " . $this->destination, 10);
        } else {
            $agi->verbose('Request the destination number' . $prompt_enter_dest, 25);
            $res_dtmf = $agi->get_data($prompt_enter_dest, 10000, 20);
            $agi->verbose("RES DTMF -> " . $res_dtmf["result"], 10);
            $this->destination    = $res_dtmf["result"];
            $this->dnid           = $res_dtmf["result"];
            $this->is_callingcard = true;
        }

        if ($this->dnid == '*150') {
            $agi->verbose("SAY BALANCE : $this->credit ", 10);
            $this->credit = number_format($this->credit, 2);
            $this->sayBalance($agi, $this->credit);

            $prompt = "prepaid-final";
            $agi->verbose($prompt, 10);
            $agi->stream_file($prompt, '#');
            $this->hangup($agi);
        }
        if ($this->dnid == '*160') {
            $sql = "SELECT sessionbill, sessiontime  FROM pkg_cdr WHERE id_user = $this->id_user ORDER BY starttime DESC ";
            $agi->verbose($sql, 25);
            $modelCall = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelCall->sessionbill)) {
                $agi->verbose("SAY PRICE LAST CALL : " . $modelCall->sessionbill, 1);
                $this->sayLastCall($agi, $modelCall->sessionbill, $modelCall->sessiontime);
            }
            $agi->stream_file('prepaid-final', '#');

            $this->hangup($agi);
        }

        $this->destination = preg_replace('/\#|\*|\-|\.|\(|\)/', '', $this->destination);
        $this->dnid        = preg_replace('/\#|\*|\-|\.|\(|\)/', '', $this->dnid);

        if ($this->destination <= 0) {
            $prompt = "prepaid-invalid-digits";
            $agi->verbose($prompt, 3);
            if (is_numeric($this->destination)) {
                $agi->answer();
            }

            $agi->stream_file($prompt, '#');
            $this->hangup($agi);
        }

        if ($this->removeinterprefix) {
            $this->destination = substr($this->destination, 0, 2) == '00' ? substr($this->destination, 2) : $this->destination;
            $agi->verbose("REMOVE INTERNACIONAL PREFIX -> " . $this->destination, 10);
        }

        $this->number_translation($agi, $this->destination);

        $this->checkRestrictPhoneNumber($agi);

        $agi->verbose("USERNAME=" . $this->username . " DESTINATION=" . $this->destination . " PLAN=" . $this->id_plan . " CREDIT=" . $this->credit, 6);

        $agi->destination = $this->destination;
        /*call funtion for search rates*/
        $searchTariff = new SearchTariff();
        $resfindrate  = $searchTariff->find($this, $agi);

        $CalcAgi->tariffObj = $resfindrate;

        if ($resfindrate == 0) {
            $agi->verbose("The number $this->destination, no exist in the plan $this->id_plan", 3);
            $this->executePlayAudio("prepaid-dest-unreachable", $agi);
            if ($this->agiconfig['number_try'] > 1 && ($this->agiconfig['number_try'] > $try_num + 1)) {
                $try_num++;
                $this->checkNumber($agi, $CalcAgi, $try_num);
            }
            return false;
        }

        /* CHECKING THE TIMEOUT*/
        $res_all_calcultimeout = $CalcAgi->calculateAllTimeout($this, $agi);

        if ($this->id_agent > 1) {
            $agi->verbose("Check reseller credit -> " . $this->id_agent, 20);
            $sql = "SELECT credit, creditlimit FROM pkg_user WHERE id = $this->id_agent LIMIT 1";
            $agi->verbose($sql, 25);
            $modelAgendCredit = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelAgendCredit->credit) && $modelAgendCredit->credit + $modelAgendCredit->creditlimit < 0) {
                $this->executePlayAudio("prepaid-no-enough-credit", $agi);
                return false;
            }
        }

        if (! $res_all_calcultimeout) {
            $this->executePlayAudio("prepaid-no-enough-credit", $agi);
            return false;
        }

        /* calculate timeout*/
        $this->timeout = $CalcAgi->tariffObj[0]['timeout'];
        $timeout       = $this->timeout;
        $agi->verbose("timeout ->> $timeout", 15);
        $this->say_time_call($agi, $timeout, $CalcAgi->tariffObj[0]['rateinitial']);

        return true;
    }

    public function say_time_call($agi, $timeout, $rate = 0)
    {
        $minutes = intval($timeout / 60);
        $seconds = $timeout % 60;
        if ($this->agiconfig['say_rateinitial'] == 1) {
            $this->sayRate($agi, $rate);
        }

        if ($this->agiconfig['say_timetocall'] == 1) {
            $agi->stream_file('prepaid-you-have', '#');
            if ($minutes > 0) {
                if ($minutes == 1) {
                    $agi->say_number($minutes);
                    $agi->stream_file('prepaid-minute', '#');
                } else {
                    $agi->say_number($minutes);
                    $agi->stream_file('prepaid-minutes', '#');
                }
            }
            if ($seconds > 0) {
                if ($minutes > 0) {
                    $agi->stream_file('vm-and', '#');
                }

                if ($seconds == 1) {
                    $agi->say_number($seconds);
                    $agi->stream_file('prepaid-second', '#');
                } else {
                    $agi->stream_file('prepaid-seconds', '#');
                }
            }
        }
    }

    public function sayBalance($agi, $credit, $fromvoucher = 0)
    {

        $mycur = 1;

        $credit_cur = $credit / $mycur;

        list($units, $cents) = explode('.', $credit_cur);

        if ($credit > 1) {
            $unit_audio = "credit";
        } else {
            $unit_audio = "credits";
        }

        $cents_audio = "prepaid-cents";

        switch ($cents_audio) {
            case 'prepaid-pence':
                $cent_audio = 'prepaid-penny';
                break;
            default:
                $cent_audio = substr($cents_audio, 0, -1);
        }

        /* say 'you have x dollars and x cents'*/
        if ($fromvoucher != 1) {
            $agi->stream_file('prepaid-you-have', '#');
        } else {
            $agi->stream_file('prepaid-account_refill', '#');
        }

        if ($units == 0 && $cents == 0) {
            $agi->say_number(0);
            $agi->stream_file($unit_audio, '#');
        } else {
            if ($units > 1) {
                $agi->say_number($units);
                $agi->stream_file($unit_audio, '#');
            } else {
                $agi->say_number($units);
                $agi->stream_file($unit_audio, '#');
            }

            if ($units > 0 && $cents > 0) {
                $agi->stream_file('vm-and', '#');
            }
            if ($cents > 0) {
                $agi->say_number($cents);
                if ($cents > 1) {
                    $agi->stream_file($cents_audio, '#');
                } else {
                    $agi->stream_file($cent_audio, '#');
                }
            }
        }
    }

    public function sayLastCall($agi, $rate, $time = 0)
    {
        $rate  = preg_replace("/\./", "z", $rate);
        $array = str_split($rate);
        $agi->stream_file('prepaid-cost-call', '#');
        for ($i = 0; $i < strlen($rate); $i++) {
            if ($array[$i] == 'z') {
                $agi->stream_file('prepaid-point', '#');
                $cents = true;
            } else {
                $agi->say_number($array[$i]);
            }
        }
        if ($cents) {
            $agi->stream_file('prepaid-cents', '#');
        }

        if ($time > 0) {
            $agi->say_number($time);
            $agi->stream_file('prepaid-seconds', '#');
        }
    }

    public function sayRate($agi, $rate)
    {
        $rate = 0.008;

        $mycur      = 1;
        $credit_cur = $rate / $mycur;

        list($units, $cents) = explode('.', $credit_cur);

        if (substr($cents, 2) > 0) {
            $point = substr($cents, 2);
        }

        if (strlen($cents) > 2) {
            $cents = substr($cents, 0, 2);
        }

        if ($units == '') {
            $units = 0;
        }

        if ($cents == '') {
            $cents = 0;
        }

        if ($point == '') {
            $point = 0;
        } elseif (strlen($cents) == 1) {
            $cents .= '0';
        }

        if ($rate > 1) {
            $unit_audio = "credit";
        } else {
            $unit_audio = "credits";
        }

        $cent_audio  = 'prepaid-cent';
        $cents_audio = 'prepaid-cents';

        /* say 'the cost of the call is '*/
        $agi->stream_file('prepaid-cost-call', '#');
        $this->agiconfig['play_rate_cents_if_lower_one'] = 1;
        if ($units == 0 && $cents == 0 && $this->agiconfig['play_rate_cents_if_lower_one'] == 0 && ! ($this->agiconfig['play_rate_cents_if_lower_one'] == 1 && $point == 0)) {
            $agi->say_number(0);
            $agi->stream_file($unit_audio, '#');
        } else {
            if ($units >= 1) {
                $agi->say_number($units);
                $agi->stream_file($unit_audio, '#');
            } elseif ($this->agiconfig['play_rate_cents_if_lower_one'] == 0) {
                $agi->say_number($units);
                $agi->stream_file($unit_audio, '#');
            }

            if ($units > 0 && $cents > 0) {
                $agi->stream_file('vm-and', '#');
            }
            if ($cents > 0 || ($point > 0 && $this->agiconfig['play_rate_cents_if_lower_one'] == 1)) {

                sleep(2);
                $agi->say_number($cents);
                if ($point > 0) {
                    $agi->stream_file('prepaid-point', '#');
                    $agi->say_number($point);
                }
                if ($cents > 1) {
                    $agi->stream_file($cents_audio, '#');
                } else {
                    $agi->stream_file($cent_audio, '#');
                }
            }
        }
    }

    public function checkDaysPackage($agi, $startday, $billingtype)
    {
        if ($billingtype == 0) {
            /* PROCESSING FOR MONTHLY*/
            /* if > last day of the month*/
            if ($startday > date("t")) {
                $startday = date("t");
            }

            if ($startday <= 0) {
                $startday = 1;
            }

            /* Check if the startday is upper that the current day*/
            if ($startday > date("j")) {
                $year_month = date('Y-m', strtotime('-1 month'));
            } else {
                $year_month = date('Y-m');
            }

            $yearmonth   = sprintf("%s-%02d", $year_month, $startday);
            $CLAUSE_DATE = " TIMESTAMP(date_consumption) >= TIMESTAMP('$yearmonth')";
        } else {

            /* PROCESSING FOR WEEKLY*/
            $startday  = $startday % 7;
            $dayofweek = date("w");
            /* Numeric representation of the day of the week 0 (for Sunday) through 6 (for Saturday)*/
            if ($dayofweek == 0) {
                $dayofweek = 7;
            }

            if ($dayofweek < $startday) {
                $dayofweek = $dayofweek + 7;
            }

            $diffday     = $dayofweek - $startday;
            $CLAUSE_DATE = "date_consumption >= DATE_SUB(CURRENT_DATE, INTERVAL $diffday DAY) ";
        }

        return $CLAUSE_DATE;
    }

    public function freeCallUsed($agi, $id_user, $id_offer, $billingtype, $startday)
    {

        $CLAUSE_DATE = $this->checkDaysPackage($agi, $startday, $billingtype);
        $sql         = "SELECT  COUNT(*) AS status FROM pkg_offer_cdr " . "WHERE $CLAUSE_DATE AND id_user = '$id_user' AND id_offer = '$id_offer' LIMIT 1";
        $agi->verbose($sql, 25);
        $modelOfferCdr = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        return isset($modelOfferCdr->status) ? $modelOfferCdr->status : 0;
    }

    public function packageUsedSeconds($agi, $id_user, $id_offer, $billingtype, $startday)
    {
        $CLAUSE_DATE = $this->checkDaysPackage($agi, $startday, $billingtype);
        $sql         = "SELECT sum(used_secondes) AS used_secondes FROM pkg_offer_cdr " . "WHERE $CLAUSE_DATE AND id_user = '$this->id_user' AND id_offer = '$id_offer' ";
        $agi->verbose($sql, 25);
        $modelOfferCdr = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        return isset($modelOfferCdr->used_secondes) ? $modelOfferCdr->used_secondes : 0;
    }

    public function check_expirationdate_customer($agi)
    {
        $prompt = '';
        if ($this->modelUser->enableexpire == 1 && $this->expirationdate != '00000000000000' && strlen($this->modelUser->expirationdate) > 5) {

            /* expire date */
            if (intval(strtotime($this->modelUser->expirationdate) - time()) < 0) {
                $agi->verbose('User expired => ' . $this->modelUser->expirationdate);
                $prompt = "prepaid-card-expired";
                $sql    = "UPDATE pkg_user SET active = 0 WHERE id = " . $this->id_user;
                $agi->verbose($sql, 25);
                $agi->exec($sql);
            }
        }
        return $prompt;
    }

    public function run_dial($agi, $dialstr, $dialparams = "", $trunk_directmedia = 'no', $timeout = 3600, $max_long = 2147483647)
    {

        $dialparams = str_replace("%timeout%", min($timeout * 1000, $max_long), $dialparams);

        if ($this->modelSip->directmedia == 'yes' && $trunk_directmedia == 'yes') {
            $agi->verbose("DIRECT MEDIA ACTIVE", 10);
            $dialparams = preg_replace("/L\(.*\)/", "", $dialparams);
        }

        $dialparams = preg_replace("/Rr|rR/", "", $dialparams);

        if ($this->modelSip->ringfalse == '1') {
            $dialparams .= 'Rr';
        }

        if ($this->is_callingcard == true) {
            $dialparams .= 'U(trunk_answer_handler)';
        }

        if (strlen($MAGNUS->modelSip->addparameter)) {
            $dialparams .= $MAGNUS->modelSip->addparameter;
        }

        if ($MAGNUS->$demo == true) {
            $agi->answer();
            sleep(20);
        }
        $agi->verbose("DIAL $dialstr" . $dialparams, 25);
        return $agi->execute("DIAL $dialstr" . $dialparams);
    }

    public function number_translation($agi, $destination)
    {
        #match / replace / if match length
        $regexs = preg_split("/,/", $this->prefix_local);

        foreach ($regexs as $key => $regex) {

            $regra   = preg_split('/\//', $regex);
            $grab    = $regra[0];
            $replace = isset($regra[1]) ? $regra[1] : '';
            $digit   = isset($regra[2]) ? $regra[2] : '';

            $agi->verbose("Grab :$grab Replacement: $replace Phone Before: $destination", 25);

            $number_prefix = substr($destination, 0, strlen($grab));

            if (count($regra) == 2) {
                if ($number_prefix == $grab) {
                    $destination = preg_replace('/^' . $grab . '/', $replace, $destination);
                    break;
                }
            } else if (strlen($destination) == $digit) {
                if ($grab == '*' && strlen($destination) == $digit) {
                    $destination = $replace . $destination;
                    break;
                } else if ($number_prefix == $grab) {
                    $destination = $replace . substr($destination, strlen($grab));
                    break;
                }
            }
        }

        $agi->verbose("Phone After translation: $destination", 10);
        $this->destination = PortabilidadeAgi::getDestination($agi, $this, $destination);
    }

    public function round_precision($number)
    {
        $PRECISION = 6;
        return round($number, $PRECISION);
    }

    public function executePlayAudio($prompt, $agi)
    {
        if (strlen($prompt) > 0) {
            if ($this->play_audio == 1) {
                $agi->verbose($prompt, 3);
                $agi->answer();
                $agi->stream_file($prompt, '#');
            }
        }
    }

    public function checkRestrictPhoneNumber($agi, $type = 'outbound')
    {

        if ($type == 'outbound') {
            if ($this->restriction_use == 1 || $this->restriction == 2) {
                $destination = $this->destination;
            } elseif ($this->restriction_use == 2) {
                $destination = $this->CallerID;
            }
        } else {
            $destination = $this->CallerID;
        }

        $destination = preg_replace('/\+|\#|\*|\-|\.|\(|\)/', '', $destination);

        $direction = $type == 'outbound' ? 1 : 2;

        if ($type == 'outbound' && $this->modelSip->block_call_reg != '') {

            if (preg_match("/" . $this->modelSip->block_call_reg . "/", $destination)) {
                $agi->verbose("NUMBER NOT AUHTORIZED - NOT ALLOW TO CALL BY REGEX SIP ACCOUNT " . $this->sip_account, 1);
                if ($this->play_audio == 1) {
                    $agi->answer();
                    $agi->stream_file('prepaid-dest-unreachable', '#');
                } else {
                    $agi->execute((congestion), Congestion);
                }
                $this->hangup($agi);
            }
        }
        if ($this->restriction == 1 || $this->restriction == 2 || $type == 'did') {
            /*Check if Account have restriction*/

            if ($this->restriction == 1 && $this->restriction_use == 3 && $type == 'outbound') {
                $sql = "SELECT id FROM pkg_restrict_phone WHERE  direction = " . $direction . " AND id_user = $this->id_user AND (number = SUBSTRING('" . $this->destination . "',1,length(number))  OR number = SUBSTRING('" . $this->CallerID . "',1,length(number))  ) ORDER BY LENGTH(number) DESC";
            } else {
                $sql = "SELECT id FROM pkg_restrict_phone WHERE  direction = " . $direction . " AND id_user = $this->id_user AND number = SUBSTRING('" . $destination . "',1,length(number)) ORDER BY LENGTH(number) DESC";
            }
            $agi->verbose($sql, 25);
            $modelRestrictedPhonenumber = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            $agi->verbose("RESTRICTED NUMBERS ", 15);

            $sql =  "SELECT id FROM pkg_restrict_phone WHERE direction IN(3,4) AND (id_user = '" . $this->id_user . "' OR id_user = '1')  AND number = SUBSTRING('" . $this->CallerID . "',1,length(number)) ORDER BY LENGTH(number) DESC";
            $agi->verbose($sql, 25);
            $modelRestrictedPhonenumberCallerid = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelRestrictedPhonenumberCallerid->id)) {
                $agi->verbose("CALLERID NOT AUHTORIZED - NOT ALLOW TO CALL RESTRICTED NUMBERS", 1);
                if ($this->play_audio == 1) {
                    $agi->answer();
                    $agi->stream_file('prepaid-dest-unreachable', '#');
                } else {
                    $agi->execute((congestion), Congestion);
                }
                $this->hangup($agi);
            }


            if ($this->restriction == 1) {
                /* NOT ALLOW TO CALL RESTRICTED NUMBERS*/
                if (isset($modelRestrictedPhonenumber->id)) {
                    /* NUMBER NOT AUHTORIZED*/
                    $agi->verbose("NUMBER NOT AUHTORIZED - NOT ALLOW TO CALL RESTRICTED NUMBERS", 1);
                    if ($this->play_audio == 1) {
                        $agi->answer();
                        $agi->stream_file('prepaid-dest-unreachable', '#');
                    } else {
                        $agi->execute((congestion), Congestion);
                    }
                    $this->hangup($agi);
                }
            } else if ($this->restriction == 2) {
                /* ALLOW TO CALL ONLY RESTRICTED NUMBERS */
                if (! isset($modelRestrictedPhonenumber->id)) {
                    /*NUMBER NOT AUHTORIZED*/
                    $agi->verbose("NUMBER NOT AUHTORIZED - ALLOW TO CALL ONLY RESTRICTED NUMBERS", 1);
                    if ($this->play_audio == 1) {
                        $agi->answer();
                        $agi->stream_file('prepaid-dest-unreachable', '#');
                    } else {
                        $agi->execute((congestion), Congestion);
                    }
                    $this->hangup($agi);
                }
            }
        }
    }

    public function startRecordCall(&$agi, $addicional = '', $isDid = false)
    {
        if ($this->record_call == 1 || $this->config['global']['global_record_calls'] == 1) {

            if ($isDid == true) {
                $command_mixmonitor = "MixMonitor /var/spool/asterisk/monitor/$this->accountcode/{$addicional}-{$this->CallerID}.{$this->uniqueid}." . $this->mix_monitor_format . ",b";
            } else {
                $command_mixmonitor = "MixMonitor /var/spool/asterisk/monitor/$this->accountcode/{$this->sip_account}-{$this->destination}{$addicional}.{$this->uniqueid}." . $this->mix_monitor_format . ",b";
            }
            $agi->execute($command_mixmonitor);
            $agi->verbose($command_mixmonitor, 6);
        }
    }

    public function stopRecordCall(&$agi)
    {
        if ($this->record_call == 1 || $this->config['global']['global_record_calls'] == 1) {
            $agi->verbose("EXEC StopMixMonitor (" . $this->uniqueid . ")", 6);
            $agi->execute("StopMixMonitor");
        }
    }

    public function executeVoiceMail($agi, $dialstatus, $answeredtime)
    {
        if ($this->voicemail == 1) {
            if ($dialstatus == "BUSY") {
                $answeredtime = 0;
                $agi->answer();
                $agi->execute('VoiceMail ' . $this->destination . "@billing,b");
            } elseif ($dialstatus == "NOANSWER") {
                $answeredtime = 0;
                $agi->answer();
                $agi->execute('VoiceMail ' . $this->destination . "@billing");
            } elseif ($dialstatus == "CANCEL") {
                $answeredtime = 0;
            }
            if (($dialstatus == "CHANUNAVAIL") || ($dialstatus == "CONGESTION")) {
                $agi->verbose("CHANNEL UNAVAILABLE - GOTO VOICEMAIL ($this->destination)", 6);
                $agi->answer();
                $agi->execute('VoiceMail ' . $this->destination . '@billing,u');
            }
        }
        return $answeredtime;
    }

    public function roudRatePrice($sessiontime, $sell, $initblock, $billingblock)
    {
        if ($sessiontime < $initblock) {
            $sessiontime = $initblock;
        }
        $billingblock = $billingblock > 0 ? $billingblock : 1;

        if ($sessiontime > $initblock) {
            $mod_sec = $sessiontime % $billingblock;
            if ($mod_sec > 0) {
                $sessiontime += ($billingblock - $mod_sec);
            }
        }
        return ($sessiontime / 60) * $sell;
    }
    public function checkIVRSchedule($monFri, $sat, $sun)
    {
        $weekDay = date('D');

        switch ($weekDay) {
            case 'Sun':
                $weekDay = $sun;
                break;
            case 'Sat':
                $weekDay = $sat;
                break;
            default:
                $weekDay = $monFri;
                break;
        }

        $hours   = date('H');
        $minutes = date('i');
        $now     = ($hours * 60) + $minutes;

        $intervals = preg_split("/\|/", $weekDay);

        foreach ($intervals as $key => $interval) {
            $hours = explode('-', $interval);

            $start = $hours[0];
            $end   = $hours[1];

            #convert start hour to minutes
            $hourInterval = explode(':', $start);
            $starthour    = $hourInterval[0] * 60;
            $start        = $starthour + $hourInterval[1];

            #convert end hour to minutes
            $hourInterval = explode(':', $end);
            $starthour    = $hourInterval[0] * 60;
            $end          = $starthour + $hourInterval[1];

            if ($now >= $start && $now <= $end) {
                return "open";
            }
        }
        return "closed";
    }

    public function getNewUsername($agi)
    {
        $existsUsername = true;

        $generate_username = $this->config['global']['username_generate'];
        $agi->verbose('getNewUsername ' . $generate_username);
        if ($generate_username == 1) {
            $length = $this->config['global']['generate_length'] == 0 ? 5 : $this->config['global']['generate_length'];
            $prefix = $this->config['global']['generate_prefix'] == '0' ? '' : $this->config['global']['generate_prefix'];
            while ($existsUsername) {
                $randUserName = $prefix . $this->generatePassword($length, false, false, true, false) . "\n";

                $sql = "SELECT count(*) FROM pkg_user WHERE username = '" . $randUserName . "' LIMIT 1";
                $agi->verbose($sql, 25);
                $countUsername  = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                $existsUsername = ($countUsername->count > 0);
            }
        } else {

            while ($existsUsername) {
                $randUserName = mt_rand(10000, 99999);
                $sql          = "SELECT count(*) as count FROM pkg_user WHERE username = '" . $randUserName . "' LIMIT 1";
                $agi->verbose($sql, 25);
                $countUsername  = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                $existsUsername = ($countUsername->count > 0);
            }
        }
        return trim($randUserName);
    }

    public function generatePassword($tamanho, $maiuscula, $minuscula, $numeros, $codigos)
    {
        $maius = "ABCDEFGHIJKLMNOPQRSTUWXYZ";
        $minus = "abcdefghijklmnopqrstuwxyz";
        $numer = "123456789";
        $codig = '!@#%';

        $base = '';
        $base .= ($maiuscula) ? $maius : '';
        $base .= ($minuscula) ? $minus : '';
        $base .= ($numeros) ? $numer : '';
        $base .= ($codigos) ? $codig : '';

        srand((float) microtime() * 10000000);
        $password = '';
        for ($i = 0; $i < $tamanho; $i++) {
            $password .= substr($base, rand(0, strlen($base) - 1), 1);
        }

        return $password;
    }
}
