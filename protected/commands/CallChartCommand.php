<?php

/**
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
 *
 */

class CallChartCommand extends ConsoleCommand
{
    private $totalCalls;
    private $totalUpCalls;
    private $dids;
    private $sips;
    private $sipNames;
    private $didsNumbers;
    public function run($args)
    {

        $this->debug = 0;
        $this->isDid();
        $this->isSIPCall();
        for (;;) {
            if (date('i') == 59) {
                break;
            }
            try {
                Servers::model()->updateAll(['status' => 1], 'status = 2');
                $calls = AsteriskAccess::getCoreShowCdrChannels();
            } catch (Exception $e) {
                sleep(4);
                continue;
            }

            echo "\n\n\n\nSTART ------\n\n";

            echo "use cdr show \n\n";
            $this->user_cdr_show($calls);
        }
    }

    public function user_cdr_show($calls)
    {

        $uniqueid = NULL;

        $modelUserCallShop = User::model()->count('callshop = 1');
        if ($modelUserCallShop > 0) {
            $callShopIds       = [];
            $modelUserCallShop = User::model()->findAll('callshop = 1');
            foreach ($modelUserCallShop as $key => $value) {
                $callShopIds[] = $value->id;
            }
        }

        $modelCallOnlineChart         = new CallOnlineChart();
        $modelCallOnlineChart->date   = date('Y-m-d H:i:') . '00';
        $modelCallOnlineChart->answer = 0;
        $modelCallOnlineChart->total  = 0;
        try {
            $modelCallOnlineChart->save();
            $totalUp    = $this->totalUpCalls    = 0;
            $totalCalls = $this->totalCalls = 0;
        } catch (Exception $e) {
            $modelCallOnlineChart = CallOnlineChart::model()->find('date = :key', [':key' => date('Y-m-d H:i:') . '00']);
        }

        if ($modelCallOnlineChart->id > 0) {
            $callOnlineId = $modelCallOnlineChart->id;
        } else {
            $callOnlineId = 0;
        }

        if (count($calls) > 0) {

            $sql = [];

            if ($this->debug > 1) {
                print_r($calls);
            }
            $config         = LoadConfig::getConfig();
            $ip_tech_length = $config['global']['ip_tech_length'];
            $sql            = [];
            foreach ($calls as $key => $call) {
                $modelDid = $modelSip = [];
                $type     = '';
                $channel  = trim($call[0]);

                $status = trim($call[4]);
                if ((preg_match("/Congestion/", $status) || preg_match("/Busy/", $status)) ||
                    (preg_match('/Ring/', $status) && $call[11] > 60)
                ) {
                    AsteriskAccess::instance()->hangupRequest($channel);
                    echo "return after hangup channel\n";
                    continue;
                }

                $uniqueid    = null;
                $trunk       = null;
                if (preg_match('/^PJSIP\/([^-\s]+)/', $channel, $m)) {
                    $sip_account = $m[1];
                } else {
                    $sip_account = '';
                }
                $ndiscado    = trim($call[2]);

                $modelSip1 = Sip::model()->find('name = :key', [':key' => $sip_account]);
                $accountcode = isset($modelSip1->idUser->username) ? $modelSip1->idUser->username : '';
                $codec       = substr($call[5], 1, 5);



                $chan = trim($call[9] ?? '');
                // The final token is Asterisk's hexadecimal channel suffix.
                // Keep dashes that are part of the configured PJSIP endpoint.
                if (preg_match('#^[^/]+/(.+)-[0-9a-f]+(?:;[12])?$#i', $chan, $m)) {

                    $des_chan    = $trunk =  $m[1];
                } else {

                    $des_chan    = $trunk  = '';
                }


                $last_app    = trim($call[3]);
                $cdr         = trim($call[11]);
                $originate = $sip_account;


                if ($last_app == 'Dial' || $last_app == 'Mbilling') {

                    if ($status == 'Ringing') {
                        echo "return because status is Ringing";
                        continue;
                    }

                    if (preg_match('/^MC\!/', $sip_account)) {
                        echo "torpedo\n";
                        $campaingName  = preg_split('/\!/', $call[2]);
                        $modelCampaing = Campaign::model()->find('name = :key', [':key' => $campaingName[1]]);
                        $id_user       = isset($modelCampaing->id_user) ? $modelCampaing->id_user : 'NULL';
                        $trunk         = "Campaign " . $campaingName[1];
                    } else {

                        //check if is a DID call
                        if (false !== $key = array_search($ndiscado, $this->didsNumbers)) {
                            $modelDid = $this->dids[$key];
                        }
                        //check if is a call to sip account
                        else if (false !== $key = array_search($ndiscado, $this->sipNames)) {
                            $modelSip = $this->sips[$key];
                        }

                        if (isset($modelDid['id'])) {
                            $type    = 'DID';
                            $trunk   = 'DID Call ' . $modelDid['did'];
                            $id_user = isset($modelDid['id_user']) ? $modelDid['id_user'] : null;

                            $didChannel = AsteriskAccess::getCoreShowChannel($channel);
                            if (isset($didChannel['UniqueID'])) {
                                $cdr = time() - intval($didChannel['UniqueID']);
                            }

                            if ($des_chan != '<none>') {
                                if (isset($didChannel['SIPADDHEADER01=P-SipAccount'])) {
                                    $sip_account = $trunk = $didChannel['SIPADDHEADER01=P-SipAccount'];
                                } else if (isset($didChannel['DIALEDPEERNUMBER'])) {
                                    $sip_account = $didChannel['DIALEDPEERNUMBER'];
                                }
                            }
                        } else if (isset($modelSip['id'])) {
                            echo "is a SIP call $ndiscado\n";
                            $type        = 'SIP';
                            $sip_account = $originate;
                            $trunk       = Yii::t('zii', 'SIP Call');
                            $id_user     = $modelSip['id_user'];
                            $is_sip_call = true;
                        } else {

                            //se é autenticado por techprefix

                            //try get user
                            if (preg_match('/^PJSIP\/sipproxy\-/', $channel)) {

                                $sip_account = trim($call[1]);

                                if (false !== $key = array_search($sip_account, $this->sipNames)) {
                                    $modelSip1 = Sip::model()->find('name = :key', [':key' => $this->sips[$key]['name']]);
                                } else {
                                    continue;
                                }
                            } else if (strlen($ndiscado) > 15) {
                                $tech     = substr($ndiscado, 0, $ip_tech_length);
                                $modelSip1 = Sip::model()->find('techprefix = :key AND host != "dynamic" ', [':key' => $tech]);
                            }

                            if (isset($modelSip1->id)) {
                                $modelSip = $modelSip1;
                                $id_user = $modelSip->id_user;
                            }

                            if (! isset($modelSip->name)) {
                                echo " $sip_account $status aqui\n";
                                if ($status == 'Ring') {
                                    $sip_account = $originate;
                                }
                                if (strlen($sip_account) > 3) {
                                    //echo "check per sip_account $originate\n";
                                    if (false !== $key = array_search($originate, $this->sipNames)) {
                                        $modelSip = Sip::model()->find('name = :key', [':key' => $this->sips[$key]['name']]);
                                    }
                                } else if (strlen($accountcode)) {
                                    //echo "check per accountcode $accountcode\n";
                                    $modelSip = Sip::model()->find(
                                        'accountcode = :key',
                                        [
                                            ':key' => $accountcode,
                                        ]
                                    );
                                }

                                if (! isset($modelSip->name)) {

                                    if (preg_match('/^IAX/', strtoupper($channel))) {
                                        $modelSip = Iax::model()->find('name = :key', [':key' => $originate]);
                                    } else {
                                        //check if is via IP from proxy
                                        $callProxy = AsteriskAccess::getCoreShowChannel($channel, null, $call['server']);
                                        $modelSip  = Sip::model()->find('host = :key', [':key' => $callProxy['X-AUTH-IP']]);
                                    }
                                }
                            }



                            $type        = 'pstn';
                            $id_user     = $modelSip['id_user'];
                            $sip_account = $modelSip['name'];
                        }

                        if ($type == '') {
                            echo "not fount the type call \n";
                            continue;
                        }
                    }
                } elseif ($last_app == 'AGI' || $last_app == 'AppDial2') {
                    if (preg_match('/^MC\!/', $call[1])) {

                        //torpedo
                        $campaingName = preg_split('/\!/', $call[1]);

                        $modelCampaing = Campaign::model()->find('name = :key', [':key' => $campaingName[1]]);

                        $id_user = isset($modelCampaing->id_user) ? $modelCampaing->id_user : 'NULL';
                        $trunk   = "Campaign " . $campaingName[1];
                    } else {
                        //check if is a DID number
                        //DID call ivr   -> SIP/addphone-000000|           |9999999999    |           |Up|(g729)|<none>             |AGI  |4|5
                        if (false !== $key = array_search($call[2], $this->didsNumbers)) {
                            $modelDid = $this->dids[$key];
                        }
                        if (isset($modelDid['id'])) {

                            $id_user = $modelDid['id_user'];

                            switch ($modelDid['voip_call']) {
                                case 2:
                                    $trunk = $originate . ' IVR';
                                    break;
                                case 3:
                                    $trunk = $originate . ' CallingCard';
                                    break;
                                case 4:
                                    $trunk = $originate . ' portalDeVoz';
                                    break;
                                case 4:
                                    $trunk = $originate . ' CID Callback';
                                    break;
                                case 5:
                                    $trunk = $originate . ' CID Callback';
                                    break;
                                case 6:
                                    $trunk = $originate . ' 0800 Callback';
                                    break;
                                default:
                                    $trunk = $originate . ' DID Call';
                                    break;
                            }
                        } else {
                            $id_user = 'NULL';
                        }
                    }
                } elseif ($last_app == 'Queue') {

                    if (preg_match('/^MC\!/', $call[1])) {
                        //torpedo
                        $campaingName = preg_split('/\!/', $call[1]);

                        $modelCampaing = Campaign::model()->find('name = :key', [':key' => $campaingName[1]]);

                        $id_user  = isset($modelCampaing->id_user) ? $modelCampaing->id_user : 'NULL';
                        $trunk    = "Campaign " . $campaingName[1];
                        $uniqueid = $campaingName[2];
                    } else {

                        //check if is a DID number
                        if (false !== $key = array_search($call[2], $this->didsNumbers)) {
                            $modelDid = $this->dids[$key];
                        }

                        if (isset($modelDid['id'])) {
                            $id_user = $modelDid['id_user'];
                            $trunk   = $ndiscado . ' Queue ';
                            if ($status == 'Up') {
                                $callQueue = AsteriskAccess::getCoreShowChannel($channel, null, $call['server']);
                                if (isset($callQueue['UniqueID'])) {
                                    $cdr = time() - intval($callQueue['UniqueID']);
                                }
                                if (isset($callQueue['MEMBERNAME'])) {
                                    $sip_account = substr($callQueue['MEMBERNAME'], 4);
                                }
                            }
                        } else {
                            $id_user = 'NULL';
                        }
                    }
                } else {
                    continue;
                }

                if (! is_numeric($id_user)) {

                    echo "continue because not found id_user\n";
                    continue;
                }

                if (! is_numeric($id_user) || ! is_numeric($cdr)) {
                    echo "continue because not foun id_user = $id_user or cdr = $cdr\n";
                    continue;
                }

                if (preg_match("/Up/", $status)) {
                    $totalUp++;
                }
                $totalCalls++;

                $sql[] = "(NULL,'" . $uniqueid . "', '$sip_account', $id_user, '$channel', '" . utf8_encode($trunk) . "', '$ndiscado', '" . preg_replace('/\(|\)/', '', $codec) . "', '$status', '$cdr', 'no','no', '" . $call['server'] . "')";

                if (is_array($callShopIds)) {
                    if (in_array($id_user, $callShopIds)) {

                        if (! isset($modelSip->id)) {
                            $modelSip = Sip::model()->find('name =:key', [':key' => $sip_account]);

                            if (isset($modelSip->id)) {
                                $modelSip->status         = 3;
                                $modelSip->callshopnumber = $ndiscado;
                                $modelSip->callshoptime   = $cdr;
                                $modelSip->save();
                                $modelSip = null;
                            }
                        }
                    }
                }
            }

            if ($totalUp > $this->totalUpCalls) {
                $this->totalUpCalls = $totalUp;
                echo "totalUp é > total1\n";
            }

            if ($totalCalls > $this->totalCalls) {
                $this->totalCalls = $totalCalls;
            }

            $modelCallOnlineChart->answer = $this->totalUpCalls;
            $modelCallOnlineChart->total  = $this->totalCalls;
            $modelCallOnlineChart->save();

            echo 'totalUp = ' . $totalUp . ' -> totalCalls = ' . $totalCalls . "\n";
            echo 'this->totalUpCalls = ' . $this->totalUpCalls . ' -> this->totalCalls = ' . $this->totalCalls . "\n";
            CallOnLine::model()->deleteAll();

            if (count($sql) > 0) {

                $result = CallOnLine::model()->insertCalls($sql);
                if ($this->debug > 1) {
                    print_r($result);
                }
            }
        } else {
            CallOnLine::model()->deleteAll();
        }
        sleep(4);
    }

    private function isDid()
    {
        $sql               = "SELECT did, id, id_user FROM pkg_did WHERE reserved = 1";
        $this->dids        = Yii::app()->db->createCommand($sql)->queryAll();
        $this->didsNumbers = isset($this->dids[0]) ? array_column($this->dids, 'did') : [];
    }
    private function isSIPCall()
    {
        $sql            = "SELECT name, id_user FROM pkg_sip";
        $this->sips     = Yii::app()->db->createCommand($sql)->queryAll();
        $this->sipNames = array_column($this->sips, 'name');
    }
}
