<?php
/**
 * Sends messages through the official WhatsApp Business Cloud API.
 */
class WhatsAppBusinessApi
{
    private $accessToken;
    private $phoneNumberId;
    private $apiVersion;
    private $timeout;

    public function __construct(array $config = [])
    {
        $this->accessToken   = $this->configValue($config, 'whatsapp_access_token', 'WHATSAPP_ACCESS_TOKEN');
        $this->phoneNumberId = $this->configValue($config, 'whatsapp_phone_number_id', 'WHATSAPP_PHONE_NUMBER_ID');
        $this->apiVersion    = $this->configValue($config, 'whatsapp_api_version', 'WHATSAPP_API_VERSION', 'v25.0');
        $this->timeout       = (int) $this->configValue($config, 'whatsapp_timeout', 'WHATSAPP_TIMEOUT', 30);

        if ($this->timeout < 1) {
            $this->timeout = 30;
        }
    }

    public function isConfigured()
    {
        return $this->accessToken !== '' && $this->phoneNumberId !== '';
    }

    public function sendText($destination, $text)
    {
        if (! $this->isConfigured()) {
            return $this->error('WhatsApp Business API is not configured.');
        }

        $destination = preg_replace('/[^0-9]/', '', (string) $destination);
        $text        = trim((string) $text);

        if ($destination === '' || $text === '') {
            return $this->error('Destination and message text are required.');
        }

        return $this->sendPayload([
            'messaging_product' => 'whatsapp',
            'recipient_type'    => 'individual',
            'to'                => $destination,
            'type'              => 'text',
            'text'              => [
                'preview_url' => false,
                'body'        => $text,
            ],
        ]);
    }

    public function sendTemplate($destination, $templateName, $languageCode = 'en_US')
    {
        if (! $this->isConfigured()) {
            return $this->error('WhatsApp Business API is not configured.');
        }

        $destination = preg_replace('/[^0-9]/', '', (string) $destination);
        $templateName = trim((string) $templateName);
        $languageCode = trim((string) $languageCode);

        if ($destination === '' || $templateName === '' || $languageCode === '') {
            return $this->error('Destination, template name and template language are required.');
        }

        return $this->sendPayload([
            'messaging_product' => 'whatsapp',
            'recipient_type'    => 'individual',
            'to'                => $destination,
            'type'              => 'template',
            'template'          => [
                'name'     => $templateName,
                'language' => ['code' => $languageCode],
            ],
        ]);
    }

    private function sendPayload(array $payload)
    {
        if (! function_exists('curl_init')) {
            return $this->error('PHP cURL extension is required.');
        }

        $url = 'https://graph.facebook.com/' . rawurlencode($this->apiVersion) . '/' .
            rawurlencode($this->phoneNumberId) . '/messages';
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => min(10, $this->timeout),
            CURLOPT_TIMEOUT        => $this->timeout,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $this->accessToken,
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS     => json_encode($payload),
        ]);

        $body      = curl_exec($curl);
        $curlError = curl_error($curl);
        $httpCode  = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($body === false) {
            return $this->error($curlError ?: 'WhatsApp API request failed.', $httpCode);
        }

        $response = json_decode($body, true);
        if ($httpCode >= 200 && $httpCode < 300 && isset($response['messages'][0]['id'])) {
            return [
                'success'    => true,
                'message_id' => $response['messages'][0]['id'],
                'http_code'  => $httpCode,
                'response'   => $response,
            ];
        }

        $message = isset($response['error']['message'])
            ? $response['error']['message']
            : 'WhatsApp API returned HTTP ' . $httpCode . '.';

        return $this->error($message, $httpCode, $response);
    }

    private function configValue(array $config, $key, $environmentKey, $default = '')
    {
        $environmentValue = getenv($environmentKey);
        if ($environmentValue !== false && $environmentValue !== '') {
            return trim((string) $environmentValue);
        }

        return isset($config[$key]) && $config[$key] !== ''
            ? trim((string) $config[$key])
            : (string) $default;
    }

    private function error($message, $httpCode = 0, $response = null)
    {
        return [
            'success'   => false,
            'error'     => $message,
            'http_code' => (int) $httpCode,
            'response'  => $response,
        ];
    }
}
