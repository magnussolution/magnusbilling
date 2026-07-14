<?php
/**
 * Processes Campaign records whose type is WhatsApp (2).
 */
class WhatsappCampaignCommand extends ConsoleCommand
{
    const CAMPAIGN_TYPE = 2;

    public function init()
    {
        if (! defined('PID') && ! is_writable('/var/run/magnus')) {
            define('PID', Yii::getPathOfAlias('application.runtime') . '/WhatsappCampaignPid.php');
        }
        parent::init();
    }

    public function run($args)
    {
        $api = new WhatsAppBusinessApi(isset($this->config['global']) ? $this->config['global'] : []);
        if (! $api->isConfigured()) {
            $this->logMessage('WhatsApp campaign skipped: configure whatsapp_phone_number_id and whatsapp_access_token.');
            return;
        }

        $days    = [1 => 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $dayName = $days[(int) date('N')];
        $now     = date('Y-m-d H:i:s');

        $campaigns = Campaign::model()->findAll([
            'condition' => 'status = :status AND type = :type',
            'params'    => [':status' => 1, ':type' => self::CAMPAIGN_TYPE],
            'order'     => 'RAND()',
        ]);

        $eligible = 0;
        $this->logMessage('Found ' . count($campaigns) . ' active WhatsApp campaign(s).');

        foreach ($campaigns as $campaign) {
            $reason = $this->ineligibilityReason($campaign, $dayName, $now);
            if ($reason !== '') {
                $this->logMessage('Campaign ' . $campaign->id . ' skipped: ' . $reason . '.');
                continue;
            }
            $eligible++;
            $this->processCampaign($campaign, $api);
        }

        $this->logMessage('Eligible WhatsApp campaign(s): ' . $eligible . '.');
    }

    private function processCampaign($campaign, WhatsAppBusinessApi $api)
    {
        if (! isset($campaign->idUser->id)) {
            $this->logMessage('Campaign ' . $campaign->id . ' has no valid user.');
            return;
        }

        if (UserCreditManager::checkGlobalCredit($campaign->idUser->id) === false) {
            $this->logMessage('Campaign ' . $campaign->id . ' skipped: user has no credit.');
            return;
        }

        $phonebooks = CampaignPhonebook::model()->findAll([
            'condition' => 'id_campaign = :campaign',
            'params'    => [':campaign' => $campaign->id],
        ]);
        $phonebookIds = [];
        foreach ($phonebooks as $phonebook) {
            $phonebookIds[] = $phonebook->id_phonebook;
        }

        if (! count($phonebookIds)) {
            $this->logMessage('Campaign ' . $campaign->id . ' has no phonebook.');
            return;
        }

        $criteria = new CDbCriteria();
        $criteria->addInCondition('id_phonebook', $phonebookIds);
        $criteria->addCondition('status = :status AND creationdate < :now');
        $criteria->params[':status'] = 1;
        $criteria->params[':now']    = date('Y-m-d H:i:s');
        $criteria->limit             = (int) $campaign->frequency;
        $criteria->order             = 'RAND()';
        $phones = PhoneNumber::model()->findAll($criteria);

        $sent   = 0;
        $failed = 0;
        foreach ($phones as $phone) {
            $claimed = PhoneNumber::model()->updateAll(
                ['status' => 2, 'try' => new CDbExpression('try + 1')],
                'id = :id AND status = :status',
                [':id' => $phone->id, ':status' => 1]
            );
            if (! $claimed) {
                continue;
            }

            $phone->try = (int) $phone->try + 1;
            if ($this->isRestricted($campaign, $phone->number)) {
                $this->setPhoneStatus($phone, 4);
                continue;
            }

            $destination = preg_replace('/[^0-9]/', '', (string) $phone->number);
            if ($destination === '') {
                $this->setPhoneStatus($phone, 0);
                $failed++;
                continue;
            }

            $result = $api->sendTemplate(
                $destination,
                $campaign->whatsapp_template_name,
                $campaign->whatsapp_template_language
            );
            if (! empty($result['success'])) {
                $this->setPhoneStatus($phone, 3);
                $this->saveOutgoingMessage($campaign, $destination, $result['message_id']);
                $sent++;
                $this->logMessage('Campaign ' . $campaign->id . ': sent to ' . $destination .
                    ' (' . $result['message_id'] . ').');
                continue;
            }

            $this->setPhoneStatus($phone, $phone->try >= 2 ? 0 : 1);
            $failed++;
            $this->logMessage('Campaign ' . $campaign->id . ': failed for ' . $destination .
                ' - ' . $result['error']);
        }

        $this->logMessage('Campaign ' . $campaign->id . ' finished: ' . $sent .
            ' sent, ' . $failed . ' failed.');
    }

    private function ineligibilityReason($campaign, $dayName, $now)
    {
        $time = date('H:i:s');
        if ((int) $campaign->$dayName !== 1) {
            return $dayName . ' is disabled';
        }
        if ($campaign->startingdate > $now) {
            return 'starting date has not been reached';
        }
        if ($campaign->expirationdate <= $now) {
            return 'campaign has expired';
        }
        if ($campaign->daily_start_time > $time || $campaign->daily_stop_time <= $time) {
            return 'current time ' . $time . ' is outside daily window ' .
                $campaign->daily_start_time . '-' . $campaign->daily_stop_time;
        }
        if ((int) $campaign->frequency < 1) {
            return 'frequency must be greater than zero';
        }
        if (trim((string) $campaign->whatsapp_template_name) === '') {
            return 'WhatsApp template name is empty';
        }
        if (trim((string) $campaign->whatsapp_template_language) === '') {
            return 'WhatsApp template language is empty';
        }
        return '';
    }

    private function isRestricted($campaign, $number)
    {
        if ((int) $campaign->restrict_phone !== 1) {
            return false;
        }

        return CampaignRestrictPhone::model()->exists(
            'number = :number',
            [':number' => $number]
        );
    }

    private function setPhoneStatus($phone, $status)
    {
        PhoneNumber::model()->updateByPk((int) $phone->id, ['status' => (int) $status]);
    }

    private function saveOutgoingMessage($campaign, $destination, $providerMessageId)
    {
        $message                      = new Sms();
        $message->id_user             = (int) $campaign->id_user;
        $message->id_campaign         = (int) $campaign->id;
        $message->telephone           = $destination;
        $message->sms                 = 'Template: ' . $campaign->whatsapp_template_name .
            ' (' . $campaign->whatsapp_template_language . ')';
        $message->status              = 1;
        $message->channel             = 'whatsapp';
        $message->provider_message_id = $providerMessageId;
        $message->result              = 'Accepted by WhatsApp Business Cloud API';
        $message->rate                = 0;
        $message->sms_from            = substr((string) $campaign->from, 0, 16);

        if (! $message->save()) {
            $this->logMessage('Campaign ' . $campaign->id . ': message sent but pkg_sms log failed: ' .
                json_encode($message->getErrors()));
        }
    }

    private function logMessage($message)
    {
        if ($this->debug >= 1) {
            echo $message . "\n";
        }
        MagnusLog::writeLog(LOGFILE, $message);
    }
}
