<?php

/**
 * Receives WhatsApp Business Cloud API webhook events from Meta.
 */
class WhatsappWebhookController extends CController
{
    public function actionIndex()
    {
        if (Yii::app()->request->getIsGetRequest()) {
            $this->verifyWebhook();
            return;
        }

        if (! Yii::app()->request->getIsPostRequest()) {
            $this->respond(405, 'Method not allowed');
            return;
        }

        $rawBody = file_get_contents('php://input');
        if (! $this->hasValidSignature($rawBody)) {
            $this->respond(403, 'Invalid signature');
            return;
        }

        $payload = json_decode($rawBody, true);
        if (! is_array($payload) || ! isset($payload['object']) || $payload['object'] !== 'whatsapp_business_account') {
            $this->respond(400, 'Invalid payload');
            return;
        }

        $this->storeMessages($payload);
        $this->respond(200, 'EVENT_RECEIVED');
    }

    private function verifyWebhook()
    {
        $mode      = isset($_GET['hub_mode']) ? $_GET['hub_mode'] : '';
        $token     = isset($_GET['hub_verify_token']) ? $_GET['hub_verify_token'] : '';
        $challenge = isset($_GET['hub_challenge']) ? $_GET['hub_challenge'] : '';
        $expected  = $this->configValue('whatsapp_webhook_verify_token', 'WHATSAPP_WEBHOOK_VERIFY_TOKEN');

        if ($mode === 'subscribe' && $expected !== '' && hash_equals($expected, (string) $token)) {
            header('Content-Type: text/plain; charset=UTF-8');
            http_response_code(200);
            echo $challenge;
            return;
        }

        $this->respond(403, 'Verification failed');
    }

    private function hasValidSignature($rawBody)
    {
        $secret = $this->configValue('whatsapp_app_secret', 'WHATSAPP_APP_SECRET');
        if ($secret === '' || empty($_SERVER['HTTP_X_HUB_SIGNATURE_256'])) {
            return false;
        }

        $expected = 'sha256=' . hash_hmac('sha256', $rawBody, $secret);
        return hash_equals($expected, (string) $_SERVER['HTTP_X_HUB_SIGNATURE_256']);
    }

    private function storeMessages(array $payload)
    {
        $configuredPhoneNumberId = $this->configValue(
            'whatsapp_phone_number_id',
            'WHATSAPP_PHONE_NUMBER_ID'
        );

        foreach (isset($payload['entry']) && is_array($payload['entry']) ? $payload['entry'] : [] as $entry) {
            foreach (isset($entry['changes']) && is_array($entry['changes']) ? $entry['changes'] : [] as $change) {
                if (! isset($change['field']) || $change['field'] !== 'messages' || empty($change['value'])) {
                    continue;
                }

                $value         = $change['value'];
                $metadata      = isset($value['metadata']) && is_array($value['metadata']) ? $value['metadata'] : [];
                $phoneNumberId = isset($metadata['phone_number_id']) ? (string) $metadata['phone_number_id'] : '';
                if ($configuredPhoneNumberId !== '' && $phoneNumberId !== $configuredPhoneNumberId) {
                    continue;
                }

                foreach (isset($value['messages']) && is_array($value['messages']) ? $value['messages'] : [] as $message) {
                    $this->storeMessage($message, $metadata);
                }
            }
        }
    }

    private function storeMessage(array $message, array $metadata)
    {
        $providerMessageId = isset($message['id']) ? trim((string) $message['id']) : '';
        $from              = isset($message['from']) ? $this->normalizeNumber($message['from']) : '';
        if ($providerMessageId === '' || $from === '') {
            return;
        }

        if (Sms::model()->exists(
            'channel = :channel AND provider_message_id = :messageId',
            [':channel' => 'whatsapp', ':messageId' => $providerMessageId]
        )) {
            return;
        }

        $context = $this->findMessageContext($from);
        if (empty($context['id_user'])) {
            Yii::log('WhatsApp webhook could not associate message ' . $providerMessageId .
                ' from ' . $from . ' with a user.', CLogger::LEVEL_WARNING, 'whatsapp.webhook');
            return;
        }

        $model                      = new Sms();
        $model->id_user             = (int) $context['id_user'];
        $model->id_campaign         = ! empty($context['id_campaign']) ? (int) $context['id_campaign'] : null;
        $model->telephone           = $from;
        $model->sms                 = $this->messageText($message);
        $model->status              = 2;
        $model->channel             = 'whatsapp';
        $model->provider_message_id = $providerMessageId;
        $model->sms_from            = substr(
            isset($metadata['display_phone_number']) ? (string) $metadata['display_phone_number'] : '',
            0,
            16
        );
        $model->result = substr('Received type: ' . (isset($message['type']) ? $message['type'] : 'unknown'), 0, 500);
        $model->rate   = 0;

        if (isset($message['timestamp']) && ctype_digit((string) $message['timestamp'])) {
            $model->date = date('Y-m-d H:i:s', (int) $message['timestamp']);
        }

        try {
            if (! $model->save()) {
                Yii::log('WhatsApp webhook failed to save message ' . $providerMessageId . ': ' .
                    json_encode($model->getErrors()), CLogger::LEVEL_ERROR, 'whatsapp.webhook');
            }
        } catch (CDbException $e) {
            // Meta retries webhooks. A concurrent duplicate is safely ignored by the unique index.
            Yii::log('WhatsApp webhook duplicate or database error for ' . $providerMessageId . ': ' .
                $e->getMessage(), CLogger::LEVEL_WARNING, 'whatsapp.webhook');
        }
    }

    private function findMessageContext($number)
    {
        $command = Yii::app()->db->createCommand(
            'SELECT id_user, id_campaign
             FROM pkg_sms
             WHERE channel = :channel AND telephone = :number AND status = 1
             ORDER BY date DESC, id DESC
             LIMIT 1'
        );
        $command->bindValue(':channel', 'whatsapp', PDO::PARAM_STR);
        $command->bindValue(':number', $number, PDO::PARAM_STR);
        $context = $command->queryRow();
        if ($context !== false) {
            return $context;
        }

        $normalizedSql = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(pn.number, '+', ''), ' ', ''), '-', ''), '(', ''), ')', '')";
        $command = Yii::app()->db->createCommand(
            'SELECT c.id_user, c.id AS id_campaign
             FROM pkg_campaign c
             INNER JOIN pkg_campaign_phonebook cp ON cp.id_campaign = c.id
             INNER JOIN pkg_phonenumber pn ON pn.id_phonebook = cp.id_phonebook
             WHERE c.type = 2 AND ' . $normalizedSql . ' = :number
             ORDER BY c.id DESC
             LIMIT 1'
        );
        $command->bindValue(':number', $number, PDO::PARAM_STR);
        $context = $command->queryRow();

        return $context !== false ? $context : [];
    }

    private function messageText(array $message)
    {
        $type = isset($message['type']) ? $message['type'] : 'unknown';

        if ($type === 'text' && isset($message['text']['body'])) {
            return (string) $message['text']['body'];
        }
        if ($type === 'button' && isset($message['button']['text'])) {
            return (string) $message['button']['text'];
        }
        if ($type === 'interactive' && isset($message['interactive'])) {
            $interactive = $message['interactive'];
            foreach (['button_reply', 'list_reply'] as $replyType) {
                if (isset($interactive[$replyType])) {
                    $title = isset($interactive[$replyType]['title']) ? $interactive[$replyType]['title'] : '';
                    $id    = isset($interactive[$replyType]['id']) ? $interactive[$replyType]['id'] : '';
                    return trim($title . ($id !== '' ? ' [' . $id . ']' : ''));
                }
            }
        }
        if ($type === 'location' && isset($message['location'])) {
            $location = $message['location'];
            return trim((isset($location['name']) ? $location['name'] . ' ' : '') .
                (isset($location['address']) ? $location['address'] . ' ' : '') .
                (isset($location['latitude']) ? $location['latitude'] : '') . ',' .
                (isset($location['longitude']) ? $location['longitude'] : ''));
        }
        if ($type === 'reaction' && isset($message['reaction'])) {
            return 'Reaction: ' . (isset($message['reaction']['emoji']) ? $message['reaction']['emoji'] : '');
        }
        if (in_array($type, ['image', 'audio', 'video', 'document', 'sticker'], true) && isset($message[$type])) {
            $media   = $message[$type];
            $caption = isset($media['caption']) ? $media['caption'] : '';
            $id      = isset($media['id']) ? $media['id'] : '';
            return ucfirst($type) . ($caption !== '' ? ': ' . $caption : '') . ($id !== '' ? ' [' . $id . ']' : '');
        }

        return ucfirst($type) . ': ' . json_encode($message, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function normalizeNumber($number)
    {
        return preg_replace('/[^0-9]/', '', (string) $number);
    }

    private function configValue($key, $environmentKey)
    {
        $environmentValue = getenv($environmentKey);
        if ($environmentValue !== false && $environmentValue !== '') {
            return trim((string) $environmentValue);
        }

        $model = Configuration::model()->find('config_key = :key', [':key' => $key]);
        return isset($model->config_value) ? trim((string) $model->config_value) : '';
    }

    private function respond($status, $body)
    {
        http_response_code((int) $status);
        header('Content-Type: text/plain; charset=UTF-8');
        echo $body;
    }
}
