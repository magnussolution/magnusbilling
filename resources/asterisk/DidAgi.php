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

class DidAgi
{
    public $voip_call;
    public $did;
    public $sell_price;
    public $buy_price;
    public $agent_client_rate;
    public $modelDestination;
    public $modelDid;
    public $startCall;
    public $id_prefix = 0;
    public $did_voip_model;
    public $did_voip_model_sip_account;
    public $matchedExpressionNumber = 0;

    public function checkIfIsDidCall(&$agi, &$MAGNUS, &$CalcAgi)
    {

        if (strlen($MAGNUS->accountcode) > 3) {
            $sql = "SELECT * FROM pkg_user WHERE username = '" . $MAGNUS->accountcode . "' LIMIT 1";
            $agi->verbose($sql, 25);
            $this->did_voip_model             = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            $this->did_voip_model_sip_account = $MAGNUS->sip_account;
        }
        $this->startCall = time();

        if ($MAGNUS->active > 2) {
            $agi->verbose("User cant receive call. User status is " . $MAGNUS->active, 5);
            return;
        }

        //check if did call
        $mydnid = $MAGNUS->config['global']['did_ignore_zero_on_did'] == 1 && substr($MAGNUS->dnid, 0, 1) == '0' ? substr($MAGNUS->dnid, 1) : $MAGNUS->dnid;

        if ($MAGNUS->config['global']['apply_local_prefix_did_sip'] == 1) {
            $sql = "SELECT * FROM pkg_user WHERE username = '" . $MAGNUS->accountcode . "' AND active = 1 LIMIT 1";
            $agi->verbose($sql, 25);
            $modelDidUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelDidUser->prefix_local) && strlen($modelDidUser->prefix_local) > 2) {
                $MAGNUS->prefix_local = $modelDidUser->prefix_local;
                $MAGNUS->number_translation($agi, $mydnid);
                $mydnid = $MAGNUS->destination;
            }
        }

        $agi->verboseEvent('DID', 'DID_LOOKUP', 'Checking whether the destination is an active DID.', 4, [
            'did' => $mydnid,
        ]);
        $sql = "SELECT * FROM pkg_did WHERE did = '$mydnid' AND activated = 1 LIMIT 1";
        $agi->verbose($sql, 25);
        $this->modelDid = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        if (isset($this->modelDid->id)) {
            $agi->verboseEvent('DID', 'DID_FOUND', 'An active DID was found.', 3, [
                'did' => $this->modelDid->did,
                'didId' => $this->modelDid->id,
                'userId' => $this->modelDid->id_user,
            ]);
            $sql = "SELECT * FROM pkg_did_destination WHERE id_did = '" . $this->modelDid->id . "' ORDER BY priority";
            $agi->verbose($sql, 25);
            $this->modelDestination = $agi->query($sql)->fetchAll(PDO::FETCH_ASSOC);

            if (isset($this->did_voip_model->record_call) && $this->did_voip_model->record_call == 1) {
                $this->modelDid->record_call = 1;
            }
            if (count($this->modelDestination)) {
                $agi->verboseEvent('DID', 'DID_DESTINATIONS_FOUND', 'Active DID routing destinations were found.', 3, [
                    'did' => $this->modelDid->did,
                    'count' => count($this->modelDestination),
                ]);

                $this->did           = $this->modelDid->did;
                $MAGNUS->record_call = $this->modelDid->record_call;
                $agi->set_variable("RECORD_CALL_DID", $MAGNUS->record_call);
                $agi->set_variable('DID_NUMBER', $this->did);

                $sql = "SELECT * FROM pkg_user WHERE id = " . $this->modelDid->id_user . " LIMIT 1";
                $agi->verbose($sql, 25);
                $MAGNUS->modelUser = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                if ($this->id_prefix == 0) {

                    $sql = "SELECT id FROM pkg_prefix WHERE prefix = SUBSTRING('" . $this->did . "',1,length(prefix))
                                    ORDER BY LENGTH(prefix) DESC";
                    $agi->verbose($sql, 25);
                    $modelPrefix = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                    if (! isset($modelPrefix->id)) {
                        $agi->verboseEvent('DID', 'DID_PREFIX_NOT_FOUND', 'No prefix matches the DID number.', 2, [
                            'did' => $this->did,
                        ]);
                    }
                    $CalcAgi->id_prefix = isset($modelPrefix->id) ? $modelPrefix->id : null;

                    $sql = "SELECT * FROM pkg_trunk WHERE trunkcode = '" . $MAGNUS->sip_account . "' LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelTrunk       = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                    $MAGNUS->id_trunk = isset($modelTrunk->id) ? $modelTrunk->id : null;
                } else {
                    $CalcAgi->id_prefix = $this->id_prefix;
                }

                if ($this->modelDid->calllimit > 0) {
                    $agi->verbose('Check DID channels');
                    $asmanager = new AGI_AsteriskManager();
                    $asmanager->connect('localhost', 'magnus', 'magnussolution');
                    $channelsData = $asmanager->command('core show channels concise');

                    $channelsData = explode("\n", $channelsData["data"]);

                    $calls = 0;
                    foreach ($channelsData as $key => $line) {
                        if (preg_match("/AppDial.*$this->did/", $line)) {
                            $calls++;
                        }
                    }
                    $asmanager->disconnect();

                    $agi->verbose('Did ' . $this->did . ' have ' . $calls . ' Calls');
                    if ($calls >= $this->modelDid->calllimit) {
                        $agi->verboseEvent('DID', 'DID_CALL_LIMIT_REACHED', 'The DID simultaneous call limit has been reached.', 1, [
                            'did' => $this->did,
                            'activeCalls' => $calls,
                            'callLimit' => $this->modelDid->calllimit,
                        ]);

                        if ($MAGNUS->modelUser->calllimit_error == 403) {
                            $agi->execute('busy', 'busy');
                        } else {
                            $agi->execute('congestion', 'Congestion');
                        }

                        $MAGNUS->hangup($agi);
                        exit;
                    }
                }

                if (isset($MAGNUS->modelUser->inbound_call_limit) && $MAGNUS->modelUser->inbound_call_limit > 0) {

                    $sql = "SELECT * FROM pkg_did WHERE id_user = " . $MAGNUS->modelUser->id;
                    $agi->verbose($sql, 25);
                    $modelDIDAll = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);
                    $asmanager   = new AGI_AsteriskManager();
                    $asmanager->connect('localhost', 'magnus', 'magnussolution');
                    $channelsData = $asmanager->command('core show channels concise');
                    $channelsData = explode("\n", $channelsData["data"]);
                    $asmanager->disconnect();
                    $calls = 0;
                    foreach ($modelDIDAll as $key => $value) {
                        $calls += $this->getCallsPerDid($value->did, $agi, $channelsData);
                    }
                    if ($calls >= $MAGNUS->modelUser->inbound_call_limit) {
                        $agi->verboseEvent('DID', 'DID_USER_INBOUND_LIMIT_REACHED', 'The user inbound simultaneous call limit has been reached.', 1, [
                            'did' => $this->did,
                            'username' => $MAGNUS->modelUser->username,
                            'activeCalls' => $calls,
                            'callLimit' => $MAGNUS->modelUser->inbound_call_limit,
                        ]);
                        if ($MAGNUS->modelUser->calllimit_error == 403) {
                            $agi->execute('busy', 'busy');
                        } else {
                            $agi->execute('congestion', 'Congestion');
                        }

                        $MAGNUS->hangup($agi);
                        exit;
                    }
                }
                $this->checkDidDestinationType($agi, $MAGNUS, $CalcAgi);
            } else {
                $agi->verboseEvent('DID', 'DID_DESTINATION_MISSING', 'The DID has no configured routing destination.', 1, [
                    'did' => $this->modelDid->did,
                ]);
                $MAGNUS->hangup($agi);
            }
            if ($this->voip_call != 3) {
                exit;
            }
        }
    }

    public function getCallsPerDid($did, $agi, $channelsData)
    {
        $calls = 0;
        foreach ($channelsData as $key => $line) {
            if (preg_match("/$did\!.*\!Dial\!/", $line)) {
                $calls++;
            }
        }
        return $calls;
    }

    public function checkDidDestinationType(&$agi, &$MAGNUS, &$CalcAgi)
    {

        $MAGNUS->id_user            = $MAGNUS->modelUser->id;
        $MAGNUS->restriction        = $MAGNUS->modelUser->restriction;
        $MAGNUS->mix_monitor_format = $MAGNUS->modelUser->mix_monitor_format;
        $MAGNUS->checkRestrictPhoneNumber($agi, 'did');

        $this->didCallCost($agi, $MAGNUS);

        $this->did = $this->modelDid->did;
        $matchedExpression = $this->matchedExpressionNumber > 0
            ? $this->modelDid->{'expression_' . $this->matchedExpressionNumber}
            : '';
        $agi->verboseEvent('DID', 'DID_RATE_SELECTED', 'The DID buy and sell rates were calculated.', 3, [
            'did' => $this->did,
            'callerId' => $MAGNUS->CallerID,
            'expressionNumber' => $this->matchedExpressionNumber,
            'expression' => $matchedExpression,
            'sellRate' => $this->sell_price,
            'buyRate' => $this->buy_price,
            'connectionSell' => $this->modelDid->connection_sell,
            'initBlock' => $this->modelDid->initblock,
            'billingBlock' => $this->modelDid->increment,
        ]);
        $agi->verbose('DID ' . $this->did, 5);

        //if DID option charge of was = 0 only allow call from existent callerid
        if ($this->modelDid->charge_of == 0) {

            $sql = "SELECT * FROM pkg_callerid WHERE cid = '$MAGNUS->CallerID'  AND activated = 1 LIMIT 1";
            $agi->verbose($sql, 25);
            $modelCallerId = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelCallerId->id)) {
                $agi->verbose('found callerid, new user = ' . $MAGNUS->modelUser->username . ' ' . $this->sell_price);
                $CalcAgi->did_charge_of_id_user     = $modelCallerId->id_user;
                $CalcAgi->did_charge_of_answer_time = time();
                $CalcAgi->didAgi                    = $this->modelDid;
                $this->modelDid->selling_rate_1     = $this->sell_price;
                $this->modelDid->buy_rate_1         = $this->buy_price;
            } else {
                $agi->verboseEvent('DID', 'DID_CALLERID_NOT_AUTHORIZED', 'The CallerID is not authorized to pay for this DID call.', 1, [
                    'did' => $this->did,
                    'callerId' => $MAGNUS->CallerID,
                    'chargeOf' => 'callerid',
                ]);
                $MAGNUS->hangup($agi);
            }
        }

        if (strlen($this->modelDid->callerid)) {
            $agi->execute("SET", "CALLERID(name)=" . $this->modelDid->callerid . "");
        }

        $MAGNUS->accountcode = $MAGNUS->username = $MAGNUS->modelUser->username;

        $this->voip_call = $this->modelDestination[0]['voip_call'];
        $this->checkBlockCallerID($agi, $MAGNUS);

        $routeTypes = [
            1 => 'SIP account',
            2 => 'IVR',
            3 => 'Calling card',
            4 => 'Voice portal',
            5 => 'Callback',
            6 => '0800 callback',
            7 => 'Queue',
            8 => 'SIP group',
            9 => 'Custom',
            10 => 'Dialplan',
            11 => 'Multiple IPs',
        ];
        $agi->verboseEvent('DID', 'DID_ROUTE_SELECTED', 'The DID routing type was selected.', 3, [
            'did' => $this->did,
            'type' => isset($routeTypes[$this->voip_call]) ? $routeTypes[$this->voip_call] : 'PSTN',
            'typeCode' => $this->voip_call,
        ]);

        if ($this->modelDid->cbr == 1 && ! $agi->get_variable("ISFROMCALLBACKPRO", true)) {
            if (! $agi->get_variable("SECCALL", true)) {
                $agi->verbose('RECEIVED 0800 CALLBACPRO', 5);
                CallbackAgi::advanced0800CallBack($agi, $MAGNUS, $this, $CalcAgi);
                return;
            }
        } else if ($agi->get_variable("ISFROMCALLBACKPRO", true)) {
            $sql = "SELECT * FROM pkg_callback WHERE id = '" . $agi->get_variable("IDCALLBACK", true) . "' LIMIT 1";
            $agi->verbose($sql, 25);
            $modelCallback    = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            $MAGNUS->CallerID = $modelCallback->exten;
            $agi->set_callerid($MAGNUS->CallerID);
        }

        switch ($this->voip_call) {
            case 2:
                $ivrId = isset($this->modelDestination[0]['id_ivr'])
                    ? (int) $this->modelDestination[0]['id_ivr']
                    : 0;
                $modelIvr = null;
                if ($ivrId > 0) {
                    $sql = "SELECT id,name,id_user FROM pkg_ivr WHERE id = $ivrId LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelIvr = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                }
                if (! isset($modelIvr->id)) {
                    $agi->verboseEvent('DID', 'DID_IVR_MISSING', 'The DID route is configured as IVR, but no valid IVR is selected.', 1, [
                        'did' => $this->did,
                        'destinationId' => isset($this->modelDestination[0]['id']) ? $this->modelDestination[0]['id'] : '',
                        'ivrId' => $ivrId,
                    ]);
                    $MAGNUS->hangup($agi);
                }
                $agi->verboseEvent('DID', 'DID_IVR_SELECTED', 'A valid IVR was selected for the DID route.', 3, [
                    'did' => $this->did,
                    'ivrId' => $modelIvr->id,
                    'ivrName' => $modelIvr->name,
                ]);
                $MAGNUS->mode = 'ivr';
                IvrAgi::callIvr($agi, $MAGNUS, $CalcAgi, $this);
                break;
            case 3:
                //callingcard
                $MAGNUS->mode = 'standard';
                $agi->answer();
                sleep(1);
                $MAGNUS->callingcardConnection = $this->modelDid->connection_sell;

                $MAGNUS->agiconfig['use_dnid']        = 0;
                $MAGNUS->agiconfig['answer']          = $MAGNUS->agiconfig['callingcard_answer'];
                $MAGNUS->agiconfig['cid_enable']      = $MAGNUS->agiconfig['callingcard_cid_enable'];
                $MAGNUS->agiconfig['number_try']      = $MAGNUS->agiconfig['callingcard_number_try'];
                $MAGNUS->agiconfig['say_rateinitial'] = $MAGNUS->agiconfig['callingcard_say_rateinitial'];
                $MAGNUS->agiconfig['say_timetocall']  = $MAGNUS->agiconfig['callingcard_say_timetocall'];
                $MAGNUS->accountcode                  = null;
                $MAGNUS->CallerID                     = is_numeric($MAGNUS->CallerID) ? $MAGNUS->CallerID : $agi->request['agi_calleridname'];
                $agi->verbose('CallerID ' . $MAGNUS->CallerID);
                break;
            case 4:
                $MAGNUS->mode = 'portalDeVoz';
                $agi->verbose('PortalDeVozAgi');
                PortalDeVozAgi::send($agi, $MAGNUS, $CalcAgi, $this);
                break;
            case 5:
                $agi->verbose('RECEIVED ANY CALLBACK', 5);
                CallbackAgi::callbackCID($agi, $MAGNUS, $CalcAgi, $this);
                break;
            case 6:
                if (! $agi->get_variable("SECCALL", true)) {
                    $agi->verbose('RECEIVED 0800 CALLBACK', 5);
                    CallbackAgi::callback0800($agi, $MAGNUS, $CalcAgi, $this);
                }
                break;
            case 7:
                $queueId = isset($this->modelDestination[0]['id_queue'])
                    ? (int) $this->modelDestination[0]['id_queue']
                    : 0;
                $modelQueue = null;
                if ($queueId > 0) {
                    $sql = "SELECT id,name,id_user FROM pkg_queue WHERE id = $queueId LIMIT 1";
                    $agi->verbose($sql, 25);
                    $modelQueue = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                }
                if (! isset($modelQueue->id)) {
                    $agi->verboseEvent('DID', 'DID_QUEUE_MISSING', 'The DID route is configured as Queue, but no valid Queue is selected.', 1, [
                        'did' => $this->did,
                        'destinationId' => isset($this->modelDestination[0]['id']) ? $this->modelDestination[0]['id'] : '',
                        'queueId' => $queueId,
                    ]);
                    $MAGNUS->hangup($agi);
                }
                $sql = "SELECT COUNT(*) AS agent_count,
                               SUM(CASE WHEN qm.paused = 0 THEN 1 ELSE 0 END) AS available_agent_count
                        FROM pkg_queue_member qm
                        INNER JOIN pkg_queue q ON q.name = qm.queue_name
                        WHERE q.id = " . (int) $modelQueue->id;
                $agi->verbose($sql, 25);
                $queueAgents = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
                $agentCount = isset($queueAgents->agent_count) ? (int) $queueAgents->agent_count : 0;
                $availableAgentCount = isset($queueAgents->available_agent_count)
                    ? (int) $queueAgents->available_agent_count
                    : 0;
                if ($agentCount === 0) {
                    $agi->verboseEvent('DID', 'DID_QUEUE_NO_AGENTS', 'The Queue selected for the DID has no agents.', 2, [
                        'did' => $this->did,
                        'queueId' => $modelQueue->id,
                        'queueName' => $modelQueue->name,
                    ]);
                }
                $agi->verboseEvent('DID', 'DID_QUEUE_SELECTED', 'A valid Queue was selected for the DID route.', 3, [
                    'did' => $this->did,
                    'queueId' => $modelQueue->id,
                    'queueName' => $modelQueue->name,
                    'agentCount' => $agentCount,
                    'availableAgentCount' => $availableAgentCount,
                ]);
                if ($agi->debugMode) {
                    $agi->finishDebug('ready_to_dial', [
                        'routeType' => 'Queue',
                        'did' => $this->did,
                        'queueId' => $modelQueue->id,
                        'queueName' => $modelQueue->name,
                        'agentCount' => $agentCount,
                        'availableAgentCount' => $availableAgentCount,
                        'callerId' => $MAGNUS->CallerID,
                    ]);
                    exit;
                }
                $MAGNUS->mode = 'queue';
                QueueAgi::callQueue($agi, $MAGNUS, $CalcAgi, $this);
                break;
            default:
                $agi->verbose('Mode = did', 5);
                $MAGNUS->mode = 'did';
                $this->call_did($agi, $MAGNUS, $CalcAgi);
                break;
        }

        if ($agi->get_variable("ISFROMCALLBACKPRO", true)) {
            $MAGNUS->id_trunk = $agi->get_variable("IDTRUNK", true);

            $max_len_prefix = strlen($MAGNUS->CallerID);
            $prefixclause   = '(';
            while ($max_len_prefix >= 1) {
                $prefixclause .= "prefix='" . substr($MAGNUS->CallerID, 0, $max_len_prefix) . "' OR ";
                $max_len_prefix--;
            }

            $prefixclause = substr($prefixclause, 0, -3) . ")";

            $sql = "SELECT * FROM pkg_rate_provider t  JOIN pkg_prefix p ON t.id_prefix = p.id WHERE " .
                "id_provider = ( SELECT id_provider FROM pkg_trunk WHERE id = " . $MAGNUS->id_trunk . ") AND " . $prefixclause .
                "ORDER BY LENGTH( prefix ) DESC LIMIT 1";
            $agi->verbose($sql, 25);
            $modelRateProvider = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);

            $sessiontime         = time() - $this->startCall;
            $sell                = $agi->get_variable("SELLCOST", true);
            $sellinitblock       = $agi->get_variable("SELLINITBLOCK", true);
            $sellincrement       = $agi->get_variable("SELLINCREMENT", true);
            $buy                 = $modelRateProvider[0]->buyrate;
            $buyinitblock        = $modelRateProvider[0]->buyrateinitblock;
            $buyincrement        = $modelRateProvider[0]->buyrateincrement;
            $MAGNUS->id_user     = $agi->get_variable("IDUSER", true);
            $MAGNUS->id_plan     = $agi->get_variable("IDPLAN", true);
            $MAGNUS->sip_account = $MAGNUS->destination;
            $MAGNUS->destination = $MAGNUS->CallerID;

            $sell_price = $MAGNUS->roudRatePrice($sessiontime, $sell, $sellinitblock, $sellincrement);
            $buy_price  = $MAGNUS->roudRatePrice($sessiontime, $buy, $buyinitblock, $buyincrement);

            $CalcAgi->starttime        = date("Y-m-d H:i:s", $this->startCall);
            $CalcAgi->sessiontime      = $sessiontime;
            $CalcAgi->terminatecauseid = 1;
            $CalcAgi->sessionbill      = $sell_price;
            $CalcAgi->sipiax           = 4;
            $CalcAgi->buycost          = $buy_price;
            $CalcAgi->id_prefix        = $agi->get_variable("IDPREFIX", true);
            $CalcAgi->saveCDR($agi, $MAGNUS);

            $sql = "UPDATE pkg_callback SET status = 3, last_attempt_time = '" . date('Y-m-d H:i:s') . "', sessiontime = $sessiontime
                        WHERE id = " . $agi->get_variable("IDCALLBACK", true);
            $agi->verbose($sql, 25);
            $agi->exec($sql);

            $MAGNUS->hangup($agi);
        }
    }

    public function call_did(&$agi, &$MAGNUS, &$CalcAgi, $destinationIvr = false)
    {

        //sip call, group, custom or PSTN destination
        if ($MAGNUS->agiconfig['answer_call'] == 1) {
            $agi->verbose("ANSWER CALL", 6);
            $agi->answer();
        }

        $CalcAgi->init();
        $MAGNUS->init();

        $agi->verbose("DID CALL - CallerID=" . $MAGNUS->CallerID . " -> DID=" . $this->did, 6);

        $res = 0;

        $MAGNUS->agiconfig['say_timetocall'] = 0;

        //altera o destino do did caso ele venha de uma IVR
        $this->modelDestination[0]['destination'] = $destinationIvr ? $destinationIvr : $this->modelDestination[0]['destination'];

        $callcount = 0;

        foreach ($this->modelDestination as $inst_listdestination) {

            $agi->verbose(print_r($inst_listdestination, true), 10);

            $callcount++;

            $agi->verboseEvent('DID', 'DID_DESTINATION_ATTEMPT', 'Trying a configured DID destination.', 3, [
                'did' => $this->did,
                'priority' => $callcount,
                'typeCode' => $inst_listdestination['voip_call'],
                'destination' => $inst_listdestination['destination'],
            ]);

            $MAGNUS->agiconfig['cid_enable'] = 0;
            $MAGNUS->accountcode             = $MAGNUS->username             = $MAGNUS->modelUser->username;
            $MAGNUS->id_plan                 = $MAGNUS->modelUser->id_plan;

            $msg = "[Magnus] DID call friend: FOLLOWME=$callcount (username:" . $MAGNUS->username . "
                    | destination type:" . $this->voip_call . "| id_plan:" . $MAGNUS->id_plan . ")";
            $agi->verbose($msg, 10);

            if (AuthenticateAgi::authenticateUser($agi, $MAGNUS) != 1) {
                $msg = "DID AUTHENTICATION ERROR";
            } else {
                $agi->set_variable("DIDACCOUNTCODE", $MAGNUS->username);

                $agi->verbose("DID call friend: IS LOCAL !!!", 1);

                $MAGNUS->record_call = $this->modelDid->record_call;

                /* IF SIP CALL*/
                if ($inst_listdestination['voip_call'] == 1) {
                    $agi->verbose("DID destination type SIP user ", 6);
                    $sql = "SELECT * FROM pkg_sip WHERE id = " . $inst_listdestination['id_sip'] . " LIMIT 1";
                    $agi->verbose($sql, 25);
                    $MAGNUS->modelSip = $modelSip = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                    if (isset($modelSip->id)) {
                        $MAGNUS->voicemail   = isset($modelSip->voicemail) ? $modelSip->voicemail : false;
                        $MAGNUS->destination = $modelSip->name;
                    } else {
                        $agi->stream_file('prepaid-dest-unreachable', '#');
                        continue;
                    }
                    $MAGNUS->sip_account = $MAGNUS->modelSip->name;
                    $agi->verbose('Call to user ' . $modelSip->name, 1);

                    $MAGNUS->extension = $MAGNUS->destination = $MAGNUS->dnid = $modelSip->name;

                    $SipCallAgi = new SipCallAgi();
                    $dialResult = $SipCallAgi->processCall($MAGNUS, $agi, $CalcAgi, $this->did);

                    $dialstatus   = $dialResult['dialstatus'];
                    $answeredtime = $dialResult['answeredtime'];

                    $agi->verbose($inst_listdestination['destination'] . " Friend -> followme=$callcount : ANSWEREDTIME=" . $answeredtime . "-DIALSTATUS=" . $dialstatus, 1);

                    if ($this->parseDialStatus($agi, $dialstatus, $answeredtime) != true) {
                        $answeredtime = 0;
                        continue;
                    }
                }
                /* Call to group*/ else if ($inst_listdestination['voip_call'] == 8) {
                    $agi->verbose("DID destination type SIP group ", 6);
                    $sql = "SELECT * FROM pkg_sip WHERE sip_group = '" . $inst_listdestination['destination'] . "'";
                    $agi->verbose($sql, 25);
                    $modelSip = $agi->query($sql)->fetchAll(PDO::FETCH_OBJ);
                    $agi->verbose("Call to SIP group " . $inst_listdestination['destination'], 6);
                    if (! isset($modelSip[0]->id)) {
                        $agi->verboseEvent('DID', 'DID_SIP_GROUP_EMPTY', 'The selected SIP group has no SIP accounts.', 1, [
                            'did' => $this->did,
                            'sipGroup' => $inst_listdestination['destination'],
                        ]);
                        $MAGNUS->hangup($agi);
                    }

                    $group = '';

                    foreach ($modelSip as $key => $value) {

                        $group .= "PJSIP/" . $value->name . "&";
                    }

                    $dialstr = substr($group, 0, -1);

                    $MAGNUS->startRecordCall($agi, $this->did, true);

                    $agi->verbose("DIAL $dialstr", 6);
                    $myres = $MAGNUS->run_dial($agi, $dialstr, $MAGNUS->agiconfig['dialcommand_param_call_2did'], 'no', $MAGNUS->config['global']['max_call_duration']);

                    $sipaccount          = $agi->get_variable("DIALEDPEERNUMBER");
                    $MAGNUS->sip_account = $sipaccount['data'];
                    $answeredtime        = $agi->get_variable("ANSWEREDTIME");
                    $answeredtime        = $answeredtime['data'];
                    $dialstatus          = $agi->get_variable("DIALSTATUS");
                    $dialstatus          = $dialstatus['data'];

                    $MAGNUS->stopRecordCall($agi);

                    if ($this->parseDialStatus($agi, $dialstatus, $answeredtime) != true) {
                        $answeredtime = 0;
                        continue;
                    }
                }
                /* Call to custom dial*/ else if ($inst_listdestination['voip_call'] == 9) {
                    $agi->verbose("DID destination type CUSTOM ", 6);
                    //SMS@O numero %callerid% acabou de  ligar.
                    if (strtoupper(substr($inst_listdestination['destination'], 0, 3)) == 'SMS') {
                        //url format ->  SMS|Text|trunkname
                        $sms = explode('|', $inst_listdestination['destination']);

                        $destination = $MAGNUS->modelUser->mobile;
                        $trunk       = $sms[2];
                        $text        = $sms[1];
                        $text        = preg_replace("/\%callerid\%/", $MAGNUS->CallerID, $text);

                        if (file_exists('/var/lib/asterisk/sounds/' . $this->did . '.gsm')) {
                            $agi->verbose('execute earlymedia');
                            $agi->verbose('earl ok');
                            $agi->execute('Ringing');
                            $agi->execute("Progress");
                            $agi->execute('Wait', '1');
                            $agi->execute('Playback', $this->did . ",noanswer");
                        }

                        $text = addslashes((string) $text);
                        //CODIFICA O TESTO DO SMS
                        $text = urlencode($text);

                        $sql = "SELECT link_sms, removeprefix, trunkprefix FROM pkg_trunk WHERE trunkcode = '$trunk' LIMIT 1";
                        $agi->verbose($sql, 25);
                        $modelTrunk = $agi->query($sql)->fetch(PDO::FETCH_OBJ);

                        //retiro e adiciono os prefixos do tronco
                        if (strncmp($destination, $modelTrunk->removeprefix, strlen($modelTrunk->removeprefix)) == 0 || substr(strtoupper($modelTrunk->removeprefix), 0, 1) == 'X') {
                            $destination = substr($destination, strlen($modelTrunk->removeprefix));
                        }
                        $destination = $modelTrunk->trunkprefix . $destination;
                        $agi->verbose($destination);
                        $url = $modelTrunk->link_sms;
                        $url = preg_replace("/\%number\%/", $destination, $url);
                        $url = preg_replace("/\%text\%/", $text, $url);

                        $agi->verbose($url);
                        file_get_contents($url);

                        $answeredtime = 60;
                        $dialstatus   = 'ANSWER';
                        $agi->execute('Congestion', '5');
                        break;
                    } else {
                        $dialstr = $inst_listdestination['destination'];

                        $MAGNUS->startRecordCall($agi, $this->did, true);


                        $this->did_voip_model_sip_account = $MAGNUS->sip_account = "";
                        $agi->verbose("DIAL $dialstr", 6);
                        $myres = $MAGNUS->run_dial($agi, $dialstr, $MAGNUS->agiconfig['dialcommand_param_call_2did'], 'no', $MAGNUS->config['global']['max_call_duration']);
                        $MAGNUS->stopRecordCall($agi);

                        $answeredtime = $agi->get_variable("ANSWEREDTIME");
                        $answeredtime = $answeredtime['data'];
                        $dialstatus   = $agi->get_variable("DIALSTATUS");
                        $dialstatus   = $dialstatus['data'];

                        if ($this->parseDialStatus($agi, $dialstatus, $answeredtime) != true) {
                            $answeredtime = 0;
                            continue;
                        }
                    }
                } elseif ($inst_listdestination['voip_call'] == 10) {
                    $agi->verbose("DID destination type DIALPLAN ", 6);
                    $MAGNUS->run_dial($agi, "LOCAL/" . $this->did . "@did-" . $this->did);
                    $answeredtime = $agi->get_variable("ANSWEREDTIME");
                    $answeredtime = $answeredtime['data'];
                    $dialstatus   = $agi->get_variable("DIALSTATUS");
                    $dialstatus   = $dialstatus['data'];
                } elseif ($inst_listdestination['voip_call'] == 11) {
                    $agi->verbose("DID destination type MULTIPLES IPs ", 6);

                    $ips       = explode(',', $inst_listdestination['destination']);
                    $dialToIPs = '';
                    foreach ($ips as $key => $ip) {
                        $ip = trim($ip);
                        if (filter_var($ip, FILTER_VALIDATE_IP)) {
                            $dialToIPs .= 'PJSIP/' . $this->did . '@' . $ip . '&';
                        }
                    }
                    if ($dialToIPs === '') {
                        $isOnlyDestination = count($this->modelDestination) === 1;
                        $agi->verboseEvent('DID', 'DID_MULTIPLE_IPS_EMPTY', 'The multiple IP destination has no valid IP addresses.', $isOnlyDestination ? 1 : 2, [
                            'did' => $this->did,
                            'destinationId' => $inst_listdestination['id'],
                            'configuredIPs' => $inst_listdestination['destination'],
                            'validIPCount' => 0,
                        ]);
                        if ($agi->debugMode && $isOnlyDestination) {
                            $MAGNUS->hangup($agi);
                        }
                        continue;
                    }
                    $dialToIPs = substr($dialToIPs, 0, -1);
                    $MAGNUS->run_dial($agi, $dialToIPs);
                    $answeredtime = $agi->get_variable("ANSWEREDTIME");
                    $answeredtime = $answeredtime['data'];
                    $dialstatus   = $agi->get_variable("DIALSTATUS");
                    $dialstatus   = $dialstatus['data'];
                } else {

                    $agi->verbose("DID destination type PSTN NUMBER", 6);
                    /* CHECK IF DESTINATION IS SET*/
                    if (strlen($inst_listdestination['destination']) == 0) {
                        $isOnlyDestination = count($this->modelDestination) === 1;
                        $agi->verboseEvent('DID', 'DID_DESTINATION_EMPTY', 'The configured DID destination is empty.', $isOnlyDestination ? 1 : 2, [
                            'did' => $this->did,
                            'destinationId' => $inst_listdestination['id'],
                            'priority' => $callcount,
                            'typeCode' => $inst_listdestination['voip_call'],
                        ]);
                        if ($agi->debugMode && $isOnlyDestination) {
                            $MAGNUS->hangup($agi);
                        }
                        continue;
                    }

                    $MAGNUS->agiconfig['use_dnid']       = 1;
                    $MAGNUS->agiconfig['say_timetocall'] = 0;

                    //if is a PSTN call can destination format is number@callerID, set the CallID.
                    if (preg_match("/@/", $inst_listdestination['destination'])) {
                        $destinationCallerID                 = explode('@', $inst_listdestination['destination']);
                        $inst_listdestination['destination'] = $destinationCallerID[0];
                        $agi->set_callerid($destinationCallerID[1]);
                    }

                    $MAGNUS->extension = $MAGNUS->dnid = $MAGNUS->destination = $inst_listdestination['destination'];

                    if ($MAGNUS->checkNumber($agi, $CalcAgi, 0) == true) {

                        /* PERFORM THE CALL*/
                        $result_callperf = $CalcAgi->sendCall($agi, $MAGNUS->destination, $MAGNUS);
                        if (! $result_callperf) {
                            $prompt = "prepaid-callfollowme";
                            $agi->verbose($prompt, 10);
                            $agi->stream_file($prompt, '#');
                            continue;
                        }

                        $dialstatus   = $CalcAgi->dialstatus;
                        $answeredtime = $CalcAgi->answeredtime;

                        if (($CalcAgi->dialstatus == "NOANSWER") || ($CalcAgi->dialstatus == "BUSY") || ($CalcAgi->dialstatus == "CHANUNAVAIL") || ($CalcAgi->dialstatus == "CONGESTION")) {
                            continue;
                        }

                        if ($CalcAgi->dialstatus == "CANCEL") {
                            break;
                        }

                        /* INSERT CDR  & UPDATE SYSTEM*/
                        $CalcAgi->updateSystem($MAGNUS, $agi, 1, 1);

                        $sql = "UPDATE pkg_did_destination SET secondusedreal = secondusedreal + $CalcAgi->answeredtime
                                WHERE id = " . $this->modelDestination[0]['id'] . " LIMIT 1";
                        $agi->verbose($sql, 25);
                        $agi->exec($sql);

                        /* THEN STATUS IS ANSWER*/
                        break;
                    }
                }
            }
            /* END IF AUTHENTICATE*/
        }

        $answeredtime = $MAGNUS->executeVoiceMail($agi, $dialstatus, $answeredtime);

        $agi->verbose('DID answeredtime =' . $answeredtime, 25);
        if ($answeredtime > 0) {
            $this->call_did_billing($agi, $MAGNUS, $CalcAgi, $answeredtime, $dialstatus);
            return 1;
        } else {

            if (!is_numeric($CalcAgi->id_prefix)) {
                $CalcAgi->id_prefix = 'NULL';
            }

            $fields = "uniqueid,id_user,calledstation,id_plan,id_trunk,callerid,src,
                        starttime, terminatecauseid,sipiax,id_prefix,hangupcause";
            $idTrunkSql = $MAGNUS->id_trunk > 0 ? (int) $MAGNUS->id_trunk : 'NULL';
            $values   = "'$MAGNUS->uniqueid', '$MAGNUS->id_user','$this->did','$MAGNUS->id_plan',
                        $idTrunkSql,'$MAGNUS->CallerID', 'DID Call',
                        '" . date('Y-m-d H:i:s') . "', '0','3',$CalcAgi->id_prefix,'0'";
            $sql = "INSERT INTO pkg_cdr_failed ($fields) VALUES ($values) ";
            $agi->verbose($sql, 25);
            $agi->exec($sql);
            return 1;
        }
    }
    public function checkBlockCallerID(&$agi, &$MAGNUS)
    {
        $agi->verbose("try blocked", 5);
        $block_expression_1 = $this->modelDid->block_expression_1;
        $block_expression_2 = $this->modelDid->block_expression_2;
        $block_expression_3 = $this->modelDid->block_expression_3;

        $send_to_callback_1 = $this->modelDid->send_to_callback_1;
        $send_to_callback_2 = $this->modelDid->send_to_callback_2;
        $send_to_callback_3 = $this->modelDid->send_to_callback_3;

        $expression_1 = $this->modelDid->expression_1;
        $expression_2 = $this->modelDid->expression_2;
        $expression_3 = $this->modelDid->expression_3;

        $agi->verbose("try blocked number match with expression 1, " . $MAGNUS->CallerID . ' ' . $expression_1, 10);
        if (strlen($expression_1) && preg_match('/' . $expression_1 . '/', $MAGNUS->CallerID)) {

            if ($block_expression_1 == 1) {
                $this->reportBlockedCallerId($agi, $MAGNUS, 1, $expression_1);
                $MAGNUS->hangup($agi);
            } elseif ($send_to_callback_1 == 1) {
                $agi->verbose('Send to Callback expression 1', 10);
                $this->voip_call = 6;
            }
            return;
        }

        if (strlen($expression_2) && preg_match('/' . $expression_2 . '/', $MAGNUS->CallerID)) {

            if ($block_expression_2 == 1) {
                $this->reportBlockedCallerId($agi, $MAGNUS, 2, $expression_2);
                $MAGNUS->hangup($agi);
            } elseif ($send_to_callback_2 == 1) {
                $agi->verbose('Send to Callback expression 2', 10);
                $this->voip_call = 6;
            }
            return;
        }

        if (strlen($expression_3) && preg_match('/' . $expression_3 . '/', $MAGNUS->CallerID)) {

            if ($block_expression_3 == 1) {
                $this->reportBlockedCallerId($agi, $MAGNUS, 3, $expression_3);
                $MAGNUS->hangup($agi);
            } elseif ($send_to_callback_3 == 1) {
                $agi->verbose('Send to Callback expression 3', 10);
                $this->voip_call = 6;
            }
            return;
        }
    }

    private function reportBlockedCallerId(&$agi, &$MAGNUS, $expressionNumber, $expression)
    {
        $agi->verboseEvent('DID', 'DID_CALLERID_BLOCKED', 'The DID blocked the call because the CallerID matched a blocking expression.', 1, [
            'did' => $this->did,
            'callerId' => $MAGNUS->CallerID,
            'expressionNumber' => $expressionNumber,
            'expression' => $expression,
        ]);
    }

    public function parseDialStatus(&$agi, $dialstatus, $answeredtime)
    {
        $agi->verbose('parseDialStatus', 25);
        if ($dialstatus == "BUSY") {
            if ($this->play_audio == 1) {
                $agi->stream_file('prepaid-isbusy', '#');
            } else {
                $agi->execute('busy', 'busy');
            }
            return false;
        } elseif ($dialstatus == "NOANSWER") {
            if ($this->play_audio == 1) {
                $agi->stream_file('prepaid-callfollowme', '#');
            }
            return false;
        } elseif ($dialstatus == "CANCEL") {
            return true;
        } elseif ($dialstatus == "ANSWER") {
            $agi->verbose("[Magnus] DID call friend: dialstatus : $dialstatus, answered time is " . $answeredtime . " ", 10);
            return true;
        } elseif (($dialstatus == "CHANUNAVAIL") || ($dialstatus == "CONGESTION")) {
            return false;
        } else {
            if ($this->play_audio == 1) {
                $agi->stream_file('prepaid-callfollowme', '#');
            }
            return false;
        }
    }

    public function didCallCost(&$agi, &$MAGNUS)
    {
        $agi->verbose('didCallCost', 10);
        if (file_exists(dirname(__FILE__) . '/didCallCost.php')) {
            include dirname(__FILE__) . '/didCallCost.php';
            return;
        }

        //brazil mobile - ^[4,5,6][1-9][7-9].{7}$|^[1,2,3,7,8,9][1-9]9.{8}$
        //brazil fixed - ^[1-9][0-9][1-5].
        $agi->verbose(print_r($this->modelDestination[0], true), 25);
        if (strlen($this->modelDid->expression_1) > 0 && preg_match('/' . $this->modelDid->expression_1 . '/', $MAGNUS->CallerID)) {
            $agi->verbose("CallerID Match regular expression 1 " . $MAGNUS->CallerID, 10);
            $this->matchedExpressionNumber = 1;
            $selling_rate      = $this->modelDid->selling_rate_1;
            $buy_rate          = $this->modelDid->buy_rate_1;
            $agent_client_rate = $this->modelDid->agent_client_rate_1;
        } elseif (strlen($this->modelDid->expression_2) > 0 && preg_match('/' . $this->modelDid->expression_2 . '/', $MAGNUS->CallerID)) {
            $agi->verbose("CallerID Match regular expression 2 " . $MAGNUS->CallerID, 10);
            $this->matchedExpressionNumber = 2;
            $selling_rate      = $this->modelDid->selling_rate_2;
            $buy_rate          = $this->modelDid->buy_rate_2;
            $agent_client_rate = $this->modelDid->agent_client_rate_2;
        } elseif (strlen($this->modelDid->expression_3) > 0 && preg_match('/' . $this->modelDid->expression_3 . '/', $MAGNUS->CallerID)) {
            $agi->verbose("CallerID Match regular expression 3 " . $MAGNUS->CallerID, 10);
            $this->matchedExpressionNumber = 3;
            $selling_rate      = $this->modelDid->selling_rate_3;
            $buy_rate          = $this->modelDid->buy_rate_3;
            $agent_client_rate = $this->modelDid->agent_client_rate_3;
        } else {
            $this->matchedExpressionNumber = 0;
            $selling_rate      = 0;
            $buy_rate          = 0;
            $agent_client_rate = 0;
        }

        if ($this->modelDid->connection_sell == 0 && $selling_rate == 0) {
            $this->sell_price = 0;
        } else {
            $this->sell_price = $selling_rate;
        }

        $this->buy_price = $buy_rate;

        $this->agent_client_rate = $agent_client_rate;

        $credit = $MAGNUS->modelUser->typepaid == 1
            ? $MAGNUS->modelUser->credit + $MAGNUS->modelUser->creditlimit
            : $MAGNUS->modelUser->credit;

        if ($MAGNUS->modelUser->active != 1) {
            $agi->verboseEvent('DID', 'DID_OWNER_INACTIVE', 'The user linked to the DID is inactive.', 1, [
                'did' => $this->did,
                'username' => $MAGNUS->modelUser->username,
                'userStatus' => $MAGNUS->modelUser->active,
            ]);
            $MAGNUS->hangup($agi);
        } else if ($this->sell_price > 0 && $credit <= 0) {
            $agi->verboseEvent('DID', 'DID_OWNER_NO_CREDIT', 'The user linked to the DID has insufficient credit for the inbound charge.', 1, [
                'did' => $this->did,
                'username' => $MAGNUS->modelUser->username,
                'credit' => $credit,
                'rate' => $this->sell_price,
            ]);
            $MAGNUS->hangup($agi);
        }
    }

    public function billDidCall(&$agi, &$MAGNUS, $answeredtime, &$CalcAgi)
    {
        $agi->verbose('billDidCall, sell_price=' . $this->sell_price, 10);

        $this->sell_price = $MAGNUS->roudRatePrice($answeredtime, $this->sell_price, $this->modelDid->initblock, $this->modelDid->increment);

        $this->sell_price = $this->sell_price + $this->modelDid->connection_sell;

        if ($MAGNUS->modelUser->id_user > 1) {

            $this->agent_client_rate = $MAGNUS->roudRatePrice($CalcAgi->real_sessiontime, $this->agent_client_rate, $this->modelDid->initblock, $this->modelDid->increment);
            $agi->verbose('The DID user is a Agent user. agent_client_rate = ' . $this->agent_client_rate, 5);
        }

        if ($CalcAgi->real_sessiontime < $this->modelDid->minimal_time_charge) {
            $this->sell_price        = 0;
            $this->agent_client_rate = 0;
        }

        $this->buy_price = $MAGNUS->roudRatePrice($CalcAgi->real_sessiontime, $this->buy_price, $this->modelDid->buyrateinitblock, $this->modelDid->buyrateincrement);

        if ($CalcAgi->real_sessiontime < $this->modelDid->minimal_time_buy) {
            $this->buy_price = 0;
        }
    }

    public function call_did_billing(&$agi, &$MAGNUS, &$CalcAgi, $answeredtime, $dialstatus)
    {
        if ($answeredtime > 0) {
            $terminatecauseid = 1;
        } else if (strlen($MAGNUS->dialstatus_rev_list[$dialstatus]) > 0) {
            $terminatecauseid = $MAGNUS->dialstatus_rev_list[$dialstatus];
        } else {
            $terminatecauseid = 0;
        }
        $CalcAgi->real_sessiontime = intval($answeredtime);

        /*recondeo call*/
        if ($MAGNUS->config["global"]['bloc_time_call'] == 1 && $this->sell_price > 0 && $CalcAgi->real_sessiontime >= $this->modelDid->minimal_time_charge) {
            $initblock    = $this->modelDid->initblock > 0 ? $this->modelDid->initblock : 1;
            $billingblock = $this->modelDid->increment > 0 ? $this->modelDid->increment : 1;

            if ($answeredtime > $initblock) {
                $restominutos   = $answeredtime % $billingblock;
                $calculaminutos = ($answeredtime - $restominutos) / $billingblock;
                if ($restominutos > '0') {
                    $calculaminutos++;
                }

                $answeredtime = $calculaminutos * $billingblock;
            } elseif ($answeredtime < '1') {
                $sessiontime = 0;
            } else {
                $answeredtime = $initblock;
            }
        }

        $this->billDidCall($agi, $MAGNUS, $answeredtime, $CalcAgi);

        $CalcAgi->starttime   = date("Y-m-d H:i:s", time() - $answeredtime);
        $CalcAgi->sessiontime = $answeredtime;

        $MAGNUS->destination       = $this->did;
        $CalcAgi->terminatecauseid = $terminatecauseid;
        $CalcAgi->sessionbill      = $this->sell_price;
        $MAGNUS->id_trunk          = $MAGNUS->id_trunk > 0 ? $MAGNUS->id_trunk : null;
        $CalcAgi->sipiax           = 2;
        $CalcAgi->buycost          = $this->buy_price;

        if ($MAGNUS->modelUser->id_user > 1) {
            $CalcAgi->agent_bill = $this->agent_client_rate;
        }
        $CalcAgi->saveCDR($agi, $MAGNUS);

        $sql = "UPDATE pkg_did_destination SET secondusedreal = secondusedreal + $answeredtime
                    WHERE  id = " . $this->modelDestination[0]['id'] . " LIMIT 1;
                UPDATE pkg_did SET secondusedreal = secondusedreal + $answeredtime
                    WHERE  id = " . $this->modelDid->id . " LIMIT 1";
        $agi->verbose($sql, 25);
        $agi->exec($sql);

        if (isset($this->did_voip_model->id)) {

            $MAGNUS->id_user      = $this->did_voip_model->id;
            $MAGNUS->sip_account  = $this->did_voip_model_sip_account;
            $CalcAgi->buycost     = 0;
            $CalcAgi->sessionbill = 0;
            $CalcAgi->sipiax      = 3;
            $CalcAgi->saveCDR($agi, $MAGNUS);
        }
        return;
    }
}
