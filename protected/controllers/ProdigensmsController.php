<?php

/**
 * Sends a Prodigensms template when a campaign forwards to this endpoint.
 *
 * Campaign example:
 * custom|http://127.0.0.1/mbilling/index.php/prodigensms/send?number=%number%&templateId=77&name=%name%
 */
class ProdigensmsController extends Controller
{
    public $addAuthorizedNoSession = 'prodigensms';

    public function actionSend()
    {
        $this->sendJsonHeader();

        if (Yii::app()->request->getRequestType() !== 'GET') {
            $this->respond(405, [
                'success' => false,
                'error'   => 'method_not_allowed',
            ]);
        }

        $config = $this->loadConfig();
        $this->authorizeRequest($config);

        $number = isset($_GET['number']) ? $this->normalizeBrazilianNumber($_GET['number']) : false;
        if ($number === false) {
            $this->respond(400, [
                'success' => false,
                'error'   => 'invalid_number',
            ]);
        }

        $templateId = isset($_GET['templateId']) ? (string) $_GET['templateId'] : '';
        if (! ctype_digit($templateId) || (int) $templateId < 1) {
            $this->respond(400, [
                'success' => false,
                'error'   => 'invalid_template_id',
            ]);
        }

        if (! function_exists('curl_init')) {
            Yii::log('Prodigensms: PHP cURL extension is not installed', CLogger::LEVEL_ERROR);
            $this->respond(500, [
                'success' => false,
                'error'   => 'curl_not_available',
            ]);
        }

        $payloadData = [
            'to'          => $number,
            'templateId'  => (int) $templateId,
            'shortenerId' => (int) $config['shortener_id'],
            'originalUrl' => $config['original_url'],
        ];
        $this->appendQueryParameters($payloadData);

        $payload = json_encode($payloadData);
        if ($payload === false) {
            $this->respond(500, [
                'success' => false,
                'error'   => 'invalid_configuration',
            ]);
        }

        $curl = curl_init($config['api_url']);
        curl_setopt_array($curl, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $config['api_token'],
                'Content-Type: application/json',
                'Accept: application/json',
            ],
        ]);

        $providerResponse = curl_exec($curl);
        $curlError        = curl_error($curl);
        $providerStatus   = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($providerResponse === false || $providerStatus < 200 || $providerStatus >= 300) {
            Yii::log(
                'Prodigensms failed for phone ending ' . substr($number, -4) .
                '; HTTP ' . $providerStatus .
                ($curlError !== '' ? '; cURL: ' . $curlError : ''),
                CLogger::LEVEL_ERROR
            );

            $this->respond(502, [
                'success'         => false,
                'error'           => 'provider_error',
                'provider_status' => $providerStatus,
            ]);
        }

        Yii::log(
            'Prodigensms sent successfully to phone ending ' . substr($number, -4),
            CLogger::LEVEL_INFO
        );

        $this->respond(200, [
            'success'         => true,
            'provider_status' => $providerStatus,
        ]);
    }

    private function loadConfig()
    {
        $configPath = getenv('PRODIGENSMS_CONFIG');
        if (! is_string($configPath) || $configPath === '') {
            $configPath = '/etc/asterisk/prodigensms.conf';
        }

        $config = @parse_ini_file($configPath, false, INI_SCANNER_RAW);
        $required = [
            'api_token',
            'webhook_secret',
            'shortener_id',
            'original_url',
        ];

        if (! is_array($config)) {
            Yii::log('Prodigensms: unable to read configuration file', CLogger::LEVEL_ERROR);
            $this->respond(500, [
                'success' => false,
                'error'   => 'integration_not_configured',
            ]);
        }

        foreach ($required as $key) {
            if (! isset($config[$key]) || trim((string) $config[$key]) === '') {
                Yii::log('Prodigensms: missing configuration key ' . $key, CLogger::LEVEL_ERROR);
                $this->respond(500, [
                    'success' => false,
                    'error'   => 'integration_not_configured',
                ]);
            }
        }

        if (! ctype_digit((string) $config['shortener_id']) ||
            filter_var($config['original_url'], FILTER_VALIDATE_URL) === false) {
            Yii::log('Prodigensms: invalid configuration values', CLogger::LEVEL_ERROR);
            $this->respond(500, [
                'success' => false,
                'error'   => 'integration_not_configured',
            ]);
        }

        if (! isset($config['api_url']) || trim((string) $config['api_url']) === '') {
            $config['api_url'] = 'https://prodigensms.com/api/v1/sms/send';
        }

        if (filter_var($config['api_url'], FILTER_VALIDATE_URL) === false ||
            stripos($config['api_url'], 'https://') !== 0) {
            Yii::log('Prodigensms: api_url must be HTTPS', CLogger::LEVEL_ERROR);
            $this->respond(500, [
                'success' => false,
                'error'   => 'integration_not_configured',
            ]);
        }

        return $config;
    }

    private function authorizeRequest($config)
    {
        $remoteAddress = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
        if ($remoteAddress === '127.0.0.1' || $remoteAddress === '::1') {
            return;
        }

        $providedSecret = isset($_GET['key']) ? (string) $_GET['key'] : '';
        if ($providedSecret === '' || ! hash_equals((string) $config['webhook_secret'], $providedSecret)) {
            Yii::log('Prodigensms: rejected request with invalid secret', CLogger::LEVEL_WARNING);
            $this->respond(403, [
                'success' => false,
                'error'   => 'forbidden',
            ]);
        }
    }

    private function appendQueryParameters(&$payload)
    {
        $reserved = [
            'key'        => true,
            'number'     => true,
            'templateId' => true,
            'to'         => true,
        ];
        $extraCount = 0;

        foreach ($_GET as $key => $value) {
            if (isset($reserved[$key])) {
                continue;
            }

            if (! preg_match('/\A[A-Za-z][A-Za-z0-9_.-]{0,63}\z/', (string) $key) ||
                is_array($value) ||
                strlen((string) $value) > 2048 ||
                ++$extraCount > 30) {
                $this->respond(400, [
                    'success' => false,
                    'error'   => 'invalid_parameter',
                ]);
            }

            if ($key === 'shortenerId') {
                if (! ctype_digit((string) $value) || (int) $value < 1) {
                    $this->respond(400, [
                        'success' => false,
                        'error'   => 'invalid_parameter',
                    ]);
                }
                $value = (int) $value;
            } elseif ($key === 'originalUrl') {
                if (filter_var($value, FILTER_VALIDATE_URL) === false) {
                    $this->respond(400, [
                        'success' => false,
                        'error'   => 'invalid_parameter',
                    ]);
                }
            } else {
                $value = (string) $value;
            }

            $payload[$key] = $value;
        }
    }

    private function normalizeBrazilianNumber($value)
    {
        $number = preg_replace('/\D+/', '', (string) $value);

        if (strlen($number) === 11 || strlen($number) === 12) {
            if (substr($number, 0, 1) === '0') {
                $number = substr($number, 1);
            }
        }

        if (strlen($number) === 10 || strlen($number) === 11) {
            $number = '55' . $number;
        }

        // SMS destinations must be Brazilian mobile numbers: 55 + DDD + 9 digits.
        if (! preg_match('/\A55[1-9]\d9\d{8}\z/', $number)) {
            return false;
        }

        return $number;
    }

    private function sendJsonHeader()
    {
        header('Content-Type: application/json; charset=UTF-8');
        header('Cache-Control: no-store');
    }

    private function respond($status, $body)
    {
        http_response_code($status);
        echo json_encode($body);
        Yii::app()->end();
    }
}
