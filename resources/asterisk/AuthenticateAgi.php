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

class AuthenticateAgi
{
    public static function authenticateUser($agi, $MAGNUS)
    {
        $agi->verbose('AuthenticateUser ' . $MAGNUS->accountcode, 15);
        $authentication = false;

        /* TRY WITH THE CALLERID AUTHENTICATION*/
        $authentication = AuthenticateAgi::callerIdAuthenticate($MAGNUS, $agi, $authentication);

        //AUTHENTICATION VIA TECHPREFIX
        $authentication = AuthenticateAgi::techPrefixAuthenticate($MAGNUS, $agi, $authentication);

        /*TRY WITH THE ACCOUNTCODE AUTHENTICATION*/
        $authentication = AuthenticateAgi::accountcodeAuthenticate($MAGNUS, $agi, $authentication);

        /*TRY WITH THE SIPPROXY AUTHENTICATION*/
        $authentication = AuthenticateAgi::sipProxyAuthenticate($MAGNUS, $agi, $authentication);

        /* AUTHENTICATE BY PIN */
        $authentication = AuthenticateAgi::callingCardAuthenticate($MAGNUS, $agi, $authentication);

        $authentication = AuthenticateAgi::checkIfCallShopCall($MAGNUS, $agi, $authentication);

        if ($authentication == false || $MAGNUS->active == 0 || $MAGNUS->active == 2) {
            $prompt = "prepaid-auth-fail";
            //force the audio to play
            $MAGNUS->play_audio = true;
        } else {
            $prompt = $MAGNUS->check_expirationdate_customer($agi);
        }

        if (strlen($prompt) > 0) {
            $MAGNUS->executePlayAudio($prompt, $agi);
            $MAGNUS->hangup($agi);
        }

        AuthenticateAgi::checkUserCallLimit($MAGNUS, $agi);

        AuthenticateAgi::checkPlanTechPrefix($MAGNUS, $agi);

        AuthenticateAgi::checkPlanIntraInter($MAGNUS, $agi);

        AuthenticateAgi::checkIfIsAgent($MAGNUS, $agi);

        if (isset($agi->username)) {
            $agi->username = $MAGNUS->username;
        }

        $agi->set_variable('CHANNEL(language)', $MAGNUS->language);

        return $authentication;
    }

    public static function callerIdAuthenticate(&$MAGNUS, &$agi, $authentication)
    {
        if ($authentication == false && $MAGNUS->agiconfig['cid_enable'] == 1 && is_numeric($MAGNUS->CallerID) && $MAGNUS->CallerID > 0) {
            $agi->verbose('Try callerID authentication ' . $MAGNUS->CallerID, 15);
            $sql = "SELECT * FROM pkg_callerid WHERE cid = '$MAGNUS->CallerID' AND activated = 1 LIMIT 1";
            $agi->verbose($sql, 25);
            $modelCallerid = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            if (isset($modelCallerid->id)) {
                $sql = "SELECT *, u.id id, u.id_user id_user FROM pkg_user u INNER JOIN pkg_plan p ON u.id_plan = p.id WHERE u.id = '$modelCallerid->id_user' LIMIT 1";
                $agi->verbose($sql, 25);
                $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                $sql       = "SELECT * FROM pkg_sip  WHERE id_user = '$modelUser->id' LIMIT 1";
                $agi->verbose($sql, 25);
                $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                $MAGNUS->sip_account = $modelSip->name;

                AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $modelUser, $modelSip);

                $agi->verbose("AUTHENTICATION BY CALLERID:" . $MAGNUS->CallerID, 6);
                $authentication = true;
            }
        }
        return $authentication;
    }

    public static function techPrefixAuthenticate(&$MAGNUS, &$agi, $authentication)
    {

        $tech = substr($MAGNUS->dnid, 0, $MAGNUS->config['global']['ip_tech_length']);
        $sql  = "SELECT * FROM pkg_sip WHERE techprefix = '$tech' AND host != 'dynamic' LIMIT 1";
        $agi->verbose($sql, 25);
        $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if ($authentication != true && isset($modelSip->id)) {

            $agi->verbose('Try accountcode + techprefix authentication ' . $tech, 15);

            $from = $agi->get_variable("SIP_HEADER(Contact)", true);

            $from = explode('@', $from);
            $from = explode('>', $from[1]);
            $from = explode(':', $from[0]);
            $from = $from[0];

            if ($modelSip->host == $from) {

                $sql = "SELECT *, u.id id, u.id_user id_user FROM pkg_user u INNER JOIN pkg_plan p ON u.id_plan = p.id WHERE u.id =  $modelSip->id_user LIMIT 1";
                $agi->verbose($sql, 25);
                $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $modelUser, $modelSip);
                $MAGNUS->sip_account = $modelSip->name;
                $MAGNUS->dnid        = substr($MAGNUS->dnid, $MAGNUS->config['global']['ip_tech_length']);
                $agi->verbose("AUTHENTICATION BY TECHPREFIX $tech_prefix - Username: " . $MAGNUS->username . '  ' . $MAGNUS->dnid, 6);
                $authentication = true;
            }
        }

        return $authentication;
    }

    public static function accountcodeAuthenticate(&$MAGNUS, &$agi, $authentication)
    {
        if (strlen($MAGNUS->accountcode) >= 1 && $authentication != true) {
            $agi->verbose('Try accountcode authentication ' . $MAGNUS->accountcode, 15);
            $sql = "SELECT *, u.id id, u.id_user id_user FROM pkg_user u INNER JOIN pkg_plan p ON u.id_plan = p.id WHERE username = '$MAGNUS->accountcode'  LIMIT 1";
            $agi->verbose($sql, 25);
            $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            if (isset($modelUser->id)) {
                AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $modelUser);
                $agi->verbose("AUTHENTICATION BY ACCOUNTCODE:" . $MAGNUS->username, 6);
                $authentication = true;
            }
        }
        return $authentication;
    }

    public static function sipProxyAuthenticate(&$MAGNUS, &$agi, $authentication)
    {
        if ($authentication != true && ! filter_var($agi->get_variable("SIP_HEADER(X-AUTH-IP)", true), FILTER_VALIDATE_IP) === false) {
            $agi->verbose("TRY Authentication via Proxy ");
            $agi->verbose($agi->get_variable("SIP_HEADER(P-Accountcode)", true), 1);
            $proxyServer = explode("@", $agi->get_variable("SIP_HEADER(to)", true));
            $proxyServer = isset($proxyServer[1]) ? substr($proxyServer[1], 0, -1) : '';

            $sql = "SELECT id FROM pkg_servers WHERE host = '$proxyServer'  LIMIT 1";
            $agi->verbose($sql, 25);
            $modelServers = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            if (isset($modelServers->id)) {
                if ($agi->get_variable("SIP_HEADER(P-Accountcode)", true) == '<null>') {

                    $sql = "SELECT * FROM pkg_sip WHERE host = '" . $agi->get_variable("SIP_HEADER(X-AUTH-IP)", true) . "'  LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                    if (isset($modelSip->id)) {
                        $sql = "SELECT *, u.id id, u.id_user id_user FROM pkg_user u INNER JOIN pkg_plan p ON u.id_plan = p.id WHERE id = '$modelSip->id_user' LIMIT 1";
                        $agi->verbose($sql, 25);
                        $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                        AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $modelUser, $modelSip);
                        $authentication = true;
                        $agi->verbose("AUTHENTICATION BY X-AUTH-IP header (" . $agi->get_variable("SIP_HEADER(X-AUTH-IP)", true) . "), accountcode" . $MAGNUS->accountcode);
                    }
                } else {
                    $MAGNUS->accountcode = $agi->get_variable("SIP_HEADER(P-Accountcode)", true);
                    $sql                 = "SELECT *, u.id id, u.id_user id_user FROM pkg_user u INNER JOIN pkg_plan p ON u.id_plan = p.id WHERE username = '$MAGNUS->accountcode' LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                    if (isset($modelUser->id)) {
                        AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $modelUser);
                        $authentication = true;
                        $agi->verbose("AUTHENTICATION BY P-Accountcode header " . $MAGNUS->accountcode);

                    }
                }
            } else {
                $agi->verbose("Try send call with X-AUTH-IP, BUT IS INVALID ", $proxyServer, 1);
            }
        }
        return $authentication;
    }

    public static function pinAuthenticate(&$MAGNUS, &$agi, $authentication, $pin)
    {

        $agi->verbose('Try pin authentication ' . $pin, 15);
        $sql = "SELECT *, u.id id, u.id_user id_user FROM pkg_user u INNER JOIN pkg_plan p ON u.id_plan = p.id WHERE callingcard_pin = '$pin' LIMIT 1";
        $agi->verbose($sql, 25);
        $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

        if (isset($modelUser->id)) {
            AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $modelUser);
            $agi->verbose("AUTHENTICATION BY PIN:" . $pin, 6);
            $authentication = true;
        }

        return $authentication;
    }

    public static function voucherAuthenticate(&$MAGNUS, &$agi, $authentication, $pin)
    {
        $agi->verbose("Check voucher Number $pin");
        //check if the PIN is a valid voucher
        $sql = "SELECT * FROM pkg_voucher WHERE voucher = '$pin' AND used = 0 LIMIT 1";
        $agi->verbose($sql, 25);
        $modelVoucher = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        if (isset($modelVoucher->id)) {
            $agi->verbose("Found valid voucher Number $pin");
            $fields = "id_user, username, id_group, id_plan, password, credit,
                        active, callingcard_pin, callshop, plan_day, boleto_day, language, prefix_local";

            $user = $MAGNUS->getNewUsername($agi);
            $pass = $MAGNUS->generatePassword(8, true, true, true, false);

            $values = "1,'" . $user . "', 3,'" . $modelVoucher->id_plan . "',
                    '" . $pass . "', '" . $modelVoucher->credit . "',
                    1, '" . $modelVoucher->voucher . "', 0, 0,0, '" . $modelVoucher->language . "',
                    '" . $modelVoucher->prefix_local . "'";

            $sql = "INSERT INTO pkg_user ($fields) VALUES ($values)";
            $agi->verbose($sql, 25);
            $agi->exec($sql);
            $MAGNUS->id_user = $agi->lastInsertId();

            //Marca o voucher como usado
            $sql = "UPDATE pkg_voucher SET id_user = $MAGNUS->id_user, usedate = NOW(), used = 1 WHERE voucher = '$pin' LIMIT 1";
            $agi->verbose($sql, 25);
            $agi->exec($sql);

            $values = "" . $MAGNUS->id_user . ",'" . $modelVoucher->credit . "','Voucher " . $modelVoucher->voucher . ". Old credit " . $modelUser->credit . "',1";
            $sql    = "INSERT INTO pkg_refill (id_user,credit,description,payment) VALUES ($values)";
            $agi->verbose($sql, 25);
            $agi->exec($sql);

            $sql = "SELECT *, u.id id, u.id_user id_user FROM pkg_user u INNER JOIN pkg_plan p ON u.id_plan = p.id WHERE u.id = $MAGNUS->id_user LIMIT 1";
            $agi->verbose($sql, 25);
            $modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            AuthenticateAgi::setMagnusAttrubutes($MAGNUS, $agi, $modelUser);
            $authentication = true;
        }
        return $authentication;
    }

    public static function callingCardAuthenticate(&$MAGNUS, &$agi, $authentication)
    {
        if ($authentication != true) {
            $agi->verbose('try callingcard', 6);

            if ($MAGNUS->config['global']['enable_callingcard'] == 1) {

                for ($retries = 0; $retries < 3; $retries++) {
                    $agi->answer();

                    if (($retries > 0) && (strlen($prompt) > 0)) {
                        $agi->verbose($prompt, 3);
                        $agi->stream_file($prompt, '#');
                    }
                    if ($res < 0) {
                        $res = -1;
                        break;
                    }

                    $res      = 0;
                    $res_dtmf = $agi->get_data('prepaid-enter-pin-number', 6000, 6);

                    $agi->verbose('PIN callingcard ' . $res_dtmf["result"], 20);

                    $pin = $res_dtmf["result"];

                    if ( ! isset($pin) || strlen($pin) == 0) {
                        $prompt = "prepaid-no-card-entered";
                        $agi->verbose('No user entered', 6);
                        continue;
                    }

                    if (strlen($pin) > 6 || strlen($pin) < 6) {
                        $agi->verbose($prompt, 6);
                        $prompt = "prepaid-invalid-digits";
                        continue;
                    }

                    $authentication = AuthenticateAgi::pinAuthenticate($MAGNUS, $agi, $authentication, $pin);

                    if ($authentication == true) {
                        break;
                    } else {

                        $authentication = AuthenticateAgi::voucherAuthenticate($MAGNUS, $agi, $authentication, $pin);

                        if ($authentication == true) {
                            break;
                        } else {
                            $prompt = "prepaid-auth-fail";
                            continue;
                        }
                    }
                }
            } else {
                $MAGNUS->hangup($agi);
            }
        }
        return $authentication;
    }

    public static function checkPlanIntraInter(&$MAGNUS, $agi)
    {
        if ($MAGNUS->config['global']['intra-inter'] == '1') {
            $agi->verbose(substr($MAGNUS->modelSip->callerid, 0, 4) . "  " . substr($MAGNUS->dnid, 0, 4), 30);

            //if user callerId is equal the fist 4 digits of dialnumber, it is a intra call
            if (substr($MAGNUS->modelSip->callerid, 0, 4) == substr($MAGNUS->dnid, 0, 4)) {
                $sql = "SELECT name FROM pkg_plan WHERE id = " . $MAGNUS->id_plan . "  LIMIT 1";
                $agi->verbose($sql, 25);
                $modelPlan = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                $sql = "SELECT * FROM pkg_plan WHERE name = '" . $modelPlan->name . " Intra'  LIMIT 1";
                $agi->verbose($sql, 25);
                $modelPlan = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                if (isset($modelPlan->id)) {
                    //if found plan with Intra in the name, change the plan
                    $agi->verbose("INTRA PLAN FOUND AND CHANGED \$MAGNUS->id_plan to " . $modelPlan->name, 5);
                    $MAGNUS->id_plan = $modelPlan->id;
                }
            }
        }
    }

    public static function checkIfIsAgent(&$MAGNUS, $agi)
    {
        /*check if user is a agent user*/
        if ( ! is_null($MAGNUS->id_agent) && $MAGNUS->id_agent > 1) {
            $MAGNUS->id_plan_agent = $MAGNUS->id_plan;
            $sql                   = "SELECT * FROM pkg_user WHERE id =" . $MAGNUS->id_agent . " LIMIT 1";
            $agi->verbose($sql, 25);
            $MAGNUS->modelUserAgent = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            $MAGNUS->id_plan       = $MAGNUS->modelUserAgent->id_plan;
            $MAGNUS->agentUsername = $MAGNUS->modelUserAgent->username;

            $agi->verbose("Reseller id_Plan $MAGNUS->id_plan_agent, user id_plan $MAGNUS->id_plan", 6);
        }
    }

    public static function checkPlanTechPrefix(&$MAGNUS, &$agi)
    {
        if (strlen($MAGNUS->dnid) > 13) {
            //tech prefix to route
            $sql = "SELECT id,portabilidadeFixed,portabilidadeMobile FROM pkg_plan WHERE techprefix = '" . substr($MAGNUS->dnid, 0, 5) . "'  LIMIT 1";
            $agi->verbose($sql, 25);
            $modelPlan = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            if (isset($modelPlan->id)) {
                $MAGNUS->id_plan = $modelPlan->id;
                $MAGNUS->dnid    = substr($MAGNUS->dnid, 5);
                $agi->verbose("Changed plan via TechPrefix: Plan used $MAGNUS->id_plan - Number: $MAGNUS->dnid ", 15);
                $MAGNUS->portabilidadeMobile = $modelPlan->portabilidadeMobile;
                $MAGNUS->portabilidadeFixed  = $modelPlan->portabilidadeFixed;
            }
        }
    }

    public static function checkUserCallLimit(&$MAGNUS, &$agi)
    {
        if ($MAGNUS->user_calllimit == 0) {
            $agi->verbose("Send Congestion user call limit", 3);

            if ($MAGNUS->modelUser->calllimit_error == 403) {
                $agi->execute((busy), busy);
            } else {
                $agi->execute((congestion), Congestion);
            }

            $MAGNUS->hangup($agi);

        } elseif ($MAGNUS->mode == 'standard' && $MAGNUS->user_calllimit >= 0) {
            //check user call limit
            $agi->verbose('check user call limit', 5);

            $asmanager = new AGI_AsteriskManager();
            $asmanager->connect('localhost', 'magnus', 'magnussolution');

            $channelsData = $asmanager->command("core show channels concise");
            $channelsData = explode("\n", $channelsData["data"]);
            $asmanager->disconnect();
            $sql = "SELECT name FROM pkg_sip WHERE accountcode = '" . $MAGNUS->username . "'";
            $agi->verbose($sql, 25);
            $modelSip    = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);
            $sipAccounts = '';
            foreach ($modelSip as $key => $sip) {
                $sipAccounts .= $sip->name . '|';
            }

            $sipAccounts = substr($sipAccounts, 0, -1);
            $calls       = 0;
            foreach ($channelsData as $key => $line) {
                if (preg_match("/^SIP\/($sipAccounts)-.*(Ring|Up)/", $line) && ! preg_match("/Outgoing Line/", $line)) {
                    $calls++;
                }
            }
            if ($calls > $MAGNUS->user_calllimit) {
                $agi->verbose("Send Congestion user call limit", 3);

                if ($MAGNUS->modelUser->calllimit_error == 403) {
                    $agi->execute((busy), busy);
                } else {
                    $agi->execute((congestion), Congestion);
                }

                $MAGNUS->hangup($agi);
            }

        }
    }

    public static function checkIfCallShopCall(&$MAGNUS, &$agi, $authentication)
    {
        //verfica se é cliente de callshop, e se a cabina esta ativa
        if ($MAGNUS->callshop == 1) {
            $sql = "SELECT * FROM pkg_sip WHERE name = '$MAGNUS->sip_account'  LIMIT 1";
            $agi->verbose($sql, 25);
            $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

            if (isset($modelSip->status) && $modelSip->status == 0) {
                $agi->verbose("CABINA DISABLED " . $MAGNUS->sip_account, 3);
                $authentication = false;
            }
        }

        return $authentication;
    }

    public static function setMagnusAttrubutes(&$MAGNUS, &$agi, $model, $modelSip = null)
    {

        if ( ! isset($model->removeinterprefix)) {
            $sql = "SELECT removeinterprefix, play_audio, portabilidadeMobile, portabilidadeFixed, tariff_limit  FROM pkg_plan WHERE id = " . $model->id_plan . " LIMIT 1";
            $agi->verbose($sql, 25);
            $modelPlan                  = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            $model->removeinterprefix   = $modelPlan->removeinterprefix;
            $model->portabilidadeMobile = $modelPlan->portabilidadeMobile;
            $model->portabilidadeFixed  = $modelPlan->portabilidadeFixed;
            $model->play_audio          = $modelPlan->play_audio;
            $model->tariff_limit        = $modelPlan->tariff_limit;
        }

        $MAGNUS->modelUser           = $model;
        $MAGNUS->credit              = $model->credit;
        $MAGNUS->id_plan             = $model->id_plan;
        $MAGNUS->active              = $model->active;
        $MAGNUS->typepaid            = $model->typepaid;
        $MAGNUS->creditlimit         = $model->creditlimit;
        $MAGNUS->language            = $model->language;
        $MAGNUS->accountcode         = $model->username;
        $MAGNUS->username            = $model->username;
        $MAGNUS->removeinterprefix   = $model->removeinterprefix;
        $MAGNUS->portabilidadeMobile = $model->portabilidadeMobile;
        $MAGNUS->portabilidadeFixed  = $model->portabilidadeFixed;
        $MAGNUS->tariff_limit        = $model->tariff_limit;
        $MAGNUS->play_audio          = $model->play_audio;
        $MAGNUS->redial              = $model->redial;
        $MAGNUS->enableexpire        = $model->enableexpire;
        $MAGNUS->expirationdate      = $model->expirationdate;
        $MAGNUS->expiredays          = $model->expiredays;
        $MAGNUS->creationdate        = $model->creationdate;
        $MAGNUS->id_user             = $model->id;
        $MAGNUS->id_agent            = $model->id_user;
        $MAGNUS->restriction         = $model->restriction;
        $MAGNUS->restriction_use     = $model->restriction_use;
        $MAGNUS->callshop            = $model->callshop;
        $MAGNUS->id_offer            = $model->id_offer;
        $MAGNUS->prefix_local        = $model->prefix_local;
        $MAGNUS->countryCode         = $model->country;
        $MAGNUS->user_calllimit      = $model->calllimit;
        $MAGNUS->mix_monitor_format  = $model->mix_monitor_format;
        $MAGNUS->credit              = $MAGNUS->typepaid == 1
        ? $MAGNUS->credit + $MAGNUS->creditlimit
        : $MAGNUS->credit;

        if ( ! isset($modelSip->id)) {
            $sql = "SELECT * FROM pkg_sip WHERE name = '$MAGNUS->sip_account' LIMIT 1";
            $agi->verbose($sql, 25);
            $MAGNUS->modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        } else {
            $MAGNUS->modelSip = $modelSip;
        }

        $MAGNUS->sip_id_trunk_group = $MAGNUS->modelSip->id_trunk_group;

        if ($MAGNUS->voicemail != 1) {
            $MAGNUS->voicemail = isset($MAGNUS->modelSip->id) ? $MAGNUS->modelSip->voicemail : false;
        }
        if ($MAGNUS->record_call == 0) {
            $MAGNUS->record_call = (isset($MAGNUS->modelSip->id) && $MAGNUS->modelSip->record_call) || $MAGNUS->agiconfig['record_call'] ? true : false;
        }
    }

}
