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
class SmsCommand extends ConsoleCommand
{

    public $success;
    public $nameRoot    = 'rows';
    public $nameCount   = 'count';
    public $nameSuccess = 'success';
    public $nameMsg     = 'msg';

    public function run($args)
    {
        $lockPath = sys_get_temp_dir() . '/magnusbilling-campaign-dispatch.lock';
        $lock     = @fopen($lockPath, 'c');
        if ($lock !== false) {
            @chmod($lockPath, 0666);
        }
        if ($lock === false || ! flock($lock, LOCK_EX | LOCK_NB)) {
            echo Yii::t('zii', 'Another campaign dispatch is already in progress. Wait a moment and try again.') . "\n";
            return 1;
        }

        $idCampaign = isset($args[0]) && is_numeric($args[0]) ? (int) $args[0] : 0;
        $UNIX_TIMESTAMP = "UNIX_TIMESTAMP(";

        $tab_day  = [1 => 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $num_day  = date('N');
        $name_day = $tab_day[$num_day];

        $filter = 'status = :key1 AND type = :key0  AND ' . $name_day . ' = :key1 AND startingdate <= :key2 AND expirationdate > :key2
                        AND daily_start_time <= :key3 AND daily_stop_time > :key3 AND frequency > 0';

        $params = [
            ':key0' => 0,
            ':key1' => 1,
            ':key2' => date('Y-m-d H:i:s'),
            ':key3' => date('H:i:s'),
        ];

        if ($idCampaign > 0) {
            $filter                 .= ' AND id = :id_campaign';
            $params[':id_campaign'] = $idCampaign;
        }

        $modelCampaign = Campaign::model()->findAll([
            'condition' => $filter,
            'params'    => $params,
        ]);

        if ($idCampaign > 0 && ! isset($modelCampaign[0])) {
            $campaign = Campaign::model()->findByPk($idCampaign);
            $reasons  = [];

            if (! isset($campaign->id)) {
                $reasons[] = Yii::t('zii', 'The selected campaign no longer exists. Refresh the list and select another campaign.');
            } else {
                if ((int) $campaign->status !== 1) {
                    $reasons[] = Yii::t('zii', 'Activate the campaign in the Status field.');
                }
                if ((int) $campaign->type !== 0) {
                    $reasons[] = Yii::t('zii', 'Change the campaign Type to SMS.');
                }
                if ((int) $campaign->frequency <= 0) {
                    $reasons[] = Yii::t('zii', 'Set the campaign Frequency to a value greater than zero.');
                }
                if ((int) $campaign->{$name_day} !== 1) {
                    $reasons[] = Yii::t(
                        'zii',
                        'Enable {day} in the campaign schedule.',
                        ['{day}' => Yii::t('zii', ucfirst($name_day))]
                    );
                }
                if ($campaign->startingdate > date('Y-m-d H:i:s')) {
                    $reasons[] = Yii::t('zii', 'The campaign starts on {date}. Wait until this date or change the Start date.', ['{date}' => $campaign->startingdate]);
                }
                if ($campaign->expirationdate <= date('Y-m-d H:i:s')) {
                    $reasons[] = Yii::t('zii', 'The campaign expired on {date}. Change the Expiration date.', ['{date}' => $campaign->expirationdate]);
                }
                if ($campaign->daily_start_time > date('H:i:s')) {
                    $reasons[] = Yii::t('zii', 'SMS sending starts at {time}. Wait until this time or change the Daily start time.', ['{time}' => $campaign->daily_start_time]);
                }
                if ($campaign->daily_stop_time <= date('H:i:s')) {
                    $reasons[] = Yii::t('zii', 'SMS sending ended at {time}. Change the Daily stop time to a later time.', ['{time}' => $campaign->daily_stop_time]);
                }
            }

            echo implode("\n", $reasons) . "\n";
            return 1;
        }

        if ($this->debug >= 1) {
            echo "\nFound " . count($modelCampaign) . " Campaign\n\n";
        }

        foreach ($modelCampaign as $campaign) {
            $smsSent = 0;

            if ($this->debug >= 1) {
                echo "SEARCH NUMBER IN CAMPAIGN " . $campaign->name . "\n";
            }

            //get all campaign phonebook
            $modelCampaignPhonebook = CampaignPhonebook::model()->findAll('id_campaign = :key', [':key' => $campaign->id]);
            $ids_phone_books        = [];
            foreach ($modelCampaignPhonebook as $key => $phonebook) {
                $ids_phone_books[] = $phonebook->id_phonebook;
            }

            $criteria = new CDbCriteria();
            $criteria->addInCondition('id_phonebook', $ids_phone_books);
            $criteria->addCondition('status = :key AND creationdate < :key1');
            $criteria->params[':key']  = 1;
            $criteria->params[':key1'] = date('Y-m-d H:i:s');
            $criteria->limit           = $campaign->frequency;
            $modelPhoneNumber          = PhoneNumber::model()->findAll($criteria);

            if ($this->debug >= 1) {
                echo 'Found ' . count($modelPhoneNumber) . ' Numbers in Campaign ' . "\n";
            }

            if ( ! count($modelPhoneNumber)) {
                if ($idCampaign > 0) {
                    echo Yii::t('zii', 'No active recipients are ready for this SMS campaign. Add or activate a recipient, or check its scheduled start date.') . "\n";
                    return 1;
                }
                if ($this->debug >= 1) {
                    echo "NO PHONE FOR CALL" . "\n\n\n";
                }

                continue;
            }

            foreach ($modelPhoneNumber as $sms) {
                if (date("s") > 55 && $idCampaign === 0) {
                    return 0;
                }
                $sms->idPhonebook->idUser->id_plan = $campaign->id_plan > 0 ? $campaign->id_plan : $sms->idPhonebook->idUser->id_plan;

                $id_user  = $sms->idPhonebook->idUser->id;
                $username = $sms->idPhonebook->idUser->username;
                $id_agent = $sms->idPhonebook->idUser->id_user;

                if (UserCreditManager::checkGlobalCredit($id_user) === false) {
                    if ($this->debug >= 1) {
                        echo " USER NO CREDIT FOR CALL " . $username . "\n\n\n";
                    }

                    continue;
                }

                //print_r($sms->getAttributes());
                //print_r($campaign->getAttributes());
                $text = preg_replace("/\%name\%/", $sms->name, $campaign->description);
                $text = preg_replace("/\%city\%/", $sms->city, $text);
                $text = preg_replace("/\%doc\%/", $sms->doc, $text);
                $text = preg_replace("/\%email\%/", $sms->email, $text);
                $text = preg_replace("/\%info\%/", $sms->info, $text);

                if ($sms->number == '' || ! is_numeric($sms->number)) {
                    PhoneNumber::model()->deleteByPk((int) $sms->id);
                    continue;
                }
                if ($this->debug >= 1) {
                    echo $sms->idPhonebook->idUser->username . " - " . $sms->number . " -" . $text . "\n";
                }

                if (isset($args[0]) && $args[0] == 'whatsapp') {
                    $user = $args[1];
                    $pass = $args[2];
                    $url  = 'http://csv.portabilidadecelular.com/painel/consulta_numero_api_whatsapp.php?seache_number=' . $sms->number . '&user=' . $user . '&pass=' . $pass;

                    $res = file_get_contents($url);

                    if ($res = file_get_contents($url)) {
                        $res = explode('|', $res);

                        if (isset($res[1]) && $res[1] != 'Sim') {
                            echo "Number " . $sms->number . " not use WhatsApp\n";
                            $sms->try++;
                            $sms->status = 0;
                            $sms->info   = "Number " . $sms->number . " not use WhatsApp";
                            $sms->save();
                            exit;
                        }
                    }
                }

                $res = SmsSend::send($sms->idPhonebook->idUser, $sms->number, $text, $sms->id, $campaign->from);
                $sms->try++;
                $sms->status = isset($res['success']) && $res['success'] == true ? 3 : 2;
                $sms->save();
                if ($sms->status == 3) {
                    $smsSent++;
                }
                $modelError = $sms->getErrors();
                if (count($modelError)) {
                    print_r($modelError);
                }
            }

            if ($idCampaign > 0) {
                echo Yii::t(
                    'zii',
                    'SMS campaign "{campaign}" was processed. Messages sent: {count}.',
                    [
                        '{campaign}' => $campaign->name,
                        '{count}'    => $smsSent,
                    ]
                ) . "\n";
            }
        }
    }
}
