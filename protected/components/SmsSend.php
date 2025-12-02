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
class SmsSend
{
    public static function send($modelUser, $destination, $text, $id_phonenumber = 0, $sms_from = '', $providerResult = '')
    {

        if ( ! isset($modelUser->id)) {
            return [
                'success' => false,
                'errors'  => Yii::t('zii', 'Error : Authentication Error!'),
            ];
        }

        if ( ! $destination || ! $text) {
            return [
                'success' => false,
                'errors'  => Yii::t('zii', 'Disallowed action'),
            ];
        }

        //VERIFICA SE O CLIENTE TEM CREDITO
        if (UserCreditManager::checkGlobalCredit($modelUser->id) === false) {
            return [
                'success' => false,
                'errors'  => Yii::t('zii', 'Error : You do not have enough credit to send SMS!'),
            ];
        }

        /*protabilidade*/
        $destination = Portabilidade::getDestination($destination, $modelUser->id_plan);

        $destination = "999" . $destination;

        $date_msn = date("Y-m-d H:i:s");

        //PEGA O PREÇO DE VENDA DO AGENT
        if ($modelUser->id_user > 1) {

            $modelRate = Rate::model()->searchAgentRate($destination, $modelUser->id_plan);

            if ( ! count($modelRate)) {
                return [
                    'success' => false,
                    'errors'  => Yii::t('zii', 'Prefix not found in Agent') . ' ' . $destination,
                ];
            }

            $rateInitialClientAgent = $modelRate[0]['rateinitial'];

            $modelUserAgent = User::model()->findByPk((int) $modelUser->id_user);

            $modelUser->id_plan = $modelUserAgent->id_plan;
        } else {
            $rateInitialClientAgent = 0;
        }

        $searchTariff = new SearchTariff();
        $callTrunk    = $searchTariff->find($destination, $modelUser->id_plan, $modelUser->id);

        if ($callTrunk == 0) {
            return [
                'success' => false,
                'errors'  => Yii::t('zii', 'Prefix not found') . ' ' . $destination,
            ];
        } else {

            $max_len_prefix = strlen($destination);
            $prefixclause   = '(';
            while ($max_len_prefix >= 1) {
                $prefixclause .= "prefix='" . substr($destination, 0, $max_len_prefix) . "' OR ";
                $max_len_prefix--;
            }

            $prefixclause = substr($prefixclause, 0, -3) . ")";

            if ($callTrunk[0]['trunk_group_type'] == 1) {
                $sql = "SELECT * FROM pkg_trunk_group_trunk WHERE id_trunk_group = " . $callTrunk[0]['id_trunk_group'] . " ORDER BY id ASC";
            } else if ($callTrunk[0]['trunk_group_type'] == 2) {
                $sql = "SELECT * FROM pkg_trunk_group_trunk WHERE id_trunk_group = " . $callTrunk[0]['id_trunk_group'] . " ORDER BY RAND() ";

            } else if ($callTrunk[0]['trunk_group_type'] == 3) {
                $sql = "SELECT *, (SELECT buyrate FROM pkg_rate_provider WHERE id_provider = tr.id_provider AND id_prefix = " . $callTrunk[0]['id_prefix'] . " LIMIT 1) AS buyrate  FROM pkg_trunk_group_trunk t  JOIN pkg_trunk tr ON t.id_trunk = tr.id WHERE id_trunk_group = " . $callTrunk[0]['id_trunk_group'] . " ORDER BY buyrate IS NULL , buyrate ";
            }
            $modelTrunkGroupTrunk = TrunkGroupTrunk::model()->findBySql($sql);

            $modelTrunk = Trunk::model()->findByPk((int) $modelTrunkGroupTrunk->id_trunk);

            //RETIRO O 1111
            if (substr($destination, 0, 7) == '9991111') {
                $destination = substr($destination, 10);
            } else if (substr($destination, 0, 3) == '999') {
                $destination = substr($destination, 3);
            }

            if ( ! isset($modelTrunk->link_sms)) {
                return [
                    'success' => false,
                    'errors'  => Yii::t('zii', 'No sms link'),
                ];
            }

            $linkSms      = $modelTrunk->link_sms;
            $trunkPrefix  = $modelTrunk->trunkprefix;
            $removePrefix = $modelTrunk->removeprefix;
            $smsRes       = $modelTrunk->sms_res;

            $rateInitial = isset($callTrunk[0]['rateinitial']) ? $callTrunk[0]['rateinitial'] : null;
            $id_prefix   = isset($callTrunk[0]['id_prefix']) ? $callTrunk[0]['id_prefix'] : null;

            $sql = "SELECT * FROM pkg_rate_provider t  JOIN pkg_prefix p ON t.id_prefix = p.id WHERE " .
            "id_provider = " . $modelTrunk->id_provider . " AND " . $prefixclause .
                "ORDER BY LENGTH( prefix ) DESC LIMIT 1";
            $modelRateProvider = Yii::app()->db->createCommand($sql)->queryAll();

            $buyRate = isset($modelRateProvider[0]['buyrate']) ? $modelRateProvider[0]['buyrate'] : null;

            //retiro e adiciono os prefixos do tronco
            if (strncmp($destination, $removePrefix, strlen($removePrefix)) == 0 || substr(strtoupper($removeprefix), 0, 1) == 'X') {
                $destination = substr($destination, strlen($removePrefix));
            }

            $destination = $trunkPrefix . $destination;

            //Adiciona barras invertidas a uma string
            $text = addslashes((string) $text);
            //CODIFICA O TESTO DO SMS
            $text = urlencode($text);

            $linkSms = preg_replace("/\%number\%/", $destination, $linkSms);
            $linkSms = preg_replace("/\%text\%/", $text, $linkSms);
            $linkSms = preg_replace("/\%from\%/", $sms_from, $linkSms);
            if ($id_phonenumber > 0) {
                $linkSms = preg_replace("/\%id\%/", $id_phonenumber, $linkSms);
            }
            if (strlen($linkSms) < 10) {
                return [
                    'success' => false,
                    'errors'  => Yii::t('zii', 'Your SMS is not send!') . ' ' . Yii::t('zii', 'Not have link in trunk'),
                ];

            }

            $arrContextOptions = [
                "ssl" => [
                    "verify_peer"      => false,
                    "verify_peer_name" => false,
                ],
            ];

            if ( ! $res = @file_get_contents($linkSms, false, stream_context_create($arrContextOptions))) {
                return [
                    'success' => false,
                    'errors'  => Yii::t('zii', 'ERROR, contact us'),
                ];
            }

            //DESCODIFICA O TESTO DO SMS PARA GRAVAR NO BANCO DE DADOS
            $text = urldecode($text);

            $sussess =  ! $smsRes == '' && ! preg_match("/$smsRes/", $res) ? false : true;

            if ($providerResult == true && preg_match('/^http/', $modelUser->description)) {

                $data = json_decode($res);

                $options = [
                    'http' => [
                        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                        'method'  => 'POST',
                        'content' => http_build_query($data),
                    ],
                    "ssl"  => [
                        "verify_peer"        => false,
                        "verif  y_peer_name" => false,
                    ],
                ];

                $context            = stream_context_create($options);
                $resultFromProvider = file_get_contents($modelUser->description, false, $context);

            }

            if ($sussess) {
                $terminateCauseid = 1;
                $sessionTime      = 60;
                $rateInitial      = strlen($text) > 160 ? $rateInitial * 2 : $rateInitial;
                $msg              = Yii::t('zii', 'Send');
                $success          = true;

                $modelSms            = new Sms();
                $modelSms->id_user   = $modelUser->id;
                $modelSms->prefix    = $id_prefix;
                $modelSms->telephone = $destination;
                $modelSms->sms       = $text;
                $modelSms->status    = 1;
                $modelSms->result    = print_r($res, true);
                $modelSms->rate      = $rateInitial;
                $modelSms->sms_from  = $sms_from;
                $modelSms->save();

            } else {
                $buyRate          = 0;
                $terminateCauseid = 4;
                $rateInitial      = 0;
                $sessionTime      = 0;
                $msg              = Yii::t('zii', 'Your SMS is not send!');
                $success          = false;

            }

            $uniqueid = "$destination-" . date('His');

            $modelCall                   = new Call();
            $modelCall->uniqueid         = $uniqueid;
            $modelCall->id_user          = $modelUser->id;
            $modelCall->starttime        = $date_msn;
            $modelCall->sessiontime      = $sessionTime;
            $modelCall->calledstation    = $destination;
            $modelCall->sessionbill      = $rateInitial;
            $modelCall->id_plan          = $modelUser->id_plan;
            $modelCall->id_trunk         = $modelTrunk->id;
            $modelCall->src              = $modelUser->username;
            $modelCall->buycost          = $buyRate;
            $modelCall->terminatecauseid = $terminateCauseid;
            $modelCall->id_prefix        = $id_prefix;
            $modelCall->sipiax           = 6;
            $modelCall->agent_bill       = $rateInitialClientAgent;
            $modelCall->save();
            $modelError = $modelCall->getErrors();
            if (count($modelError)) {
                $msg = $modelError;
            }

            if (isset($resultFromProvider)) {
                echo $res;
                exit;
            } else {
                if ($sussess == false) {
                    return [
                        'success' => false,
                        'errors'  => $msg,
                    ];
                } else {
                    return [
                        'success' => $success,
                        'msg'     => $msg];
                }
            }

        }
    }
}
