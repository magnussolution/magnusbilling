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

class IvrAgi
{
    public static function callIvr(&$agi, &$MAGNUS, &$CalcAgi, &$DidAgi = null, $type = 'ivr')
    {

        $agi->verbose("Ivr module", 5);
        $agi->verbose("DID IVR - CallerID=" . $MAGNUS->CallerID . " -> DID=" . $DidAgi->modelDid->did, 6);
        $MAGNUS->sip_account = '';
        $startTime           = time();

        $MAGNUS->destination = $DidAgi->modelDid->did;

        $sql = "SELECT *, pkg_ivr.id id, pkg_ivr.id_user id_user FROM pkg_ivr LEFT JOIN pkg_user ON pkg_ivr.id_user = pkg_user.id WHERE pkg_ivr.id = " . $DidAgi->modelDestination[0]['id_ivr'] . " LIMIT 1";
        $agi->verbose($sql, 25);
        $modelIvr = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
        if (! isset($modelIvr->id)) {
            $agi->verboseEvent('DID', 'DID_IVR_MISSING', 'The DID route is configured as IVR, but no valid IVR is selected.', 1, [
                'did' => isset($DidAgi->modelDid->did) ? $DidAgi->modelDid->did : '',
                'ivrId' => isset($DidAgi->modelDestination[0]['id_ivr']) ? $DidAgi->modelDestination[0]['id_ivr'] : 0,
            ]);
            if ($agi->debugMode) {
                $agi->finishDebug('blocked');
                exit;
            }
            $MAGNUS->hangup($agi);
        }

        $username        = $modelIvr->username;
        $MAGNUS->id_user = $modelIvr->id_user;
        $MAGNUS->id_plan = $modelIvr->id_plan;

        $work = $MAGNUS->checkIVRSchedule($modelIvr->monFriStart, $modelIvr->satStart, $modelIvr->sunStart);

        $holidayApplied = false;
        if ($modelIvr->use_holidays == 1) {
            $sql = "SELECT * FROM pkg_holidays  WHERE day = '" . date('Y-m-d') . "' LIMIT 1";
            $agi->verbose($sql, 25);
            $modelHolidays = $agi->query($sql)->fetch(PDO::FETCH_OBJ);
            if (isset($modelHolidays->id)) {
                $work = 'closed';
                $holidayApplied = true;
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

        $audio = $MAGNUS->magnusFilesDirectory . '/sounds/' . $audioURA . $DidAgi->modelDestination[0]['id_ivr'];
        $audioFormat = file_exists($audio . '.gsm')
            ? 'gsm'
            : (file_exists($audio . '.wav') ? 'wav' : '');
        $optionCount = 0;
        for ($optionIndex = 0; $optionIndex <= 10; $optionIndex++) {
            $optionField = $optionName . $optionIndex;
            if (isset($modelIvr->{$optionField}) && trim((string) $modelIvr->{$optionField}) !== '') {
                $optionCount++;
            }
        }
        $scheduleCode = $work === 'open' ? 'DID_IVR_SCHEDULE' : 'DID_IVR_OUT_OF_HOURS';
        $scheduleMessage = $work === 'open'
            ? 'The IVR is within its service hours.'
            : 'The IVR is outside its service hours.';
        $agi->verboseEvent('DID', $scheduleCode, $scheduleMessage, $work === 'open' ? 3 : 2, [
            'did' => $DidAgi->modelDid->did,
            'ivrId' => $modelIvr->id,
            'ivrName' => $modelIvr->name,
            'scheduleStatus' => $work,
            'holidayApplied' => $holidayApplied ? 1 : 0,
        ]);
        if ($audioFormat === '') {
            $agi->verboseEvent('DID', 'DID_IVR_AUDIO_MISSING', 'The IVR audio for the current schedule was not found.', 2, [
                'did' => $DidAgi->modelDid->did,
                'ivrId' => $modelIvr->id,
                'ivrName' => $modelIvr->name,
                'scheduleStatus' => $work,
                'expectedAudio' => $audio,
            ]);
        } else {
            $audioFile = $audio . '.' . $audioFormat;
            $audioInfo = self::inspectAsteriskAudio($audioFile, $audioFormat);
            $audioContext = [
                'did' => $DidAgi->modelDid->did,
                'ivrId' => $modelIvr->id,
                'ivrName' => $modelIvr->name,
                'scheduleStatus' => $work,
                'audio' => $audioFile,
                'audioFormat' => $audioFormat,
                'channels' => $audioInfo['channels'],
                'sampleRate' => $audioInfo['sampleRate'],
                'reason' => $audioInfo['reason'],
            ];
            if ($audioInfo['valid']) {
                $agi->verboseEvent('DID', 'DID_IVR_AUDIO_FOUND', 'The IVR audio is compatible with Asterisk.', 3, $audioContext);
            } else {
                $agi->verboseEvent('DID', 'DID_IVR_AUDIO_INCOMPATIBLE', 'The IVR audio is not mono at 8000 Hz or has an invalid format.', 2, $audioContext);
            }
        }
        if ($optionCount === 0) {
            $agi->verboseEvent('DID', 'DID_IVR_NO_OPTIONS', 'The IVR has no options configured for the current schedule.', 1, [
                'did' => $DidAgi->modelDid->did,
                'ivrId' => $modelIvr->id,
                'ivrName' => $modelIvr->name,
                'scheduleStatus' => $work,
            ]);
            if ($agi->debugMode) {
                $agi->finishDebug('blocked');
                exit;
            }
        }
        if ($agi->debugMode) {
            $agi->finishDebug('ready_to_dial', [
                'routeType' => 'IVR',
                'did' => $DidAgi->modelDid->did,
                'ivrId' => $modelIvr->id,
                'ivrName' => $modelIvr->name,
                'scheduleStatus' => $work,
                'holidayApplied' => $holidayApplied,
                'audio' => $audioFormat !== '' ? $audio . '.' . $audioFormat : '',
                'optionCount' => $optionCount,
                'callerId' => $MAGNUS->CallerID,
            ]);
            exit;
        }

        $agi->answer();

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

                    $dialstr = 'PJSIP/' . $modelSip->name . $dialparams;
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
                if ($optionType == 'pjsip') // QUEUE
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

                    $dialstr = 'PJSIP' . $modelSip->name;
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
                        $agi->verboseEvent('DID', 'DID_SIP_GROUP_EMPTY', 'The selected SIP group has no SIP accounts.', 1, [
                            'did' => $DidAgi->modelDid->did,
                            'ivrId' => $modelIvr->id,
                            'ivrName' => $modelIvr->name,
                            'sipGroup' => $optionValue,
                        ]);
                        $MAGNUS->hangup($agi);
                    }
                    $MAGNUS->sip_account = $modelSip[0]->name;
                    $group               = '';

                    foreach ($modelSip as $key => $value) {
                        $group .= "PJSIP/" . $value->name . "&";
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

    private static function inspectAsteriskAudio($file, $format)
    {
        $result = [
            'valid' => false,
            'channels' => null,
            'sampleRate' => null,
            'reason' => '',
        ];
        $size = @filesize($file);
        if (! is_int($size) || $size <= 0) {
            $result['reason'] = 'empty_file';
            return $result;
        }
        if ($format === 'gsm') {
            $result['channels'] = 1;
            $result['sampleRate'] = 8000;
            $result['valid'] = ($size % 33) === 0;
            $result['reason'] = $result['valid'] ? '' : 'invalid_gsm_frames';
            return $result;
        }

        $handle = @fopen($file, 'rb');
        if (! is_resource($handle)) {
            $result['reason'] = 'unreadable_file';
            return $result;
        }
        $header = fread($handle, 12);
        if (strlen($header) !== 12 || substr($header, 0, 4) !== 'RIFF' || substr($header, 8, 4) !== 'WAVE') {
            fclose($handle);
            $result['reason'] = 'invalid_wav_header';
            return $result;
        }
        while (! feof($handle)) {
            $chunkHeader = fread($handle, 8);
            if (strlen($chunkHeader) !== 8) {
                break;
            }
            $chunkId = substr($chunkHeader, 0, 4);
            $chunkSizeData = unpack('Vsize', substr($chunkHeader, 4, 4));
            $chunkSize = (int) $chunkSizeData['size'];
            if ($chunkId === 'fmt ') {
                $formatData = fread($handle, min($chunkSize, 16));
                if (strlen($formatData) >= 8) {
                    $values = unpack('vcodec/vchannels/VsampleRate', substr($formatData, 0, 8));
                    $result['channels'] = (int) $values['channels'];
                    $result['sampleRate'] = (int) $values['sampleRate'];
                    $result['valid'] = $result['channels'] === 1 && $result['sampleRate'] === 8000;
                    $result['reason'] = $result['valid'] ? '' : 'requires_mono_8000hz';
                } else {
                    $result['reason'] = 'invalid_wav_format_chunk';
                }
                fclose($handle);
                return $result;
            }
            fseek($handle, $chunkSize + ($chunkSize % 2), SEEK_CUR);
        }
        fclose($handle);
        $result['reason'] = 'wav_format_chunk_not_found';
        return $result;
    }
}
